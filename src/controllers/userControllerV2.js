import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import ActionToken from '../models/ActionToken.js';
import Car from '../models/Car.js';
import RefreshSession from '../models/RefreshSession.js';
import User from '../models/User.js';
import VehicleEvent from '../models/VehicleEvent.js';
import { ApiError } from '../middleware/errors.js';
import { revokeUserSessions } from '../services/sessions.js';

const userDto = (user) => ({
  id: user.id,
  email: user.email,
  emailVerifiedAt: user.emailVerifiedAt,
  createdAt: user.createdAt
});

export const getMe = async (req, res) => res.json({ user: userDto(req.auth.user) });

export const changePassword = async (req, res, next) => {
  try {
    const { user } = req.auth;
    if (!(await bcrypt.compare(req.body.currentPassword, user.passwordHash)))
      throw new ApiError(401, 'Current password is incorrect', 'INVALID_CREDENTIALS');
    user.passwordHash = await bcrypt.hash(req.body.newPassword, 12);
    user.tokenVersion += 1;
    await user.save();
    await revokeUserSessions(user.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const deleteMe = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    const { user } = req.auth;
    if (!(await bcrypt.compare(req.body.currentPassword, user.passwordHash)))
      throw new ApiError(401, 'Current password is incorrect', 'INVALID_CREDENTIALS');
    await session.withTransaction(async () => {
      const cars = await Car.find({ userId: user.id }).select('_id').session(session);
      const carIds = cars.map((car) => car.id);
      await VehicleEvent.deleteMany({ carId: { $in: carIds } }, { session });
      await Car.deleteMany({ userId: user.id }, { session });
      await RefreshSession.deleteMany({ userId: user.id }, { session });
      await ActionToken.deleteMany({ userId: user.id }, { session });
      await User.deleteOne({ _id: user.id }, { session });
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};
