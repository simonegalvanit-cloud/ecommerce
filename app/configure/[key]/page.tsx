'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import NavWrapper from '@/components/NavWrapper'
import CartDrawer from '@/components/CartDrawer'
import { useCart } from '@/lib/cart-context'
import { PRODUCT_SPECS, type SpecColor, type FoilColor } from '@/lib/products'

type PrintType = 'none' | 'digital' | 'hot-foil'
type Placement = 'front' | 'both-same' | 'both-diff'

// ── Placeholder pricing (prices will be added later) ─────────────────────────
const BASE_PRICE: Record<string, number> = {
  '18+8×24':  0.52,
  '22+10×29': 0.64,
  '27+12×37': 0.78,
  '32+13×41': 0.89,
  '32+17×45': 0.96,
  '45+15×49': 1.24,
}
const PRINT_ADD: Record<PrintType, number> = { none: 0, digital: 0.08, 'hot-foil': 0.16 }
const HOT_FOIL_SETUP = 120

// ── Animated number hook ──────────────────────────────────────────────────────
function useAnimatedNumber(target: number, duration = 320) {
  const [display, setDisplay] = useState(target)
  const prev = useRef(target)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const start = prev.current
    if (start === target) return
    const startTime = performance.now()
    function tick(now: number) {
      const t = Math.min((now - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      setDisplay(start + (target - start) * eased)
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
      else { setDisplay(target); prev.current = target }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration])

  return display
}

// ── Bag SVG preview ───────────────────────────────────────────────────────────
function BagPreview({ colorHex, hasPrint, placement, size = 'md' }: {
  colorHex: string; hasPrint: boolean; placement: Placement | null; size?: 'sm' | 'md' | 'lg'
}) {
  const isDouble = hasPrint && (placement === 'both-same' || placement === 'both-diff')
  const handleColor = colorHex === '#FFFFFF' || colorHex === '#F2F2F2' ? '#AAAAAA' : 'rgba(255,255,255,0.50)'
  const bodyStroke = colorHex === '#FFFFFF' ? '#CCCCCC' : 'rgba(0,0,0,0.10)'
  const bagW = size === 'lg' ? 130 : size === 'sm' ? 80 : 108
  const bagH = Math.round(bagW * 1.3)

  function Bag({ label, showPrint, isDiff }: { label: string; showPrint: boolean; isDiff?: boolean }) {
    return (
      <svg viewBox="0 0 140 180" width={isDouble ? Math.round(bagW * 0.88) : bagW} height={isDouble ? Math.round(bagH * 0.88) : bagH} fill="none">
        <ellipse cx="70" cy="173" rx="40" ry="4" fill="rgba(0,0,0,0.07)" />
        <rect x="12" y="48" width="116" height="124" rx="7" fill={colorHex} stroke={bodyStroke} strokeWidth="1.5" />
        <rect x="12" y="48" width="116" height="11" rx="0" fill="rgba(0,0,0,0.04)" />
        <path d="M41 48 Q41 17 70 15 Q99 17 99 48" stroke={handleColor} strokeWidth="5" fill="none" strokeLinecap="round" />
        {showPrint && (
          <>
            <rect x="31" y="76" width="78" height="60" rx="3" fill="rgba(232,114,26,0.07)" stroke="#e8721a" strokeWidth="1.2" strokeDasharray="4 2.5" />
            <text x="70" y="109" textAnchor="middle" fontSize="7.5" fill="#e8721a" fontFamily="system-ui" fontWeight="600">
              {isDiff ? 'Soggetto diverso' : 'Area stampa'}
            </text>
          </>
        )}
        <text x="70" y="163" textAnchor="middle" fontSize="7.5" fill="rgba(0,0,0,0.30)" fontFamily="system-ui">{label}</text>
      </svg>
    )
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 16, padding: '24px 0 16px' }}>
      <Bag label="Fronte" showPrint={hasPrint} />
      {isDouble && <Bag label="Retro" showPrint={hasPrint} isDiff={placement === 'both-diff'} />}
    </div>
  )
}

// ── Section label ─────────────────────────────────────────────────────────────
function SLabel({ n, label, done }: { n: number; label: string; done: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 18 }}>
      <div style={{
        width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
        background: done ? 'var(--accent)' : 'var(--surface-2)',
        border: done ? 'none' : '1.5px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .2s',
      }}>
        {done ? (
          <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
            <path d="M2 5l2.2 2.2L8 2.5" />
          </svg>
        ) : (
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--ink-4)' }}>{n}</span>
        )}
      </div>
      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.7px' }}>
        {label}
      </div>
    </div>
  )
}

// ── Info modal ────────────────────────────────────────────────────────────────
function InfoModal({ type, onClose }: { type: 'digital' | 'hot-foil'; onClose: () => void }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.28)' }} />
      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        zIndex: 601, background: 'var(--white)', borderRadius: 18, padding: '28px 28px 24px',
        maxWidth: 420, width: 'calc(100% - 48px)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--ink)', marginBottom: 16 }}>
          {type === 'digital' ? 'Stampa Digitale' : 'Stampa a Caldo'}
        </div>
        {type === 'digital' ? (
          <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.78, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ margin: 0 }}>La stampa digitale utilizza tecnologia <strong>quadricromia CMYK</strong>, perfetta per loghi e grafiche a più colori.</p>
            <p style={{ margin: 0 }}>⚠️ <strong>Non stampa il bianco</strong> — i colori chiari su carta avana o colorata vengono influenzati dal tono del supporto.</p>
            <p style={{ margin: 0 }}>📐 <strong>Larghezza massima di stampa: 29 cm</strong></p>
            <p style={{ margin: 0 }}>✅ <strong>Nessun costo impianto</strong> — ideale per piccole e grandi tirature.</p>
          </div>
        ) : (
          <div style={{ fontSize: 13.5, color: 'var(--ink-3)', lineHeight: 1.78, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ margin: 0 }}>La stampa a caldo trasferisce una lamina <strong>foil metallizzata</strong> tramite calore e pressione.</p>
            <p style={{ margin: 0 }}>✨ Disponibile in <strong>8 colori foil</strong>: oro, argento, rame, bianco, nero, rosso, bordò e verde.</p>
            <p style={{ margin: 0 }}>⚙️ È previsto un <strong>costo impianto stampa</strong> (€{HOT_FOIL_SETUP}) indicato nel preventivo.</p>
          </div>
        )}
        <button onClick={onClose} style={{
          marginTop: 22, width: '100%', padding: '12px', borderRadius: 10,
          background: 'var(--accent)', border: 'none', color: '#fff',
          fontSize: 13.5, fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--f)',
        }}>Chiudi</button>
      </div>
    </>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function ConfigurePage() {
  const params = useParams()
  const router = useRouter()
  const { addItem, setCartOpen } = useCart()
  const productKey = typeof params.key === 'string' ? params.key : null
  const spec = productKey ? PRODUCT_SPECS.find(s => s.productKey === productKey) ?? null : null

  const [sizeIdx, setSizeIdx]           = useState<number | null>(null)
  const [colorKey, setColorKey]         = useState<string | null>(null)
  const [printType, setPrintType]       = useState<PrintType | null>(null)
  const [foilKey, setFoilKey]           = useState<string | null>(null)
  const [placement, setPlacement]       = useState<Placement | null>(null)
  const [artworkLater, setArtworkLater] = useState(false)
  const [fileName, setFileName]         = useState<string | null>(null)
  const [qty, setQty]                   = useState(0)
  const [qtyInput, setQtyInput]         = useState('')
  const [infoModal, setInfoModal]       = useState<'digital' | 'hot-foil' | null>(null)
  const [addedFlash, setAddedFlash]     = useState(false)
  const [snapToast, setSnapToast]       = useState<{ from: number; to: number } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const selectedSize  = spec && sizeIdx !== null ? spec.sizes[sizeIdx] : null
  const selectedColor = spec?.colors.find(c => c.key === colorKey) ?? null
  const moq           = selectedSize?.moq ?? 0
  const showPrint     = printType === 'digital' || printType === 'hot-foil'
  const showFoil      = printType === 'hot-foil'
  const needArtwork   = showPrint && placement && placement !== 'both-diff'

  // Compute live prices
  const basePpu   = selectedSize ? (BASE_PRICE[selectedSize.format] ?? 0.70) : 0
  const printPpu  = printType ? PRINT_ADD[printType] : 0
  const placeMult = placement === 'both-same' || placement === 'both-diff' ? 1.3 : 1
  const unitPrice = (basePpu + printPpu) * placeMult
  const totalPrice = unitPrice * qty
  const setupCost  = showFoil ? HOT_FOIL_SETUP : 0

  const animUnit  = useAnimatedNumber(selectedSize ? unitPrice : 0)
  const animTotal = useAnimatedNumber(selectedSize && qty >= moq ? totalPrice : 0)
  const animSetup = useAnimatedNumber(setupCost)

  useEffect(() => {
    if (selectedSize) {
      setQty(selectedSize.moq)
      setQtyInput(String(selectedSize.moq))
    }
  }, [sizeIdx])
  useEffect(() => {
    if (!showPrint) { setPlacement(null); setFileName(null); setArtworkLater(false) }
    if (!showFoil) setFoilKey(null)
  }, [printType])

  function adjustQty(dir: 1 | -1) {
    if (!moq) return
    const next = qty + dir * moq
    if (next >= moq) { setQty(next); setQtyInput(String(next)) }
  }

  const artworkOk = !needArtwork || artworkLater || !!fileName
  const canAdd = !!selectedSize && !!colorKey && printType !== null &&
    (!showFoil || !!foilKey) && (!showPrint || !!placement) && artworkOk && qty >= moq

  function handleAddToCart() {
    if (!canAdd || !spec || !selectedSize || !selectedColor) return
    const printLabel = printType === 'none' ? 'Senza stampa'
      : printType === 'digital' ? `Digitale · ${placement === 'front' ? 'Fronte' : placement === 'both-same' ? 'F+R uguali' : 'F+R diversi'}`
      : `Caldo ${foilKey ?? ''} · ${placement === 'front' ? 'Fronte' : placement === 'both-same' ? 'F+R uguali' : 'F+R diversi'}`
    addItem({
      id: `${productKey}-${selectedSize.format}-${colorKey}-${printType}-${foilKey ?? 'none'}-${placement ?? 'none'}-${Date.now()}`,
      name: spec.name,
      cat: 'Shopper · Neutro',
      size: `${selectedSize.format} cm · ${selectedSize.weightGr}gr`,
      color: selectedColor.label,
      print: printLabel,
      qty,
      unitPrice: parseFloat(unitPrice.toFixed(4)),
      setupCost,
      artworkUrl: fileName ?? undefined,
      moq,
    })
    setAddedFlash(true)
    setTimeout(() => setAddedFlash(false), 1800)
    setCartOpen(true)
  }

  function handleContactTeam() {
    const lines = [
      spec ? `Prodotto: ${spec.name}` : '',
      selectedSize ? `Formato: ${selectedSize.format} cm · ${selectedSize.weightGr} gr · MOQ ${selectedSize.moq}` : '',
      selectedColor ? `Colore: ${selectedColor.label}` : '',
      printType === 'hot-foil' ? `Stampa: Stampa a Caldo${foilKey ? ` · ${spec?.foilColors.find(f => f.key === foilKey)?.label}` : ''}` : '',
      'Posizione: Fronte-Retro (soggetti diversi)',
      qty ? `Quantità: ${qty.toLocaleString('it-IT')} pz` : '',
    ].filter(Boolean).join('\n')
    window.dispatchEvent(new CustomEvent('open-preventivo', { detail: { prefill: lines } }))
  }

  if (!spec) {
    return (
      <>
        <NavWrapper />
        <div style={{ padding: '80px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: 16, color: 'var(--ink-4)' }}>Prodotto non trovato.</div>
          <button onClick={() => router.push('/')} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', fontFamily: 'var(--f)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            ← Torna al catalogo
          </button>
        </div>
      </>
    )
  }

  const fmt2 = (n: number) => n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const div = <div style={{ borderTop: '1px solid var(--border)', margin: '32px 0' }} />

  return (
    <>
      <NavWrapper />
      <CartDrawer />
      {infoModal && <InfoModal type={infoModal} onClose={() => setInfoModal(null)} />}

      {/* ── Page shell ── */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 24px 80px' }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '22px 0 28px', fontSize: 13, color: 'var(--ink-4)' }}>
          <button onClick={() => router.push('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600, padding: 0 }}>
            ← Catalogo
          </button>
          <span style={{ color: 'var(--border-2)' }}>/</span>
          <span style={{ color: 'var(--ink-3)' }}>{spec.name}</span>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.6px' }}>{spec.name}</h1>
          <p style={{ margin: '6px 0 0', fontSize: 14, color: 'var(--ink-4)' }}>{spec.subtitle}</p>
        </div>

        {/* Two-column grid */}
        <div className="cfg-two-col" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 40, alignItems: 'start' }}>

          {/* ── LEFT: config steps ── */}
          <div>

            {/* 1. SIZE */}
            <SLabel n={1} label="Formato" done={sizeIdx !== null} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(148px,1fr))', gap: 10, marginBottom: 4 }}>
              {spec.sizes.map((s, idx) => {
                const on = sizeIdx === idx
                return (
                  <button key={s.format} onClick={() => setSizeIdx(idx)} style={{
                    padding: '14px 13px', borderRadius: 12, textAlign: 'left',
                    border: on ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                    background: on ? 'rgba(232,114,26,0.04)' : 'var(--white)',
                    cursor: 'pointer', fontFamily: 'var(--f)', transition: 'all .15s',
                  }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: on ? 'var(--accent)' : 'var(--ink)', letterSpacing: '-0.2px' }}>
                      {s.format} <span style={{ fontWeight: 400, fontSize: 12 }}>cm</span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 6, lineHeight: 1.5 }}>
                      {s.weightGr} gr · MOQ {s.moq.toLocaleString('it-IT')} pz
                    </div>
                  </button>
                )
              })}
            </div>

            {div}

            {/* 2. COLOR */}
            <SLabel n={2} label="Colore carta" done={!!colorKey} />
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {spec.colors.map((c: SpecColor) => {
                const on = colorKey === c.key
                const isWhite = c.hex === '#FFFFFF' || c.hex === '#F2F2F2'
                return (
                  <button key={c.key} onClick={() => setColorKey(c.key)} style={{
                    display: 'flex', alignItems: 'center', gap: 11,
                    padding: '11px 16px', borderRadius: 11,
                    border: on ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                    background: on ? 'rgba(232,114,26,0.04)' : 'var(--white)',
                    cursor: 'pointer', fontFamily: 'var(--f)', transition: 'all .15s',
                  }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: c.hex,
                      border: isWhite ? '1.5px solid #CCC' : '1.5px solid rgba(0,0,0,0.08)',
                      boxShadow: on ? '0 0 0 2.5px rgba(232,114,26,0.28)' : 'none',
                      transition: 'box-shadow .15s',
                    }} />
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: on ? 'var(--accent)' : 'var(--ink)' }}>{c.label}</div>
                      {c.ref && <div style={{ fontSize: 10.5, color: 'var(--ink-5)' }}>Ref. {c.ref}</div>}
                    </div>
                  </button>
                )
              })}
            </div>

            {div}

            {/* 3. PRINT TYPE */}
            <SLabel n={3} label="Tipo di stampa" done={printType !== null} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {([
                { key: 'none' as PrintType, label: 'Senza Stampa', sub: 'Articolo neutro, nessuna personalizzazione',
                  icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" stroke="currentColor"><circle cx="12" cy="12" r="9"/><path d="M4.93 4.93l14.14 14.14"/></svg> },
                { key: 'digital' as PrintType, label: 'Stampa Digitale', sub: 'Quadricromia CMYK · Nessun costo impianto', info: 'digital' as const,
                  icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg> },
                { key: 'hot-foil' as PrintType, label: 'Stampa a Caldo', sub: `Foil metallizzato · Setup €${HOT_FOIL_SETUP}`, info: 'hot-foil' as const,
                  icon: <svg width="17" height="17" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
              ].filter(opt => !spec?.printModes || spec.printModes.includes(opt.key))).map(opt => {
                const on = printType === opt.key
                return (
                  <button key={opt.key} onClick={() => setPrintType(opt.key)} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 16px', borderRadius: 12,
                    border: on ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                    background: on ? 'rgba(232,114,26,0.04)' : 'var(--white)',
                    cursor: 'pointer', fontFamily: 'var(--f)', textAlign: 'left', transition: 'all .15s',
                  }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: on ? 'rgba(232,114,26,0.12)' : 'var(--surface)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: on ? 'var(--accent)' : 'var(--ink-4)', transition: 'all .15s',
                    }}>{opt.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: on ? 'var(--accent)' : 'var(--ink)' }}>{opt.label}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{opt.sub}</div>
                    </div>
                    {opt.info && (
                      <button onClick={e => { e.stopPropagation(); setInfoModal(opt.info!) }} style={{
                        width: 26, height: 26, borderRadius: '50%',
                        background: 'var(--surface)', border: '1px solid var(--border)',
                        cursor: 'pointer', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 11, fontWeight: 800, color: 'var(--ink-4)', fontFamily: 'var(--f)',
                      }}>?</button>
                    )}
                  </button>
                )
              })}
            </div>

            {/* 4. FOIL COLOR */}
            {showFoil && (
              <>
                {div}
                <SLabel n={4} label="Colore Foil" done={!!foilKey} />
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {spec.foilColors.map((f: FoilColor) => {
                    const on = foilKey === f.key
                    const isLight = f.hex === '#F2F2F2'
                    const grad = f.key === 'oro' ? 'linear-gradient(135deg,#F5E070,#C8A020,#F5E070)'
                      : f.key === 'argento' ? 'linear-gradient(135deg,#E4E4E4,#9C9C9C,#E4E4E4)'
                      : f.key === 'rame' ? 'linear-gradient(135deg,#D49870,#A85C28,#D49870)' : undefined
                    return (
                      <button key={f.key} onClick={() => setFoilKey(f.key)} style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                        padding: '10px 9px 9px', borderRadius: 11, width: 68, cursor: 'pointer',
                        border: on ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                        background: on ? 'rgba(232,114,26,0.04)' : 'var(--white)',
                        fontFamily: 'var(--f)', transition: 'all .15s',
                      }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: 9,
                          background: grad ?? f.hex, border: isLight ? '1.5px solid #CCC' : 'none',
                          boxShadow: on ? '0 0 0 2.5px rgba(232,114,26,0.3)' : '0 1px 4px rgba(0,0,0,0.12)',
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

            {/* 5. PLACEMENT */}
            {showPrint && (
              <>
                {div}
                <SLabel n={showFoil ? 5 : 4} label="Posizione stampa" done={!!placement} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {([
                    { key: 'front' as Placement, label: 'Fronte', sub: 'Stampa sul solo fronte' },
                    { key: 'both-same' as Placement, label: 'Fronte-Retro (uguali)', sub: 'Stesso soggetto su entrambi i lati' },
                    { key: 'both-diff' as Placement, label: 'Fronte-Retro (soggetti diversi)', sub: 'Soggetti diversi — il team ti contatterà' },
                  ]).map(opt => {
                    const on = placement === opt.key
                    return (
                      <button key={opt.key} onClick={() => setPlacement(opt.key)} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '13px 16px', borderRadius: 11,
                        border: on ? '2px solid var(--accent)' : '1.5px solid var(--border)',
                        background: on ? 'rgba(232,114,26,0.04)' : 'var(--white)',
                        cursor: 'pointer', fontFamily: 'var(--f)', textAlign: 'left', transition: 'all .15s',
                      }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                          border: on ? '5px solid var(--accent)' : '2px solid var(--border-2)',
                          background: 'var(--white)', transition: 'all .15s',
                        }} />
                        <div>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: on ? 'var(--accent)' : 'var(--ink)' }}>{opt.label}</div>
                          <div style={{ fontSize: 11.5, color: 'var(--ink-4)', marginTop: 2 }}>{opt.sub}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
                {placement === 'both-diff' && (
                  <div style={{ marginTop: 14, padding: '14px 16px', borderRadius: 12, background: 'rgba(232,114,26,0.06)', border: '1px solid rgba(232,114,26,0.2)' }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', marginBottom: 5 }}>Configurazione personalizzata</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.65 }}>
                      Per soggetti diversi fronte-retro è necessario un preventivo ad hoc. Clicca su <strong>Contatta il team</strong> nel riquadro a destra.
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 6. ARTWORK */}
            {needArtwork && (
              <>
                {div}
                <SLabel n={showFoil ? 6 : 5} label="Artwork / Logo" done={!!fileName || artworkLater} />
                <div
                  onClick={() => !artworkLater && fileRef.current?.click()}
                  style={{
                    border: `2px dashed ${fileName ? 'var(--accent)' : 'var(--border-2)'}`,
                    borderRadius: 14, padding: '28px 24px', textAlign: 'center',
                    cursor: artworkLater ? 'default' : 'pointer',
                    background: fileName ? 'rgba(232,114,26,0.03)' : 'var(--surface)',
                    opacity: artworkLater ? 0.45 : 1, transition: 'all .2s',
                  }}
                >
                  {fileName ? (
                    <>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--accent)', marginBottom: 6 }}>✓ {fileName}</div>
                      <button onClick={e => { e.stopPropagation(); setFileName(null); if (fileRef.current) fileRef.current.value = '' }}
                        style={{ fontSize: 11.5, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'var(--f)' }}>
                        Rimuovi
                      </button>
                    </>
                  ) : (
                    <>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="1.6" strokeLinecap="round" style={{ marginBottom: 8 }}>
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink-3)' }}>Carica il tuo artwork</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ink-5)', marginTop: 4 }}>PDF · AI · PNG · JPG · SVG · EPS</div>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept=".pdf,.ai,.png,.jpg,.jpeg,.svg,.eps" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setFileName(f.name); setArtworkLater(false) } }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 13, cursor: 'pointer', fontSize: 13, color: 'var(--ink-3)', fontFamily: 'var(--f)', userSelect: 'none' }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0,
                    border: `2px solid ${artworkLater ? 'var(--accent)' : 'var(--border-2)'}`,
                    background: artworkLater ? 'var(--accent)' : 'var(--white)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
                  }}>
                    {artworkLater && <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"><path d="M2 5l2.2 2.2L8 2.5"/></svg>}
                  </div>
                  <input type="checkbox" checked={artworkLater} onChange={e => { setArtworkLater(e.target.checked); if (e.target.checked) setFileName(null) }} style={{ display: 'none' }} />
                  Invierò l&apos;artwork in un secondo momento
                </label>
                {artworkLater && (
                  <div style={{
                    marginTop: 11, padding: '13px 15px', borderRadius: 11,
                    background: 'rgba(232,114,26,0.05)', border: '1px solid rgba(232,114,26,0.18)',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 7 }}>Come funziona</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.72, display: 'flex', flexDirection: 'column', gap: 5 }}>
                      <div>📧 Dopo la conferma dell&apos;ordine il team ti invierà via email le istruzioni per caricare il file.</div>
                      <div>📐 Formati accettati: <strong>PDF vettoriale, AI, EPS, SVG</strong> oppure PNG/JPG a min. 300 dpi.</div>
                      <div>✅ La produzione inizia solo dopo l&apos;approvazione della bozza grafica da parte tua.</div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 7. QUANTITY */}
            {div}
            <SLabel n={showFoil ? (needArtwork ? 7 : 6) : (needArtwork ? 6 : 5)} label="Quantità" done={qty >= moq && !!selectedSize} />
            {!selectedSize ? (
              <div style={{ fontSize: 13, color: 'var(--ink-5)', fontStyle: 'italic' }}>Seleziona prima un formato per visualizzare il MOQ</div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 11 }}>
                  <button onClick={() => adjustQty(-1)} disabled={qty <= moq} style={{
                    width: 52, height: 52, borderRadius: '11px 0 0 11px',
                    border: '1.5px solid var(--border)', borderRight: 'none',
                    background: 'var(--white)', cursor: qty <= moq ? 'not-allowed' : 'pointer',
                    fontSize: 24, color: qty <= moq ? 'var(--border-2)' : 'var(--ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none',
                    transition: 'color .15s',
                  }}>−</button>
                  <div style={{
                    flex: 1, maxWidth: 200, height: 52, border: '1.5px solid var(--border)', borderLeft: 'none', borderRight: 'none',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={qtyInput}
                      onChange={e => setQtyInput(e.target.value.replace(/[^0-9]/g, ''))}
                      onBlur={() => {
                        const raw = parseInt(qtyInput) || moq
                        const snapped = Math.max(moq, Math.round(raw / moq) * moq)
                        if (snapped !== raw && raw > 0) {
                          setSnapToast({ from: raw, to: snapped })
                          clearTimeout((window as unknown as Record<string, ReturnType<typeof setTimeout>>).__snapTimer)
                          ;(window as unknown as Record<string, ReturnType<typeof setTimeout>>).__snapTimer = setTimeout(() => setSnapToast(null), 4500)
                        }
                        setQty(snapped)
                        setQtyInput(String(snapped))
                      }}
                      onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                      style={{
                        width: 80, textAlign: 'center', border: 'none', outline: 'none',
                        fontSize: 20, fontWeight: 900, color: 'var(--ink)',
                        fontFamily: 'var(--f)', background: 'transparent',
                      }}
                    />
                    <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-4)' }}>pz</span>
                  </div>
                  <button onClick={() => adjustQty(1)} style={{
                    width: 52, height: 52, borderRadius: '0 11px 11px 0',
                    border: '1.5px solid var(--border)', borderLeft: 'none',
                    background: 'var(--white)', cursor: 'pointer',
                    fontSize: 24, color: 'var(--ink)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', userSelect: 'none',
                  }}>+</button>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-5)' }}>
                  Minimo {moq.toLocaleString('it-IT')} pz · multipli di {moq.toLocaleString('it-IT')} pz · digita una quantità o usa i tasti
                </div>
                {snapToast && (
                  <div style={{
                    marginTop: 10, padding: '9px 14px', borderRadius: 10,
                    background: 'rgba(232,114,26,0.08)', border: '1px solid rgba(232,114,26,0.25)',
                    fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.5,
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    animation: 'snap-in .18s ease',
                  }}>
                    <span style={{ color: 'var(--accent)', fontSize: 14, flexShrink: 0, marginTop: 1 }}>↕</span>
                    <span>
                      Quantità arrotondata da <strong>{snapToast.from.toLocaleString('it-IT')}</strong> a{' '}
                      <strong style={{ color: 'var(--accent)' }}>{snapToast.to.toLocaleString('it-IT')} pz</strong>
                      {' '}— deve essere un multiplo di {moq.toLocaleString('it-IT')} pz
                    </span>
                  </div>
                )}
              </>
            )}

          </div>

          {/* ── RIGHT: sticky price panel ── */}
          <div style={{ position: 'sticky', top: 90 }}>
            <div style={{
              background: 'var(--white)', border: '1px solid var(--border)',
              borderRadius: 20, overflow: 'hidden',
              boxShadow: '0 4px 28px rgba(0,0,0,0.07)',
            }}>
              {/* Bag preview */}
              <div style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '4px 0 0' }}>
                <BagPreview
                  colorHex={selectedColor?.hex ?? '#E8DDD0'}
                  hasPrint={showPrint}
                  placement={placement}
                  size="lg"
                />
              </div>

              {/* Price section */}
              <div style={{ padding: '22px 22px 0' }}>
                {/* Unit price */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontSize: 12.5, color: 'var(--ink-4)', fontWeight: 500 }}>Prezzo unitario</span>
                  <span style={{
                    fontSize: selectedSize ? 22 : 16, fontWeight: 900, color: selectedSize ? 'var(--ink)' : 'var(--ink-5)',
                    letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums',
                    transition: 'font-size .2s',
                  }}>
                    {selectedSize ? `€ ${fmt2(animUnit)}` : '—'}
                    {selectedSize && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-4)', marginLeft: 2 }}>/pz</span>}
                  </span>
                </div>

                {/* Qty */}
                {selectedSize && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, color: 'var(--ink-4)', fontWeight: 500 }}>Quantità</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-3)' }}>
                      {qty >= moq ? qty.toLocaleString('it-IT') : moq.toLocaleString('it-IT')} pz
                    </span>
                  </div>
                )}

                {/* Setup */}
                {showFoil && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                    <span style={{ fontSize: 12.5, color: 'var(--ink-4)', fontWeight: 500 }}>Costo impianto</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink-3)', fontVariantNumeric: 'tabular-nums' }}>
                      € {fmt2(animSetup)}
                    </span>
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border)', margin: '14px 0' }} />

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 22 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>Totale stimato</span>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      fontSize: selectedSize && qty >= moq ? 28 : 20,
                      fontWeight: 900, color: selectedSize && qty >= moq ? 'var(--accent)' : 'var(--ink-5)',
                      letterSpacing: '-0.8px', fontVariantNumeric: 'tabular-nums',
                      transition: 'font-size .2s, color .2s',
                    }}>
                      {selectedSize && qty >= moq ? `€ ${fmt2(animTotal + animSetup)}` : '—'}
                    </div>
                    {showFoil && selectedSize && qty >= moq && (
                      <div style={{ fontSize: 10.5, color: 'var(--ink-5)', marginTop: 2 }}>impianto incluso</div>
                    )}
                  </div>
                </div>
              </div>

              {/* CTA button */}
              <div style={{ padding: '0 22px 22px' }}>
                {placement === 'both-diff' ? (
                  <button onClick={handleContactTeam} style={{
                    width: '100%', padding: '15px 24px', borderRadius: 13,
                    background: 'var(--accent)', border: 'none', color: '#fff',
                    fontSize: 14.5, fontWeight: 800, cursor: 'pointer', fontFamily: 'var(--f)',
                    transition: 'opacity .15s',
                  }}>
                    Contatta il team →
                  </button>
                ) : (
                  <button onClick={handleAddToCart} disabled={!canAdd} style={{
                    width: '100%', padding: '15px 24px', borderRadius: 13,
                    background: addedFlash ? '#22a046' : canAdd ? 'var(--accent)' : 'var(--surface-2)',
                    border: canAdd ? 'none' : '1.5px solid var(--border)',
                    color: canAdd ? '#fff' : 'var(--ink-4)',
                    fontSize: 14.5, fontWeight: 800,
                    cursor: canAdd ? 'pointer' : 'not-allowed',
                    fontFamily: 'var(--f)', transition: 'all .25s',
                  }}>
                    {addedFlash ? '✓ Aggiunto al carrello' : canAdd ? 'Aggiungi al carrello →' : 'Completa la configurazione'}
                  </button>
                )}
                <div style={{ fontSize: 11.5, color: 'var(--ink-5)', textAlign: 'center', marginTop: 12, lineHeight: 1.6 }}>
                  Prezzi indicativi · IVA esclusa · confermati in fase di ordine
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Responsive: collapse to single column on mobile ── */}
      <style>{`
        @media (max-width: 760px) {
          .cfg-two-col { grid-template-columns: 1fr !important; }
          /* Reorder: price panel goes below config on mobile */
          .cfg-two-col > div:last-child { order: 2; }
          .cfg-two-col > div:first-child { order: 1; }
        }
        @media (max-width: 640px) {
          /* Compact breadcrumb */
          .cfg-breadcrumb-wrap { padding: 14px 0 20px !important; font-size: 12px !important; }
          /* Compact title */
          .cfg-title-h1 { font-size: 22px !important; }
          /* Sticky price panel: not sticky in single col */
          .cfg-price-panel { position: static !important; }
          /* Size grid: 2 columns */
          .cfg-size-grid { grid-template-columns: 1fr 1fr !important; }
          /* Reduce foil button size */
          .cfg-foil-btn { width: 58px !important; }
          /* Quantity: larger touch targets */
          .cfg-qty-btn { width: 48px !important; height: 48px !important; font-size: 20px !important; }
        }
        @keyframes snap-in {
          from { opacity: 0; transform: translateY(-4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
