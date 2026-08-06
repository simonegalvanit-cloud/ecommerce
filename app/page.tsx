'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import NavWrapper from '@/components/NavWrapper'
import CartDrawer from '@/components/CartDrawer'
import { useCart } from '@/lib/cart-context'
import { PRODUCTS, CATEGORIES } from '@/lib/products'

function fmt(n: number) { return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

const scrollRevealCSS = `.scroll-reveal{opacity:0;transform:translateY(22px);transition:opacity .55s ease,transform .55s ease}.scroll-reveal.revealed{opacity:1;transform:translateY(0)}`

// ── Main Page ────────────────────────────────────────────────────────────────
export default function StorefrontPage() {
  const { setCartOpen, cartCount } = useCart()
  const router = useRouter()
  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch]   = useState('')
  const [heroSearch, setHeroSearch] = useState('')
  const [suggestionsOpen, setSuggestionsOpen] = useState(false)
  const [acPos, setAcPos] = useState({ top: 0, left: 0, width: 0 })
  const searchWrapRef = useRef<HTMLDivElement>(null)
  const searchBarRef = useRef<HTMLFormElement>(null)
  const autocompleteRef = useRef<HTMLDivElement>(null)

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
  }, [activeCat, search])

  const filteredProducts = PRODUCTS.filter(p =>
    (activeCat === 'all' || p.catKey === activeCat) &&
    (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase()))
  )

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
              <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Cerca shopper, portabottiglie, buste…"
                value={heroSearch}
                onChange={e => { setHeroSearch(e.target.value); setSuggestionsOpen(true) }}
                onFocus={() => setSuggestionsOpen(true)}
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

        {/* Bottom product strip */}
        <div className="hero-strip">
          {[
            { key: 'shopper-colorati',       name: 'Shopper Colorati',        price: '0,32', accent: '#ec4899' },
            { key: 'scatola-portabottiglia', name: 'Portabottiglia Kraft',     price: '0,75', accent: '#8b5cf6' },
            { key: 'busta-ecommerce',        name: 'Busta E-Commerce',         price: '0,35', accent: '#0ea5e9' },
          ].map(p => {
            const product = PRODUCTS.find(pr => pr.key === p.key)
            return (
              <div key={p.key} className="hero-strip-cell" onClick={() => router.push(`/products/${p.key}`)}>
                <div className="hero-strip-thumb" style={{ borderColor: p.accent + '55' }}>
                  <div style={{ transform: 'scale(0.38)', transformOrigin: 'center', width: 108, height: 108, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {product?.svg}
                  </div>
                </div>
                <div className="hero-strip-info">
                  <div className="hero-strip-name">{p.name}</div>
                  <div className="hero-strip-price">da <strong>€{p.price}</strong>/pz</div>
                </div>
                <svg className="hero-strip-arrow" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 16 16" strokeLinecap="round"><line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4 13 8 9 12"/></svg>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── CATALOG ZONE ── */}
      <div className="catalog-zone">
        <div className="catalog-searchbar">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input
            type="text"
            placeholder="Cerca prodotti, es. shopper kraft, scatola pizza…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button className="catalog-clear" onClick={() => setSearch('')} aria-label="Cancella ricerca">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
          <button className="catalog-search-btn" aria-label="Cerca">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </button>
        </div>
        <div className="catalog-cats">
          {CATEGORIES.map(c => {
            const count = c.key === 'all' ? PRODUCTS.length : PRODUCTS.filter(p => p.catKey === c.key).length
            return (
              <button key={c.key} className={`catalog-pill${activeCat === c.key ? ' active' : ''}`} onClick={() => setActiveCat(c.key)}>
                {c.label}
                <span className="cpill-count">{count}</span>
              </button>
            )
          })}
        </div>
      </div>


      {/* ── PRODUCTS ── */}
      <section className="section">
        <div className="section-head">
          <div>
            <div className="section-title"><span className="section-title-gradient">Catalogo Prodotti</span></div>
            <div className="section-sub">{filteredProducts.length} prodott{filteredProducts.length === 1 ? 'o' : 'i'} trovati</div>
          </div>
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
                style={{ transitionDelay: `${i * 0.06}s`, cursor: 'pointer' }}
                onClick={() => router.push(`/products/${p.key}`)}
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
                    <button className="btn-config" onClick={e => { e.stopPropagation(); router.push(`/products/${p.key}`) }}>
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
            <div className="footer-contact">C.da Sodera, 38 — 66030 Poggiofiorito (CH)<br /><a href="tel:+390871869378" style={{ color: 'inherit', textDecoration: 'none' }}>0871 869378</a><br />info@briopack.com</div>
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
                { label: 'Shopper & Cartotecnica', href: '/catalogo' },
                { label: 'Wine Packaging',          href: '/catalogo' },
                { label: 'Food Delivery',           href: '/catalogo' },
                { label: 'E-commerce',              href: '/catalogo' },
                { label: 'Imballaggi Industriali',  href: '#' },
                { label: 'BrioGreenPack',           href: '#' },
              ].map(l => <li key={l.label}><a href={l.href}>{l.label}</a></li>)}
            </ul>
          </div>
          <div className="scroll-reveal" style={{ transitionDelay: '0.18s' }}>
            <div className="footer-col-title">Azienda</div>
            <ul className="footer-links">
              {[
                { label: 'Chi Siamo',           href: '#' },
                { label: 'Contatti',            href: '/contatti' },
                { label: 'Richiedi Preventivo', href: '/contatti' },
                { label: 'Area Amministrativa', href: '/admin' },
              ].map(l => <li key={l.label}><a href={l.href}>{l.label}</a></li>)}
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-legal">© 2025 Briopack Srl — P.IVA 02540090699 — REA 186673 Chieti</div>
          <div className="footer-legal"><a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={e => (e.currentTarget as HTMLElement).style.color='#e8721a'} onMouseOut={e => (e.currentTarget as HTMLElement).style.color=''}>Privacy & Cookie Policy</a></div>
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
      {suggestionsOpen && heroSuggestions.length > 0 && (
        <div
          ref={autocompleteRef}
          className="hero-autocomplete"
          style={{ position: 'fixed', top: acPos.top, left: acPos.left, width: acPos.width, zIndex: 9999 }}
        >
          {heroSuggestions.map(p => (
            <div key={p.key} className="hero-ac-item"
              onMouseDown={e => { e.preventDefault(); setSuggestionsOpen(false); router.push(`/products/${p.key}`) }}>
              <div className="hero-ac-thumb">
                <div style={{ transform: 'scale(0.35)', transformOrigin: 'center', width: 108, height: 108, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {p.svg}
                </div>
              </div>
              <div className="hero-ac-info">
                <div className="hero-ac-name">{p.name}</div>
                <div className="hero-ac-cat">{p.cat}</div>
              </div>
              <div className="hero-ac-price">€{fmt(p.price)}/pz</div>
            </div>
          ))}
        </div>
      )}

      {/* ── CART DRAWER ── */}
      <CartDrawer />

    </>
  )
}
