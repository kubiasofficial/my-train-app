    // --- Vzít vlak a Kdo co dělá ---
    // const takeTrainBtn = document.getElementById('takeTrainBtn');
    // const takeTrainModal = document.getElementById('takeTrainModal');
    // const takeTrainModalContent = document.getElementById('takeTrainModalContent');
    // const closeTakeTrainModalBtn = document.getElementById('closeTakeTrainModalBtn');
    const whoDoingTable = document.getElementById('whoDoingTable');
    let activeTrainWidgets = [];

    function renderWhoDoingTable() {
        // Vykreslit oddělenou tabulku pro "Kdo co dělá"
        let html = `<table class="who-doing-table">
            <thead>
                <tr>
                    <th>Zaměstnanec</th>
                    <th>Vlak</th>
                    <th>Odjezd</th>
                    <th>Akce</th>
                </tr>
            </thead>
            <tbody>
        `;
        if (activeTrainWidgets.length === 0) {
            html += `<tr><td colspan="4" style="text-align:center;color:#888;">Nikdo aktuálně nepřevzal žádný vlak.</td></tr>`;
        } else {
            activeTrainWidgets.forEach(widget => {
                html += `
                    <tr class="who-doing-row">
                        <td class="who-doing-name">${widget.employee}</td>
                        <td class="who-doing-train">🚆 ${widget.trainNumber}</td>
                        <td class="who-doing-time">${widget.departureTime}</td>
                        <td><button class="end-route-btn" data-employee="${widget.employee}">Ukončit trasu</button></td>
                    </tr>
                `;
            });
        }
        html += `</tbody></table>`;
        whoDoingTable.innerHTML = html;
        // Eventy pro tlačítka
        whoDoingTable.querySelectorAll('.end-route-btn').forEach(btn => {
            btn.onclick = () => showEndRouteModal(btn.getAttribute('data-employee'));
        });
    }

    // Funkce showTakeTrainModal a logika pro "Vzít vlak" byla odstraněna na přání uživatele.

    function showEndRouteModal(employeeName) {
        // Ukončení trasy pro daného zaměstnance
        takeTrainModalContent.innerHTML = `
            <h2>Ukončit trasu</h2>
            <label>Jméno zaměstnance:</label><br>
            <select id="endRouteEmployeeSelect"><option value="">Vyberte...</option>${employees.map(emp => `<option value="${emp.name}">${emp.name}</option>`).join('')}</select><br><br>
            <label>Čas ukončení:</label><br>
            <input type="time" id="endRouteTimeInput"><br><br>
            <button id="confirmEndRouteBtn" class="duty-red">Ukončit trasu</button>
        `;
        takeTrainModal.style.display = 'flex';
        document.getElementById('endRouteEmployeeSelect').value = employeeName;
        document.getElementById('confirmEndRouteBtn').onclick = () => {
            const emp = document.getElementById('endRouteEmployeeSelect').value;
            const endTime = document.getElementById('endRouteTimeInput').value;
            if (!emp || !endTime) {
                takeTrainModalContent.innerHTML += `<div style=\"color:#e53935;margin-top:8px;\">Vyplňte všechny údaje!</div>`;
                return;
            }
            // Najít a odstranit widget
            const widget = activeTrainWidgets.find(w => w.employee === emp);
            activeTrainWidgets = activeTrainWidgets.filter(w => w.employee !== emp);
            renderWhoDoingTable();
            takeTrainModal.style.display = 'none';

            // (Volitelně) Odeslat zprávu na Discord o ukončení trasy
            if (widget) {
                const webhookUrl = 'https://discord.com/api/webhooks/1390989690072727605/IwgaE5140eg1RVJuIgC8hmjGpi-IhC5pYCAzRJqstgtFVkuzQ8YadyR4TWhXC9UysbMv';
                const train = allTrains.find(t => t.number === widget.trainNumber);
                const embed = {
                    color: 0xe53935,
                    title: '🏁 Ukončení trasy',
                    description: `**${emp}** právě ukončil trasu vlaku **${widget.trainNumber}**${train && train.startStation && train.endStation ? ` (${train.startStation} → ${train.endStation})` : ''} v čase **${endTime}**.`,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: 'Multi-Cargo Doprava',
                        icon_url: 'https://cdn.discordapp.com/emojis/1140725956576686201.webp?size=96&quality=lossless'
                    }
                };
                fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ embeds: [embed] })
                });
            }
        };
    }

    // Odebráno: event listenery a logika pro tlačítko "Vzít vlak" a modální okno
    // Animace pro widgety (CSS doplním níže)
    renderWhoDoingTable();
// --- Zaměstnanci paletka a status ---
const employees = [
    {
        id: '417061947759001600',
        name: 'kubiasofficial',
        currentStatus: 'Neznámý'
    },
    {
        id: '1350594297250185331',
        name: 'Vašíček_Andrejka',
        currentStatus: 'Neznámý'
    }
    // Další zaměstnance lze přidat sem
];

const employeeBtn = document.getElementById('employeeBtn');
const employeePalette = document.getElementById('employeePalette');
const employeeList = document.getElementById('employeeList');
const employeeStatusTableBody = document.querySelector('#employeeStatusTable tbody'); // Získáváme tbody element
const actionStatusMessage = document.getElementById('actionStatusMessage'); // Pro zprávy o akcích

const selectedEmployeeInfo = document.getElementById('selectedEmployeeInfo'); // Nový rodičovský element pro lepší kontrolu
const selectedEmployeeDisplay = document.getElementById('selectedEmployeeDisplay'); // Nový element pro zobrazení jména
const employeeStatusActions = document.getElementById('employeeStatusActions');   // Nový element pro tlačítka "Do služby" / "Mimo službu"

const empInBtn = document.getElementById('empInBtn');
const empOutBtn = document.getElementById('empOutBtn');


let selectedEmployee = null; // Toto bude uchovávat celého vybraného zaměstnance

// Funkce pro aktualizaci/přidání statusu zaměstnance do tabulky
function updateEmployeeStatusInTable(empName, inDuty) {
    let row = document.getElementById(`status-row-${empName.replace(/\s/g, '-')}`); // ID řádku podle jména
    const statusText = inDuty ? '🟢 Ve službě' : '🔴 Mimo službu';
    const statusClass = inDuty ? 'status-in-service' : 'status-out-of-service';

    if (!row) {
        // Pokud řádek neexistuje, vytvořit nový
        row = employeeStatusTableBody.insertRow();
        row.id = `status-row-${empName.replace(/\s/g, '-')}`;

        const nameCell = row.insertCell(0);
        nameCell.textContent = empName;

        const statusCell = row.insertCell(1);
        statusCell.className = statusClass; // Nastaví třídu pro barvu textu
        statusCell.textContent = statusText;
    } else {
        // Pokud řádek existuje, aktualizovat status
        const statusCell = row.cells[1];
        statusCell.className = statusClass; // Aktualizuje třídu pro barvu textu
        statusCell.textContent = statusText;
    }

    // Aktualizovat status v poli employees
    const empIndex = employees.findIndex(emp => emp.name === empName);
    if (empIndex !== -1) {
        employees[empIndex].currentStatus = inDuty ? 'Ve službě' : 'Mimo službu';
    }
}

// Funkce pro načtení počátečních statusů (pokud byste je chtěli načítat např. z localStorage)
function loadInitialEmployeeStatuses() {
    // Inicializovat tabulku se známými zaměstnanci
    employees.forEach(emp => {
        // Zde byste mohli načíst skutečný status z localStorage nebo API
        // Prozatím zobrazíme jejich výchozí 'Neznámý' nebo co mají v currentStatus
        updateEmployeeStatusInTable(emp.name, emp.currentStatus === 'Ve službě');
    });
}

// Funkce pro zobrazení zprávy
function showStatusMessage(message, isError = false) {
    actionStatusMessage.textContent = message;
    actionStatusMessage.style.color = isError ? '#e53935' : '#43b581';
    setTimeout(() => actionStatusMessage.textContent = '', 5000); // Zpráva zmizí za 5s
}

// Funkce pro odeslání stavu zaměstnance na Discord
async function sendEmployeeStatus(emp, inDuty) {
    const embed = {
        color: inDuty ? 0x43b581 : 0xe53935,
        title: inDuty ? '🚦 Zaměstnanec ve službě' : '🏁 Zaměstnanec mimo službu',
        description: `**${emp.name}** je nyní ${inDuty ? 've službě! \u{1F7E2}' : 'mimo službu. \u{1F534}'}`,
        // thumbnail: { url: emp.avatar }, // Předpokládá, že 'avatar' pole existuje v objektu zaměstnance
        timestamp: new Date().toISOString(),
        footer: {
            text: 'Multi-Cargo Doprava',
            icon_url: 'https://cdn.discordapp.com/emojis/1140725956576686201.webp?size=96&quality=lossless'
        }
    };
    try {
        const res = await fetch('https://discord.com/api/webhooks/1390845026375831552/Wf4OvVgDoV44X-e-11SMn5yskwHHh2-DyEUohAzu853kn5TD-6_RNRrIl8LSuGVTUC1S', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        if (res.ok) {
            showStatusMessage('Zpráva byla úspěšně odeslána!');
            updateEmployeeStatusInTable(emp.name, inDuty); // Aktualizovat status v tabulce
            // Po odeslání skrýt akce pro zaměstnance a resetovat výběr
            selectedEmployeeDisplay.style.display = 'none';
            employeeStatusActions.style.display = 'none';
            selectedEmployee = null;
        } else {
            showStatusMessage('Chyba při odesílání na Discord.', true);
        }
    } catch (e) {
        showStatusMessage('Chyba při odesílání na Discord.', true);
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Načíst počáteční statusy při načtení stránky
    loadInitialEmployeeStatuses();

    // Při načtení stránky tlačítka "Do služby" a "Mimo službu" skryj
    if (employeeStatusActions) {
        employeeStatusActions.style.display = 'none';
    }

    if (employeeBtn) {
        employeeBtn.addEventListener('click', () => {
            // Skrýt ostatní panely (dutyDropdown už neexistuje)
            if (typeof trainModalSection !== 'undefined' && trainModalSection) trainModalSection.style.display = 'none';

            // Toggle paletky zaměstnanců
            const isPaletteVisible = employeePalette.style.display === 'block';
            employeePalette.style.display = isPaletteVisible ? 'none' : 'block';

            // Skrýt vybraného zaměstnance a jeho tlačítka vždy při otevření/zavření paletky
            selectedEmployeeDisplay.style.display = 'none';
            if (employeeStatusActions) employeeStatusActions.style.display = 'none';
            selectedEmployee = null; // Zrušit výběr zaměstnance

            if (!isPaletteVisible) {
                // Pokud se paletka otevírá, vygeneruj seznam zaměstnanců
                employeeList.innerHTML = '';
                employees.forEach(emp => {
                    const btn = document.createElement('button');
                    btn.textContent = emp.name;
                    btn.onclick = () => {
                        selectedEmployee = emp; // Uložit celého zaměstnance
                        employeePalette.style.display = 'none'; // Zavřít paletku po výběru

                        selectedEmployeeDisplay.textContent = `Vybraný zaměstnanec: ${emp.name}`;
                        selectedEmployeeDisplay.style.display = 'block'; // Zobrazit jméno vybraného
                        if (employeeStatusActions) employeeStatusActions.style.display = 'flex';   // Zobrazit tlačítka Do/Mimo službu
                        showStatusMessage(`Vybrán zaměstnanec: ${emp.name}`); // Zpráva o výběru
                    };
                    employeeList.appendChild(btn);
                });
            }
        });
    }

    // Event listenery pro tlačítka "Do služby" a "Mimo službu"
    if (empInBtn) {
        empInBtn.addEventListener('click', () => {
            if (selectedEmployee) {
                sendEmployeeStatus(selectedEmployee, true); // True pro "Do služby"
            } else {
                showStatusMessage('Nejprve vyberte zaměstnance.', true);
            }
        });
    }
    if (empOutBtn) {
        empOutBtn.addEventListener('click', () => {
            if (selectedEmployee) {
                sendEmployeeStatus(selectedEmployee, false); // False pro "Mimo službu"
            } else {
                showStatusMessage('Nejprve vyberte zaměstnance.', true);
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
    let lastGeneratedTrainNumber = null;
    fetch('data/trains.json')
        .then(response => response.json())
        .then(data => {
            allTrains = data.map(train => {
                // Nový formát: spawn, from, to, ...
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
        });

    const detailDiv = document.getElementById('trainDetail');
    const trainModalSection = document.getElementById('trainModalSection');
    const generateTrainBtn = document.getElementById('generateTrainBtn');
    const closeTrainModalBtn = document.getElementById('closeTrainModalBtn');
    function findNextTrain(afterMinutes = null, excludeNumber = null) {
        // Najde nejbližší vlak po zadaném čase (v minutách), kromě excludeNumber
        let now = new Date();
        let pragueTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Prague' }));
        let h = pragueTime.getHours();
        let m = pragueTime.getMinutes();
        let currentMinutes = afterMinutes !== null ? afterMinutes : (h * 60 + m);
        let nextTrain = null;
        let minDiff = Infinity;
        allTrains.forEach(train => {
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
        } else {
            detailDiv.innerHTML = `<div style="color:#c00;margin-bottom:8px;">Žádný další vlak už dnes neodjíždí. Zkuste to zítra.</div>`;
        }
    }

    if (generateTrainBtn) {
        generateTrainBtn.addEventListener('click', () => {
            if (!allTrains.length) {
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
            if (!allTrains.length) return;
            // Najít další vlak po stejném čase, ale jiný než naposledy vygenerovaný
            let now = new Date();
            let pragueTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Prague' }));
            let h = pragueTime.getHours();
            let m = pragueTime.getMinutes();
            let currentMinutes = h * 60 + m;
            // Pokud už byl nějaký vlak vygenerován, použijeme jeho čas jako "od"
            let lastTrain = allTrains.find(t => t.number === lastGeneratedTrainNumber);
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