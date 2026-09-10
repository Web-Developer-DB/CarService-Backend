import ActionToken from '../models/ActionToken.js';
import { randomToken, sha256 } from './crypto.js';

export const createActionToken = async ({ userId, type, config }) => {
  await ActionToken.updateMany({ userId, type, consumedAt: null }, { $set: { consumedAt: new Date() } });
  const token = randomToken();
  await ActionToken.create({
    userId,
    type,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + config.actionTokenTtlMinutes * 60 * 1000)
  });
  return token;
};

export const consumeActionToken = async ({ token, type }) =>
  ActionToken.findOneAndUpdate(
    { tokenHash: sha256(token), type, consumedAt: null, expiresAt: { $gt: new Date() } },
    { $set: { consumedAt: new Date() } },
    { new: true }
  );
