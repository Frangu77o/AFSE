import { showModal, modalHTML } from "./components/modal.js";
import "./components/navbar.js";

/*
 prova a acquistare un pacchetto di carte
 e aggiornare il modal con le carte ottenute o il messaggio di errore
*/
async function buyPack(packId) {
    // Effettua la richiesta per acquistare il pacchetto
    const response = await fetch(`/api/user/buy-superhero-package/${packId}`, {
        method: 'PUT',
        credentials: 'include',
    });

    if (!response.ok) {
        const data = await response.json();
        modalHTML.querySelector(".modal-title").textContent = `Errore`;
        if (data.error === "Crediti insufficienti") {
            modalHTML.querySelector('.modal-body').innerHTML = `
                <div class="d-flex justify-content-center align-items-center" style="height: 200px;">
                    <h3>Crediti insufficienti per acquistare il pacchetto.</h3>
                </div>
            `;
        } else {
            modalHTML.querySelector('.modal-body').innerHTML = `
                <div class="d-flex justify-content-center align-items-center" style="height: 200px;">
                    <h3>Errore durante l'acquisto del pacchetto.</h3>
                </div>
            `;
        }
        return;
    }

    // Ottieni le carte dal pacchetto acquistato
    const cards = await response.json();

    // Mostra le carte nel modal
    modalHTML.querySelector('.modal-body').innerHTML = `
        <div class="d-flex justify-content-center flex-wrap">
            ${cards.map(card => `
                <div class="card m-2" style="width: 18rem;">
                    <img src="${card.img}" class="card-img-top" alt="${card.name}">
                    <div class="card-body">
                        <h5 class="card-title">${card.name}</h5>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

const loaderHTML = `
    <div class="d-flex justify-content-center align-items-center" style="height: 200px;">
        <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
            <span class="visually-hidden">Caricamento...</span>
        </div>
    </div>
`;

// listener per l'acquisto dei pacchetti
document.getElementById('packBase').addEventListener('click', () => {
    showModal({title: 'Pacchetto Base', html: loaderHTML});
    buyPack(1);
});

document.getElementById('packAvanzato').addEventListener('click', () => {
    showModal({title: 'Pacchetto Avanzato', html: loaderHTML});
    buyPack(2);
});

document.getElementById('packPremium').addEventListener('click', () => {
    showModal({title: 'Pacchetto Premium', html: loaderHTML});
    buyPack(3);   
});