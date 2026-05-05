const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const swaggerUi = require('swagger-ui-express');

const swaggerSpec = require('./swagger');
const { errorHandler } = require('./middleware/errorHandler.middleware');
const rankingService = require('./ranking/ranking.service');

const authRouter = require('./auth/auth.router');
const schoolsRouter = require('./schools/schools.router');
const scoresRouter = require('./scores/scores.router');
const rankingRouter = require('./ranking/ranking.router');
const uploadRouter = require('./upload/upload.router');
const importRouter = require('./import.router');
const adminMetaRouter = require('./admin/admin.router');
const schoolApplicationsRouter = require('./school-applications/school-applications.router');

const app = express();
app.set('trust proxy', 1);

const uploadPath = process.env.UPLOAD_PATH || path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

/** Comma-separated for production (e.g. Vercel prod + preview): https://app.vercel.app,https://xxx-git-branch.vercel.app */
const defaultFrontendOrigins = 'http://localhost:3007,https://school-ranking-platform.vercel.app';
const frontendOrigins = (process.env.FRONTEND_URL || defaultFrontendOrigins)
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin:
      frontendOrigins.length <= 1
        ? frontendOrigins[0] || 'http://localhost:3007'
        : frontendOrigins,
    credentials: true,
  })
);
app.use(express.json());

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200: { description: OK }
 */
app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/uploads', express.static(uploadPath));

app.use('/api/auth', authRouter);
app.use('/api/school-applications', schoolApplicationsRouter);
app.use('/api/schools', schoolsRouter);
app.use('/api/scores', scoresRouter);
app.use('/api/ranking', rankingRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/import', importRouter);
app.use('/api/admin', adminMetaRouter);

app.get('/api/v1/ranking', async (req, res, next) => {
  try {
    const rankings = await rankingService.aiRankingList();
    res.json({
      generatedAt: new Date().toISOString(),
      rankings,
    });
  } catch (e) {
    next(e);
  }
});

app.use(errorHandler);

module.exports = app;
