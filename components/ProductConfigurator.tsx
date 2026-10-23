'use client'
import { useState, useEffect, useRef } from 'react'
import { PRODUCT_SPECS, type ProductSpec, type SpecColor, type FoilColor } from '@/lib/products'

type PrintType = 'none' | 'digital' | 'hot-foil'
type Placement = 'front' | 'both-same' | 'both-diff'

interface Props {
  productKey: string | null
  onClose: () => void
}

// ── Bag SVG preview ──────────────────────────────────────────────────────────
function BagPreview({ colorHex, hasPrint, placement }: {
  colorHex: string; hasPrint: boolean; placement: Placement | null
}) {
  const isDouble = hasPrint && (placement === 'both-same' || placement === 'both-diff')
  const handleColor = colorHex === '#FFFFFF' || colorHex === '#F2F2F2'
    ? '#AAAAAA' : 'rgba(255,255,255,0.50)'
  const bodyStroke = colorHex === '#FFFFFF' ? '#CCCCCC' : 'rgba(0,0,0,0.10)'

  function Bag({ label, showPrint, isDiff }: { label: string; showPrint: boolean; isDiff?: boolean }) {
    return (
      <svg viewBox="0 0 140 180" width={isDouble ? 96 : 112} height={isDouble ? 126 : 146} fill="none">
        <ellipse cx="70" cy="173" rx="40" ry="4" fill="rgba(0,0,0,0.07)" />
        {/* Body */}
        <rect x="12" y="48" width="116" height="124" rx="7"
          fill={colorHex} stroke={bodyStroke} strokeWidth="1.5" />
        {/* Top fold shadow */}
        <rect x="12" y="48" width="116" height="11" rx="0" fill="rgba(0,0,0,0.04)" />
        {/* Handles */}
        <path d="M41 48 Q41 17 70 15 Q99 17 99 48"
          stroke={handleColor} strokeWidth="5" fill="none" strokeLinecap="round" />
        {/* Print zone */}
        {showPrint && (
          <>
            <rect x="31" y="76" width="78" height="60" rx="3"
              fill="rgba(232,114,26,0.07)" stroke="#e8721a"
              strokeWidth="1.2" strokeDasharray="4 2.5" />
            <text x="70" y="109" textAnchor="middle" fontSize="7.5"
              fill="#e8721a" fontFamily="system-ui" fontWeight="600">
              {isDiff ? 'Soggetto diverso' : 'Area stampa'}
            </text>
          </>
        )}
        <text x="70" y="163" textAnchor="middle" fontSize="7.5"
          fill="rgba(0,0,0,0.30)" fontFamily="system-ui">{label}</text>
      </svg>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 20, padding: '20px 0 14px' }}>
      <Bag label="Fronte" showPrint={hasPrint} />
      {isDouble && <Bag label="Retro" showPrint={hasPrint} isDiff={placement === 'both-diff'} />}
    </div>
  )
}

// ── Section label ────────────────────────────────────────────────────────────
function SLabel({ label, done }: { label: string; done: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
      <div style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        background: done ? 'var(--accent)' : 'transparent',
        border: done ? 'none' : '1.5px solid var(--border-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .2s',
      }}>
        {done && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
            <path d="M2 5l2.2 2.2L8 2.5" />
          </svg>
        )}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
        {label}
      </div>
    </div>
  )
}

// ── Info tooltip modal ───────────────────────────────────────────────────────
function InfoModal({ type, onClose }: { type: 'digital' | 'hot-foil'; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(0,0,0,0.25)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 401, background: '#fff', borderRadius: 18, padding: '28px 28px 24px',
        maxWidth: 420, width: 'calc(100% - 48px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', marginBottom: 16, letterSpacing: '-0.3px' }}>
          {type === 'digital' ? 'Stampa Digitale' : 'Stampa a Caldo'}
        </div>
        {type === 'digital' ? (
          <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.78, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ margin: 0 }}>La stampa digitale utilizza tecnologia <strong>quadricromia CMYK</strong>, perfetta per loghi, illustrazioni e grafiche a più colori.</p>
            <p style={{ margin: 0 }}>⚠️ <strong>Non stampa il bianco</strong> — i colori chiari su carta avana o colorata vengono influenzati dal tono del supporto.</p>
            <p style={{ margin: 0 }}>📐 <strong>Larghezza massima di stampa: 29 cm</strong></p>
            <p style={{ margin: 0 }}>✅ <strong>Nessun costo impianto</strong> — ideale per piccole e grandi tirature.</p>
          </div>
        ) : (
          <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.78, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ margin: 0 }}>La stampa a caldo trasferisce una lamina <strong>foil metallizzata</strong> tramite calore e pressione, creando un effetto visivamente esclusivo.</p>
            <p style={{ margin: 0 }}>✨ Disponibile in <strong>8 colori foil</strong>: oro, argento, rame, bianco, nero, rosso, bordò e verde.</p>
            <p style={{ margin: 0 }}>💼 Perfetta per <strong>brand premium</strong> e packaging di lusso.</p>
            <p style={{ margin: 0 }}>⚙️ È previsto un <strong>costo impianto stampa</strong> (matrice dedicata) indicato nel preventivo.</p>
          </div>
        )}
        <button
          onClick={onClose}
          style={{
            marginTop: 22, width: '100%', padding: '12px', borderRadius: 10,
            background: 'var(--accent)', border: 'none', color: '#fff',
            fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--f)',
          }}
        >Chiudi</button>
      </div>
    </>
  )
}

// ── Main component ───────────────────────────────────────────────────────────
export function ProductConfigurator({ productKey, onClose }: Props) {
  const spec = productKey ? PRODUCT_SPECS.find(s => s.productKey === productKey) ?? null : null

  const [sizeIdx, setSizeIdx]       = useState<number | null>(null)
  const [colorKey, setColorKey]     = useState<string | null>(null)
  const [printType, setPrintType]   = useState<PrintType | null>(null)
  const [foilKey, setFoilKey]       = useState<string | null>(null)
  const [placement, setPlacement]   = useState<Placement | null>(null)
  const [artworkLater, setArtworkLater] = useState(false)
  const [fileName, setFileName]     = useState<string | null>(null)
  const [qty, setQty]               = useState(0)
  const [infoModal, setInfoModal]   = useState<'digital' | 'hot-foil' | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const selectedSize  = spec && sizeIdx !== null ? spec.sizes[sizeIdx] : null
  const selectedColor = spec?.colors.find(c => c.key === colorKey) ?? null
  const moq           = selectedSize?.moq ?? 0
  const showPrint     = printType === 'digital' || printType === 'hot-foil'
  const showFoil      = printType === 'hot-foil'
  const needArtwork   = showPrint && placement && placement !== 'both-diff'

  useEffect(() => {
    if (selectedSize) setQty(selectedSize.moq)
  }, [sizeIdx])

  useEffect(() => {
    if (!showPrint) { setPlacement(null); setFileName(null); setArtworkLater(false) }
    if (!showFoil) setFoilKey(null)
  }, [printType])

  // Close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  function adjustQty(dir: 1 | -1) {
    if (!moq) return
    const next = qty + dir * moq
    if (next >= moq) setQty(next)
  }

  const artworkOk  = !needArtwork || artworkLater || !!fileName
  const canSubmit  = !!selectedSize && !!colorKey && printType !== null &&
    (!showFoil || !!foilKey) &&
    (!showPrint || !!placement) &&
    artworkOk &&
    qty >= moq

  function buildSummary() {
    if (!spec || !selectedSize || !selectedColor) return ''
    const lines = [
      `Prodotto: ${spec.name}`,
      `Formato: ${selectedSize.format} cm · ${selectedSize.weightGr} gr`,
      `Colore: ${selectedColor.label}`,
      printType === 'none' ? 'Stampa: Senza Stampa'
        : printType === 'digital' ? 'Stampa: Stampa Digitale'
        : 'Stampa: Stampa a Caldo',
      foilKey ? `Colore foil: ${spec.foilColors.find(f => f.key === foilKey)?.label ?? foilKey}` : '',
      placement === 'front' ? 'Posizione: Fronte'
        : placement === 'both-same' ? 'Posizione: Fronte-Retro (uguali)'
        : placement === 'both-diff' ? 'Posizione: Fronte-Retro (soggetti diversi)' : '',
      `Quantità: ${qty.toLocaleString('it-IT')} pz`,
      fileName ? `Artwork: ${fileName}` : artworkLater ? 'Artwork: da inviare successivamente' : '',
    ].filter(Boolean).join('\n')
    return lines
  }

  function handleSubmit() {
    if (!canSubmit) return
    const msg = buildSummary()
    window.dispatchEvent(new CustomEvent('open-preventivo', { detail: { prefill: msg } }))
    onClose()
  }

  function handleDiffContact() {
    const msg = buildSummary()
    window.dispatchEvent(new CustomEvent('open-preventivo', { detail: { prefill: msg } }))
    onClose()
  }

  if (!spec) return null

  const divider = <div style={{ borderTop: '1px solid var(--border)', margin: '26px 0' }} />

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.48)',
        zIndex: 200, backdropFilter: 'blur(3px)',
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 201,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px',
      }}>
        <div style={{
          background: '#fff', borderRadius: 22, width: '100%', maxWidth: 660,
          maxHeight: '94vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 28px 90px rgba(0,0,0,0.24)',
          overflow: 'hidden',
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
            padding: '22px 26px 0', flexShrink: 0,
          }}>
            <div>
              <div style={{ fontSize: 19, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.4px' }}>
                {spec.name}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 3 }}>{spec.subtitle}</div>
            </div>
            <button onClick={onClose} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 9, width: 34, height: 34, cursor: 'pointer', flexShrink: 0, marginLeft: 16,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="var(--ink-3)" strokeWidth="2.2" strokeLinecap="round">
                <path d="M1 1l12 12M13 1L1 13" />
              </svg>
            </button>
          </div>

          {/* Bag preview */}
          <div style={{ padding: '0 26px', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
            <BagPreview
              colorHex={selectedColor?.hex ?? '#E8DDD0'}
              hasPrint={showPrint}
              placement={placement}
            />
          </div>

          {/* Scrollable config */}
          <div style={{ padding: '24px 26px', overflowY: 'auto', flex: 1 }}>

            {/* ── SIZE ── */}
            <SLabel label="Formato" done={sizeIdx !== null} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(142px,1fr))', gap: 9 }}>
              {spec.sizes.map((s, idx) => {
                const on = sizeIdx === idx
                return (
                  <button key={s.format} onClick={() => setSizeIdx(idx)} style={{
                    padding: '13px 12px', borderRadius: 11, textAlign: 'left',
                    border: on ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                    background: on ? 'rgba(232,114,26,0.04)' : '#fff',
                    cursor: 'pointer', fontFamily: 'var(--f)', transition: 'all .15s',
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 800, color: on ? 'var(--accent)' : 'var(--ink)', letterSpacing: '-0.2px' }}>
                      {s.format} <span style={{ fontWeight: 400, fontSize: 12 }}>cm</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 5, lineHeight: 1.5 }}>
                      {s.weightGr} gr · MOQ {s.moq.toLocaleString('it-IT')} pz
                    </div>
                  </button>
                )
              })}
            </div>

            {divider}

            {/* ── COLOR ── */}
            <SLabel label="Colore carta" done={!!colorKey} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {spec.colors.map((c: SpecColor) => {
                const on = colorKey === c.key
                const isWhite = c.hex === '#FFFFFF' || c.hex === '#F2F2F2'
                return (
                  <button key={c.key} onClick={() => setColorKey(c.key)} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 14px', borderRadius: 10,
                    border: on ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                    background: on ? 'rgba(232,114,26,0.04)' : '#fff',
                    cursor: 'pointer', fontFamily: 'var(--f)', transition: 'all .15s',
                  }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 7, flexShrink: 0,
                      background: c.hex,
                      border: isWhite ? '1.5px solid #CCC' : '1.5px solid rgba(0,0,0,0.08)',
                      boxShadow: on ? '0 0 0 2.5px rgba(232,114,26,0.28)' : 'none',
                      transition: 'box-shadow .15s',
                    }} />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: on ? 'var(--accent)' : 'var(--ink)' }}>{c.label}</div>
                      {c.ref && <div style={{ fontSize: 10.5, color: 'var(--ink-5)' }}>Ref. {c.ref}</div>}
                    </div>
                  </button>
                )
              })}
            </div>

            {divider}

            {/* ── PRINT TYPE ── */}
            <SLabel label="Tipo di stampa" done={printType !== null} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {([
                {
                  key: 'none' as PrintType,
                  label: 'Senza Stampa',
                  sub: 'Articolo neutro, nessuna personalizzazione',
                  icon: (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" stroke="currentColor">
                      <circle cx="12" cy="12" r="9" /><path d="M4.93 4.93l14.14 14.14" />
                    </svg>
                  ),
                },
                {
                  key: 'digital' as PrintType,
                  label: 'Stampa Digitale',
                  sub: 'Quadricromia CMYK · Nessun costo impianto',
                  info: 'digital' as const,
                  icon: (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
                    </svg>
                  ),
                },
                {
                  key: 'hot-foil' as PrintType,
                  label: 'Stampa a Caldo',
                  sub: 'Foil metallizzato · Effetto premium',
                  info: 'hot-foil' as const,
                  icon: (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ),
                },
              ] as { key: PrintType; label: string; sub: string; info?: 'digital' | 'hot-foil'; icon: React.ReactNode }[]).map(opt => {
                const on = printType === opt.key
                return (
                  <button key={opt.key} onClick={() => setPrintType(opt.key)} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '13px 14px', borderRadius: 12,
                    border: on ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                    background: on ? 'rgba(232,114,26,0.04)' : '#fff',
                    cursor: 'pointer', fontFamily: 'var(--f)', textAlign: 'left', transition: 'all .15s',
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 9, flexShrink: 0,
                      background: on ? 'rgba(232,114,26,0.12)' : 'var(--surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: on ? 'var(--accent)' : 'var(--ink-4)', transition: 'all .15s',
                    }}>{opt.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: on ? 'var(--accent)' : 'var(--ink)' }}>{opt.label}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 2 }}>{opt.sub}</div>
                    </div>
                    {opt.info && (
                      <button
                        onClick={e => { e.stopPropagation(); setInfoModal(opt.info!) }}
                        style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: 'var(--surface)', border: '1px solid var(--border)',
                          cursor: 'pointer', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 11, fontWeight: 800, color: 'var(--ink-4)', fontFamily: 'var(--f)',
                        }}
                      >?</button>
                    )}
                  </button>
                )
              })}
            </div>

            {/* ── FOIL COLOR ── */}
            {showFoil && (
              <>
                {divider}
                <SLabel label="Colore Foil" done={!!foilKey} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {spec.foilColors.map((f: FoilColor) => {
                    const on = foilKey === f.key
                    const isLight = f.hex === '#F2F2F2'
                    const grad = f.key === 'oro'
                      ? 'linear-gradient(135deg,#F5E070,#C8A020,#F5E070)'
                      : f.key === 'argento'
                        ? 'linear-gradient(135deg,#E4E4E4,#9C9C9C,#E4E4E4)'
                        : f.key === 'rame'
                          ? 'linear-gradient(135deg,#D49870,#A85C28,#D49870)'
                          : undefined
                    return (
                      <button key={f.key} onClick={() => setFoilKey(f.key)} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                        padding: '9px 8px 8px', borderRadius: 10, width: 66, cursor: 'pointer',
                        border: on ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                        background: on ? 'rgba(232,114,26,0.04)' : '#fff',
                        fontFamily: 'var(--f)', transition: 'all .15s',
                      }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 8,
                          background: grad ?? f.hex,
                          border: isLight ? '1.5px solid #CCC' : 'none',
                          boxShadow: on
                            ? '0 0 0 2.5px rgba(232,114,26,0.3)'
                            : '0 1px 4px rgba(0,0,0,0.12)',
                          transition: 'box-shadow .15s',
                        }} />
                        <div style={{ fontSize: 10.5, fontWeight: on ? 700 : 500, color: on ? 'var(--accent)' : 'var(--ink-3)', lineHeight: 1 }}>
                          {f.label}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            )}

            {/* ── PLACEMENT ── */}
            {showPrint && (
              <>
                {divider}
                <SLabel label="Posizione stampa" done={!!placement} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
                  {([
                    { key: 'front' as Placement, label: 'Fronte', sub: 'Stampa sul solo fronte' },
                    { key: 'both-same' as Placement, label: 'Fronte-Retro (uguali)', sub: 'Stesso soggetto su entrambi i lati' },
                    { key: 'both-diff' as Placement, label: 'Fronte-Retro (soggetti diversi)', sub: 'Soggetti diversi — il team ti contatterà' },
                  ]).map(opt => {
                    const on = placement === opt.key
                    return (
                      <button key={opt.key} onClick={() => setPlacement(opt.key)} style={{
                        display: 'flex', alignItems: 'center', gap: 13,
                        padding: '12px 14px', borderRadius: 10,
                        border: on ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                        background: on ? 'rgba(232,114,26,0.04)' : '#fff',
                        cursor: 'pointer', fontFamily: 'var(--f)', textAlign: 'left', transition: 'all .15s',
                      }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                          border: on ? '5px solid var(--accent)' : '2px solid var(--border-2)',
                          background: '#fff', transition: 'all .15s',
                        }} />
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: on ? 'var(--accent)' : 'var(--ink)' }}>{opt.label}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 1 }}>{opt.sub}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                {placement === 'both-diff' && (
                  <div style={{
                    marginTop: 14, padding: '14px 16px', borderRadius: 12,
                    background: 'rgba(232,114,26,0.06)', border: '1px solid rgba(232,114,26,0.2)',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 5 }}>
                      Configurazione personalizzata
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.65 }}>
                      Per soggetti diversi fronte-retro è necessario un preventivo ad hoc.
                      Clicca su <strong>&quot;Contatta il team&quot;</strong> in basso — ti risponderemo entro 24h con la soluzione migliore.
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── ARTWORK ── */}
            {needArtwork && (
              <>
                {divider}
                <SLabel label="Artwork / Logo" done={!!fileName || artworkLater} />
                <div
                  onClick={() => !artworkLater && fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${fileName ? 'var(--accent)' : 'var(--border-2)'}`,
                    borderRadius: 14, padding: '26px 20px', textAlign: 'center',
                    cursor: artworkLater ? 'default' : 'pointer',
                    background: fileName ? 'rgba(232,114,26,0.03)' : 'var(--surface)',
                    opacity: artworkLater ? 0.45 : 1,
                    transition: 'all .2s',
                  }}
                >
                  {fileName ? (
                    <>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>
                        ✓ {fileName}
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); setFileName(null); if (fileRef.current) fileRef.current.value = '' }}
                        style={{ fontSize: 11.5, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--f)' }}
                      >Rimuovi</button>
                    </>
                  ) : (
                    <>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="1.6" strokeLinecap="round" style={{ marginBottom: 8 }}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-3)' }}>Carica il tuo artwork</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-5)', marginTop: 4 }}>PDF · AI · PNG · JPG · SVG · EPS</div>
                    </>
                  )}
                </div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.ai,.png,.jpg,.jpeg,.svg,.eps"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const f = e.target.files?.[0]
                    if (f) { setFileName(f.name); setArtworkLater(false) }
                  }}
                />
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 9, marginTop: 12,
                  cursor: 'pointer', fontSize: 13, color: 'var(--ink-3)', fontFamily: 'var(--f)',
                  userSelect: 'none',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: `2px solid ${artworkLater ? 'var(--accent)' : 'var(--border-2)'}`,
                    background: artworkLater ? 'var(--accent)' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all .15s',
                  }}>
                    {artworkLater && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                        <path d="M2 5l2.2 2.2L8 2.5" />
                      </svg>
                    )}
                  </div>
                  <input
                    type="checkbox" checked={artworkLater}
                    onChange={e => { setArtworkLater(e.target.checked); if (e.target.checked) setFileName(null) }}
                    style={{ display: 'none' }}
                  />
                  Invierò l&apos;artwork in un secondo momento
                </label>
              </>
            )}

            {/* ── QUANTITY ── */}
            {divider}
            <SLabel label="Quantità" done={qty >= moq && !!selectedSize} />
            {!selectedSize ? (
              <div style={{ fontSize: 13, color: 'var(--ink-5)', fontStyle: 'italic' }}>
                Seleziona prima un formato per visualizzare il MOQ
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 10 }}>
                  <button
                    onClick={() => adjustQty(-1)}
                    disabled={qty <= moq}
                    style={{
                      width: 46, height: 48, borderRadius: '10px 0 0 10px',
                      border: '1.5px solid var(--border)', borderRight: 'none',
                      background: '#fff', cursor: qty <= moq ? 'not-allowed' : 'pointer',
                      fontSize: 22, color: qty <= moq ? 'var(--border-2)' : 'var(--ink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'color .15s', userSelect: 'none',
                    }}
                  >−</button>
                  <div style={{
                    flex: 1, height: 48,
                    border: '1.5px solid var(--border)',
                    borderLeft: 'none', borderRight: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    fontSize: 18, fontWeight: 900, color: 'var(--ink)',
                  }}>
                    {qty.toLocaleString('it-IT')}
                    <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-4)' }}>pz</span>
                  </div>
                  <button
                    onClick={() => adjustQty(1)}
                    style={{
                      width: 46, height: 48, borderRadius: '0 10px 10px 0',
                      border: '1.5px solid var(--border)', borderLeft: 'none',
                      background: '#fff', cursor: 'pointer',
                      fontSize: 22, color: 'var(--ink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      userSelect: 'none',
                    }}
                  >+</button>
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-5)' }}>
                  Minimo {moq.toLocaleString('it-IT')} pz · ordina in multipli di {moq.toLocaleString('it-IT')} pz
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={{
            padding: '18px 26px', borderTop: '1px solid var(--border)',
            background: '#fff', flexShrink: 0,
          }}>
            {placement === 'both-diff' ? (
              <button
                onClick={handleDiffContact}
                disabled={!selectedSize || !colorKey || !printType}
                style={{
                  width: '100%', padding: '14px 24px', borderRadius: 12,
                  background: 'var(--accent)', border: 'none', color: '#fff',
                  fontSize: 14.5, fontWeight: 800, cursor: !selectedSize || !colorKey || !printType ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--f)', opacity: !selectedSize || !colorKey || !printType ? 0.5 : 1,
                  transition: 'opacity .15s',
                }}
              >
                Contatta il team →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  width: '100%', padding: '14px 24px', borderRadius: 12,
                  background: canSubmit ? 'var(--accent)' : 'var(--surface)',
                  border: canSubmit ? 'none' : '1.5px solid var(--border)',
                  color: canSubmit ? '#fff' : 'var(--ink-4)',
                  fontSize: 14.5, fontWeight: 800,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--f)', transition: 'all .2s',
                }}
              >
                {canSubmit ? 'Richiedi Preventivo →' : 'Completa la configurazione per continuare'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Info tooltip modals */}
      {infoModal && <InfoModal type={infoModal} onClose={() => setInfoModal(null)} />}
    </>
  )
}
