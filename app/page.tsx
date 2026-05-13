'use client'
import { useState, useCallback } from 'react'
import Nav from '@/components/Nav'

// ── Types ────────────────────────────────────────────────────────────────────
interface Product {
  key: string
  name: string
  cat: string
  catKey: string
  price: number
  moq: number
  badge?: { label: string; type: 'top' | 'eco' }
  desc: string
  svg: React.ReactNode
}

// ── Product catalogue (hardcoded; later fetched from Supabase) ───────────────
const PRODUCTS: Product[] = [
  {
    key: 'americanbox', name: 'Scatola Americana — Ondulato',
    cat: 'Imballaggi Industriali', catKey: 'industrial', price: 0.38, moq: 100,
    badge: { label: 'Più venduto', type: 'top' },
    desc: 'Cartone ondulato con stampa flessografica fino a 6 colori. Disponibile da XS a XXL, personalizzabile su misura.',
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="16" y="34" width="78" height="62" rx="4" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <polygon points="16,34 55,16 94,34 55,52" fill="#e6e0d4" stroke="#b8924a" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    key: 'shopper', name: 'Shopper Lusso in Carta',
    cat: 'Shopper & Cartotecnica', catKey: 'shopper', price: 0.65, moq: 250,
    desc: 'Borsa in carta con manico ritorto. Stampa litografica o digitale, plastificazione opaca o lucida.',
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="20" y="38" width="70" height="58" rx="4" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <path d="M36 38 Q36 20 55 20 Q74 20 74 38" stroke="#b8924a" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
        <rect x="32" y="54" width="46" height="28" rx="2" fill="none" stroke="#b8924a" strokeWidth="1" strokeDasharray="3,2.5"/>
      </svg>
    ),
  },
  {
    key: 'winebox', name: 'Scatola Bottiglie da 1 a 6',
    cat: 'Wine Packaging', catKey: 'wine', price: 1.20, moq: 50,
    desc: 'Ondulato con alveari separatori. Da 1 a 6 bottiglie verticali o orizzontali. Stampa personalizzata.',
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="18" y="28" width="74" height="70" rx="4" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <line x1="55" y1="28" x2="55" y2="98" stroke="#b8924a" strokeWidth="0.8"/>
        <line x1="18" y1="63" x2="92" y2="63" stroke="#b8924a" strokeWidth="0.8"/>
        <ellipse cx="36" cy="46" rx="10" ry="14" fill="none" stroke="#b8924a" strokeWidth="1"/>
        <ellipse cx="74" cy="46" rx="10" ry="14" fill="none" stroke="#b8924a" strokeWidth="1"/>
        <ellipse cx="36" cy="80" rx="10" ry="14" fill="none" stroke="#b8924a" strokeWidth="1"/>
        <ellipse cx="74" cy="80" rx="10" ry="14" fill="none" stroke="#b8924a" strokeWidth="1"/>
      </svg>
    ),
  },
  {
    key: 'food', name: 'Scatola Food-Grade',
    cat: 'Food Delivery', catKey: 'food', price: 0.28, moq: 200,
    desc: 'Certificata per il contatto alimentare. Scatole e buste in carta e cartone per delivery e take away.',
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="18" y="46" width="74" height="50" rx="4" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <path d="M18 58 L55 38 L92 58" stroke="#b8924a" strokeWidth="1.5" fill="none"/>
        <rect x="36" y="60" width="38" height="24" rx="2" fill="none" stroke="#b8924a" strokeWidth="1" strokeDasharray="3,2.5"/>
      </svg>
    ),
  },
  {
    key: 'eco', name: 'Scatola 100% Riciclata',
    cat: 'BrioGreenPack', catKey: 'eco', price: 0.45, moq: 100,
    badge: { label: 'Eco', type: 'eco' },
    desc: 'Packaging eco-certificato da materiale riciclato. Stessa qualità, stessa configurabilità, zero impatto.',
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="15" y="34" width="80" height="65" rx="4" fill="#d4e6d9" stroke="#2d5a3d" strokeWidth="1.5"/>
        <polygon points="15,34 55,16 95,34 55,52" fill="#c6deca" stroke="#2d5a3d" strokeWidth="1.5"/>
        <circle cx="55" cy="74" r="14" fill="none" stroke="#2d5a3d" strokeWidth="1.5"/>
        <path d="M49 74 Q53 67 59 74 Q55 81 49 74" fill="#2d5a3d" opacity="0.5"/>
      </svg>
    ),
  },
  {
    key: 'mailer', name: 'Scatola Self-Seal Mailer',
    cat: 'E-commerce', catKey: 'ecom', price: 0.52, moq: 100,
    desc: 'Chiusura a click, nastro antieffrazione. Ideale per spedizioni corriere di qualsiasi tipo di prodotto.',
    svg: (
      <svg viewBox="0 0 110 110" fill="none" style={{ width: 108 }}>
        <rect x="15" y="30" width="80" height="68" rx="4" fill="#ede9e2" stroke="#b8924a" strokeWidth="1.5"/>
        <path d="M15 52 L95 52" stroke="#b8924a" strokeWidth="0.8"/>
        <path d="M55 30 L55 52" stroke="#b8924a" strokeWidth="0.8"/>
        <rect x="30" y="60" width="50" height="26" rx="2" fill="none" stroke="#b8924a" strokeWidth="1" strokeDasharray="3,2.5"/>
        <path d="M44 30 Q44 22 55 22 Q66 22 66 30" stroke="#b8924a" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      </svg>
    ),
  },
]

const CATEGORIES = [
  { key: 'all',        label: 'Tutti' },
  { key: 'industrial', label: 'Imballaggi Industriali' },
  { key: 'shopper',   label: 'Shopper & Cartotecnica' },
  { key: 'food',      label: 'Food Delivery' },
  { key: 'wine',      label: 'Wine Packaging' },
  { key: 'ecom',      label: 'E-commerce' },
  { key: 'eco',       label: '🌿 BrioGreenPack' },
]

const SIZES = [
  { label: 'XS', dim: '200×150×100 mm', price: 0.38 },
  { label: 'S',  dim: '300×200×150 mm', price: 0.48 },
  { label: 'M',  dim: '400×300×200 mm', price: 0.62 },
  { label: 'L',  dim: '500×400×300 mm', price: 0.78 },
  { label: 'XL', dim: '600×450×350 mm', price: 0.98 },
  { label: 'Custom', dim: 'misura libera', price: null },
]

const PRINT_OPTIONS = ['Senza Stampa','Flexo 1 colore','Flexo 4 colori','Stampa Digitale','Plastif. Opaca','Plastif. Lucida','Lucidatura UV','Stampa a Caldo']
const QTY_PRESETS   = [100, 250, 500, 1000, 5000]
const COLORS = [
  { label: 'Naturale', hex: '#d4c8b0' },
  { label: 'Bianco',   hex: '#f5f4f2', border: true },
  { label: 'Nero',     hex: '#1e1e1c' },
  { label: 'Verde',    hex: '#1a4228' },
  { label: 'Bordeaux', hex: '#7c2032' },
  { label: 'Blu',      hex: '#1c3a5e' },
]

function fmt(n: number) { return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

// ── Main Page ────────────────────────────────────────────────────────────────
export default function StorefrontPage() {
  const [cartCount, setCartCount]   = useState(0)
  const [toast, setToast]           = useState<string | null>(null)
  const [activeCat, setActiveCat]   = useState('all')
  const [search, setSearch]         = useState('')
  const [modalProduct, setModalProduct] = useState<Product | null>(null)

  // Modal state
  const [selSizeIdx, setSelSizeIdx]     = useState(0)
  const [basePrice, setBasePrice]       = useState(0.38)
  const [selColor, setSelColor]         = useState(0)
  const [selPrints, setSelPrints]       = useState<Set<string>>(new Set(['Senza Stampa']))
  const [qty, setQty]                   = useState(250)
  const [fileOk, setFileOk]             = useState(false)

  const showToast = useCallback((msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }, [])

  const openModal = useCallback((p: Product) => {
    setModalProduct(p)
    setBasePrice(p.price)
    setSelSizeIdx(0)
    setSelColor(0)
    setSelPrints(new Set(['Senza Stampa']))
    setQty(250)
    setFileOk(false)
    document.body.style.overflow = 'hidden'
  }, [])

  const closeModal = useCallback(() => {
    setModalProduct(null)
    document.body.style.overflow = ''
  }, [])

  // Price calculation
  const calcUnit = () => {
    let u = basePrice
    if (qty >= 5000) u *= 0.68
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

  const addToCart = () => {
    setCartCount(c => c + 1)
    closeModal()
    showToast('Prodotto aggiunto al carrello')
  }

  const filteredProducts = PRODUCTS.filter(p =>
    (activeCat === 'all' || p.catKey === activeCat) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <>
      <Nav cartCount={cartCount} onCartClick={() => showToast(cartCount === 0 ? 'Il carrello è vuoto' : `${cartCount} articolo/i nel carrello`)} activeLink="shop" />

      {/* ── HERO ── */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-left">
            <h1>Packaging<br />professionale,<br />al giusto prezzo.</h1>
            <p className="hero-sub">Shopper, scatole pizza, buste, alveolari e molto altro. Ordina online con MOQ accessibili e spedizione rapida in tutta Italia.</p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => document.querySelector('.catbar')?.scrollIntoView({ behavior: 'smooth' })}>
                Scopri i prodotti
              </button>
              <button className="btn-secondary">Richiedi preventivo</button>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-cards">
              {[
                { label: 'Shopper & Cartotecnica', title: 'Shopper Lusso', price: 'da €0,65', moq: 'MOQ 250 pz' },
                { label: 'Imballaggi Industriali', title: 'Scatola Americana', price: 'da €0,38', moq: 'MOQ 100 pz' },
                { label: 'BrioGreenPack',          title: 'Scatola Eco 100%', price: 'da €0,45', moq: 'MOQ 100 pz' },
              ].map(c => (
                <div key={c.title} className="hero-card" onClick={() => openModal(PRODUCTS.find(p => p.cat === c.label) || PRODUCTS[0])}>
                  <span className="hc-label">{c.label}</span>
                  <span className="hc-title">{c.title}</span>
                  <span className="hc-price">{c.price}</span>
                  <span className="hc-moq">{c.moq}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="hero-nums">
          {[
            { val: '500+',   lbl: 'Prodotti disponibili' },
            { val: '6',      lbl: 'Colori di stampa' },
            { val: '30+',    lbl: 'Anni di esperienza' },
            { val: 'Italia', lbl: 'Consegna nazionale' },
          ].map((n, i) => (
            <div key={i} style={{ display: 'contents' }}>
              {i > 0 && <div className="hero-num-div" />}
              <div className="hero-num-item">
                <div className="hero-num-val">{n.val}</div>
                <div className="hero-num-lbl">{n.lbl}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEARCH ── */}
      <div className="search-wrap">
        <div className="search-bar">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input type="text" placeholder="Cerca prodotti (es. scatola pizza, shopper kraft…)" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* ── CAT BAR ── */}
      <div className="catbar">
        {CATEGORIES.map(c => (
          <div key={c.key} className={`cat ${activeCat === c.key ? 'active' : ''}`} onClick={() => setActiveCat(c.key)}>
            <span className="cat-dot" />{c.label}
          </div>
        ))}
      </div>

      {/* ── TRUST BAR ── */}
      <div className="trust">
        {[
          { icon: '🚚', title: 'Spedizione Rapida', desc: 'Consegna in 48–72h su tutto il territorio nazionale' },
          { icon: '🎨', title: 'Stampa Personalizzata', desc: 'Fino a 6 colori di stampa flessografica o digitale' },
          { icon: '📦', title: 'MOQ Accessibili',   desc: 'Ordina da 50 pz — ideale per PMI e startup' },
          { icon: '♻',  title: 'Linea Eco Certificata', desc: 'Materiali riciclati e biodegradabili CONAI' },
        ].map(t => (
          <div key={t.title} className="trust-item">
            <div className="trust-icon">{t.icon}</div>
            <div>
              <div className="trust-title">{t.title}</div>
              <div className="trust-desc">{t.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── PRODUCTS ── */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-title">Catalogo Prodotti</div>
            <div className="section-sub">{filteredProducts.length} prodotti trovati</div>
          </div>
          <a href="#" className="section-link">Vedi tutto il catalogo →</a>
        </div>
        <div className="pgrid">
          {filteredProducts.map(p => (
            <div key={p.key} className="pcard" onClick={() => openModal(p)}>
              {p.badge && <div className={`pcard-badge ${p.badge.type}`}>{p.badge.label}</div>}
              <div className="pcard-img" style={p.catKey === 'eco' ? { background: '#edf3ee' } : undefined}>
                {p.svg}
                <div className="pcard-img-overlay">
                  <button className="overlay-btn">Personalizza</button>
                </div>
              </div>
              <div className="pcard-body">
                <div className="pcard-cat">{p.cat}</div>
                <div className="pcard-name">{p.name}</div>
                <div className="pcard-desc">{p.desc}</div>
                <div className="pcard-foot">
                  <div>
                    <div className="pcard-price"><sup>€</sup>{p.price.toFixed(2).replace('.', ',')}<sub> / pz</sub></div>
                    <div className="pcard-moq">MOQ {p.moq} pz</div>
                  </div>
                  <button className="btn-config" onClick={e => { e.stopPropagation(); openModal(p) }}>
                    Configura
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ECO BAND ── */}
      <div className="eco-band">
        <div>
          <div className="eco-tag">Linea BrioGreenPack</div>
          <h2 className="eco-title">Packaging con<br />un&apos;<em>anima green</em></h2>
          <p className="eco-body">Il nostro impegno: ogni linea ha un&apos;alternativa sostenibile. Stessa qualità e configurabilità — materiali riciclati o biodegradabili certificati, senza compromessi.</p>
          <button className="btn-eco">Scopri la Linea Eco →</button>
        </div>
        <div className="eco-grid">
          {[
            { icon: '♻', title: '100% Riciclato',    body: 'Cartone ondulato da fibre riciclate post-consumo' },
            { icon: '🌿', title: 'Biodegradabile',    body: 'Materiali che si decompongono naturalmente' },
            { icon: '✓',  title: 'Certificato CONAI', body: 'Piena conformità e tracciabilità del contributo' },
            { icon: '⬡',  title: 'Food Safe',         body: 'Materiali eco certificati per il contatto alimentare' },
          ].map(c => (
            <div key={c.title} className="eco-card">
              <div className="eco-card-icon">{c.icon}</div>
              <div className="eco-card-title">{c.title}</div>
              <div className="eco-card-body">{c.body}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-logo">
              <span style={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>BRIOPACK</span>
            </div>
            <div className="footer-tagline">Lo stato dell&apos;arte nel packaging. Progettiamo e produciamo imballaggi su misura per aziende di ogni settore, in tutta Italia.</div>
            <div className="footer-contact">C.da Sodera, 38 — 66030 Poggiofiorito (CH)<br />+39 0871 869378<br />info@briopack.com</div>
          </div>
          <div>
            <div className="footer-col-title">Prodotti</div>
            <ul className="footer-links">
              {['Imballaggi Industriali','Shopper & Cartotecnica','Wine Packaging','Food Delivery','E-commerce','BrioGreenPack'].map(l => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Azienda</div>
            <ul className="footer-links">
              {['Chi Siamo','Contatti','Richiedi Preventivo','Area Amministrativa'].map(l => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-legal">© 2025 Briopack Srl — P.IVA 02540090699 — REA 186673 Chieti</div>
          <div className="footer-legal">Privacy Policy · Cookie Policy</div>
        </div>
      </footer>

      {/* ── PRODUCT MODAL ── */}
      <div className={`overlay ${modalProduct ? 'open' : ''}`} onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
        <div className="modal" onClick={e => e.stopPropagation()}>
          {modalProduct && <>
            <div className="modal-head">
              <div className="modal-head-left">
                <div className="modal-cat-tag">{modalProduct.cat}</div>
                <div className="modal-name">{modalProduct.name}</div>
                <div className="modal-steps">
                  {['Misura & Colore','Stampa & Qty','Logo & Ordine'].map((s, i) => (
                    <div key={s} style={{ display: 'contents' }}>
                      {i > 0 && <div className="step-sep" />}
                      <div className={`modal-step ${i === 0 ? 'active' : ''}`}>
                        <span className="step-num">{i + 1}</span>{s}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>

            <div className="modal-body">
              {/* Preview panel */}
              <div className="modal-preview">
                <div className="preview-vis">
                  {modalProduct.svg}
                  <span style={{ fontSize: '9.5px', color: 'var(--ink-4)', fontWeight: 500, letterSpacing: '.5px' }}>ANTEPRIMA</span>
                </div>
                <div className="price-box">
                  <div className="price-box-lbl">Prezzo unitario</div>
                  <div className="price-box-val">€{fmt(unit)}</div>
                  <div className="price-box-sub">IVA esclusa · varia con la quantità</div>
                </div>
                <div className="sum-rows">
                  <div className="sum-row"><span>Prezzo unitario</span><span>€{fmt(unit)}</span></div>
                  <div className="sum-row"><span>Quantità</span><span>{qty.toLocaleString('it-IT')} pz</span></div>
                  <div className="sum-row"><span>Impianti stampa</span><span>€{fmt(setup)}</span></div>
                  <div className="sum-row"><span>Totale (IVA esclusa)</span><span>€{fmt(total)}</span></div>
                </div>
              </div>

              {/* Config panel */}
              <div className="modal-config">
                {/* Size */}
                <div className="cfg-section">
                  <div className="cfg-label">Misura</div>
                  <div className="size-grid">
                    {SIZES.map((s, i) => (
                      <button key={s.label} className={`size-btn ${selSizeIdx === i ? 'sel' : ''}`}
                        onClick={() => { setSelSizeIdx(i); if (s.price) setBasePrice(s.price) }}>
                        <div className="size-btn-name">{s.label}</div>
                        <div className="size-btn-dim">{s.dim}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div className="cfg-section">
                  <div className="cfg-label">Colore Scatola</div>
                  <div className="color-row">
                    {COLORS.map((c, i) => (
                      <div key={c.label} className={`color-swatch ${selColor === i ? 'sel' : ''}`}
                        style={{ background: c.hex, border: c.border ? '1px solid #ddd' : undefined }}
                        onClick={() => setSelColor(i)} />
                    ))}
                  </div>
                </div>

                {/* Print */}
                <div className="cfg-section">
                  <div className="cfg-label">Stampa & Finitura</div>
                  <div className="chips">
                    {PRINT_OPTIONS.map(opt => (
                      <button key={opt} className={`chip ${selPrints.has(opt) ? 'sel' : ''}`} onClick={() => togglePrint(opt)}>{opt}</button>
                    ))}
                  </div>
                </div>

                {/* Qty */}
                <div className="cfg-section">
                  <div className="cfg-label">Quantità</div>
                  <div className="qty-wrap">
                    <div className="qty-presets">
                      {QTY_PRESETS.map(q => (
                        <button key={q} className={`qty-preset ${qty === q ? 'sel' : ''}`} onClick={() => setQty(q)}>
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
                </div>

                {/* File upload */}
                <div className="cfg-section" style={{ paddingBottom: 28 }}>
                  <div className="cfg-label">Logo / Artwork</div>
                  <div className="upload-zone" onClick={() => document.getElementById('file-upload')?.click()}>
                    <div className="upload-icon-wrap">⬆</div>
                    <div className="upload-main">Carica il tuo file logo o grafica</div>
                    <div className="upload-sub">SVG · AI · EPS · PDF · PNG — max 50 MB</div>
                  </div>
                  <input type="file" id="file-upload" accept=".svg,.ai,.eps,.pdf,.png" style={{ display: 'none' }}
                    onChange={e => { if (e.target.files?.length) setFileOk(true) }} />
                  {fileOk && <div className="upload-ok" style={{ display: 'block' }}>✓ File caricato — il team invierà una bozza di stampa</div>}
                </div>
              </div>
            </div>

            <div className="modal-foot">
              <button className="btn-quote-sm">Richiedi Preventivo Personalizzato</button>
              <button className="btn-addcart" onClick={addToCart}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                Aggiungi al Carrello
              </button>
            </div>
          </>}
        </div>
      </div>

      {/* ── TOAST ── */}
      <div className={`toast ${toast ? 'show' : ''}`}>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        <span>{toast}</span>
      </div>
    </>
  )
}
