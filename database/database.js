import mongoose from 'mongoose';
import { config } from 'dotenv';

// Carica le variabili d'ambiente dal file .env
config({ path: '.env' });

// Ottieni l'URI del database dalle variabili d'ambiente
const dbURI = process.env.MONGODB_URI;

if (!dbURI) {
  throw new Error('L\'URI del database non è definita. Assicurati di avere un file .env con MONGODB_URI.');
}

// Connessione al database
mongoose.connect(dbURI)
  .then(() => {
    console.log('Connessione al database riuscita');
  })
  .catch((error) => {
    console.error('Errore di connessione al database:', error);
  });

// Esporta la connessione per poterla utilizzare in altri file
export default mongoose.connection;