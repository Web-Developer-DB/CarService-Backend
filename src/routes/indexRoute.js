import express from 'express';
import userRoutes from './userRoutes.js';
import carRoutes from './carRoutes.js';


const router = express.Router();

router.use('/users', userRoutes);
router.use('/cars', carRoutes);

export default router;

// Path: backend/src/routes/userRoutes.js