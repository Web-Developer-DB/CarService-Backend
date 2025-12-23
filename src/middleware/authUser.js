
import jwt from 'jsonwebtoken';

const authUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Zugriff verweigert. Kein Token bereitgestellt.' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ message: 'Serverkonfiguration fehlt.' });
  }

  try {
    const options = {
      algorithms: ['HS256']
    };

    if (process.env.JWT_ISSUER) {
      options.issuer = process.env.JWT_ISSUER;
    }

    if (process.env.JWT_AUDIENCE) {
      options.audience = process.env.JWT_AUDIENCE;
    }

    const decoded = jwt.verify(token, secret, options);
    if (!decoded || !decoded.userId) {
      return res.status(403).json({ message: 'Ungültiger Token.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Ungültiger Token.' });
  }
};

export default authUser;
