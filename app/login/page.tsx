'use client'
import { useState, FormEvent, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
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

  const [tab, setTab]         = useState<Tab>('login')
  const [alert, setAlert]     = useState<{ msg: string; type: 'error' | 'success' } | null>(null)
  const [loading, setLoading] = useState(false)

  const [loginEmail, setLoginEmail]       = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [showLoginPwd, setShowLoginPwd]   = useState(false)

  const [regFirst, setRegFirst]     = useState('')
  const [regLast, setRegLast]       = useState('')
  const [regCompany, setRegCompany] = useState('')
  const [regEmail, setRegEmail]     = useState('')
  const [regPwd, setRegPwd]         = useState('')
  const [showRegPwd, setShowRegPwd] = useState(false)

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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #fdf8f4 0%, #f5f0ea 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 28 }}>
        <Link href="/">
          <Image src="/logo.png" alt="Briopack" width={120} height={29} style={{ height: 29, width: 'auto' }} />
        </Link>
      </div>

      {/* Card */}
      <div className="animate-fade-up" style={{
        width: '100%',
        maxWidth: 448,
        background: '#fff',
        borderRadius: 20,
        boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.09)',
        border: '1px solid rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        {/* Orange top strip */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #d4611a, #f08a3a)' }} />

        <div style={{ padding: '36px 40px 40px' }}>
          {/* Heading */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 5 }}>
              {tab === 'login' ? 'Bentornato' : 'Crea un account'}
            </div>
            <div style={{ fontSize: 13.5, color: 'var(--ink-4)', lineHeight: 1.5 }}>
              {tab === 'login'
                ? 'Accedi per gestire i tuoi ordini Briopack.'
                : 'Registrati gratuitamente e inizia a ordinare.'}
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{
            display: 'flex',
            background: 'var(--surface-2)',
            border: '1.5px solid var(--border-2)',
            borderRadius: 'var(--r-xl)',
            padding: 4,
            marginBottom: 28,
          }}>
            {(['login', 'register'] as Tab[]).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setAlert(null) }}
                style={{
                  flex: 1, padding: '9px 0',
                  fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600,
                  color: tab === t ? 'var(--ink)' : 'var(--ink-4)',
                  background: tab === t ? '#fff' : 'transparent',
                  border: 'none', borderRadius: 'var(--r-lg)', cursor: 'pointer',
                  boxShadow: tab === t ? '0 1px 6px rgba(0,0,0,0.10), 0 0 0 1px var(--border)' : 'none',
                  transition: 'all .2s var(--ease-out)',
                }}
              >
                {t === 'login' ? 'Accedi' : 'Registrati'}
              </button>
            ))}
          </div>

          {/* Alert */}
          {alert && (
            <div className={`alert ${alert.type === 'error' ? 'error' : 'success'}`} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>
                  {alert.type === 'error' ? '⚠' : '✓'}
                </span>
                {alert.msg}
              </div>
            </div>
          )}

          {/* LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <FormField label="Indirizzo email">
                <input
                  type="email"
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  placeholder="tua@email.it"
                  required
                  autoComplete="email"
                />
              </FormField>

              <FormField label="Password">
                <div style={{ position: 'relative' }}>
                  <input
                    type={showLoginPwd ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="current-password"
                    style={{ paddingRight: 46 }}
                  />
                  <EyeBtn show={showLoginPwd} onToggle={() => setShowLoginPwd(v => !v)} />
                </div>
              </FormField>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8, marginBottom: 20 }}>
                <button
                  type="button"
                  onClick={handleForgot}
                  style={{
                    background: 'none', border: 'none', fontSize: 13, color: 'var(--accent)',
                    cursor: 'pointer', fontFamily: 'var(--f)', fontWeight: 500, padding: 0,
                    textDecoration: 'underline', textDecorationColor: 'transparent',
                    transition: 'text-decoration-color .15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.textDecorationColor = 'var(--accent)')}
                  onMouseLeave={e => (e.currentTarget.style.textDecorationColor = 'transparent')}
                >
                  Password dimenticata?
                </button>
              </div>

              <SubmitBtn loading={loading}>Accedi al tuo account</SubmitBtn>

              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-5)', marginTop: 18, lineHeight: 1.6 }}>
                Amministratore? Accedi normalmente — verrai reindirizzato.
              </p>
            </form>
          )}

          {/* REGISTER */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <FormField label="Nome">
                  <input type="text" value={regFirst} onChange={e => setRegFirst(e.target.value)} placeholder="Mario" required />
                </FormField>
                <FormField label="Cognome">
                  <input type="text" value={regLast} onChange={e => setRegLast(e.target.value)} placeholder="Rossi" required />
                </FormField>
              </div>

              <FormField label="Azienda (opzionale)">
                <input type="text" value={regCompany} onChange={e => setRegCompany(e.target.value)} placeholder="Nome azienda" />
              </FormField>

              <FormField label="Indirizzo email">
                <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} placeholder="tua@email.it" required autoComplete="email" />
              </FormField>

              <FormField label="Password">
                <div style={{ position: 'relative' }}>
                  <input
                    type={showRegPwd ? 'text' : 'password'}
                    value={regPwd}
                    onChange={e => setRegPwd(e.target.value)}
                    placeholder="Minimo 6 caratteri"
                    required minLength={6}
                    autoComplete="new-password"
                    style={{ paddingRight: 46 }}
                  />
                  <EyeBtn show={showRegPwd} onToggle={() => setShowRegPwd(v => !v)} />
                </div>
              </FormField>

              <SubmitBtn loading={loading}>Crea account gratuitamente</SubmitBtn>

              <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-5)', marginTop: 18, lineHeight: 1.6 }}>
                Creando un account accetti i{' '}
                <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Termini di servizio</a>
                {' '}e la{' '}
                <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>.
              </p>
            </form>
          )}
        </div>
      </div>

      {/* Back link */}
      <div style={{ marginTop: 24 }}>
        <Link href="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 13, color: 'var(--ink-4)', textDecoration: 'none',
          fontWeight: 500, transition: 'color .15s',
        }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--ink)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink-4)')}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path d="M8 1.5L3 6.5L8 11.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Torna al negozio
        </Link>
      </div>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 600,
        color: 'var(--ink-2)', marginBottom: 7,
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function EyeBtn({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{
        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        color: 'var(--ink-4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 4, transition: 'color .15s',
      }}
    >
      {show ? (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  )
}

function SubmitBtn({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      style={{
        width: '100%', padding: '13px 20px',
        fontFamily: 'var(--f)', fontSize: 15, fontWeight: 700,
        border: 'none', borderRadius: 'var(--r)', cursor: loading ? 'not-allowed' : 'pointer',
        background: loading ? 'var(--ink-5)' : 'var(--accent)',
        color: '#fff',
        boxShadow: loading ? 'none' : 'var(--shadow-accent)',
        transition: 'all .2s var(--ease-out)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        marginTop: 4,
      }}
    >
      {loading ? (
        <>
          <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
          Caricamento…
        </>
      ) : children}
    </button>
  )
}
