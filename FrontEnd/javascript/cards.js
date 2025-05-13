import { userPromise } from "./components/navbar.js";
import { showModal, modalHTML } from "./components/modal.js";


/* 
    funzione che effettua una richiesta alle api per ottenere i dati di una carta
    se la richiesta va abuon fine mostra i dettagli della carta
    altrimenti mostra un messaggio di errore
*/
async function showCardDetail(name, image, id) {
    const html = `
        <div class="d-flex justify-content-center">
            <img src="${image}" class="img-fluid" style="heigth:400px; width:18rem" alt="image not found">
        </div>
        <h2 class="text-center mt-2">${name}</h2>
        <input type="hidden" id="card-id" value="${id}">
        <p>Caricamento dati in corso..</p>
    `;

    showModal({ title: 'Dettagli carta', html });

    // Fare richiesta alle API per i dati
    const response = await fetch(`/api/character/${id}`);

    // verifica che i dati rievutoti siano relativi alla carta che sta esponendo il modal
    if(modalHTML.querySelector('#card-id').value !== id) {
        return;
    }

    if(!response.ok) {
        modalHTML.querySelector('p').textContent = 'Errore nel caricamento dei dati';
        return;
    }

    const character = await response.json();

    var dataHTML = '';

    if(character?.house){
        dataHTML += `<h4>Casata: ${character.house}</h4>`;
    }
    if(character?.wand && character.wand.core) {
        dataHTML += `
            <h4>Bacchetta: ${character.wand.core}</h4>
        `;
    }
    if(character?.dateOfBirth) {
        dataHTML += `
            <h4>Data di nascita: ${character.dateOfBirth}</h4>
        `;
    }
    if(character?.patronus) {
        dataHTML += `
            <h4>Patronus: ${character.patronus}</h4>
        `;
    }
    if(character?.actor) {
        dataHTML += `
            <h4>Attore: ${character.actor}</h4>
        `;
    }

    // Rimuovere il messaggio di caricamento e aggiungere i dettagli della carta
    modalHTML.querySelector('p').remove();
    modalHTML.querySelector('.modal-body').innerHTML += dataHTML;
}

// funzione che ritorna l'html di una carta
function HTMLcard(name, img, copy, id) {
    return `
    <div class="card m-2 shadow-lg rounded-lg border border-gray-200" style="width: 18rem;">
        <img src="${img}" class="w-full object-cover rounded-t-lg" style="height:400px" alt="image not found">
        <div class="card-body p-4">
            <h5 class="card-title text-lg font-bold text-center">${name}</h5>
            <h6 class="card-text text-sm text-gray-600 text-center">Quantità: ${copy}</h6>
            <button id="button-card-${id}" class="btn btn-primary w-full mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600">Dettagli</button>
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
                container.insertAdjacentHTML('beforeend', HTMLcard(card.name, card.image, card.copy, cardId));
                document.querySelector(`#button-card-${cardId}`).addEventListener('click', () => showCardDetail(card.name, card.image, cardId));
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

