'use client'
import Link from 'next/link'
import { PRODUCTS } from '@/lib/products'

const thStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase',
  color: 'var(--ink-4)', padding: '10px 16px', textAlign: 'left',
  borderBottom: '1px solid var(--border)', background: 'var(--surface)',
}
const tdStyle: React.CSSProperties = {
  padding: '13px 16px', fontSize: 13.5, color: 'var(--ink-2)',
  borderBottom: '1px solid var(--border)', verticalAlign: 'middle',
}

export default function ProductsPage() {
  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Prodotti</div>
          <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>Catalogo prodotti Briopack</div>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: '#fff', textDecoration: 'none', padding: '9px 18px', fontFamily: 'var(--f)', fontSize: 13.5, fontWeight: 600, borderRadius: 'var(--r)', cursor: 'pointer' }}>
          ↗ Vai al negozio
        </a>
      </div>

      {/* Info banner */}
      <div style={{ background: 'var(--blue-bg)', border: '1px solid rgba(21,88,176,0.15)', borderRadius: 'var(--r)', padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: 16 }}>ℹ️</span>
        <div style={{ fontSize: 13, color: 'var(--blue)', lineHeight: 1.5 }}>
          I prodotti sono gestiti nel catalogo del sito. Clicca su <strong>Vai al prodotto</strong> per vedere come appare la pagina al cliente.
        </div>
      </div>

      {/* Product table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Prodotti ({PRODUCTS.length})</div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Prodotto', 'Categoria', 'Prezzo base', 'MOQ', 'Badge', 'Pagina prodotto'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PRODUCTS.map(p => (
              <tr key={p.key}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                style={{ transition: 'background .15s' }}>
                <td style={{ ...tdStyle, fontWeight: 600 }}>
                  <div>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-4)', fontFamily: 'monospace', marginTop: 2 }}>{p.key}</div>
                </td>
                <td style={tdStyle}>
                  <span style={{ background: 'var(--surface-2)', padding: '3px 9px', borderRadius: 4, color: 'var(--ink-3)', fontSize: 12 }}>{p.cat}</span>
                </td>
                <td style={{ ...tdStyle, fontWeight: 600 }}>
                  €{p.price.toFixed(2)}
                  <span style={{ color: 'var(--ink-4)', fontSize: 11, fontWeight: 400 }}>/pz</span>
                </td>
                <td style={{ ...tdStyle, color: 'var(--ink-3)' }}>{p.moq} pz</td>
                <td style={tdStyle}>
                  {p.badge ? (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.4px', background: p.badge.type === 'eco' ? 'var(--green-bg)' : 'var(--accent-bg)', color: p.badge.type === 'eco' ? 'var(--green)' : 'var(--accent)' }}>
                      {p.badge.label}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--ink-5)', fontSize: 12 }}>—</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <Link
                    href={`/products/${p.key}`}
                    target="_blank"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 12px', fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', textDecoration: 'none', background: 'transparent', whiteSpace: 'nowrap' }}>
                    ↗ Vedi pagina
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Description cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginTop: 20 }}>
        {PRODUCTS.map(p => (
          <div key={p.key} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 18 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--ink)', marginBottom: 6 }}>{p.name}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.55 }}>{p.desc}</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>Da €{p.price.toFixed(2)}/pz</span>
              <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>· MOQ {p.moq} pz</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
