'use client'
import { useState, useRef, useEffect } from 'react'

interface Message { from: 'bot' | 'user'; text: string }

const FAQ = [
  {
    triggers: ['moq', 'minimo', 'quantita minim', 'quantità minim', 'minim'],
    answer: 'Il MOQ dipende dal formato: da 200 pz per i più piccoli fino a 500 pz per i più grandi. Lo vedi indicato su ogni variante nel configuratore.',
  },
  {
    triggers: ['prezzo', 'costo', 'quanto costa', 'tariff', 'listino'],
    answer: 'I prezzi partono da €0,52/pz per il formato più piccolo e variano in base a formato, colore e stampa. Li vedi aggiornati in tempo reale nel configuratore. Sono IVA esclusa.',
  },
  {
    triggers: ['stampa', 'logo', 'personaliz', 'digitale', 'foil', 'caldo', 'metalliz'],
    answer: 'Offriamo due tipi di stampa:\n• Digitale (CMYK) — nessun costo impianto, ideale per loghi colorati\n• A caldo (foil) — effetto metallizzato in 8 colori (oro, argento, rame, bianco, nero, rosso, bordò, verde) — costo impianto €120',
  },
  {
    triggers: ['tempi', 'consegna', 'spedizion', 'giorni', 'quando arriv', 'produzion'],
    answer: 'Tempi indicativi:\n• Neutri (senza stampa): 5–10 giorni lavorativi\n• Con stampa: 15–20 giorni dalla conferma artwork\nPer ordini urgenti contattaci direttamente.',
  },
  {
    triggers: ['artwork', 'file', 'formato file', 'grafica', 'inviare', 'illustrator', 'pdf', 'eps', 'ai'],
    answer: 'Accettiamo:\n• PDF vettoriale, AI, EPS, SVG (preferiti)\n• PNG o JPG ad alta risoluzione (min. 300 dpi)\nPuoi caricare il file nel configuratore oppure inviarlo dopo l\'ordine. Approviamo sempre una bozza prima di avviare la produzione.',
  },
  {
    triggers: ['material', 'carta', 'avana', 'kraft', 'grammatura', 'gram', 'ecolog', 'ricicl', 'fsc'],
    answer: 'Utilizziamo carta kraft disponibile in:\n• Avana (tono naturale caldo)\n• Bianca\n• Avana con sealing (per sigillatura termica)\nGrammature da 90 a 150 gr a seconda del formato. Carta riciclabile, certificata FSC su richiesta.',
  },
  {
    triggers: ['pagament', 'bonifico', 'fattura', 'iva', 'carta di credito'],
    answer: 'Accettiamo bonifico bancario e carte di credito. Emettiamo regolare fattura con IVA. Il pagamento viene richiesto prima dell\'avvio produzione.',
  },
  {
    triggers: ['contatt', 'email', 'telefon', 'assist', 'aiuto', 'parlare', 'umano', 'persona', 'scrivere'],
    answer: 'Puoi scrivere a info@briopack.it o usare il modulo preventivo (pulsante "Preventivo" in alto). Rispondiamo entro 24 ore lavorative.',
  },
]

const QUICK = [
  'Qual è il MOQ?',
  'Come funziona la stampa?',
  'Tempi di consegna?',
  'Formato file per artwork?',
]

function norm(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function findAnswer(input: string): string | null {
  const n = norm(input)
  for (const faq of FAQ) {
    if (faq.triggers.some(t => n.includes(norm(t)))) return faq.answer
  }
  return null
}

export function OrbChat() {
  const [open, setOpen]         = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: 'Ciao! 👋 Sono l\'assistente Briopack. Come posso aiutarti oggi?' },
  ])
  const [input, setInput]     = useState('')
  const [typing, setTyping]   = useState(false)
  const bottomRef             = useRef<HTMLDivElement>(null)
  const inputRef              = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [messages, open])

  function handleSend(text: string) {
    if (!text.trim() || typing) return
    setMessages(prev => [...prev, { from: 'user', text: text.trim() }])
    setInput('')
    setTyping(true)
    setTimeout(() => {
      const answer = findAnswer(text)
      const botText = answer
        ?? 'Non ho trovato una risposta precisa per questa domanda. Ti consiglio di richiedere un preventivo — il nostro team risponde in 24 ore lavorative.'
      setMessages(prev => [...prev, { from: 'bot', text: botText }])
      setTyping(false)
    }, 550)
  }

  const showFallbackBtn = (msg: Message) =>
    msg.from === 'bot' && (
      msg.text.includes('preventivo') || msg.text.includes('team risponde')
    )

  return (
    <>
      {/* ── Orb button ── */}
      <button
        onClick={() => setOpen(v => !v)}
        aria-label={open ? 'Chiudi assistente' : 'Apri assistente Briopack'}
        style={{
          position: 'fixed', bottom: 84, right: 22, zIndex: 9980,
          width: 54, height: 54, borderRadius: '50%', border: 'none',
          cursor: 'pointer', padding: 0, overflow: 'visible',
          background: 'conic-gradient(from 45deg, #c85e12, #e8721a, #ff9a3c, #ffd07a, #e8721a, #c85e12)',
          boxShadow: open
            ? '0 4px 24px rgba(232,114,26,0.65)'
            : '0 4px 20px rgba(232,114,26,0.42)',
          transition: 'box-shadow .3s, transform .2s',
          transform: open ? 'scale(0.91)' : 'scale(1)',
          animation: open ? 'none' : 'orb-idle 3.2s ease-in-out infinite',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {/* inner shimmer layer */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.38) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        ) : (
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {/* notification dot — shown when closed */}
        {!open && (
          <div style={{
            position: 'absolute', top: 1, right: 1,
            width: 12, height: 12, borderRadius: '50%',
            background: '#22c55e', border: '2px solid white',
          }} />
        )}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div style={{
          position: 'fixed', bottom: 152, right: 22, zIndex: 9979,
          width: 334, maxHeight: 490,
          background: 'var(--white)', borderRadius: 20,
          boxShadow: '0 12px 60px rgba(0,0,0,0.18)',
          display: 'flex', flexDirection: 'column',
          animation: 'chat-in .22s cubic-bezier(.16,1,.3,1)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            padding: '13px 16px', background: 'linear-gradient(135deg,#c85e12,#e8721a,#ff9a3c)',
            display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.22)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: '#fff', lineHeight: 1 }}>Assistente Briopack</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.82)', marginTop: 2 }}>Risposte immediate · 24/7</div>
            </div>
            <button onClick={() => setOpen(false)} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8,
              width: 28, height: 28, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 9 }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.from === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '84%', padding: '9px 12px',
                  borderRadius: msg.from === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                  background: msg.from === 'user' ? 'var(--accent)' : 'var(--surface)',
                  color: msg.from === 'user' ? '#fff' : 'var(--ink)',
                  fontSize: 12.5, lineHeight: 1.7, fontFamily: 'var(--f)',
                  whiteSpace: 'pre-wrap',
                }}>
                  {msg.text}
                  {showFallbackBtn(msg) && (
                    <button
                      onClick={() => {
                        setOpen(false)
                        window.dispatchEvent(new CustomEvent('open-preventivo', { detail: {} }))
                      }}
                      style={{
                        display: 'block', marginTop: 9, padding: '7px 12px',
                        background: 'var(--accent)', color: '#fff', border: 'none',
                        borderRadius: 8, fontSize: 11.5, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'var(--f)',
                      }}
                    >
                      Apri modulo preventivo →
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ padding: '10px 14px', borderRadius: '4px 14px 14px 14px', background: 'var(--surface)', display: 'flex', gap: 5, alignItems: 'center' }}>
                  {[0, 0.18, 0.36].map((delay, i) => (
                    <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--ink-4)', animation: `tdot 1.1s ${delay}s ease-in-out infinite` }} />
                  ))}
                </div>
              </div>
            )}

            {/* Quick replies — only at start */}
            {messages.length === 1 && !typing && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 2 }}>
                {QUICK.map(q => (
                  <button key={q} onClick={() => handleSend(q)} style={{
                    padding: '8px 12px', borderRadius: 10,
                    border: '1.5px solid var(--border)', background: 'var(--white)',
                    fontSize: 12, color: 'var(--ink-3)', cursor: 'pointer',
                    textAlign: 'left', fontFamily: 'var(--f)', transition: 'border-color .15s, background .15s',
                  }}>
                    {q}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input row */}
          <div style={{ padding: '9px 10px', borderTop: '1px solid var(--border)', display: 'flex', gap: 7, flexShrink: 0 }}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSend(input) }}
              placeholder="Scrivi una domanda…"
              style={{
                flex: 1, padding: '8px 11px', borderRadius: 10,
                border: '1.5px solid var(--border)', outline: 'none',
                fontSize: 12.5, fontFamily: 'var(--f)',
                background: 'var(--surface)', color: 'var(--ink)',
              }}
            />
            <button
              onClick={() => handleSend(input)}
              disabled={!input.trim() || typing}
              style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: input.trim() && !typing ? 'var(--accent)' : 'var(--surface)',
                border: '1.5px solid var(--border)',
                cursor: input.trim() && !typing ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background .15s',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={input.trim() && !typing ? '#fff' : 'var(--ink-4)'} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
              </svg>
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes orb-idle {
          0%,100% { transform:scale(1) translateY(0); filter:brightness(1); }
          50%      { transform:scale(1.07) translateY(-2px); filter:brightness(1.1); }
        }
        @keyframes chat-in {
          from { opacity:0; transform:translateY(14px) scale(0.96); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
        @keyframes tdot {
          0%,60%,100% { transform:translateY(0); opacity:.35; }
          30%          { transform:translateY(-4px); opacity:1; }
        }
      `}</style>
    </>
  )
}
