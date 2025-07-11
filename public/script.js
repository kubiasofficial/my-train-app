document.addEventListener('DOMContentLoaded', () => {
    const loginView = document.getElementById('login-view');
    const dashboardView = document.getElementById('dashboard-view');
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    const timeElement = document.getElementById('current-time');
    const navLinks = document.querySelectorAll('.nav-link');
    const contentSections = document.querySelectorAll('.content-section');
    const userRoleElement = document.getElementById('user-role');
    const currentUsernameElement = document.getElementById('current-username');
    const logoutBtn = document.getElementById('logout-btn');
    const checkInBtn = document.getElementById('check-in-btn');
    const checkOutBtn = document.getElementById('check-out-btn');
    const dochazkaStatusText = document.getElementById('dochazka-status-text');
    const nastaveniUsernameInput = document.getElementById('nastaveni-username');

    const nastaveniRoleSelect = document.getElementById('nastaveni-role');
    const settingsMessage = document.getElementById('settingsMessage');
    const settingsForm = document.getElementById('settingsForm');

    // --- MANUÁLNÍ DATABÁZE UŽIVATELŮ A HESEL (VŠE V PROHLÍŽEČI) ---
    // POZOR: Toto je nebezpečné pro reálné aplikace, hesla jsou v kódu!
    const users = {
        'dispecer': { password: 'dispecerheslo', role: 'dispatcher', name: 'Eva Dvořáková' },
        'strojvedouci': { password: 'strojvedouciheslo', role: 'driver', name: 'Jana Nováková' },
        'admin': { password: 'adminheslo', role: 'dispatcher', name: 'Petr Král' },
        'vaclav': { password: '1809', role: 'driver', name: 'Václav Novák' },
        'kubiasofficial': { password: '2811', role: 'driver', name: 'Kubias Official' }
    };

    let isWorking = false; // Simulace stavu docházky

    // Funkce pro aktualizaci času
    function updateTime() {
        const now = new Date();
        timeElement.textContent = now.toLocaleString('cs-CZ', { dateStyle: 'full', timeStyle: 'medium' });
    }

    // Funkce pro zobrazení konkrétní sekce dashboardu
    function showSection(id) {
        contentSections.forEach(section => {
            section.classList.remove('active');
        });
        const activeSection = document.getElementById(id);
        if (activeSection) {
            activeSection.classList.add('active');
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
        });
        const correspondingNavLink = document.querySelector(`[href="#${id}"]`);
        if (correspondingNavLink) {
             correspondingNavLink.classList.add('active');
        }
    }

    // Funkce pro aktualizaci stavu docházky
    function updateDochazkaStatus() {
        if (isWorking) {
            dochazkaStatusText.textContent = 'Jste v práci';
            dochazkaStatusText.classList.remove('status-inactive');
            dochazkaStatusText.classList.add('status-active');
            checkInBtn.style.display = 'none';
            checkOutBtn.style.display = 'inline-flex';
        } else {
            dochazkaStatusText.textContent = 'Jste mimo práci';
            dochazkaStatusText.classList.remove('status-active');
            dochazkaStatusText.classList.add('status-inactive');
            checkInBtn.style.display = 'inline-flex';
            checkOutBtn.style.display = 'none';
        }
    }

    // --- PŘIHLÁŠENÍ BEZ DATABÁZE (LOKÁLNÍ OVĚŘENÍ) ---
    function login(username, password) {
        errorMessage.classList.remove('show'); // Skryje předchozí chybu

        if (users[username] && users[username].password === password) {
            // Úspěšné přihlášení
            localStorage.setItem('currentUserRole', users[username].role);
            localStorage.setItem('currentUserName', users[username].name);
            renderDashboard();
        } else {
            // Neúspěšné přihlášení
            errorMessage.textContent = 'Neplatné uživatelské jméno nebo heslo.';
            errorMessage.classList.add('show');
        }
    }

    // Funkce pro odhlášení
    function logout() {
        localStorage.removeItem('currentUserRole');
        localStorage.removeItem('currentUserName');
        loginView.style.display = 'flex';
        dashboardView.style.display = 'none';
        usernameInput.value = '';
        passwordInput.value = '';
        errorMessage.classList.remove('show');
    }

    // Funkce pro načítání dat ze SimRail API
    async function fetchSimRailData() {
        const serverCode = 'CZ-1'; // Váš požadovaný server
        const trainPositionsEndpoint = `https://panel.simrail.eu:8084/train-positions-open?serverCode=${serverCode}`;
        const timeEndpoint = `https://api1.aws.simrail.eu:8082/api/getTime?serverCode=${serverCode}`;

        // Získání počtu vlaků online
        try {
            const response = await fetch(trainPositionsEndpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            const onlineTrainsCount = data.length; // Předpokládáme, že API vrací pole vlaků
            const trainsOnlineValueElement = document.querySelector('#prehled .card:nth-child(1) .value');
            if (trainsOnlineValueElement) {
                trainsOnlineValueElement.textContent = onlineTrainsCount;
            }
        } catch (error) {
            console.error('Chyba při načítání pozic vlaků ze SimRail API:', error);
            // Můžete zde aktualizovat UI, např. zobrazit "N/A" nebo chybovou zprávu
            const trainsOnlineValueElement = document.querySelector('#prehled .card:nth-child(1) .value');
            if (trainsOnlineValueElement) {
                trainsOnlineValueElement.textContent = 'N/A';
            }
        }

        // Získání aktuálního herního času (pokud je potřeba zobrazit)
        try {
            const response = await fetch(timeEndpoint);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            // Předpokládáme, že API vrací objekt s klíčem 'time' nebo podobně
            // Příklad: { "time": "2025-07-11T17:30:00Z" }
            // Zde byste museli upravit podle skutečné struktury odpovědi
            // Pro jednoduchost, pokud API vrací jen čas, můžeme ho zobrazit
            // const gameTimeElement = document.getElementById('game-time'); // Pokud máte takový element
            // if (gameTimeElement && data.time) {
            //     gameTimeElement.textContent = new Date(data.time).toLocaleTimeString('cs-CZ');
            // }
        } catch (error) {
            console.error('Chyba při načítání herního času ze SimRail API:', error);
        }

        // POZNÁMKA K CORS:
        // Přímé volání externích API z prohlížeče může narazit na CORS (Cross-Origin Resource Sharing) omezení.
        // Pokud se objeví chyby typu "Access-Control-Allow-Origin", budete potřebovat proxy server.
        // Pro Vercel by se to dalo řešit pomocí Vercel Serverless Function jako proxy,
        // ale to by znamenalo návrat k "backendu" pro API volání.
    }


    // Funkce pro zobrazení dashboardu po přihlášení
    function renderDashboard() {
        const currentUserRole = localStorage.getItem('currentUserRole');
        const currentUserName = localStorage.getItem('currentUserName');

        if (!currentUserRole) {
            logout();
            return;
        }

        loginView.style.display = 'none';
        dashboardView.style.display = 'flex';

        if (userRoleElement) {
            userRoleElement.textContent = currentUserRole === 'dispatcher' ? 'Dispečer' : 'Strojvedoucí';
        }
        if (currentUsernameElement) {
            currentUsernameElement.textContent = currentUserName || 'Neznámý uživatel';
        }
        if (nastaveniUsernameInput) {
            nastaveniUsernameInput.value = currentUserName || '';
        }

        if (nastaveniRoleSelect) {
            nastaveniRoleSelect.value = currentUserRole;
        }

        const dispatcherSections = ['prehled', 'pridelovani-vlaku', 'dochazka', 'clenove', 'nastaveni'];
        const driverSections = ['moje-zakazky', 'vykazy', 'dochazka', 'nastaveni'];

        navLinks.forEach(link => {
            const targetId = link.getAttribute('href').substring(1);
            const listItem = link.closest('li');

            if (currentUserRole === 'dispatcher') {
                if (!dispatcherSections.includes(targetId)) {
                    listItem.style.display = 'none';
                } else {
                    listItem.style.display = 'block';
                }
            } else if (currentUserRole === 'driver') {
                if (!driverSections.includes(targetId)) {
                    listItem.style.display = 'none';
                } else {
                    listItem.style.display = 'block';
                }
            }
        });

        if (currentUserRole === 'dispatcher') {
            showSection('prehled');
            fetchSimRailData(); // Načte data ze SimRail API, když je zobrazen přehled
            // Nastaví interval pro pravidelné načítání dat (např. každých 30 sekund)
            // POZOR: Příliš časté volání API může vést k zablokování!
            setInterval(fetchSimRailData, 30000);
        } else {
            showSection('moje-zakazky');
        }

        updateDochazkaStatus();
        setInterval(updateTime, 1000);
        updateTime();
    }

    // --- Event Listenery ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        login(usernameInput.value, passwordInput.value);
    });

    logoutBtn.addEventListener('click', logout);

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            showSection(targetId);
        });
    });

    checkInBtn.addEventListener('click', () => {
        isWorking = true;
        updateDochazkaStatus();
    });

    checkOutBtn.addEventListener('click', () => {
        isWorking = false;
        updateDochazkaStatus();
    });

    // EVENT LISTENER PRO ZMĚNU ROLE V NASTAVENÍ
    if (nastaveniRoleSelect) {
        nastaveniRoleSelect.addEventListener('change', (e) => {
            const newRole = e.target.value;
            localStorage.setItem('currentUserRole', newRole); // Aktualizuje roli v localStorage

            settingsMessage.textContent = `Role byla změněna na "${newRole === 'dispatcher' ? 'Dispečer' : 'Strojvedoucí'}". Pro plné uplatnění změn se prosím odhlaste a znovu přihlaste.`;
            settingsMessage.classList.add('show');
            settingsMessage.style.color = 'var(--success-color)';

            renderDashboard(); // Okamžité překreslení dashboardu pro zobrazení změn v menu atd.

            setTimeout(() => {
                settingsMessage.classList.remove('show');
            }, 5000);
        });
    }

    // EVENT LISTENER PRO ODESLÁNÍ FORMULÁŘE NASTAVENÍ (pro ostatní pole)
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Všechna nastavení se ukládají jen v prohlížeči, ne perzistentně.
            // Zde byste mohli přidat logiku pro uložení např. emailu nebo SimRail ID
            // do localStorage, pokud byste je chtěli "pamatovat".

            settingsMessage.textContent = 'Nastavení uloženo (simulace).';
            settingsMessage.classList.add('show');
            settingsMessage.style.color = 'var(--success-color)';

            setTimeout(() => {
                settingsMessage.classList.remove('show');
            }, 3000);
        });
    }


    // Kontrola přihlášení při načtení stránky
    if (localStorage.getItem('currentUserRole')) {
        renderDashboard();
    } else {
        loginView.style.display = 'flex';
        dashboardView.style.display = 'none';
    }
});
