async function buyPack(packName, packId) {
    // Iserisci il loader
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="height: 200px;">
            <div class="spinner-border text-primary" role="status" style="width: 3rem; height: 3rem;">
                <span class="visually-hidden">Caricamento...</span>
            </div>
        </div>
    `;
    const titolo = document.getElementById('modalTitle')
    titolo.innerText = `Acquisto in corso...`;

    // Mostra il modal
    const modal = new bootstrap.Modal(document.getElementById('popUpPack'));
    modal.show();

    // Effettua la richiesta per acquistare il pacchetto
    const response = await fetch(`/api/user/buy-superhero-package/${packId}`, {
        method: 'PUT',
        credentials: 'include',
    });

    // Rimuovi il loader e aggiorna il titolo del modal
    titolo.innerText = `Hai acquistato: ${packName}`;

    if (!response.ok) {
        const data = await response.json();
        titolo.innerText = `Errore`;
        if (data.error === "Crediti insufficienti") {
            modalBody.innerHTML = `
                <div class="d-flex justify-content-center align-items-center" style="height: 200px;">
                    <h3>Non hai abbastanza crediti per acquistare questo pacchetto.</h3>
                </div>
            `;
        } else {
            modalBody.innerHTML = `
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
    modalBody.innerHTML = `
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