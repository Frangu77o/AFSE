import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import yaml from 'js-yaml';
import cookieParser from 'cookie-parser';

import { createUser, loginUser, getUser, updateUser, deleteUser, buyCredits, buyPackage, getUserCards, sellUserCards } from './controllers/users.js';
import { newTrade, getTrades, acceptTrade, rejectTrade, cancelTrade } from './controllers/trade.js';
import { getCharacter } from './controllers/harryPotter.js';
import { authenticate } from './middleware/auth.js';


const swaggerDocument =  yaml.load(fs.readFileSync('./docs/api.yaml', 'utf8'));

const router = express.Router();
router.use(express.json());
router.use(cookieParser());

// Rotte per la documentazione
router.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Rotte per gestire gli utenti
router.post('/user', createUser);
router.get('/user', authenticate, getUser);
router.put('/user', authenticate,  updateUser);
router.delete('/user', authenticate, deleteUser);
router.post('/user/login', loginUser);
router.post('/user/logout', authenticate, (req, res) => {
    res.status(200).clearCookie('token').send('Logout effettuato');
});
router.put('/user/credits', authenticate, buyCredits);
router.put('/user/buy-package/:packId', authenticate, buyPackage);
router.get('/user/cards/:email', getUserCards);
router.put('/user/sell-cards', authenticate, sellUserCards);


// Rotte per gestire gli scambi
router.post('/trade', authenticate, newTrade);
router.get('/trades', authenticate, getTrades);
router.put('/trade/:tradeId/accept', authenticate, acceptTrade);
router.put('/trade/:tradeId/reject', authenticate, rejectTrade);
router.delete('/trade/:tradeId/cancel', authenticate, cancelTrade);

// Rotte per gestire i perosnaggi di Harry Potter
router.get('/character/:id', getCharacter);

// 404 per le root api
router.use((req, res) => {
    res.status(404).send('404 Not Found');
});

export default router;