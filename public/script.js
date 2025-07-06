// --- Vzít vlak a Kdo co dělá ---
    // const takeTrainBtn = document.getElementById('takeTrainBtn');
    // const takeTrainModal = document.getElementById('takeTrainModal');
    // const takeTrainModalContent = document.getElementById('takeTrainModalContent');
    // const closeTakeTrainModalBtn = document.getElementById('closeTakeTrainModalBtn');
    // Odebráno: tlačítko a tabulka "Vzít vlak" a "Kdo co dělá" dle požadavku uživatele.
// --- Zaměstnanci widget (nový systém) ---
let employees = [];
const employeeStatusTableBody = document.querySelector('#employeeStatusTable tbody');
const actionStatusMessage = document.getElementById('actionStatusMessage');
const myStatusDisplay = document.getElementById('myStatusDisplay');
const myStatusActions = document.getElementById('myStatusActions');
const empInBtn = document.getElementById('empInBtn');
const empOutBtn = document.getElementById('empOutBtn');

// Získat přihlášeného uživatele z localStorage
function getLoggedInUser() {
    try {
        const userStr = localStorage.getItem('discordUser');
        if (!userStr) return null;
        return JSON.parse(userStr);
    } catch (e) { return null; }
}

let myEmployee = null;

// Funkce pro aktualizaci/přidání statusu zaměstnance do tabulky
async function updateEmployeeStatusInTable(empName, inDuty) {
    let row = document.getElementById(`status-row-${empName.replace(/\s/g, '-')}`);
    const statusText = inDuty ? '🟢 Ve službě' : '🔴 Mimo službu';
    const statusClass = inDuty ? 'status-in-service' : 'status-out-of-service';

    if (!row) {
        row = employeeStatusTableBody.insertRow();
        row.id = `status-row-${empName.replace(/\s/g, '-')}`;
        const nameCell = row.insertCell(0);
        nameCell.textContent = empName;
        const statusCell = row.insertCell(1);
        statusCell.className = statusClass;
        statusCell.textContent = statusText;
    } else {
        const statusCell = row.cells[1];
        statusCell.className = statusClass;
        statusCell.textContent = statusText;
    }
}

// Funkce pro načtení počátečních statusů a nalezení mého zaměstnance
async function loadInitialEmployeeStatuses() {
    const res = await fetch('/api/employees');
    employees = await res.json();
    const user = getLoggedInUser();
    if (user) {
        myEmployee = employees.find(emp => emp.discordId === user.id || emp.name === user.username);
    }
    employees.forEach(emp => {
        updateEmployeeStatusInTable(emp.name, emp.currentStatus === 'Ve službě');
    });
    updateMyStatusWidget();
}

function updateMyStatusWidget() {
    if (!myEmployee) {
        myStatusDisplay.textContent = 'Nepodařilo se najít váš účet v seznamu zaměstnanců.';
        myStatusActions.style.display = 'none';
        return;
    }
    const inDuty = myEmployee.currentStatus === 'Ve službě';
    myStatusDisplay.textContent = `Status: ${inDuty ? '🟢 Ve službě' : '🔴 Mimo službu'}`;
    myStatusActions.style.display = 'flex';
}

// Funkce pro zobrazení zprávy
function showStatusMessage(message, isError = false) {
    actionStatusMessage.textContent = message;
    actionStatusMessage.style.color = isError ? '#e53935' : '#43b581';
    setTimeout(() => actionStatusMessage.textContent = '', 5000);
}

// Funkce pro odeslání stavu zaměstnance na Discord a uložení na server
async function sendEmployeeStatus(emp, inDuty) {
    const embed = {
        color: inDuty ? 0x43b581 : 0xe53935,
        title: inDuty ? '🚦 Zaměstnanec ve službě' : '🏁 Zaměstnanec mimo službu',
        description: `**${emp.name}** je nyní ${inDuty ? 've službě! \u{1F7E2}' : 'mimo službu. \u{1F534}'}`,
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Multi-Cargo Doprava',
            icon_url: 'https://cdn.discordapp.com/emojis/1140725956576686201.webp?size=96&quality=lossless'
        }
    };
    try {
        // Uložit na server
        await fetch('/api/employees', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: emp.id, currentStatus: inDuty ? 'Ve službě' : 'Mimo službu' })
        });
        // Odeslat na Discord
        await fetch('https://discord.com/api/webhooks/1390845026375831552/Wf4OvVgDoV44X-e-11SMn5yskwHHh2-DyEUohAzu853kn5TD-6_RNRrIl8LSuGVTUC1S', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        showStatusMessage('Status byl úspěšně změněn a odeslán!');
    } catch (e) {
        showStatusMessage('Chyba při ukládání nebo odesílání na Discord.', true);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Načíst počáteční statusy při načtení stránky
    loadInitialEmployeeStatuses();

    // Event listenery pro tlačítka "Příchod" a "Odchod"
    if (empInBtn) {
        empInBtn.addEventListener('click', async () => {
            if (myEmployee) {
                await sendEmployeeStatus(myEmployee, true);
                myEmployee.currentStatus = 'Ve službě';
                updateEmployeeStatusInTable(myEmployee.name, true);
                updateMyStatusWidget();
            }
        });
    }
    if (empOutBtn) {
        empOutBtn.addEventListener('click', async () => {
            if (myEmployee) {
                await sendEmployeeStatus(myEmployee, false);
                myEmployee.currentStatus = 'Mimo službu';
                updateEmployeeStatusInTable(myEmployee.name, false);
                updateMyStatusWidget();
            }
        });
    }




    // --- Zbytek vašeho původního script.js kódu (restart alert, načítání vlaků, generování vlaku) ---

    // --- Restart alert ---
    const restartTimes = ["01:30", "08:30", "15:30"];
    const restartAlert = document.getElementById('restartAlert');
    const closeRestartAlert = document.getElementById('closeRestartAlert');
    function checkRestartAlert() {
        const now = new Date();
        const pragueTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Prague' }));
        const h = pragueTime.getHours().toString().padStart(2, '0');
        const m = pragueTime.getMinutes().toString().padStart(2, '0');
        const current = `${h}:${m}`;
        for (let t of restartTimes) {
            let [th, tm] = t.split(':').map(Number);
            let restartDate = new Date(pragueTime);
            restartDate.setHours(th, tm, 0, 0);
            restartDate.setMinutes(restartDate.getMinutes() - 30);
            let alertH = restartDate.getHours().toString().padStart(2, '0');
            let alertM = restartDate.getMinutes().toString().padStart(2, '0');
            let alertTime = `${alertH}:${alertM}`;
            if (current === alertTime) {
                if (restartAlert) restartAlert.style.display = 'block';
                return;
            }
        }
        if (restartAlert) restartAlert.style.display = 'none';
    }
    if (closeRestartAlert) {
        closeRestartAlert.addEventListener('click', () => {
            if (restartAlert) restartAlert.style.display = 'none';
        });
    }
    setInterval(checkRestartAlert, 30000);
    checkRestartAlert();

    // --- VŠECHNY FUNKCE A PROMĚNNÉ PRO GENEROVÁNÍ VLAKŮ BYLY ODSTRANĚNY ---
});