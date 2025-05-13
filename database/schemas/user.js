import mongoose from 'mongoose';
import cardSchema from './card.js';

// Valida che l'email sia nel formato corretto
const emailValidator = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

// Schema dell'utente
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [emailValidator, 'Email non valida']
  },
  username: {
    type: String,
    required: true,
    minlength: [3, 'Il nome utente deve essere lungo almeno 3 caratteri'],
    maxlength: [30, 'Il nome utente non può essere più lungo di 30 caratteri']
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: [60, 'La password hash non è valida'],
  },
  salt: {
    type: String,
    required: true,
    minlength: [16, 'Il salt deve essere lungo almeno 16 caratteri']
  },
  favoriteCharacter: {
    type: String,
    required: false,
    default: 'Nessuno',
  },
  birthdate: {
    type: Date,
    required: true,
    validate: {
      validator: (v) => v instanceof Date && !isNaN(v),
      message: 'Data di nascita non valida'
    }
  },
  country: {
    type: String,
    required: true,
  },
  credits: {
    type: Number,
    required: true,
    default: 0,
  },
  cards: {
    type: Map,
    of: cardSchema,
    required: true,
    default: new Map(),
  }
}, {
  timestamps: true, // Aggiunge createdAt e updatedAt
  toJSON: { // cancella i campi passwordHash e salt quando il documento viene trasformato in JSON (ad esempio per l'invio al client con le api)
    transform: function (doc, ret) {
      delete ret.passwordHash;
      delete ret.salt;
      return ret;
    }
  },
});

const User = mongoose.model('User', userSchema);

export default User;