import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  // Surfaced as a friendly setup screen by ConfigGate, not a crash.
  console.warn('Beacon: Supabase env vars are missing. See ConfigGate.');
}

export const supabase = url && anonKey ? createClient(url, anonKey) : null;
export const isSupabaseConfigured = Boolean(url && anonKey);
