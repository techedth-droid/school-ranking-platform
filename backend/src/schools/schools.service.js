const bcrypt = require('bcryptjs');
const { Prisma } = require('@prisma/client');
const prisma = require('../prisma');
const { applySectorFilter } = require('../utils/scopeFilters');
const rankingService = require('../ranking/ranking.service');
const { normalizeSchoolName } = require('../utils/schoolNameKey');

function isUniqueViolation(e) {
  return e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002';
}

function normalizeNonNegativeInt(value, fallback = 0) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.floor(n));
}

function listFilters(query) {
  const where = { isPublished: true };
  if (query.province) where.province = query.province;
  if (query.level) where.level = query.level;
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { nameEn: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  if (query.sector) {
    applySectorFilter(where, query.sector);
  } else if (query.affiliation) {
    where.affiliation = query.affiliation;
  }
  return where;
}

async function listPublished(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const where = listFilters(query);
  const [total, data] = await prisma.$transaction([
    prisma.school.count({ where }),
    prisma.school.findMany({
      where,
      include: { ranking: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { name: 'asc' },
    }),
  ]);
  return { data, total, page, limit };
}

async function listAll(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 50));
  const where = {};
  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: 'insensitive' } },
      { nameEn: { contains: query.search, mode: 'insensitive' } },
    ];
  }
  const [total, data] = await prisma.$transaction([
    prisma.school.count({ where }),
    prisma.school.findMany({
      where,
      include: { ranking: true },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { updatedAt: 'desc' },
    }),
  ]);
  return { data, total, page, limit };
}

async function getById(id, { isAdmin = false, isOwnSchool = false } = {}) {
  const school = await prisma.school.findUnique({
    where: { id },
    include: {
      ranking: true,
      scores: true,
      reportAck: true,
      galleryImages: { orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }] },
      certificates: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!school) return null;
  if (!school.isPublished && !isAdmin && !isOwnSchool) return null;
  /** Official PDF path must not be exposed to anonymous public (direct /uploads/ would bypass auth) */
  if (!isAdmin && !isOwnSchool) {
    const { certificatePdfUrl: _omit, ...rest } = school;
    return { ...rest, certificatePdfUrl: null };
  }
  return school;
}

async function create(body) {
  const nameKey = normalizeSchoolName(body.name);
  if (!nameKey) {
    const err = new Error('ชื่อโรงเรียนไม่ถูกต้อง');
    err.status = 400;
    throw err;
  }
  try {
    const school = await prisma.school.create({
      data: {
        name: body.name,
        nameKey,
        nameEn: body.nameEn ?? '',
        province: body.province,
        affiliation: body.affiliation,
        level: body.level,
        website: body.website ?? '',
        contact: body.contact ?? '',
        logoUrl: body.logoUrl || null,
        bannerUrl: body.bannerUrl || null,
        description: body.description ?? '',
        address: body.address ?? '',
        phone: body.phone ?? '',
        facebookUrl: body.facebookUrl ?? '',
        lineId: body.lineId ?? '',
        totalRooms: normalizeNonNegativeInt(body.totalRooms, 0),
        smartClassroomRooms: normalizeNonNegativeInt(body.smartClassroomRooms, 0),
        studentCount: normalizeNonNegativeInt(body.studentCount, 0),
        isPublished: Boolean(body.isPublished),
      },
    });
    await rankingService.recalculateAll();
    return school;
  } catch (e) {
    if (isUniqueViolation(e)) {
      const err = new Error('ชื่อโรงเรียนซ้ำกับข้อมูลที่มีอยู่');
      err.status = 409;
      throw err;
    }
    throw e;
  }
}

async function update(id, body, actor) {
  const isAdmin = actor?.role === 'ADMIN';
  const isOwnSchool = actor?.role === 'SCHOOL_ADMIN' && actor?.schoolId === id;
  if (!isAdmin && !isOwnSchool) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  const data = {};
  if (body.name !== undefined) {
    data.name = body.name;
    const nk = normalizeSchoolName(body.name);
    if (!nk) {
      const err = new Error('ชื่อโรงเรียนไม่ถูกต้อง');
      err.status = 400;
      throw err;
    }
    data.nameKey = nk;
  }
  if (body.nameEn !== undefined) data.nameEn = body.nameEn;
  if (body.province !== undefined) data.province = body.province;
  if (body.affiliation !== undefined) data.affiliation = body.affiliation;
  if (body.level !== undefined) data.level = body.level;
  if (body.website !== undefined) data.website = body.website;
  if (body.contact !== undefined) data.contact = body.contact;
  if (body.logoUrl !== undefined) data.logoUrl = body.logoUrl;
  if (body.bannerUrl !== undefined) data.bannerUrl = body.bannerUrl;
  if (body.description !== undefined) data.description = body.description;
  if (body.address !== undefined) data.address = body.address;
  if (body.phone !== undefined) data.phone = body.phone;
  if (body.facebookUrl !== undefined) data.facebookUrl = body.facebookUrl;
  if (body.lineId !== undefined) data.lineId = body.lineId;
  if (body.totalRooms !== undefined) data.totalRooms = normalizeNonNegativeInt(body.totalRooms, 0);
  if (body.smartClassroomRooms !== undefined) {
    data.smartClassroomRooms = normalizeNonNegativeInt(body.smartClassroomRooms, 0);
  }
  if (body.studentCount !== undefined) data.studentCount = normalizeNonNegativeInt(body.studentCount, 0);
  if (isAdmin && body.isPublished !== undefined) {
    data.isPublished = Boolean(body.isPublished);
  }

  try {
    const school = await prisma.school.update({
      where: { id },
      data,
    });
    if (isAdmin && body.isPublished !== undefined) {
      await rankingService.recalculateAll();
    }
    return school;
  } catch (e) {
    if (isUniqueViolation(e)) {
      const err = new Error('ชื่อโรงเรียนซ้ำกับข้อมูลที่มีอยู่');
      err.status = 409;
      throw err;
    }
    throw e;
  }
}

async function createSchoolAdmin(schoolId, { email, password }) {
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    const err = new Error('School not found');
    err.status = 404;
    throw err;
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.status = 409;
    throw err;
  }
  const hash = await bcrypt.hash(password, 10);
  return prisma.user.create({
    data: {
      email,
      password: hash,
      role: 'SCHOOL_ADMIN',
      schoolId,
    },
    select: { id: true, email: true, role: true, schoolId: true },
  });
}

async function listSchoolAdmins(schoolId) {
  return prisma.user.findMany({
    where: { schoolId, role: 'SCHOOL_ADMIN' },
    select: { id: true, email: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
}

async function remove(id) {
  await prisma.school.delete({ where: { id } });
}

async function setPublished(id, isPublished) {
  const school = await prisma.school.update({
    where: { id },
    data: { isPublished: Boolean(isPublished) },
  });
  await rankingService.recalculateAll();
  return school;
}

module.exports = {
  listPublished,
  listAll,
  getById,
  create,
  update,
  remove,
  setPublished,
  createSchoolAdmin,
  listSchoolAdmins,
};
