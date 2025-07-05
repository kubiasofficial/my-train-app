// Načtení vlaků a webhook tlačítko

// Načtení vlaků a webhook tlačítko
// Načtení vlaků a webhook tlačítko
// Načtení vlaků a webhook tlačítko

// Výběr vlaku ze selectu a zobrazení detailu

document.addEventListener('DOMContentLoaded', () => {
    // --- Nový výběr vlaku podle času ---
    const allTrains = [
        // EIP 13xx trains (Warszawa Gróchow -> Krakow, via Warszawa Wschodnia)
        { number: "1301", departure: "04:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1303", departure: "05:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1305", departure: "06:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1307", departure: "07:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1309", departure: "08:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1311", departure: "09:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1313", departure: "10:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1315", departure: "11:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1317", departure: "12:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1319", departure: "13:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1321", departure: "14:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1323", departure: "15:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1325", departure: "16:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1327", departure: "17:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1329", departure: "18:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1331", departure: "19:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1333", departure: "20:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },
        { number: "1335", departure: "21:12", startStation: "Warszawa Gróchow", endStation: "Krakow", via: "Warszawa Wschodnia" },

        // EIP 31xx trains (Kraków Płaszów -> Warszawa Wschodnia, via Kraków Główny)
        { number: "3100", departure: "03:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3102", departure: "04:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3104", departure: "05:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3106", departure: "06:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3108", departure: "07:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3110", departure: "08:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3112", departure: "09:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3114", departure: "10:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3116", departure: "11:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3118", departure: "12:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3120", departure: "13:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3122", departure: "14:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3124", departure: "15:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3126", departure: "16:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3128", departure: "17:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3130", departure: "18:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3132", departure: "19:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },
        { number: "3134", departure: "20:47", startStation: "Kraków Płaszów", endStation: "Warszawa Wschodnia", via: "Kraków Główny" },

        // EIP 41xx / 45xx trains (Gliwice/Bielsko-Biała Główna -> Warszawa Wschodnia, via Katowice)
        { number: "4100", departure: "04:41", startStation: "Gliwice", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4500", departure: "05:41", startStation: "Bielsko-Biała Główna", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4102", departure: "06:41", startStation: "Gliwice", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4502", departure: "07:41", startStation: "Bielsko-Biała Główna", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4104", departure: "08:41", startStation: "Gliwice", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4504", departure: "09:41", startStation: "Bielsko-Biała Główna", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4106", departure: "10:41", startStation: "Gliwice", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4506", departure: "11:41", startStation: "Bielsko-Biała Główna", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4108", departure: "12:41", startStation: "Gliwice", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4508", departure: "13:41", startStation: "Bielsko-Biała Główna", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4110", departure: "14:41", startStation: "Gliwice", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4510", departure: "15:41", startStation: "Bielsko-Biała Główna", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4112", departure: "16:41", startStation: "Gliwice", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4512", departure: "17:41", startStation: "Bielsko-Biała Główna", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4114", departure: "18:41", startStation: "Gliwice", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4514", departure: "19:41", startStation: "Bielsko-Biała Główna", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4116", departure: "20:41", startStation: "Gliwice", endStation: "Warszawa Wschodnia", via: "Katowice" },
        { number: "4516", departure: "21:41", startStation: "Bielsko-Biała Główna", endStation: "Warszawa Wschodnia", via: "Katowice" },

        // ... další vlaky z tvého zadání ...
    ];

    const detailDiv = document.getElementById('trainDetail');
    const trainModalSection = document.getElementById('trainModalSection');
    const generateTrainBtn = document.getElementById('generateTrainBtn');
    const closeTrainModalBtn = document.getElementById('closeTrainModalBtn');

    if (generateTrainBtn) {
        generateTrainBtn.addEventListener('click', () => {
            const timeInput = document.getElementById('trainTimeInput');
            let userTime = timeInput && timeInput.value ? timeInput.value : '';
            if (!userTime) {
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
            const [h, m] = userTime.split(':').map(Number);
            const userMinutes = h * 60 + m;
            const minMinutes = userMinutes + 5;
            const maxMinutes = userMinutes + 10;
            let candidates = allTrains.filter(t => {
                const [th, tm] = t.departure.split(':').map(Number);
                const tMinutes = th * 60 + tm;
                return tMinutes >= minMinutes && tMinutes <= maxMinutes;
            });
            if (candidates.length === 0) {
                let nextTrains = allTrains
                    .map(t => {
                        const [th, tm] = t.departure.split(':').map(Number);
                        const tMinutes = th * 60 + tm;
                        return { t, tMinutes };
                    })
                    .filter(obj => obj.tMinutes > userMinutes)
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
            let message = '';
            if (selectedDuty === 'in') {
                message = `${name} právě nastoupil do služby`;
            } else if (selectedDuty === 'out') {
                message = `${name} odešel mimo službu`;
            }
            try {
                const res = await fetch('https://discord.com/api/webhooks/1390845026375831552/Wf4OvVgDoV44X-e-11SMn5yskwHHh2-DyEUohAzu853kn5TD-6_RNRrIl8LSuGVTUC1S', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: message })
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

