'use client'
import { useState, useEffect, FormEvent } from 'react'

const PRODUCT_TYPES = [
  'Shopper & Cartotecnica',
  'Wine Packaging',
  'Food Delivery',
  'E-commerce',
  'Cesti & Scatole Regalo',
  'Nastri Adesivi',
  'Altro / Non so ancora',
]

const ARTWORK_OPTIONS = ['Sì, ho già il file', 'No, ho bisogno di supporto', 'Da sviluppare insieme']

type Form = {
  name: string; company: string; email: string; phone: string
  product: string; qty: string; artwork: string; notes: string
}

const EMPTY: Form = { name: '', company: '', email: '', phone: '', product: PRODUCT_TYPES[0], qty: '', artwork: '', notes: '' }

export default function PreventivoDrawer() {
  const [open,    setOpen]    = useState(false)
  const [form,    setForm]    = useState<Form>(EMPTY)
  const [loading, setLoading] = useState(false)
  const [sent,    setSent]    = useState(false)
  const [error,   setError]   = useState('')

  useEffect(() => {
    const open = () => setOpen(true)
    window.addEventListener('open-preventivo', open)
    return () => window.removeEventListener('open-preventivo', open)
  }, [])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const set = (k: keyof Form, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    if (error) setError('')
  }

  const close = () => { setOpen(false); setTimeout(() => { setSent(false); setForm(EMPTY); setError('') }, 350) }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) { setError('Nome ed email sono obbligatori.'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name, company: form.company,
          email: form.email, phone: form.phone,
          subject: 'Richiesta preventivo',
          message: [
            `Prodotto: ${form.product}`,
            form.qty ? `Quantità stimata: ${form.qty} pz` : '',
            form.artwork ? `Artwork: ${form.artwork}` : '',
            form.notes ? `\nNote:\n${form.notes}` : '',
          ].filter(Boolean).join('\n'),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Errore invio.'); setLoading(false); return }
      setSent(true)
    } catch { setError('Errore di rete. Riprova.') }
    setLoading(false)
  }

  return (
    <>
      <style>{`
        .prev-overlay { position:fixed;inset:0;z-index:1100;background:rgba(0,0,0,0.45);opacity:0;pointer-events:none;transition:opacity .3s ease;backdrop-filter:blur(2px); }
        .prev-overlay.open { opacity:1;pointer-events:auto; }
        .prev-drawer { position:fixed;top:0;right:0;bottom:0;z-index:1101;width:min(520px,100vw);background:#fff;display:flex;flex-direction:column;transform:translateX(100%);transition:transform .34s cubic-bezier(0.22,1,0.36,1);box-shadow:-8px 0 40px rgba(0,0,0,0.14); }
        .prev-drawer.open { transform:translateX(0); }
        .prev-drawer-head { padding:20px 28px;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0; }
        .prev-drawer-body { flex:1;overflow-y:auto;padding:28px;-webkit-overflow-scrolling:touch; }
        .prev-drawer-foot { padding:20px 28px;border-top:1px solid var(--border);flex-shrink:0;background:#fff; }
        .prev-section-label { font-size:11px;font-weight:700;color:var(--ink-4);letter-spacing:.7px;text-transform:uppercase;margin-bottom:14px;margin-top:28px; }
        .prev-section-label:first-of-type { margin-top:0; }
        .prev-grid { display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px; }
        .prev-field { display:flex;flex-direction:column;gap:6px; }
        .prev-field label { font-size:12.5px;font-weight:600;color:var(--ink-2); }
        .prev-field input,.prev-field select,.prev-field textarea { width:100%;padding:10px 13px;font-family:var(--f);font-size:14px;color:var(--ink);background:var(--surface);border:1.5px solid var(--border-2);border-radius:10px;outline:none;box-sizing:border-box;transition:border-color .15s,box-shadow .15s; }
        .prev-field input:focus,.prev-field select:focus,.prev-field textarea:focus { border-color:var(--accent);box-shadow:0 0 0 3px rgba(232,114,26,0.1); }
        .prev-field textarea { resize:vertical;min-height:90px; }
        .prev-chips { display:flex;flex-wrap:wrap;gap:8px; }
        .prev-chip { padding:7px 14px;border:1.5px solid var(--border-2);border-radius:100px;font-size:13px;font-weight:500;color:var(--ink-3);background:transparent;cursor:pointer;font-family:var(--f);transition:all .18s; }
        .prev-chip:hover { border-color:var(--accent);color:var(--accent); }
        .prev-chip.sel { border-color:var(--accent);background:var(--accent);color:#fff; }
        .prev-submit { width:100%;padding:14px;background:var(--accent);color:#fff;border:none;border-radius:12px;font-family:var(--f);font-size:15px;font-weight:700;cursor:pointer;transition:all .2s;display:flex;align-items:center;justify-content:center;gap:9px;box-shadow:var(--shadow-accent); }
        .prev-submit:hover { background:#d4611a;transform:translateY(-1px); }
        .prev-submit:disabled { background:rgba(232,114,26,0.5);cursor:not-allowed;transform:none;box-shadow:none; }
        .prev-close { width:36px;height:36px;border-radius:10px;border:1.5px solid var(--border-2);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--ink-4);transition:all .15s; }
        .prev-close:hover { background:var(--surface-2);color:var(--ink); }
        @media(max-width:600px){ .prev-grid{grid-template-columns:1fr;} }
      `}</style>

      <div className={`prev-overlay${open ? ' open' : ''}`} onClick={close} />

      <aside className={`prev-drawer${open ? ' open' : ''}`} aria-label="Richiedi preventivo">

        {/* Header */}
        <div className="prev-drawer-head">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="17" height="17" fill="none" stroke="var(--accent)" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.3px' }}>Richiedi un Preventivo</div>
              <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>Risposta entro 24h lavorative · gratuito</div>
            </div>
          </div>
          <button className="prev-close" onClick={close} aria-label="Chiudi">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Body */}
        <div className="prev-drawer-body">
          {sent ? (
            /* Success */
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 360, textAlign: 'center', padding: '0 16px' }}>
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                <svg width="32" height="32" fill="none" stroke="#16a34a" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.5px', marginBottom: 10 }}>Richiesta inviata!</div>
              <p style={{ fontSize: 14.5, color: 'var(--ink-3)', lineHeight: 1.7, marginBottom: 28 }}>
                Ti ricontatteremo entro 24h lavorative all&apos;indirizzo <strong>{form.email}</strong> con un preventivo personalizzato.
              </p>
              <button onClick={close} style={{ padding: '11px 28px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--f)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
                Chiudi
              </button>
            </div>
          ) : (
            <form id="prev-form" onSubmit={handleSubmit}>

              {/* Section 1: Chi sei */}
              <div className="prev-section-label">Chi sei</div>
              <div className="prev-grid">
                <div className="prev-field">
                  <label>Nome e cognome *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Mario Rossi" required />
                </div>
                <div className="prev-field">
                  <label>Azienda</label>
                  <input value={form.company} onChange={e => set('company', e.target.value)} placeholder="Nome azienda" />
                </div>
                <div className="prev-field">
                  <label>Email *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="mario@azienda.it" required />
                </div>
                <div className="prev-field">
                  <label>Telefono</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+39 000 000 0000" />
                </div>
              </div>

              {/* Section 2: Cosa ti serve */}
              <div className="prev-section-label">Cosa ti serve</div>
              <div className="prev-grid" style={{ gridTemplateColumns: '3fr 2fr' }}>
                <div className="prev-field">
                  <label>Tipo di prodotto</label>
                  <select value={form.product} onChange={e => set('product', e.target.value)}>
                    {PRODUCT_TYPES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="prev-field">
                  <label>Quantità stimata</label>
                  <input type="number" value={form.qty} onChange={e => set('qty', e.target.value)} placeholder="es. 500" min={1} />
                </div>
              </div>

              {/* Artwork chips */}
              <div className="prev-field" style={{ marginBottom: 14 }}>
                <label>Hai già un artwork / logo?</label>
                <div className="prev-chips" style={{ marginTop: 4 }}>
                  {ARTWORK_OPTIONS.map(o => (
                    <button key={o} type="button"
                      className={`prev-chip${form.artwork === o ? ' sel' : ''}`}
                      onClick={() => set('artwork', form.artwork === o ? '' : o)}>
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="prev-section-label">Note aggiuntive</div>
              <div className="prev-field">
                <label>Descrizione del progetto</label>
                <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                  placeholder="Dimensioni, materiali preferiti, tempistiche, quantità esatte, eventuali referenze visive…" />
              </div>

              {/* Error */}
              {error && (
                <div style={{ background: 'var(--red-bg)', border: '1px solid rgba(200,40,30,0.18)', borderRadius: 10, padding: '11px 15px', marginTop: 16, fontSize: 13.5, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16" strokeLinecap="round"><circle cx="8" cy="8" r="7"/><line x1="8" y1="5" x2="8" y2="8.5"/></svg>
                  {error}
                </div>
              )}

              <p style={{ fontSize: 11.5, color: 'var(--ink-5)', marginTop: 18, lineHeight: 1.6 }}>
                I tuoi dati sono trattati ai sensi del GDPR esclusivamente per rispondere alla tua richiesta.
              </p>
            </form>
          )}
        </div>

        {/* Footer CTA */}
        {!sent && (
          <div className="prev-drawer-foot">
            <button type="submit" form="prev-form" disabled={loading} className="prev-submit">
              {loading ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.3)' }} />Invio in corso…</>
              ) : (
                <>
                  Invia richiesta di preventivo
                  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 16 16" strokeLinecap="round"><line x1="2" y1="8" x2="14" y2="8"/><polyline points="9 3 14 8 9 13"/></svg>
                </>
              )}
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
