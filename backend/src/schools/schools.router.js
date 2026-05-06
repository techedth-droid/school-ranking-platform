const express = require('express');
const { body, param } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const { authMiddleware } = require('../middleware/auth.middleware');
const { optionalAuth } = require('../middleware/optionalAuth.middleware');
const { requireRole } = require('../middleware/roles.middleware');
const { requireSchoolAccess } = require('../middleware/schoolAccess.middleware');
const schoolsService = require('./schools.service');
const evidenceService = require('../evidence/evidence.service');
const reportService = require('../report/report.service');
const profileService = require('../profile/profile.service');
const prisma = require('../prisma');
const auditService = require('../audit.service');
const yearSnapshotService = require('../yearSnapshot/yearSnapshot.service');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const result = await schoolsService.listPublished(req.query);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get(
  '/all',
  authMiddleware,
  requireRole('ADMIN'),
  async (req, res, next) => {
    try {
      const result = await schoolsService.listAll(req.query);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  '/:id/admins',
  authMiddleware,
  requireRole('ADMIN'),
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const list = await schoolsService.listSchoolAdmins(req.params.id);
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/:id/admins',
  authMiddleware,
  requireRole('ADMIN'),
  param('id').isUUID(),
  body('email').isEmail(),
  body('password').isString().isLength({ min: 6 }),
  validate,
  async (req, res, next) => {
    try {
      const user = await schoolsService.createSchoolAdmin(req.params.id, {
        email: req.body.email,
        password: req.body.password,
      });
      res.status(201).json(user);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  '/:id/evidence',
  authMiddleware,
  requireSchoolAccess('id'),
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const list = await evidenceService.listFiles(req.params.id);
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  '/:id/evidence/:fileId',
  authMiddleware,
  requireSchoolAccess('id'),
  param('id').isUUID(),
  param('fileId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      await evidenceService.removeFile(req.params.id, req.params.fileId);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  '/:id/report',
  authMiddleware,
  requireSchoolAccess('id'),
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const status = await reportService.getReportStatus(req.params.id);
      res.json(status);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/:id/report/acknowledge',
  authMiddleware,
  requireSchoolAccess('id'),
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const row = await reportService.acknowledgeReport(req.params.id, req.user.sub);
      res.json({
        acknowledgedAt: row.acknowledgedAt,
        acknowledgedByEmail: row.user.email,
      });
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  '/:id/certificate/pdf',
  authMiddleware,
  requireSchoolAccess('id'),
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const file = await profileService.officialCertificateFile(req.params.id);
      if (!file) return res.status(404).json({ error: 'No certificate PDF uploaded' });
      const row = await prisma.school.findUnique({
        where: { id: req.params.id },
        select: { name: true },
      });
      const safeName =
        (row?.name || 'certificate').replace(/[^\w\u0E00-\u0E7F\s-]+/g, '').trim() ||
        'certificate';
      const downloadName = `${safeName}-certificate.pdf`;
      if (file.type === 'remote') {
        const upstream = await fetch(file.url);
        if (!upstream.ok) {
          return res.status(404).json({ error: 'No certificate PDF uploaded' });
        }
        res.setHeader('Content-Type', upstream.headers.get('content-type') || 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${downloadName}"`);
        const buffer = Buffer.from(await upstream.arrayBuffer());
        return res.send(buffer);
      }
      res.download(file.path, downloadName, (err) => {
        if (err && !res.headersSent) next(err);
      });
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  '/:id/certificate',
  authMiddleware,
  requireSchoolAccess('id'),
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const school = await schoolsService.getById(req.params.id, {
        isAdmin: req.user.role === 'ADMIN',
        isOwnSchool:
          req.user.role === 'SCHOOL_ADMIN' && req.user.schoolId === req.params.id,
      });
      if (!school) return res.status(404).json({ error: 'Not found' });
      const html = reportService.certificateHtml(school, school.ranking);
      res.type('html').send(html);
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  '/:id/gallery',
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const list = await profileService.listGallery(req.params.id);
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  '/:id/gallery/:imageId',
  authMiddleware,
  requireSchoolAccess('id'),
  param('id').isUUID(),
  param('imageId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      await profileService.removeGalleryImage(req.params.id, req.params.imageId);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  '/:id/certificates',
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const list = await profileService.listCertificates(req.params.id);
      res.json(list);
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  '/:id/certificates/:certId',
  authMiddleware,
  requireRole('ADMIN'),
  param('id').isUUID(),
  param('certId').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      await profileService.removeCertificate(req.params.id, req.params.certId);
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

router.get(
  '/:id/year-category-ranks',
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const data = await yearSnapshotService.getYearCategoryRankSeriesForSchool(req.params.id);
      if (data === null) return res.status(404).json({ error: 'Not found' });
      res.json(data);
    } catch (e) {
      next(e);
    }
  }
);

router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    const isAdmin = req.user && req.user.role === 'ADMIN';
    const isOwnSchool =
      req.user && req.user.role === 'SCHOOL_ADMIN' && req.user.schoolId === req.params.id;
    const school = await schoolsService.getById(req.params.id, { isAdmin, isOwnSchool });
    if (!school) return res.status(404).json({ error: 'Not found' });
    res.json(school);
  } catch (e) {
    next(e);
  }
});

router.post(
  '/',
  authMiddleware,
  requireRole('ADMIN'),
  body('name').isString().notEmpty(),
  body('province').isString().notEmpty(),
  body('affiliation').isString().notEmpty(),
  body('level').isString().notEmpty(),
  validate,
  async (req, res, next) => {
    try {
      const school = await schoolsService.create(req.body);
      await auditService.log({
        actorId: req.user.sub,
        action: 'school.create',
        entity: 'School',
        entityId: school.id,
        ip: req.ip,
      });
      res.status(201).json(school);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  '/:id',
  authMiddleware,
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      const school = await schoolsService.update(req.params.id, req.body, req.user);
      await auditService.log({
        actorId: req.user.sub,
        action: 'school.update',
        entity: 'School',
        entityId: req.params.id,
        meta: { keys: Object.keys(req.body || {}) },
        ip: req.ip,
      });
      res.json(school);
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  '/:id',
  authMiddleware,
  requireRole('ADMIN'),
  param('id').isUUID(),
  validate,
  async (req, res, next) => {
    try {
      await schoolsService.remove(req.params.id);
      await auditService.log({
        actorId: req.user.sub,
        action: 'school.delete',
        entity: 'School',
        entityId: req.params.id,
        ip: req.ip,
      });
      res.status(204).send();
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  '/:id/publish',
  authMiddleware,
  requireRole('ADMIN'),
  param('id').isUUID(),
  body('isPublished').isBoolean(),
  validate,
  async (req, res, next) => {
    try {
      const school = await schoolsService.setPublished(req.params.id, req.body.isPublished);
      await auditService.log({
        actorId: req.user.sub,
        action: 'school.publish',
        entity: 'School',
        entityId: req.params.id,
        meta: { isPublished: req.body.isPublished },
        ip: req.ip,
      });
      res.json(school);
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
