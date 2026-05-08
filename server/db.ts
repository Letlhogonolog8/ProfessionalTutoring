import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { log } from "./vite";

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL environment variable is required");
  }

  const key = serviceRoleKey || anonKey;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY or SUPABASE_ANON_KEY environment variable is required");
  }

  if (serviceRoleKey) {
    log("Connecting to Supabase with service role key (RLS bypassed)", "db");
  } else {
    log("WARNING: Using anon key — Supabase RLS may block server operations. Set SUPABASE_SERVICE_ROLE_KEY in .env", "db");
  }

  _client = createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  },
});
