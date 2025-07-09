// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://mdlvszaufcchjnlvxlgo.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'

export const supabase = createClient(supabaseUrl, supabaseKey)

import { supabase } from '/lib/supabaseClient.js';

async function updateStatus(status) {
  const userStr = localStorage.getItem('discordUser');
  if (!userStr) return;
  let user;
  try { user = JSON.parse(userStr); } catch { return; }
  // Pokud máš nový Discord účet, discriminator může být undefined
  let username = user.username;
  if (user.discriminator && user.discriminator !== "0") {
    username += "#" + user.discriminator;
  }
  await supabase.from('users_status').upsert({
    discord_id: user.id,
    username: username,
    status: status,
    updated_at: new Date().toISOString()
  }, { onConflict: ['discord_id'] });
}
