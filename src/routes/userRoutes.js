import express from 'express';
import {
  registerUser,
  loginUser,
  resetPassword,
  deleteUser,
  getUserData,
  updateUserData
} from '../controllers/userController.js';
import authUser from '../middleware/authUser.js';
import { validateBody, validateParams } from '../middleware/validate.js';
import {
  registerSchema,
  loginSchema,
  resetPasswordSchema,
  deleteUserSchema,
  updateUserSchema,
  userIdParamSchema
} from '../validation/schemas.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

// Registrierung eines neuen Benutzers
router.post('/register', authLimiter, validateBody(registerSchema), registerUser);

// Anmeldung eines Benutzers
router.post('/login', authLimiter, validateBody(loginSchema), loginUser);

// Passwort mit Super Passwort zurücksetzen
router.post('/reset-password', authLimiter, validateBody(resetPasswordSchema), resetPassword);

// Benutzer löschen
router.delete('/delete-user', authUser, validateBody(deleteUserSchema), deleteUser);

// Benutzerdaten abrufen
router.get('/:userId', authUser, validateParams(userIdParamSchema), getUserData);

// Benutzerdaten aktualisieren
router.put('/update-user', authUser, validateBody(updateUserSchema), updateUserData);


export default router;

// Path: src/controllers/UserController.js
