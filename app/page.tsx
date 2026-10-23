'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import NavWrapper from '@/components/NavWrapper'
import CartDrawer from '@/components/CartDrawer'
import { useCart } from '@/lib/cart-context'
import { PRODUCTS, MAIN_CATS, SHOPPER_SUBCATS, CATALOG_ITEMS } from '@/lib/products'

function fmt(n: number) { return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

function PCardImage({ p, size = 120 }: { p: typeof PRODUCTS[0]; size?: number }) {
  const [err, setErr] = useState(false)
  if (p.image && !err) {
    return <img src={p.image} alt={p.name} style={{ width: size, height: size, objectFit: 'contain', display: 'block' }} onError={() => setErr(true)} />
  }
  return <>{p.svg}</>
}

const scrollRevealCSS = `.scroll-reveal{opacity:0;transform:translateY(22px);transition:opacity .55s ease,transform .55s ease}.scroll-reveal.revealed{opacity:1;transform:translateY(0)}`

// ── Main Page ────────────────────────────────────────────────────────────────
export default function StorefrontPage() {
  const { setCartOpen, cartCount } = useCart()
  const router = useRouter()
  const [activeMain, setActiveMain] = useState<string | null>(null)
  const [activeSub,  setActiveSub]  = useState<string | null>(null)
  const [heroSearch, setHeroSearch] = useState('')
  const [heroFocused, setHeroFocused] = useState(false)
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [acPos, setAcPos] = useState({ top: 0, left: 0, width: 0 })
  const [typedPlaceholder, setTypedPlaceholder] = useState('')
  const searchWrapRef = useRef<HTMLDivElement>(null)
  const searchBarRef = useRef<HTMLFormElement>(null)
  const autocompleteRef = useRef<HTMLDivElement>(null)

  // Typewriter cycling placeholder
  useEffect(() => {
    const terms = ['Shopper kraft avana…', 'Portabottiglia vino…', 'Scatola regalo…', 'Busta e-commerce…', 'Cassetta effetto legno…', 'Shopper lusso bianco…']
    let termIdx = 0, charIdx = 0, erasing = false
    let raf: ReturnType<typeof setTimeout>
    function tick() {
      const word = terms[termIdx]
      if (!erasing) {
        charIdx++
        setTypedPlaceholder(word.slice(0, charIdx))
        if (charIdx === word.length) {
          erasing = true
          raf = setTimeout(tick, 1800)
        } else {
          raf = setTimeout(tick, 72)
        }
      } else {
        charIdx--
        setTypedPlaceholder(word.slice(0, charIdx))
        if (charIdx === 0) {
          erasing = false
          termIdx = (termIdx + 1) % terms.length
          raf = setTimeout(tick, 380)
        } else {
          raf = setTimeout(tick, 38)
        }
      }
    }
    raf = setTimeout(tick, 900)
    return () => clearTimeout(raf)
  }, [])

  const heroSuggestions = heroSearch.trim().length > 1
    ? PRODUCTS.filter(p => {
        const q = heroSearch.toLowerCase()
        return p.name.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
      }).slice(0, 6)
    : []

  // Recompute fixed position whenever suggestions open or search changes
  useEffect(() => {
    const compute = () => {
      if (searchBarRef.current) {
        const r = searchBarRef.current.getBoundingClientRect()
        setAcPos({ top: r.bottom + 8, left: r.left, width: r.width })
      }
    }
    if (suggestionsOpen) {
      compute()
      window.addEventListener('resize', compute)
      window.addEventListener('scroll', compute, true)
      return () => {
        window.removeEventListener('resize', compute)
        window.removeEventListener('scroll', compute, true)
      }
    }
  }, [suggestionsOpen, heroSearch])

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const inBar = searchWrapRef.current?.contains(e.target as Node)
      const inAc  = autocompleteRef.current?.contains(e.target as Node)
      if (!inBar && !inAc) setSuggestionsOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const handleHeroSearch = (e?: React.FormEvent) => {
    e?.preventDefault()
    setSuggestionsOpen(false)
    router.push(`/catalogo${heroSearch.trim() ? `?q=${encodeURIComponent(heroSearch.trim())}` : ''}`)
  }

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

  useEffect(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll('.scroll-reveal:not(.revealed)').forEach(el => observerRef.current?.observe(el))
    })
  }, [activeMain, activeSub])

  return (
    <>
      {/* ── Scroll-reveal styles ── */}
      <style>{scrollRevealCSS}</style>

      <NavWrapper activeLink="home" />

      {/* ── HERO ── */}
      <section className="hero hero-v2">
        {/* Background decorations in their own clipping layer */}
        <div className="hero-bg">
          <div className="hero-glow-1" />
          <div className="hero-grid" />
        </div>

        {/* Center focal point */}
        <div className="hero-center">
          <h1 className="hero-headline animate-fade-up">
            Il packaging professionale,<br />ordinato online.
          </h1>
          <p className="hero-subline animate-fade-up delay-1">
            Shopper, wine box, buste e-commerce e molto altro — su misura, con stampa.
          </p>

          <div className="hero-search-wrap animate-fade-up delay-2" ref={searchWrapRef}>
            <form className="hero-search-bar" onSubmit={handleHeroSearch} ref={searchBarRef}>
              <svg width="18" height="18" fill="none" stroke="#999" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder={heroFocused || heroSearch ? 'Cerca prodotti…' : typedPlaceholder}
                value={heroSearch}
                onChange={e => { setHeroSearch(e.target.value); setSuggestionsOpen(true) }}
                onFocus={() => { setHeroFocused(true); setSuggestionsOpen(true) }}
                onBlur={() => setHeroFocused(false)}
                onKeyDown={e => e.key === 'Escape' && setSuggestionsOpen(false)}
                className="hero-search-input"
              />
              <button type="submit" className="hero-search-btn">Cerca</button>
            </form>
          </div>

          <div className="hero-popular animate-fade-up delay-3">
            <span className="hero-popular-label">Popolari:</span>
            {[
              { label: 'Shopper',      cat: 'shopper' },
              { label: 'Wine box',     cat: 'wine' },
              { label: 'Buste',        cat: 'ecom' },
              { label: 'Cesti regalo', cat: 'regalo' },
            ].map(l => (
              <button key={l.label} className="hero-popular-link" onClick={() => router.push(`/catalogo?cat=${l.cat}`)}>
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATALOG ── */}
      <section className="section" id="catalogo">
        <div className="section-head scroll-reveal">
          <div>
            <div className="section-title"><span className="section-title-gradient">Catalogo Prodotti</span></div>
            <div className="section-sub">Seleziona una categoria per esplorare i prodotti disponibili</div>
          </div>
        </div>

        {/* ─ Main category cards ─ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16, marginBottom: 28 }}>
          {MAIN_CATS.map((mc, i) => {
            const isActive = activeMain === mc.key
            return (
              <button
                key={mc.key}
                className="scroll-reveal"
                style={{ transitionDelay: `${i * 0.08}s` }}
                onClick={() => {
                  if (mc.comingSoon) return
                  setActiveMain(isActive ? null : mc.key)
                  setActiveSub(null)
                }}
                disabled={mc.comingSoon}
              >
                <div style={{
                  border: isActive ? '2.5px solid var(--accent)' : '1.5px solid var(--border-2)',
                  background: isActive ? 'rgba(232,114,26,0.04)' : 'var(--card)',
                  borderRadius: 16, padding: '24px 28px', textAlign: 'left', transition: 'all .2s',
                  display: 'flex', alignItems: 'center', gap: 20,
                  boxShadow: isActive ? '0 0 0 4px rgba(232,114,26,0.08)' : 'var(--shadow-sm)',
                  opacity: mc.comingSoon ? 0.6 : 1, cursor: mc.comingSoon ? 'default' : 'pointer',
                }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 13, flexShrink: 0,
                    background: isActive ? 'rgba(232,114,26,0.1)' : 'var(--surface)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1.5px solid ${isActive ? 'rgba(232,114,26,0.3)' : 'var(--border)'}`,
                  }}>
                    {mc.key === 'shopper' ? (
                      <svg width="26" height="26" fill="none" stroke={isActive ? '#e8721a' : 'var(--ink-3)'} strokeWidth="1.7" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                        <line x1="3" y1="6" x2="21" y2="6"/>
                        <path d="M16 10a4 4 0 01-8 0"/>
                      </svg>
                    ) : (
                      <svg width="26" height="26" fill="none" stroke="var(--ink-4)" strokeWidth="1.7" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="21 8 21 21 3 21 3 8"/>
                        <rect x="1" y="3" width="22" height="5"/>
                        <line x1="10" y1="12" x2="14" y2="12"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 19, fontWeight: 800, color: isActive ? 'var(--accent)' : 'var(--ink)', letterSpacing: '-0.3px', marginBottom: 4 }}>
                      {mc.label}
                    </div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-4)', lineHeight: 1.55 }}>{mc.desc}</div>
                    {mc.comingSoon ? (
                      <div style={{ marginTop: 8, fontSize: 10.5, fontWeight: 700, color: 'var(--ink-4)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Prossimamente</div>
                    ) : (
                      <div style={{ marginTop: 8, fontSize: 12, color: isActive ? 'var(--accent)' : 'var(--ink-5)', fontWeight: 500 }}>
                        {CATALOG_ITEMS.filter(p => p.mainCat === mc.key).length} prodotti disponibili
                      </div>
                    )}
                  </div>
                  {!mc.comingSoon && (
                    <svg width="18" height="18" fill="none" stroke={isActive ? 'var(--accent)' : 'var(--ink-4)'} strokeWidth="2.2" viewBox="0 0 24 24"
                      style={{ flexShrink: 0, transform: isActive ? 'rotate(180deg)' : 'none', transition: 'transform .25s' }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* ─ Subcategory pills (SHOPPER) ─ */}
        {activeMain === 'shopper' && (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px', marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-5)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: 12 }}>Linee</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SHOPPER_SUBCATS.map(s => {
                const count = CATALOG_ITEMS.filter(p => p.subCat === s.key).length
                const isOn = activeSub === s.key
                return (
                  <button
                    key={s.key}
                    onClick={() => setActiveSub(isOn ? null : s.key)}
                    style={{
                      padding: '7px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                      fontFamily: 'var(--f)', cursor: 'pointer', transition: 'all .15s',
                      border: isOn ? '2px solid var(--accent)' : '1.5px solid var(--border-2)',
                      background: isOn ? 'var(--accent)' : 'var(--card)',
                      color: isOn ? '#fff' : 'var(--ink-3)',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {s.label}
                    <span style={{
                      fontSize: 11, lineHeight: 1,
                      background: isOn ? 'rgba(255,255,255,0.22)' : 'var(--surface)',
                      color: isOn ? '#fff' : 'var(--ink-4)',
                      padding: '2px 6px', borderRadius: 100,
                    }}>{count}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* ─ SCATOLE coming soon ─ */}
        {activeMain === 'scatole' && (
          <div style={{ textAlign: 'center', padding: '52px 24px', background: 'var(--surface)', borderRadius: 16, border: '1.5px dashed var(--border-2)', marginBottom: 28 }}>
            <svg width="48" height="48" fill="none" stroke="var(--ink-4)" strokeWidth="1.4" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 16 }}>
              <polyline points="21 8 21 21 3 21 3 8"/>
              <rect x="1" y="3" width="22" height="5"/>
              <line x1="10" y1="12" x2="14" y2="12"/>
            </svg>
            <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--ink)', marginBottom: 8, letterSpacing: '-0.3px' }}>Scatole — In arrivo</div>
            <div style={{ fontSize: 14, color: 'var(--ink-4)', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>
              Stiamo preparando il catalogo completo di scatole, fustellati e packaging rigido.<br/>
              Nel frattempo contattaci per un preventivo su misura.
            </div>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-preventivo'))}
              style={{ marginTop: 24, padding: '12px 28px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, fontFamily: 'var(--f)', cursor: 'pointer', boxShadow: 'var(--shadow-accent)' }}
            >
              Richiedi preventivo →
            </button>
          </div>
        )}

        {/* ─ Prompt to pick subcategory ─ */}
        {activeMain === 'shopper' && !activeSub && (
          <div style={{ textAlign: 'center', padding: '28px 24px', color: 'var(--ink-4)', fontSize: 13.5 }}>
            Scegli una linea per vedere i prodotti disponibili
          </div>
        )}

        {/* ─ Product cards ─ */}
        {activeMain === 'shopper' && activeSub && (() => {
          const items = CATALOG_ITEMS.filter(p => p.subCat === activeSub)
          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
              {items.map((p, i) => (
                <div
                  key={p.key}
                  className="scroll-reveal"
                  style={{
                    transitionDelay: `${i * 0.04}s`,
                    background: 'var(--card)', borderRadius: 14,
                    border: '1.5px solid var(--border)',
                    padding: '22px 18px', display: 'flex', flexDirection: 'column', gap: 14,
                    transition: 'box-shadow .2s, border-color .2s',
                  }}
                  onMouseEnter={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.boxShadow = '0 4px 20px rgba(0,0,0,0.09)'
                    el.style.borderColor = 'rgba(232,114,26,0.35)'
                  }}
                  onMouseLeave={e => {
                    const el = e.currentTarget as HTMLElement
                    el.style.boxShadow = ''
                    el.style.borderColor = ''
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(232,114,26,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="20" height="20" fill="none" stroke="#e8721a" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                      <line x1="3" y1="6" x2="21" y2="6"/>
                      <path d="M16 10a4 4 0 01-8 0"/>
                    </svg>
                  </div>
                  <div style={{ fontSize: 14.5, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.35, flex: 1 }}>{p.name}</div>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-preventivo'))}
                    style={{
                      padding: '8px 14px', background: 'transparent',
                      border: '1.5px solid rgba(232,114,26,0.5)', color: 'var(--accent)',
                      borderRadius: 8, fontSize: 12.5, fontWeight: 700,
                      fontFamily: 'var(--f)', cursor: 'pointer', transition: 'all .15s',
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--accent)'; el.style.color = '#fff'; el.style.borderColor = 'var(--accent)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'var(--accent)'; el.style.borderColor = 'rgba(232,114,26,0.5)' }}
                  >
                    Richiedi preventivo
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" width="11" height="11"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                  </button>
                </div>
              ))}
            </div>
          )
        })()}
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
            <div className="footer-contact">C.da Sodera, 38 — 66030 Poggiofiorito (CH)<br /><a href="tel:+390871869378" style={{ color: 'inherit', textDecoration: 'none' }}>0871 869378</a><br />info@briopack.com<br />PEC: briopack@pec.it</div>
            <div className="footer-social">
              <a href="https://www.facebook.com/Briopack/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Facebook">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/></svg>
              </a>
              <a href="https://www.instagram.com/briopack_packaging/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
            </div>
          </div>
          <div className="scroll-reveal" style={{ transitionDelay: '0.1s' }}>
            <div className="footer-col-title">Prodotti</div>
            <ul className="footer-links">
              {[
                { label: 'Shopper & Cartotecnica', href: '/catalogo?cat=shopper' },
                { label: 'Wine Packaging',          href: '/catalogo?cat=wine' },
                { label: 'Food Delivery',           href: '/catalogo?cat=food' },
                { label: 'E-commerce',              href: '/catalogo?cat=ecom' },
                { label: 'Cesti & Scatole Regalo',  href: '/catalogo?cat=regalo' },
                { label: 'Nastri Adesivi',          href: '/catalogo?cat=nastri' },
              ].map(l => <li key={l.label}><a href={l.href}>{l.label}</a></li>)}
            </ul>
          </div>
          <div className="scroll-reveal" style={{ transitionDelay: '0.18s' }}>
            <div className="footer-col-title">Azienda</div>
            <ul className="footer-links">
              <li><a href="#">Chi Siamo</a></li>
              <li><a href="/contatti">Contatti</a></li>
              <li>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-preventivo'))}
                  style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', cursor: 'pointer', textAlign: 'left' }}
                >
                  Richiedi Preventivo
                </button>
              </li>
              <li><a href="/admin">Area Amministrativa</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-legal">© 2025 Briopack Srl — P.IVA 02540090699 — REA CH-186673</div>
          <div className="footer-legal" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={e => (e.currentTarget as HTMLElement).style.color='#e8721a'} onMouseOut={e => (e.currentTarget as HTMLElement).style.color=''}>Privacy & Cookie Policy</a>
            <a href="/termini" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={e => (e.currentTarget as HTMLElement).style.color='#e8721a'} onMouseOut={e => (e.currentTarget as HTMLElement).style.color=''}>Termini di Vendita</a>
            <button onClick={() => { try { localStorage.removeItem('bp_cookie_consent') } catch {} window.location.reload() }} style={{ background: 'none', border: 'none', padding: 0, fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', cursor: 'pointer', textDecoration: 'none' }} onMouseOver={e => (e.currentTarget as HTMLElement).style.color='#e8721a'} onMouseOut={e => (e.currentTarget as HTMLElement).style.color=''}>Gestisci preferenze cookie</button>
          </div>
        </div>
      </footer>

      {/* ── MOBILE FAB CART ── */}
      <button
        className="fab-cart"
        onClick={() => setCartOpen(true)}
        aria-label={`Carrello (${cartCount} articoli)`}
      >
        <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
        {cartCount > 0 && <span className="fab-badge">{cartCount}</span>}
      </button>

      {/* ── HERO AUTOCOMPLETE — fixed positioning escapes every stacking context ── */}
      {suggestionsOpen && heroSearch.trim().length > 1 && (
        <div
          ref={autocompleteRef}
          className="hero-autocomplete"
          style={{ position: 'fixed', top: acPos.top, left: acPos.left, width: acPos.width, zIndex: 9999 }}
        >
          {heroSuggestions.length > 0 ? heroSuggestions.map(p => (
            <div key={p.key} className="hero-ac-item"
              onMouseDown={e => { e.preventDefault(); setSuggestionsOpen(false); router.push(`/products/${p.key}`) }}>
              <div className="hero-ac-thumb">
                {p.image ? (
                  <PCardImage p={p} size={40} />
                ) : (
                  <div style={{ transform: 'scale(0.35)', transformOrigin: 'center', width: 108, height: 108, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.svg}
                  </div>
                )}
              </div>
              <div className="hero-ac-info">
                <div className="hero-ac-name">{p.name}</div>
                <div className="hero-ac-cat">{p.cat}</div>
              </div>
              <div className="hero-ac-price">€{fmt(p.price)}/pz</div>
            </div>
          )) : (
            <div className="hero-ac-empty">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <div>
                <div className="hero-ac-empty-title">Nessun risultato per &ldquo;{heroSearch}&rdquo;</div>
                <div className="hero-ac-empty-sub">Prova con shopper, scatola, busta…</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── CART DRAWER ── */}
      <CartDrawer />

    </>
  )
}
