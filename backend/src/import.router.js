const express = require('express');
const multer = require('multer');
const { body } = require('express-validator');
const { validate } = require('./middleware/validate.middleware');
const { authMiddleware } = require('./middleware/auth.middleware');
const { requireRole } = require('./middleware/roles.middleware');
const importService = require('./import.service');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok =
      file.mimetype === 'text/csv' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.toLowerCase().endsWith('.csv');
    if (!ok) return cb(new Error('Only CSV files allowed'));
    cb(null, true);
  },
});

function requireFile(req, res, next) {
  if (!req.file) return res.status(400).json({ error: 'Missing CSV file' });
  next();
}

router.post(
  '/schools/dry-run',
  authMiddleware,
  requireRole('ADMIN'),
  upload.single('file'),
  body('year').optional({ checkFalsy: true }).isInt({ min: 2000, max: 2100 }),
  validate,
  requireFile,
  async (req, res, next) => {
    try {
      const result = await importService.analyzeCsv(req.file.buffer, { year: req.body.year });
      const { normalizedRows: _normalizedRows, ...safeResult } = result;
      res.json(safeResult);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/schools',
  authMiddleware,
  requireRole('ADMIN'),
  upload.single('file'),
  body('year').optional({ checkFalsy: true }).isInt({ min: 2000, max: 2100 }),
  validate,
  requireFile,
  async (req, res, next) => {
    try {
      const result = await importService.importCsv(req.file.buffer, {
        actorId: req.user.sub,
        ip: req.ip,
        year: req.body.year,
      });
      res.json(result);
    } catch (e) {
      if (e.result) {
        const { normalizedRows: _normalizedRows, ...safeResult } = e.result;
        return res.status(e.status || 400).json(safeResult);
      }
      next(e);
    }
  }
);

module.exports = router;
