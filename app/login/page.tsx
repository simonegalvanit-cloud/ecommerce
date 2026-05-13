'use client'
import { useState, FormEvent, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Tab = 'login' | 'register'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const next         = searchParams.get('next') || '/account'
  const sb           = createClient()

  const [tab, setTab]       = useState<Tab>('login')
  const [alert, setAlert]   = useState<{ msg: string; type: 'error' | 'success' } | null>(null)
  const [loading, setLoading] = useState(false)

  // Login fields
  const [loginEmail, setLoginEmail]       = useState('')
  const [loginPassword, setLoginPassword] = useState('')

  // Register fields
  const [regFirst, setRegFirst]     = useState('')
  const [regLast, setRegLast]       = useState('')
  const [regCompany, setRegCompany] = useState('')
  const [regEmail, setRegEmail]     = useState('')
  const [regPwd, setRegPwd]         = useState('')

  async function redirectAfterLogin(userId: string) {
    const { data: profile } = await sb.from('profiles').select('role').eq('id', userId).single()
    router.push(profile?.role === 'admin' ? '/admin' : next)
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setAlert(null); setLoading(true)
    const { data, error } = await sb.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    if (error) { setAlert({ msg: 'Email o password non corretti. Riprova.', type: 'error' }); setLoading(false); return }
    await redirectAfterLogin(data.user.id)
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    setAlert(null); setLoading(true)
    const { data, error } = await sb.auth.signUp({
      email: regEmail, password: regPwd,
      options: { data: { full_name: `${regFirst} ${regLast}`, company: regCompany } }
    })
    if (error) { setAlert({ msg: error.message, type: 'error' }); setLoading(false); return }
    if (regCompany && data.user) {
      await sb.from('profiles').update({ company: regCompany }).eq('id', data.user.id)
    }
    if (data.session) {
      await redirectAfterLogin(data.user!.id)
    } else {
      setAlert({ msg: "Controlla la tua email per confermare l'account, poi accedi.", type: 'success' })
      setLoading(false)
    }
  }

  async function handleForgot() {
    if (!loginEmail) { setAlert({ msg: 'Inserisci la tua email prima di procedere.', type: 'error' }); return }
    const { error } = await sb.auth.resetPasswordForEmail(loginEmail, { redirectTo: window.location.origin + '/login' })
    if (error) { setAlert({ msg: error.message, type: 'error' }); return }
    setAlert({ msg: 'Email di recupero inviata. Controlla la tua casella.', type: 'success' })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      {/* Nav */}
      <nav className="site-nav">
        <Link href="/" className="logo"><span className="logo-pip" />Briopack</Link>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13.5, fontWeight: 500, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, transition: 'color .18s' }}>
          ← Torna al negozio
        </Link>
      </nav>

      {/* Card */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 24px' }}>
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-xl)', padding: 40, width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ width: 52, height: 52, borderRadius: 'var(--r-lg)', background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 22 }}>📦</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.5px' }}>Bentornato</div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginTop: 4 }}>Accedi al tuo account Briopack</div>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border-2)', borderRadius: 'var(--r-lg)', padding: 3, marginBottom: 28, background: 'var(--surface-2)' }}>
            {(['login', 'register'] as Tab[]).map(t => (
              <button key={t} onClick={() => { setTab(t); setAlert(null) }}
                style={{ flex: 1, padding: '9px 0', fontFamily: 'var(--f)', fontSize: 13.5, fontWeight: 600, color: tab === t ? 'var(--ink)' : 'var(--ink-3)', background: tab === t ? 'var(--white)' : 'transparent', border: 'none', borderRadius: 'var(--r)', cursor: 'pointer', boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition: 'all .18s' }}>
                {t === 'login' ? 'Accedi' : 'Registrati'}
              </button>
            ))}
          </div>

          {/* Alert */}
          {alert && (
            <div style={{ padding: '10px 14px', borderRadius: 'var(--r)', fontSize: 13.5, fontWeight: 500, marginBottom: 16, background: alert.type === 'error' ? 'var(--red-bg)' : 'var(--green-bg)', color: alert.type === 'error' ? 'var(--red)' : 'var(--green)', border: `1px solid ${alert.type === 'error' ? 'rgba(217,48,37,0.2)' : 'rgba(30,126,52,0.2)'}` }}>
              {alert.msg}
            </div>
          )}

          {/* Login form */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <FormField label="Email"><input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} placeholder="tua@email.it" required autoComplete="email" /></FormField>
              <FormField label="Password"><input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="••••••••" required autoComplete="current-password" /></FormField>
              <div style={{ textAlign: 'right', marginTop: -8, marginBottom: 16 }}>
                <button type="button" onClick={handleForgot} style={{ background: 'none', border: 'none', fontSize: 12.5, color: 'var(--ink-3)', cursor: 'pointer', fontFamily: 'var(--f)' }}>Password dimenticata?</button>
              </div>
              <SubmitBtn loading={loading}>Accedi</SubmitBtn>
              <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-4)', marginTop: 20, lineHeight: 1.55 }}>
                Sei un amministratore? Accedi con le tue credenziali admin e verrai reindirizzato automaticamente.
              </p>
            </form>
          )}

          {/* Register form */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <FormField label="Nome"><input type="text" value={regFirst} onChange={e => setRegFirst(e.target.value)} placeholder="Mario" required /></FormField>
                <FormField label="Cognome"><input type="text" value={regLast} onChange={e => setRegLast(e.target.value)} placeholder="Rossi" required /></FormField>
              </div>
              <FormField label="Azienda (opzionale)"><input type="text" value={regCompany} onChange={e => setRegCompany(e.target.value)} placeholder="Nome azienda" /></FormField>
              <FormField label="Email"><input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="tua@email.it" required autoComplete="email" /></FormField>
              <FormField label="Password"><input type="password" value={regPwd} onChange={e => setRegPwd(e.target.value)} placeholder="Minimo 6 caratteri" required minLength={6} autoComplete="new-password" /></FormField>
              <SubmitBtn loading={loading}>Crea account</SubmitBtn>
              <p style={{ textAlign: 'center', fontSize: 12.5, color: 'var(--ink-4)', marginTop: 20, lineHeight: 1.55 }}>
                Creando un account accetti i nostri <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Termini di servizio</a>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}

function SubmitBtn({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading}
      style={{ width: '100%', padding: '12px', fontFamily: 'var(--f)', fontSize: 15, fontWeight: 700, border: 'none', borderRadius: 'var(--r)', cursor: loading ? 'not-allowed' : 'pointer', background: 'var(--accent)', color: '#fff', opacity: loading ? 0.6 : 1, marginTop: 4, transition: 'all .2s' }}>
      {loading ? 'Caricamento…' : children}
    </button>
  )
}
