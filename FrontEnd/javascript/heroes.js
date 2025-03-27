import { userPromise } from "./components/navbar.js";
import { showModal } from "./components/modal.js";


/* 
    funzione che effettua una richiesta alle api per ottenere i dati di una carta
    se la richiesta va abuon fine mostra i dettagli della carta
    altrimenti mostra un messaggio di errore
*/
function showCardDetail(name, img, id) {

    // fare richiesta alle api per i dati (al momento non implementato per4che le api sono down)

    const html = `
        <div class="d-flex justify-content-center">
            <img src="${img}" class="img-fluid" alt="image not found">
        </div>
        <h2 class="text-center">${name}</h2>
    `;
    showModal({title: 'Dettagli carta', html});
}

// funzione che ritorna l'html di una carta
function HTMLcard(name, img, copy, id) {
    return `
    <div class="card m-2"  style="width: 18rem; min-height: 10rem; max-height: 20rem;">
        <img src="${img}" class="card-img-top" alt="image not found">
        <div class="card-body">
            <h5 class="card-title">${name}</h5>
            <h6 class="card-text">quantità: ${copy}</h6>
            <h6 class="card-text">ID: ${id}</h6>
            <button id="button-card-${id}" class="btn btn-primary">Dettagli</button>
        </div>
    </div>
    `;
}


/* 
    aspetta i dati dell'utente e poi li usa per creare le carte
    se la richiesta non va a buon fine, mostra un messaggio di errore,
    altrimenti mostra le carte dell'utente,
    se l'utente non ha carte, mostra un messaggio di nessuna carta
*/
(async () => {
    const user = await userPromise;
    if (user) {
        const { cards } = user;

        const container = document.querySelector('main');

        if(Object.keys(cards).length === 0) {
            container.innerHTML = `
            <div class="d-flex justify-content-center align-items-center">
                <h2 class="text-center">Non hai nessuna carta</h2>
            </div>
            `;
        } else {
            for (const cardId in cards) {
                const card = cards[cardId];
                container.insertAdjacentHTML('beforeend', HTMLcard(card.name, card.img, card.copy, cardId));
                document.querySelector(`#button-card-${cardId}`).addEventListener('click', () => showCardDetail(card.name, card.img, cardId));
            }
        }
    } else {
        document.querySelector('main').innerHTML = `
            <div class="d-flex justify-content-center align-items-center">
                <h2 class="text-center">Errore, assicurati di essere loggato nel tuo account</h2>
            </div>
        `;
    }
})();

