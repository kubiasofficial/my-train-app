document.addEventListener('DOMContentLoaded', () => {
    // Načtení dat vlaků
    fetch('/data/trains.json')
        .then(response => {
            if (!response.ok) throw new Error('Chyba při načítání dat vlaků.');
            return response.json();
        })
        .then(trains => {
            displayTrains(trains);
        })
        .catch(() => {
            const appContainer = document.getElementById('app-container');
            if (appContainer) appContainer.innerHTML = '<p>Nepodařilo se načíst data vlaků.</p>';
        });

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

function displayTrains(trains) {
    const appContainer = document.getElementById('app-container');
    if (!appContainer) return;
    if (!Array.isArray(trains)) {
        appContainer.innerHTML = '<p>Chybný formát dat.</p>';
        return;
    }
    if (trains.length === 0) {
        appContainer.innerHTML = '<p>Žádné vlaky nenalezeny.</p>';
        return;
    }
    const ul = document.createElement('ul');
    ul.className = 'trains-list';
    trains.forEach(train => {
        const li = document.createElement('li');
        li.className = 'train';
        li.innerHTML = `
            <strong>${train.type || ''} ${train.number || ''}</strong><br>
            Trasa: ${train.route || '-'}<br>
            Max. rychlost: ${train.maxSpeed || '-'}<br>
            Platí od: ${train.validFrom || '-'}<br>
            Zastávky: ${Array.isArray(train.stops) ? train.stops.map(stop => stop.station).join(', ') : '-'}
        `;
        ul.appendChild(li);
    });
    appContainer.innerHTML = '';
    appContainer.appendChild(ul);
}
