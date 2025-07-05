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
            // Skrýt ostatní panely
            dutyDropdown.style.display = 'none';
            trainModalSection.style.display = 'none';

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


    // Původní "Služba" tlačítko a logika (pro ruční zadání jména)
    const dutyButton = document.getElementById('dutyButton');
    const dutyDropdown = document.getElementById('dutyDropdown');
    const dutyType = document.getElementById('dutyType');
    const nameInputDiv = document.getElementById('nameInputDiv');
    const userNameInput = document.getElementById('userName');
    let selectedDuty = '';

    if (dutyButton) {
        dutyButton.addEventListener('click', () => {
            // Skrýt ostatní panely a vybraného zaměstnance s jeho tlačítky
            employeePalette.style.display = 'none';
            selectedEmployeeDisplay.style.display = 'none';
            employeeStatusActions.style.display = 'none';
            selectedEmployee = null; // Zrušit výběr zaměstnance

            // Toggle dutyDropdown
            dutyDropdown.style.display = dutyDropdown.style.display === 'none' ? 'block' : 'none';
            
            // Resetovat dropdown a input jména při otevření
            dutyType.value = '';
            userNameInput.value = '';
            nameInputDiv.style.display = 'none';
        });

        dutyType.addEventListener('change', () => {
            selectedDuty = dutyType.value;
            if (selectedDuty === 'in' || selectedDuty === 'out') {
                nameInputDiv.style.display = 'block';
            } else {
                nameInputDiv.style.display = 'none';
            }
        });

        document.getElementById('sendDutyBtn').addEventListener('click', async () => {
            const name = userNameInput.value.trim();
            let empToUpdate = employees.find(emp => emp.name === name);

            if (!selectedDuty || !name) {
                showStatusMessage('Vyberte typ služby a zadejte své jméno.', true);
                return;
            }
            if (!empToUpdate) {
                // Pokud zadané jméno neodpovídá žádnému ze seznamu, ale přesto chceme odeslat.
                if (!confirm('Zadané jméno zaměstnance není v seznamu. Chcete přesto odeslat hlášení? Tabulka se aktualizuje pouze pro existující zaměstnance.')) {
                    return;
                }
                // Vytvořit dočasného "dummy" zaměstnance pro Discord, aby se zpráva odeslala
                // Jeho stav se NEBUDE aktualizovat v lokální tabulce zaměstnanců, protože není v `employees` poli.
                empToUpdate = { id: 'manual_entry', name: name, currentStatus: 'Neznámý' };
            }

            // Odeslání na Discord
            let embed = {
                color: selectedDuty === 'in' ? 0x43b581 : 0xe53935,
                title: selectedDuty === 'in' ? '🚦 Nastoupení do služby' : '🏁 Odchod mimo službu',
                description: selectedDuty === 'in'
                    ? `**${name}** právě nastoupil do služby! \u{1F7E2}`
                    : `**${name}** odešel mimo službu. \u{1F534}`,
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
                    // Aktualizovat status v tabulce POUZE pokud zaměstnanec existuje v původním seznamu
                    if (employees.some(emp => emp.name === name)) {
                         updateEmployeeStatusInTable(name, selectedDuty === 'in');
                    }
                    dutyDropdown.style.display = 'none';
                    dutyType.value = '';
                    userNameInput.value = '';
                    nameInputDiv.style.display = 'none';
                } else {
                    showStatusMessage('Chyba při odesílání na Discord.', true);
                }
            } catch (e) {
                showStatusMessage('Chyba při odesílání na Discord.', true);
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
    if (generateTrainBtn) {
        generateTrainBtn.addEventListener('click', () => {
            if (!allTrains.length) {
                detailDiv.innerHTML = '<div style="color:#c00;">Vlaky se načítají, zkuste to za chvíli...</div>';
                trainModalSection.style.display = 'block';
                return;
            }
            // Získat aktuální čas v ČR
            let now = new Date();
            let pragueTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Prague' }));
            let h = pragueTime.getHours();
            let m = pragueTime.getMinutes();
            let currentMinutes = h * 60 + m;

            // Najít vlak, který má nejbližší spawn (odjezd z první stanice) po aktuálním čase
            let nextTrain = null;
            let minDiff = Infinity;
            allTrains.forEach(train => {
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

            if (nextTrain) {
                detailDiv.innerHTML = `<div style="color:#43b581;margin-bottom:8px;">Nejbližší vlak ke spawnu (odjezdu) podle aktuálního času:</div>`;
                showTrainDetail(nextTrain);
            } else {
                detailDiv.innerHTML = `<div style="color:#c00;margin-bottom:8px;">Žádný vlak už dnes neodjíždí. Zkuste to zítra.</div>`;
            }
            trainModalSection.style.display = 'block';
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

    function showTrainDetail(train) {
        if (!train) {
            detailDiv.innerHTML = '';
            return;
        }
        detailDiv.innerHTML = `
            <h3>${train.type || ''} ${train.number || ''} (${train.startStation} → ${train.endStation})</h3>
            <p>Vozidlo: ${train.vehicle || '-'} | Délka: ${train.length || '-'} | Váha: ${train.weight || '-'} | Vmax: ${train.vmax || '-'} km/h</p>
            <p>Odjezd (spawn): <b>${train.departure || '-'}</b></p>
        `;
    }
});