'use client'
import { useState, FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import NavWrapper from '@/components/NavWrapper'
import CartDrawer from '@/components/CartDrawer'

const SUBJECTS = [
  'Richiesta preventivo',
  'Informazioni prodotti',
  'Ordine in corso',
  'Campioni gratuiti',
  'Partnership / Rivendita',
  'Altro',
]

const INFO_ITEMS = [
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07A19.5 19.5 0 013.95 11 19.8 19.8 0 01.88 2.38 2 2 0 012.86.22h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
      </svg>
    ),
    label: 'Telefono',
    value: '+39 02 000 0000',
    href: 'tel:+390200000000',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
    ),
    label: 'Email',
    value: 'info@briopack.com',
    href: 'mailto:info@briopack.com',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: 'Sede',
    value: 'Italia',
    href: undefined,
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    label: 'Orari',
    value: 'Lun–Ven · 9:00–18:00',
    href: undefined,
  },
]

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '', subject: SUBJECTS[0], message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  function set(k: keyof typeof form, v: string) {
    setForm(f => ({ ...f, [k]: v }))
    if (error) setError('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Compila i campi obbligatori: nome, email e messaggio.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Errore invio.'); setLoading(false); return }
      setSent(true)
    } catch {
      setError('Errore di rete. Riprova tra qualche istante.')
    }
    setLoading(false)
  }

  return (
    <>
      <NavWrapper />
      <CartDrawer />

      <div style={{ minHeight: '100vh', background: 'var(--surface)', paddingTop: 'var(--nav-h)' }}>

        {/* ── Hero ── */}
        <div style={{ background: '#111', position: 'relative', overflow: 'hidden', padding: '72px 24px 80px' }}>
          {/* Decorative grid */}
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(232,114,26,0.07) 1px,transparent 1px),linear-gradient(90deg,rgba(232,114,26,0.07) 1px,transparent 1px)', backgroundSize: '48px 48px', opacity: 0.6 }} />
          {/* Radial glow */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, background: 'radial-gradient(ellipse,rgba(232,114,26,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(232,114,26,0.12)', border: '1px solid rgba(232,114,26,0.25)', borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.4px' }}>CONTATTACI</span>
            </div>
            <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.1, margin: '0 0 18px' }}>
              Parliamo del tuo<br />
              <span style={{ color: 'var(--accent)' }}>prossimo progetto</span>
            </h1>
            <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto', fontWeight: 400 }}>
              Dal preventivo alla consegna, il team Briopack ti segue in ogni fase. Rispondiamo entro 24 ore lavorative.
            </p>
          </div>
        </div>

        {/* ── Main content ── */}
        <div style={{ maxWidth: 1120, margin: '0 auto', padding: '64px 24px 96px', display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: 48, alignItems: 'start' }}>

          {/* ── Left: contact info ── */}
          <div>
            <div style={{ position: 'sticky', top: 100 }}>
              <div style={{ marginBottom: 32 }}>
                <Image src="/logo.png" alt="Briopack" width={130} height={32} style={{ height: 28, width: 'auto', marginBottom: 20 }} />
                <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.7, margin: 0 }}>
                  Specialisti in packaging personalizzato. Realizziamo confezioni su misura per aziende di ogni dimensione, con consegne in tutta Italia e in Europa.
                </p>
              </div>

              {/* Info items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {INFO_ITEMS.map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 0', borderBottom: i < INFO_ITEMS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-bg)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--ink-4)', letterSpacing: '0.4px', textTransform: 'uppercase', marginBottom: 3 }}>{item.label}</div>
                      {item.href ? (
                        <a href={item.href} style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 500, textDecoration: 'none' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--ink)'}>{item.value}</a>
                      ) : (
                        <div style={{ fontSize: 14.5, color: 'var(--ink)', fontWeight: 500 }}>{item.value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Promise card */}
              <div style={{ marginTop: 28, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 14, padding: '20px 22px' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--accent)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 7 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16" strokeLinecap="round" strokeLinejoin="round"><path d="M2 8l4 4 8-8"/></svg>
                  La nostra promessa
                </div>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {['Risposta entro 24h lavorative', 'Preventivo gratuito e senza impegno', 'Consulenza personalizzata'].map(t => (
                    <li key={t} style={{ fontSize: 13, color: 'var(--ink-2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="12" height="12" fill="none" stroke="var(--accent)" strokeWidth="2.5" viewBox="0 0 12 12" strokeLinecap="round"><path d="M1.5 6l3 3 6-6"/></svg>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Right: form ── */}
          <div>
            {sent ? (
              /* Success state */
              <div style={{ background: 'var(--white)', borderRadius: 20, border: '1px solid var(--border)', padding: '64px 40px', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <svg width="32" height="32" fill="none" stroke="var(--green)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                </div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.6px', marginBottom: 12 }}>Messaggio inviato!</div>
                <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.7, marginBottom: 32, maxWidth: 360, margin: '0 auto 32px' }}>
                  Grazie per averci contattato. Il team Briopack ti risponderà entro 24 ore lavorative all&apos;indirizzo <strong>{form.email}</strong>.
                </p>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 22px', background: 'var(--accent)', color: '#fff', borderRadius: 10, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16" strokeLinecap="round"><path d="M6 2L3 6v7a1 1 0 001 1h8a1 1 0 001-1V6l-3-4z"/></svg>
                    Esplora i prodotti
                  </Link>
                  <button onClick={() => { setSent(false); setForm({ name: '', company: '', email: '', phone: '', subject: SUBJECTS[0], message: '' }) }}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '11px 22px', background: 'transparent', color: 'var(--ink-3)', border: '1.5px solid var(--border-2)', borderRadius: 10, fontWeight: 600, fontSize: 14, cursor: 'pointer', fontFamily: 'var(--f)' }}>
                    Invia un altro messaggio
                  </button>
                </div>
              </div>
            ) : (
              /* Form card */
              <div style={{ background: 'var(--white)', borderRadius: 20, border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', overflow: 'hidden' }}>
                {/* Card header */}
                <div style={{ padding: '24px 32px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Invia un messaggio</div>
                  <div style={{ fontSize: 13.5, color: 'var(--ink-4)', marginTop: 4 }}>I campi con * sono obbligatori</div>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '28px 32px' }}>
                  {/* Name + Company */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                    <FormField label="Nome *">
                      <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Mario Rossi" required />
                    </FormField>
                    <FormField label="Azienda">
                      <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Nome azienda" />
                    </FormField>
                  </div>

                  {/* Email + Phone */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
                    <FormField label="Email *">
                      <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="mario@azienda.it" required />
                    </FormField>
                    <FormField label="Telefono">
                      <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+39 000 000 0000" />
                    </FormField>
                  </div>

                  {/* Subject */}
                  <div style={{ marginBottom: 18 }}>
                    <FormField label="Oggetto della richiesta">
                      <select value={form.subject} onChange={e => set('subject', e.target.value)}>
                        {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </FormField>
                  </div>

                  {/* Message */}
                  <div style={{ marginBottom: 24 }}>
                    <FormField label="Messaggio *">
                      <textarea value={form.message} onChange={e => set('message', e.target.value)} placeholder="Descrivi il tuo progetto: tipologia di prodotto, quantità approssimativa, tempistiche, eventuali specifiche tecniche…" required rows={5} style={{ resize: 'vertical', minHeight: 120 }} />
                    </FormField>
                  </div>

                  {/* Privacy note */}
                  <p style={{ fontSize: 12, color: 'var(--ink-5)', marginBottom: 18, lineHeight: 1.6 }}>
                    Inviando questo modulo accetti il trattamento dei tuoi dati personali per rispondere alla tua richiesta, in conformità con il GDPR.
                  </p>

                  {/* Error */}
                  {error && (
                    <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(200,40,30,0.18)', borderRadius: 10, padding: '12px 16px', marginBottom: 18, fontSize: 13.5, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16" strokeLinecap="round"><circle cx="8" cy="8" r="7"/><line x1="8" y1="5" x2="8" y2="8.5"/><circle cx="8" cy="11" r=".5" fill="currentColor"/></svg>
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button type="submit" disabled={loading}
                    style={{ width: '100%', padding: '14px', background: loading ? 'rgba(232,114,26,0.6)' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: 12, fontFamily: 'var(--f)', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9 }}>
                    {loading ? (
                      <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2.5, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.3)' }} />Invio in corso…</>
                    ) : (
                      <>
                        Invia messaggio
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 16 16" strokeLinecap="round" strokeLinejoin="round"><line x1="2" y1="8" x2="14" y2="8"/><polyline points="9 3 14 8 9 13"/></svg>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)', marginBottom: 7, letterSpacing: '0.1px' }}>
        {label}
      </label>
      <style>{`
        .cf-field input, .cf-field textarea, .cf-field select {
          width: 100%; padding: 11px 14px; font-family: var(--f); font-size: 14px;
          color: var(--ink); background: var(--surface); border: 1.5px solid var(--border-2);
          border-radius: 10px; outline: none; box-sizing: border-box; transition: border-color .18s, box-shadow .18s;
        }
        .cf-field input::placeholder, .cf-field textarea::placeholder { color: var(--ink-5); }
        .cf-field input:focus, .cf-field textarea:focus, .cf-field select:focus {
          border-color: var(--accent); box-shadow: 0 0 0 3px rgba(232,114,26,0.1);
        }
        .cf-field select { cursor: pointer; appearance: auto; }
        .cf-field textarea { resize: vertical; min-height: 120px; }
      `}</style>
      <div className="cf-field">{children}</div>
    </div>
  )
}
