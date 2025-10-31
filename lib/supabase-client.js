// lib/supabase-client.js
// ✅ SAFE - Uses anon key for client-side access
// This file can be imported in browser code

import { createClient } from '@supabase/supabase-js';

const url = 'https://kntjsvnhwkneqszdhwtc.supabase.co';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudGpzdm5od2tuZXFzemRod3RjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4NjAyMjUsImV4cCI6MjA3NzQzNjIyNX0.JDcEqs-uuN8o7iYiWB99fywjvl4N8OUrOpx2v_tS-p4';

// This client has limited permissions based on Row Level Security policies
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export default supabase;
