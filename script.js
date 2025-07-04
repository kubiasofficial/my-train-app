// Zde bude později tvůj seznam allTrains
const allTrains = []; // Zatim prazdne, pozdeji doplnime data

document.addEventListener('DOMContentLoaded', () => {
    console.log('Aplikace se načetla.');

    const testWebhookButton = document.getElementById('testWebhookButton');
    if (testWebhookButton) {
        testWebhookButton.addEventListener('click', async () => {
            try {
                // Voláme naši Serverless Function na Vercelu (když bude nasazena)
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

// Zde bude další logika pro zobrazování vlaků, filtrování atd.