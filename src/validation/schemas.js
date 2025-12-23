import Joi from 'joi';

export const objectIdSchema = Joi.string().hex().length(24);

export const registerSchema = Joi.object({
  email: Joi.string().email().max(254).required(),
  password: Joi.string().min(8).max(128).required(),
  superPassword: Joi.string().min(8).max(128).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().email().max(254).required(),
  password: Joi.string().min(8).max(128).required()
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().max(254).required(),
  superPassword: Joi.string().min(8).max(128).required(),
  newPassword: Joi.string().min(8).max(128).required()
});

export const updateUserSchema = Joi.object({
  email: Joi.string().email().max(254).required(),
  superPassword: Joi.string().min(8).max(128).required(),
  newPassword: Joi.string().min(8).max(128).required()
});

export const deleteUserSchema = Joi.object({
  email: Joi.string().email().max(254).required(),
  superPassword: Joi.string().min(8).max(128).required()
});

export const userIdParamSchema = Joi.object({
  userId: objectIdSchema.required()
});

export const carIdParamSchema = Joi.object({
  carId: objectIdSchema.required()
});

export const createCarSchema = Joi.object({
  userId: objectIdSchema.optional(),
  fahrzeugart: Joi.string().trim().max(80).optional(),
  kennzeichen: Joi.string().trim().max(20).required(),
  marke: Joi.string().trim().max(80).optional(),
  modell: Joi.string().trim().max(80).optional(),
  baujahr: Joi.number().integer().min(1886).max(2100).optional(),
  kraftstoff: Joi.string().trim().max(40).optional(),
  schadstoffklasse: Joi.string().trim().max(40).optional(),
  leistungKW: Joi.number().integer().min(0).max(2000).optional(),
  leistungPS: Joi.number().integer().min(0).max(3000).optional(),
  kilometerstand: Joi.number().integer().min(0).optional(),
  nächsteTüvUntersuchung: Joi.date().optional(),
  nächsteoelwechsel: Joi.date().optional(),
  nächsteoelwechselKm: Joi.number().integer().min(0).optional()
});

export const kilometerstandSchema = Joi.object({
  kilometerstand: Joi.number().integer().min(0).required()
});

export const tuevSchema = Joi.object({
  tuev: Joi.object({
    datum: Joi.date().required(),
    bemerkung: Joi.string().trim().max(500).optional()
  }).required()
});

export const oelwechselSchema = Joi.object({
  oelwechsel: Joi.object({
    datum: Joi.date().required(),
    kilometerstand: Joi.number().integer().min(0).required(),
    naechsterOelwechselKm: Joi.number().integer().min(0).optional()
  }).required()
});

export const serviceSchema = Joi.object({
  service: Joi.object({
    datum: Joi.date().required(),
    beschreibung: Joi.string().trim().max(1000).required()
  }).required()
});
