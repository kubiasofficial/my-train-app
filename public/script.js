// Načtení vlaků a webhook tlačítko

// Načtení vlaků a webhook tlačítko
// Načtení vlaků a webhook tlačítko
// Načtení vlaků a webhook tlačítko

// Výběr vlaku ze selectu a zobrazení detailu

document.addEventListener('DOMContentLoaded', () => {
    // --- Restart alert ---
    const restartTimes = ["01:30", "08:30", "15:30"];
    const restartAlert = document.getElementById('restartAlert');
    const closeRestartAlert = document.getElementById('closeRestartAlert');
    function checkRestartAlert() {
        const now = new Date();
        // CET = UTC+1, v létě CEST = UTC+2, použij čas v Praze
        const pragueTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Prague' }));
        const h = pragueTime.getHours().toString().padStart(2, '0');
        const m = pragueTime.getMinutes().toString().padStart(2, '0');
        const current = `${h}:${m}`;
        // Pro každou restart time spočítej "restart - 30min"
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
    setInterval(checkRestartAlert, 30000); // kontrola každých 30s
    checkRestartAlert();

    // --- Nový výběr vlaku podle času ---
    let allTrains = [];
    fetch('data/trains.json')
        .then(response => response.json())
        .then(data => {
            // Převod z JSON do formátu používaného aplikací
            allTrains = data.map(train => {
                // Najdi první odjezd (departureTime) v poli stops
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

    // ...původní webhook tlačítko...

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

    // Služba tlačítko a logika
    const dutyButton = document.getElementById('dutyButton');
    const dutyDropdown = document.getElementById('dutyDropdown');
    const dutyType = document.getElementById('dutyType');
    const nameInputDiv = document.getElementById('nameInputDiv');
    const userNameInput = document.getElementById('userName');
    let selectedDuty = '';
    if (dutyButton) {
        dutyButton.addEventListener('click', () => {
            dutyDropdown.style.display = dutyDropdown.style.display === 'none' ? 'block' : 'none';
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
            if (!selectedDuty || !name) {
                alert('Vyberte typ služby a zadejte své jméno.');
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
                    alert('Zpráva byla úspěšně odeslána!');
                    dutyDropdown.style.display = 'none';
                    dutyType.value = '';
                    userNameInput.value = '';
                    nameInputDiv.style.display = 'none';
                } else {
                    alert('Chyba při odesílání na Discord.');
                }
            } catch (e) {
                alert('Chyba při odesílání na Discord.');
            }
        });
    }
});

