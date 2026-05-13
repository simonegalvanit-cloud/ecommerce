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
  const [showLoginPwd, setShowLoginPwd]   = useState(false)

  // Register fields
  const [regFirst, setRegFirst]         = useState('')
  const [regLast, setRegLast]           = useState('')
  const [regCompany, setRegCompany]     = useState('')
  const [regEmail, setRegEmail]         = useState('')
  const [regPwd, setRegPwd]             = useState('')
  const [showRegPwd, setShowRegPwd]     = useState(false)

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
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Nav — mobile only */}
      <nav className="site-nav" style={{ display: 'none' }} aria-hidden="true" />

      <div style={{ flex: 1, display: 'flex', minHeight: '100vh' }}>

        {/* ── LEFT PANEL (desktop only) ── */}
        <div className="login-left-panel" style={{
          width: '40%',
          background: 'linear-gradient(135deg, #d4611a, #e8721a, #f08a3a)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '48px 52px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 70% 60% at 100% 0%, rgba(255,255,255,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 0% 100%, rgba(0,0,0,0.12) 0%, transparent 55%)',
          }} />
          <div style={{
            position: 'absolute', bottom: -80, right: -80, width: 320, height: 320,
            borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: -40, left: -40, width: 200, height: 200,
            borderRadius: '50%', background: 'rgba(0,0,0,0.06)', pointerEvents: 'none',
          }} />

          {/* Top: logo + tagline */}
          <div className="animate-fade-up" style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              fontSize: 20, fontWeight: 800, color: '#fff',
              letterSpacing: '2.5px', textTransform: 'uppercase',
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 36,
            }}>
              <span style={{ width: 9, height: 9, borderRadius: '50%', background: 'rgba(255,255,255,0.85)', flexShrink: 0 }} />
              Briopack
            </div>

            <div style={{ fontSize: 30, fontWeight: 800, color: '#fff', lineHeight: 1.22, letterSpacing: '-0.8px', marginBottom: 16 }}>
              Il packaging professionale per la tua azienda
            </div>
            <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, marginBottom: 40 }}>
              Accedi al tuo account e gestisci i tuoi ordini in un unico posto.
            </div>

            {/* Bullet points */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                'Ordini online con MOQ accessibili',
                'Consegna in 48-72h in tutta Italia',
                'Assistenza dedicata',
              ].map((text, i) => (
                <div
                  key={text}
                  className={`animate-fade-up delay-${i + 1}`}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}
                >
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'rgba(255,255,255,0.18)', border: '1.5px solid rgba(255,255,255,0.35)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: 1,
                  }}>
                    {/* Checkmark SVG */}
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6.5L4.8 9.2L10 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.88)', fontWeight: 500, lineHeight: 1.5 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom: back link */}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link href="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              color: 'rgba(255,255,255,0.65)', fontSize: 13.5, fontWeight: 500,
              textDecoration: 'none', transition: 'color .18s',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.9)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.65)')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 2L4 7L9 12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Torna al negozio
            </Link>
          </div>
        </div>

        {/* ── RIGHT PANEL (form) ── */}
        <div style={{
          flex: 1,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 24px',
          minHeight: '100vh',
        }}>
          {/* Mobile-only nav strip */}
          <div className="login-mobile-header" style={{
            display: 'none',
            width: '100%',
            maxWidth: 420,
            marginBottom: 32,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--accent)', letterSpacing: '2px', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                Briopack
              </div>
              <Link href="/" style={{ fontSize: 12.5, color: 'var(--ink-4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M8 1.5L3 6.5L8 11.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Negozio
              </Link>
            </div>
          </div>

          {/* Form card */}
          <div className="animate-fade-up" style={{ width: '100%', maxWidth: 420 }}>

            {/* Header */}
            <div style={{ marginBottom: 32 }}>
              <div style={{
                width: 54, height: 54, borderRadius: 'var(--r-lg)',
                background: 'var(--accent-bg)',
                border: '1.5px solid var(--accent-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20,
                boxShadow: '0 4px 14px rgba(232,114,26,0.15)',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.9"/>
                  <rect x="14" y="3" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.6"/>
                  <rect x="3" y="14" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.6"/>
                  <rect x="14" y="14" width="7" height="7" rx="1.5" fill="var(--accent)" opacity="0.3"/>
                </svg>
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.6px', marginBottom: 6 }}>
                {tab === 'login' ? 'Bentornato' : 'Crea un account'}
              </div>
              <div style={{ fontSize: 14, color: 'var(--ink-4)', lineHeight: 1.5 }}>
                {tab === 'login'
                  ? 'Accedi al tuo account Briopack per gestire ordini e profilo.'
                  : 'Registrati gratuitamente e inizia a ordinare.'}
              </div>
            </div>

            {/* Tab switcher — pill style */}
            <div style={{
              display: 'flex',
              background: 'var(--surface-2)',
              border: '1.5px solid var(--border-2)',
              borderRadius: 'var(--r-xl)',
              padding: 4,
              marginBottom: 28,
              position: 'relative',
            }}>
              {(['login', 'register'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setAlert(null) }}
                  style={{
                    flex: 1, padding: '10px 0',
                    fontFamily: 'var(--f)', fontSize: 13.5, fontWeight: 600,
                    color: tab === t ? 'var(--ink)' : 'var(--ink-4)',
                    background: tab === t ? 'var(--white)' : 'transparent',
                    border: 'none', borderRadius: 'var(--r-lg)', cursor: 'pointer',
                    boxShadow: tab === t ? '0 1px 6px rgba(0,0,0,0.1), 0 0 0 1px var(--border)' : 'none',
                    transition: 'all .2s var(--ease-out)',
                    letterSpacing: '0.1px',
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

            {/* ── LOGIN FORM ── */}
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
                    <button
                      type="button"
                      onClick={() => setShowLoginPwd(v => !v)}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                        color: 'var(--ink-4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 4, transition: 'color .15s',
                      }}
                      title={showLoginPwd ? 'Nascondi password' : 'Mostra password'}
                    >
                      {showLoginPwd ? (
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
                  </div>
                </FormField>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -8, marginBottom: 20 }}>
                  <button
                    type="button"
                    onClick={handleForgot}
                    style={{
                      background: 'none', border: 'none', fontSize: 13, color: 'var(--accent)',
                      cursor: 'pointer', fontFamily: 'var(--f)', fontWeight: 500,
                      textDecoration: 'underline', textDecorationColor: 'transparent',
                      transition: 'text-decoration-color .15s',
                      padding: 0,
                    }}
                    onMouseEnter={e => (e.currentTarget.style.textDecorationColor = 'var(--accent)')}
                    onMouseLeave={e => (e.currentTarget.style.textDecorationColor = 'transparent')}
                  >
                    Password dimenticata?
                  </button>
                </div>

                <SubmitBtn loading={loading}>Accedi al tuo account</SubmitBtn>

                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-5)', marginTop: 20, lineHeight: 1.6 }}>
                  Sei un amministratore? Accedi normalmente — verrai reindirizzato automaticamente.
                </p>
              </form>
            )}

            {/* ── REGISTER FORM ── */}
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
                      required
                      minLength={6}
                      autoComplete="new-password"
                      style={{ paddingRight: 46 }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPwd(v => !v)}
                      style={{
                        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                        color: 'var(--ink-4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: 4, transition: 'color .15s',
                      }}
                      title={showRegPwd ? 'Nascondi password' : 'Mostra password'}
                    >
                      {showRegPwd ? (
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
                  </div>
                </FormField>

                <SubmitBtn loading={loading}>Crea account gratuitamente</SubmitBtn>

                <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--ink-5)', marginTop: 20, lineHeight: 1.6 }}>
                  Creando un account accetti i nostri{' '}
                  <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Termini di servizio</a>
                  {' '}e la{' '}
                  <a href="#" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 768px) {
          .login-left-panel { display: none !important; }
          .login-mobile-header { display: flex !important; }
        }
        @media (min-width: 769px) {
          .login-mobile-header { display: none !important; }
        }
      `}</style>
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: 'block', fontSize: 13, fontWeight: 600,
        color: 'var(--ink-2)', marginBottom: 7, letterSpacing: '0.1px',
      }}>
        {label}
      </label>
      {children}
    </div>
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
