// middleware/authUser.js
import jwt from 'jsonwebtoken';

const authUser = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Zugriff verweigert. Kein Token bereitgestellt.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Ungültiger Token.' });
    }
    req.user = decoded;
    next();
  });
};

export default authUser;
