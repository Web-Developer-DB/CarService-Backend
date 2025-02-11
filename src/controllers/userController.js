import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Benutzerregistrierung
export const registerUser = async (req, res) => {
  try {
    const { email, password, superPassword } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: 'Benutzer existiert bereits.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const hashedSuperPassword = await bcrypt.hash(superPassword, 12);


    const user = await User.create({
      email,
      password: hashedPassword,
      superPassword: hashedSuperPassword,
    });

    res.status(201).json({ message: 'Benutzer erfolgreich registriert.', userId: user._id });
  } catch (error) {
    res.status(500).json({ message: 'Bei der Registrierung ist ein Fehler aufgetreten.'+ error.message });
  }
};

// Benutzeranmeldung
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });


    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Anmeldung fehlgeschlagen.' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    res.json({ message: 'Anmeldung erfolgreich.', userId: user._id, token });
  } catch (error) {
    res.status(500).json({ message: 'Bei der Anmeldung ist ein Fehler aufgetreten.'+error.message });
  }
};

// Passwortzurücksetzung mit Super Passwort
export const resetPassword = async (req, res) => {
  try {
    const { email, superPassword, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(superPassword, user.superPassword))) {
      return res.status(401).json({ message: 'Passwortzurücksetzung fehlgeschlagen.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Passwort erfolgreich zurückgesetzt.' });
  } catch (error) {
    res.status(500).json({ message: 'Fehler bei der Passwortzurücksetzung.'+error.message });
  }
};

// Benutzerlöschung
export const deleteUser = async (req, res) => {
  try {
    const { email, superPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(superPassword, user.superPassword))) {
      return res.status(401).json({ message: 'Benutzerlöschung fehlgeschlagen.' });
    }

    await User.deleteOne({ email });

    res.json({ message: 'Benutzer erfolgreich gelöscht.' });
  } catch (error) {
    res.status(500).json({ message: 'Fehler bei der Benutzerlöschung.' +error.message});
  }
};

// Benutzerdaten abrufen
export const getUserData = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
    }

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Fehler beim Abrufen der Benutzerdaten.'+error.message });
  }
};

// Benutzerdaten aktualisieren
export const updateUserData = async (req, res) => {
  try {
    const { email, superPassword, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(superPassword, user.superPassword))) {
      return res.status(401).json({ message: 'Benutzerdatenaktualisierung fehlgeschlagen.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Benutzerdaten erfolgreich aktualisiert.' });
  } catch (error) {
    res.status(500).json({ message: 'Fehler bei der Benutzerdatenaktualisierung.' + error.message});
  }
};
