import User from '../../database/schemas/user.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';

import { createPack } from './harryPotter.js';

// Carica le variabili d'ambiente dal file .env
config({ path: '../../env' });

// Creazione di un nuovo utente
export const createUser = async (req, res) => {
  try {
    const { email, username, password, favoriteCharacter, birthdate, country } = req.body;

    if (!password || typeof password !== "string" || password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      return res.status(400).json({ error: 'La password deve essere lunga almeno 8 caratteri e contenere almeno una lettera maiuscola, una minuscola e un numero' });
    }
    
    // Genera un salt casuale
    const salt = crypto.randomBytes(16).toString('hex');

    // Hash sicuro della password con PBKDF2
    const passwordHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
    
    const newUser = new User({ 
      email, 
      username, 
      passwordHash, 
      salt,
      favoriteCharacter, 
      birthdate, 
      country 
    });
    
    await newUser.save();
    
    // Genera un token JWT
    const token = jwt.sign({ id: newUser._id, email: newUser.email }, process.env.JWT_SECRET);
    
    // Imposta il token JWT come cookie nella risposta
    res.cookie('token', token, { 
      httpOnly: true,
      secure: true,
    });
    res.status(201).json({ message: 'Utente creato con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Handler per il login dell'utente
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Email non valida' });
    }

    // Hash della password inserita con lo stesso salt
    const passwordHash = crypto.pbkdf2Sync(password, user.salt, 100000, 64, 'sha256').toString('hex');
    
    if(user.passwordHash !== passwordHash) {
      return res.status(401).json({ error: 'Password non valida' });
    }

    // Genera un token JWT
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET);

    // Imposta il token JWT come cookie nella risposta
    res.cookie('token', token, { 
      httpOnly: true,
      secure: true,
    });
    res.status(200).json({ message: 'Login effetuato con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Ottiene i dati del profilo che fa la richiesta
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Aggiornare un utente
export const updateUser = async (req, res) => {
  try {
    const { username, email, password, favoriteCharacter, birthdate, country } = req.body;

    if (password && (typeof password !== "string" || password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password))) {
      return res.status(400).json({ error: 'La password deve essere lunga almeno 8 caratteri e contenere almeno una lettera maiuscola, una minuscola e un numero' });
    }
    
    var update = { username, email, favoriteCharacter, birthdate, country };

    if(password) {
      // Genera un salt casuale
      const salt = crypto.randomBytes(16).toString('hex');
      // Hash sicuro della password con PBKDF2
      const passwordHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha256').toString('hex');
      update = { ...update, passwordHash, salt };
    }

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true, runValidators: true });
  
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.status(200).json({ message: 'Profilo aggiornato con successo' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Cancellare un utente
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    res.status(200).json({ message: 'Utente cancellato con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Compra crediti per un utente
export const buyCredits = async (req, res) => {
  var { credits, creditCard, cvc, expirationCreditCard  } = req.body;
  if(!creditCard || !cvc || !expirationCreditCard) {
    return res.status(400).json({ error: 'Dati carta di credito non validi' });
  }
  credits = parseInt(credits);
  if(!credits || isNaN(credits) || credits < 0) {
    return res.status(400).json({ error: 'Crediti non validi' });
  }

  var user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }

  user = await User.findByIdAndUpdate(req.user.id, { credits: user.credits + credits }, { new: true });

  if (!user) {
    return res.status(404).json({ error: 'Utente non trovato' });
  }

  res.status(200).json({ message: 'Crediti aggiornati con successo' });
}

// Compra un pacchetto
export const buyPackage = async (req, res) => {
  try {
    let { packId } = req.params;
    packId = parseInt(packId);

    // Definizione dei prezzi e del numero di carte per ogni pacchetto
    let price, cardCount;
    switch (packId) {
      case 1:
        price = 1;
        cardCount = 5;
        break;
      case 2:
        price = 2;
        cardCount = 12;
        break;
      case 3:
        price = 3;
        cardCount = 20;
        break;
      default:
        return res.status(400).json({ error: 'Pacchetto non valido' });
    }

    // Trova l'utente nel database
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    // Controlla se l'utente ha crediti sufficienti
    if (user.credits < price) {
      return res.status(400).json({ error: 'Crediti insufficienti' });
    }

    const pack = await createPack(cardCount);

    if(!pack) {
      return res.status(500).json({ error: 'Errore durante l\'acquisto del pacchetto' });
    }

    // Aggiorna i crediti e le carte dell'utente
    user.credits -= price;
    pack.forEach(card => {
      var id = card.id.toString();
      var userCard = user.cards.get(id);
      if(userCard) {
        userCard.copy += 1;
        user.cards.set(id, userCard);
      } else {
        card.copy = 1;
        user.cards.set(id, card);
      }
    });

    await user.save();

    // Rispondi con il pacchetto acquistato
    res.status(200).json(pack);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante l\'acquisto del pacchetto' });
  }
};

// Ottieni le carte dell'utente
export const getUserCards = async (req, res) => {
  try {
    const { email } = req.params;
    var user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    res.status(200).json(user.cards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Vendi carte dell'utente
export const sellUserCards = async (req, res) => {
  try {
    const { cardIds } = req.body;
    if(!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({ error: 'Carte non valide' });
    }

    var user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    cardIds.forEach(cardId => {
      if(user.cards.has(cardId)) {
        var userCard = user.cards.get(cardId);
        userCard.copy--;
        if(userCard.copy <= 0) {
          user.cards.delete(cardId);
        } else {
          user.cards.set(cardId, userCard);
        }
      } else {
        return res.status(400).json({ error: 'Non disponi delle carte che vuoi vendere' });
      }
    });

    user.credits += cardIds.length;
    await user.save();
    res.status(200).json({ message: 'Carte vendute con successo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
