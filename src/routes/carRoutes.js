import express from 'express';
import authUser from '../middleware/authUser.js';
import { createCar,
        addKilometerstand,
        addTuevEintrag,
        addOelwechsel,
        addService,
        getCarDetails,
        getAllCarsForUser,
        deleteCar

        } from '../controllers/carController.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import {
  createCarSchema,
  kilometerstandSchema,
  tuevSchema,
  oelwechselSchema,
  serviceSchema,
  carIdParamSchema,
  userIdParamSchema
} from '../validation/schemas.js';

const router = express.Router();

// Route zum Hinzufügen eines neuen Fahrzeugs
router.post('/addCar', authUser, validateBody(createCarSchema), createCar);

// Route zum Hinzufügen eines Kilometerstand-Eintrags
router.post('/:carId/kilometerstand', authUser, validateParams(carIdParamSchema), validateBody(kilometerstandSchema), addKilometerstand);

// Route zum Hinzufügen eines TÜV-Eintrags
router.post('/:carId/tuev', authUser, validateParams(carIdParamSchema), validateBody(tuevSchema), addTuevEintrag);

// Route zum Hinzufügen eines Ölwechsel-Eintrags
router.post('/:carId/oelwechsel', authUser, validateParams(carIdParamSchema), validateBody(oelwechselSchema), addOelwechsel);

// Route zum Hinzufügen eines Service-Eintrags
router.post('/:carId/service', authUser, validateParams(carIdParamSchema), validateBody(serviceSchema), addService);

// Route zum Abrufen aller Fahrzeuge, die einem Benutzer gehören
router.get('/user/:userId', authUser, validateParams(userIdParamSchema), getAllCarsForUser);

// Route zum Abrufen der Details eines Fahrzeugs
router.get('/:carId', authUser, validateParams(carIdParamSchema), getCarDetails);

router.delete('/:carId', authUser, validateParams(carIdParamSchema), deleteCar);

export default router;


// Path: src/controllers/carController.js
