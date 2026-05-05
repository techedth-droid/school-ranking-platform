const prisma = require('../prisma');
const { deleteUploadedFile, persistUploadedFile } = require('./storage');

async function saveLogo(schoolId, file) {
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    await deleteUploadedFile(file.path);
    const err = new Error('School not found');
    err.status = 404;
    throw err;
  }
  const savedFile = await persistUploadedFile(file, 'logos');
  const logoUrl = savedFile.url;
  await prisma.school.update({
    where: { id: schoolId },
    data: { logoUrl },
  });
  if (school.logoUrl) await deleteUploadedFile(school.logoUrl);
  return { logoUrl };
}

module.exports = { saveLogo };
