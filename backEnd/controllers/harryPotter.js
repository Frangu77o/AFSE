const baseUrl = "https://hp-api.onrender.com/api";


// controller che gestisce la richiesta di un personaggio specifico
export async function getCharacter(req, res) {
    try {
        let { id } = req.params;
        const response = await getCharacters(id);
        if(!response || response.length !== 1) {
            res.status(404).json({ error: 'personaggio non trovato' });
        }
        res.status(200).json(response[0]);
    } catch (error) {
        res.status(500).json({ error: 'Errore interno' });
    }
}


// Funzione per ottenere i personaggi (se non viene passato l'id restituisce tutti i personaggi)
async function getCharacters(id) {
    try {
        const url = id ? `${baseUrl}/character/${id}` : `${baseUrl}/characters`;
        const response = await fetch(url);

        if(response.ok) {
            const data = await response.json();
            
            if (!Array.isArray(data) || data.length === 0) {
                return null;
            } else {
                // filtra i personaggi tenendo solo quelli che hanno id, nome, e immagine
                const validCharacters = data.filter(character => {
                    return character.id && character.name && character.image;
                });
                
                // Se non ci sono personaggi validi, restituisce null
                if(validCharacters.length === 0) {
                    return null;
                };

                // Restituisce solo i personaggi validi
                return validCharacters;
            }
        }
        return null;
    } catch (error) {
        return null;
    }
}

/*
    funzione che crea un pacchetto di personaggi con un numero
    specifico di personaggi. Tutti i personaggi sono diversi tra loro
    e non ci sono duplicati. In caso di errore durante la richiesta restituisce null.
*/
export async function createPack(quantità) {
    // numero massimo di errori che si possono verificare
    // durante le richieste
    // prima di abbandonare la creazione del pacchetto
    var maxErr = 2;

    // Genera il pacchetto di personaggi
    const pack = [];
    
    while (maxErr > 0) {
        var characters = await getCharacters();

        if(!Array.isArray(characters) || characters.length < quantità) {
            maxErr--;
            continue;
        }

        while(pack.length < quantità) {
            var randomIndex = Math.floor(Math.random() * characters.length);
            var character = characters[randomIndex];
            pack.push(character);
            characters.splice(randomIndex, 1); // Rimuovi il personaggio dall'array per evitare duplicati
        }

        return pack;
    }
}