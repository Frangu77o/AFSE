import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

config({ path: '../../env' });

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware per verificare la validità del token JWT.
 * Se il token è valido, aggiunge le informazioni dell'utente alla richiesta e chiama next().
 * Se il token non è valido, restituisce un errore 401.
 */
export const authenticate = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Accesso negato. Nessun token fornito.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token non valido.' });
  }
};