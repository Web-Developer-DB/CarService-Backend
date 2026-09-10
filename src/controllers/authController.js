import bcrypt from 'bcrypt';
import User from '../models/User.js';
import RefreshSession from '../models/RefreshSession.js';
import { ApiError } from '../middleware/errors.js';
import { createActionToken, consumeActionToken } from '../services/actions.js';
import { issueAccessToken } from '../services/accessTokens.js';
import { sendActionEmail } from '../services/email.js';
import { safeEqualHash, sha256 } from '../services/crypto.js';
import { createSession, refreshCookieOptions, revokeUserSessions } from '../services/sessions.js';

const genericRegistrationMessage = { message: 'If the address can be registered, an email will be sent shortly.' };
const genericResetMessage = { message: 'If the account exists, a reset email will be sent shortly.' };
const userDto = (user) => ({ id: user.id, email: user.email, emailVerifiedAt: user.emailVerifiedAt });
const readCookie = (req, name) =>
  Object.fromEntries(
    (req.get('cookie') || '')
      .split(';')
      .filter(Boolean)
      .map((part) => part.trim().split('='))
  )[name];

const issueLogin = async ({ user, req, res, config }) => {
  const { session, refreshToken, csrfToken } = await createSession({ userId: user.id, config, req });
  const accessToken = await issueAccessToken({ user, sessionId: session.id, config });
  res.cookie('refresh_token', refreshToken, refreshCookieOptions(config));
  res.status(200).json({ accessToken, expiresIn: config.accessTokenTtl, csrfToken, user: userDto(user) });
};

export const register =
  ({ config, mailer }) =>
  async (req, res, _next) => {
    try {
      const existing = await User.findOne({ email: req.body.email });
      if (!existing) {
        const user = await User.create({
          email: req.body.email,
          passwordHash: await bcrypt.hash(req.body.password, 12)
        });
        const token = await createActionToken({ userId: user.id, type: 'verify_email', config });
        await sendActionEmail({ mailer, config, recipient: user.email, type: 'verify_email', token });
      }
      res.status(202).json(genericRegistrationMessage);
    } catch (error) {
      if (error.code === 11000) return res.status(202).json(genericRegistrationMessage);
      req.log?.error({ err: error }, 'Registration email could not be sent');
      res.status(202).json(genericRegistrationMessage);
    }
  };

export const verifyEmail = () => async (req, res, next) => {
  try {
    const action = await consumeActionToken({ token: req.body.token, type: 'verify_email' });
    if (!action) throw new ApiError(400, 'Verification token is invalid or expired', 'INVALID_ACTION_TOKEN');
    await User.findByIdAndUpdate(action.userId, { $set: { emailVerifiedAt: new Date() } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const login =
  ({ config }) =>
  async (req, res, next) => {
    try {
      const user = await User.findOne({ email: req.body.email }).select('+passwordHash');
      if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash)))
        throw new ApiError(401, 'Invalid email or password', 'INVALID_CREDENTIALS');
      if (!user.emailVerifiedAt) throw new ApiError(403, 'Email verification is required', 'EMAIL_NOT_VERIFIED');
      await issueLogin({ user, req, res, config });
    } catch (error) {
      next(error);
    }
  };

const findCookieSession = async (req, config) => {
  const refreshToken = readCookie(req, 'refresh_token');
  const csrfToken = req.get('x-csrf-token');
  const origin = req.get('origin');
  if (!refreshToken || !csrfToken || !origin || !config.corsOrigins.includes(origin))
    throw new ApiError(403, 'CSRF validation failed', 'CSRF_FAILED');
  const session = await RefreshSession.findOne({ tokenHash: sha256(refreshToken) });
  if (!session || !safeEqualHash(session.csrfTokenHash, sha256(csrfToken)))
    throw new ApiError(401, 'Invalid refresh session', 'INVALID_REFRESH_TOKEN');
  return session;
};

export const refresh =
  ({ config }) =>
  async (req, res, next) => {
    try {
      const session = await findCookieSession(req, config);
      if (session.revokedAt || session.expiresAt <= new Date()) {
        await RefreshSession.updateMany(
          { familyId: session.familyId, revokedAt: null },
          { $set: { revokedAt: new Date() } }
        );
        throw new ApiError(401, 'Invalid refresh session', 'INVALID_REFRESH_TOKEN');
      }
      const user = await User.findById(session.userId).select('+passwordHash');
      if (!user || !user.emailVerifiedAt) throw new ApiError(401, 'Invalid refresh session', 'INVALID_REFRESH_TOKEN');
      const nextSession = await createSession({ userId: user.id, config, req, familyId: session.familyId });
      session.revokedAt = new Date();
      session.replacedBy = nextSession.session.id;
      await session.save();
      const accessToken = await issueAccessToken({ user, sessionId: nextSession.session.id, config });
      res.cookie('refresh_token', nextSession.refreshToken, refreshCookieOptions(config));
      res.json({
        accessToken,
        expiresIn: config.accessTokenTtl,
        csrfToken: nextSession.csrfToken,
        user: userDto(user)
      });
    } catch (error) {
      next(error);
    }
  };

export const logout =
  ({ config }) =>
  async (req, res, next) => {
    try {
      const session = await findCookieSession(req, config);
      await RefreshSession.findByIdAndUpdate(session.id, { $set: { revokedAt: new Date() } });
      res.clearCookie('refresh_token', refreshCookieOptions(config));
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

export const requestPasswordReset =
  ({ config, mailer }) =>
  async (req, res, _next) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        const token = await createActionToken({ userId: user.id, type: 'password_reset', config });
        await sendActionEmail({ mailer, config, recipient: user.email, type: 'password_reset', token });
      }
      res.status(202).json(genericResetMessage);
    } catch (error) {
      req.log?.error({ err: error }, 'Password reset email could not be sent');
      res.status(202).json(genericResetMessage);
    }
  };

export const confirmPasswordReset = () => async (req, res, next) => {
  try {
    const action = await consumeActionToken({ token: req.body.token, type: 'password_reset' });
    if (!action) throw new ApiError(400, 'Reset token is invalid or expired', 'INVALID_ACTION_TOKEN');
    const user = await User.findById(action.userId);
    if (!user) throw new ApiError(400, 'Reset token is invalid or expired', 'INVALID_ACTION_TOKEN');
    user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    user.emailVerifiedAt = new Date();
    user.tokenVersion += 1;
    await user.save();
    await revokeUserSessions(user.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
