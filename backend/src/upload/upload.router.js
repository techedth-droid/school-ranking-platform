const express = require('express');
const { param, body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authMiddleware } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/roles.middleware');
const { requireSchoolAccess } = require('../middleware/schoolAccess.middleware');
const { createUploader } = require('./storage');
const uploadService = require('./upload.service');
const evidenceService = require('../evidence/evidence.service');
const profileService = require('../profile/profile.service');

const upload = createUploader((_req, file, cb) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Only image files allowed'));
    return;
  }
  cb(null, true);
});

const evidenceMulter = createUploader((_req, file, cb) => {
  const ok =
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf' ||
    file.mimetype === 'application/msword' ||
    file.mimetype ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  if (!ok) {
    cb(new Error('Allowed: images, PDF, Word'));
    return;
  }
  cb(null, true);
});

// banner: image only
const bannerUpload = upload;

// certificate: image OR PDF
const certificateUpload = createUploader((_req, file, cb) => {
  const ok =
    file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf';
  if (!ok) {
    cb(new Error('Allowed: images or PDF'));
    return;
  }
  cb(null, true);
});

/** Official ministry certificate PDF (single file per school; download via authenticated API only) */
const officialPdfUpload = createUploader((_req, file, cb) => {
  if (file.mimetype !== 'application/pdf') {
    cb(new Error('Only PDF files allowed'));
    return;
  }
  cb(null, true);
});

const router = express.Router();

router.post(
  '/logo/:schoolId',
  authMiddleware,
  requireSchoolAccess('schoolId'),
  param('schoolId').isUUID(),
  validate,
  upload.single('logo'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Missing file' });
      }
      const result = await uploadService.saveLogo(req.params.schoolId, req.file);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/evidence/:schoolId',
  authMiddleware,
  requireSchoolAccess('schoolId'),
  param('schoolId').isUUID(),
  validate,
  evidenceMulter.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Missing file' });
      }
      const row = await evidenceService.addFile(req.params.schoolId, req.file);
      res.status(201).json(row);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/banner/:schoolId',
  authMiddleware,
  requireSchoolAccess('schoolId'),
  param('schoolId').isUUID(),
  validate,
  bannerUpload.single('banner'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Missing file' });
      const result = await profileService.saveBanner(req.params.schoolId, req.file);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/gallery/:schoolId',
  authMiddleware,
  requireSchoolAccess('schoolId'),
  param('schoolId').isUUID(),
  body('caption').optional().isString().isLength({ max: 200 }),
  validate,
  bannerUpload.single('image'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Missing file' });
      const row = await profileService.addGalleryImage(
        req.params.schoolId,
        req.file,
        req.body.caption || ''
      );
      res.status(201).json(row);
    } catch (e) {
      next(e);
    }
  }
);

/** ใบรับรอง/โล่บนโปรไฟล์ — อัปโหลดได้เฉพาะผู้ดูแลระบบ (แอดมินโรงเรียนดูและดาวน์โหลดได้อย่างเดียว) */
router.post(
  '/certificate/:schoolId',
  authMiddleware,
  requireRole('ADMIN'),
  param('schoolId').isUUID(),
  body('title').optional().isString().isLength({ max: 200 }),
  validate,
  certificateUpload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Missing file' });
      const row = await profileService.addCertificate(
        req.params.schoolId,
        req.file,
        req.body.title || ''
      );
      res.status(201).json(row);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/official-certificate-pdf/:schoolId',
  authMiddleware,
  requireSchoolAccess('schoolId'),
  param('schoolId').isUUID(),
  validate,
  officialPdfUpload.single('pdf'),
  async (req, res, next) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'Missing file' });
      const result = await profileService.saveOfficialCertificatePdf(
        req.params.schoolId,
        req.file
      );
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
