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

const router = express.Router();

// Registrierung eines neuen Benutzers
router.post('/register', registerUser);

// Anmeldung eines Benutzers
router.post('/login', loginUser);

// Passwort mit Super Passwort zurücksetzen
router.post('/reset-password', resetPassword); 

// Benutzer löschen
router.delete('/delete-user', authUser,deleteUser); //

// Benutzerdaten abrufen
router.get('/:userId',authUser, getUserData); 

// Benutzerdaten aktualisieren
router.put('/update-user',authUser, updateUserData);


export default router;

// Path: src/controllers/UserController.js