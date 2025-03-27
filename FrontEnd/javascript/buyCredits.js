import "./components/navbar.js";
import { showModal, modalHTML } from "./components/modal.js";

/*
    prova a comprare dei crediti
    e aggiorna il modal con il messaggio di errore o di successo
*/
async function buyCredits(credits) {
    console.log('buyCredits');
    var cvc = modalHTML.querySelector('#cardCVC').value;
    var creditCard = modalHTML.querySelector('#cardNumber').value;
    var expirationCreditCard = modalHTML.querySelector('#cardExpiry').value;

    var message = modalHTML.querySelector('#paymentMessage');

    if(creditCard.length == 0 || cvc.length == 0 || expirationCreditCard.length == 0) {
        message.innerText = 'Dati carta di credito non validi';
        return;
    }

    message.innerText = 'Pagamento in corso...';

    fetch('/api/user/credits', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credits, creditCard, cvc, expirationCreditCard })
    }).then(response => {
        if(response.ok) {
            message.innerText = 'Pagamento effettuato con successo';
            // ricarica la pagina dopo la chiusura del pop-up (per aggiornare i crediti)
            modalHTML.addEventListener("hidden.bs.modal", () => window.location.reload());
        } else {
            message.innerText = 'Errore durante il pagamento';
        }
    }).catch(error => {
        console.error('Errore durante la chiamata API:', error);
        message.innerText = 'Errore durante il pagamento';
    });
}

// form HTML per l'acquisto dei crediti con carta di credito
const paymentHTML = `
    <div class="mb-3">
        <label for="cardNumber" class="form-label">Numero Carta</label>
        <input type="text" class="form-control" id="cardNumber" placeholder="XXXX-XXXX-XXXX-XXXX">
    </div>
    <div class="mb-3">
        <label for="cardExpiry" class="form-label">Scadenza</label>
        <input type="text" class="form-control" id="cardExpiry" placeholder="MM/YY">
    </div>
    <div class="mb-3">
        <label for="cardCVC" class="form-label">CVC</label>
        <input type="text" class="form-control" id="cardCVC" placeholder="XXX">
    </div>
    <p id="paymentMessage"></p>
    <button id="buy" class="btn btn-success w-100">Paga</button>
`;

// listener per l'acquisto dei crediti
document.getElementById('packBase').addEventListener('click', () => {
    showModal({title: 'Pacchetto Base', html: paymentHTML});
    modalHTML.querySelector('#buy').addEventListener('click', () => buyCredits(5));
});

document.getElementById('packAvanzato').addEventListener('click', () => {
    showModal({title: 'Pacchetto Avanzato', html: paymentHTML});
    modalHTML.querySelector('#buy').addEventListener('click', () => buyCredits(10));
});

document.getElementById('packPremium').addEventListener('click', () => {
    showModal({title: 'Pacchetto Premium', html: paymentHTML});
    modalHTML.querySelector('#buy').addEventListener('click', () => buyCredits(20));
});