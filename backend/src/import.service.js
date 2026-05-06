const { Prisma } = require('@prisma/client');
const prisma = require('./prisma');
const auditService = require('./audit.service');
const { normalizeSchoolName } = require('./utils/schoolNameKey');
const rankingService = require('./ranking/ranking.service');

const SCHOOL_HEADERS = [
  'id',
  'name',
  'nameEn',
  'province',
  'affiliation',
  'level',
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

function validateHeaders(headers) {
  const normalized = headers.map((h) => h.trim());
  const errors = [];
  EXPECTED_HEADERS.forEach((header, idx) => {
    if (normalized[idx] !== header) {
      errors.push(`คอลัมน์ที่ ${idx + 1} ต้องเป็น "${header}" แต่พบ "${normalized[idx] || '(ว่าง)'}"`);
    }
  });
  if (normalized.length !== EXPECTED_HEADERS.length) {
    errors.push(`จำนวนคอลัมน์ต้องเป็น ${EXPECTED_HEADERS.length} แต่พบ ${normalized.length}`);
  }
  return errors;
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

async function analyzeCsv(buffer) {
  const text = buffer.toString('utf8');
  const rows = parseCsv(text);
  if (rows.length === 0) {
    return {
      ok: false,
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
  const headerErrors = validateHeaders(headers);
  if (headerErrors.length) {
    return {
      ok: false,
      totalRows: Math.max(0, rows.length - 1),
      validRows: 0,
      createCount: 0,
      updateCount: 0,
      errorCount: headerErrors.length,
      headerErrors,
      rows: [],
    };
  }

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
    if (cells.length !== EXPECTED_HEADERS.length) {
      rowErrors.push(`จำนวนคอลัมน์ต้องเป็น ${EXPECTED_HEADERS.length} แต่พบ ${cells.length}`);
    }
    const raw = buildRowObject(headers, cells);
    if (raw.id) {
      if (seenIds.has(raw.id)) rowErrors.push('id ซ้ำในไฟล์เดียวกัน');
      seenIds.add(raw.id);
    }
    const nk = normalizeSchoolName(raw.name);
    if (nk) {
      if (seenNames.has(nk)) rowErrors.push('ชื่อโรงเรียนซ้ำในไฟล์เดียวกัน');
      seenNames.add(nk);
    }
    const normalized = validateAndNormalizeRow(raw, rowNumber, existingIds, existingByName);
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

async function importCsv(buffer, { actorId, ip } = {}) {
  const analysis = await analyzeCsv(buffer);
  if (!analysis.ok) {
    const err = new Error('CSV validation failed');
    err.status = 400;
    err.result = analysis;
    throw err;
  }

  try {
    await prisma.$transaction(async (tx) => {
      for (const row of analysis.normalizedRows) {
        const school =
          row.action === 'update'
            ? await tx.school.update({
                where: { id: row.id },
                data: row.data.school,
              })
            : await tx.school.create({
                data: row.data.school,
              });

        await tx.score.upsert({
          where: { schoolId: school.id },
          update: row.data.scores,
          create: { schoolId: school.id, ...row.data.scores },
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
