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

    // --- Nový výběr vlaku podle času ---
    let allTrains = [];
    let filteredTrains = [];
    let lastGeneratedTrainNumber = null;
    const trainTypeFilter = document.getElementById('trainTypeFilter');
    fetch('data/trains.json')
        .then(response => response.json())
        .then(data => {
            allTrains = data.map(train => {
                return {
                    number: train.number,
                    departure: train.spawn || '',
                    startStation: train.from || '',
                    endStation: train.to || '',
                    type: train.type || '',
                    vehicle: train.vehicle || '',
                    length: train.length || '',
                    weight: train.weight || '',
                    vmax: train.vmax || '',
                };
            });
            updateFilteredTrains();
        });

    function updateFilteredTrains() {
        const selectedType = trainTypeFilter ? trainTypeFilter.value : '';
        if (!selectedType) {
            filteredTrains = allTrains;
        } else {
            filteredTrains = allTrains.filter(t => t.type === selectedType);
        }
    }

    if (trainTypeFilter) {
        trainTypeFilter.addEventListener('change', () => {
            updateFilteredTrains();
        });
    }

// --- Převzetí a ukončení jízdy ---
let currentTakenTrain = null;
const takeOverTrainBtn = document.getElementById('takeOverTrainBtn');
const endRideBtn = document.getElementById('endRideBtn');
const takeOverEmployeeSelect = document.getElementById('takeOverEmployeeSelect');

function showTrainActionButtons(show) {
    if (takeOverTrainBtn) takeOverTrainBtn.style.display = show ? 'inline-block' : 'none';
    if (takeOverEmployeeSelect) {
        takeOverEmployeeSelect.style.display = show ? 'inline-block' : 'none';
        if (show) {
            // Naplnit select zaměstnanci ve službě
            takeOverEmployeeSelect.innerHTML = '<option value="">Vyberte zaměstnance...</option>' + employees.filter(e => e.currentStatus === 'Ve službě').map(e => `<option value="${e.name}">${e.name}</option>`).join('');
        }
    }
    if (endRideBtn) endRideBtn.style.display = show && currentTakenTrain ? 'inline-block' : 'none';
}

function getSelectedEmployeeName() {
    // Vrátí jméno vybraného zaměstnance, pokud je ve službě
    // Vrátí jméno vybraného zaměstnance z selectu
    if (takeOverEmployeeSelect && takeOverEmployeeSelect.value) {
        return takeOverEmployeeSelect.value;
    }
    return null;
}

if (takeOverTrainBtn) {
    takeOverTrainBtn.addEventListener('click', async () => {
        if (!lastGeneratedTrainNumber) return;
        const train = allTrains.find(t => t.number === lastGeneratedTrainNumber);
        const empName = getSelectedEmployeeName();
        if (!empName) {
            alert('Nejprve vyberte zaměstnance a dejte ho do služby!');
            return;
        }
        currentTakenTrain = train;
        showTrainActionButtons(true);
        // Odeslat na Discord
        const webhookUrl = 'https://discord.com/api/webhooks/1390989690072727605/IwgaE5140eg1RVJuIgC8hmjGpi-IhC5pYCAzRJqstgtFVkuzQ8YadyR4TWhXC9UysbMv';
        const embed = {
            color: 0x43b581,
            title: '🚆 Převzetí vlaku',
            description: `**${empName}** právě převzal vlak číslo **${train.number}** (${train.startStation} → ${train.endStation})\nTyp: ${train.type || '-'} | Vozidlo: ${train.vehicle || '-'} | Odjezd: ${train.departure}`,
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Multi-Cargo Doprava',
                icon_url: 'https://cdn.discordapp.com/emojis/1140725956576686201.webp?size=96&quality=lossless'
            }
        };
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
        } catch (e) {}
    });
}

if (endRideBtn) {
    endRideBtn.addEventListener('click', async () => {
        if (!currentTakenTrain) return;
        const empName = getSelectedEmployeeName();
        if (!empName) {
            alert('Nejprve vyberte zaměstnance a dejte ho do služby!');
            return;
        }
        // Odeslat na Discord
        const webhookUrl = 'https://discord.com/api/webhooks/1390989690072727605/IwgaE5140eg1RVJuIgC8hmjGpi-IhC5pYCAzRJqstgtFVkuzQ8YadyR4TWhXC9UysbMv';
        const train = currentTakenTrain;
        const embed = {
            color: 0xe53935,
            title: '🏁 Ukončení jízdy',
            description: `**${empName}** právě ukončil jízdu vlaku **${train.number}** (${train.startStation} → ${train.endStation})\nTyp: ${train.type || '-'} | Vozidlo: ${train.vehicle || '-'} | Odjezd: ${train.departure}`,
            timestamp: new Date().toISOString(),
            footer: {
                text: 'Multi-Cargo Doprava',
                icon_url: 'https://cdn.discordapp.com/emojis/1140725956576686201.webp?size=96&quality=lossless'
            }
        };
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ embeds: [embed] })
            });
        } catch (e) {}
        currentTakenTrain = null;
        showTrainActionButtons(false);
    });
}

    const detailDiv = document.getElementById('trainDetail');
    const trainModalSection = document.getElementById('trainModalSection');
    const generateTrainBtn = document.getElementById('generateTrainBtn');
    const closeTrainModalBtn = document.getElementById('closeTrainModalBtn');
    function findNextTrain(afterMinutes = null, excludeNumber = null) {
        // Najde nejbližší vlak po zadaném čase (v minutách), kromě excludeNumber, pouze z filtrovaných vlaků
        let now = new Date();
        let pragueTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Prague' }));
        let h = pragueTime.getHours();
        let m = pragueTime.getMinutes();
        let currentMinutes = afterMinutes !== null ? afterMinutes : (h * 60 + m);
        let nextTrain = null;
        let minDiff = Infinity;
        (filteredTrains.length ? filteredTrains : allTrains).forEach(train => {
            if (excludeNumber && train.number === excludeNumber) return;
            let dep = train.departure;
            if (!dep) return;
            let [th, tm] = dep.split(':').map(Number);
            let trainMinutes = th * 60 + tm;
            let diff = trainMinutes - currentMinutes;
            if (diff >= 0 && diff < minDiff) {
                minDiff = diff;
                nextTrain = train;
            }
        });
        return nextTrain;
    }

    function showTrainWithHeader(train, headerText) {
        if (train) {
            detailDiv.innerHTML = `
                <div class="train-modal" style="position:relative;">
                    <div style="position:absolute;top:18px;right:18px;z-index:2;">
                        <span class="info-tooltip-container">
                            <span class="info-tooltip-icon">?</span>
                            <span class="info-tooltip-text">
                                Ber v úvahu, že uvedený čas spawnu je čas, kdy se vlak spawne, ale někdy může trvat až 5 min, než se vlak dostane do hratelné oblasti, kde si pak můžeš vlak převzít.<br><br>
                                <b>Doporučuje se si najít vlak na online mapách.</b>
                            </span>
                        </span>
                    </div>
                    <div style="color:#43b581;margin-bottom:8px;">${headerText}</div>
                    <div id="trainDetailInner"></div>
                </div>
            `;
            // Vložíme detail vlaku do vnitřního divu
            const trainDetailInner = document.getElementById('trainDetailInner');
            if (trainDetailInner) showTrainDetail(train, trainDetailInner);
            // Zobrazit tlačítka Převzít/Ukončit jízdu
            showTrainActionButtons(true);
        } else {
            detailDiv.innerHTML = `<div style="color:#c00;margin-bottom:8px;">Žádný další vlak už dnes neodjíždí. Zkuste to zítra.</div>`;
            showTrainActionButtons(false);
        }
    }

    if (generateTrainBtn) {
        generateTrainBtn.addEventListener('click', () => {
            if (!(filteredTrains.length || allTrains.length)) {
                detailDiv.innerHTML = '<div style="color:#c00;">Vlaky se načítají, zkuste to za chvíli...</div>';
                trainModalSection.style.display = 'block';
                return;
            }
            let nextTrain = findNextTrain();
            lastGeneratedTrainNumber = nextTrain ? nextTrain.number : null;
            showTrainWithHeader(nextTrain, 'Nejbližší vlak ke spawnu (odjezdu) podle aktuálního času:');
            trainModalSection.style.display = 'block';
        });
    }

    // Nové tlačítko "Vybrat jiný spoj"
    const chooseOtherTrainBtn = document.getElementById('chooseOtherTrainBtn');
    if (chooseOtherTrainBtn) {
        chooseOtherTrainBtn.addEventListener('click', () => {
            if (!(filteredTrains.length || allTrains.length)) return;
            // Najít další vlak po stejném čase, ale jiný než naposledy vygenerovaný
            let now = new Date();
            let pragueTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Prague' }));
            let h = pragueTime.getHours();
            let m = pragueTime.getMinutes();
            let currentMinutes = h * 60 + m;
            // Pokud už byl nějaký vlak vygenerován, použijeme jeho čas jako "od"
            let lastTrain = (filteredTrains.length ? filteredTrains : allTrains).find(t => t.number === lastGeneratedTrainNumber);
            let afterMinutes = currentMinutes;
            if (lastTrain && lastTrain.departure) {
                let [th, tm] = lastTrain.departure.split(':').map(Number);
                let lastDep = th * 60 + tm;
                afterMinutes = lastDep;
            }
            let nextOther = findNextTrain(afterMinutes, lastGeneratedTrainNumber);
            lastGeneratedTrainNumber = nextOther ? nextOther.number : null;
            showTrainWithHeader(nextOther, 'Další možný vlak ke spawnu (odjezdu):');
        });
    }

    if (closeTrainModalBtn) {
        closeTrainModalBtn.addEventListener('click', () => {
            trainModalSection.style.display = 'none';
            detailDiv.innerHTML = '';
        });
    }

    function showRandomTrainDetail(train) {
        detailDiv.innerHTML = `
            <h3>EIP/IC/EC ${train.number} (${train.startStation} → ${train.endStation}) 🚄</h3>
            <p>Odjezd: <b>${train.departure}</b> &nbsp; | &nbsp; Přes: ${train.via ? train.via : '-'} &nbsp; <span style="font-size:1.3em;">🕒</span></p>
        `;
    }

    function showTrainDetail(train, targetDiv = detailDiv) {
        if (!train) {
            targetDiv.innerHTML = '';
            return;
        }
        targetDiv.innerHTML = `
            <h3>${train.type || ''} ${train.number || ''} (${train.startStation} → ${train.endStation})</h3>
            <p>Vozidlo: ${train.vehicle || '-'} | Délka: ${train.length || '-'} | Váha: ${train.weight || '-'} | Vmax: ${train.vmax || '-'} km/h</p>
            <p>Odjezd (spawn): <b>${train.departure || '-'}</b></p>
        `;
    }
});