'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NavWrapper from '@/components/NavWrapper'
import { createClient } from '@/lib/supabase/client'

const SERVICES = [
  {
    key: 'stoccaggio',
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    title: 'Stoccaggio',
    subtitle: 'Magazzino dedicato su misura',
    desc: 'Gestiamo lo stoccaggio del tuo packaging su ordini programmati. Ritiri frazionati, etichettatura, gestione scorte — tutto tracciato e a tua disposizione quando ne hai bisogno.',
    features: ['Ritiri frazionati settimanali o mensili', 'Etichettatura e palettizzazione', 'Dashboard di giacenza in tempo reale', 'Consegne just-in-time in tutta Italia'],
    accent: '#6366f1',
  },
  {
    key: 'progettazione-tecnica',
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.07 4.93a10 10 0 010 14.14M4.93 4.93a10 10 0 000 14.14"/>
        <path d="M15.54 8.46a5 5 0 010 7.07M8.46 8.46a5 5 0 000 7.07"/>
      </svg>
    ),
    title: 'Progettazione Tecnica',
    subtitle: 'Strutture e materiali su specifica',
    desc: 'Il nostro ufficio tecnico progetta scatole, espositori e imballaggi partendo da zero. Definiamo insieme pesi, materiali, resistenze e certificazioni — fino al prototipo fisico.',
    features: ['Prototipazione rapida in 48h', 'Analisi strutturale e test di resistenza', 'Certificazioni FSC, CONAI, food-contact', 'CAD e disegni tecnici inclusi'],
    accent: '#0ea5e9',
  },
  {
    key: 'progettazione-grafica',
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r="0.5"/>
        <circle cx="17.5" cy="10.5" r="0.5"/>
        <circle cx="8.5" cy="7.5" r="0.5"/>
        <circle cx="6.5" cy="12.5" r="0.5"/>
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
      </svg>
    ),
    title: 'Progettazione Grafica',
    subtitle: 'Dal concept al file di stampa',
    desc: 'Il nostro studio grafico interno realizza artwork pronti per la stampa. Packaging con identità: loghi, palette, font — coordinati al tuo brand, ottimizzati per ogni materiale.',
    features: ['Concept e moodboard inclusi', 'Revisioni illimitate fino all\'approvazione', 'File di stampa certificati (PDF/X-4)', 'Mockup 3D realistico ante-produzione'],
    accent: '#ec4899',
  },
]

export default function ServiziPage() {
  const router = useRouter()
  const [hoveredService, setHoveredService] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [form, setForm] = useState({ nome: '', email: '', azienda: '', tel: '', note: '' })
  const [submitted, setSubmitted] = useState(false)
  const [sending, setSending] = useState(false)

  const openModal = (key: string) => {
    setSelectedService(key)
    setShowModal(true)
    setSubmitted(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    try {
      const sb = createClient()
      await sb.from('servizi_requests').insert({
        service: selectedService,
        nome: form.nome,
        email: form.email,
        azienda: form.azienda || null,
        tel: form.tel || null,
        note: form.note || null,
      })
    } catch (_) {
      // fail silently — show success anyway so user isn't confused
    }
    setSending(false)
    setSubmitted(true)
  }

  return (
    <>
      <NavWrapper activeLink="servizi" />

      {/* ── Hero ── */}
      <div className="sv-hero">
        <div className="sv-hero-inner">
          <div className="sv-tag">Servizi Premium</div>
          <h1 className="sv-title">Oltre il prodotto.<br /><span className="sv-title-accent">Tutto il servizio.</span></h1>
          <p className="sv-sub">
            Briopack non è solo packaging — è un partner che progetta, produce e gestisce.
            Dalla struttura tecnica alla grafica finita, dallo stoccaggio alla consegna.
          </p>
        </div>
        <div className="sv-hero-glow" />
      </div>

      {/* ── Service cards ── */}
      <main className="sv-main">
        <div className="sv-grid">
          {SERVICES.map(s => (
            <div
              key={s.key}
              className={`sv-card${hoveredService === s.key ? ' hovered' : ''}`}
              style={hoveredService === s.key ? { borderColor: s.accent + '55', boxShadow: `0 24px 56px ${s.accent}18, 0 4px 16px rgba(0,0,0,0.06)` } : {}}
              onMouseEnter={() => setHoveredService(s.key)}
              onMouseLeave={() => setHoveredService(null)}
            >
              <div className="sv-card-icon" style={{ color: s.accent, background: s.accent + '14' }}>
                {s.icon}
              </div>
              <div className="sv-card-title">{s.title}</div>
              <div className="sv-card-subtitle">{s.subtitle}</div>
              <div className="sv-card-desc">{s.desc}</div>
              <ul className="sv-card-features">
                {s.features.map(f => (
                  <li key={f} className="sv-card-feature">
                    <svg width="13" height="13" fill="none" stroke={s.accent} strokeWidth="2.2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                className="sv-card-cta"
                style={{ background: s.accent, boxShadow: `0 4px 18px ${s.accent}44` }}
                onClick={() => openModal(s.key)}
              >
                Richiedi informazioni
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 16 16" strokeLinecap="round"><line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4 13 8 9 12"/></svg>
              </button>
            </div>
          ))}
        </div>

        {/* ── Process strip ── */}
        <div className="sv-process">
          <div className="sv-process-title">Come funziona</div>
          <div className="sv-process-steps">
            {[
              { n: '01', label: 'Richiedi', desc: 'Compila il form — ti ricontattiamo entro 24h' },
              { n: '02', label: 'Consulta', desc: 'Briefing con il nostro team tecnico o grafico' },
              { n: '03', label: 'Proposta', desc: 'Preventivo dettagliato e piano di lavoro' },
              { n: '04', label: 'Avvia',   desc: 'Firma e partiamo. Aggiornamenti costanti.' },
            ].map((step, i) => (
              <div key={step.n} className="sv-step">
                <div className="sv-step-n">{step.n}</div>
                <div className="sv-step-label">{step.label}</div>
                <div className="sv-step-desc">{step.desc}</div>
                {i < 3 && <div className="sv-step-arrow"><svg width="20" height="20" fill="none" stroke="var(--ink-4)" strokeWidth="1.5" viewBox="0 0 24 24"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></div>}
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA band ── */}
        <div className="sv-cta-band">
          <h2 className="sv-cta-title">Non sai da dove cominciare?</h2>
          <p className="sv-cta-sub">Parlaci del tuo progetto — anche in modo informale. Capiremo insieme di cosa hai bisogno.</p>
          <div className="sv-cta-btns">
            <button className="sv-cta-btn-main" onClick={() => openModal('stoccaggio')}>Parla con noi</button>
            <a href="/contatti" className="sv-cta-btn-sec">Vai ai contatti</a>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>© 2025 Briopack Srl — P.IVA 02540090699 — <a href="tel:+390871869378" style={{ color: 'inherit', textDecoration: 'none' }}>0871 869378</a></div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[{ label: 'Home', href: '/' }, { label: 'Catalogo', href: '/catalogo' }, { label: 'Contatti', href: '/contatti' }].map(l => (
            <a key={l.href} href={l.href} style={{ fontSize: 13, color: 'var(--ink-4)', textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--ink-4)'}>
              {l.label}
            </a>
          ))}
        </div>
      </footer>

      {/* ── Request modal ── */}
      {showModal && (
        <div className="sv-modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="sv-modal">
            <button className="sv-modal-close" onClick={() => setShowModal(false)} aria-label="Chiudi">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>

            {submitted ? (
              <div className="sv-modal-success">
                <div className="sv-modal-success-icon">
                  <svg width="32" height="32" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div className="sv-modal-success-title">Richiesta inviata!</div>
                <div className="sv-modal-success-sub">Ti ricontatteremo entro 24 ore lavorative. Controlla la tua casella email.</div>
                <button className="sv-modal-success-btn" onClick={() => setShowModal(false)}>Chiudi</button>
              </div>
            ) : (
              <>
                <div className="sv-modal-header">
                  <div className="sv-modal-tag">
                    {SERVICES.find(s => s.key === selectedService)?.title ?? 'Servizi'}
                  </div>
                  <h2 className="sv-modal-title">Richiedi informazioni</h2>
                  <p className="sv-modal-sub">Compila il form — il nostro team ti risponde entro 24h lavorative, senza impegno.</p>
                </div>

                <form className="sv-modal-form" onSubmit={handleSubmit}>
                  <div className="sv-form-row">
                    <label className="sv-form-label">Nome e cognome *</label>
                    <input className="sv-form-input" required placeholder="Mario Rossi" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                  </div>
                  <div className="sv-form-row">
                    <label className="sv-form-label">Email aziendale *</label>
                    <input className="sv-form-input" type="email" required placeholder="mario@azienda.it" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                  </div>
                  <div className="sv-form-2col">
                    <div className="sv-form-row">
                      <label className="sv-form-label">Azienda</label>
                      <input className="sv-form-input" placeholder="Nome azienda" value={form.azienda} onChange={e => setForm(f => ({ ...f, azienda: e.target.value }))} />
                    </div>
                    <div className="sv-form-row">
                      <label className="sv-form-label">Telefono</label>
                      <input className="sv-form-input" type="tel" placeholder="+39 0871 869378" value={form.tel} onChange={e => setForm(f => ({ ...f, tel: e.target.value }))} />
                    </div>
                  </div>
                  <div className="sv-form-row">
                    <label className="sv-form-label">Descrivi il tuo progetto</label>
                    <textarea className="sv-form-textarea" rows={4} placeholder="Es. Cerco stoccaggio per 5.000 shopper mensili, ritiro settimanale…" value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
                  </div>
                  <div className="sv-form-privacy">
                    Inviando accetti la nostra <a href="/privacy">Privacy Policy</a>. I tuoi dati non vengono condivisi con terze parti.
                  </div>
                  <button type="submit" className="sv-form-submit" disabled={sending}>
                    {sending ? (
                      <>
                        <span className="sv-spinner" />
                        Invio in corso…
                      </>
                    ) : (
                      <>
                        Invia richiesta
                        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 16 16" strokeLinecap="round"><line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4 13 8 9 12"/></svg>
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .sv-hero { position: relative; background: linear-gradient(135deg,#1a1209 0%,#2c1d0a 40%,#1e1510 100%); padding: 80px 24px 72px; text-align: center; overflow: hidden; }
        .sv-hero-glow { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 60% at 50% 40%, rgba(232,114,26,0.18) 0%, transparent 70%); pointer-events: none; }
        .sv-hero-inner { position: relative; z-index: 1; max-width: 680px; margin: 0 auto; }
        .sv-tag { display: inline-flex; align-items: center; gap: 6px; background: rgba(232,114,26,0.15); border: 1px solid rgba(232,114,26,0.3); color: #f9b133; font-size: 12px; font-weight: 700; letter-spacing: 1.2px; text-transform: uppercase; padding: 5px 14px; border-radius: 100px; margin-bottom: 24px; }
        .sv-title { font-size: clamp(36px,5vw,58px); font-weight: 800; color: #fff; line-height: 1.15; margin: 0 0 20px; }
        .sv-title-accent { background: linear-gradient(90deg,#f9b133,#e8721a); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .sv-sub { font-size: 17px; color: rgba(255,255,255,0.62); line-height: 1.7; margin-bottom: 36px; }
        .sv-hero-pills { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
        .sv-hero-pill { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.14); color: rgba(255,255,255,0.75); font-size: 13px; font-weight: 500; padding: 6px 14px; border-radius: 100px; }

        .sv-main { max-width: 1160px; margin: 0 auto; padding: 64px 24px; }
        .sv-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; margin-bottom: 80px; }
        .sv-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 20px; padding: 36px 32px; display: flex; flex-direction: column; gap: 0; transition: border-color .25s, box-shadow .25s, transform .25s; cursor: default; }
        .sv-card.hovered { transform: translateY(-6px); }
        .sv-card-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin-bottom: 28px; transition: transform .25s; }
        .sv-card.hovered .sv-card-icon { transform: scale(1.08); }
        .sv-card-title { font-size: 22px; font-weight: 800; color: var(--ink); margin-bottom: 4px; }
        .sv-card-subtitle { font-size: 13px; color: var(--ink-4); margin-bottom: 16px; font-weight: 500; }
        .sv-card-desc { font-size: 14.5px; color: var(--ink-3); line-height: 1.65; margin-bottom: 24px; }
        .sv-card-features { list-style: none; padding: 0; margin: 0 0 32px; display: flex; flex-direction: column; gap: 10px; flex: 1; }
        .sv-card-feature { display: flex; align-items: flex-start; gap: 9px; font-size: 13.5px; color: var(--ink-3); line-height: 1.4; }
        .sv-card-feature svg { flex-shrink: 0; margin-top: 1px; }
        .sv-card-cta { display: flex; align-items: center; justify-content: center; gap: 8px; color: #fff; border: none; border-radius: 12px; padding: 13px 24px; font-size: 14px; font-weight: 700; cursor: pointer; font-family: var(--f); transition: filter .18s, transform .08s cubic-bezier(0.16,1,0.3,1); }
        .sv-card-cta:hover { filter: brightness(1.1); }
        .sv-card-cta:active { transform: scale(0.95); }

        .sv-process { border-top: 1px solid var(--border); padding-top: 64px; margin-bottom: 64px; }
        .sv-process-title { font-size: 13px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ink-4); margin-bottom: 36px; text-align: center; }
        .sv-process-steps { display: flex; align-items: flex-start; justify-content: center; gap: 0; }
        .sv-step { display: flex; flex-direction: column; align-items: center; text-align: center; flex: 1; max-width: 200px; position: relative; }
        .sv-step-n { font-size: 11px; font-weight: 800; letter-spacing: 1px; color: var(--accent); background: var(--accent-bg); padding: 4px 10px; border-radius: 100px; margin-bottom: 12px; }
        .sv-step-label { font-size: 16px; font-weight: 700; color: var(--ink); margin-bottom: 6px; }
        .sv-step-desc { font-size: 13px; color: var(--ink-4); line-height: 1.5; }
        .sv-step-arrow { position: absolute; top: 8px; right: -18px; }

        .sv-cta-band { background: linear-gradient(135deg,#1a1209,#2c1d0a); border-radius: 24px; padding: 64px 48px; text-align: center; }
        .sv-cta-title { font-size: 32px; font-weight: 800; color: #fff; margin-bottom: 16px; }
        .sv-cta-sub { font-size: 16px; color: rgba(255,255,255,0.58); margin-bottom: 36px; max-width: 480px; margin-left: auto; margin-right: auto; }
        .sv-cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .sv-cta-btn-main { background: var(--accent); color: #fff; border: none; border-radius: 12px; padding: 14px 32px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: var(--f); transition: background .18s, transform .08s cubic-bezier(0.16,1,0.3,1); }
        .sv-cta-btn-main:hover { background: var(--accent-h); }
        .sv-cta-btn-main:active { transform: scale(0.95); }
        .sv-cta-btn-sec { display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 14px 32px; font-size: 15px; font-weight: 600; text-decoration: none; transition: background .18s, transform .08s cubic-bezier(0.16,1,0.3,1); }
        .sv-cta-btn-sec:hover { background: rgba(255,255,255,0.16); }
        .sv-cta-btn-sec:active { transform: scale(0.95); }

        .sv-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); backdrop-filter: blur(4px); z-index: 8000; display: flex; align-items: center; justify-content: center; padding: 24px; animation: acDropIn .2s ease both; }
        .sv-modal { background: var(--surface); border-radius: 24px; width: 100%; max-width: 540px; max-height: 90vh; overflow-y: auto; padding: 44px 40px; position: relative; box-shadow: 0 32px 80px rgba(0,0,0,0.22); animation: acDropIn .25s cubic-bezier(0.16,1,0.3,1) both; }
        .sv-modal-close { position: absolute; top: 18px; right: 18px; background: var(--surface-2); border: none; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--ink-3); transition: background .15s, color .15s; }
        .sv-modal-close:hover { background: var(--border); color: var(--ink); }
        .sv-modal-header { margin-bottom: 28px; }
        .sv-modal-tag { display: inline-block; background: var(--accent-bg); color: var(--accent); font-size: 11.5px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 3px 10px; border-radius: 100px; margin-bottom: 12px; }
        .sv-modal-title { font-size: 24px; font-weight: 800; color: var(--ink); margin: 0 0 10px; }
        .sv-modal-sub { font-size: 14px; color: var(--ink-4); line-height: 1.6; margin: 0; }
        .sv-modal-form { display: flex; flex-direction: column; gap: 18px; }
        .sv-form-row { display: flex; flex-direction: column; gap: 6px; }
        .sv-form-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .sv-form-label { font-size: 13px; font-weight: 600; color: var(--ink-3); }
        .sv-form-input { border: 1.5px solid var(--border); border-radius: 10px; padding: 10px 14px; font-size: 14px; color: var(--ink); background: var(--surface); font-family: var(--f); transition: border-color .18s, box-shadow .18s; outline: none; }
        .sv-form-input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-bg); }
        .sv-form-textarea { border: 1.5px solid var(--border); border-radius: 10px; padding: 10px 14px; font-size: 14px; color: var(--ink); background: var(--surface); font-family: var(--f); resize: vertical; transition: border-color .18s, box-shadow .18s; outline: none; }
        .sv-form-textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-bg); }
        .sv-form-privacy { font-size: 12px; color: var(--ink-4); line-height: 1.5; }
        .sv-form-privacy a { color: var(--accent); text-decoration: none; }
        .sv-form-submit { display: flex; align-items: center; justify-content: center; gap: 8px; background: var(--accent); color: #fff; border: none; border-radius: 12px; padding: 14px 28px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: var(--f); transition: background .18s, transform .08s cubic-bezier(0.16,1,0.3,1); }
        .sv-form-submit:hover:not(:disabled) { background: var(--accent-h); }
        .sv-form-submit:active:not(:disabled) { transform: scale(0.97); }
        .sv-form-submit:disabled { opacity: 0.7; cursor: not-allowed; }
        .sv-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin .7s linear infinite; flex-shrink: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .sv-modal-success { text-align: center; padding: 24px 0; }
        .sv-modal-success-icon { width: 72px; height: 72px; border-radius: 50%; background: #d1fae5; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
        .sv-modal-success-title { font-size: 24px; font-weight: 800; color: var(--ink); margin-bottom: 12px; }
        .sv-modal-success-sub { font-size: 15px; color: var(--ink-4); line-height: 1.6; margin-bottom: 32px; }
        .sv-modal-success-btn { background: var(--accent); color: #fff; border: none; border-radius: 12px; padding: 12px 28px; font-size: 15px; font-weight: 700; cursor: pointer; font-family: var(--f); transition: background .18s; }
        .sv-modal-success-btn:hover { background: var(--accent-h); }

        @media (max-width: 900px) {
          .sv-grid { grid-template-columns: 1fr; }
          .sv-process-steps { flex-direction: column; align-items: center; gap: 24px; }
          .sv-step-arrow { display: none; }
          .sv-modal { padding: 32px 24px; }
          .sv-form-2col { grid-template-columns: 1fr; }
        }
        @media (max-width: 600px) {
          .sv-hero { padding: 56px 20px 52px; }
          .sv-cta-band { padding: 44px 24px; }
        }
      `}</style>
    </>
  )
}
