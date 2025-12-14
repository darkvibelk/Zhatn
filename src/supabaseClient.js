
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debugging: Check if keys are loaded
console.log("Supabase URL:", supabaseUrl ? "Loaded" : "Missing");
console.log("Supabase Key:", supabaseKey ? "Loaded (" + supabaseKey.substring(0, 5) + "...)" : "Missing");

if (!supabaseUrl || !supabaseKey) {
    console.error("CRITICAL: Supabase Environment Variables are missing! Check your Cloudflare settings.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
