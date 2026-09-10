import Joi from 'joi';

const schema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().port().default(3000),
  MONGODB_URI: Joi.string()
    .uri({ scheme: ['mongodb', 'mongodb+srv'] })
    .required(),
  REDIS_URL: Joi.string()
    .uri({ scheme: ['redis', 'rediss'] })
    .required(),
  ACCESS_TOKEN_SECRET: Joi.string().min(32).required(),
  JWT_ISSUER: Joi.string().uri().required(),
  JWT_AUDIENCE: Joi.string().required(),
  CORS_ORIGINS: Joi.string().required(),
  APP_ORIGIN: Joi.string().uri().required(),
  SMTP_HOST: Joi.string().hostname().required(),
  SMTP_PORT: Joi.number().port().default(587),
  SMTP_USER: Joi.string().required(),
  SMTP_PASS: Joi.string().required(),
  SMTP_FROM: Joi.string().email().required(),
  COOKIE_SECURE: Joi.boolean().default(true),
  TRUST_PROXY: Joi.alternatives().try(Joi.boolean(), Joi.number().integer().min(0)).default(1),
  LOG_LEVEL: Joi.string().valid('fatal', 'error', 'warn', 'info', 'debug', 'trace').default('info')
}).unknown(false);

export const loadConfig = (env = process.env) => {
  const { value, error } = schema.validate(env, { abortEarly: false, convert: true });
  if (error)
    throw new Error(`Invalid runtime configuration: ${error.details.map(({ message }) => message).join('; ')}`);
  if (value.NODE_ENV === 'production' && !value.COOKIE_SECURE)
    throw new Error('COOKIE_SECURE must be true in production');
  return {
    ...value,
    corsOrigins: value.CORS_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
    trustProxy: value.TRUST_PROXY,
    bodyLimit: '64kb',
    accessTokenTtl: '15m',
    refreshTokenTtlDays: 14,
    actionTokenTtlMinutes: 15,
    isDatabaseReady: () => false
  };
};
