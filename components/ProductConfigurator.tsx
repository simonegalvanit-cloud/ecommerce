'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/lib/cart-context'
import { type Product, SIZES, PRINT_OPTIONS, QTY_PRESETS, COLORS, DISC_TIERS } from '@/lib/products'

function fmt(n: number) {
  return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function RollingPrice({ value, className }: { value: string; className?: string }) {
  const prevRef = useRef<string>(value)
  const prev = prevRef.current

  useEffect(() => { prevRef.current = value })

  const chars = value.split('')
  const prevChars = prev.split('')
  // Align from the right so the decimal/cents stay in sync
  const shift = prevChars.length - chars.length

  return (
    <div className={className ?? 'cfg-page-price'} style={{ display: 'flex', alignItems: 'baseline' }}>
      <span>€</span>
      {chars.map((ch, i) => {
        const pi = i + shift
        const prevCh = pi >= 0 && pi < prevChars.length ? prevChars[pi] : ''
        const isDigit = /[0-9]/.test(ch)
        const changed = isDigit && ch !== prevCh
        return (
          <span
            key={i}
            style={{ display: 'inline-block', overflow: isDigit ? 'hidden' : 'visible', lineHeight: 1, verticalAlign: 'bottom' }}
          >
            <span
              key={changed ? `${i}-${ch}` : `${i}-s`}
              style={{ display: 'block', animation: changed ? 'digitRollIn 0.42s cubic-bezier(0.22,1,0.36,1) both' : 'none' }}
            >
              {ch}
            </span>
          </span>
        )
      })}
    </div>
  )
}

export default function ProductConfigurator({ product }: { product: Product }) {
  const { addItem, setCartOpen } = useCart()
  const router = useRouter()

  // Per-product config with global fallbacks
  const sizes       = product.sizes       ?? SIZES
  const colors      = product.colors      ?? COLORS
  const printOptions = product.printOptions ?? PRINT_OPTIONS
  const qtyPresets  = product.qtyPresets  ?? QTY_PRESETS
  const discTiers   = product.discTiers   ?? DISC_TIERS

  const [selSizeIdx, setSelSizeIdx] = useState(0)
  const [basePrice,  setBasePrice]  = useState(product.price)
  const [selColor,   setSelColor]   = useState(0)
  const [selPrints,  setSelPrints]  = useState<Set<string>>(new Set([printOptions[0] ?? 'Senza Stampa']))
  const [qty,        setQty]        = useState(product.moq)

  const [customL,    setCustomL]    = useState('')
  const [customW,    setCustomW]    = useState('')
  const [customH,    setCustomH]    = useState('')
  const [added,        setAdded]       = useState(false)
  const [flyAnim,      setFlyAnim]     = useState<{ x: number; y: number; dx: number; dy: number } | null>(null)
  const [artworkUrl,   setArtworkUrl]  = useState<string | null>(null)
  const [artworkName,  setArtworkName] = useState<string | null>(null)
  const [uploading,    setUploading]   = useState(false)
  const [uploadError,  setUploadError] = useState('')
  const addBtnRef = useRef<HTMLButtonElement>(null)


  const isCustom = sizes[selSizeIdx]?.label === 'Custom'

  const calcUnit = () => {
    let u = basePrice + (isCustom ? 0.10 : 0)
    // Apply discount tier
    const tier = discTiers.find(t =>
      qty >= t.min && (t.max === null || t.max === Infinity || qty <= (t.max as number))
    )
    if (tier?.disc) {
      const pct = parseFloat(String(tier.disc).replace('-', '').replace('%', ''))
      u *= (1 - pct / 100)
    }
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


  const noprint = printOptions[0] ?? 'Senza Stampa'

  const togglePrint = (opt: string) => {
    if (opt === noprint) { setSelPrints(new Set([noprint])); return }
    setSelPrints(prev => {
      const next = new Set(prev)
      next.delete(noprint)
      next.has(opt) ? next.delete(opt) : next.add(opt)
      if (next.size === 0) next.add(noprint)
      return next
    })
  }

  const handleAddToCart = () => {
    const btnEl = addBtnRef.current
    const cartEl = document.querySelector('.cart-pill') as HTMLElement | null
    if (btnEl) {
      const btnRect = btnEl.getBoundingClientRect()
      const cartRect = cartEl?.getBoundingClientRect()
      const startX = btnRect.left + btnRect.width / 2
      const startY = btnRect.top + btnRect.height / 2
      const endX = cartRect ? cartRect.left + cartRect.width / 2 : window.innerWidth - 80
      const endY = cartRect ? cartRect.top + cartRect.height / 2 : 32
      setFlyAnim({ x: startX, y: startY, dx: endX - startX, dy: endY - startY })
      setTimeout(() => setFlyAnim(null), 750)
    }
    addItem({
      id: `${product.key}-${sizes[selSizeIdx]?.label}`,
      name: product.name,
      cat: product.cat,
      size: isCustom ? `${customL}×${customW}×${customH} mm` : (sizes[selSizeIdx]?.label ?? ''),
      qty,
      unitPrice: unit,
      setupCost: setup,
      ...(artworkUrl ? { artworkUrl } : {}),
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2200)
  }

  const handleBuyNow = () => {
    addItem({
      id: `${product.key}-${sizes[selSizeIdx]?.label}`,
      name: product.name,
      cat: product.cat,
      size: isCustom ? `${customL}×${customW}×${customH} mm` : (sizes[selSizeIdx]?.label ?? ''),
      qty,
      unitPrice: unit,
      setupCost: setup,
      ...(artworkUrl ? { artworkUrl } : {}),
    })
    router.push('/checkout')
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadError('')
    setArtworkUrl(null)
    setArtworkName(null)
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/upload-artwork', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setUploadError(data.error || 'Errore caricamento.'); return }
      setArtworkUrl(data.url)
      setArtworkName(data.name)
    } catch {
      setUploadError('Errore di rete. Riprova.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <>
    <div className="cfg-page-layout">
      {/* ── LEFT: PREVIEW + INFO ── */}
      <aside className="cfg-page-preview">
        <div className="cfg-page-visual">
          <div className="cfg-page-visual-inner" style={product.catKey === 'eco' ? { background: '#edf3ee' } : undefined}>
            {product.svg ? (
              <div style={{ transform: 'scale(1.4)' }}>{product.svg}</div>
            ) : (
              <svg viewBox="0 0 110 110" fill="none" style={{ width: 108, transform: 'scale(1.4)' }}>
                <rect x="16" y="34" width="78" height="62" rx="4" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
                <polygon points="16,34 55,16 94,34 55,52" fill="#e6e0d4" stroke="#b8924a" strokeWidth="1.5"/>
              </svg>
            )}
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
            <RollingPrice value={fmt(unit)} />
            <div className="cfg-page-price-note">IVA esclusa · varia con la quantità</div>
          </div>

          <div className="cfg-sum-rows">
            <div className="cfg-sum-row">
              <span>Misura</span>
              <span>
                {isCustom && customL && customW && customH
                  ? `${customL}×${customW}×${customH} mm`
                  : sizes[selSizeIdx]?.label}
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
            {sizes.map((s, i) => (
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
        {colors.length > 0 && (
          <div className="cfg-section">
            <div className="cfg-label">Colore</div>
            <div className="color-row">
              {colors.map((c, i) => (
                <div key={c.label} className={`color-swatch${selColor === i ? ' sel' : ''}`}
                  style={{ background: c.hex, border: c.border ? '1px solid #ddd' : undefined }}
                  title={c.label} onClick={() => setSelColor(i)} />
              ))}
            </div>
            <div className="color-selected-label">Colore selezionato: <strong>{colors[selColor]?.label}</strong></div>
          </div>
        )}

        {/* Print */}
        {printOptions.length > 0 && (
          <div className="cfg-section">
            <div className="cfg-label">Stampa & Finitura</div>
            <div className="chips">
              {printOptions.map(opt => (
                <button key={opt} className={`chip${selPrints.has(opt) ? ' sel' : ''}`} onClick={() => togglePrint(opt)}>{opt}</button>
              ))}
            </div>
          </div>
        )}

        {/* Qty */}
        <div className="cfg-section">
          <div className="cfg-label">Quantità</div>
          <div className="qty-wrap">
            <div className="qty-presets">
              {qtyPresets.map(q => (
                <button key={q} className={`qty-preset${qty === q ? ' sel' : ''}`} onClick={() => setQty(q)}>
                  {q.toLocaleString('it-IT')}
                </button>
              ))}
            </div>
            <div className="qty-stepper">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(product.moq, q - 50))}>−</button>
              <input className="qty-input" type="number" value={qty} min={product.moq} step={50}
                onChange={e => setQty(Math.max(product.moq, parseInt(e.target.value) || product.moq))} />
              <button className="qty-btn" onClick={() => setQty(q => q + 50)}>+</button>
            </div>
          </div>
          <div className="disc-tiers">
            {discTiers.map(t => {
              const active = qty >= t.min && (t.max === null || t.max === Infinity || qty <= (t.max as number))
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
          <div
            className={`upload-zone${uploading ? ' uploading' : ''}${artworkUrl ? ' done' : ''}`}
            onClick={() => !uploading && document.getElementById('file-upload-cfg')?.click()}
          >
            <div className="upload-icon-wrap">
              {uploading ? (
                <span className="spinner" style={{ width: 24, height: 24, borderWidth: 2.5, borderTopColor: 'var(--accent)', borderColor: 'rgba(232,114,26,0.2)' }} />
              ) : artworkUrl ? (
                <svg width="24" height="24" fill="none" stroke="#16a34a" strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/>
                </svg>
              )}
            </div>
            {uploading ? (
              <>
                <div className="upload-main">Caricamento in corso…</div>
                <div className="upload-sub">Attendere prego</div>
              </>
            ) : artworkUrl ? (
              <>
                <div className="upload-main" style={{ color: '#16a34a' }}>File caricato</div>
                <div className="upload-sub" style={{ wordBreak: 'break-all' }}>{artworkName}</div>
              </>
            ) : (
              <>
                <div className="upload-main">Carica il tuo logo o artwork</div>
                <div className="upload-sub">SVG · PDF — max 50 MB</div>
              </>
            )}
          </div>
          <input type="file" id="file-upload-cfg" accept=".svg,.pdf" style={{ display: 'none' }}
            onChange={handleFileChange} />
          {uploadError && (
            <div style={{ marginTop: 8, fontSize: 13, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16" strokeLinecap="round"><circle cx="8" cy="8" r="7"/><line x1="8" y1="5" x2="8" y2="8.5"/><circle cx="8" cy="11" r=".5" fill="currentColor"/></svg>
              {uploadError}
            </div>
          )}
          {artworkUrl && (
            <div style={{ marginTop: 8, fontSize: 12.5, color: 'var(--ink-4)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <button onClick={() => { setArtworkUrl(null); setArtworkName(null) }}
                style={{ fontSize: 12, color: 'var(--ink-4)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--f)', textDecoration: 'underline', padding: 0 }}>
                Rimuovi e carica un altro
              </button>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="cfg-page-cta">
          {/* Mobile-only floating price — visible when price box scrolled out of view */}
          <div className="cfg-cta-price-row">
            <span className="cfg-cta-price-label-sm">Prezzo unitario</span>
            <RollingPrice value={fmt(unit)} className="cfg-cta-mini-price" />
          </div>

          <button ref={addBtnRef} className={`cfg-addcart-btn${added ? ' added' : ''}`} onClick={handleAddToCart}>
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

    {/* Flying cart dot */}
    {flyAnim && (
      <div
        className="cart-fly-dot"
        aria-hidden
        style={{
          left: flyAnim.x,
          top: flyAnim.y,
          '--dx': `${flyAnim.dx}px`,
          '--dy': `${flyAnim.dy}px`,
        } as React.CSSProperties}
      >
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" strokeLinecap="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      </div>
    )}
    </>
  )
}
