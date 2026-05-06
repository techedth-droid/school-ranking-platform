const express = require('express');
const { param, body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/roles.middleware');
const scoresService = require('./scores.service');
const yearSnapshotService = require('../yearSnapshot/yearSnapshot.service');
const auditService = require('../audit.service');

const router = express.Router();

const SUB_SCORE_VALIDATORS = [];
['a', 'b', 'c', 'd', 'e'].forEach((letter) => {
  for (let n = 1; n <= 5; n += 1) {
    SUB_SCORE_VALIDATORS.push(body(`${letter}${n}`).optional().isFloat({ min: 0, max: 4 }));
  }
});

function scoresAccess(req, res, next) {
  if (req.user.role === 'ADMIN') return next();
  if (req.user.role === 'SCHOOL_ADMIN' && req.user.schoolId === req.params.schoolId) {
    return next();
  }
  return res.status(403).json({ error: 'Forbidden' });
}

router.get(
  '/:schoolId/year-snapshots',
  authMiddleware,
  requireRole('ADMIN'),
  param('schoolId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const data = await yearSnapshotService.listYearSnapshotsForSchool(req.params.schoolId);
      res.json(data);
    } catch (e) {
      if (e.status === 404) return res.status(404).json({ error: 'Not found' });
      next(e);
    }
  }
);

router.put(
  '/:schoolId/year-snapshots/:year',
  authMiddleware,
  requireRole('ADMIN'),
  param('schoolId').isUUID(),
  param('year').isInt({ min: 2000, max: 2100 }),
  body('scoreA').isFloat({ min: 0, max: 20 }),
  body('scoreB').isFloat({ min: 0, max: 20 }),
  body('scoreC').isFloat({ min: 0, max: 20 }),
  body('scoreD').isFloat({ min: 0, max: 20 }),
  body('scoreE').isFloat({ min: 0, max: 20 }),
  ...SUB_SCORE_VALIDATORS,
  validate,
  async (req, res, next) => {
    try {
      const year = Number(req.params.year);
      const { startYear, endYear } = yearSnapshotService.getAdminYearRange();
      if (year < startYear || year > endYear) {
        return res.status(400).json({ error: 'Year out of allowed range' });
      }
      const row = await yearSnapshotService.upsertYearSnapshotForSchool(req.params.schoolId, year, req.body);
      await auditService.log({
        actorId: req.user.sub,
        action: 'scores.yearSnapshot.upsert',
        entity: 'SchoolYearCategorySnapshot',
        entityId: `${req.params.schoolId}:${year}`,
        ip: req.ip,
      });
      res.json(row);
    } catch (e) {
      if (e.status === 404) return res.status(404).json({ error: 'Not found' });
      if (e.status === 400) return res.status(400).json({ error: e.message });
      next(e);
    }
  }
);

router.get(
  '/:schoolId',
  authMiddleware,
  scoresAccess,
  param('schoolId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const score = await scoresService.getScores(req.params.schoolId);
      res.json(score || {});
    } catch (e) {
      next(e);
    }
  }
);

/** บันทึกคะแนนได้เฉพาะผู้ดูแลระบบ — แอดมินโรงเรียนดูได้อย่างเดียว */
router.put(
  '/:schoolId',
  authMiddleware,
  requireRole('ADMIN'),
  param('schoolId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const score = await scoresService.upsertScores(req.params.schoolId, req.body);
      await auditService.log({
        actorId: req.user.sub,
        action: 'scores.upsert',
        entity: 'School',
        entityId: req.params.schoolId,
        ip: req.ip,
      });
      res.json(score);
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
