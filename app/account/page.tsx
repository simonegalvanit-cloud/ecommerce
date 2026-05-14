'use client'
import { useState, useEffect, FormEvent, ReactElement } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Section = 'dashboard' | 'orders' | 'profile' | 'security'

interface Profile {
  full_name: string | null
  company: string | null
  phone: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  country: string | null
}

interface Order {
  id: string
  created_at: string
  total_eur: number | null
  status: string
}

const STATUS_LABEL: Record<string, string> = {
  pending:    'In attesa',
  paid:       'Pagato',
  processing: 'In lavorazione',
  shipped:    'Spedito',
  delivered:  'Consegnato',
  cancelled:  'Annullato',
  refunded:   'Rimborsato',
}

const STATUS_BADGE: Record<string, string> = {
  pending:    'badge badge-yellow',
  paid:       'badge badge-green',
  processing: 'badge badge-blue',
  shipped:    'badge badge-orange',
  delivered:  'badge badge-green',
  cancelled:  'badge badge-red',
  refunded:   'badge badge-gray',
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status] || 'badge badge-gray'
  return <span className={cls}>{STATUS_LABEL[status] || status}</span>
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function AccountPage() {
  const router = useRouter()
  const sb = createClient()

  const [section, setSection] = useState<Section>('dashboard')
  const [userId, setUserId] = useState<string>('')
  const [email, setEmail] = useState<string>('')
  const [profile, setProfile] = useState<Profile>({ full_name: null, company: null, phone: null, address: null, city: null, postal_code: null, country: 'Italia' })
  const [orders, setOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)

  // Profile form state
  const [fullName, setFullName] = useState('')
  const [company, setCompany] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('Italia')
  const [profileAlert, setProfileAlert] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  // Security form state
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showConfirmPwd, setShowConfirmPwd] = useState(false)
  const [secAlert, setSecAlert] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [changingPwd, setChangingPwd] = useState(false)

  // Stats
  const [statOrders, setStatOrders] = useState<number>(0)
  const [statSpent, setStatSpent] = useState<number>(0)
  const [statPending, setStatPending] = useState<number>(0)
  const [userRole, setUserRole] = useState<string>('cliente')

  useEffect(() => {
    ;(async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (!session) {
        router.push('/login?next=/account')
        return
      }
      setUserId(session.user.id)
      setEmail(session.user.email ?? '')

      const { data: prof } = await sb.from('profiles').select('*').eq('id', session.user.id).single()
      if (prof) {
        setProfile(prof)
        setUserRole(prof.role || 'cliente')
        if (prof.role === 'admin') { router.push('/admin'); return }
        setFullName(prof.full_name || '')
        setCompany(prof.company || '')
        setPhone(prof.phone || '')
        setAddress(prof.address || '')
        setCity(prof.city || '')
        setPostalCode(prof.postal_code || '')
        setCountry(prof.country || 'Italia')
      }

      const { data: ord } = await sb.from('orders').select('*').eq('customer_email', session.user.email ?? '').order('created_at', { ascending: false })
      const all = (ord || []) as Order[]
      setOrders(all)
      setStatOrders(all.length)
      setStatSpent(all.reduce((s, o) => s + (o.total_eur || 0), 0))
      setStatPending(all.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length)
    })()
  }, [])

  async function loadOrders() {
    if (loadingOrders) return
    setLoadingOrders(true)
    const { data } = await sb.from('orders').select('*').eq('customer_email', email).order('created_at', { ascending: false })
    setOrders((data || []) as Order[])
    setLoadingOrders(false)
  }

  function goTo(s: Section) {
    setSection(s)
    if (s === 'orders' && userId) loadOrders()
  }

  async function saveProfile(e: FormEvent) {
    e.preventDefault()
    setSavingProfile(true)
    const { error } = await sb.from('profiles').update({ full_name: fullName, company, phone, address, city, postal_code: postalCode, country }).eq('id', userId)
    if (error) {
      setProfileAlert({ msg: `Errore: ${error.message}`, type: 'error' })
    } else {
      setProfile(prev => ({ ...prev, full_name: fullName, company, phone, address, city, postal_code: postalCode, country }))
      setProfileAlert({ msg: 'Profilo aggiornato con successo.', type: 'success' })
      setTimeout(() => setProfileAlert(null), 3000)
    }
    setSavingProfile(false)
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault()
    if (newPwd !== confirmPwd) { setSecAlert({ msg: 'Le password non coincidono.', type: 'error' }); return }
    setChangingPwd(true)
    const { error } = await sb.auth.updateUser({ password: newPwd })
    if (error) {
      setSecAlert({ msg: error.message, type: 'error' })
    } else {
      setSecAlert({ msg: 'Password aggiornata con successo.', type: 'success' })
      setNewPwd(''); setConfirmPwd('')
      setTimeout(() => setSecAlert(null), 3000)
    }
    setChangingPwd(false)
  }

  async function handleLogout() {
    await sb.auth.signOut()
    router.push('/')
  }

  const displayName = profile.full_name || email.split('@')[0] || 'Utente'
  const firstName = displayName.split(' ')[0]
  const initials = displayName.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase()
  const profileIncomplete = !profile.full_name

  const navItems: { id: Section; label: string; icon: ReactElement }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <rect x="1" y="1" width="6" height="6" rx="1"/>
          <rect x="9" y="1" width="6" height="6" rx="1"/>
          <rect x="1" y="9" width="6" height="6" rx="1"/>
          <rect x="9" y="9" width="6" height="6" rx="1"/>
        </svg>
      ),
    },
    {
      id: 'orders',
      label: 'I miei ordini',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 2h2l2 7h6l2-5H5"/>
          <circle cx="6.5" cy="13" r="1"/>
          <circle cx="11.5" cy="13" r="1"/>
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profilo',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="8" cy="5" r="3"/>
          <path d="M2 14c0-3.314 2.686-5 6-5s6 1.686 6 5"/>
        </svg>
      ),
    },
    {
      id: 'security',
      label: 'Sicurezza',
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 1L2 4v4c0 3.5 2.5 6.5 6 7.5C14 14.5 14 11.5 14 8V4L8 1z"/>
        </svg>
      ),
    },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      {/* Nav */}
      <nav className="site-nav">
        <Link href="/" className="logo" aria-label="Briopack home">
          <Image src="/logo.png" alt="Briopack" width={120} height={30} style={{ height: 28, width: 'auto' }} />
        </Link>
        <div className="nav-right">
          <Link href="/" className="nav-link">Negozio</Link>
          <button
            onClick={handleLogout}
            style={{
              background: 'var(--surface)', border: '1.5px solid var(--border-2)',
              color: 'var(--ink-2)', fontSize: 13, fontWeight: 600, padding: '7px 16px',
              borderRadius: 100, cursor: 'pointer', fontFamily: 'var(--f)',
              transition: 'all .18s', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <path d="M5 1.5H2a1 1 0 00-1 1v8a1 1 0 001 1h3"/>
              <path d="M9 9.5l2.5-3L9 3.5M11.5 6.5H5"/>
            </svg>
            Esci
          </button>
        </div>
      </nav>

      {/* Page layout */}
      <div className="page-layout" style={{ marginTop: 'var(--nav-h)' }}>

        {/* ── SIDEBAR ── */}
        <aside className="sidebar">
          {/* User info */}
          <div className="sidebar-user">
            <div className="sidebar-avatar" style={{ fontSize: 17, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.5px' }}>
              {initials || '?'}
            </div>
            <div className="sidebar-name">{displayName}</div>
            <div className="sidebar-email" title={email}>{email}</div>
            <span className="sidebar-role">{userRole === 'admin' ? 'Admin' : 'Cliente'}</span>
          </div>

          {/* Nav items */}
          <nav className="sidebar-nav" style={{ marginTop: 4 }}>
            {navItems.map(item => (
              <button
                key={item.id}
                className={`sidebar-item${section === item.id ? ' active' : ''}`}
                onClick={() => goTo(item.id)}
              >
                {item.icon}
                {item.label}
                {item.id === 'profile' && profileIncomplete && (
                  <span style={{
                    marginLeft: 'auto', width: 7, height: 7, borderRadius: '50%',
                    background: 'var(--yellow)', flexShrink: 0,
                  }} title="Profilo incompleto" />
                )}
              </button>
            ))}
          </nav>

          {/* Bottom: go to shop */}
          <div style={{ padding: '16px 10px 0', borderTop: '1px solid var(--border)', marginTop: 12 }}>
            <Link href="/" className="sidebar-item" style={{ display: 'flex', textDecoration: 'none' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 1h2.5l1.5 8h7l1.5-5H4"/>
                <circle cx="6" cy="13.5" r="1"/>
                <circle cx="12" cy="13.5" r="1"/>
              </svg>
              Vai al negozio
            </Link>
          </div>
        </aside>

        {/* ── CONTENT ── */}
        <main style={{ padding: '32px 36px', minWidth: 0 }}>

          {/* ── DASHBOARD ── */}
          {section === 'dashboard' && (
            <div className="animate-fade-up">
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 4 }}>
                  Benvenuto, {firstName}!
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink-4)' }}>
                  Ecco il riepilogo del tuo account Briopack.
                </div>
              </div>

              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
                <StatCard
                  value={statOrders}
                  label="Ordini totali"
                  accentColor="var(--accent)"
                  bgColor="var(--accent-bg)"
                  icon={
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1.5 1.5h3l2 9h8l2-6H5"/>
                      <circle cx="7" cy="15.5" r="1.5"/>
                      <circle cx="14" cy="15.5" r="1.5"/>
                    </svg>
                  }
                  bottomBorder="var(--accent)"
                />
                <StatCard
                  value={'€' + statSpent.toFixed(2)}
                  label="Spesa totale"
                  accentColor="var(--green)"
                  bgColor="var(--green-bg)"
                  icon={
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="9" r="7.5"/>
                      <path d="M9 5v8M6.5 6.5c0-1 1.1-1.5 2.5-1.5s2.5.5 2.5 1.5-1.1 2-2.5 2c-1.4 0-2.5.7-2.5 2S7.1 12 8.5 12s2.5-.5 2.5-1.5"/>
                    </svg>
                  }
                  bottomBorder="var(--green)"
                />
                <StatCard
                  value={statPending}
                  label="In lavorazione"
                  accentColor="var(--blue)"
                  bgColor="var(--blue-bg)"
                  icon={
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="9" cy="9" r="7.5"/>
                      <path d="M9 5v4l2.5 2.5"/>
                    </svg>
                  }
                  bottomBorder="var(--blue)"
                />
              </div>

              {/* Recent orders */}
              <div className="card">
                <div className="card-header">
                  <span className="card-title">Ultimi ordini</span>
                  {orders.length > 0 && (
                    <button
                      onClick={() => goTo('orders')}
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: 12.5 }}
                    >
                      Vedi tutti
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                        <path d="M2 6h8M7 3l3 3-3 3"/>
                      </svg>
                    </button>
                  )}
                </div>
                <div className="card-body" style={{ padding: orders.length === 0 ? 0 : undefined }}>
                  <OrderList orders={orders.slice(0, 5)} />
                </div>
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {section === 'orders' && (
            <div className="animate-fade-up">
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 4 }}>
                  I miei ordini
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink-4)' }}>
                  Storico completo dei tuoi ordini.
                </div>
              </div>

              {loadingOrders ? (
                <div style={{ textAlign: 'center', padding: 64 }}>
                  <span className="spinner" style={{ width: 28, height: 28 }} />
                </div>
              ) : orders.length === 0 ? (
                <EmptyOrders />
              ) : (
                <div className="card" style={{ overflow: 'hidden' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>ID ordine</th>
                        <th>Data</th>
                        <th>Totale</th>
                        <th>Stato</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td>
                            <span className="td-mono">#{o.id.slice(0, 8).toUpperCase()}</span>
                          </td>
                          <td style={{ color: 'var(--ink-3)', fontSize: 13 }}>{formatDate(o.created_at)}</td>
                          <td style={{ fontWeight: 700, color: 'var(--ink)' }}>€{(o.total_eur || 0).toFixed(2)}</td>
                          <td><StatusBadge status={o.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {section === 'profile' && (
            <div className="animate-fade-up">
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 4 }}>
                  Profilo
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink-4)' }}>
                  Aggiorna i tuoi dati personali e di spedizione.
                </div>
              </div>

              {/* Incomplete profile banner */}
              {profileIncomplete && (
                <div style={{
                  background: 'var(--yellow-bg)', border: '1px solid rgba(217,119,6,0.2)',
                  color: 'var(--yellow)', borderRadius: 'var(--r)', padding: '11px 16px',
                  marginBottom: 20, fontSize: 13.5, fontWeight: 500,
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="8" cy="8" r="7"/>
                    <path d="M8 5v3.5M8 11v.5"/>
                  </svg>
                  <span>
                    <strong>Profilo incompleto</strong> — Inserisci il tuo nome completo per un'esperienza migliore.
                  </span>
                </div>
              )}

              {/* Alert */}
              {profileAlert && (
                <div className={`alert ${profileAlert.type === 'success' ? 'success' : 'error'}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {profileAlert.type === 'success' ? (
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 7.5L6 11.5L13 3"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="7.5" cy="7.5" r="6.5"/>
                        <path d="M7.5 4.5v3.5M7.5 10.5v.5"/>
                      </svg>
                    )}
                    {profileAlert.msg}
                  </div>
                </div>
              )}

              <form onSubmit={saveProfile}>
                {/* Personal info section */}
                <div className="card" style={{ marginBottom: 20 }}>
                  <div className="card-header">
                    <span className="card-title">Informazioni personali</span>
                  </div>
                  <div className="card-body">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                      <FormField label="Nome completo">
                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Mario Rossi" />
                      </FormField>
                      <FormField label="Azienda">
                        <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Nome azienda" />
                      </FormField>
                      <FormField label="Telefono">
                        <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+39 000 000 0000" />
                      </FormField>
                      <FormField label="Email">
                        <input type="email" value={email} disabled />
                      </FormField>
                    </div>
                  </div>
                </div>

                {/* Shipping address section */}
                <div className="card" style={{ marginBottom: 24 }}>
                  <div className="card-header">
                    <span className="card-title">Indirizzo di spedizione</span>
                  </div>
                  <div className="card-body">
                    <FormField label="Indirizzo">
                      <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Via Roma 1" />
                    </FormField>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                      <FormField label="Città">
                        <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Milano" />
                      </FormField>
                      <FormField label="CAP">
                        <input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="20100" />
                      </FormField>
                    </div>
                    <FormField label="Paese">
                      <input type="text" value={country} onChange={e => setCountry(e.target.value)} />
                    </FormField>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="btn btn-accent"
                  style={{ minWidth: 160 }}
                >
                  {savingProfile ? (
                    <>
                      <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                      Salvataggio…
                    </>
                  ) : (
                    <>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11.5 2.5l-8 8M4 11.5H2.5V10l8-8 1.5 1.5-8 8z"/>
                      </svg>
                      Salva modifiche
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* ── SECURITY ── */}
          {section === 'security' && (
            <div className="animate-fade-up">
              <div style={{ marginBottom: 28 }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 4 }}>
                  Sicurezza
                </div>
                <div style={{ fontSize: 14, color: 'var(--ink-4)' }}>
                  Gestisci la password e la sicurezza del tuo account.
                </div>
              </div>

              {secAlert && (
                <div className={`alert ${secAlert.type === 'success' ? 'success' : 'error'}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {secAlert.type === 'success' ? (
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 7.5L6 11.5L13 3"/>
                      </svg>
                    ) : (
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="7.5" cy="7.5" r="6.5"/>
                        <path d="M7.5 4.5v3.5M7.5 10.5v.5"/>
                      </svg>
                    )}
                    {secAlert.msg}
                  </div>
                </div>
              )}

              {/* Change password */}
              <div className="card" style={{ marginBottom: 20 }}>
                <div className="card-header">
                  <span className="card-title">Cambia password</span>
                </div>
                <div className="card-body">
                  <form onSubmit={changePassword}>
                    <div style={{ maxWidth: 420 }}>
                      <FormField label="Nuova password">
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showNewPwd ? 'text' : 'password'}
                            value={newPwd}
                            onChange={e => setNewPwd(e.target.value)}
                            placeholder="Minimo 6 caratteri"
                            minLength={6}
                            required
                            style={{ paddingRight: 44 }}
                          />
                          <EyeToggle show={showNewPwd} onToggle={() => setShowNewPwd(v => !v)} />
                        </div>
                      </FormField>

                      <FormField label="Conferma password">
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showConfirmPwd ? 'text' : 'password'}
                            value={confirmPwd}
                            onChange={e => setConfirmPwd(e.target.value)}
                            placeholder="Ripeti la password"
                            required
                            style={{ paddingRight: 44 }}
                          />
                          <EyeToggle show={showConfirmPwd} onToggle={() => setShowConfirmPwd(v => !v)} />
                        </div>
                      </FormField>

                      <button
                        type="submit"
                        disabled={changingPwd}
                        className="btn btn-accent"
                        style={{ marginTop: 4, minWidth: 180 }}
                      >
                        {changingPwd ? (
                          <>
                            <span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,0.3)' }} />
                            Aggiornamento…
                          </>
                        ) : (
                          <>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M5 1L3 3l2 2M3 3h8a2 2 0 010 4H3M9 13l2-2-2-2M11 11H3a2 2 0 010-4"/>
                            </svg>
                            Aggiorna password
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Danger zone */}
              <div className="card" style={{ border: '1.5px solid rgba(200,40,30,0.18)' }}>
                <div className="card-header" style={{ borderBottomColor: 'rgba(200,40,30,0.12)' }}>
                  <span className="card-title" style={{ color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 7 }}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7.5 1L1 13.5h13L7.5 1zM7.5 6v3.5M7.5 11.5v.5"/>
                    </svg>
                    Zona pericolosa
                  </span>
                </div>
                <div className="card-body">
                  <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 16, lineHeight: 1.6 }}>
                    Disconnettiti da questo dispositivo e torna alla home.
                  </p>
                  <button
                    onClick={handleLogout}
                    className="btn btn-danger"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                      <path d="M9.5 1.5H12a1 1 0 011 1v9a1 1 0 01-1 1H9.5M6 10l3.5-3L6 4M9.5 7H2"/>
                    </svg>
                    Disconnettiti
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

/* ── SUB-COMPONENTS ── */

function StatCard({
  value, label, accentColor, bgColor, icon, bottomBorder,
}: {
  value: string | number
  label: string
  accentColor: string
  bgColor: string
  icon: ReactElement
  bottomBorder: string
}) {
  return (
    <div className="card" style={{ borderBottom: `3px solid ${bottomBorder}`, overflow: 'hidden' }}>
      <div className="card-body">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 'var(--r)',
            background: bgColor, color: accentColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            {icon}
          </div>
        </div>
        <div style={{ fontSize: 28, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-1px', lineHeight: 1, marginBottom: 6 }}>
          {value}
        </div>
        <div style={{ fontSize: 12, color: 'var(--ink-4)', fontWeight: 500 }}>{label}</div>
      </div>
    </div>
  )
}

function EmptyOrders() {
  return (
    <div style={{
      background: 'var(--white)', border: '1px solid var(--border)',
      borderRadius: 'var(--r-lg)', padding: '64px 24px', textAlign: 'center',
    }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'center' }}>
        <svg width="52" height="52" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" style={{ opacity: 0.2 }}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>
        Nessun ordine ancora
      </div>
      <div style={{ fontSize: 14, color: 'var(--ink-4)', marginBottom: 24, lineHeight: 1.6 }}>
        Hai ancora tutto da scoprire! Esplora il catalogo e fai il tuo primo ordine.
      </div>
      <Link href="/" className="btn btn-accent" style={{ display: 'inline-flex' }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 1h2l1.5 7H11l1.5-5H4"/>
          <circle cx="5.5" cy="12.5" r="1.5"/>
          <circle cx="11" cy="12.5" r="1.5"/>
        </svg>
        Inizia a fare acquisti
      </Link>
    </div>
  )
}

function OrderList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 24px' }}>
        <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
          <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.3" viewBox="0 0 24 24" style={{ opacity: 0.2 }}><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        </div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 6 }}>Nessun ordine ancora</div>
        <p style={{ fontSize: 13.5, color: 'var(--ink-4)', lineHeight: 1.6 }}>
          <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Inizia a fare acquisti</Link>
          {' '}per vedere i tuoi ordini qui.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {orders.map(o => (
        <div
          key={o.id}
          style={{
            border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
            padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16,
            background: 'var(--surface)', transition: 'box-shadow .2s, border-color .2s',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-sm)'
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border-2)'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.boxShadow = 'none'
            ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'
          }}
        >
          <span className="td-mono">#{o.id.slice(0, 8).toUpperCase()}</span>
          <span style={{ fontSize: 12.5, color: 'var(--ink-4)', flex: 1 }}>{formatDate(o.created_at)}</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)' }}>€{(o.total_eur || 0).toFixed(2)}</span>
          <StatusBadge status={o.status} />
        </div>
      ))}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
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

function EyeToggle({ show, onToggle }: { show: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      title={show ? 'Nascondi password' : 'Mostra password'}
      style={{
        position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
        background: 'none', border: 'none', cursor: 'pointer', padding: 4,
        color: 'var(--ink-4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: 4, transition: 'color .15s',
      }}
    >
      {show ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
      )}
    </button>
  )
}
