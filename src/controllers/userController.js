
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';


// Benutzerregistrierung
export const registerUser = async (req, res) => {
  try {
    const { email, password, superPassword } = req.body;
    const normalizedEmail = email.toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(400).json({ message: 'Benutzer existiert bereits.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const hashedSuperPassword = await bcrypt.hash(superPassword, 12);


    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      superPassword: hashedSuperPassword,
    });

    res.status(201).json({ message: 'Benutzer erfolgreich registriert.', userId: user._id });
  } catch (error) {
    console.error('Fehler bei der Registrierung:', error);
    res.status(500).json({ message: 'Bei der Registrierung ist ein Fehler aufgetreten.' });
  }
};

// Benutzeranmeldung
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });


    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Anmeldung fehlgeschlagen.' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: 'Serverkonfiguration fehlt.' });
    }

    const signOptions = {
      expiresIn: '30d',
      algorithm: 'HS256'
    };

    if (process.env.JWT_ISSUER) {
      signOptions.issuer = process.env.JWT_ISSUER;
    }

    if (process.env.JWT_AUDIENCE) {
      signOptions.audience = process.env.JWT_AUDIENCE;
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, signOptions);

    res.json({ message: 'Anmeldung erfolgreich.', userId: user._id, token });
  } catch (error) {
    console.error('Fehler bei der Anmeldung:', error);
    res.status(500).json({ message: 'Bei der Anmeldung ist ein Fehler aufgetreten.' });
  }
};

// Passwortzurücksetzung mit Super Passwort
export const resetPassword = async (req, res) => {
  try {
    const { email, superPassword, newPassword } = req.body;
    const normalizedEmail = email.toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user || !(await bcrypt.compare(superPassword, user.superPassword))) {
      return res.status(401).json({ message: 'Passwortzurücksetzung fehlgeschlagen.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Passwort erfolgreich zurückgesetzt.' });
  } catch (error) {
    console.error('Fehler bei der Passwortzurücksetzung:', error);
    res.status(500).json({ message: 'Fehler bei der Passwortzurücksetzung.' });
  }
};

// Benutzerlöschung
export const deleteUser = async (req, res) => {
  try {
    const { email, superPassword } = req.body;
    const normalizedEmail = email.toLowerCase();
    const user = await User.findById(req.user.userId);

    if (!user || user.email !== normalizedEmail) {
      return res.status(403).json({ message: 'Benutzerlöschung fehlgeschlagen.' });
    }

    if (!user || !(await bcrypt.compare(superPassword, user.superPassword))) {
      return res.status(401).json({ message: 'Benutzerlöschung fehlgeschlagen.' });
    }

    await User.deleteOne({ _id: user._id });

    res.json({ message: 'Benutzer erfolgreich gelöscht.' });
  } catch (error) {
    console.error('Fehler bei der Benutzerlöschung:', error);
    res.status(500).json({ message: 'Fehler bei der Benutzerlöschung.' });
  }
};

// Benutzerdaten abrufen
export const getUserData = async (req, res) => {
  try {
    if (req.params.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Zugriff verweigert.' });
    }

    const user = await User.findById(req.params.userId).select('-password -superPassword');

    if (!user) {
      return res.status(404).json({ message: 'Benutzer nicht gefunden.' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Fehler beim Abrufen der Benutzerdaten:', error);
    res.status(500).json({ message: 'Fehler beim Abrufen der Benutzerdaten.' });
  }
};

// Benutzerdaten aktualisieren
export const updateUserData = async (req, res) => {
  try {
    const { email, superPassword, newPassword } = req.body;
    const normalizedEmail = email.toLowerCase();
    const user = await User.findById(req.user.userId);

    if (!user || user.email !== normalizedEmail) {
      return res.status(403).json({ message: 'Benutzerdatenaktualisierung fehlgeschlagen.' });
    }

    if (!user || !(await bcrypt.compare(superPassword, user.superPassword))) {
      return res.status(401).json({ message: 'Benutzerdatenaktualisierung fehlgeschlagen.' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Benutzerdaten erfolgreich aktualisiert.' });
  } catch (error) {
    console.error('Fehler bei der Benutzerdatenaktualisierung:', error);
    res.status(500).json({ message: 'Fehler bei der Benutzerdatenaktualisierung.' });
  }
};
