import { userPromise } from "./components/navbar.js";
import { showModal, modalHTML, modal } from "./components/modal.js";


/* 
    funzione che effettua una richiesta alle api per ottenere i dati di una carta
    se la richiesta va abuon fine mostra i dettagli della carta
    altrimenti mostra un messaggio di errore
*/
async function showCardDetail(name, img, id) {
    const html = `
        <div class="d-flex justify-content-center">
            <img src="${img}" class="img-fluid" alt="image not found">
        </div>
        <h2 class="text-center mt-2">${name}</h2>
        <input type="hidden" id="card-id" value="${id}">
        <p>Caricamento dati in corso..</p>
    `;

    showModal({ title: 'Dettagli carta', html });

    // Fare richiesta alle API per i dati
    const response = await fetch(`/api/superhero/${id}`);

    // verifica che i dati rievutoti siano relativi alla carta che sta esponendo il modal
    if(modalHTML.querySelector('#card-id').value !== id) {
        return;
    }

    if(!response.ok) {
        modalHTML.querySelector('p').textContent = 'Errore nel caricamento dei dati';
        return;
    }


    const { comics, series, events } = await response.json();

    // Funzione per generare HTML con massimo 5 elementi e un pulsante toggle
    function generateListHTML(items, type) {
        const maxItems = 5;
        const visibleItems = items.slice(0, maxItems).map(item => `
            <li class="list-group-item">
                <h5>${item.name}</h5>
            </li>
        `).join('');

        const hiddenItems = items.slice(maxItems).map(item => `
            <li class="list-group-item d-none toggle-${type}">
                <h5>${item.name}</h5>
            </li>
        `).join('');

        const toggleButton = items.length > maxItems ? `
            <button class="btn btn-link p-0 toggle-btn-${type}" data-expanded="false">
                Mostra altri
            </button>
        ` : '';

        return `
            ${visibleItems}
            ${hiddenItems}
            ${toggleButton}
        `;
    }

    const comicsHTML = generateListHTML(comics.items, 'comics');
    const seriesHTML = generateListHTML(series.items, 'series');
    const eventsHTML = generateListHTML(events.items, 'events');

    // Mostrare i dettagli della carta
    const dataHTML = `
        <div class="m-5">
            <h4>Serie: ${series.available}</h4>
            <ul class="list-group">
                ${seriesHTML}
            </ul>
        </div>
        <div class="m-5">
            <h4>Comics: ${comics.available}</h4>
            <ul class="list-group">
                ${comicsHTML}
            </ul>
        </div>
        <div class="m-5">
            <h4>Eventi: ${events.available}</h4>
            <ul class="list-group">
                ${eventsHTML}
            </ul>
        </div>
    `;

    // Rimuovere il messaggio di caricamento e aggiungere i dettagli della carta
    modalHTML.querySelector('p').remove();
    modalHTML.querySelector('.modal-body').innerHTML += dataHTML;

    // Aggiungere il comportamento toggle ai pulsanti
    document.querySelectorAll('.toggle-btn-series').forEach(button => {
        button.addEventListener('click', () => toggleItems('series'));
    });
    document.querySelectorAll('.toggle-btn-comics').forEach(button => {
        button.addEventListener('click', () => toggleItems('comics'));
    });
    document.querySelectorAll('.toggle-btn-events').forEach(button => {
        button.addEventListener('click', () => toggleItems('events'));
    });

    function toggleItems(type) {
        const hiddenItems = document.querySelectorAll(`.toggle-${type}`);
        const button = document.querySelector(`.toggle-btn-${type}`);
        const isExpanded = button.getAttribute('data-expanded') === 'true';

        hiddenItems.forEach(item => {
            item.classList.toggle('d-none', isExpanded);
        });

        button.setAttribute('data-expanded', !isExpanded);
        button.textContent = isExpanded
            ? `Mostra altri (${hiddenItems.length})`
            : 'Nascondi';
    }
}

// funzione che ritorna l'html di una carta
function HTMLcard(name, img, copy, id) {
    return `
    <div class="card m-2"  style="width: 18rem;">
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

