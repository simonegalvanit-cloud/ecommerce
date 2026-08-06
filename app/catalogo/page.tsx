'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavWrapper from '@/components/NavWrapper'
import CartDrawer from '@/components/CartDrawer'
import { PRODUCTS, CATEGORIES } from '@/lib/products'

function fmt(n: number) {
  return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const CAT_COLOR: Record<string, string> = {
  industrial: '#6366f1',
  shopper:    '#ec4899',
  wine:       '#8b5cf6',
  food:       '#f59e0b',
  eco:        '#10b981',
  ecom:       '#0ea5e9',
  regalo:     '#d97706',
}

const CAT_ICONS: Record<string, React.ReactNode> = {
  all:        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  industrial: <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  shopper:    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  wine:       <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" strokeLinecap="round"><path d="M8 22h8M12 11v11M5 3h14l-2 8a5 5 0 01-10 0L5 3z"/></svg>,
  food:       <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" strokeLinecap="round"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>,
  eco:        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" strokeLinecap="round"><path d="M2 22a10 10 0 0118-6M6 18a6 6 0 0112-4"/><path d="M22 2s-5 1-8 4c-4 4-4 9-4 9"/></svg>,
  ecom:       <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" strokeLinecap="round"><path d="M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>,
  regalo:     <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.9" viewBox="0 0 24 24" strokeLinecap="round"><path d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>,
}

export default function CatalogoPage() {
  const router = useRouter()
  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')
  const [hovered, setHovered] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q'); const cat = params.get('cat')
    if (q) setSearch(q)
    if (cat) setActiveCat(cat)
  }, [])

  const filteredProducts = PRODUCTS.filter(p => {
    const matchCat = activeCat === 'all' || p.catKey === activeCat
    const q = search.toLowerCase()
    const matchSearch = !search || p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  return (
    <>
      <NavWrapper activeLink="catalogo" />
      <CartDrawer />

      {/* ── Compact hero ── */}
      <div className="cat-hero">
        <div className="cat-hero-inner">
          <div className="cat-hero-text">
            <h1 className="cat-hero-title">Catalogo Briopack</h1>
            <p className="cat-hero-sub">Packaging professionale su misura — configura, quantifica, ordina.</p>
          </div>
          {/* Search */}
          <div className="cat-search-wrap">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, color: '#9ca3af' }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              ref={searchRef}
              className="cat-search-input"
              type="text"
              placeholder="Cerca prodotto…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="cat-search-clear" onClick={() => setSearch('')} aria-label="Cancella">
                <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Sticky filter bar ── */}
      <div className="cat-filter-bar">
        <div className="cat-filter-inner">
          {CATEGORIES.map(c => {
            const count = c.key === 'all' ? PRODUCTS.length : PRODUCTS.filter(p => p.catKey === c.key).length
            const active = activeCat === c.key
            const col = c.key !== 'all' ? CAT_COLOR[c.key] : 'var(--accent)'
            return (
              <button
                key={c.key}
                className={`cat-filter-pill${active ? ' active' : ''}`}
                style={active ? { background: col, borderColor: col, color: '#fff' } : {}}
                onClick={() => setActiveCat(c.key)}
              >
                <span style={{ opacity: active ? 1 : 0.6 }}>{CAT_ICONS[c.key]}</span>
                {c.label}
                <span className="cat-pill-count" style={active ? { background: 'rgba(255,255,255,0.22)', color: '#fff' } : {}}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Main content ── */}
      <main className="cat-main">
        {/* Results info */}
        <div className="cat-results-bar">
          <span className="cat-results-count">
            <strong>{filteredProducts.length}</strong> prodott{filteredProducts.length === 1 ? 'o' : 'i'}
            {search && <> per &ldquo;<span style={{ color: 'var(--accent)' }}>{search}</span>&rdquo;</>}
          </span>
          {search && (
            <button className="cat-clear-search" onClick={() => setSearch('')}>
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              Rimuovi filtro
            </button>
          )}
        </div>

        {/* Product grid */}
        {filteredProducts.length > 0 ? (
          <div className="cat-grid">
            {filteredProducts.map(p => (
              <ProductCard
                key={p.key}
                product={p}
                catColor={CAT_COLOR[p.catKey] ?? 'var(--accent)'}
                hovered={hovered === p.key}
                onHover={setHovered}
                onClick={() => router.push(`/products/${p.key}`)}
              />
            ))}
          </div>
        ) : (
          <div className="cat-empty">
            <div className="cat-empty-icon">
              <svg width="28" height="28" fill="none" stroke="var(--ink-4)" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            </div>
            <div className="cat-empty-title">Nessun prodotto trovato</div>
            <div className="cat-empty-sub">Prova con un&apos;altra parola chiave</div>
            <button className="cat-empty-btn" onClick={() => { setSearch(''); setActiveCat('all') }}>
              Mostra tutto
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>© 2025 Briopack Srl — P.IVA 02540090699 — <a href="tel:+390871869378" style={{ color: 'inherit', textDecoration: 'none' }}>0871 869378</a></div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[{ label: 'Home', href: '/' }, { label: 'Contatti', href: '/contatti' }].map(l => (
            <a key={l.href} href={l.href} style={{ fontSize: 13, color: 'var(--ink-4)', textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = 'var(--accent)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--ink-4)'}>
              {l.label}
            </a>
          ))}
        </div>
      </footer>
    </>
  )
}

/* ── Product Card ── */
function ProductCard({ product: p, catColor, hovered, onHover, onClick }: {
  product: typeof PRODUCTS[0]
  catColor: string
  hovered: boolean
  onHover: (key: string | null) => void
  onClick: () => void
}) {
  const colorSwatches = p.colors?.slice(0, 5) ?? []

  return (
    <div
      className={`cat-card${hovered ? ' hovered' : ''}`}
      onClick={onClick}
      onMouseEnter={() => onHover(p.key)}
      onMouseLeave={() => onHover(null)}
      style={hovered ? {
        borderColor: catColor + '55',
        boxShadow: `0 16px 40px ${catColor}18, 0 4px 16px rgba(0,0,0,0.08)`,
        transform: 'translateY(-4px)',
      } : {}}
    >
      {/* Image area */}
      <div className="cat-card-img" style={{ background: hovered ? catColor + '0d' : 'var(--surface)' }}>
        {/* Top accent bar */}
        <div className="cat-card-accent" style={{ background: catColor, opacity: hovered ? 1 : 0 }} />

        {p.badge && (
          <div className="cat-card-badge" style={{ background: p.badge.type === 'eco' ? '#065f46' : catColor }}>
            {p.badge.label}
          </div>
        )}

        <div className="cat-card-img-inner" style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}>
          {p.image ? (
            <img src={p.image} alt={p.name} className="cat-card-photo" />
          ) : p.svg ?? (
            <svg viewBox="0 0 80 80" fill="none" style={{ width: 60, opacity: 0.2 }}>
              <rect x="10" y="24" width="60" height="46" rx="3" stroke="#888" strokeWidth="1.5"/>
              <polygon points="10,24 40,10 70,24 40,38" stroke="#888" strokeWidth="1.5"/>
            </svg>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className="cat-card-body">
        <div className="cat-card-cat" style={{ color: catColor }}>{p.cat}</div>
        <div className="cat-card-name">{p.name}</div>
        <div className="cat-card-desc">{p.desc}</div>

        {/* Color swatches */}
        {colorSwatches.length > 0 && (
          <div className="cat-card-swatches">
            {colorSwatches.map(c => (
              <span
                key={c.label}
                className="cat-swatch"
                title={c.label}
                style={{
                  background: c.hex,
                  border: c.border ? '1.5px solid #d1d5db' : `1.5px solid ${c.hex}`,
                }}
              />
            ))}
            {(p.colors?.length ?? 0) > 5 && (
              <span className="cat-swatch-more">+{(p.colors?.length ?? 0) - 5}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="cat-card-footer">
          <div className="cat-card-price-block">
            <div className="cat-card-price">
              <span className="cat-price-from">da </span>
              <span className="cat-price-val">€{fmt(p.price)}</span>
              <span className="cat-price-unit">/pz</span>
            </div>
            <div className="cat-price-moq">MOQ {p.moq} pz</div>
          </div>
          <button
            className="cat-card-cta"
            style={hovered ? { background: catColor, borderColor: catColor, color: '#fff' } : {}}
            onClick={e => { e.stopPropagation(); onClick() }}
          >
            Configura
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 16 16" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
