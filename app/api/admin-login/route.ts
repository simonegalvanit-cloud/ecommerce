import { NextRequest, NextResponse } from 'next/server'

const TOKEN_KEY = 'bp_admin_bypass'

interface AdminAccount { email: string; pass: string; name?: string }

function getAccounts(): AdminAccount[] {
  // Multi-account: ADMIN_ACCOUNTS='[{"email":"a@b.com","pass":"x","name":"Alice"},...]'
  if (process.env.ADMIN_ACCOUNTS) {
    try { return JSON.parse(process.env.ADMIN_ACCOUNTS) } catch {}
  }
  // Single-account fallback: legacy ADMIN_EMAIL / ADMIN_PASS
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASS) {
    return [{ email: process.env.ADMIN_EMAIL, pass: process.env.ADMIN_PASS, name: process.env.ADMIN_NAME || 'Admin' }]
  }
  return []
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  const tokenVal = process.env.ADMIN_SESSION_TOKEN
  if (!tokenVal) {
    return NextResponse.json({ error: 'ADMIN_SESSION_TOKEN not configured.' }, { status: 500 })
  }

  const accounts = getAccounts()
  if (accounts.length === 0) {
    return NextResponse.json(
      { error: 'No admin accounts configured. Set ADMIN_ACCOUNTS or ADMIN_EMAIL/ADMIN_PASS in environment variables.' },
      { status: 500 }
    )
  }

  const match = accounts.find(
    a => a.email.toLowerCase() === email?.trim().toLowerCase() && a.pass === password
  )

  if (match) {
    const res = NextResponse.json({ ok: true, name: match.name || 'Admin' })
    res.cookies.set(TOKEN_KEY, tokenVal, {
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
