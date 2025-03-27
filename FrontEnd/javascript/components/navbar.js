document.body.insertAdjacentHTML("afterbegin", `
    <!-- NavBar -->
    <header class="bg-dark text-white text-center py-4">
        <div class="container">
            <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
                <div class="container-fluid">
                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span class="navbar-toggler-icon"></span>
                    </button>
                    <div class="collapse navbar-collapse" id="navbarNav">
                        <ul class="navbar-nav mx-auto" id="navbar-nav">
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    </header>
`);

export const userPromise = (async () => {
    try {
        const response = await fetch('/api/user', { credentials: 'include' });
        return response.ok ? response.json() : null;
    } catch (err) {
        console.error("Errore nel recupero dell'utente:", err);
        return null;
    }
})();

(async () => {
    var user = await userPromise;
    var isLogged = user !== null;
    var navbarList = document.querySelector('#navbar-nav');
    var links;
    if(isLogged) {
        links = [
            { href: 'home.html', text: 'Home' },
            { href: 'buy_credits.html', text: 'Acquista Crediti' },
            { href: 'buy_packs.html', text: 'Acquista Pacchetti' },
            { href: 'heroes.html', text: 'Supereroi' },
            { href: 'trade.html', text: 'Scambio Figurine' },
        ];
    } else {
        links = [
            { href: 'home.html', text: 'Home' },
            { href: 'register.html', text: 'Registrati' },
            { href: 'login.html', text: 'Accedi' }
        ];
    }

    links.forEach((link) => {
        var listItem = document.createElement('li');
        var anchor = document.createElement('a');
        anchor
            .setAttribute('href', link.href);
        anchor
            .classList
            .add('nav-link');
        anchor
            .textContent = link.text;

        listItem
            .classList
            .add('nav-item');
        listItem
            .appendChild(anchor);
        navbarList
            .appendChild(listItem);

        if(window.location.href.includes(link.href)) {
            anchor
                .classList
                .add('active');
        }
    });

    if(isLogged) {
        // Aggiungi il bottone con l'immagine del profilo
        var profileButton = document.createElement('button');
        profileButton.classList.add('btn');

        // Aggiungi l'immagine del profilo
        var profileIcon = document.createElement('i');
        profileIcon.classList.add('bi', 'bi-person', 'text-white', 'fs-5');
        profileButton.appendChild(profileIcon);

        // Crea il menu a discesa
        var dropdownMenu = document.createElement('div');
        dropdownMenu.classList.add('dropdown-menu', 'profile-dropdown');

        var profileLink = document.createElement('a');
        profileLink.classList.add('dropdown-item');
        profileLink.href = 'profile.html';
        profileLink.textContent = 'Profilo';
        
        var creditsLink = document.createElement('a');
        creditsLink.classList.add('dropdown-item');
        creditsLink.href = '#';
        creditsLink.textContent = `Crediti: ${user.credits}`;
        
        var logoutLink = document.createElement('button');
        logoutLink.classList.add('dropdown-item', 'btn', 'btn-danger');
        logoutLink.href = '#';
        logoutLink.textContent = 'Logout';
        logoutLink.addEventListener('click', async () => {
            var response = await fetch('/api/user/logout', { method: "POST", credentials: 'include' });
            if(response.status === 200) {
                window.location.href = '/';
            }
        });

        dropdownMenu.appendChild(profileLink);
        dropdownMenu.appendChild(creditsLink);
        dropdownMenu.appendChild(logoutLink);

        // Aggiungi il menu a discesa al bottone
        profileButton.appendChild(dropdownMenu);
        navbarList.appendChild(profileButton);

        // Gestisci hover per mostrare il menu a discesa
        profileButton.addEventListener('mouseenter', () => {
            dropdownMenu.style.display = 'block';
        });

        profileButton.addEventListener('mouseleave', () => {
            dropdownMenu.style.display = 'none';
        });

        // Gestisci il clic sul bottone per aprire/chiudere il menu
        profileButton.addEventListener('click', () => {
            // Toggle della visibilità del menu
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });
    }
})();
