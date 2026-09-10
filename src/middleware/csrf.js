import { ApiError } from './errors.js';
import { safeEqualHash, sha256 } from '../services/crypto.js';

export const requireCsrf = (config) => (req, _res, next) => {
  const origin = req.get('origin');
  const token = req.get('x-csrf-token');
  if (
    !origin ||
    !config.corsOrigins.includes(origin) ||
    !token ||
    !req.auth?.session ||
    !safeEqualHash(req.auth.session.csrfTokenHash, sha256(token))
  ) {
    return next(new ApiError(403, 'CSRF validation failed', 'CSRF_FAILED'));
  }
  return next();
};
