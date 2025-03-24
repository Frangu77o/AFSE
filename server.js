import https from 'https';
import express from 'express';
import fs from 'fs';
import path from 'path';
import db from './database/database.js';
import apiRoutes from './backEnd/routes.js';
import cors from 'cors';
import { fileURLToPath } from 'url';
import 'dotenv/config';


// Ottieni il percorso della directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Leggi hostname e port da variabili di ambiente o usa valori di default
const hostname = process.env.HOSTNAME;
const port = process.env.PORT;

// Percorsi dei certificati
const key = fs.readFileSync('./certificate/private-key.pem', 'utf8');
const cert = fs.readFileSync('./certificate/certificate.pem', 'utf8');
const passphrase = process.env.PASSPHRASE;

// Crea l'app Express
const app = express();

// Abilita CORS
app.use(cors());

// Impostazioni HTTPS
const options = { key, cert, passphrase };

// Servire i file statici del frontend dalla cartella /frontend
app.use(express.static(path.join(__dirname, 'FrontEnd')));

// Importa e usa le rotte dell'API (queste si trovano nella cartella /api/routes.js)
app.use('/api', apiRoutes);

// Redirect alla home page
app.get('/', (req, res) => {
    res.writeHead(302, { 'Location': 'html/home.html' });
    res.end();
});

// redirect a 404.html per tutte le altre richieste
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'FrontEnd', 'html', '404.html')); // Usa il percorso assoluto per 404.html
});

// Avvia il server HTTPS dopo aver stabilito la connessione al database
db.on('connected', () => {
    https.createServer(options, app).listen(port, hostname, () => {
        console.log(`Server HTTPS in esecuzione su https://${hostname}:${port}`);
    });
});
