// app/utils/supabase/client.ts
import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/supabase";

// 1. Keep this function (Internal use)
function createBrowserSupabaseClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// 2. EXPORT THE INSTANCE directly!
export const supabase = createBrowserSupabaseClient();
