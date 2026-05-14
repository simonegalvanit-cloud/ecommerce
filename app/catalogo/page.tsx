'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NavWrapper from '@/components/NavWrapper'
import CartDrawer from '@/components/CartDrawer'
import { PRODUCTS, CATEGORIES } from '@/lib/products'

function fmt(n: number) {
  return n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const CAT_DESCRIPTIONS: Record<string, string> = {
  industrial: 'Scatole americane, americane rinforzate e imballaggi ondulati per ogni esigenza industriale e logistica.',
  shopper:    'Shopper in carta, buste e packaging di cartotecnica con stampa professionale per il retail.',
  wine:       'Scatole porta-bottiglie con separatori alveare, da 1 a 6 posti, personalizzabili per cantine e distributrici.',
  food:       'Packaging certificato per il contatto alimentare: pizza, delivery, take away e prodotti food-grade.',
  eco:        'Linea BrioGreenPack: materiali 100% riciclati o biodegradabili, con le stesse performance del prodotto standard.',
  ecom:       'Scatole mailer, imbottite e self-seal ideali per e-commerce e spedizioni corriere.',
}

export default function CatalogoPage() {
  const router = useRouter()
  const [activeCat, setActiveCat] = useState('all')
  const [search, setSearch] = useState('')

  const visibleCats = activeCat === 'all'
    ? CATEGORIES.filter(c => c.key !== 'all')
    : CATEGORIES.filter(c => c.key === activeCat)

  const filtered = (catKey: string) =>
    PRODUCTS.filter(p =>
      p.catKey === catKey &&
      (!search || p.name.toLowerCase().includes(search.toLowerCase()) || p.desc.toLowerCase().includes(search.toLowerCase()))
    )

  return (
    <>
      <NavWrapper activeLink="catalogo" />
      <CartDrawer />

      {/* ── Page header ── */}
      <div style={{ background: 'linear-gradient(135deg,#c45a14 0%,#e8721a 40%,#f08a3a 70%,#f5a05a 100%)', paddingTop: 'var(--nav-h)', position: 'relative', overflow: 'hidden' }}>
        {/* White highlight top-right */}
        <div style={{ position: 'absolute', top: -100, right: -80, width: 600, height: 400, background: 'radial-gradient(ellipse,rgba(255,255,255,0.18) 0%,transparent 65%)', filter: 'blur(30px)', pointerEvents: 'none' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle,rgba(255,255,255,0.15) 1px,transparent 1px)', backgroundSize: '36px 36px', opacity: 0.45, pointerEvents: 'none' }} />
        {/* Dark depth bottom-left */}
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 400, height: 300, background: 'radial-gradient(ellipse,rgba(0,0,0,0.18) 0%,transparent 65%)', filter: 'blur(40px)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '64px 40px 60px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 100, padding: '5px 14px', marginBottom: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', display: 'inline-block' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.85)', letterSpacing: '0.3px' }}>Catalogo completo</span>
          </div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,56px)', fontWeight: 900, color: '#fff', letterSpacing: '-2px', lineHeight: 1.05, margin: '0 0 16px', textShadow: '0 2px 16px rgba(0,0,0,0.15)' }}>
            Tutti i nostri prodotti
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.78)', lineHeight: 1.7, maxWidth: 500, margin: 0 }}>
            Packaging personalizzato per ogni settore. Scegli la categoria, configura le specifiche e ordina online.
          </p>
        </div>
      </div>

      {/* ── Sticky filter bar ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '16px 40px', position: 'sticky', top: 'var(--nav-h)', zIndex: 200, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1.5px solid var(--border-2)', borderRadius: 100, padding: '7px 7px 7px 18px', flex: '1 1 260px', maxWidth: 400, transition: 'all .2s' }}
          onFocus={() => {}} >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" style={{ color: 'var(--ink-4)', flexShrink: 0 }}><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input
            type="text" placeholder="Cerca prodotto…" value={search} onChange={e => setSearch(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontFamily: 'var(--f)', fontSize: 14, color: 'var(--ink)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'var(--surface-3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          )}
        </div>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
          {CATEGORIES.map(c => {
            const count = c.key === 'all' ? PRODUCTS.length : PRODUCTS.filter(p => p.catKey === c.key).length
            const active = activeCat === c.key
            return (
              <button key={c.key} onClick={() => setActiveCat(c.key)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, fontFamily: 'var(--f)', border: `1.5px solid ${active ? 'var(--accent)' : 'var(--border-2)'}`, background: active ? 'var(--accent)' : 'transparent', color: active ? '#fff' : 'var(--ink-4)', cursor: 'pointer', transition: 'all .2s', boxShadow: active ? '0 4px 14px rgba(232,114,26,0.28)' : 'none' }}>
                {c.label}
                <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 100, background: active ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.07)' }}>{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Category sections ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 40px 96px' }}>
        {visibleCats.map((cat, catIdx) => {
          const products = filtered(cat.key)
          if (products.length === 0) return null
          return (
            <div key={cat.key} style={{ marginBottom: catIdx < visibleCats.length - 1 ? 72 : 0 }}>
              {/* Category header */}
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 6, padding: '3px 10px', marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.4px', textTransform: 'uppercase' }}>{products.length} prodott{products.length === 1 ? 'o' : 'i'}</span>
                  </div>
                  <h2 style={{ fontSize: 'clamp(22px,3vw,28px)', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.8px', margin: '0 0 8px' }}>{cat.label}</h2>
                  <p style={{ fontSize: 14, color: 'var(--ink-4)', margin: 0, lineHeight: 1.6, maxWidth: 480 }}>{CAT_DESCRIPTIONS[cat.key] || ''}</p>
                </div>
              </div>

              {/* Product grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px,1fr))', gap: 20 }}>
                {products.map(p => (
                  <div key={p.key}
                    onClick={() => router.push(`/products/${p.key}`)}
                    style={{ background: '#fff', borderRadius: 16, border: '1px solid var(--border)', cursor: 'pointer', overflow: 'hidden', transition: 'all .25s var(--ease-out)', display: 'flex', flexDirection: 'column' }}
                    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 16px 40px rgba(0,0,0,0.10)'; el.style.borderColor = 'var(--accent-border)' }}
                    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = ''; el.style.borderColor = 'var(--border)' }}>

                    {/* Image area */}
                    <div style={{ height: 160, background: p.catKey === 'eco' ? '#edf3ee' : 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      {p.badge && (
                        <div style={{ position: 'absolute', top: 12, left: 12, padding: '3px 9px', borderRadius: 6, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.3px', background: p.badge.type === 'eco' ? '#2d5a3d' : 'var(--accent)', color: '#fff' }}>
                          {p.badge.label}
                        </div>
                      )}
                      {p.svg ?? (
                        <svg viewBox="0 0 80 80" fill="none" style={{ width: 72, opacity: 0.3 }}>
                          <rect x="10" y="24" width="60" height="46" rx="3" stroke="#888" strokeWidth="1.5"/>
                          <polygon points="10,24 40,10 70,24 40,38" stroke="#888" strokeWidth="1.5"/>
                        </svg>
                      )}
                    </div>

                    {/* Body */}
                    <div style={{ padding: '18px 20px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>{p.cat}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.3px', marginBottom: 8, lineHeight: 1.3 }}>{p.name}</div>
                      <div style={{ fontSize: 13, color: 'var(--ink-4)', lineHeight: 1.6, marginBottom: 16, flex: 1 }}>{p.desc}</div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.5px' }}>
                            <sup style={{ fontSize: 12, fontWeight: 700, verticalAlign: 'super' }}>€</sup>{fmt(p.price)}<sub style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 500 }}> / pz</sub>
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--ink-5)', marginTop: 1 }}>MOQ {p.moq} pz</div>
                        </div>
                        <button
                          onClick={e => { e.stopPropagation(); router.push(`/products/${p.key}`) }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 16px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 9, fontFamily: 'var(--f)', fontSize: 13, fontWeight: 700, cursor: 'pointer', transition: 'all .2s', boxShadow: '0 3px 12px rgba(232,114,26,0.3)' }}>
                          Configura
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.3" viewBox="0 0 16 16" strokeLinecap="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Empty state */}
        {visibleCats.every(c => filtered(c.key).length === 0) && (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', marginBottom: 8 }}>Nessun prodotto trovato</div>
            <div style={{ fontSize: 14, color: 'var(--ink-4)', marginBottom: 24 }}>Prova con un&apos;altra parola chiave</div>
            <button onClick={() => setSearch('')} style={{ padding: '11px 24px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--r)', fontFamily: 'var(--f)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              Mostra tutto
            </button>
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer style={{ background: 'var(--surface-2)', borderTop: '1px solid var(--border)', padding: '28px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
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
