import { config } from 'dotenv';
import { createHash } from 'crypto';

config({ path: '../../.env' });

const publicKey = process.env.MARVEL_PUBLIC_KEY;
const privateKey = process.env.MARVEL_PRIVATE_KEY;

const baseUrl = "https://gateway.marvel.com/v1/public/characters";


// controller che gestisce la richiesta di un supereroe specifico
export async function getSuperHero(req, res) {
    try {
        let { id } = req.params;
        const ts = new Date().getTime();
        const hash = createHash('md5').update(ts+privateKey+publicKey).digest('hex')
        const response = await fetch(`${baseUrl}/${id}?ts=${ts}&apikey=${publicKey}&hash=${hash}`);
        const data = await response.json();
        if(!data || !data.data || !data.data.results || data.data.results.length === 0) {
            res.status(404).json({ error: 'Supereroe non trovato' });
        } else {
            console.log(`${baseUrl}/${id}?ts=${ts}&apikey=${publicKey}&hash=${hash}`);
            res.status(200).json(data.data.results[0]);
        }
    } catch (error) {
        res.status(500).json({ error: 'Errore interno' });
    }
}


// Funzione per ottenere tutti i supereroi
export async function getAllSuperHero() {
    try {
        const ts = new Date().getTime();
        const hash = createHash('md5').update(ts+privateKey+publicKey).digest('hex');
        const response = await fetch(`${baseUrl}?ts=${ts}&apikey=${publicKey}&hash=${hash}`);
        const data = await response.json();
        return data?.data?.results || null; 
    } catch (error) {
        console.log(error);
        return null;
    }
}