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
            res.status(200).json(data.data.results[0]);
        }
    } catch (error) {
        res.status(500).json({ error: 'Errore interno' });
    }
}


// Funzione per ottenere i supereroi con offset e limit
async function getAllSuperHero(offset = 0, limit = 100) {
    try {
        const ts = new Date().getTime();
        const hash = createHash('md5').update(ts+privateKey+publicKey).digest('hex');
        const response = await fetch(`${baseUrl}?ts=${ts}&apikey=${publicKey}&hash=${hash}&offset=${offset}&limit=${limit}`);

        if(response.ok) {
            const data = await response.json();
            if (!data || !data.data || !data.data.results) {
                return null;
            } else {
                var { offset, limit, total } = data.data;
                return {heroes: filterSuperHeroes(data.data.results), offset, limit, total};
            }
        }
        return null;
    } catch (error) {
        console.log(error);
        return null;
    }
}

// Funzione che filtra i supereroi per rimuovere quelli senza immagine
// e senza nome o senza id
function filterSuperHeroes(superHeroes) {
    var result = [];
    for (let i = 0; i < superHeroes.length; i++) {
        const hero = superHeroes[i];
        var img = hero?.thumbnail?.path + "/landscape_medium." + hero?.thumbnail?.extension;
        var id = hero?.id;
        var name = hero?.name;
        if (name && id && !img.includes("image_not_available")) {
            result.push({
                id: id,
                name: name,
                img: img,
            });
        }
    }
    return result;
}


/*
    funzione che crea un pacchetto di supereroi con un numero
    specifico di supereroi. Tutti i supereroi sono diversi tra loro
    e non ci sono duplicati. E tutti i supereroi hanno un'immagine
    e un nome e un id. In caso di errore durante la richiesta restituisce null.
*/
export async function createPack(quantità) {
    // numero massimo di errori che si possono verificare
    // durante la richiesta di supereroi
    // prima di abbandonare la creazione del pacchetto
    var maxErr = 2;
    // fa una richiesta per sapewre quanti supereroi ci sono
    var { total } = await getAllSuperHero(0, 1) ?? {};

    if(!total) {
        return null;
    }

    // Genera il pacchetto di supereroi
    const pack = [];
    const cardsId = new Set(); // Usa un Set per evitare duplicati

    
    while (maxErr > 0) {
        var randomOffset = Math.floor(Math.random() * total);
        var { heroes } = await getAllSuperHero(randomOffset) ?? {};
        if(!heroes) {
            maxErr--;
            continue;
        }

        for (let i = 0; i < heroes.length && pack.length < quantità; i++) {
            const hero = heroes[i];
            if(!cardsId.has(hero.id)) {
                pack.push(hero);
                cardsId.add(hero.id);
            }
        }

        if(pack.length == quantità) {
            return pack;
        }
    }
}