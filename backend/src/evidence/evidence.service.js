const path = require('path');
const prisma = require('../prisma');
const { deleteUploadedFile, persistUploadedFile, uploadRoot } = require('../upload/storage');

async function listFiles(schoolId) {
  return prisma.evidenceFile.findMany({
    where: { schoolId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      originalName: true,
      mimeType: true,
      createdAt: true,
      storedName: true,
    },
  });
}

async function addFile(schoolId, file) {
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    await deleteUploadedFile(file.path);
    const err = new Error('School not found');
    err.status = 404;
    throw err;
  }
  const savedFile = await persistUploadedFile(file, 'evidence');
  const storedName = savedFile.storedName || path.basename(savedFile.path);
  return prisma.evidenceFile.create({
    data: {
      schoolId,
      originalName: file.originalname || storedName,
      storedName,
      mimeType: file.mimetype || 'application/octet-stream',
    },
  });
}

async function removeFile(schoolId, fileId) {
  const row = await prisma.evidenceFile.findFirst({
    where: { id: fileId, schoolId },
  });
  if (!row) {
    const err = new Error('Not found');
    err.status = 404;
    throw err;
  }
  await prisma.evidenceFile.delete({ where: { id: fileId } });
  await deleteUploadedFile(row.storedName);
}

module.exports = { listFiles, addFile, removeFile, uploadRoot };
