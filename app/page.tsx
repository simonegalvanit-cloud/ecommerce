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
      <section className="hero">
        {/* Background effects */}
        <div className="hero-glow-1" />
        <div className="hero-glow-2" />
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />

        <div className="hero-inner">
          <div className="hero-left">
            {/* Eyebrow badge */}
            <div className="hero-badge animate-fade-up">
              <span className="hero-badge-dot" />
              Packaging B2B — Made in Italy
            </div>

            <h1 className="animate-fade-up delay-1">
              Le migliori soluzioni<br />
              per il Packaging<br />
              e l&apos;Imballaggio
            </h1>

            <p className="hero-sub animate-fade-up delay-2">
              Scatole, shopper, wine box e packaging food-grade personalizzabili online. MOQ accessibili, stampa professionale, spedizione nazionale.
            </p>

            <div className="hero-actions animate-fade-up delay-3">
              <button className="hero-cta-primary" onClick={() => router.push('/catalogo')}>
                Scopri il catalogo
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 16 16" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="8" x2="13" y2="8"/><polyline points="9 4 13 8 9 12"/></svg>
              </button>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-cards">
              {[
                { label: 'Shopper & Cartotecnica', title: 'Shopper Lusso',    price: 'da €0,65', moq: 'MOQ 250 pz', delay: 'delay-3' },
                { label: 'Imballaggi Industriali', title: 'Scatola Americana', price: 'da €0,38', moq: 'MOQ 100 pz', delay: 'delay-4' },
                { label: 'BrioGreenPack',          title: 'Scatola Eco 100%', price: 'da €0,45', moq: 'MOQ 100 pz', delay: 'delay-5' },
                { label: 'E-commerce',             title: 'Mailer Self-Seal',  price: 'da €0,52', moq: 'MOQ 100 pz', delay: 'delay-5' },
              ].map(c => (
                <div key={c.title} className={`hero-card animate-fade-up ${c.delay}`}
                  onClick={() => { const p = PRODUCTS.find(pr => pr.cat === c.label) || PRODUCTS[0]; router.push(`/products/${p.key}`) }}>
                  <span className="hc-label">{c.label}</span>
                  <span className="hc-title">{c.title}</span>
                  <span className="hc-price">{c.price}</span>
                  <span className="hc-moq">{c.moq}</span>
                  <span className="hc-arrow">→</span>
                </div>
              ))}
            </div>
          </div>
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

      {/* ── CART DRAWER ── */}
      <CartDrawer />

    </>
  )
}
