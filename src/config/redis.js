import { createClient } from 'redis';

export const connectRedis = async (config, logger) => {
  const client = createClient({ url: config.REDIS_URL });
  client.on('error', (error) => logger.error({ error }, 'Redis client error'));
  await client.connect();
  logger.info('Redis connected');
  return client;
};
