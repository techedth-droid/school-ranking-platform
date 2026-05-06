const bcrypt = require('bcryptjs');
const { Prisma } = require('@prisma/client');
const prisma = require('../prisma');
const { normalizeSchoolName } = require('../utils/schoolNameKey');
const rankingService = require('../ranking/ranking.service');

function isUniqueViolation(e) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
}

async function create(body) {
  const email = String(body.coordinatorEmail || '').trim().toLowerCase();
  const totalRoomsRaw = body.totalRooms ?? 0;
  const smartClassroomRoomsRaw = body.smartClassroomRooms ?? 0;
  const studentCountRaw = body.studentCount ?? 0;
  const totalRooms = Number(totalRoomsRaw);
  const smartClassroomRooms = Number(smartClassroomRoomsRaw);
  const studentCount = Number(studentCountRaw);
  return prisma.schoolApplication.create({
    data: {
      schoolName: String(body.schoolName || '').trim(),
      nameEn: String(body.nameEn ?? '').trim(),
      province: String(body.province || '').trim(),
      affiliation: String(body.affiliation || '').trim(),
      level: String(body.level || '').trim(),
      coordinatorName: String(body.coordinatorName || '').trim(),
      coordinatorEmail: email,
      coordinatorPhone: String(body.coordinatorPhone ?? '').trim(),
      message: String(body.message ?? '').trim(),
      totalRooms: Number.isFinite(totalRooms) ? Math.max(0, Math.floor(totalRooms)) : 0,
      smartClassroomRooms: Number.isFinite(smartClassroomRooms)
        ? Math.max(0, Math.floor(smartClassroomRooms))
        : 0,
      studentCount: Number.isFinite(studentCount) ? Math.max(0, Math.floor(studentCount)) : 0,
    },
    select: {
      id: true,
      schoolName: true,
      coordinatorEmail: true,
      status: true,
      createdAt: true,
    },
  });
}

async function listForAdmin(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 30));
  const status = query.status;
  const where = {};
  if (status && status !== 'ALL' && ['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    where.status = status;
  }
  const [total, data] = await prisma.$transaction([
    prisma.schoolApplication.count({ where }),
    prisma.schoolApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        school: { select: { id: true, name: true } },
      },
    }),
  ]);
  return { data, total, page, limit };
}

async function approve(applicationId, actorId, { initialPassword }) {
  const app = await prisma.schoolApplication.findUnique({ where: { id: applicationId } });
  if (!app) {
    const err = new Error('ไม่พบคำขอ');
    err.status = 404;
    throw err;
  }
  if (app.status !== 'PENDING') {
    const err = new Error('คำขอนี้ดำเนินการแล้ว');
    err.status = 400;
    throw err;
  }

  const nameKey = normalizeSchoolName(app.schoolName);
  if (!nameKey) {
    const err = new Error('ชื่อโรงเรียนไม่ถูกต้อง');
    err.status = 400;
    throw err;
  }

  const email = app.coordinatorEmail.trim().toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    const err = new Error('อีเมลผู้ประสานงานถูกใช้ลงทะเบียนในระบบแล้ว');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(initialPassword, 10);
  const now = new Date();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const school = await tx.school.create({
        data: {
          name: app.schoolName.trim(),
          nameKey,
          nameEn: app.nameEn || '',
          province: app.province,
          affiliation: app.affiliation,
          level: app.level,
          contact: app.coordinatorName,
          phone: app.coordinatorPhone || '',
          totalRooms: app.totalRooms ?? 0,
          smartClassroomRooms: app.smartClassroomRooms ?? 0,
          studentCount: app.studentCount ?? 0,
          isPublished: false,
        },
      });

      await tx.user.create({
        data: {
          email,
          password: passwordHash,
          role: 'SCHOOL_ADMIN',
          schoolId: school.id,
        },
        select: { id: true, email: true },
      });

      await tx.schoolApplication.update({
        where: { id: applicationId },
        data: {
          status: 'APPROVED',
          processedAt: now,
          processedById: actorId,
          schoolId: school.id,
        },
      });

      return { schoolId: school.id, schoolName: school.name, userEmail: email };
    });

    await rankingService.recalculateAll();
    return result;
  } catch (e) {
    if (isUniqueViolation(e)) {
      const err = new Error('ชื่อโรงเรียนหรืออีเมลซ้ำกับข้อมูลที่มีอยู่');
      err.status = 409;
      throw err;
    }
    throw e;
  }
}

async function reject(applicationId, actorId, { adminNote }) {
  const app = await prisma.schoolApplication.findUnique({ where: { id: applicationId } });
  if (!app) {
    const err = new Error('ไม่พบคำขอ');
    err.status = 404;
    throw err;
  }
  if (app.status !== 'PENDING') {
    const err = new Error('คำขอนี้ดำเนินการแล้ว');
    err.status = 400;
    throw err;
  }
  const now = new Date();
  return prisma.schoolApplication.update({
    where: { id: applicationId },
    data: {
      status: 'REJECTED',
      adminNote: String(adminNote ?? '').trim(),
      processedAt: now,
      processedById: actorId,
    },
  });
}

async function listUsers(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
  const where = {};
  if (query.search) {
    const s = String(query.search).trim();
    where.OR = [
      { email: { contains: s, mode: 'insensitive' } },
      { school: { name: { contains: s, mode: 'insensitive' } } },
    ];
  }
  if (query.role && ['ADMIN', 'SCHOOL_ADMIN'].includes(query.role)) {
    where.role = query.role;
  }
  const [total, data] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        role: true,
        schoolId: true,
        createdAt: true,
        school: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { data, total, page, limit };
}

module.exports = {
  create,
  listForAdmin,
  approve,
  reject,
  listUsers,
};
