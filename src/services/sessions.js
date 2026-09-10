import { randomUUID } from 'node:crypto';
import RefreshSession from '../models/RefreshSession.js';
import { randomToken, sha256 } from './crypto.js';

const expiry = (config) => new Date(Date.now() + config.refreshTokenTtlDays * 24 * 60 * 60 * 1000);

export const createSession = async ({ userId, config, req, familyId = randomUUID() }) => {
  const refreshToken = randomToken();
  const csrfToken = randomToken();
  const session = await RefreshSession.create({
    userId,
    familyId,
    tokenHash: sha256(refreshToken),
    csrfTokenHash: sha256(csrfToken),
    expiresAt: expiry(config),
    userAgent: req.get('user-agent') || '',
    ipHash: sha256(req.ip)
  });
  return { session, refreshToken, csrfToken };
};

export const revokeUserSessions = (userId, session) =>
  RefreshSession.updateMany({ userId, revokedAt: null }, { $set: { revokedAt: new Date() } }, { session });
export const refreshCookieOptions = (config) => ({
  httpOnly: true,
  secure: config.COOKIE_SECURE,
  sameSite: 'none',
  path: '/api/v2/auth',
  maxAge: config.refreshTokenTtlDays * 24 * 60 * 60 * 1000
});
