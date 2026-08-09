import { NextRequest, NextResponse } from 'next/server'

const TOKEN_KEY = 'bp_admin_bypass'

interface AdminAccount { email: string; pass: string; name?: string }

function getAccounts(): AdminAccount[] {
  if (process.env.ADMIN_ACCOUNTS) {
    try { return JSON.parse(process.env.ADMIN_ACCOUNTS) } catch {}
  }
  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASS) {
    return [{ email: process.env.ADMIN_EMAIL, pass: process.env.ADMIN_PASS, name: process.env.ADMIN_NAME || 'Admin' }]
  }
  return []
}

// In-memory rate limiter: max 5 attempts per 15 min per IP
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000

function getIP(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  )
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now()
  const entry = attempts.get(ip)

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, resetIn: WINDOW_MS }
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return { allowed: false, remaining: 0, resetIn: entry.resetAt - now }
  }

  entry.count++
  return { allowed: true, remaining: MAX_ATTEMPTS - entry.count, resetIn: entry.resetAt - now }
}

export async function POST(req: NextRequest) {
  const ip = getIP(req)
  const { allowed, remaining, resetIn } = checkRateLimit(ip)

  if (!allowed) {
    const minutes = Math.ceil(resetIn / 60000)
    return NextResponse.json(
      { error: `Troppi tentativi. Riprova tra ${minutes} minut${minutes === 1 ? 'o' : 'i'}.` },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(resetIn / 1000)) } }
    )
  }

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
    // Reset attempt count on success
    attempts.delete(ip)
    const res = NextResponse.json({ ok: true, name: match.name || 'Admin' })
    res.cookies.set(TOKEN_KEY, tokenVal, {
      httpOnly: true,
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 8,
    })
    return res
  }

  // Fixed delay to prevent timing attacks
  await new Promise(r => setTimeout(r, 400))
  return NextResponse.json(
    { error: `Credenziali non valide. Tentativi rimasti: ${remaining}.` },
    { status: 401 }
  )
}
