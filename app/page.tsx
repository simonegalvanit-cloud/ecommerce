'use client'
import { useState, useCallback, useEffect, useRef } from 'react'
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
  { key: 'industrial', label: 'Industriale' },
  { key: 'shopper',   label: 'Shopper' },
  { key: 'food',      label: 'Food Delivery' },
  { key: 'wine',      label: 'Wine' },
  { key: 'ecom',      label: 'E-commerce' },
  { key: 'eco',       label: 'BrioGreenPack' },
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

const DISC_TIERS = [
  { min: 100,  max: 499,  label: '100–499', disc: null },
  { min: 500,  max: 999,  label: '500–999', disc: '-10%' },
  { min: 1000, max: 4999, label: '1.000–4.999', disc: '-20%' },
  { min: 5000, max: Infinity, label: '5.000+', disc: '-32%' },
]


function fmt(n: number) { return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

// ── Scroll-reveal CSS injected via <style> tag ────────────────────────────────
const scrollRevealCSS = `.scroll-reveal{opacity:0;transform:translateY(22px);transition:opacity .55s ease,transform .55s ease}.scroll-reveal.revealed{opacity:1;transform:translateY(0)}.modal-drag-handle{display:block}@media(min-width:641px){.modal-drag-handle{display:none}}`

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
  const [customL, setCustomL]           = useState('')
  const [customW, setCustomW]           = useState('')
  const [customH, setCustomH]           = useState('')

  const prevTotalRef = useRef<number>(0)
  const [pricePopKey, setPricePopKey] = useState(0)

  // ── IntersectionObserver for scroll-reveal ──────────────────────────────────
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observerRef.current?.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    )

    const targets = document.querySelectorAll('.scroll-reveal')
    targets.forEach(el => observerRef.current?.observe(el))

    return () => observerRef.current?.disconnect()
  }, [])

  // Re-run observer when filtered products change (new cards mount)
  const reObserve = useCallback(() => {
    requestAnimationFrame(() => {
      const targets = document.querySelectorAll('.scroll-reveal:not(.revealed)')
      targets.forEach(el => observerRef.current?.observe(el))
    })
  }, [])

  useEffect(() => { reObserve() }, [activeCat, search, reObserve])

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
    setCustomL(''); setCustomW(''); setCustomH('')
    document.body.style.overflow = 'hidden'
  }, [])

  const closeModal = useCallback(() => {
    setModalProduct(null)
    document.body.style.overflow = ''
  }, [])

  const isCustom = SIZES[selSizeIdx]?.label === 'Custom'

  // Price calculation
  const calcUnit = () => {
    let u = basePrice + (isCustom ? 0.10 : 0)
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

  // Trigger price pop animation on total change
  useEffect(() => {
    if (modalProduct && total !== prevTotalRef.current) {
      setPricePopKey(k => k + 1)
      prevTotalRef.current = total
    }
  }, [total, modalProduct])

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
      {/* ── Scroll-reveal styles ── */}
      <style>{scrollRevealCSS}</style>

      <Nav cartCount={cartCount} onCartClick={() => showToast(cartCount === 0 ? 'Il carrello è vuoto' : `${cartCount} articolo/i nel carrello`)} activeLink="shop" />

      {/* ── HERO ── */}
      <section className="hero">
        {/* Floating orbs */}
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="hero-inner">
          <div className="hero-left">
            <h1 className="animate-fade-up">Packaging<br />su misura,<br />senza compromessi.</h1>
            <p className="hero-sub animate-fade-up delay-1">Scatole, shopper, wine box e packaging food-grade personalizzabili online. MOQ accessibili, stampa professionale, spedizione nazionale.</p>
            <div className="hero-actions animate-fade-up delay-2">
              <button className="btn-primary" onClick={() => document.querySelector('.catbar')?.scrollIntoView({ behavior: 'smooth' })}>
                Scopri i prodotti
              </button>
              <button className="btn-secondary">Richiedi preventivo</button>
            </div>
          </div>
          <div className="hero-right">
            <div className="hero-cards">
              {[
                { label: 'Shopper & Cartotecnica', title: 'Shopper Lusso', price: 'da €0,65', moq: 'MOQ 250 pz', delay: 'delay-3' },
                { label: 'Imballaggi Industriali', title: 'Scatola Americana', price: 'da €0,38', moq: 'MOQ 100 pz', delay: 'delay-4' },
                { label: 'BrioGreenPack',          title: 'Scatola Eco 100%', price: 'da €0,45', moq: 'MOQ 100 pz', delay: 'delay-5' },
              ].map(c => (
                <div key={c.title} className={`hero-card animate-fade-up ${c.delay}`} onClick={() => openModal(PRODUCTS.find(p => p.cat === c.label) || PRODUCTS[0])}>
                  <span className="hc-label">{c.label}</span>
                  <span className="hc-title">{c.title}</span>
                  <span className="hc-price">{c.price}</span>
                  <span className="hc-moq">{c.moq}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Scroll hint */}
        <div className="hero-scroll">
          <div className="hero-scroll-dot" />
        </div>

        <div className="hero-nums">
          {[
            { val: '500+', lbl: 'Prodotti disponibili' },
            { val: '6',    lbl: 'Colori di stampa' },
            { val: '30+',  lbl: 'Anni di esperienza' },
            { val: '100%', lbl: 'Made in Italy' },
          ].map((n, i) => (
            <div key={i} style={{ display: 'contents' }}>
              {i > 0 && <div className="hero-num-div" />}
              <div className={`hero-num-item animate-fade-up delay-${i + 1}`}>
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
          <input
            type="text"
            placeholder="Cerca prodotti (es. scatola pizza, shopper kraft…)"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ background: 'none', border: 'none', color: 'var(--ink-4)', cursor: 'pointer', fontSize: 16, padding: '0 2px', lineHeight: 1, fontFamily: 'var(--f)' }}
              aria-label="Cancella ricerca"
            >✕</button>
          )}
        </div>
      </div>

      {/* ── CAT BAR ── */}
      <div className="catbar">
        {CATEGORIES.map(c => {
          const count = c.key === 'all' ? PRODUCTS.length : PRODUCTS.filter(p => p.catKey === c.key).length
          return (
            <div key={c.key} className={`cat ${activeCat === c.key ? 'active' : ''}`} onClick={() => setActiveCat(c.key)}>
              <span className="cat-dot" />
              {c.label}
              <span className="cat-count">{count}</span>
            </div>
          )
        })}
      </div>


      {/* ── PRODUCTS ── */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-title"><span className="section-title-gradient">Catalogo Prodotti</span></div>
            <div className="section-sub">{filteredProducts.length} prodott{filteredProducts.length === 1 ? 'o' : 'i'} trovati</div>
          </div>
          <a href="#" className="section-link">Vedi tutto il catalogo →</a>
        </div>
        <div className="pgrid">
          {filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 20px', gridColumn: '1/-1' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Nessun prodotto trovato</div>
              <div style={{ fontSize: 14, color: 'var(--ink-3)', marginBottom: 24 }}>Prova con un&apos;altra categoria o parola chiave</div>
              <button
                style={{
                  background: 'var(--accent)', color: '#fff', border: 'none',
                  fontFamily: 'var(--f)', fontSize: 14, fontWeight: 700,
                  padding: '11px 24px', borderRadius: 'var(--r)', cursor: 'pointer',
                  boxShadow: 'var(--shadow-accent)', transition: 'all .2s',
                }}
                onClick={() => { setSearch(''); setActiveCat('all') }}
              >
                Mostra tutti i prodotti
              </button>
            </div>
          ) : (
            filteredProducts.map((p, i) => (
              <div
                key={p.key}
                className="pcard scroll-reveal"
                style={{ transitionDelay: `${i * 0.06}s` }}
                onClick={() => openModal(p)}
                onMouseMove={e => {
                  const r = e.currentTarget.getBoundingClientRect()
                  const x = (e.clientX - r.left) / r.width - 0.5
                  const y = (e.clientY - r.top) / r.height - 0.5
                  const el = e.currentTarget as HTMLElement
                  el.style.transition = 'transform .08s ease, box-shadow .28s, border-color .28s'
                  el.style.transform = `perspective(900px) rotateY(${x * 9}deg) rotateX(${-y * 9}deg) translateY(-6px) scale(1.01)`
                  const glow = el.querySelector<HTMLElement>('.pcard-glow')
                  if (glow) { glow.style.setProperty('--mx', `${(e.clientX - r.left) / r.width * 100}%`); glow.style.setProperty('--my', `${(e.clientY - r.top) / r.height * 100}%`) }
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement
                  el.style.transition = 'transform .55s var(--ease-out), box-shadow .28s, border-color .28s'
                  el.style.transform = ''
                }}
              >
                <div className="pcard-glow" />
                {p.badge && <div className={`pcard-badge ${p.badge.type}`}>{p.badge.label}</div>}
                <div className="pcard-img" style={p.catKey === 'eco' ? { background: '#edf3ee' } : undefined}>
                  <div style={{ transition: 'transform .3s var(--ease-out)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="pcard-svg-wrap">
                    {p.svg}
                  </div>
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
            ))
          )}
        </div>
      </section>

      {/* ── ECO BAND ── */}
      <div className="eco-band">
        <div className="scroll-reveal">
          <div className="eco-tag">Linea BrioGreenPack</div>
          <h2 className="eco-title">Packaging con<br />un&apos;<em>anima green</em></h2>
          <p className="eco-body">Il nostro impegno: ogni linea ha un&apos;alternativa sostenibile. Stessa qualità e configurabilità — materiali riciclati o biodegradabili certificati, senza compromessi.</p>
          <button className="btn-eco">Scopri la Linea Eco →</button>
        </div>
        <div className="eco-grid">
          {[
            {
              icon: (
                <svg width="22" height="22" fill="none" stroke="#7ec891" strokeWidth="1.6" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
              ),
              title: '100% Riciclato', body: 'Cartone ondulato da fibre riciclate post-consumo',
            },
            {
              icon: (
                <svg width="22" height="22" fill="none" stroke="#7ec891" strokeWidth="1.6" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              ),
              title: 'Biodegradabile', body: 'Materiali che si decompongono naturalmente',
            },
            {
              icon: (
                <svg width="22" height="22" fill="none" stroke="#7ec891" strokeWidth="1.6" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              ),
              title: 'Certificato CONAI', body: 'Piena conformità e tracciabilità del contributo',
            },
            {
              icon: (
                <svg width="22" height="22" fill="none" stroke="#7ec891" strokeWidth="1.6" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
                </svg>
              ),
              title: 'Food Safe', body: 'Materiali eco certificati per il contatto alimentare',
            },
          ].map((c, i) => (
            <div key={c.title} className="eco-card scroll-reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
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
          <div className="scroll-reveal">
            <div className="footer-logo">
              <span style={{ fontSize: 18, fontWeight: 800, color: 'rgba(255,255,255,0.7)', letterSpacing: '1.5px', textTransform: 'uppercase' }}>BRIOPACK</span>
            </div>
            <div className="footer-tagline">Lo stato dell&apos;arte nel packaging. Progettiamo e produciamo imballaggi su misura per aziende di ogni settore, in tutta Italia.</div>
            <div className="footer-contact">C.da Sodera, 38 — 66030 Poggiofiorito (CH)<br />+39 0871 869378<br />info@briopack.com</div>
          </div>
          <div className="scroll-reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="footer-col-title">Prodotti</div>
            <ul className="footer-links">
              {['Imballaggi Industriali','Shopper & Cartotecnica','Wine Packaging','Food Delivery','E-commerce','BrioGreenPack'].map(l => <li key={l}><a href="#">{l}</a></li>)}
            </ul>
          </div>
          <div className="scroll-reveal" style={{ transitionDelay: '0.18s' }}>
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
            {/* Mobile drag handle — hidden on desktop via CSS */}
            <div
              className="modal-drag-handle"
              style={{ width: 40, height: 4, background: 'var(--border-3)', borderRadius: 2, margin: '12px auto 0', display: 'block' }}
            />
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
                  <div style={{ transform: 'scale(1.1)' }}>{modalProduct.svg}</div>
                  <span className="preview-vis-label">ANTEPRIMA</span>
                </div>
                <div className="price-box">
                  <div className="price-box-lbl">Prezzo unitario</div>
                  <div key={pricePopKey} className="price-box-val price-pop">€{fmt(unit)}</div>
                  <div className="price-box-sub">IVA esclusa · varia con la quantità</div>
                </div>
                <div className="sum-rows">
                  <div className="sum-row">
                    <span>Misura</span>
                    <span style={{ fontWeight: 600, color: 'var(--ink)' }}>
                      {isCustom && customL && customW && customH
                        ? `${customL}×${customW}×${customH} mm`
                        : SIZES[selSizeIdx]?.label}
                    </span>
                  </div>
                  <div className="sum-row"><span>Prezzo unitario</span><span>€{fmt(unit)}</span></div>
                  <div className="sum-row"><span>Quantità</span><span>{qty.toLocaleString('it-IT')} pz</span></div>
                  <div className="sum-row"><span>Impianti stampa</span><span>{setup > 0 ? `€${fmt(setup)}` : '—'}</span></div>
                  <div className="sum-row"><span>Totale IVA esclusa</span><span>€{fmt(total)}</span></div>
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

                  {/* Custom size inputs */}
                  {isCustom && (
                    <div className="custom-dims">
                      <div className="custom-dims-label">Inserisci le dimensioni in millimetri</div>
                      <div className="custom-dims-grid">
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Lunghezza</label>
                          <input type="number" value={customL} onChange={e => setCustomL(e.target.value)} placeholder="es. 400" min={50} max={2000} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Larghezza</label>
                          <input type="number" value={customW} onChange={e => setCustomW(e.target.value)} placeholder="es. 300" min={50} max={2000} />
                        </div>
                        <div>
                          <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.4 }}>Altezza</label>
                          <input type="number" value={customH} onChange={e => setCustomH(e.target.value)} placeholder="es. 250" min={20} max={1000} />
                        </div>
                      </div>
                      <div className="custom-surcharge">
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
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
                      <div key={c.label} className={`color-swatch ${selColor === i ? 'sel' : ''}`}
                        style={{ background: c.hex, border: c.border ? '1px solid #ddd' : undefined }}
                        title={c.label}
                        onClick={() => setSelColor(i)} />
                    ))}
                  </div>
                  <div className="color-selected-label">
                    Colore selezionato: <strong>{COLORS[selColor].label}</strong>
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
                  {/* Discount tiers */}
                  <div className="disc-tiers">
                    {DISC_TIERS.map(t => {
                      const active = qty >= t.min && qty <= t.max
                      return (
                        <div key={t.label} className={`disc-tier${active ? ' active' : ''}`}>
                          <div className="dt-qty">{t.label}</div>
                          {t.disc ? (
                            <div className="dt-disc">{t.disc}</div>
                          ) : (
                            <div className="dt-label">base</div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* File upload */}
                <div className="cfg-section" style={{ paddingBottom: 28 }}>
                  <div className="cfg-label">Logo / Artwork</div>
                  <div className="upload-zone" onClick={() => document.getElementById('file-upload')?.click()}>
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

      {/* ── MOBILE FAB CART ── */}
      <button
        className="fab-cart"
        onClick={() => showToast(cartCount === 0 ? 'Il carrello è vuoto' : `${cartCount} articolo/i nel carrello`)}
        aria-label={`Carrello (${cartCount} articoli)`}
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        {cartCount > 0 && <span className="fab-badge">{cartCount}</span>}
      </button>

      {/* ── TOAST ── */}
      <div className={`toast ${toast ? 'show' : ''}`}>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>
        <span>{toast}</span>
      </div>
    </>
  )
}
