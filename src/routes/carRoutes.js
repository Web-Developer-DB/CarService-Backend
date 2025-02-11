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

const router = express.Router();

// Route zum Hinzufügen eines neuen Fahrzeugs
router.post('/addCar', authUser, createCar);

// Route zum Hinzufügen eines Kilometerstand-Eintrags
router.post('/:carId/kilometerstand',authUser, addKilometerstand);

// Route zum Hinzufügen eines TÜV-Eintrags
router.post('/:carId/tuev',authUser, addTuevEintrag);

// Route zum Hinzufügen eines Ölwechsel-Eintrags
router.post('/:carId/oelwechsel',authUser, addOelwechsel);

// Route zum Hinzufügen eines Service-Eintrags
router.post('/:carId/service',authUser,addService);

// Route zum Abrufen der Details eines Fahrzeugs
router.get('/:carId',authUser, getCarDetails);

// Route zum Abrufen aller Fahrzeuge, die einem Benutzer gehören
router.get('/user/:userId',authUser, getAllCarsForUser);

router.delete('/:carId',authUser, deleteCar);

export default router;


// Path: src/controllers/carController.js