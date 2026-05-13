'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { type Product, SIZES, PRINT_OPTIONS, QTY_PRESETS, COLORS, DISC_TIERS } from '@/lib/products'

function fmt(n: number) {
  return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function ProductConfigurator({ product }: { product: Product }) {
  const { addItem, setCartOpen } = useCart()
  const router = useRouter()

  const [selSizeIdx, setSelSizeIdx] = useState(0)
  const [basePrice,  setBasePrice]  = useState(product.price)
  const [selColor,   setSelColor]   = useState(0)
  const [selPrints,  setSelPrints]  = useState<Set<string>>(new Set(['Senza Stampa']))
  const [qty,        setQty]        = useState(product.moq)
  const [fileOk,     setFileOk]     = useState(false)
  const [customL,    setCustomL]    = useState('')
  const [customW,    setCustomW]    = useState('')
  const [customH,    setCustomH]    = useState('')
  const [added,      setAdded]      = useState(false)

  const prevTotalRef  = useRef<number>(0)
  const [pricePopKey, setPricePopKey] = useState(0)

  const isCustom = SIZES[selSizeIdx]?.label === 'Custom'

  const calcUnit = () => {
    let u = basePrice + (isCustom ? 0.10 : 0)
    if (qty >= 5000)      u *= 0.68
    else if (qty >= 1000) u *= 0.80
    else if (qty >= 500)  u *= 0.90
    return u
  }

  const calcSetup = () => {
    let s = 0
    if ([...selPrints].some(c => c.includes('Flexo')))   s = 45
    if ([...selPrints].some(c => c.includes('Digitale'))) s = 80
    if ([...selPrints].some(c => c.includes('UV') || c.includes('Caldo'))) s += 30
    return s
  }

  const unit  = calcUnit()
  const setup = calcSetup()
  const total = unit * qty + setup

  useEffect(() => {
    if (total !== prevTotalRef.current) {
      setPricePopKey(k => k + 1)
      prevTotalRef.current = total
    }
  }, [total])

  const togglePrint = (opt: string) => {
    if (opt === 'Senza Stampa') { setSelPrints(new Set(['Senza Stampa'])); return }
    setSelPrints(prev => {
      const next = new Set(prev)
      next.delete('Senza Stampa')
      next.has(opt) ? next.delete(opt) : next.add(opt)
      if (next.size === 0) next.add('Senza Stampa')
      return next
    })
  }

  const handleAddToCart = () => {
    addItem({
      id: `${product.key}-${SIZES[selSizeIdx]?.label}`,
      name: product.name,
      cat: product.cat,
      size: isCustom ? `${customL}×${customW}×${customH} mm` : (SIZES[selSizeIdx]?.label ?? ''),
      qty,
      unitPrice: unit,
      setupCost: setup,
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    addItem({
      id: `${product.key}-${SIZES[selSizeIdx]?.label}`,
      name: product.name,
      cat: product.cat,
      size: isCustom ? `${customL}×${customW}×${customH} mm` : (SIZES[selSizeIdx]?.label ?? ''),
      qty,
      unitPrice: unit,
      setupCost: setup,
    })
    router.push('/checkout')
  }

  return (
    <div className="cfg-page-layout">
      {/* ── LEFT: PREVIEW + INFO ── */}
      <aside className="cfg-page-preview">
        <div className="cfg-page-visual">
          <div className="cfg-page-visual-inner" style={product.catKey === 'eco' ? { background: '#edf3ee' } : undefined}>
            <div style={{ transform: 'scale(1.4)' }}>{product.svg}</div>
          </div>
          {product.badge && (
            <div className={`pcard-badge ${product.badge.type}`} style={{ position: 'absolute', top: 16, left: 16 }}>
              {product.badge.label}
            </div>
          )}
        </div>

        <div className="cfg-page-info">
          <div className="cfg-page-cat">{product.cat}</div>
          <h1 className="cfg-page-name">{product.name}</h1>
          <p className="cfg-page-desc">{product.desc}</p>

          <div className="cfg-page-price-box">
            <div className="cfg-page-price-label">Prezzo unitario</div>
            <div key={pricePopKey} className="cfg-page-price price-pop">€{fmt(unit)}</div>
            <div className="cfg-page-price-note">IVA esclusa · varia con la quantità</div>
          </div>

          <div className="cfg-sum-rows">
            <div className="cfg-sum-row">
              <span>Misura</span>
              <span>
                {isCustom && customL && customW && customH
                  ? `${customL}×${customW}×${customH} mm`
                  : SIZES[selSizeIdx]?.label}
              </span>
            </div>
            <div className="cfg-sum-row"><span>Prezzo unitario</span><span>€{fmt(unit)}</span></div>
            <div className="cfg-sum-row"><span>Quantità</span><span>{qty.toLocaleString('it-IT')} pz</span></div>
            <div className="cfg-sum-row"><span>Impianti stampa</span><span>{setup > 0 ? `€${fmt(setup)}` : '—'}</span></div>
            <div className="cfg-sum-row cfg-sum-total"><span>Totale IVA esclusa</span><span>€{fmt(total)}</span></div>
          </div>
        </div>
      </aside>

      {/* ── RIGHT: CONFIGURATOR ── */}
      <div className="cfg-page-form">
        {/* Size */}
        <div className="cfg-section">
          <div className="cfg-label">Misura</div>
          <div className="size-grid">
            {SIZES.map((s, i) => (
              <button key={s.label} className={`size-btn${selSizeIdx === i ? ' sel' : ''}`}
                onClick={() => { setSelSizeIdx(i); if (s.price) setBasePrice(s.price) }}>
                <div className="size-btn-name">{s.label}</div>
                <div className="size-btn-dim">{s.dim}</div>
              </button>
            ))}
          </div>
          {isCustom && (
            <div className="custom-dims">
              <div className="custom-dims-label">Inserisci le dimensioni in millimetri</div>
              <div className="custom-dims-grid">
                {[
                  { label: 'Lunghezza', val: customL, set: setCustomL },
                  { label: 'Larghezza', val: customW, set: setCustomW },
                  { label: 'Altezza',   val: customH, set: setCustomH },
                ].map(f => (
                  <div key={f.label}>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>{f.label}</label>
                    <input type="number" value={f.val} onChange={e => f.set(e.target.value)} placeholder="es. 400" min={50} max={2000} />
                  </div>
                ))}
              </div>
              <div className="custom-surcharge">
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                +€0,10/pz per misure personalizzate
              </div>
            </div>
          )}
        </div>

        {/* Color */}
        <div className="cfg-section">
          <div className="cfg-label">Colore Scatola</div>
          <div className="color-row">
            {COLORS.map((c, i) => (
              <div key={c.label} className={`color-swatch${selColor === i ? ' sel' : ''}`}
                style={{ background: c.hex, border: c.border ? '1px solid #ddd' : undefined }}
                title={c.label} onClick={() => setSelColor(i)} />
            ))}
          </div>
          <div className="color-selected-label">Colore selezionato: <strong>{COLORS[selColor].label}</strong></div>
        </div>

        {/* Print */}
        <div className="cfg-section">
          <div className="cfg-label">Stampa & Finitura</div>
          <div className="chips">
            {PRINT_OPTIONS.map(opt => (
              <button key={opt} className={`chip${selPrints.has(opt) ? ' sel' : ''}`} onClick={() => togglePrint(opt)}>{opt}</button>
            ))}
          </div>
        </div>

        {/* Qty */}
        <div className="cfg-section">
          <div className="cfg-label">Quantità</div>
          <div className="qty-wrap">
            <div className="qty-presets">
              {QTY_PRESETS.map(q => (
                <button key={q} className={`qty-preset${qty === q ? ' sel' : ''}`} onClick={() => setQty(q)}>
                  {q.toLocaleString('it-IT')}
                </button>
              ))}
            </div>
            <div className="qty-stepper">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(100, q - 50))}>−</button>
              <input className="qty-input" type="number" value={qty} min={100} step={50}
                onChange={e => setQty(Math.max(100, parseInt(e.target.value) || 100))} />
              <button className="qty-btn" onClick={() => setQty(q => q + 50)}>+</button>
            </div>
          </div>
          <div className="disc-tiers">
            {DISC_TIERS.map(t => {
              const active = qty >= t.min && qty <= t.max
              return (
                <div key={t.label} className={`disc-tier${active ? ' active' : ''}`}>
                  <div className="dt-qty">{t.label}</div>
                  {t.disc ? <div className="dt-disc">{t.disc}</div> : <div className="dt-label">base</div>}
                </div>
              )
            })}
          </div>
        </div>

        {/* File upload */}
        <div className="cfg-section">
          <div className="cfg-label">Logo / Artwork</div>
          <div className="upload-zone" onClick={() => document.getElementById('file-upload-cfg')?.click()}>
            <div className="upload-icon-wrap">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16"/>
                <line x1="12" y1="12" x2="12" y2="21"/>
                <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
              </svg>
            </div>
            <div className="upload-main">Carica il tuo file logo o grafica</div>
            <div className="upload-sub">SVG · AI · EPS · PDF · PNG — max 50 MB</div>
          </div>
          <input type="file" id="file-upload-cfg" accept=".svg,.ai,.eps,.pdf,.png" style={{ display: 'none' }}
            onChange={e => { if (e.target.files?.length) setFileOk(true) }} />
          {fileOk && <div className="upload-ok" style={{ display: 'block' }}>✓ File caricato — il team invierà una bozza di stampa</div>}
        </div>

        {/* CTA */}
        <div className="cfg-page-cta">
          <button className={`cfg-addcart-btn${added ? ' added' : ''}`} onClick={handleAddToCart}>
            {added ? (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
                Aggiunto al carrello!
              </>
            ) : (
              <>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Aggiungi al carrello — €{fmt(total)}
              </>
            )}
          </button>
          <button className="cfg-buynow-btn" onClick={handleBuyNow}>
            Acquista subito
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
