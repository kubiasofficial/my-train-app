// Načtení vlaků a webhook tlačítko

// Načtení vlaků a webhook tlačítko
// Načtení vlaků a webhook tlačítko
// Načtení vlaků a webhook tlačítko

// Výběr vlaku ze selectu a zobrazení detailu
document.addEventListener('DOMContentLoaded', () => {
    let trains = [];
    const select = document.getElementById('trainSelect');
    const detailDiv = document.getElementById('trainDetail');

    fetch('/data/trains.json')
        .then(response => {
            if (!response.ok) throw new Error('Chyba při načítání dat vlaků.');
            return response.json();
        })
        .then(data => {
            trains = data;
            if (!Array.isArray(trains) || trains.length === 0) {
                select.innerHTML = '<option>Žádné vlaky k výběru</option>';
                return;
            }
            select.innerHTML = trains.map((train, idx) => `<option value="${idx}">${train.type} ${train.number} - ${train.route}</option>`).join('');
            showTrainDetail(trains[0]);
        })
        .catch(() => {
            select.innerHTML = '<option>Chyba při načítání vlaků</option>';
        });

    select.addEventListener('change', (e) => {
        const idx = select.value;
        if (trains[idx]) showTrainDetail(trains[idx]);
    });

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
