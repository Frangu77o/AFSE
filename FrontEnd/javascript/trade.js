import { userPromise } from "./components/navbar.js";
import { showModal } from "./components/modal.js";

const searchFriend = document.getElementById("searchFriend");
const dropdownMyCard = document.getElementById("dropdownMyCard");
const dropdownSellCard = document.getElementById("dropdownSellCard");
const dropdownWantedCard = document.getElementById("dropdownWantedCard");

// funzione per gestire il dropdown
function setupDropdown(dropdownId, selectedId, callbackAddElement = ()=>{}, callbackRemoveElement = ()=>{}) {
    const dropdown = document.getElementById(dropdownId);
    const selectedContainer = document.getElementById(selectedId);

    // al click su selectedContainer, fa effetto toggle sul dropdown
    selectedContainer.addEventListener("click", () => {
        if (!selectedContainer.classList.contains("disabled")) {
            dropdown.style.display = dropdown.style.display === "block" ? "none" : "block";
        }
    });

    // al click su un elemento del dropdown, lo aggiunge a selectedContainer
    dropdown.querySelectorAll("li").forEach(item => {
        item.addEventListener("click", () => {
            const value = item.getAttribute("data-value");
            const text = item.textContent;

            if (!selectedContainer.querySelector(`[data-value="${value}"]`)) {
                if (selectedContainer.textContent === "Seleziona...") {
                    selectedContainer.textContent = "";
                }
                
                const span = document.createElement("span");
                span.setAttribute("data-value", value);
                span.innerHTML = `${text} <i class="bi bi-x-circle"></i>`;
                span.addEventListener("click", () => {
                    span.remove();
                    if (selectedContainer.children.length === 0) {
                        selectedContainer.textContent = "Seleziona...";
                    }
                    callbackRemoveElement(value);
                });
                selectedContainer.appendChild(span);
                callbackAddElement(value);
            }
            dropdown.style.display = "none";
        });
    });

    // chiude il dropdown se si clicca fuori
    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && !selectedContainer.contains(e.target)) {
            dropdown.style.display = "none";
        }
    });
}

// funzione per cercare un amico (nella sezione scambio con amico)
searchFriend.addEventListener("click", async () => {
    var errorMsg = document.querySelector('#errorFriendEmail')
    errorMsg.style.display = "none";

    const friendMail = document.getElementById("friendEmail");
    const response = await fetch(`/api/user/cards/${friendMail.value}`);

    if(response.ok) {
        const cards = await response.json();

        document.getElementById("selectedMyCard").classList.add("active");
        document.getElementById("selectedWantedCard").classList.add("active");
        dropdownWantedCard.innerHTML = createListHTML(cards);
        friendMail.disabled = true;

        setupDropdown("dropdownMyCard", "selectedMyCard");
        setupDropdown("dropdownWantedCard", "selectedWantedCard");
    } else {
        const error = await response.json();
        errorMsg.textContent = error.error;
        errorMsg.style.display = "block";
    }
});

// funzione per creare l'html di una lista di carte
function createListHTML(cards) {
    var html = "";
    for (const cardId in cards) {
        const card = cards[cardId];
        const item = "<li data-value='" + cardId + "'>" + card.name + "</li>";
        html += item;
    }
    return html;
}

// funzione per creare l'html degli scambi
function createTradesHTML(trades, userId) {
    var receivedTradesHTML = "";
    var sentTradesHTML = "";
    for (const trade of trades) {
        var isMY = trade.fromUserId.toString() === userId.toString();
        var fromUserCardsHTML = trade.fromUserCards.map(card => `<li>${card.name}</li>`).join('');
        var toUserCardsHTML = trade.toUserCards.map(card => `<li>${card.name}</li>`).join('');
        var footerHTML = "";
        switch(trade.status) {
            case "pending":
                isMY ? 
                footerHTML = `
                    <div class="mt-3 text-center">
                        <p class="fw-bold text-warning">⏳ In Attesa di Risposta</p>
                        <button type="button" class="btn btn-danger cancelTrade" data-value="${trade._id}">Annulla</button>
                    </div>
                `
                :
                footerHTML = `
                    <div class="mt-3 text-center">
                        <button type="button" class="btn btn-success acceptTrade" data-value="${trade._id}">Accetta</button>
                        <button type="button" class="btn btn-danger rejectTrade" data-value="${trade._id}">Rifiuta</button>
                    </div>
                `
                break;
            case "accepted":
                footerHTML = `
                    <div class="mt-3 text-center">
                        <p class="fw-bold text-success">✅ Scambio Accettato</p>
                    </div>
                `;    
                break;
            case "rejected":
                footerHTML = `
                    <div class="mt-3 text-center">
                        <p class="fw-bold text-danger">❌ Scambio Rifiutato</p>
                    </div>
                `;
                break;
        }
        const tradeHTML = `
            <div class="card border rounded p-3 m-3 shadow-lg w-100">
                <div class="card-body">
                    <h5 class="card-title">📧 ${isMY ? trade.toUserEmail : trade.fromUserEmail }</h5>
                    <div class="mt-3">
                        <p class="fw-bold text-primary">🔄 Carte Ricevute:</p>
                        <ul class="list-unstyled ps-3">
                            ${isMY ? toUserCardsHTML : fromUserCardsHTML}
                        </ul>
                    </div>
                    <div class="mt-3">
                        <p class="fw-bold text-success">🎴 Carte Date:</p>
                        <ul class="list-unstyled ps-3">
                            ${isMY ? fromUserCardsHTML : toUserCardsHTML}
                        </ul>
                    </div>
                    ${footerHTML}
                </div>
              </div>
        `;
        if(isMY) {
            sentTradesHTML += tradeHTML;
        } else {
            receivedTradesHTML += tradeHTML;
        }
    }
    return [receivedTradesHTML, sentTradesHTML];
}

// funzione per accettare uno scambio
async function acceptTrade(tradeId) {
    const response = await fetch(`/api/trade/${tradeId}/accept`, {
        method: "PUT",
        credentials: 'include'
    });
    if(response.ok) {
        showModal({ title: "Scambio Accettato", message:"Scambio accettato con successo", onClose: () => window.location.reload()});
    } else {
        var { error } = await response.json();
        showModal({ title: "Errore", message:"Errore durante l'accettazione dello scambio: " + error });
    }
}

// funzione per rifiutare uno scambio
async function rejectTrade(tradeId) {
    var response = await fetch(`/api/trade/${tradeId}/reject`, {
        method: "PUT",
        credentials: 'include'
    });
    if(response.ok) {
        showModal({title: "Scambio Rifiutato", message: "Scambio rifiutato con successo", onClose: () => window.location.reload()});
    } else {
        var { error } = await response.json();
        showModal({title: "Errore", message: "Errore durante il rifiuto dello scambio: " + error});
    }
}

// funzione per annullare uno scambio
async function cancelTrade(tradeId) {
    var response = await fetch(`/api/trade/${tradeId}/cancel`, {
        method: "DELETE",
        credentials: 'include'
    });
    if(response.ok) {
        showModal({title: "Scambio Annullato", message: "Scambio annullato con successo", onClose: () => window.location.reload()});
    } else {
        var { error } = await response.json();
        showModal({title: "Errore", message: "Errore durante l'annullamento dello scambio: " + error});
    }
}

// funzione per vendere le carte
document.getElementById("sellButton").addEventListener("click", async () => {
    var cardIds = Array.from(document.getElementById("selectedSellCard").querySelectorAll("span")).map(span => span.getAttribute("data-value"));

    if(cardIds.length === 0) {
        return;
    }

    const response = await fetch("/api/user/sell-cards", {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cardIds }),
        credentials: 'include'
    });

    if(!response.ok) {
        let { error } = await response.json();
        showModal({title: "Errore", message: "Errore durante la vendita delle carte: " + error});
    } else {
        showModal({title: "Vendita Completata", message: "Carte vendute con successo", onClose: () => window.location.reload()});
    }

});

// funzione per creare uno scambio
document.getElementById("tradeForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // evita l'invio del form html

    var friendMail = document.getElementById("friendEmail").value;
    var myCard = Array.from(document.getElementById("selectedMyCard").querySelectorAll("span")).map(span => {
        return { id: span.getAttribute("data-value"), name: span.textContent }; 
    });
    var wantedCard = Array.from(document.getElementById("selectedWantedCard").querySelectorAll("span")).map(span => {
        return { id: span.getAttribute("data-value"), name: span.textContent };
    });

    const response = await fetch("/api/trade", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ friendMail, myCard, wantedCard }),
        credentials: 'include'
    });

    if(!response.ok) {
        let { error } = await response.json();
        showModal({title: "Errore", message: "Errore durante la creazione dello scambio: " + error});
    } else {
        showModal({title: "Scambio Creato", message: "Scambio creato con successo", onClose: () => window.location.reload()});
    }
});

/*
    aspetta i dati dell'utente e poi li usa per creare i dropdown delle carte che ha l'utente
    se la richiesta non va a buon fine, mostra un messaggio di errore,
    in oltre richiede gli scambi dell'utente e li mostra se la richiesta va a buon fine
*/
(async () => {
    // aspetto che entrambe le richieste siano completate
    const [user, tradesResponse] = await Promise.all([
        userPromise,
        fetch("/api/trades", { credentials: 'include' })
    ]);

    if(user) {
        var html = createListHTML(user.cards);
        dropdownMyCard.innerHTML = html;
        dropdownSellCard.innerHTML = html;

        function callbackAddElement() {
            const creditCounter = document.getElementById("creditCounter");
            const counter = parseInt(creditCounter.textContent);
            creditCounter.textContent = counter + 1;
        }
        function callbackRemoveElement() {
            const creditCounter = document.getElementById("creditCounter");
            const counter = parseInt(creditCounter.textContent);
            creditCounter.textContent = counter - 1;
        }
        setupDropdown("dropdownSellCard", "selectedSellCard", callbackAddElement, callbackRemoveElement);

        // se anche la richiesta per gli scambi è andata a buon fine allora aggiorno la pagina
        if(tradesResponse.ok) {
            const trades = await tradesResponse.json();
            var [receivedTradesHTML, sentTradesHTML] = createTradesHTML(trades, user._id);
            // carico gli scambi ricevuti
            document.querySelector("#receivedTrades").innerHTML = receivedTradesHTML;
            // aggiungo i listener ai bottoni degli scammbi ricevuti
            document.querySelectorAll(".acceptTrade").forEach(button => button.addEventListener("click", () => acceptTrade(button.getAttribute("data-value"))));
            document.querySelectorAll(".rejectTrade").forEach(button => button.addEventListener("click", () => rejectTrade(button.getAttribute("data-value"))));
            // carico gli scambi inviati
            document.querySelector("#sentTrades").innerHTML = sentTradesHTML;
            // aggiungo i listener ai bottoni degli scammbi inviati
            document.querySelectorAll(".cancelTrade").forEach(button => button.addEventListener("click", () => cancelTrade(button.getAttribute("data-value"))));
        }
    } else {
        document.querySelector('main').innerHTML = `
            <h2 class="text-center">Errore, assicurati di essere loggato nel tuo account</h2>
        `;
    }
})();

