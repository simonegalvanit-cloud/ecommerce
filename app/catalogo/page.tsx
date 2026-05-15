'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import NavWrapper from '@/components/NavWrapper'
import CartDrawer from '@/components/CartDrawer'
import { PRODUCTS, CATEGORIES } from '@/lib/products'

function fmt(n: number) {
  return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const CAT_META: Record<string, { desc: string; color: string; bg: string }> = {
  industrial: { desc: 'Scatole americane e imballaggi ondulati per logistica e industria.',     color: '#6366f1', bg: '#eef2ff' },
  shopper:    { desc: 'Shopper in carta e packaging cartotecnica per il retail.',               color: '#ec4899', bg: '#fdf2f8' },
  wine:       { desc: 'Porta-bottiglie con separatori alveare, da 1 a 6 posti.',               color: '#8b5cf6', bg: '#f5f3ff' },
  food:       { desc: 'Packaging certificato per pizza, delivery e prodotti food-grade.',       color: '#f59e0b', bg: '#fffbeb' },
  eco:        { desc: 'BrioGreenPack: materiali 100% riciclati o biodegradabili.',             color: '#10b981', bg: '#ecfdf5' },
  ecom:       { desc: 'Scatole mailer e self-seal per e-commerce e spedizioni corriere.',      color: '#0ea5e9', bg: '#f0f9ff' },
}

const CAT_ICONS: Record<string, React.ReactNode> = {
  all: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  industrial: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>,
  shopper:    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>,
  wine:       <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round"><path d="M8 22h8M12 11v11M5 3h14l-2 8a5 5 0 01-10 0L5 3z"/></svg>,
  food:       <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round"><path d="M18 8h1a4 4 0 010 8h-1M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8zM6 1v3M10 1v3M14 1v3"/></svg>,
  eco:        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round"><path d="M2 22a10 10 0 0118-6M6 18a6 6 0 0112-4"/><path d="M22 2s-5 1-8 4c-4 4-4 9-4 9"/></svg>,
  ecom:       <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round"><path d="M5 12H3l9-9 9 9h-2M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"/></svg>,
}

export default function CatalogoPage() {
  const router = useRouter()
  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')
  const [hovered, setHovered] = useState<string | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const visibleCats = activeCat === 'all'
    ? CATEGORIES.filter(c => c.key !== 'all')
    : CATEGORIES.filter(c => c.key === activeCat)

  const filtered = (catKey: string) =>
    PRODUCTS.filter(p =>
      p.catKey === catKey &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase()))
    )

  const totalFiltered = visibleCats.reduce((s, c) => s + filtered(c.key).length, 0)

  return (
    <>
      <NavWrapper activeLink="catalogo" />
      <CartDrawer />

      {/* ── Hero ── */}
      <div style={{ background: 'linear-gradient(135deg,#b84e0f 0%,#e8721a 50%,#f5a05a 100%)', paddingTop: 'var(--nav-h)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.12) 1px,transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: -80, right: -60, width: 500, height: 350, background: 'radial-gradient(ellipse,rgba(255,255,255,0.15) 0%,transparent 60%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '52px 40px 48px', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'rgba(0,0,0,0.18)', border: '1px solid rgba(255,255,255,0.22)', borderRadius: 100, padding: '4px 14px', marginBottom: 18 }}>
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.4px' }}>{PRODUCTS.length} prodotti disponibili</span>
            </div>
            <h1 style={{ fontSize: 'clamp(32px,4.5vw,52px)', fontWeight: 900, color: '#fff', letterSpacing: '-1.5px', lineHeight: 1.05, margin: '0 0 14px' }}>
              Catalogo Briopack
            </h1>
            <p style={{ fontSize: 15.5, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65, maxWidth: 460, margin: 0 }}>
              Packaging professionale su misura. Configura le specifiche, scegli la quantità e ordina direttamente online.
            </p>
          </div>
          {/* Search bar in hero */}
          <div style={{ flex: '0 0 auto', width: 'min(100%,380px)' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.95)', borderRadius: 14, padding: '10px 10px 10px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.18)', backdropFilter: 'blur(8px)' }}
            >
              <svg width="16" height="16" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              <input
                ref={searchRef}
                type="text" placeholder="Cerca prodotto…" value={search} onChange={e => setSearch(e.target.value)}
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--f)', fontSize: 14.5, color: 'var(--ink)' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: '#f3f4f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <svg width="9" height="9" fill="none" stroke="#6b7280" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main layout: sidebar + content ── */}
      <div className="catalog-main-layout">

        {/* ── Sidebar ── */}
        <aside className="catalog-sidebar-panel">
          <div className="catalog-sidebar-label" style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 10, paddingLeft: 10 }}>Categorie</div>
          <nav className="catalog-sidebar-nav">
            {CATEGORIES.map(c => {
              const count = c.key === 'all' ? PRODUCTS.length : PRODUCTS.filter(p => p.catKey === c.key).length
              const active = activeCat === c.key
              const meta = c.key !== 'all' ? CAT_META[c.key] : null
              return (
                <button key={c.key} onClick={() => setActiveCat(c.key)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 10,
                    fontSize: 13.5, fontWeight: active ? 700 : 500, fontFamily: 'var(--f)',
                    border: 'none', textAlign: 'left', cursor: 'pointer', transition: 'all .18s',
                    background: active ? (meta ? meta.bg : 'var(--accent-bg)') : 'transparent',
                    color: active ? (meta ? meta.color : 'var(--accent)') : 'var(--ink-3)',
                    boxShadow: active ? `inset 3px 0 0 ${meta ? meta.color : 'var(--accent)'}` : 'none',
                  }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'var(--surface)' }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                >
                  <span style={{ opacity: active ? 1 : 0.55, flexShrink: 0 }}>{CAT_ICONS[c.key]}</span>
                  <span style={{ flex: 1 }}>{c.label}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 100, background: active ? (meta ? meta.color + '20' : 'rgba(232,114,26,0.15)') : 'var(--surface-2)', color: active ? (meta ? meta.color : 'var(--accent)') : 'var(--ink-4)' }}>
                    {count}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Info block */}
          <div className="catalog-sidebar-help" style={{ marginTop: 28, padding: '16px', background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink-2)', marginBottom: 6 }}>Hai bisogno di aiuto?</div>
            <div style={{ fontSize: 12, color: 'var(--ink-4)', lineHeight: 1.6, marginBottom: 10 }}>
              Per ordini speciali o quantità elevate contattaci direttamente.
            </div>
            <a href="/contatti" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
              Contattaci
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 16 16" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </a>
          </div>
        </aside>

        {/* ── Product content ── */}
        <div className="catalog-content-panel">
          {/* Results info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 8 }}>
            <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>
              {search
                ? <><strong style={{ color: 'var(--ink)' }}>{totalFiltered}</strong> risultat{totalFiltered === 1 ? 'o' : 'i'} per &ldquo;<strong style={{ color: 'var(--accent)' }}>{search}</strong>&rdquo;</>
                : <><strong style={{ color: 'var(--ink)' }}>{totalFiltered}</strong> prodott{totalFiltered === 1 ? 'o' : 'i'}{activeCat !== 'all' ? ` in ${CATEGORIES.find(c => c.key === activeCat)?.label}` : ''}</>
              }
            </div>
            {search && (
              <button onClick={() => setSearch('')} style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'var(--f)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
                Rimuovi filtro
              </button>
            )}
          </div>

          {/* Category sections */}
          {visibleCats.map((cat, catIdx) => {
            const products = filtered(cat.key)
            if (products.length === 0) return null
            const meta = CAT_META[cat.key]
            return (
              <div key={cat.key} style={{ marginBottom: catIdx < visibleCats.length - 1 ? 56 : 0 }}>
                {/* Section header — only shown in "all" view */}
                {activeCat === 'all' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, padding: '14px 18px', background: meta.bg, borderRadius: 12, border: `1px solid ${meta.color}22` }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: meta.color + '18', color: meta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {CAT_ICONS[cat.key]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.3px' }}>{cat.label}</div>
                      <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 1 }}>{meta.desc}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: meta.color + '15', color: meta.color, flexShrink: 0 }}>
                      {products.length} prodott{products.length === 1 ? 'o' : 'i'}
                    </span>
                  </div>
                )}

                {/* Single category view header */}
                {activeCat !== 'all' && (
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.6px', margin: '0 0 6px' }}>{cat.label}</h2>
                    <p style={{ fontSize: 14, color: 'var(--ink-4)', margin: 0 }}>{meta.desc}</p>
                  </div>
                )}

                {/* Product grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
                  {products.map(p => (
                    <ProductCard
                      key={p.key}
                      product={p}
                      meta={meta}
                      hovered={hovered === p.key}
                      onHover={setHovered}
                      onClick={() => router.push(`/products/${p.key}`)}
                    />
                  ))}
                </div>
              </div>
            )
          })}

          {/* Empty state */}
          {totalFiltered === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <svg width="28" height="28" fill="none" stroke="var(--ink-4)" strokeWidth="1.5" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Nessun prodotto trovato</div>
              <div style={{ fontSize: 14, color: 'var(--ink-4)', marginBottom: 24 }}>Prova con un&apos;altra parola chiave</div>
              <button onClick={() => setSearch('')} style={{ padding: '10px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 10, fontFamily: 'var(--f)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                Mostra tutto
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)', padding: '24px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ fontSize: 13, color: 'var(--ink-4)' }}>© 2025 Briopack Srl — P.IVA 02540090699</div>
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
interface ProductCardProps {
  product: ReturnType<typeof PRODUCTS[0]['key'] extends string ? () => typeof PRODUCTS[0] : never>
  meta: { color: string; bg: string; desc: string }
  hovered: boolean
  onHover: (key: string | null) => void
  onClick: () => void
}

function ProductCard({ product: p, meta, hovered, onHover, onClick }: {
  product: typeof PRODUCTS[0]
  meta: { color: string; bg: string; desc: string }
  hovered: boolean
  onHover: (key: string | null) => void
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => onHover(p.key)}
      onMouseLeave={() => onHover(null)}
      style={{
        background: '#fff',
        borderRadius: 16,
        border: `1.5px solid ${hovered ? meta.color + '55' : 'var(--border)'}`,
        cursor: 'pointer',
        overflow: 'hidden',
        transition: 'all .22s cubic-bezier(.25,.8,.25,1)',
        display: 'flex',
        flexDirection: 'column',
        transform: hovered ? 'translateY(-3px)' : 'none',
        boxShadow: hovered ? `0 12px 36px ${meta.color}18, 0 4px 12px rgba(0,0,0,0.06)` : '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
      {/* Image area */}
      <div style={{
        height: 176,
        background: hovered ? meta.bg : 'var(--surface)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        transition: 'background .22s',
      }}>
        {/* Top accent line */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: hovered ? meta.color : 'transparent', transition: 'background .22s' }} />

        {p.badge && (
          <div style={{
            position: 'absolute', top: 14, left: 14,
            padding: '3px 10px', borderRadius: 6,
            fontSize: 10.5, fontWeight: 700, letterSpacing: '0.3px',
            background: p.badge.type === 'eco' ? '#065f46' : meta.color,
            color: '#fff',
          }}>
            {p.badge.label}
          </div>
        )}

        <div style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)', transition: 'transform .3s cubic-bezier(.25,.8,.25,1)' }}>
          {p.svg ?? (
            <svg viewBox="0 0 80 80" fill="none" style={{ width: 64, opacity: 0.25 }}>
              <rect x="10" y="24" width="60" height="46" rx="3" stroke="#888" strokeWidth="1.5"/>
              <polygon points="10,24 40,10 70,24 40,38" stroke="#888" strokeWidth="1.5"/>
            </svg>
          )}
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 18px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: meta.color, marginBottom: 5 }}>{p.cat}</div>
        <div style={{ fontSize: 15.5, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.3px', marginBottom: 7, lineHeight: 1.3 }}>{p.name}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ink-4)', lineHeight: 1.6, marginBottom: 14, flex: 1 }}>{p.desc}</div>

        {/* Footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)' }}>da </span>
              <span style={{ fontSize: 21, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.5px', lineHeight: 1 }}>€{fmt(p.price)}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 500 }}>/pz</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--ink-5)', marginTop: 2 }}>MOQ {p.moq} pz</div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onClick() }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 15px',
              background: hovered ? meta.color : 'var(--surface)',
              color: hovered ? '#fff' : 'var(--ink-3)',
              border: `1.5px solid ${hovered ? meta.color : 'var(--border-2)'}`,
              borderRadius: 9, fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: 700,
              cursor: 'pointer', transition: 'all .2s', flexShrink: 0,
            }}
          >
            Configura
            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 16 16" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
