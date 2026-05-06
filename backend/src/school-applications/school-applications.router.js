const express = require('express');
const rateLimit = require('express-rate-limit');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate.middleware');
const schoolApplicationService = require('./schoolApplication.service');

const router = express.Router();

const applyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'ส่งคำขอบ่อยเกินไป กรุณาลองใหม่ภายหลัง' },
});

router.post(
  '/',
  applyLimiter,
  body('schoolName').isString().trim().notEmpty(),
  body('nameEn').optional().isString(),
  body('province').isString().trim().notEmpty(),
  body('affiliation').isString().trim().notEmpty(),
  body('level').isString().trim().notEmpty(),
  body('totalRooms').isInt({ min: 0 }),
  body('smartClassroomRooms').isInt({ min: 0 }),
  body('studentCount').isInt({ min: 0 }),
  body('coordinatorName').isString().trim().notEmpty(),
  body('coordinatorEmail').isEmail().normalizeEmail(),
  body('coordinatorPhone').optional().isString(),
  body('message').optional().isString(),
  validate,
  async (req, res, next) => {
    try {
      const row = await schoolApplicationService.create(req.body);
      res.status(201).json(row);
    } catch (e) {
      next(e);
    }
  }
);

module.exports = router;
