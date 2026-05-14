'use client'
import { useState, useEffect, FormEvent, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { createClient } from '@/lib/supabase/client'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

function fmt(n: number) {
  return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const IVA_RATE = 0.22

// ─── Shipping config ──────────────────────────────────────────────────────────
// Currently a flat rate. TODO: replace with weight/qty-based logic once each
// product has a weight field. Example future signature:
//   calculateShipping(cart: CartItem[]): number
const SHIPPING_RATE = 10.00
function calculateShipping(): number { return SHIPPING_RATE }

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ''
const stripePromise = stripeKey ? loadStripe(stripeKey) : null

const stripeAppearance = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary:        '#e8721a',
    colorBackground:     '#ffffff',
    colorText:           '#1a1a1a',
    colorDanger:         '#dc2626',
    fontFamily:          'Inter, -apple-system, sans-serif',
    fontSizeBase:        '14px',
    borderRadius:        '10px',
    spacingUnit:         '4px',
  },
  rules: {
    '.Input': {
      border:    '1.5px solid #e5e7eb',
      boxShadow: 'none',
      padding:   '11px 14px',
      fontSize:  '15px',
    },
    '.Input:focus': {
      border:    '1.5px solid #e8721a',
      boxShadow: '0 0 0 3px rgba(232,114,26,0.12)',
      outline:   'none',
    },
    '.Label': {
      fontSize:   '13px',
      fontWeight: '600',
      color:      '#374151',
      marginBottom: '6px',
    },
    '.Tab': {
      border:    '1.5px solid #e5e7eb',
      boxShadow: 'none',
    },
    '.Tab--selected': {
      border:    '1.5px solid #e8721a',
      boxShadow: '0 0 0 3px rgba(232,114,26,0.12)',
    },
    '.Tab:hover': {
      border: '1.5px solid #e8721a',
    },
  },
}

/* ─── Step 2: Payment form ─────────────────────────────────────────────────── */
function PaymentForm({ siteUrl, onBack }: { siteUrl: string; onBack: () => void }) {
  const stripe   = useStripe()
  const elements = useElements()
  const [paying, setPaying]   = useState(false)
  const [error, setError]     = useState<string | null>(null)

  async function handlePay(e: FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return
    setPaying(true)
    setError(null)

    const { error: stripeErr } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${siteUrl}/conferma`,
      },
    })

    if (stripeErr) {
      setError(stripeErr.message ?? 'Errore durante il pagamento.')
      setPaying(false)
    }
    // on success Stripe auto-redirects to return_url
  }

  return (
    <form onSubmit={handlePay} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <PaymentElement options={{ layout: 'tabs' }} />

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '12px 16px', fontSize: 13.5, color: '#dc2626' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          type="button"
          onClick={onBack}
          disabled={paying}
          style={{ flex: '0 0 auto', padding: '14px 20px', fontSize: 14, fontWeight: 600, fontFamily: 'var(--f)', background: 'transparent', color: 'var(--ink-3)', border: '1.5px solid var(--border-2)', borderRadius: 10, cursor: 'pointer' }}>
          ← Indietro
        </button>
        <button
          type="submit"
          disabled={!stripe || paying}
          className="checkout-pay-btn"
          style={{ flex: 1 }}>
          {paying ? <span className="checkout-spinner" /> : (
            <>
              Paga ora
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 16 16" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4 13 8 9 12"/>
              </svg>
            </>
          )}
        </button>
      </div>

      <div className="checkout-stripe-note">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        Pagamento sicuro gestito da <strong>Stripe</strong>. Non conserviamo i dati della carta.
      </div>
    </form>
  )
}

/* ─── Main checkout page ───────────────────────────────────────────────────── */
function CheckoutInner() {
  const { cart, cartTotal } = useCart()
  const router = useRouter()

  const [step, setStep]           = useState<1 | 2>(1)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading]     = useState(false)
  const [errors, setErrors]       = useState<Partial<typeof form>>({})

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', zip: '', province: '', notes: '',
  })

  // Pre-fill from Supabase profile if user is logged in
  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data: { user } }) => {
      if (!user) return
      setForm(f => ({ ...f, email: f.email || user.email || '' }))
      sb.from('profiles')
        .select('full_name,phone,address,city,postal_code')
        .eq('id', user.id)
        .single()
        .then(({ data }) => {
          if (!data) return
          const parts = (data.full_name || '').trim().split(' ')
          setForm(f => ({
            ...f,
            email:     f.email     || user.email      || '',
            firstName: f.firstName || parts[0]         || '',
            lastName:  f.lastName  || parts.slice(1).join(' ') || '',
            phone:     f.phone     || data.phone       || '',
            address:   f.address   || data.address     || '',
            city:      f.city      || data.city        || '',
            zip:       f.zip       || data.postal_code || '',
          }))
        })
    })
  }, [])

  const shipping = calculateShipping()
  const iva      = cartTotal * IVA_RATE
  const total    = cartTotal + iva + shipping

  function set(field: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
  }

  function validate() {
    const e: Partial<typeof form> = {}
    if (!form.firstName.trim()) e.firstName = 'Obbligatorio'
    if (!form.lastName.trim())  e.lastName  = 'Obbligatorio'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email non valida'
    if (!form.address.trim()) e.address = 'Obbligatorio'
    if (!form.city.trim())    e.city    = 'Obbligatorio'
    if (!form.zip.trim() || !/^\d{5}$/.test(form.zip)) e.zip = 'CAP non valido'
    if (!form.province.trim() || form.province.length !== 2) e.province = 'Sigla 2 lettere'
    return e
  }

  async function handleShippingSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cart, form, shipping, iva, total }),
      })
      const data = await res.json()
      if (!res.ok) { alert(data.error || 'Errore. Riprova.'); setLoading(false); return }
      setClientSecret(data.clientSecret)
      setStep(2)
    } catch {
      alert('Errore di rete. Riprova.')
    } finally {
      setLoading(false)
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

  if (cart.length === 0) {
    return (
      <div className="checkout-empty">
        <svg width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" opacity=".3">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        <h2>Il carrello è vuoto</h2>
        <p>Aggiungi prodotti prima di procedere al checkout.</p>
        <Link href="/" className="checkout-back-btn">← Torna al negozio</Link>
      </div>
    )
  }

  const stepLabels = ['1. Spedizione', '2. Pagamento', '3. Conferma']

  return (
    <>
      <nav className="checkout-nav">
        <Link href="/" aria-label="Briopack home">
          <Image src="/logo.png" alt="Briopack" width={120} height={30} style={{ height: 28, width: 'auto' }} />
        </Link>
        <div className="checkout-nav-steps">
          {stepLabels.map((label, i) => (
            <span key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i > 0 && (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" opacity=".35"><path d="M9 18l6-6-6-6"/></svg>
              )}
              <span className={`checkout-step${(i === 0 && step === 1) || (i === 1 && step === 2) ? ' active' : ''}`}>
                {label}
              </span>
            </span>
          ))}
        </div>
        <Link href="/" className="checkout-nav-back">
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Torna al negozio
        </Link>
      </nav>

      <div className="checkout-layout">
        {/* ── LEFT: FORM ── */}
        <div className="checkout-form">
          {step === 1 ? (
            <form onSubmit={handleShippingSubmit} noValidate>
              <h1 className="checkout-title">Dati di spedizione</h1>

              <div className="checkout-section">
                <div className="checkout-row">
                  <div className={`checkout-field${errors.firstName ? ' error' : ''}`}>
                    <label>Nome *</label>
                    <input placeholder="Mario" value={form.firstName} onChange={e => set('firstName', e.target.value)} />
                    {errors.firstName && <span className="field-error">{errors.firstName}</span>}
                  </div>
                  <div className={`checkout-field${errors.lastName ? ' error' : ''}`}>
                    <label>Cognome *</label>
                    <input placeholder="Rossi" value={form.lastName} onChange={e => set('lastName', e.target.value)} />
                    {errors.lastName && <span className="field-error">{errors.lastName}</span>}
                  </div>
                </div>
                <div className="checkout-row">
                  <div className={`checkout-field${errors.email ? ' error' : ''}`}>
                    <label>Email *</label>
                    <input type="email" placeholder="mario@azienda.it" value={form.email} onChange={e => set('email', e.target.value)} />
                    {errors.email && <span className="field-error">{errors.email}</span>}
                  </div>
                  <div className="checkout-field">
                    <label>Telefono</label>
                    <input type="tel" placeholder="+39 02 1234567" value={form.phone} onChange={e => set('phone', e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="checkout-section-label">Indirizzo di consegna</div>
              <div className="checkout-section">
                <div className={`checkout-field${errors.address ? ' error' : ''}`}>
                  <label>Indirizzo e numero civico *</label>
                  <input placeholder="Via Roma 12" value={form.address} onChange={e => set('address', e.target.value)} />
                  {errors.address && <span className="field-error">{errors.address}</span>}
                </div>
                <div className="checkout-row checkout-row-3">
                  <div className={`checkout-field${errors.city ? ' error' : ''}`}>
                    <label>Città *</label>
                    <input placeholder="Milano" value={form.city} onChange={e => set('city', e.target.value)} />
                    {errors.city && <span className="field-error">{errors.city}</span>}
                  </div>
                  <div className={`checkout-field checkout-field-sm${errors.zip ? ' error' : ''}`}>
                    <label>CAP *</label>
                    <input placeholder="20121" maxLength={5} value={form.zip} onChange={e => set('zip', e.target.value.replace(/\D/g, ''))} />
                    {errors.zip && <span className="field-error">{errors.zip}</span>}
                  </div>
                  <div className={`checkout-field checkout-field-xs${errors.province ? ' error' : ''}`}>
                    <label>Prov. *</label>
                    <input placeholder="MI" maxLength={2} value={form.province} onChange={e => set('province', e.target.value.toUpperCase())} />
                    {errors.province && <span className="field-error">{errors.province}</span>}
                  </div>
                </div>
              </div>

              <div className="checkout-section-label">
                Note ordine <span style={{ fontWeight: 400, color: 'var(--ink-4)' }}>(opzionale)</span>
              </div>
              <div className="checkout-section">
                <div className="checkout-field">
                  <textarea
                    rows={3}
                    placeholder="Istruzioni di consegna, riferimento ordine interno, note grafiche…"
                    value={form.notes}
                    onChange={e => set('notes', e.target.value)}
                  />
                </div>
              </div>

              <button className="checkout-pay-btn" type="submit" disabled={loading}>
                {loading ? <span className="checkout-spinner" /> : (
                  <>
                    Continua al pagamento
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 16 16" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4 13 8 9 12"/>
                    </svg>
                  </>
                )}
              </button>
            </form>
          ) : (
            <div>
              <h1 className="checkout-title">Pagamento</h1>

              {/* Shipping recap */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>
                    {form.firstName} {form.lastName}
                  </div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-4)' }}>
                    {form.address}, {form.zip} {form.city} ({form.province}) · {form.email}
                  </div>
                </div>
                <button
                  onClick={() => setStep(1)}
                  style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', flexShrink: 0 }}>
                  Modifica
                </button>
              </div>

              {clientSecret && stripePromise ? (
                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret, appearance: stripeAppearance, locale: 'it' }}>
                  <PaymentForm siteUrl={siteUrl} onBack={() => setStep(1)} />
                </Elements>
              ) : clientSecret && !stripePromise ? (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '16px', fontSize: 13.5, color: '#dc2626' }}>
                  Configurazione Stripe mancante. Aggiungere NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY nelle variabili d&apos;ambiente.
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* ── RIGHT: ORDER SUMMARY ── */}
        <aside className="checkout-summary">
          <div className="checkout-summary-inner">
            <h2 className="checkout-summary-title">Riepilogo ordine</h2>

            <ul className="checkout-summary-items">
              {cart.map(item => (
                <li key={item.id} className="checkout-summary-item">
                  <div className="csi-left">
                    <div className="csi-qty">{item.qty.toLocaleString('it-IT')} pz</div>
                    <div>
                      <div className="csi-name">{item.name}</div>
                      <div className="csi-meta">{item.cat}{item.size ? ` · ${item.size}` : ''}</div>
                      {item.setupCost > 0 && <div className="csi-setup">+ €{fmt(item.setupCost)} avviamento stampa</div>}
                    </div>
                  </div>
                  <div className="csi-price">€{fmt(item.unitPrice * item.qty + item.setupCost)}</div>
                </li>
              ))}
            </ul>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-row">
              <span>Subtotale (imponibile)</span>
              <span>€{fmt(cartTotal)}</span>
            </div>
            <div className="checkout-summary-row">
              <span>IVA 22%</span>
              <span>€{fmt(iva)}</span>
            </div>
            <div className="checkout-summary-row">
              <span>Spedizione</span>
              <span>€{fmt(shipping)}</span>
            </div>

            <div className="checkout-summary-divider" />

            <div className="checkout-summary-total">
              <span>Totale</span>
              <span>€{fmt(total)}</span>
            </div>

            <div className="checkout-trust">
              <div className="checkout-trust-item">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                Pagamento sicuro SSL
              </div>
              <div className="checkout-trust-item">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                Spedizione con tracking
              </div>
              <div className="checkout-trust-item">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                Reso facilitato
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutInner />
    </Suspense>
  )
}
