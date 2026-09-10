import mongoose from 'mongoose';
import Car from '../models/Car.js';
import VehicleEvent from '../models/VehicleEvent.js';
import { ApiError } from '../middleware/errors.js';

const carDto = (car) => ({
  id: car.id,
  vehicleType: car.vehicleType,
  licensePlate: car.licensePlate,
  make: car.make,
  model: car.model,
  year: car.year,
  fuelType: car.fuelType,
  emissionClass: car.emissionClass,
  powerKw: car.powerKw,
  powerPs: car.powerPs,
  odometerKm: car.odometerKm,
  nextInspectionAt: car.nextInspectionAt,
  nextOilChangeAt: car.nextOilChangeAt,
  nextOilChangeKm: car.nextOilChangeKm,
  createdAt: car.createdAt,
  updatedAt: car.updatedAt
});
const normalizePlate = (plate) => plate.replace(/\s+/g, '').toUpperCase();
const page = (items, limit) => ({ items, nextCursor: items.length === limit ? items.at(-1).id : null });

export const createCar = async (req, res, next) => {
  try {
    const car = await Car.create({
      ...req.body,
      licensePlateNormalized: normalizePlate(req.body.licensePlate),
      userId: req.auth.user.id
    });
    res.status(201).json({ car: carDto(car) });
  } catch (error) {
    next(error);
  }
};

export const listCars = async (req, res, next) => {
  try {
    const filter = { userId: req.auth.user.id };
    if (req.query.after) filter._id = { $lt: req.query.after };
    const cars = await Car.find(filter).sort({ _id: -1 }).limit(req.query.limit).lean();
    res.json(
      page(
        cars.map((car) => carDto({ ...car, id: car._id.toString() })),
        req.query.limit
      )
    );
  } catch (error) {
    next(error);
  }
};

export const getCar = async (req, res, next) => {
  try {
    const car = await Car.findOne({ _id: req.params.carId, userId: req.auth.user.id }).lean();
    if (!car) throw new ApiError(404, 'Car not found', 'CAR_NOT_FOUND');
    res.json({ car: carDto({ ...car, id: car._id.toString() }) });
  } catch (error) {
    next(error);
  }
};

export const updateCar = async (req, res, next) => {
  try {
    const update = { ...req.body };
    if (update.licensePlate) update.licensePlateNormalized = normalizePlate(update.licensePlate);
    const car = await Car.findOneAndUpdate(
      { _id: req.params.carId, userId: req.auth.user.id },
      { $set: update },
      { new: true, runValidators: true }
    );
    if (!car) throw new ApiError(404, 'Car not found', 'CAR_NOT_FOUND');
    res.json({ car: carDto(car) });
  } catch (error) {
    next(error);
  }
};

export const deleteCar = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const car = await Car.findOneAndDelete({ _id: req.params.carId, userId: req.auth.user.id }, { session });
      if (!car) throw new ApiError(404, 'Car not found', 'CAR_NOT_FOUND');
      await VehicleEvent.deleteMany({ carId: car.id }, { session });
    });
    res.status(204).end();
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

export const addEvent = async (req, res, next) => {
  const session = await mongoose.startSession();
  try {
    let event;
    await session.withTransaction(async () => {
      const car = await Car.findOne({ _id: req.params.carId, userId: req.auth.user.id }).session(session);
      if (!car) throw new ApiError(404, 'Car not found', 'CAR_NOT_FOUND');
      if ((req.body.type === 'mileage' || req.body.type === 'oil_change') && req.body.odometerKm < car.odometerKm)
        throw new ApiError(409, 'Odometer value cannot decrease', 'ODOMETER_DECREASE');
      if (req.body.type === 'mileage') car.odometerKm = req.body.odometerKm;
      await car.save({ session });
      [event] = await VehicleEvent.create([{ ...req.body, carId: car.id, userId: req.auth.user.id }], { session });
    });
    res.status(201).json({ event });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

export const listEvents = async (req, res, next) => {
  try {
    const car = await Car.exists({ _id: req.params.carId, userId: req.auth.user.id });
    if (!car) throw new ApiError(404, 'Car not found', 'CAR_NOT_FOUND');
    const filter = { carId: req.params.carId, userId: req.auth.user.id };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.after) filter._id = { $lt: req.query.after };
    const events = await VehicleEvent.find(filter).sort({ _id: -1 }).limit(req.query.limit).lean();
    res.json(
      page(
        events.map((event) => ({ ...event, id: event._id.toString() })),
        req.query.limit
      )
    );
  } catch (error) {
    next(error);
  }
};
