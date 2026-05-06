const prisma = require('../prisma');

const CATEGORY_FIELDS = {
  A: 'scoreA',
  B: 'scoreB',
  C: 'scoreC',
  D: 'scoreD',
  E: 'scoreE',
};
const SUB_SCORE_KEYS = [];
['a', 'b', 'c', 'd', 'e'].forEach((letter) => {
  for (let n = 1; n <= 5; n += 1) SUB_SCORE_KEYS.push(`${letter}${n}`);
});
const SUB_SCORE_SELECT = Object.fromEntries(SUB_SCORE_KEYS.map((key) => [key, true]));

/** อันดับต่อหมวดเมื่อเทียบทุกโรงเรียนในปีเดียวกัน (อันดับ 1 = คะแนนหมวดนั้นสูงสุด) */
function computeCategoryRanksAcrossSchools(rows, targetSchoolId) {
  const ranks = {};
  Object.entries(CATEGORY_FIELDS).forEach(([category, field]) => {
    const sorted = [...rows].sort((a, b) => Number(b[field] ?? 0) - Number(a[field] ?? 0));
    let currentRank = 1;
    for (let i = 0; i < sorted.length; i += 1) {
      if (i > 0 && Number(sorted[i][field] ?? 0) !== Number(sorted[i - 1][field] ?? 0)) {
        currentRank = i + 1;
      }
      if (sorted[i].schoolId === targetSchoolId) {
        ranks[category] = currentRank;
        break;
      }
    }
  });
  return ranks;
}

function scoresForRow(row) {
  return {
    A: row.scoreA,
    B: row.scoreB,
    C: row.scoreC,
    D: row.scoreD,
    E: row.scoreE,
  };
}

function subScoresForRow(row) {
  const data = {};
  SUB_SCORE_KEYS.forEach((key) => {
    data[key] = Number(row[key] ?? 0);
  });
  return data;
}

function clampSubScore(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return 0;
  return Math.min(4, Math.max(0, Math.round(n * 100) / 100));
}

function subScorePayload(source) {
  const data = {};
  SUB_SCORE_KEYS.forEach((key) => {
    data[key] = clampSubScore(source?.[key]);
  });
  return data;
}

function sumSubCategory(data, letter) {
  let total = 0;
  for (let n = 1; n <= 5; n += 1) total += Number(data[`${letter}${n}`] ?? 0);
  return Math.round(total * 100) / 100;
}

function categoryTotalsFromSubScores(data) {
  return {
    scoreA: sumSubCategory(data, 'a'),
    scoreB: sumSubCategory(data, 'b'),
    scoreC: sumSubCategory(data, 'c'),
    scoreD: sumSubCategory(data, 'd'),
    scoreE: sumSubCategory(data, 'e'),
  };
}

function maxRankFromSeries(series) {
  let maxRank = 1;
  series.forEach((item) => {
    Object.values(item.ranks || {}).forEach((rank) => {
      if (typeof rank === 'number' && rank > maxRank) maxRank = rank;
    });
  });
  return maxRank;
}

function maxSchoolCountFromSeries(series) {
  return series.reduce((max, item) => Math.max(max, item.schoolCount || 0), 0);
}

function buildRankTicks(maxRank) {
  const limit = Math.max(1, maxRank);
  if (limit <= 10) return Array.from({ length: limit }, (_, i) => i + 1);
  const step = Math.ceil(limit / 8);
  const ticks = [1];
  for (let v = step; v < limit; v += step) ticks.push(v);
  if (!ticks.includes(limit)) ticks.push(limit);
  return ticks;
}

const START_YEAR = 2025;
const FORWARD_YEARS = 5;

function currentYearRange() {
  const currentYear = new Date().getFullYear();
  const endYear = Math.max(currentYear + FORWARD_YEARS, START_YEAR);
  return Array.from({ length: endYear - START_YEAR + 1 }, (_, i) => START_YEAR + i);
}

function rowsByYear(rows) {
  const map = new Map();
  rows.forEach((row) => {
    if (!map.has(row.year)) map.set(row.year, []);
    map.get(row.year).push(row);
  });
  return map;
}

function buildSeries({ years, allRowsByYear, schoolId }) {
  return years.map((year) => {
    const rows = allRowsByYear.get(year) || [];
    const row = rows.find((r) => r.schoolId === schoolId);
    if (!row) return { year, schoolCount: rows.length, scores: null, ranks: null };
    return {
      year,
      schoolCount: rows.length,
      scores: scoresForRow(row),
      subScores: subScoresForRow(row),
      ranks: computeCategoryRanksAcrossSchools(rows, schoolId),
    };
  });
}

/**
 * ranked: ผลจาก ranking.recalculateAll — แต่ละแถวมี schoolId, scoreA..scoreE
 */
async function upsertSnapshotsForYearFromRanked(ranked, year) {
  if (!ranked?.length) return;
  await prisma.$transaction(
    ranked.map((r) =>
      prisma.schoolYearCategorySnapshot.upsert({
        where: {
          schoolId_year: { schoolId: r.schoolId, year },
        },
        create: {
          schoolId: r.schoolId,
          year,
          scoreA: r.scoreA,
          scoreB: r.scoreB,
          scoreC: r.scoreC,
          scoreD: r.scoreD,
          scoreE: r.scoreE,
          ...subScorePayload(r),
        },
        update: {
          scoreA: r.scoreA,
          scoreB: r.scoreB,
          scoreC: r.scoreC,
          scoreD: r.scoreD,
          scoreE: r.scoreE,
          ...subScorePayload(r),
        },
      })
    )
  );
}

/** สังเคราะห์แถว snapshot จาก Ranking ปัจจุบัน (โรงเรียนเผยแพร่) — ใช้เมื่อยังไม่มีแถวใน SchoolYearCategorySnapshot ปีนั้น */
async function buildSyntheticRowsFromRanking(year) {
  const list = await prisma.ranking.findMany({
    where: { school: { isPublished: true } },
    select: {
      schoolId: true,
      scoreA: true,
      scoreB: true,
      scoreC: true,
      scoreD: true,
      scoreE: true,
      school: { select: { scores: true } },
    },
  });
  return list.map((r) => ({
    schoolId: r.schoolId,
    year,
    scoreA: r.scoreA,
    scoreB: r.scoreB,
    scoreC: r.scoreC,
    scoreD: r.scoreD,
    scoreE: r.scoreE,
    ...subScorePayload(r.school?.scores ?? {}),
  }));
}

/** รวมแถวปี cy: ค่าจาก snapshot ในฐานข้อมูลมีความสำคัญกว่า; เติมจาก Ranking เฉพาะโรงที่ยังไม่มีใน snapshot ปีนั้น */
function mergeYearWithRankingFallback(existingRows, cy, syntheticCyRows) {
  const rest = existingRows.filter((r) => r.year !== cy);
  const bySchool = new Map();
  existingRows
    .filter((r) => r.year === cy)
    .forEach((r) => bySchool.set(r.schoolId, r));
  syntheticCyRows.forEach((r) => {
    if (!bySchool.has(r.schoolId)) bySchool.set(r.schoolId, r);
  });
  return [...rest, ...bySchool.values()];
}

async function getYearCategoryRankSeriesForSchool(schoolId) {
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { isPublished: true },
  });
  if (!school || !school.isPublished) return null;

  const years = currentYearRange();
  let rows = await prisma.schoolYearCategorySnapshot.findMany({
    where: {
      year: { in: years },
      school: { isPublished: true },
    },
    orderBy: [{ year: 'asc' }, { schoolId: 'asc' }],
  });

  const cy = new Date().getFullYear();
  if (years.includes(cy)) {
    const syntheticCy = await buildSyntheticRowsFromRanking(cy);
    if (syntheticCy.length > 0) {
      rows = mergeYearWithRankingFallback(rows, cy, syntheticCy);
    }
  }

  const series = buildSeries({
    years,
    allRowsByYear: rowsByYear(rows),
    schoolId,
  });

  return {
    startYear: START_YEAR,
    currentYear: new Date().getFullYear(),
    rankMax: Math.max(maxRankFromSeries(series), maxSchoolCountFromSeries(series), 1),
    rankTicks: buildRankTicks(Math.max(maxRankFromSeries(series), maxSchoolCountFromSeries(series), 1)),
    note:
      'ในแต่ละปี อันดับของหมวด A–E คิดจากการเปรียบเทียบคะแนนหมวดเดียวกันกับทุกโรงเรียนที่เผยแพร่แล้ว (อันดับ 1 = คะแนนหมวดนั้นสูงสุด)',
    series,
  };
}

function getAdminYearRange() {
  const currentYear = new Date().getFullYear();
  const endYear = Math.max(currentYear + FORWARD_YEARS, START_YEAR);
  return { startYear: START_YEAR, endYear };
}

function clampCategoryTotal(v) {
  const n = Number(v);
  if (Number.isNaN(n)) return 0;
  return Math.min(20, Math.max(0, Math.round(n * 100) / 100));
}

async function listYearSnapshotsForSchool(schoolId) {
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    const err = new Error('School not found');
    err.status = 404;
    throw err;
  }
  const snapshots = await prisma.schoolYearCategorySnapshot.findMany({
    where: { schoolId },
    orderBy: { year: 'asc' },
    select: {
      year: true,
      scoreA: true,
      scoreB: true,
      scoreC: true,
      scoreD: true,
      scoreE: true,
      ...SUB_SCORE_SELECT,
    },
  });
  return {
    yearRange: getAdminYearRange(),
    snapshots,
  };
}

async function upsertYearSnapshotForSchool(schoolId, year, body) {
  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    const err = new Error('School not found');
    err.status = 404;
    throw err;
  }
  const { startYear, endYear } = getAdminYearRange();
  if (year < startYear || year > endYear) {
    const err = new Error('Year out of allowed range');
    err.status = 400;
    throw err;
  }
  const hasSubScores = SUB_SCORE_KEYS.some((key) => body[key] !== undefined);
  const detailData = hasSubScores ? subScorePayload(body) : {};
  const totals = hasSubScores
    ? categoryTotalsFromSubScores(detailData)
    : {
        scoreA: clampCategoryTotal(body.scoreA),
        scoreB: clampCategoryTotal(body.scoreB),
        scoreC: clampCategoryTotal(body.scoreC),
        scoreD: clampCategoryTotal(body.scoreD),
        scoreE: clampCategoryTotal(body.scoreE),
      };
  return prisma.schoolYearCategorySnapshot.upsert({
    where: { schoolId_year: { schoolId, year } },
    create: { schoolId, year, ...totals, ...detailData },
    update: { ...totals, ...detailData },
  });
}

module.exports = {
  upsertSnapshotsForYearFromRanked,
  getYearCategoryRankSeriesForSchool,
  computeCategoryRanksAcrossSchools,
  getAdminYearRange,
  listYearSnapshotsForSchool,
  upsertYearSnapshotForSchool,
};
