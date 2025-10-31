// lib/supabase-admin.js
// ⚠️ SERVER-SIDE ONLY - Never import this in client components
// This file should ONLY be imported in:
// - API routes (app/api/*)
// - Server components
// - Server actions

import { createClient } from '@supabase/supabase-js';

const url = 'https://kntjsvnhwkneqszdhwtc.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtudGpzdm5od2tuZXFzemRod3RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTg2MDIyNSwiZXhwIjoyMDc3NDM2MjI1fQ.keFI88KjIrp1WgiNnb7lReOPSbWpDNBzFGH36XBnOxI';

// This client bypasses Row Level Security - use with caution
export const supabaseAdmin = createClient(url, serviceRoleKey, {
  auth: {
    persistSession: false, // Server-side doesn't need sessions
    autoRefreshToken: false,
  },
});

export default supabaseAdmin;
