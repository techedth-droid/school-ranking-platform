const { Prisma } = require('@prisma/client');
const prisma = require('./prisma');
const auditService = require('./audit.service');
const { normalizeSchoolName } = require('./utils/schoolNameKey');
const rankingService = require('./ranking/ranking.service');
const yearSnapshotService = require('./yearSnapshot/yearSnapshot.service');

const SCHOOL_HEADERS = [
  'id',
  'name',
  'nameEn',
  'province',
  'affiliation',
  'level',
  'totalRooms',
  'smartClassroomRooms',
  'studentCount',
  'website',
  'contact',
  'description',
  'address',
  'phone',
  'facebookUrl',
  'lineId',
  'isPublished',
];

const SCORE_HEADERS = [];
['a', 'b', 'c', 'd', 'e'].forEach((letter) => {
  for (let n = 1; n <= 5; n += 1) SCORE_HEADERS.push(`${letter}${n}`);
});

const EXPECTED_HEADERS = [...SCHOOL_HEADERS, ...SCORE_HEADERS];
const SCORE_ONLY_HEADERS = ['name', ...SCORE_HEADERS];
const REQUIRED_SCHOOL_FIELDS = ['name', 'province', 'affiliation', 'level'];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let inQuotes = false;

  const source = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < source.length; i += 1) {
    const ch = source[i];
    const next = source[i + 1];

    if (ch === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (ch === ',' && !inQuotes) {
      row.push(value);
      value = '';
      continue;
    }

    if ((ch === '\n' || ch === '\r') && !inQuotes) {
      if (ch === '\r' && next === '\n') i += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
      continue;
    }

    value += ch;
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ''));
}

function parseBoolean(value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (raw === '' || raw === '0' || raw === 'false' || raw === 'no' || raw === 'ไม่') return false;
  if (raw === '1' || raw === 'true' || raw === 'yes' || raw === 'ใช่' || raw === 'เผยแพร่') return true;
  return null;
}

function normalizeScore(value) {
  if (String(value ?? '').trim() === '') return 0;
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  if (n < 0 || n > 4) return null;
  return Math.round(Math.min(4, Math.max(0, n)) * 100) / 100;
}

function normalizeNonNegativeInt(value) {
  const raw = String(value ?? '').trim();
  if (raw === '') return 0;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (n < 0) return null;
  return Math.floor(n);
}

function parseImportYear(rawYear) {
  if (rawYear == null || String(rawYear).trim() === '') return new Date().getFullYear();
  const year = Number(rawYear);
  if (!Number.isInteger(year)) return null;
  return year;
}

function validateImportYear(rawYear) {
  const year = parseImportYear(rawYear);
  if (year == null) return { year: null, error: 'ปีต้องเป็นตัวเลขจำนวนเต็ม' };
  const { startYear, endYear } = yearSnapshotService.getAdminYearRange();
  if (year < startYear || year > endYear) {
    return { year: null, error: `ปีต้องอยู่ระหว่าง ${startYear}-${endYear}` };
  }
  return { year, error: null };
}

function hasSameHeaders(headers, expected) {
  if (headers.length !== expected.length) return false;
  return expected.every((header, idx) => headers[idx] === header);
}

function validateHeaders(headers) {
  const normalized = headers.map((h) => h.trim());
  if (hasSameHeaders(normalized, EXPECTED_HEADERS)) {
    return { mode: 'full', errors: [] };
  }
  if (hasSameHeaders(normalized, SCORE_ONLY_HEADERS)) {
    return { mode: 'score_only', errors: [] };
  }
  const errors = [];
  EXPECTED_HEADERS.forEach((header, idx) => {
    if (normalized[idx] !== header) {
      errors.push(`คอลัมน์ที่ ${idx + 1} ต้องเป็น "${header}" แต่พบ "${normalized[idx] || '(ว่าง)'}"`);
    }
  });
  errors.push(
    `หรือใช้ไฟล์แบบอัปโหลดคะแนนอย่างเดียวได้ โดยหัวคอลัมน์ต้องเป็น: ${SCORE_ONLY_HEADERS.join(',')}`
  );
  errors.push(
    `จำนวนคอลัมน์ต้องเป็น ${EXPECTED_HEADERS.length} (แบบเต็ม) หรือ ${SCORE_ONLY_HEADERS.length} (แบบคะแนนอย่างเดียว) แต่พบ ${normalized.length}`
  );
  return { mode: null, errors };
}

function buildRowObject(headers, cells) {
  const row = {};
  headers.forEach((header, idx) => {
    row[header] = String(cells[idx] ?? '').trim();
  });
  return row;
}

function validateAndNormalizeRow(raw, rowNumber, existingIds, existingByName) {
  const errors = [];
  const id = raw.id.trim();
  const nameKey = normalizeSchoolName(raw.name);
  if (!nameKey) errors.push('ชื่อโรงเรียนไม่ถูกต้อง');
  const matchedSchool = !id && nameKey ? existingByName.get(nameKey) : null;
  const targetId = id || matchedSchool?.id || '';

  if (id && !UUID_RE.test(id)) errors.push('id ต้องเป็น UUID ที่ถูกต้อง หรือเว้นว่างเพื่อสร้างโรงเรียนใหม่');
  if (id && !existingIds.has(id)) errors.push('ไม่พบ id นี้ในระบบ จึงอัปเดตไม่ได้');

  REQUIRED_SCHOOL_FIELDS.forEach((field) => {
    if (!raw[field]) errors.push(`${field} เป็นข้อมูลบังคับ`);
  });

  const isPublished = parseBoolean(raw.isPublished);
  if (isPublished === null) errors.push('isPublished ต้องเป็น 0/1 หรือ true/false');
  const totalRooms = normalizeNonNegativeInt(raw.totalRooms);
  if (totalRooms === null) errors.push('totalRooms ต้องเป็นจำนวนเต็ม >= 0');
  const smartClassroomRooms = normalizeNonNegativeInt(raw.smartClassroomRooms);
  if (smartClassroomRooms === null) errors.push('smartClassroomRooms ต้องเป็นจำนวนเต็ม >= 0');
  const studentCount = normalizeNonNegativeInt(raw.studentCount);
  if (studentCount === null) errors.push('studentCount ต้องเป็นจำนวนเต็ม >= 0');

  const scores = {};
  SCORE_HEADERS.forEach((key) => {
    const score = normalizeScore(raw[key]);
    if (score === null) {
      errors.push(`${key} ต้องเป็นตัวเลข 0–4`);
    } else {
      scores[key] = score;
    }
  });

  return {
    rowNumber,
    action: targetId ? 'update' : 'create',
    id: targetId,
    name: raw.name,
    errors,
    data: errors.length
      ? null
      : {
          school: {
            name: raw.name,
            nameKey,
            nameEn: raw.nameEn,
            province: raw.province,
            affiliation: raw.affiliation,
            level: raw.level,
            totalRooms,
            smartClassroomRooms,
            studentCount,
            website: raw.website,
            contact: raw.contact,
            description: raw.description,
            address: raw.address,
            phone: raw.phone,
            facebookUrl: raw.facebookUrl,
            lineId: raw.lineId,
            isPublished,
          },
          scores,
        },
  };
}

function validateAndNormalizeScoreOnlyRow(raw, rowNumber, existingByName) {
  const errors = [];
  const nameKey = normalizeSchoolName(raw.name);
  if (!nameKey) errors.push('ชื่อโรงเรียนไม่ถูกต้อง');
  const matchedSchool = nameKey ? existingByName.get(nameKey) : null;
  if (!matchedSchool) errors.push('ไม่พบชื่อโรงเรียนนี้ในระบบ');

  const scores = {};
  SCORE_HEADERS.forEach((key) => {
    const score = normalizeScore(raw[key]);
    if (score === null) {
      errors.push(`${key} ต้องเป็นตัวเลข 0–4`);
    } else {
      scores[key] = score;
    }
  });

  return {
    rowNumber,
    action: 'update-score',
    id: matchedSchool?.id || '',
    name: raw.name,
    errors,
    data: errors.length
      ? null
      : {
          schoolId: matchedSchool.id,
          scores,
        },
  };
}

async function analyzeCsv(buffer, { year: rawYear } = {}) {
  const text = buffer.toString('utf8');
  const rows = parseCsv(text);
  const yearValidation = validateImportYear(rawYear);
  if (yearValidation.error) {
    return {
      ok: false,
      year: null,
      totalRows: Math.max(0, rows.length - 1),
      validRows: 0,
      createCount: 0,
      updateCount: 0,
      errorCount: 1,
      headerErrors: [yearValidation.error],
      rows: [],
    };
  }
  const importYear = yearValidation.year;
  if (rows.length === 0) {
    return {
      ok: false,
      year: importYear,
      totalRows: 0,
      validRows: 0,
      createCount: 0,
      updateCount: 0,
      errorCount: 1,
      headerErrors: ['ไฟล์ว่าง'],
      rows: [],
    };
  }

  const headers = rows[0].map((h) => h.trim());
  const headerValidation = validateHeaders(headers);
  if (headerValidation.errors.length) {
    return {
      ok: false,
      year: importYear,
      totalRows: Math.max(0, rows.length - 1),
      validRows: 0,
      createCount: 0,
      updateCount: 0,
      errorCount: headerValidation.errors.length,
      headerErrors: headerValidation.errors,
      rows: [],
    };
  }
  const mode = headerValidation.mode;

  const dataRows = rows.slice(1);
  const ids = dataRows
    .map((cells) => String(cells[0] ?? '').trim())
    .filter(Boolean);
  const existing = ids.length
    ? await prisma.school.findMany({
        where: { id: { in: ids } },
        select: { id: true },
      })
    : [];
  const existingIds = new Set(existing.map((s) => s.id));
  const existingSchools = await prisma.school.findMany({
    select: { id: true, nameKey: true },
  });
  const existingByName = new Map(
    existingSchools.filter((s) => s.nameKey).map((s) => [s.nameKey, s])
  );

  const seenIds = new Set();
  const seenNames = new Set();
  const resultRows = dataRows.map((cells, idx) => {
    const rowNumber = idx + 2;
    const rowErrors = [];
    const expectedLen = mode === 'score_only' ? SCORE_ONLY_HEADERS.length : EXPECTED_HEADERS.length;
    if (cells.length !== expectedLen) {
      rowErrors.push(`จำนวนคอลัมน์ต้องเป็น ${expectedLen} แต่พบ ${cells.length}`);
    }
    const raw = buildRowObject(headers, cells);
    if (mode === 'full' && raw.id) {
      if (seenIds.has(raw.id)) rowErrors.push('id ซ้ำในไฟล์เดียวกัน');
      seenIds.add(raw.id);
    }
    const nk = normalizeSchoolName(raw.name);
    if (nk) {
      if (seenNames.has(nk)) rowErrors.push('ชื่อโรงเรียนซ้ำในไฟล์เดียวกัน');
      seenNames.add(nk);
    }
    const normalized =
      mode === 'score_only'
        ? validateAndNormalizeScoreOnlyRow(raw, rowNumber, existingByName)
        : validateAndNormalizeRow(raw, rowNumber, existingIds, existingByName);
    return {
      ...normalized,
      errors: [...rowErrors, ...normalized.errors],
      data: rowErrors.length ? null : normalized.data,
    };
  });

  const validRows = resultRows.filter((r) => r.errors.length === 0);
  const errorRows = resultRows.filter((r) => r.errors.length > 0);
  return {
    ok: errorRows.length === 0,
    mode,
    year: importYear,
    totalRows: resultRows.length,
    validRows: validRows.length,
    createCount: validRows.filter((r) => r.action === 'create').length,
    updateCount: validRows.filter((r) => r.action === 'update').length,
    errorCount: errorRows.length,
    headerErrors: [],
    rows: resultRows.map(({ data, ...rest }) => rest),
    normalizedRows: resultRows,
  };
}

async function importCsv(buffer, { actorId, ip, year } = {}) {
  const analysis = await analyzeCsv(buffer, { year });
  if (!analysis.ok) {
    const err = new Error('CSV validation failed');
    err.status = 400;
    err.result = analysis;
    throw err;
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const row of analysis.normalizedRows) {
        const schoolId =
          analysis.mode === 'score_only'
            ? row.data.schoolId
            : (
                row.action === 'update'
                  ? await tx.school.update({
                      where: { id: row.id },
                      data: row.data.school,
                    })
                  : await tx.school.create({
                      data: row.data.school,
                    })
              ).id;

        await tx.score.upsert({
          where: { schoolId },
          update: row.data.scores,
          create: { schoolId, ...row.data.scores },
        });

        // Persist yearly snapshot for the selected import year.
        const s = row.data.scores;
        await tx.schoolYearCategorySnapshot.upsert({
          where: { schoolId_year: { schoolId, year: analysis.year } },
          create: {
            schoolId,
            year: analysis.year,
            scoreA: s.a1 + s.a2 + s.a3 + s.a4 + s.a5,
            scoreB: s.b1 + s.b2 + s.b3 + s.b4 + s.b5,
            scoreC: s.c1 + s.c2 + s.c3 + s.c4 + s.c5,
            scoreD: s.d1 + s.d2 + s.d3 + s.d4 + s.d5,
            scoreE: s.e1 + s.e2 + s.e3 + s.e4 + s.e5,
            ...s,
          },
          update: {
            scoreA: s.a1 + s.a2 + s.a3 + s.a4 + s.a5,
            scoreB: s.b1 + s.b2 + s.b3 + s.b4 + s.b5,
            scoreC: s.c1 + s.c2 + s.c3 + s.c4 + s.c5,
            scoreD: s.d1 + s.d2 + s.d3 + s.d4 + s.d5,
            scoreE: s.e1 + s.e2 + s.e3 + s.e4 + s.e5,
            ...s,
          },
        });
      }
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      const err = new Error('ข้อมูลซ้ำ (ชื่อโรงเรียนหรือคีย์อื่น) — ตรวจสอบไฟล์หรือลบรายการซ้ำในฐานข้อมูล');
      err.status = 409;
      throw err;
    }
    throw e;
  }

  const ranking = await rankingService.recalculateAll();
  await auditService.log({
    actorId,
    action: 'import.schools_csv',
    entity: 'BulkImport',
    meta: {
      rows: analysis.totalRows,
      createCount: analysis.createCount,
      updateCount: analysis.updateCount,
      mode: analysis.mode,
      year: analysis.year,
    },
    ip,
  });
  return {
    ...analysis,
    normalizedRows: undefined,
    imported: true,
    ranking,
  };
}

module.exports = {
  EXPECTED_HEADERS,
  analyzeCsv,
  importCsv,
};
