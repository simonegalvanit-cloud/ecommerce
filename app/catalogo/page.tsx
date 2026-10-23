'use client'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavWrapper from '@/components/NavWrapper'
import CartDrawer from '@/components/CartDrawer'
import { CATALOG_ITEMS, MAIN_CATS, SHOPPER_SUBCATS, SCATOLE_SUBCATS } from '@/lib/products'

export default function CatalogoPage() {
  const router = useRouter()
  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const q = params.get('q'); const cat = params.get('cat')
    if (q) setSearch(q)
    if (cat) setActiveCat(cat)
  }, [])

  const allSubs = [...SHOPPER_SUBCATS, ...SCATOLE_SUBCATS]

  const filtered = CATALOG_ITEMS.filter(p => {
    const matchCat = activeCat === 'all' || p.mainCat === activeCat || p.subCat === activeCat
    const q = search.toLowerCase()
    const matchSearch = !search || p.name.toLowerCase().includes(q)
    return matchCat && matchSearch
  })

  return (
    <>
      <NavWrapper activeLink="catalogo" />
      <CartDrawer />

      <div className="cat-hero">
        <div className="cat-hero-inner">
          <div className="cat-hero-text">
            <h1 className="cat-hero-title">Catalogo Briopack</h1>
            <p className="cat-hero-sub">Packaging professionale su misura — configura, quantifica, ordina.</p>
          </div>
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

      <div className="cat-filter-bar">
        <div className="cat-filter-inner">
          {[{ key: 'all', label: 'Tutti' }, ...MAIN_CATS].map(c => {
            const count = c.key === 'all' ? CATALOG_ITEMS.length : CATALOG_ITEMS.filter(p => p.mainCat === c.key).length
            const active = activeCat === c.key
            return (
              <button
                key={c.key}
                className={`cat-filter-pill${active ? ' active' : ''}`}
                style={active ? { background: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' } : {}}
                onClick={() => setActiveCat(c.key)}
              >
                {c.label}
                <span className="cat-pill-count" style={active ? { background: 'rgba(255,255,255,0.22)', color: '#fff' } : {}}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <main className="cat-main">
        <div className="cat-results-bar">
          <span className="cat-results-count">
            <strong>{filtered.length}</strong> prodott{filtered.length === 1 ? 'o' : 'i'}
            {search && <> per &ldquo;<span style={{ color: 'var(--accent)' }}>{search}</span>&rdquo;</>}
          </span>
          {search && (
            <button className="cat-clear-search" onClick={() => setSearch('')}>
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
              Rimuovi filtro
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="cat-grid">
            {filtered.map(p => {
              const subLabel = allSubs.find(s => s.key === p.subCat)?.label ?? p.subCat
              return (
                <div
                  key={p.key}
                  className="cat-card"
                  onClick={() => router.push('/')}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="cat-card-img" style={{ background: 'var(--surface)' }}>
                    <div className="cat-card-img-inner">
                      <svg viewBox="0 0 80 80" fill="none" style={{ width: 60, opacity: 0.15 }}>
                        <rect x="10" y="24" width="60" height="46" rx="3" stroke="#888" strokeWidth="1.5"/>
                        <polygon points="10,24 40,10 70,24 40,38" stroke="#888" strokeWidth="1.5"/>
                      </svg>
                    </div>
                  </div>
                  <div className="cat-card-body">
                    <div className="cat-card-cat">{subLabel}</div>
                    <div className="cat-card-name">{p.name}</div>
                    <div className="cat-card-footer">
                      <button
                        className="cat-card-btn"
                        onClick={e => { e.stopPropagation(); router.push('/') }}
                        style={{
                          padding: '7px 13px', borderRadius: 8,
                          border: '1.5px solid rgba(232,114,26,0.45)',
                          background: 'transparent', color: 'var(--accent)',
                          fontFamily: 'var(--f)', fontSize: 12, fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Configura
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
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
