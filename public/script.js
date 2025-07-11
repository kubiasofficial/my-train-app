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

    // NOVÉ ELEMENTY PRO NASTAVENÍ ROLE
    const nastaveniRoleSelect = document.getElementById('nastaveni-role');
    const settingsMessage = document.getElementById('settingsMessage');
    const settingsForm = document.getElementById('settingsForm');


    // --- MANUÁLNÍ DATABÁZE UŽIVATELŮ A HESEL (POUZE PRO DEMO!) ---
    // POZOR: Změna role zde je pouze na straně klienta (v prohlížeči).
    // Pro reálnou aplikaci by bylo nutné ověřování a ukládání role na serveru!
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

    // Funkce pro přihlášení
    function login(username, password) {
        if (users[username] && users[username].password === password) {
            errorMessage.classList.remove('show');
            localStorage.setItem('currentUserRole', users[username].role);
            localStorage.setItem('currentUserName', users[username].name);
            renderDashboard(); // Zobrazí dashboard
        } else {
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
        usernameInput.value = ''; // Vyčistí pole
        passwordInput.value = '';
        errorMessage.classList.remove('show');
    }

    // Funkce pro zobrazení dashboardu po přihlášení
    function renderDashboard() {
        const currentUserRole = localStorage.getItem('currentUserRole');
        const currentUserName = localStorage.getItem('currentUserName');

        if (!currentUserRole) {
            logout(); // Pokud není role, odhlásí a vrátí na login
            return;
        }

        loginView.style.display = 'none';
        dashboardView.style.display = 'flex'; // Zobrazí dashboard

        if (userRoleElement) {
            userRoleElement.textContent = currentUserRole === 'dispatcher' ? 'Dispečer' : 'Strojvedoucí';
        }
        if (currentUsernameElement) {
            currentUsernameElement.textContent = currentUserName || 'Neznámý uživatel';
        }
        if (nastaveniUsernameInput) {
            nastaveniUsernameInput.value = currentUserName || '';
        }

        // Nastavení aktuální role ve výběru v nastavení
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

        // Nastavení výchozí sekce po přihlášení
        if (currentUserRole === 'dispatcher') {
            showSection('prehled');
        } else {
            showSection('moje-zakazky');
        }

        updateDochazkaStatus(); // Aktualizuje stav docházky
        setInterval(updateTime, 1000); // Spustí aktualizaci času
        updateTime(); // První zobrazení času
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
        // alert('Úspěšně jste se přihlásil do práce!');
    });

    checkOutBtn.addEventListener('click', () => {
        isWorking = false;
        updateDochazkaStatus();
        // alert('Úspěšně jste se odhlásil z práce!');
    });

    // NOVÝ EVENT LISTENER PRO ZMĚNU ROLE V NASTAVENÍ
    if (nastaveniRoleSelect) {
        nastaveniRoleSelect.addEventListener('change', (e) => {
            const newRole = e.target.value;
            localStorage.setItem('currentUserRole', newRole); // Aktualizuje roli v localStorage

            // Zobrazí zprávu o úspěšné změně
            settingsMessage.textContent = `Role byla změněna na "${newRole === 'dispatcher' ? 'Dispečer' : 'Strojvedoucí'}". Pro plné uplatnění změn se prosím odhlaste a znovu přihlaste.`;
            settingsMessage.classList.add('show');
            settingsMessage.style.color = 'var(--success-color)'; // Zelená barva pro úspěch

            // Okamžité překreslení dashboardu pro zobrazení změn v menu atd.
            renderDashboard();

            // Skryje zprávu po několika sekundách
            setTimeout(() => {
                settingsMessage.classList.remove('show');
            }, 5000);
        });
    }

    // NOVÝ EVENT LISTENER PRO ODESLÁNÍ FORMULÁŘE NASTAVENÍ (pro ostatní pole)
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Zde by v reálné aplikaci proběhlo odeslání dat na backend.
            // Prozatím jen zobrazíme simulovanou zprávu o uložení.
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