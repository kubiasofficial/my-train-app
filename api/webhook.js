// api/webhook.js
// Toto je kód, který se spustí na Vercel serveru, ne ve tvém prohlížeči.
// Bude posílat zprávy na Discord webhook.
export default async function handler(request, response) {
    // Kontrola, zda je požadavek typu POST (pro webhooky)
    if (request.method === 'POST') {
        // Získá Discord Webhook URL z proměnných prostředí Vercelu
        // (To si nastavíme na Vercel.com, NIKDY to nedáváme přímo do kódu)
        const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

        if (!discordWebhookUrl) {
            return response.status(500).json({ error: 'Discord Webhook URL není nastaveno na serveru.' });
        }

        try {
            // Získá zprávu z těla požadavku, nebo použije výchozí
            const message = request.body.message || 'Testovací zpráva z Vercel Serverless Function!';

            // Odeslání zprávy na Discord Webhook
            const res = await fetch(discordWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: message }), // Odesílá se jako JSON s 'content' klíčem
            });

            // Zpracování odpovědi z Discordu
            if (res.ok) {
                response.status(200).json({ message: 'Zpráva úspěšně odeslána na Discord.' });
            } else {
                const errorData = await res.json(); // Pokusí se parsovat chybu z Discordu
                response.status(res.status).json({ error: 'Chyba při odesílání na Discord.', details: errorData });
            }
        } catch (error) {
            console.error('Chyba Serverless Function:', error);
            response.status(500).json({ error: 'Interní chyba serveru.', details: error.message });
        }
    } else {
        // Pokud požadavek není POST, vrátí chybu
        response.status(405).json({ message: 'Metoda není povolena. Použijte POST.' });
    }
}