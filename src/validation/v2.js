import Joi from 'joi';

const objectId = Joi.string().hex().length(24);
const password = Joi.string().min(12).max(128).pattern(/[a-z]/).pattern(/[A-Z]/).pattern(/[0-9]/).required();
const email = Joi.string().email().max(254).trim().lowercase().required();
const cursor = Joi.string().hex().length(24);

export const schemas = {
  register: Joi.object({ email, password }),
  emailRequest: Joi.object({ email }),
  login: Joi.object({ email, password: Joi.string().max(128).required() }),
  actionToken: Joi.object({
    token: Joi.string()
      .pattern(/^[A-Za-z0-9_-]{32,128}$/)
      .required()
  }),
  passwordReset: Joi.object({
    token: Joi.string()
      .pattern(/^[A-Za-z0-9_-]{32,128}$/)
      .required(),
    newPassword: password
  }),
  changePassword: Joi.object({ currentPassword: Joi.string().max(128).required(), newPassword: password }),
  deleteAccount: Joi.object({ currentPassword: Joi.string().max(128).required() }),
  carId: Joi.object({ carId: objectId.required() }),
  list: Joi.object({ limit: Joi.number().integer().min(1).max(50).default(20), after: cursor.optional() }),
  eventList: Joi.object({
    limit: Joi.number().integer().min(1).max(50).default(20),
    after: cursor.optional(),
    type: Joi.string().valid('mileage', 'inspection', 'oil_change', 'service').optional()
  }),
  car: Joi.object({
    vehicleType: Joi.string().trim().max(80).optional(),
    licensePlate: Joi.string().trim().max(20).required(),
    make: Joi.string().trim().max(80).optional(),
    model: Joi.string().trim().max(80).optional(),
    year: Joi.number().integer().min(1886).max(2100).optional(),
    fuelType: Joi.string().trim().max(40).optional(),
    emissionClass: Joi.string().trim().max(40).optional(),
    powerKw: Joi.number().integer().min(0).max(2000).optional(),
    powerPs: Joi.number().integer().min(0).max(3000).optional(),
    odometerKm: Joi.number().integer().min(0).max(10_000_000).default(0),
    nextInspectionAt: Joi.date().iso().optional(),
    nextOilChangeAt: Joi.date().iso().optional(),
    nextOilChangeKm: Joi.number().integer().min(0).max(10_000_000).optional()
  }),
  carPatch: Joi.object({
    vehicleType: Joi.string().trim().max(80),
    licensePlate: Joi.string().trim().max(20),
    make: Joi.string().trim().max(80),
    model: Joi.string().trim().max(80),
    year: Joi.number().integer().min(1886).max(2100),
    fuelType: Joi.string().trim().max(40),
    emissionClass: Joi.string().trim().max(40),
    powerKw: Joi.number().integer().min(0).max(2000),
    powerPs: Joi.number().integer().min(0).max(3000),
    nextInspectionAt: Joi.date().iso(),
    nextOilChangeAt: Joi.date().iso(),
    nextOilChangeKm: Joi.number().integer().min(0).max(10_000_000)
  }).min(1),
  event: Joi.alternatives()
    .match('one')
    .try(
      Joi.object({
        type: Joi.valid('mileage').required(),
        occurredAt: Joi.date()
          .iso()
          .default(() => new Date()),
        odometerKm: Joi.number().integer().min(0).max(10_000_000).required()
      }),
      Joi.object({
        type: Joi.valid('inspection').required(),
        occurredAt: Joi.date().iso().required(),
        note: Joi.string().trim().max(500).allow('').optional()
      }),
      Joi.object({
        type: Joi.valid('oil_change').required(),
        occurredAt: Joi.date().iso().required(),
        odometerKm: Joi.number().integer().min(0).max(10_000_000).required(),
        nextOilChangeKm: Joi.number().integer().min(0).max(10_000_000).optional()
      }),
      Joi.object({
        type: Joi.valid('service').required(),
        occurredAt: Joi.date().iso().required(),
        description: Joi.string().trim().max(1000).required()
      })
    )
};
