const prisma = require('../prisma');
const rankingService = require('../ranking/ranking.service');

const KEYS = [];
['a', 'b', 'c', 'd', 'e'].forEach((letter) => {
  for (let n = 1; n <= 5; n += 1) KEYS.push(`${letter}${n}`);
});

function clampScorePayload(body) {
  const data = {};
  KEYS.forEach((k) => {
    if (body[k] !== undefined) {
      const n = Number(body[k]);
      const v = Math.round(Math.min(4, Math.max(0, Number.isFinite(n) ? n : 0)) * 100) / 100;
      data[k] = v;
    }
  });
  return data;
}

async function getScores(schoolId) {
  return prisma.score.findUnique({ where: { schoolId } });
}

async function upsertScores(schoolId, body) {
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    const err = new Error('School not found');
    err.status = 404;
    throw err;
  }
  const partial = clampScorePayload(body);
  const existing = await prisma.score.findUnique({ where: { schoolId } });
  const base = {};
  KEYS.forEach((k) => {
    base[k] = 0;
  });
  const values = existing ? partial : { ...base, ...partial };
  const score = existing
    ? await prisma.score.update({
        where: { schoolId },
        data: partial,
      })
    : await prisma.score.create({
        data: { schoolId, ...values },
      });
  await rankingService.recalculateAll();
  return score;
}

module.exports = { getScores, upsertScores };
