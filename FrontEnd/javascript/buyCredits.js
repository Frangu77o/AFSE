document.querySelector('#paymentForm').addEventListener('submit', (event) => {
    event.preventDefault();

    var form = document.querySelector('#paymentForm');
    var cvc = form.querySelector('#cardCVC').value;
    var creditCard = form.querySelector('#cardNumber').value;
    var expirationCreditCard = form.querySelector('#cardExpiry').value;
    var credits = form.querySelector('#credits').value;

    var message = form.querySelector('#paymentFormMessage');

    if(creditCard.length < 16 || cvc.length < 3 || expirationCreditCard < new Date().getTime()) {
        message.innerText = 'Dati carta di credito non validi';
        return;
    }

    fetch('/api/user/credits', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credits, creditCard, cvc, expirationCreditCard })
    }).then(response => {
        if(response.ok) {
            window.location.reload();
        } else {
            response.json().then(json => message.innerText = json.error);
        }
    }).catch(error => {
        console.error('Errore durante la chiamata API:', error);
        message.innerText = 'Errore durante il pagamento';
    });
});

function showPaymentPopup(packageName, price) {
    document.getElementById('packageInfo').innerText = `Stai acquistando: ${packageName} per ${price}`;
    var popUp = document.getElementById('paymentPopup')
    popUp.querySelector('#credits').value = price
    var paymentModal = new bootstrap.Modal(popUp);
    paymentModal.show();
}