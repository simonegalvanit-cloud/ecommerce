'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import NavWrapper from '@/components/NavWrapper'
import CartDrawer from '@/components/CartDrawer'
import { useCart } from '@/lib/cart-context'
import { MAIN_CATS, SHOPPER_SUBCATS, SCATOLE_SUBCATS, CATALOG_ITEMS, PRODUCT_SPECS } from '@/lib/products'
import { InstagramFeed } from '@/components/InstagramFeed'

const scrollRevealCSS = `.scroll-reveal{opacity:0;transform:translateY(22px);transition:opacity .55s ease,transform .55s ease}.scroll-reveal.revealed{opacity:1;transform:translateY(0)}`

// ── Main Page ────────────────────────────────────────────────────────────────
export default function StorefrontPage() {
  const { setCartOpen, cartCount } = useCart()
  const router = useRouter()
  const [activeMain, setActiveMain]         = useState<string>('shopper')
  const [activeSub,  setActiveSub]          = useState<string | null>(null)
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
    ? CATALOG_ITEMS.filter(p => p.name.toLowerCase().includes(heroSearch.toLowerCase())).slice(0, 6)
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
      <section className="section" id="catalogo" style={{ paddingBottom: 72 }}>
        {/* Header */}
        <div className="section-head scroll-reveal" style={{ marginBottom: 32 }}>
          <div className="section-title"><span className="section-title-gradient">Catalogo Prodotti</span></div>
        </div>

        {/* ── Category selector: two image cards ── */}
        <div className="scroll-reveal" style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 36,
        }}>
          {MAIN_CATS.map(mc => {
            const isOn = activeMain === mc.key
            const itemCount = CATALOG_ITEMS.filter(p => p.mainCat === mc.key).length
            return (
              <button
                key={mc.key}
                onClick={() => { setActiveMain(mc.key); setActiveSub(null) }}
                style={{
                  position: 'relative', height: 180, borderRadius: 18, overflow: 'hidden',
                  border: isOn ? '2.5px solid var(--accent)' : '1.5px solid var(--border)',
                  cursor: 'pointer', padding: 0, background: 'none',
                  transition: 'border-color .2s, box-shadow .2s',
                  boxShadow: isOn ? '0 0 0 4px rgba(232,114,26,0.12)' : 'none',
                }}
              >
                {/* Hero photo */}
                <div style={{
                  position: 'absolute', inset: 0,
                  backgroundImage: `url('/hero-${mc.key}.jpg')`,
                  backgroundSize: 'cover',
                  backgroundPosition: mc.key === 'shopper' ? '50% 35%' : '50% 30%',
                  transition: 'transform .4s',
                }} />
                {/* Dark gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)',
                }} />
                {/* Text */}
                <div style={{ position: 'absolute', bottom: 18, left: 20, textAlign: 'left' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', letterSpacing: '-0.5px', lineHeight: 1 }}>
                    {mc.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 4, fontWeight: 400 }}>
                    {itemCount} prodotti
                  </div>
                </div>
                {/* Active badge */}
                {isOn && (
                  <div style={{
                    position: 'absolute', top: 14, right: 14,
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'var(--accent)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(232,114,26,0.45)',
                  }}>
                    <svg width="11" height="11" viewBox="0 0 10 10" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M2 5l2.2 2.2L8 2.5" />
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {/* ── Subcategory chip strip ── */}
        {(() => {
          const subcats = activeMain === 'shopper' ? SHOPPER_SUBCATS : SCATOLE_SUBCATS
          return (
            <div style={{
              display: 'flex', overflowX: 'auto', gap: 8, paddingBottom: 4,
              marginBottom: 32, scrollbarWidth: 'none',
            }}>
              <button
                onClick={() => setActiveSub(null)}
                style={{
                  flexShrink: 0, padding: '7px 14px', borderRadius: 30,
                  border: activeSub === null ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                  background: activeSub === null ? 'rgba(232,114,26,0.08)' : 'var(--white)',
                  fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: activeSub === null ? 700 : 400,
                  color: activeSub === null ? 'var(--accent)' : 'var(--ink-3)',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s',
                }}
              >
                Tutti
              </button>
              {subcats.map(s => {
                const cnt = CATALOG_ITEMS.filter(p => p.subCat === s.key).length
                const isOn = activeSub === s.key
                return (
                  <button
                    key={s.key}
                    onClick={() => setActiveSub(isOn ? null : s.key)}
                    style={{
                      flexShrink: 0, padding: '7px 14px', borderRadius: 30,
                      border: isOn ? '1.5px solid var(--accent)' : '1.5px solid var(--border)',
                      background: isOn ? 'rgba(232,114,26,0.08)' : 'var(--white)',
                      fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: isOn ? 700 : 400,
                      color: isOn ? 'var(--accent)' : 'var(--ink-3)',
                      cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all .15s',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    {s.label}
                    <span style={{
                      fontSize: 10, fontWeight: 600, padding: '1px 5px', borderRadius: 4,
                      background: isOn ? 'rgba(232,114,26,0.15)' : 'var(--surface)',
                      color: isOn ? 'var(--accent)' : 'var(--ink-5)', lineHeight: 1.4,
                    }}>{cnt}</span>
                  </button>
                )
              })}
            </div>
          )
        })()}

        {/* ── Product grid ── */}
        {(() => {
          const isBox = activeMain === 'scatole'
          const items = CATALOG_ITEMS.filter(p =>
            p.mainCat === activeMain && (activeSub === null || p.subCat === activeSub)
          )
          const placeholderBg = isBox
            ? 'linear-gradient(140deg,#e8eef5 0%,#d8e2ed 100%)'
            : 'linear-gradient(140deg,#faf0e6 0%,#f0e0cc 100%)'
          const iconColor = isBox ? 'rgba(80,105,145,0.18)' : 'rgba(160,95,30,0.18)'
          return (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 18 }}>
              {items.map((p, pi) => {
                const hasSpec = PRODUCT_SPECS.some(s => s.productKey === p.key)
                const subLabel = (activeMain === 'shopper' ? SHOPPER_SUBCATS : SCATOLE_SUBCATS)
                  .find(s => s.key === p.subCat)?.label ?? ''
                return (
                  <div
                    key={p.key}
                    className="scroll-reveal"
                    style={{
                      transitionDelay: `${pi * 0.028}s`,
                      background: 'var(--white)', borderRadius: 16,
                      border: '1px solid var(--border)', overflow: 'hidden',
                      display: 'flex', flexDirection: 'column',
                      transition: 'box-shadow .2s, transform .2s',
                    }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 8px 32px rgba(0,0,0,0.10)'; el.style.transform = 'translateY(-3px)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = ''; el.style.transform = '' }}
                  >
                    {/* Image / placeholder */}
                    <div style={{ height: 196, background: placeholderBg, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="72" height="72" fill="none" stroke={iconColor} strokeWidth="1" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                        {isBox ? (
                          <><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></>
                        ) : (
                          <><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></>
                        )}
                      </svg>
                      {/* Subcategory chip on image */}
                      {activeSub === null && (
                        <div style={{
                          position: 'absolute', bottom: 12, left: 12,
                          fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                          background: 'rgba(255,255,255,0.82)', color: 'var(--ink-3)',
                          backdropFilter: 'blur(4px)', letterSpacing: '0.2px',
                        }}>{subLabel}</div>
                      )}
                    </div>
                    {/* Body */}
                    <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1, gap: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', lineHeight: 1.4, flex: 1 }}>{p.name}</div>
                      <button
                        onClick={() => hasSpec
                          ? router.push(`/configure/${p.key}`)
                          : window.dispatchEvent(new CustomEvent('open-preventivo'))
                        }
                        style={{
                          width: '100%', padding: '9px 0', borderRadius: 9,
                          border: '1.5px solid rgba(232,114,26,0.4)',
                          background: 'transparent', color: 'var(--accent)',
                          fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: 700,
                          cursor: 'pointer', transition: 'all .15s',
                        }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'var(--accent)'; el.style.color = '#fff'; el.style.borderColor = 'var(--accent)' }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; el.style.color = 'var(--accent)'; el.style.borderColor = 'rgba(232,114,26,0.4)' }}
                      >
                        {hasSpec ? 'Configura' : 'Richiedi preventivo'}
                      </button>
                    </div>
                  </div>
                )
              })}
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

      {/* ── INSTAGRAM ── */}
      <div className="section" style={{ paddingTop: 0 }}>
        <InstagramFeed />
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
          {heroSuggestions.length > 0 ? heroSuggestions.map(p => {
            const allSubs = [...SHOPPER_SUBCATS, ...SCATOLE_SUBCATS]
            const subLabel = allSubs.find(s => s.key === p.subCat)?.label ?? p.subCat
            return (
            <div key={p.key} className="hero-ac-item"
              onMouseDown={e => { e.preventDefault(); setSuggestionsOpen(false); router.push(`/#catalogo`) }}>
              <div className="hero-ac-info">
                <div className="hero-ac-name">{p.name}</div>
                <div className="hero-ac-cat">{subLabel}</div>
              </div>
            </div>
          )}) : (
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
