var navbarList = document.querySelector('header > div > nav > div > #navbarNav > ul');
if(navbarList) {
    (async () => {
        // chimata per verificare se l'utente è correttamente loggato
        var response = await fetch('/api/user', { credentials: 'include' });
        var isLogged = response.status === 200;
        var links;
        if(isLogged) {
            var user = await response.json();
            links = [
                { href: 'home.html', text: 'Home' },
                { href: 'profile.html', text: 'Profilo' },
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
            // bottone per il logout
            var buttonLogOut = document.createElement('button');
            buttonLogOut
                .classList
                .add('nav-item');
            buttonLogOut
                .classList
                .add('btn');
            buttonLogOut
                .classList
                .add('btn-danger');
            buttonLogOut
                .textContent = 'Logout';
            buttonLogOut
                .addEventListener('click', async () => {
                    var response = await fetch('/api/user/logout', { method: "POST", credentials: 'include' });
                    if(response.status === 200) {
                        window.location.href = '/';
                    }
                });
            navbarList
                .appendChild(buttonLogOut);

            // crediti disponibili
            var listItem = document.createElement('li');
            listItem
                .classList
                .add('nav-item');
            listItem
                .classList
                .add('nav-link');
            listItem
                .textContent = `Crediti: ${user.credits}`;
            navbarList
                .appendChild(listItem);
        }


    })();
};