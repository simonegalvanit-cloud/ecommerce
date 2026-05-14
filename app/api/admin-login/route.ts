import { NextRequest, NextResponse } from 'next/server'

const TOKEN_KEY = 'bp_admin_bypass'
const TOKEN_VAL = 'briopack_admin_2025'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPass  = process.env.ADMIN_PASS

  if (!adminEmail || !adminPass) {
    return NextResponse.json(
      { error: 'Admin credentials not configured. Set ADMIN_EMAIL and ADMIN_PASS in environment variables.' },
      { status: 500 }
    )
  }

  if (
    email?.trim().toLowerCase() === adminEmail.toLowerCase() &&
    password === adminPass
  ) {
    const res = NextResponse.json({
      ok: true,
      name: process.env.ADMIN_NAME || 'Admin',
    })
    // httpOnly so JS can't read the cookie — middleware validates it server-side
    res.cookies.set(TOKEN_KEY, TOKEN_VAL, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8, // 8 hours
    })
    return res
  }

  // Fixed delay to prevent timing-based email enumeration
  await new Promise(r => setTimeout(r, 400))
  return NextResponse.json({ error: 'Credenziali non valide.' }, { status: 401 })
}
