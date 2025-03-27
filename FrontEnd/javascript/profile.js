import { userPromise } from "./components/navbar.js";
import { modalHTML, showModal } from './components/modal.js';

/*
    cancella il profilo dell'utente e lo reindirizza alla home page
    in caso di errore mostra un messaggio di errore nel modal
*/
function deleteProfile() {
    fetch('/api/user', {
        method: 'DELETE',
        credentials: 'include'
    }).then(response => {
        if (response.ok) {
            window.location.href = "/";
        } else {
            modalHTML.querySelector(".modal-body").innerHTML = "Errore durante la cancellazione del profilo.";
        }
    });
}

/*
    aggiorna il profilo dell'utente con i dati inseriti nei campi di input
    in caso di successo ricarica la pagina per mostrare i nuovi dati,
    in caso di errore mostra un messaggio di errore nel modal
*/
function updateProfile() {
    const username = document.getElementById("edit-username").value;
    const email = document.getElementById("edit-email").value;
    const favoriteSuperhero = document.getElementById("edit-hero").value;
    const birthdate = document.getElementById("edit-birthdate").value;
    const country = document.getElementById("edit-country").value;
    const password = document.getElementById("edit-password").value;

    if (password && (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password))) {
        showModal({title:"Errore Aggiornamento Profilo", message:'La password deve essere lunga almeno 8 caratteri e contenere almeno una lettera maiuscola, una minuscola e un numero'});
        return;
    }

    fetch('/api/user', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, email, password, favoriteSuperhero, birthdate, country }),
        credentials: 'include'
    }).then(async (response) => {
        if (response.ok) {
            window.location.reload();
        } else {
            try {
                var json = await response.json();
                if(json.error) {
                    showModal({title:"Errore", message: json.error});
                } else {
                    showModal({title:"Errore", message:'Errore durante l\'aggiornamento del profilo'});
                }
            } catch (error) {
                showModal({title:"Errore", message:'Errore durante l\'aggiornamento del profilo'});
            }   
        }
    }).catch(error => {
        console.error('Errore durante la chiamata API:', error);
        showModal({title:"Errore", message:'Errore durante l\'aggiornamento del profilo'});
    });
}

/*
    Mostra i dati dell'utente loggato e permette di modificarli o cancellare il profilo.
    In caso di richiesta fallita mostra un messaggio di errore
*/
(async () => {
    const user = await userPromise;
    if (user) {
        const { email, username, favoriteSuperhero, birthdate, country } = user;
        document.querySelector('main').innerHTML = `
            <div class="card p-4 shadow-lg profile-card w-full mt-4">
                <h2 class="text-center mb-4">Il Mio Profilo</h2>
                <form id="profileForm">
                    <div class="mb-3">
                        <label class="form-label fw-bold">Username:</label>
                        <p id="username">${username}</p>
                        <input type="text" class="form-control edit-field" id="edit-username" value="${username}" style="display: none;">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Email:</label>
                        <p id="email">${email}</p>
                        <input type="email" class="form-control edit-field" id="edit-email" value="${email}" style="display: none;">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Supereroe Preferito:</label>
                        <p id="hero">${favoriteSuperhero}</p>
                        <input type="text" class="form-control edit-field" id="edit-hero" value="${favoriteSuperhero}" style="display: none;">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Data di Nascita:</label>
                        <p id="birthdate">${new Date(birthdate).toLocaleDateString('it-IT')}</p>
                        <input type="date" class="form-control edit-field" id="edit-birthdate" value="${new Date(birthdate).toISOString().split("T")[0]}" style="display: none;">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Paese:</label>
                        <p id="country">${country}</p>
                        <select class="form-control edit-field" id="edit-country" name="country" required style="display: none;">
                            <option value="Italia" ${country == "Italia" ? "selected" : ""}>Italia</option>
                            <option value="Francia" ${country == "Francia" ? "selected" : ""}>Francia</option>
                            <option value="Germania" ${country == "Germania" ? "selected" : ""}>Germania</option>
                            <option value="Spagna" ${country == "Spagna" ? "selected" : ""}>Spagna</option>
                            <option value="Regno Unito" ${country == "Regno Unito" ? "selected" : ""}>Regno Unito</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label id="label_password" class="form-label fw-bold" style="display: none">Cambia Password</label>
                        <input type="password" class="form-control edit-field" id="edit-password" placeholder="Nuova password" style="display: none;">
                    </div>
                    <div class="text-center">
                        <button type="button" class="btn btn-secondary" id="edit-button">Modifica Profilo</button>
                        <button type="button" class="btn btn-danger" id="delete-button">Cancella Profilo</button>
                        <button type="button" class="btn btn-primary edit-field" id="save-button" style="display: none;">Salva</button>
                    </div>
                </form>
            </div>
        `;

        // Nasconde i campi testuali e mostra i campi di input per modificare il profilo
        document.getElementById("edit-button").addEventListener("click", function() {
            const form = document.getElementById("profileForm");
            form.querySelectorAll(".edit-field").forEach(el => el.style.display = "block");
            form.querySelectorAll("p").forEach(el => el.style.display = "none");
            form.querySelector("#edit-button").style.display = "none";
            form.querySelector("#delete-button").style.display = "none";
            form.querySelector("#label_password").style.display = "block";
            form.querySelector("#save-button").style.display = "block";
        });
        // Cancella il profilo
        document.getElementById("delete-button").addEventListener("click", () => {
            showModal({
                title: 'Cancella Profilo',
                html: `
                    <div>
                        <p>Sei sicuro di voler cancellare il tuo profilo?</p>
                        <button type="button" class="btn btn-danger" id="deleteProfile" >Cancella Profilo</button>
                    </div>
                `
            })
            modalHTML.querySelector('#deleteProfile').addEventListener('click', deleteProfile)
        });
        // Salva le modifiche al profilo
        document.getElementById("save-button").addEventListener("click", updateProfile);
    } else {
        document.querySelector('main').innerHTML = "<h2 class='text-center mt-4'>Errore, assicurati di essere loggato nel tuo account</h2>";
    }
})()