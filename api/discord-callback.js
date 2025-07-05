// Zpracování návratu z Discord OAuth2
export default async function handler(req, res) {
  const CLIENT_ID = process.env.DISCORD_CLIENT_ID || 'DISCORD_CLIENT_ID_PLACEHOLDER';
  const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'DISCORD_CLIENT_SECRET_PLACEHOLDER';
  const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'https://my-train-app-five.vercel.app/api/discord-callback';

  const code = req.query.code;
  if (!code) {
    res.status(400).send('Chybí kód z Discordu.');
    return;
  }

  // Získání access tokenu
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      scope: 'identify'
    })
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    res.status(400).send('Nepodařilo se získat access token.');
    return;
  }

  // Získání informací o uživateli
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const userData = await userRes.json();

  // (Zde můžeš uložit session, cookie, atd.)
  // Prozatím jen zobrazíme info o uživateli
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<h2>Přihlášení úspěšné!</h2><pre>${JSON.stringify(userData, null, 2)}</pre><a href=\"/\">Zpět na hlavní stránku</a>`);
}
