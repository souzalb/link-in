import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Note: This client uses the SERVICE ROLE KEY. 
// It bypasses RLS and can interact with the Auth API.
// NEVER use this on the client-side. ONLY inside secure Server Actions or API Routes.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
