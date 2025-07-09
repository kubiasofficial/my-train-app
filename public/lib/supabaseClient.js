// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mdlvszaufcchjnlvxlgo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function updateStatus(status) {
  const userStr = localStorage.getItem('discordUser');
  if (!userStr) return;
  let user;
  try { user = JSON.parse(userStr); } catch { return; }
  let username = user.username;
  if (user.discriminator && user.discriminator !== "0") {
    username += "#" + user.discriminator;
  }
  const { error, data } = await supabase.from('users_status').upsert({
    discord_id: user.id,
    username: username,
    status: status,
    updated_at: new Date().toISOString()
  }, { onConflict: ['discord_id'] });
  if (error) {
    console.error('Chyba při zápisu do Supabase:', error);
  } else {
    console.log('Zápis do Supabase OK:', data);
  }
}

// Somewhere in your code where you want to update the status
import { updateStatus } from '/lib/supabaseClient.js';

// ...

await updateStatus('ve službě');


