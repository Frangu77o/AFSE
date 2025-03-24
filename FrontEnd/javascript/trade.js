const searchFriend = document.getElementById("searchFriend");
const dropdownMyCard = document.getElementById("dropdownMyCard");
const dropdownSellCard = document.getElementById("dropdownSellCard");
const dropdownWantedCard = document.getElementById("dropdownWantedCard");

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

searchFriend.addEventListener("click", async () => {
    var errorMsg = document.querySelector('#errorFriendEmail')
    errorMsg.style.display = "none";

    const friendMail = document.getElementById("friendEmail");
    const response = await fetch(`/api/user/cards/${friendMail.value}`);

    if(response.ok) {
        const cards = await response.json();

        document.getElementById("selectedMyCard").classList.add("active");
        document.getElementById("selectedWantedCard").classList.add("active");
        document.getElementById("dropdownWantedCard").innerHTML = createListHTML(cards);
        friendMail.disabled = true;

        setupDropdown("dropdownMyCard", "selectedMyCard");
        setupDropdown("dropdownWantedCard", "selectedWantedCard");
    } else {
        const error = await response.json();
        errorMsg.style.display = "block";
        errorMsg.textContent = error.error;
    }
});

function createListHTML(cards) {
    var html = "";
    for (const cardId in cards) {
        const card = cards[cardId];
        const item = "<li data-value='" + cardId + "'>" + card.name + "</li>";
        html += item;
    }
    return html;
}

function createTradesHTML(trades, userId) {
    var receivedTradesHTML = "";
    var sentTradesHTML = "";
    for (const trade of trades) {
        var isMY = trade.fromUserId.toString() === userId.toString();
        var fromUserCardsHTML = trade.fromUserCards.map(cardId => `<li>${cardId}</li>`).join('');
        var toUserCardsHTML = trade.toUserCards.map(cardId => `<li>${cardId}</li>`).join('');
        var footerHTML = "";
        switch(trade.status) {
            case "pending":
                isMY ? 
                footerHTML = `
                    <div class="mt-3 text-center">
                        <p class="fw-bold text-warning">⏳ In Attesa di Risposta</p>
                        <button type="button" class="btn btn-danger" onclick="cancelTrade('${trade._id}')">Annulla</button>
                    </div>
                `
                :
                footerHTML = `
                    <div class="mt-3 text-center">
                        <button type="button" class="btn btn-success" onclick="acceptTrade('${trade._id}')">Accetta</button>
                        <button type="button" class="btn btn-danger" onclick="rejectTrade('${trade._id}')">Rifiuta</button>
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
                            ${isMY ? fromUserCardsHTML : toUserCardsHTML}
                        </ul>
                    </div>
                    <div class="mt-3">
                        <p class="fw-bold text-success">🎴 Carte Date:</p>
                        <ul class="list-unstyled ps-3">
                            ${isMY ? toUserCardsHTML : fromUserCardsHTML}
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

async function acceptTrade(tradeId) {
    const response = await fetch(`/api/trade/${tradeId}/accept`, {
        method: "PUT",
        credentials: 'include'
    });
    if(response.ok) {
        alert("Scambio accettato con successo");
        window.location.reload();
    } else {
        var { error } = await response.json();
        alert("Errore durante l'accettazione dello scambio: " + error);
    }
}

async function rejectTrade(tradeId) {
    var response = await fetch(`/api/trade/${tradeId}/reject`, {
        method: "PUT",
        credentials: 'include'
    });
    if(response.ok) {
        alert("Scambio rifiutato con successo");
        window.location.reload();
    } else {
        var { error } = await response.json();
        alert("Errore durante il rifiuto dello scambio: " + error);
    }
}

async function cancelTrade(tradeId) {
    var response = await fetch(`/api/trade/${tradeId}/cancel`, {
        method: "DELETE",
        credentials: 'include'
    });
    if(response.ok) {
        alert("Scambio cancellato con successo");
        window.location.reload();
    } else {
        var { error } = await response.json();
        alert("Errore durante la cancellazione dello scambio: " + error);
    }
}

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
        alert("Errore durante la vendita delle carte: " + error);
    } else {
        alert("vendita effettuata con successo");
        window.location.reload();
    }

});

document.getElementById("tradeForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // evita l'invio del form html

    var friendMail = document.getElementById("friendEmail").value;
    var myCard = Array.from(document.getElementById("selectedMyCard").querySelectorAll("span")).map(span => span.getAttribute("data-value"));
    var wantedCard = Array.from(document.getElementById("selectedWantedCard").querySelectorAll("span")).map(span => span.getAttribute("data-value"));

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
        alert("Errore durante la creazione dello scambio: " + error );
    } else {
        alert("scambio creato con successo");
        window.location.reload();
    }
});

// richiesta per i dati dell'utente
(async () => {
    // aspetto che entrambe le richieste siano completate
    const [responseUser, tradesResponse] = await Promise.all([
        fetch("/api/user", { credentials: 'include' }),
        fetch("/api/trades", { credentials: 'include' })
    ]);

    if(responseUser.ok) {
        const user = await responseUser.json();

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
            document.querySelector("#receivedTrades").innerHTML = receivedTradesHTML;
            document.querySelector("#sentTrades").innerHTML = sentTradesHTML;
        }
    }
})();

