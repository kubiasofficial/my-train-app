// Zpracování návratu z Discord OAuth2
export default async function handler(req, res) {
  const CLIENT_ID = process.env.DISCORD_CLIENT_ID || 'DISCORD_CLIENT_ID_PLACEHOLDER';
  const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET || 'DISCORD_CLIENT_SECRET_PLACEHOLDER';
  const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'https://my-train-app-five.vercel.app/api/discord-callback';

  // Získání kódu z query stringu (funguje i na Vercelu)
  let code = null;
  if (req.query && req.query.code) {
    code = req.query.code;
  } else if (req.url && req.url.includes('code=')) {
    const url = new URL(req.url, `http://${req.headers.host}`);
    code = url.searchParams.get('code');
  }
  if (!code) {
    res.status(400).send('Chybí kód z Discordu.');
    return;
  }

  // Získání access tokenu
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', REDIRECT_URI);
  params.append('scope', 'identify');

  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  let tokenData;
  try {
    tokenData = await tokenRes.json();
  } catch (e) {
    res.status(400).send('Chyba při čtení odpovědi z Discordu.');
    return;
  }
  if (!tokenData.access_token) {
    res.status(400).send('Nepodařilo se získat access token.\n' + JSON.stringify(tokenData));
    return;
  }

  // Získání informací o uživateli
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` }
  });
  const userData = await userRes.json();

  // (Zde můžeš uložit session, cookie, atd.)
  // Přesměrování na hlavní stránku s Discord user daty v URL hash (pro localStorage)
  const safeUser = {
    id: userData.id,
    username: userData.username,
    discriminator: userData.discriminator,
    avatar: userData.avatar
  };
  const hash = encodeURIComponent(JSON.stringify(safeUser));
  res.writeHead(302, {
    Location: `/?discordUser=${hash}`
  });
  res.end();
}
