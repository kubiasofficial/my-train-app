// script.js

// Načteme data o vlacích ze souboru trains.json
let allTrains = [];

document.addEventListener('DOMContentLoaded', async () => {
    console.log('Aplikace se načetla.');

    // Načtení dat o vlacích
    try {
        const response = await fetch('/data/trains.json');
        if (!response.ok) {
            // Pokud response není OK (např. 404 Not Found), logujeme stav
            console.error(`Chyba HTTP! Status: ${response.status}, Status Text: ${response.statusText}, URL: ${response.url}`);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allTrains = await response.json();
        console.log('Načtená data vlaků:', allTrains);

        displayTrains(allTrains);
    } catch (error) {
        console.error('Chyba při načítání dat vlaků:', error);
        // Zkuste také logovat celou chybu, pokud není typu Error
        if (error instanceof TypeError) {
            console.error('Pravděpodobná chyba sítě nebo CORS:', error.message);
        } else if (error instanceof Error) {
            console.error('Konkrétní chyba:', error.message);
        }
        const appContainer = document.getElementById('app-container');
        appContainer.innerHTML = '<p>Nepodařilo se načíst data vlaků. Zkuste to prosím později.</p>';
    }

    // ... zbytek kódu ...

    // --- Logika pro tlačítko Discord Webhook (zůstává stejná) ---
    const testWebhookButton = document.getElementById('testWebhookButton');
    if (testWebhookButton) {
        testWebhookButton.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/webhook', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: 'Ahoj z testu vlakové aplikace z Vercel Serverless Function!' })
                });
                const data = await response.json();
                if (response.ok) {
                    alert(data.message);
                } else {
                    alert('Chyba: ' + (data.error || 'Neznámá chyba'));
                    console.error(data.details);
                }
            } catch (error) {
                console.error('Chyba při odesílání testu:', error);
                alert('Nastala chyba při odesílání požadavku.');
            }
        });
    }
});

// Funkce pro zobrazení vlaků na stránce
function displayTrains(trainsToDisplay) {
    const appContainer = document.getElementById('app-container');
    appContainer.innerHTML = ''; // Vymažeme starý obsah

    if (trainsToDisplay.length === 0) {
        appContainer.innerHTML = '<p>Žádné vlaky k zobrazení.</p>';
        return;
    }

    const ul = document.createElement('ul');
    trainsToDisplay.forEach(train => {
        const li = document.createElement('li');
        li.innerHTML = `
            <h3>${train.type} ${train.number} - ${train.route}</h3>
            <p>Max rychlost: ${train.maxSpeed}, Platnost od: ${train.validFrom}</p>
            <h4>Zastávky:</h4>
            <ul>
                ${train.stops.map(stop => `
                    <li>
                        ${stop.station}:
                        ${stop.arrivalTime ? `Příjezd: ${stop.arrivalTime}` : ''}
                        ${stop.departureTime ? `Odjezd: ${stop.departureTime}` : ''}
                    </li>
                `).join('')}
            </ul>
        `;
        ul.appendChild(li);
    });
    appContainer.appendChild(ul);
}