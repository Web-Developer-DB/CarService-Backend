import { SignJWT, jwtVerify } from 'jose';
import { ApiError } from '../middleware/errors.js';

const key = (config) => new TextEncoder().encode(config.ACCESS_TOKEN_SECRET);

export const issueAccessToken = async ({ user, sessionId, config }) =>
  new SignJWT({
    tokenType: 'access',
    sessionId: sessionId.toString(),
    tokenVersion: user.tokenVersion
  })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(user.id)
    .setIssuer(config.JWT_ISSUER)
    .setAudience(config.JWT_AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(config.accessTokenTtl)
    .sign(key(config));

export const verifyAccessToken = async (token, config) => {
  try {
    const { payload } = await jwtVerify(token, key(config), {
      algorithms: ['HS256'],
      issuer: config.JWT_ISSUER,
      audience: config.JWT_AUDIENCE,
      typ: 'JWT'
    });
    if (payload.tokenType !== 'access' || !payload.sub || !payload.sessionId || !Number.isInteger(payload.tokenVersion))
      throw new Error('Invalid token claims');
    return payload;
  } catch {
    throw new ApiError(401, 'Invalid or expired access token', 'INVALID_ACCESS_TOKEN');
  }
};
