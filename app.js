import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { randomUUID } from 'node:crypto';
import { createLogger } from './src/config/logger.js';
import { createApiRouter } from './src/routes/api.js';
import { createRateLimiters } from './src/middleware/rateLimiters.js';
import { errorHandler, notFound } from './src/middleware/errors.js';

export const createApp = ({ config, redisClient, mailer, logger = createLogger(config) }) => {
  const app = express();
  const limits = createRateLimiters({ config, redisClient });
  const allowedOrigins = new Set(config.corsOrigins);

  app.disable('x-powered-by');
  app.set('trust proxy', config.trustProxy);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req, res) => req.headers['x-request-id'] || res.getHeader('x-request-id') || randomUUID(),
      customLogLevel: (_req, res, error) =>
        error || res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info',
      redact: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.currentPassword',
        'req.body.newPassword',
        'req.body.token'
      ]
    })
  );
  app.use((req, res, next) => {
    res.setHeader('x-request-id', req.id);
    next();
  });
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        return callback(
          Object.assign(new Error('Origin is not allowed by CORS'), { status: 403, code: 'CORS_DENIED' })
        );
      },
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Authorization', 'Content-Type', 'X-CSRF-Token', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id'],
      maxAge: 600
    })
  );
  app.use(express.json({ limit: config.bodyLimit }));

  app.get('/health/live', (_req, res) => res.status(200).json({ status: 'ok' }));
  app.get('/health/ready', (_req, res) => {
    const ready = config.isDatabaseReady();
    res.status(ready ? 200 : 503).json({ status: ready ? 'ready' : 'not_ready' });
  });
  app.use('/api/v2', limits.api, createApiRouter({ config, redisClient, mailer, limits }));
  app.use(notFound);
  app.use(errorHandler);
  return app;
};
