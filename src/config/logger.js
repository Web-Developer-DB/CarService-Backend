import pino from 'pino';

export const createLogger = (config) =>
  pino({ level: config.LOG_LEVEL, base: undefined, redact: ['authorization', 'cookie', 'password', 'token'] });
