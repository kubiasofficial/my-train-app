// --- Zaměstnanci paletka a status ---
const employees = [
    {
        id: '417061947759001600',
        name: 'kubiasofficial',
        currentStatus: 'Neznámý' // Přidáme pole pro uchování aktuálního stavu
    }
    // Další zaměstnance lze přidat sem
];

const employeeBtn = document.getElementById('employeeBtn');
const employeePalette = document.getElementById('employeePalette');
const employeeList = document.getElementById('employeeList');
const employeeStatusTableBody = document.querySelector('#employeeStatusTable tbody'); // Získáváme tbody element
const statusMessageDiv = document.getElementById('statusMessage'); // Pro zprávy o odeslání statusu

let selectedEmployee = null;

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
        statusCell.className = statusClass;
        statusCell.textContent = statusText;
    } else {
        // Pokud řádek existuje, aktualizovat status
        const statusCell = row.cells[1];
        statusCell.className = statusClass;
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
    // Pro ukázku: Můžete zde načíst data z localStorage nebo z backendu
    // a poté volat updateEmployeeStatusInTable pro každého zaměstnance.
    employees.forEach(emp => {
        // Zde byste mohli mít logiku pro načtení skutečného statusu
        // Např. let storedStatus = localStorage.getItem(`status_${emp.id}`);
        // if (storedStatus) {
        //     updateEmployeeStatusInTable(emp.name, storedStatus === 'in');
        // } else {
            updateEmployeeStatusInTable(emp.name, emp.currentStatus === 'Ve službě');
        // }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // Načíst počáteční statusy při načtení stránky
    loadInitialEmployeeStatuses();

    if (employeeBtn) {
        employeeBtn.addEventListener('click', () => {
            employeePalette.style.display = employeePalette.style.display === 'none' ? 'block' : 'none';
            // Zrušeno: employeeStatusTable.style.display = 'none'; protože se teď zobrazuje jinde
            
            // Vygeneruj seznam zaměstnanců
            employeeList.innerHTML = '';
            employees.forEach(emp => {
                const btn = document.createElement('button');
                btn.textContent = emp.name;
                // Původní inline styly pro tlačítka v paletce jsou přesunuty do style.css
                btn.onclick = () => {
                    selectedEmployee = emp;
                    employeePalette.style.display = 'none'; // Zavřít paletku po výběru
                    // showEmployeeStatusTable(emp); // Tuto funkci už nebudeme volat, stav je v tabulce
                    // Můžete sem přidat logiku pro zobrazení potvrzení o výběru zaměstnance
                    statusMessageDiv.textContent = `Vybrán zaměstnanec: ${emp.name}`;
                    setTimeout(() => statusMessageDiv.textContent = '', 3000); // Zpráva zmizí za 3s
                };
                employeeList.appendChild(btn);
            });
        });
    }

    // Původní "Služba" tlačítko a logika
    const dutyButton = document.getElementById('dutyButton');
    const dutyDropdown = document.getElementById('dutyDropdown');
    const dutyType = document.getElementById('dutyType');
    const nameInputDiv = document.getElementById('nameInputDiv');
    const userNameInput = document.getElementById('userName');
    let selectedDuty = '';

    if (dutyButton) {
        dutyButton.addEventListener('click', () => {
            dutyDropdown.style.display = dutyDropdown.style.display === 'none' ? 'block' : 'none';
            // Skrýt paletku zaměstnanců, pokud je otevřená
            employeePalette.style.display = 'none';
        });

        dutyType.addEventListener('change', () => {
            selectedDuty = dutyType.value;
            // Automaticky předvyplnit jméno, pokud je vybrán zaměstnanec
            if (selectedEmployee) {
                userNameInput.value = selectedEmployee.name;
            } else {
                userNameInput.value = ''; // Vyčistit, pokud není vybrán žádný
            }

            if (selectedDuty === 'in' || selectedDuty === 'out') {
                nameInputDiv.style.display = 'block';
            } else {
                nameInputDiv.style.display = 'none';
            }
        });

        document.getElementById('sendDutyBtn').addEventListener('click', async () => {
            const name = userNameInput.value.trim();
            const empToUpdate = employees.find(emp => emp.name === name);

            if (!selectedDuty || !name) {
                alert('Vyberte typ služby a zadejte své jméno.');
                return;
            }
            if (!empToUpdate) {
                alert('Zadané jméno zaměstnance nebylo nalezeno v seznamu.');
                return;
            }

            // Discord embed + emoji
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
                    statusMessageDiv.textContent = 'Zpráva byla úspěšně odeslána!';
                    statusMessageDiv.style.color = '#43b581'; // Zelená barva pro úspěch
                    updateEmployeeStatusInTable(name, selectedDuty === 'in'); // Aktualizovat status v tabulce
                    dutyDropdown.style.display = 'none';
                    dutyType.value = '';
                    userNameInput.value = '';
                    nameInputDiv.style.display = 'none';
                } else {
                    statusMessageDiv.textContent = 'Chyba při odesílání na Discord.';
                    statusMessageDiv.style.color = '#e53935'; // Červená barva pro chybu
                }
            } catch (e) {
                statusMessageDiv.textContent = 'Chyba při odesílání na Discord.';
                statusMessageDiv.style.color = '#e53935'; // Červená barva pro chybu
            }
            setTimeout(() => statusMessageDiv.textContent = '', 5000); // Zpráva zmizí za 5s
        });
    }

    // --- Zbytek vašeho původního script.js kódu (restart alert, načítání vlaků, generování vlaku) ---
    // Ponechán beze změn, stačí ho zkopírovat pod výše uvedené úpravy.

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
                let departureObj = train.stops.find(s => s.departureTime);
                let departure = departureObj ? departureObj.departureTime : '';
                let startStation = train.stops[0]?.station || '';
                let endStation = train.stops[train.stops.length - 1]?.station || '';
                return {
                    number: train.number,
                    departure,
                    startStation,
                    endStation,
                    via: train.route,
                    type: train.type,
                    maxSpeed: train.maxSpeed,
                    validFrom: train.validFrom,
                    stops: train.stops
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
            const timeInput = document.getElementById('trainTimeInput');
            let userTime = timeInput && timeInput.value ? timeInput.value : '';
            let simrailTimeValue = null; // Assuming simrailTimeValue is defined elsewhere if used
            if (!userTime) {
                if (simrailTimeValue) {
                    userTime = simrailTimeValue;
                } else {
                    try {
                        const now = new Date();
                        const pragueTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Prague' }));
                        let h = pragueTime.getHours();
                        let m = pragueTime.getMinutes();
                        userTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                    } catch (e) {
                        alert('Nepodařilo se zjistit aktuální čas v ČR.');
                        return;
                    }
                }
            }
            const [h, m] = userTime.split(':').map(Number);
            const userMinutes = h * 60 + m;
            const minMinutes = userMinutes + 5;
            const maxMinutes = userMinutes + 10;
            let candidates = allTrains.filter(t => {
                if (!t.departure) return false;
                const [th, tm] = t.departure.split(':').map(Number);
                const tMinutes = th * 60 + tm;
                return tMinutes >= minMinutes && tMinutes <= maxMinutes;
            });
            if (candidates.length === 0) {
                let nextTrains = allTrains
                    .map(t => {
                        if (!t.departure) return null;
                        const [th, tm] = t.departure.split(':').map(Number);
                        const tMinutes = th * 60 + tm;
                        return { t, tMinutes };
                    })
                    .filter(obj => obj && obj.tMinutes > userMinutes)
                    .sort((a, b) => a.tMinutes - b.tMinutes);
                if (nextTrains.length > 0) {
                    const train = nextTrains[0].t;
                    detailDiv.innerHTML = `<div style="color:#c00;margin-bottom:8px;">Žádný vlak v rozmezí 5-10 minut po zadaném čase.<br>Nejbližší další vlak:</div>`;
                    showRandomTrainDetail(train);
                } else {
                    const firstTrain = allTrains[0];
                    detailDiv.innerHTML = `<div style="color:#c00;margin-bottom:8px;">Žádný vlak v rozmezí 5-10 minut po zadaném čase.<br>Další vlak jede až další den:</div>`;
                    showRandomTrainDetail(firstTrain);
                }
            } else {
                const train = candidates[Math.floor(Math.random() * candidates.length)];
                showRandomTrainDetail(train);
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
            <h3>${train.type || ''} ${train.number || ''} - ${train.route || ''}</h3>
            <p>Max rychlost: ${train.maxSpeed || '-'}, Platnost od: ${train.validFrom || '-'}</p>
            <h4>Zastávky:</h4>
            <ul>
                ${Array.isArray(train.stops) ? train.stops.map(stop => `
                    <li>
                        ${stop.station || ''}:
                        ${stop.arrivalTime ? `Příjezd: ${stop.arrivalTime}` : ''}
                        ${stop.departureTime ? `Odjezd: ${stop.departureTime}` : ''}
                    </li>
                `).join('') : '<li>Žádné zastávky</li>'}
            </ul>
        `;
    }
});