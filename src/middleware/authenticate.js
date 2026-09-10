import User from '../models/User.js';
import RefreshSession from '../models/RefreshSession.js';
import { ApiError } from './errors.js';
import { verifyAccessToken } from '../services/accessTokens.js';

export const authenticate = (config) => async (req, _res, next) => {
  try {
    const [scheme, token] = (req.get('authorization') || '').split(' ');
    if (scheme !== 'Bearer' || !token) throw new ApiError(401, 'Access token is required', 'ACCESS_TOKEN_REQUIRED');
    const claims = await verifyAccessToken(token, config);
    const user = await User.findById(claims.sub).select('+passwordHash');
    if (!user || !user.emailVerifiedAt || user.tokenVersion !== claims.tokenVersion)
      throw new ApiError(401, 'Invalid or expired access token', 'INVALID_ACCESS_TOKEN');
    const session = await RefreshSession.findOne({
      _id: claims.sessionId,
      userId: user.id,
      revokedAt: null,
      expiresAt: { $gt: new Date() }
    });
    if (!session) throw new ApiError(401, 'Invalid or expired access token', 'INVALID_ACCESS_TOKEN');
    req.auth = { user, session, claims };
    next();
  } catch (error) {
    next(error);
  }
};
