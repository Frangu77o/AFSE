/**
 * Aggiunge un listener per l'evento di submit del form di login.
 * Quando il form viene inviato, viene prevenuto il comportamento predefinito
 * e viene fatta una chiamata POST all'endpoint API per vedere se l'utente esiste e la password corisponde.
 */
document.getElementById('loginForm').addEventListener('submit', async function(event) {
    // Previene il comportamento predefinito del form (che farebbe un reindirizzamento)
    event.preventDefault();

    // Ottiene i valori dei campi del form
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Crea un oggetto con i dati del form
    const data = {
        email,
        password
    };

    try {
        // Effettua una chiamata POST all'endpoint API per creare un nuovo utente
        const response = await fetch('/api/user/login', {
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
            const json = await response.json();
            alert(json.error);
        }
    } catch (error) {
        console.error('Errore durante la chiamata API:', error);
        alert('Errore nel login');
    }
});