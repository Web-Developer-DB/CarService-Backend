import http from 'node:http';
import { createApp } from '../app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { loadConfig } from './config/env.js';
import { createLogger } from './config/logger.js';
import { createMailer } from './config/mailer.js';
import { connectRedis } from './config/redis.js';

const config = loadConfig();
const logger = createLogger(config);
const redisClient = await connectRedis(config, logger);
await connectDatabase(config, logger);
const app = createApp({ config, redisClient, mailer: createMailer(config), logger });
const server = http.createServer(app);
server.requestTimeout = 15_000;
server.headersTimeout = 20_000;
server.listen(config.PORT, () => logger.info({ port: config.PORT }, 'Server listening'));

const shutdown = async (signal) => {
  logger.info({ signal }, 'Shutting down');
  server.close(async () => {
    await redisClient.quit();
    await disconnectDatabase();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};
process.once('SIGTERM', () => void shutdown('SIGTERM'));
process.once('SIGINT', () => void shutdown('SIGINT'));
