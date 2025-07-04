// Serverless funkce pro odeslání zprávy na Discord webhook
export default async function handler(request, response) {
    if (request.method === 'POST') {
        const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
        if (!discordWebhookUrl) {
            return response.status(500).json({ error: 'Discord Webhook URL není nastaveno na serveru.' });
        }
        try {
            const message = request.body.message || 'Testovací zpráva z Vercel Serverless Function!';
            const res = await fetch(discordWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: message })
            });
            if (res.ok) {
                response.status(200).json({ message: 'Zpráva úspěšně odeslána na Discord.' });
            } else {
                const errorData = await res.json();
                response.status(res.status).json({ error: 'Chyba při odesílání na Discord.', details: errorData });
            }
        } catch (error) {
            response.status(500).json({ error: 'Interní chyba serveru.', details: error.message });
        }
    } else {
        response.status(405).json({ error: 'Method Not Allowed' });
    }
}
