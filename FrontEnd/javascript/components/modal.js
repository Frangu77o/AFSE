// Creazione del modal di avviso nella page html
document.querySelector("main").insertAdjacentHTML("beforeend", `
    <!-- Modal -->
    <div id="modal" class="modal fade" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body text-center">
                </div>
            </div>
        </div>
    </div>
`);

export const modalHTML = document.getElementById("modal");
export const modal = new bootstrap.Modal(modalHTML);

// funzione per mostrare un pop-up di avviso
export function showModal(options) {
    let { title, message, html, onClose } = options;
    // inserisce il titolo e il messaggio nel pop-up
    modalHTML.querySelector(".modal-title").textContent = title;
    modalHTML.querySelector(".modal-body").textContent = message;
    // inserisce i pulsanti nel pop-up
    if(html) {
        modalHTML.querySelector(".modal-body").insertAdjacentHTML("beforeend", html);
    }
    // evento scatenato alla chiusura del pop-up
    if(typeof onClose === "function") {
        modalHTML.addEventListener("hidden.bs.modal", onClose);
    }
    // mostra il pop-up
    modal.show();
}