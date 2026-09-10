import { createHash } from 'node:crypto';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';

const emailKey = (req) =>
  createHash('sha256')
    .update(String(req.body?.email || ''))
    .digest('hex')
    .slice(0, 16);
const store = (client, prefix) => new RedisStore({ prefix, sendCommand: (...args) => client.sendCommand(args) });
const options = (client, prefix, windowMs, limit, keyGenerator) => ({
  windowMs,
  limit,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  ...(client ? { store: store(client, prefix) } : {}),
  keyGenerator,
  handler: (_req, _res, next) =>
    next(Object.assign(new Error('Too many requests'), { status: 429, code: 'RATE_LIMITED' }))
});

export const createRateLimiters = ({ redisClient }) => ({
  api: rateLimit(options(redisClient, 'rl:api:', 15 * 60 * 1000, 300)),
  auth: rateLimit(
    options(redisClient, 'rl:auth:', 15 * 60 * 1000, 10, (req) => `${ipKeyGenerator(req.ip)}:${emailKey(req)}`)
  ),
  reset: rateLimit(
    options(redisClient, 'rl:reset:', 60 * 60 * 1000, 3, (req) => `${ipKeyGenerator(req.ip)}:${emailKey(req)}`)
  )
});
