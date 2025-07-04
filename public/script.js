// Načtení vlaků a webhook tlačítko

// Načtení vlaků a webhook tlačítko
// Načtení vlaků a webhook tlačítko
// Načtení vlaků a webhook tlačítko

// Výběr vlaku ze selectu a zobrazení detailu

document.addEventListener('DOMContentLoaded', () => {
    // --- Nový výběr vlaku podle času ---
    const allTrains = [
        // ... zde budou všechny vlaky podle zadání ...
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
        // ... (další vlaky z tvého zadání, pro přehlednost zkráceno) ...
    ];

    const select = document.getElementById('trainSelect');
    const detailDiv = document.getElementById('trainDetail');

    // Skryj select, přidej nové tlačítko a input
    select.style.display = 'none';
    const customDiv = document.createElement('div');
    customDiv.style.textAlign = 'center';
    customDiv.style.marginBottom = '18px';
    customDiv.innerHTML = `
        <input type="time" id="userTime" style="padding:7px 14px;border-radius:6px;border:1px solid #bfc9d1;font-size:1rem;" required>
        <button id="randomTrainBtn" style="margin-left:12px;">Vyber vlak podle času</button>
    `;
    select.parentNode.insertBefore(customDiv, select);

    document.getElementById('randomTrainBtn').addEventListener('click', () => {
        const userTime = document.getElementById('userTime').value;
        if (!userTime) {
            alert('Zadej aktuální čas!');
            return;
        }
        // Najdi vlaky 5-10 minut po zadaném čase
        const [h, m] = userTime.split(':').map(Number);
        const userMinutes = h * 60 + m;
        const minMinutes = userMinutes + 5;
        const maxMinutes = userMinutes + 10;
        const candidates = allTrains.filter(t => {
            const [th, tm] = t.departure.split(':').map(Number);
            const tMinutes = th * 60 + tm;
            return tMinutes >= minMinutes && tMinutes <= maxMinutes;
        });
        if (candidates.length === 0) {
            detailDiv.innerHTML = '<p style="color:#c00;">Žádný vlak v rozmezí 5-10 minut po zadaném čase.</p>';
            return;
        }
        const train = candidates[Math.floor(Math.random() * candidates.length)];
        showRandomTrainDetail(train);
    });

    function showRandomTrainDetail(train) {
        detailDiv.innerHTML = `
            <h3>EIP/IC/EC ${train.number} (${train.startStation} → ${train.endStation})</h3>
            <p>Odjezd: <b>${train.departure}</b> &nbsp; | &nbsp; Přes: ${train.via ? train.via : '-'}</p>
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

    // Webhook tlačítko
    const testWebhookButton = document.getElementById('testWebhookButton');
    if (testWebhookButton) {
        testWebhookButton.addEventListener('click', async () => {
            try {
                const res = await fetch('/api/webhook', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: 'Testovací zpráva z aplikace!' })
                });
                const data = await res.json();
                alert(data.message || data.error);
            } catch (e) {
                alert('Chyba při odesílání na Discord.');
            }
        });
    }
});

