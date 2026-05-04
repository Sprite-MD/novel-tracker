import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _browser: SupabaseClient | null = null
let _server: SupabaseClient | null = null

export function getSupabaseBrowser(): SupabaseClient {
  if (!_browser) {
    _browser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return _browser
}

export function getSupabaseServer(): SupabaseClient {
  if (!_server) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    _server = createClient(url, key)
  }
  return _server
}

// Convenience aliases used in route handlers and server components
export const supabaseServer = {
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabaseServer().from(...args),
}

export const supabaseBrowser = {
  from: (...args: Parameters<SupabaseClient['from']>) => getSupabaseBrowser().from(...args),
}
