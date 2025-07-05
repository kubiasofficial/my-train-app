// Přesměrování na Discord OAuth2 autorizační URL
export default async function handler(req, res) {
  const CLIENT_ID = process.env.DISCORD_CLIENT_ID || 'DISCORD_CLIENT_ID_PLACEHOLDER';
  const REDIRECT_URI = process.env.DISCORD_REDIRECT_URI || 'https://my-train-app-five.vercel.app/api/discord-callback';
  const SCOPE = 'identify';
  const STATE = Math.random().toString(36).substring(2, 15); // jednoduchý CSRF token

  const discordAuthUrl =
    `https://discord.com/oauth2/authorize?response_type=code` +
    `&client_id=${encodeURIComponent(CLIENT_ID)}` +
    `&scope=${encodeURIComponent(SCOPE)}` +
    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
    `&state=${encodeURIComponent(STATE)}`;

  res.writeHead(302, { Location: discordAuthUrl });
  res.end();
}
