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

    // Formulář pro přidělování zakázek a tabulka aktivních zakázek (pro dispečera)
    const assignOrderForm = document.querySelector('#pridelovani-vlaku form');
    const activeOrdersTableBody = document.querySelector('#pridelovani-vlaku .data-table tbody');
    const pridelenoRidiciSelect = document.getElementById('prideleno-ridici');

    // Tabulka pro moje zakázky (pro strojvedoucího)
    const myOrdersTableBody = document.querySelector('#moje-zakazky .data-table tbody');

    // Discord Webhook URL - Zde je vaše URL pro odesílání zpráv
    const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1390845026375831552/Wf4OvVgDoV44X-e-11SMn5yskwHHh2-DyEUohAzu853kn5TD-6_RNRrIl8LSuGVTUC1S';

    // --- MANUÁLNÍ DATABÁZE UŽIVATELŮ A HESEL (VŠE V PROHLÍŽEČI) ---
    // POZOR: Toto je nebezpečné pro reálné aplikace, hesla jsou v kódu!
    const users = {
        'dispecer': { password: 'dispecerheslo', role: 'dispatcher', name: 'Dispečer Hlavní' },
        'strojvedouci': { password: 'strojvedouciheslo', role: 'driver', name: 'Václav Novák' },
        'admin': { password: 'adminheslo', role: 'dispatcher', name: 'Admin Systému' },
        'vaclav': { password: '1809', role: 'driver', name: 'Václav Novák' },
        'kubiasofficial': { password: '2811', role: 'driver', name: 'Kubias Official' }
    };

    // Pole pro ukládání aktivních zakázek (pouze v paměti prohlížeče)
    // V reálné aplikaci by toto bylo uloženo v databázi.
    let activeOrders = [];

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

    // Funkce pro odeslání zprávy na Discord webhook
    async function sendDiscordMessage(message) {
        try {
            const response = await fetch(DISCORD_WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: message }),
            });

            if (!response.ok) {
                console.error('Chyba při odesílání zprávy na Discord:', response.status, response.statusText);
            }
        } catch (error) {
            console.error('Chyba sítě při odesílání zprávy na Discord:', error);
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

    // Funkce pro načítání dat ze SimRail API (přímé volání)
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


    // Funkce pro dynamické vykreslení tabulky aktivních zakázek (pro dispečera)
    function renderActiveOrders() {
        activeOrdersTableBody.innerHTML = ''; // Vyčistí tabulku před přidáním nových řádků

        if (activeOrders.length === 0) {
            const noOrdersRow = document.createElement('tr');
            noOrdersRow.innerHTML = `<td colspan="6" style="text-align: center; padding: 20px; color: var(--muted-text);">Žádné aktivní zakázky.</td>`;
            activeOrdersTableBody.appendChild(noOrdersRow);
            return;
        }

        activeOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${order.id}</td>
                <td>${order.naklad}</td>
                <td>${order.puvod} - ${order.cil}</td>
                <td>${order.prideleno}</td>
                <td class="status-badge ${order.stav.toLowerCase().replace(' ', '-')}">${order.stav}</td>
                <td>
                    <button class="btn edit-order-btn" data-order-id="${order.id}" style="background-color: #f6ad55; padding: 5px 10px; margin-right: 5px;"><i class="fas fa-edit"></i></button>
                    <button class="btn delete-order-btn" data-order-id="${order.id}" style="background-color: #e53e3e; padding: 5px 10px;"><i class="fas fa-times"></i></button>
                </td>
            `;
            activeOrdersTableBody.appendChild(row);
        });

        // Přidání event listenerů pro nově vytvořená tlačítka editace a smazání
        document.querySelectorAll('.edit-order-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                handleEditOrder(orderId);
            });
        });

        document.querySelectorAll('.delete-order-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                handleDeleteOrder(orderId);
            });
        });
    }

    // Funkce pro zpracování editace zakázky (pouze simulace, pro reálnou editaci by byl potřeba formulář)
    function handleEditOrder(orderId) {
        const order = activeOrders.find(o => o.id === orderId);
        if (order) {
            // Zde by se obvykle otevřel modální formulář s předvyplněnými daty zakázky
            // Pro jednoduchost teď jen alert
            alert(`Simulace editace zakázky ${orderId}. Aktuální data:
ID: ${order.id}
Náklad: ${order.naklad}
Původ: ${order.puvod}
Cíl: ${order.cil}
Přiřazeno: ${order.prideleno}
Stav: ${order.stav}
Poznámky: ${order.poznamky}

Pro reálnou editaci byste museli implementovat formulář a logiku pro aktualizaci dat v activeOrders.`);
        }
    }

    // Funkce pro zpracování smazání zakázky
    function handleDeleteOrder(orderId) {
        if (confirm(`Opravdu chcete smazat zakázku ${orderId}?`)) { // Použijte vlastní modal pro lepší UX
            activeOrders = activeOrders.filter(order => order.id !== orderId);
            renderActiveOrders(); // Znovu vykreslí tabulku dispečera
            renderMyOrders(); // Znovu vykreslí tabulku strojvedoucího
            alert(`Zakázka ${orderId} byla smazána.`); // Použijte vlastní modal
        }
    }


    // Funkce pro dynamické vykreslení tabulky "Moje aktuální zakázky" (pro strojvedoucího)
    function renderMyOrders() {
        myOrdersTableBody.innerHTML = ''; // Vyčistí tabulku před přidáním nových řádků
        const currentUserName = localStorage.getItem('currentUserName');

        const myOrders = activeOrders.filter(order => order.prideleno === currentUserName);

        if (myOrders.length === 0) {
            const noOrdersRow = document.createElement('tr');
            noOrdersRow.innerHTML = `<td colspan="3" style="text-align: center; padding: 20px; color: var(--muted-text);">Nemáte žádné přidělené zakázky.</td>`;
            myOrdersTableBody.appendChild(noOrdersRow);
            return;
        }

        myOrders.forEach(order => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>Zakázka ${order.id} - ${order.prideleno}</td>
                <td class="status-badge ${order.stav.toLowerCase().replace(' ', '-')}">${order.stav}</td>
                <td>
                    ${order.stav === 'Přiřazeno' ? `<button class="btn take-order-btn" data-order-id="${order.id}" style="background-color: var(--primary-color); margin-right: 5px;"><i class="fas fa-play-circle"></i> Převzít</button>` : ''}
                    ${order.stav === 'V provozu' ? `<button class="btn complete-order-btn" data-order-id="${order.id}" style="background-color: var(--success-color);"><i class="fas fa-check-circle"></i> Dokončit</button>` : ''}
                </td>
            `;
            myOrdersTableBody.appendChild(row);
        });

        // Přidání event listenerů pro nově vytvořená tlačítka
        document.querySelectorAll('.take-order-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                handleTakeOrder(orderId);
            });
        });

        document.querySelectorAll('.complete-order-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const orderId = e.target.dataset.orderId;
                handleCompleteOrder(orderId);
            });
        });
    }

    // Funkce pro zpracování převzetí zakázky
    function handleTakeOrder(orderId) {
        const orderIndex = activeOrders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            // Zkontrolujte, zda je uživatel přidělený k této zakázce
            const currentUserName = localStorage.getItem('currentUserName');
            if (activeOrders[orderIndex].prideleno === currentUserName) {
                activeOrders[orderIndex].stav = 'V provozu';
                alert(`Zakázka ${orderId} byla převzata.`); // Použijte vlastní modal
                renderActiveOrders(); // Aktualizovat tabulku dispečera
                renderMyOrders(); // Aktualizovat tabulku strojvedoucího
            } else {
                alert('Tuto zakázku nemůžete převzít, protože vám nebyla přidělena.'); // Použijte vlastní modal
            }
        }
    }

    // Funkce pro zpracování dokončení zakázky
    function handleCompleteOrder(orderId) {
        const orderIndex = activeOrders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            // Zkontrolujte, zda je uživatel přidělený k této zakázce
            const currentUserName = localStorage.getItem('currentUserName');
            if (activeOrders[orderIndex].prideleno === currentUserName) {
                activeOrders[orderIndex].stav = 'Dokončeno';
                alert(`Zakázka ${orderId} byla dokončena.`); // Použijte vlastní modal
                renderActiveOrders(); // Aktualizovat tabulku dispečera
                renderMyOrders(); // Aktualizovat tabulku strojvedoucího
            } else {
                alert('Tuto zakázku nemůžete dokončit, protože vám nebyla přidělena.'); // Použijte vlastní modal
            }
        }
    }


    // Funkce pro aktualizaci možností v selectu "Přiřadit strojvedoucímu"
    function updateDriverSelectOptions() {
        pridelenoRidiciSelect.innerHTML = '<option value="">Vyberte strojvedoucího</option>';
        for (const username in users) {
            if (users[username].role === 'driver') {
                const option = document.createElement('option');
                option.value = users[username].name;
                option.textContent = users[username].name;
                pridelenoRidiciSelect.appendChild(option);
            }
        }
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
            updateDriverSelectOptions(); // Aktualizuje možnosti pro přidělování zakázek
            renderActiveOrders(); // Vykreslí aktivní zakázky pro dispečera
        } else {
            showSection('moje-zakazky');
            renderMyOrders(); // Vykreslí zakázky pro přihlášeného strojvedoucího
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

    // Event listener pro tlačítko "Příchod do práce"
    checkInBtn.addEventListener('click', () => {
        isWorking = true;
        updateDochazkaStatus();
        const userName = localStorage.getItem('currentUserName') || 'Neznámý uživatel';
        const currentTime = new Date().toLocaleString('cs-CZ');
        sendDiscordMessage(`**${userName}** se právě **přihlásil do práce** v **${currentTime}**.`);
    });

    // Event listener pro tlačítko "Odchod z práce"
    checkOutBtn.addEventListener('click', () => {
        isWorking = false;
        updateDochazkaStatus();
        const userName = localStorage.getItem('currentUserName') || 'Neznámý uživatel';
        const currentTime = new Date().toLocaleString('cs-CZ');
        sendDiscordMessage(`**${userName}** se právě **odhlásil z práce** v **${currentTime}**.`);
    });

    // NOVÝ EVENT LISTENER PRO ODESLÁNÍ FORMULÁŘE PŘIDĚLOVÁNÍ ZAKÁZEK
    if (assignOrderForm) {
        assignOrderForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const zakazkaId = document.getElementById('zakazka-id').value;
            const typNakladu = document.getElementById('typ-nakladu').value;
            const puvod = document.getElementById('puvod').value;
            const cil = document.getElementById('cil').value;
            const pridelenoRidici = document.getElementById('prideleno-ridici').value;
            const poznamkyDispecer = document.getElementById('poznamky-dispecer').value;

            // Základní validace
            if (!zakazkaId || !typNakladu || !puvod || !cil || !pridelenoRidici) {
                alert('Prosím, vyplňte všechna povinná pole pro zakázku.'); // Použijte vlastní modal pro lepší UX
                return;
            }

            // Kontrola, zda ID zakázky již neexistuje
            if (activeOrders.some(order => order.id === zakazkaId)) {
                alert(`Zakázka s ID "${zakazkaId}" již existuje. Zvolte prosím jiné ID.`);
                return;
            }

            const newOrder = {
                id: zakazkaId,
                naklad: typNakladu,
                puvod: puvod,
                cil: cil,
                prideleno: pridelenoRidici,
                stav: 'Přiřazeno', // Počáteční stav
                poznamky: poznamkyDispecer
            };

            activeOrders.push(newOrder); // Přidá novou zakázku do pole
            renderActiveOrders(); // Znovu vykreslí tabulku pro dispečera
            renderMyOrders(); // Znovu vykreslí tabulku pro strojvedoucího (pokud je aktivní)

            // Vyčistí formulář
            assignOrderForm.reset();
            // Můžete přidat zprávu o úspěchu
            alert('Zakázka úspěšně přidělena!'); // Použijte vlastní modal pro lepší UX
        });
    }


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

    // Inicializační volání pro vykreslení tabulek při načtení stránky,
    // pokud je uživatel již přihlášen (např. po refresh)
    // Toto je již voláno v renderDashboard(), takže zde není nutné duplikovat.
});
