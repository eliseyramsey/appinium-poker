import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

// Helper to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Singleton Supabase client
let _supabase: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (!_supabase) {
    if (!isSupabaseConfigured()) {
      throw new Error("Supabase credentials not configured");
    }
    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return _supabase;
}

// Alias for getSupabase - always use this singleton
export const supabase = isSupabaseConfigured() ? getSupabase() : (null as unknown as SupabaseClient<Database>);
