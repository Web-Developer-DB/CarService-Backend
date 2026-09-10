import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

export const randomToken = () => randomBytes(48).toString('base64url');
export const sha256 = (value) => createHash('sha256').update(value).digest('hex');
export const safeEqualHash = (left, right) => {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
};
