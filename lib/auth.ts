import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'asadalbalad29@gmail.com'

/**
 * Checks if the current request is authenticated as the designated admin.
 * Uses the same email-based check as the middleware and admin layout.
 * Returns the user object if admin, or null if unauthorized.
 */
export async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  if (user.email !== ADMIN_EMAIL) return null
  return user
}
