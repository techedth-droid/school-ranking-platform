const prisma = require('../prisma');
const { applySectorFilter } = require('../utils/scopeFilters');

function catSum(score, letter) {
  let s = 0;
  for (let n = 1; n <= 5; n += 1) {
    const key = `${letter}${n}`;
    s += Number(score[key] ?? 0);
  }
  return s;
}

function computeTotals(scoreRow) {
  const scoreA = catSum(scoreRow, 'a');
  const scoreB = catSum(scoreRow, 'b');
  const scoreC = catSum(scoreRow, 'c');
  const scoreD = catSum(scoreRow, 'd');
  const scoreE = catSum(scoreRow, 'e');
  const totalScore = (scoreA + scoreB + scoreC + scoreD + scoreE) / 5;
  let level = 'E';
  if (totalScore >= 17) level = 'A';
  else if (totalScore >= 13) level = 'B';
  else if (totalScore >= 9) level = 'C';
  else if (totalScore >= 5) level = 'D';
  return { scoreA, scoreB, scoreC, scoreD, scoreE, totalScore, level };
}

function scoreDetails(scoreRow) {
  const data = {};
  ['a', 'b', 'c', 'd', 'e'].forEach((letter) => {
    for (let n = 1; n <= 5; n += 1) {
      const key = `${letter}${n}`;
      data[key] = Number(scoreRow[key] ?? 0);
    }
  });
  return data;
}

async function recalculateAll() {
  const schools = await prisma.school.findMany({
    include: { scores: true },
  });
  const ranked = schools.map((school) => {
    const row = school.scores ?? {};
    return {
      schoolId: school.id,
      ...scoreDetails(row),
      ...computeTotals(row),
    };
  });
  ranked.sort((a, b) => b.totalScore - a.totalScore);
  await prisma.$transaction(async (tx) => {
    await tx.ranking.deleteMany({});
    for (let i = 0; i < ranked.length; i += 1) {
      const r = ranked[i];
      await tx.ranking.create({
        data: {
          schoolId: r.schoolId,
          scoreA: r.scoreA,
          scoreB: r.scoreB,
          scoreC: r.scoreC,
          scoreD: r.scoreD,
          scoreE: r.scoreE,
          totalScore: r.totalScore,
          level: r.level,
          rank: i + 1,
        },
      });
    }
  });
  const yearSnapshotService = require('../yearSnapshot/yearSnapshot.service');
  const calYear = new Date().getFullYear();
  await yearSnapshotService.upsertSnapshotsForYearFromRanked(ranked, calYear);
  return { recalculated: ranked.length };
}

const SORT_MAP = {
  rank: 'rank',
  totalScore: 'totalScore',
  level: 'level',
};

function buildWhere(filters) {
  const schoolWhere = {
    isPublished: true,
  };
  if (filters.province) schoolWhere.province = filters.province;
  if (filters.level) schoolWhere.level = filters.level;
  if (filters.search) {
    schoolWhere.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { nameEn: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.sector) {
    applySectorFilter(schoolWhere, filters.sector);
  } else if (filters.affiliation) {
    schoolWhere.affiliation = filters.affiliation;
  }
  return { school: schoolWhere };
}

async function listRanking(query) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const sortBy = SORT_MAP[query.sortBy] ? query.sortBy : 'rank';
  const order = query.order === 'desc' ? 'desc' : 'asc';
  const filters = {
    province: query.province || '',
    affiliation: query.affiliation || '',
    sector: query.sector || '',
    level: query.level || '',
    search: query.search || '',
  };
  const where = buildWhere(filters);
  const orderBy = [{ [SORT_MAP[sortBy]]: order }];
  const [total, rows] = await prisma.$transaction([
    prisma.ranking.count({ where }),
    prisma.ranking.findMany({
      where,
      include: { school: true },
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);
  return { data: rows, total, page, limit };
}

async function top10() {
  const rows = await prisma.ranking.findMany({
    where: { school: { isPublished: true } },
    include: { school: true },
    orderBy: [{ rank: 'asc' }],
    take: 10,
  });
  return rows;
}

async function aiRankingList() {
  const rows = await prisma.ranking.findMany({
    where: { school: { isPublished: true } },
    include: { school: true },
    orderBy: [{ rank: 'asc' }],
  });
  return rows.map((r) => ({
    rank: r.rank,
    schoolName: r.school.name,
    province: r.school.province,
    affiliation: r.school.affiliation,
    levelBand: r.level,
    totalScore: r.totalScore,
    scores: {
      A: r.scoreA,
      B: r.scoreB,
      C: r.scoreC,
      D: r.scoreD,
      E: r.scoreE,
    },
  }));
}

module.exports = {
  recalculateAll,
  computeTotals,
  listRanking,
  top10,
  aiRankingList,
};
