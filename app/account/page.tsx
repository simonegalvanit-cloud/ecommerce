'use client'
import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
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
  total: number | null
  status: string
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'In attesa',
  confirmed: 'Confermato',
  processing: 'In lavorazione',
  shipped: 'Spedito',
  delivered: 'Consegnato',
  cancelled: 'Annullato',
}

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  pending:    { background: 'var(--yellow-bg)', color: 'var(--yellow)' },
  confirmed:  { background: 'var(--blue-bg)',   color: 'var(--blue)' },
  processing: { background: 'var(--blue-bg)',   color: 'var(--blue)' },
  shipped:    { background: 'var(--accent-bg)', color: 'var(--accent)' },
  delivered:  { background: 'var(--green-bg)',  color: 'var(--green)' },
  cancelled:  { background: 'var(--red-bg)',    color: 'var(--red)' },
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
  const [secAlert, setSecAlert] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [changingPwd, setChangingPwd] = useState(false)

  // Stats
  const [statOrders, setStatOrders] = useState<number>(0)
  const [statSpent, setStatSpent] = useState<number>(0)
  const [statPending, setStatPending] = useState<number>(0)

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
        setFullName(prof.full_name || '')
        setCompany(prof.company || '')
        setPhone(prof.phone || '')
        setAddress(prof.address || '')
        setCity(prof.city || '')
        setPostalCode(prof.postal_code || '')
        setCountry(prof.country || 'Italia')
      }

      const { data: ord } = await sb.from('orders').select('*').eq('customer_id', session.user.id).order('created_at', { ascending: false })
      const all = (ord || []) as Order[]
      setOrders(all)
      setStatOrders(all.length)
      setStatSpent(all.reduce((s, o) => s + (o.total || 0), 0))
      setStatPending(all.filter(o => ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)).length)
    })()
  }, [])

  async function loadOrders() {
    if (loadingOrders) return
    setLoadingOrders(true)
    const { data } = await sb.from('orders').select('*').eq('customer_id', userId).order('created_at', { ascending: false })
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

  const navItems: { id: Section; icon: string; label: string }[] = [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { id: 'orders',    icon: '📦', label: 'I miei ordini' },
    { id: 'profile',   icon: '👤', label: 'Profilo' },
    { id: 'security',  icon: '🔒', label: 'Sicurezza' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--surface)' }}>
      {/* Nav */}
      <nav className="site-nav">
        <Link href="/" className="logo"><span className="logo-pip" />Briopack</Link>
        <div className="nav-right">
          <Link href="/" style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13.5, fontWeight: 500, textDecoration: 'none', transition: 'color .18s' }}>Negozio</Link>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff', fontSize: 13, fontWeight: 600, padding: '7px 16px', borderRadius: 100, cursor: 'pointer', fontFamily: 'var(--f)', transition: 'all .18s' }}>Esci</button>
        </div>
      </nav>

      {/* Layout */}
      <div className="page-layout">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-user">
            <div className="sidebar-avatar">👤</div>
            <div className="sidebar-name">{displayName}</div>
            <div className="sidebar-email">{email}</div>
            <span className="sidebar-role">Cliente</span>
          </div>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`sidebar-item${section === item.id ? ' active' : ''}`}
                onClick={() => goTo(item.id)}
              >
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main style={{ padding: 40, minWidth: 0 }}>

          {/* ── DASHBOARD ── */}
          {section === 'dashboard' && (
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px', marginBottom: 6 }}>Benvenuto!</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 28 }}>Ciao {firstName}! Ecco il riepilogo del tuo account.</div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 24 }}>
                {[
                  { val: statOrders, lbl: 'Ordini totali' },
                  { val: '€' + statSpent.toFixed(2), lbl: 'Spesa totale' },
                  { val: statPending, lbl: 'In lavorazione' },
                ].map((s, i) => (
                  <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20 }}>
                    <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-1px' }}>{s.val}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{s.lbl}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>Ultimi ordini</div>
                <OrderList orders={orders.slice(0, 5)} />
              </div>
            </div>
          )}

          {/* ── ORDERS ── */}
          {section === 'orders' && (
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px', marginBottom: 6 }}>I miei ordini</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 28 }}>Storico completo dei tuoi ordini.</div>
              {loadingOrders ? (
                <div style={{ textAlign: 'center', padding: 48 }}><span className="spinner" /></div>
              ) : (
                <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
                  {orders.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--ink-4)' }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📦</div>
                      <p>Nessun ordine ancora. <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Inizia a fare acquisti!</Link></p>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          {['ID', 'Data', 'Totale', 'Stato'].map(h => (
                            <th key={h} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--ink-4)', padding: '10px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(o => (
                          <tr key={o.id} style={{ borderBottom: '1px solid var(--border)' }}>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 4 }}>#{o.id.slice(0, 8).toUpperCase()}</span>
                            </td>
                            <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink-3)' }}>{new Date(o.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                            <td style={{ padding: '12px 16px', fontWeight: 700 }}>€{(o.total || 0).toFixed(2)}</td>
                            <td style={{ padding: '12px 16px' }}>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.4px', ...(STATUS_STYLE[o.status] || { background: 'var(--surface-2)', color: 'var(--ink-3)' }) }}>
                                {STATUS_LABEL[o.status] || o.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {section === 'profile' && (
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px', marginBottom: 6 }}>Profilo</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 28 }}>Aggiorna i tuoi dati personali e di fatturazione.</div>
              {profileAlert && (
                <div style={{ padding: '10px 14px', borderRadius: 'var(--r)', fontSize: 13.5, fontWeight: 500, marginBottom: 16, background: profileAlert.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)', color: profileAlert.type === 'success' ? 'var(--green)' : 'var(--red)' }}>
                  {profileAlert.msg}
                </div>
              )}
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>Informazioni personali</div>
                <form onSubmit={saveProfile}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <FormField label="Nome completo"><input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Mario Rossi" /></FormField>
                    <FormField label="Azienda"><input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="Nome azienda" /></FormField>
                    <FormField label="Telefono"><input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+39 000 000 0000" /></FormField>
                    <FormField label="Email"><input type="email" value={email} disabled /></FormField>
                  </div>

                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', margin: '20px 0 16px', paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>Indirizzo di spedizione</div>
                  <FormField label="Indirizzo"><input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="Via Roma 1" /></FormField>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <FormField label="Città"><input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Milano" /></FormField>
                    <FormField label="CAP"><input type="text" value={postalCode} onChange={e => setPostalCode(e.target.value)} placeholder="20100" /></FormField>
                  </div>
                  <FormField label="Paese"><input type="text" value={country} onChange={e => setCountry(e.target.value)} /></FormField>

                  <button type="submit" disabled={savingProfile} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '10px 20px', fontFamily: 'var(--f)', fontSize: 14, fontWeight: 600, borderRadius: 'var(--r)', cursor: savingProfile ? 'not-allowed' : 'pointer', opacity: savingProfile ? 0.6 : 1, transition: 'all .18s', marginTop: 8 }}>
                    {savingProfile ? 'Salvataggio…' : 'Salva modifiche'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {section === 'security' && (
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px', marginBottom: 6 }}>Sicurezza</div>
              <div style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 28 }}>Gestisci la password del tuo account.</div>
              {secAlert && (
                <div style={{ padding: '10px 14px', borderRadius: 'var(--r)', fontSize: 13.5, fontWeight: 500, marginBottom: 16, background: secAlert.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)', color: secAlert.type === 'success' ? 'var(--green)' : 'var(--red)' }}>
                  {secAlert.msg}
                </div>
              )}
              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24, marginBottom: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>Cambia password</div>
                <form onSubmit={changePassword}>
                  <FormField label="Nuova password"><input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Minimo 6 caratteri" minLength={6} required /></FormField>
                  <FormField label="Conferma password"><input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Ripeti la password" required /></FormField>
                  <button type="submit" disabled={changingPwd} style={{ background: 'var(--accent)', color: '#fff', border: 'none', padding: '10px 20px', fontFamily: 'var(--f)', fontSize: 14, fontWeight: 600, borderRadius: 'var(--r)', cursor: changingPwd ? 'not-allowed' : 'pointer', opacity: changingPwd ? 0.6 : 1, transition: 'all .18s', marginTop: 8 }}>
                    {changingPwd ? 'Aggiornamento…' : 'Aggiorna password'}
                  </button>
                </form>
              </div>

              <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>Zona pericolosa</div>
                <p style={{ fontSize: 13.5, color: 'var(--ink-3)', marginBottom: 16 }}>Esci da tutti i dispositivi e torna alla home.</p>
                <button onClick={handleLogout} style={{ background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-2)', padding: '10px 20px', fontFamily: 'var(--f)', fontSize: 14, fontWeight: 600, borderRadius: 'var(--r)', cursor: 'pointer', transition: 'all .18s' }}>
                  Disconnettiti
                </button>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}

function OrderList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px 24px', color: 'var(--ink-4)' }}>
        <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
        <p style={{ fontSize: 14 }}>Nessun ordine ancora. <Link href="/" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Inizia a fare acquisti!</Link></p>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {orders.map(o => (
        <div key={o.id} style={{ border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16, background: 'var(--surface)' }}>
          <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, background: 'var(--surface-2)', padding: '3px 8px', borderRadius: 4 }}>#{o.id.slice(0, 8).toUpperCase()}</span>
          <span style={{ fontSize: 12.5, color: 'var(--ink-4)', flex: 1 }}>{new Date(o.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginRight: 8 }}>€{(o.total || 0).toFixed(2)}</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 100, textTransform: 'uppercase' as const, letterSpacing: '0.4px', ...(STATUS_STYLE[o.status] || { background: 'var(--surface-2)', color: 'var(--ink-3)' }) }}>
            {STATUS_LABEL[o.status] || o.status}
          </span>
        </div>
      ))}
    </div>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  )
}
