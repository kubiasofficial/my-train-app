document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMessage = document.getElementById('errorMessage');

    // --- MANUÁLNÍ DATABÁZE UŽIVATELŮ A HESEL (POUZE PRO DEMO!) ---
    const users = {
        'dispecer': { password: 'dispecerheslo', role: 'dispatcher', name: 'Eva Dvořáková' },
        'strojvedouci': { password: 'strojvedouciheslo', role: 'driver', name: 'Jana Nováková' },
        'admin': { password: 'adminheslo', role: 'dispatcher', name: 'Petr Král' },
        'vaclav': { password: '1809', role: 'driver', name: 'Václav Novák' },
        'kubiasofficial': { password: '2811', role: 'driver', name: 'Kubias Official' }
    };

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Zabrání výchozímu odeslání formuláře

        const username = usernameInput.value;
        const password = passwordInput.value;

        if (users[username] && users[username].password === password) {
            // Úspěšné přihlášení
            errorMessage.classList.remove('show'); // Skryje chybovou zprávu

            // Uloží roli a jméno uživatele do localStorage
            localStorage.setItem('currentUserRole', users[username].role);
            localStorage.setItem('currentUserName', users[username].name);

            // Přesměrování na dashboard.html
            window.location.href = 'dashboard.html';
        } else {
            // Neúspěšné přihlášení
            errorMessage.textContent = 'Neplatné uživatelské jméno nebo heslo.';
            errorMessage.classList.add('show'); // Zobrazí chybovou zprávu
        }
    });
});