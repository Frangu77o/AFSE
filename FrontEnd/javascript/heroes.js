function showCardDetail(name, img, id) {
    var modal = new bootstrap.Modal(document.getElementById('card_pop_up'));
    modal._element.querySelector('.modal-title').innerHTML = name;
    modal.show();
}

function HTMLcard(name, img, id) {
    return `
    <div class="card m-2"  style="width: 18rem; min-height: 10rem; max-height: 20rem;">
        <img src="${img}" class="card-img-top" alt="image not found">
        <div class="card-body">
            <h5 class="card-title">${name}</h5>
            <button onclick="showCardDetail('${name}', '${img}', '${id}')" class="btn btn-primary">Dettagli</button>
        </div>
    </div>
    `;
}


(async () => {
    const response = await fetch('/api/user', { credentials: 'include' });
    if (response.ok) {
        const user = await response.json();
        const { cards } = user;

        const container = document.querySelector('main');

        if(Object.keys(cards).length === 0) {
            container.innerHTML = `
            <div class="alert alert-warning" role="alert">
                Non hai ancora nessuna carta.
            </div>
            `;
        } else {
            for (const cardId in cards) {
                const card = cards[cardId];
                container.innerHTML += HTMLcard(card.name, card.img, cardId);
            }
        }

    } else {
        if(response.status === 401) {
            alert("Devi effettuare il login per accedere a questa pagina.");
            window.location.href = "/html/login.html";
        } else {
            const json = await response.json();
            alert(json.error);
        }
    }
})();

