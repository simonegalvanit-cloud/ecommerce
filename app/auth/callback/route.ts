import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Handles Supabase email confirmation and password-reset links.
// Supabase redirects here with ?code=... (PKCE flow).
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/account'

  if (code) {
    const sb = await createClient()
    const { error } = await sb.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('Auth callback error:', error.message)
  }

  // Redirect to login with an error flag so the UI can surface it
  return NextResponse.redirect(`${origin}/login?error=verification_failed`)
}
