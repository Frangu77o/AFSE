import "./components/navbar.js";
import { showModal } from "./components/modal.js";

/**
 * Aggiunge un listener per l'evento di submit del form di registrazione.
 * Quando il form viene inviato, viene prevenuto il comportamento predefinito
 * e viene fatta una chiamata POST all'endpoint API per creare un nuovo utente.
 */
document.getElementById('registrationForm').addEventListener('submit', async function(event) {
    // Previene il comportamento predefinito del form (che farebbe un reindirizzamento)
    event.preventDefault();

    // Ottiene i valori dei campi del form
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm_password').value;
    const favoriteSuperhero = document.getElementById('hero').value;
    const birthdate = document.getElementById('birthdate').value;
    const country = document.getElementById('country').value;

    // controlli sui dati inseriti
    if(!isPasswordValid(password)) {
        showModal({title: "Errore", message: 'La password deve essere lunga almeno 8 caratteri e contenere almeno una lettera maiuscola, una minuscola e un numero'});
        return;
    }
    if(confirmPassword !== password) {
        showModal({title: "Errore", message: 'Le password non corrispondono'});
        return;
    }

    // Crea un oggetto con i dati del form
    const data = {
        email,
        username,
        password,
        favoriteSuperhero,
        birthdate,
        country
    };

    try {
        // Effettua una chiamata POST all'endpoint API per creare un nuovo utente
        const response = await fetch('/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Se la risposta è positiva, reindirizza l'utente alla pagina di benvenuto
        if (response.ok) {
            window.location.href = '/';
        } else {
            // Se c'è un errore, mostra un messaggio di errore
            try {
                const json = await response.json();
                if(json.error) {
                    showModal({title:"Errore", message: json.error});
                } else {
                    showModal({title:"Errore", message:'Errore durante la registrazione'});
                }
            } catch (error) {
                console.error('Errore nel parsing della risposta', error);
                showModal({title:"Errore", message:'Errore durante la registrazione'});
            }
        }
    } catch (error) {
        console.error('Errore durante la chiamata API:', error);
        showModal({title:"Errore", message:'Errore durante la registrazione'});
    }
});


// Funzione per controllare se la password è valida e sicura
function isPasswordValid(password) {
    if (password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        return false;
    }
    return true;
}