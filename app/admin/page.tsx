'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PRODUCTS } from '@/lib/products'

interface Order {
  id: string
  created_at: string
  total: number | null
  status: string
  shipping_name?: string | null
}

const STATUS_LABEL: Record<string, string> = {
  pending:    'In attesa',
  confirmed:  'Confermato',
  processing: 'In lavorazione',
  shipped:    'Spedito',
  delivered:  'Consegnato',
  cancelled:  'Annullato',
}

const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  pending:    { background: 'var(--yellow-bg)', color: 'var(--yellow)' },
  confirmed:  { background: 'var(--blue-bg)',   color: 'var(--blue)' },
  processing: { background: 'var(--blue-bg)',   color: 'var(--blue)' },
  shipped:    { background: 'var(--accent-bg)', color: 'var(--accent)' },
  delivered:  { background: 'var(--green-bg)',  color: 'var(--green)' },
  cancelled:  { background: 'var(--red-bg)',    color: 'var(--red)' },
}

const thStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase',
  color: 'var(--ink-4)', padding: '10px 16px', textAlign: 'left',
  borderBottom: '1px solid var(--border)', background: 'var(--surface)',
}
const tdStyle: React.CSSProperties = {
  padding: '11px 16px', fontSize: 13.5, color: 'var(--ink-2)',
  borderBottom: '1px solid var(--border)', verticalAlign: 'middle',
}

export default function AdminDashboardPage() {
  const sb = createClient()

  const [customers, setCustomers] = useState(0)
  const [pending, setPending]     = useState(0)
  const [revenue, setRevenue]     = useState(0)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [custResult, ordersResult] = await Promise.allSettled([
        sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
        sb.from('orders').select('id,created_at,total,status,shipping_name').order('created_at', { ascending: false }),
      ])

      if (custResult.status === 'fulfilled') {
        setCustomers(custResult.value.count ?? 0)
      }

      if (ordersResult.status === 'fulfilled') {
        const orders = (ordersResult.value.data || []) as Order[]
        setPending(orders.filter(o => o.status === 'pending').length)
        setRevenue(orders.reduce((s, o) => s + (o.total || 0), 0))
        setRecentOrders(orders.slice(0, 8))
      }

      setLoading(false)
    })()
  }, [])

  const statCards = [
    { icon: '📦', val: PRODUCTS.length,                        lbl: 'Prodotti catalogo',  bg: 'var(--accent-bg)' },
    { icon: '🕐', val: loading ? '…' : pending,               lbl: 'Ordini in attesa',   bg: 'var(--yellow-bg)' },
    { icon: '👥', val: loading ? '…' : customers,             lbl: 'Clienti registrati', bg: 'var(--blue-bg)' },
    { icon: '💰', val: loading ? '…' : `€${revenue.toFixed(2)}`, lbl: 'Ricavi totali',   bg: 'var(--green-bg)' },
  ]

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Dashboard</div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>Panoramica generale Briopack</div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {statCards.map((s, i) => (
          <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 'var(--r-lg)', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.8px', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>{s.lbl}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recent orders */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Ultimi ordini</div>
            <Link href="/admin/orders" style={{ fontSize: 12.5, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Vedi tutti →</Link>
          </div>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center' }}><span className="spinner" /></div>
          ) : recentOrders.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-4)' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
              <p style={{ fontSize: 13.5, margin: 0 }}>Nessun ordine ancora.</p>
              <p style={{ fontSize: 12, marginTop: 6, color: 'var(--ink-5)' }}>Gli ordini appariranno qui una volta che i clienti inizieranno ad acquistare.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Cliente</th>
                  <th style={thStyle}>Stato</th>
                  <th style={thStyle}>Totale</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td style={tdStyle}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 4 }}>#{o.id.slice(0, 8).toUpperCase()}</span>
                    </td>
                    <td style={{ ...tdStyle, fontSize: 13 }}>{o.shipping_name || '—'}</td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap', ...(STATUS_STYLE[o.status] || { background: 'var(--surface-2)', color: 'var(--ink-3)' }) }}>
                        {STATUS_LABEL[o.status] || o.status}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>€{(o.total || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Catalog products */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Catalogo prodotti</div>
            <Link href="/admin/products" style={{ fontSize: 12.5, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Vedi tutti →</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>Prodotto</th>
                <th style={thStyle}>Categoria</th>
                <th style={thStyle}>Da</th>
                <th style={thStyle}>MOQ</th>
              </tr>
            </thead>
            <tbody>
              {PRODUCTS.map(p => (
                <tr key={p.key}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  style={{ transition: 'background .15s' }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    <Link href={`/products/${p.key}`} target="_blank" style={{ color: 'inherit', textDecoration: 'none' }}>
                      {p.name}
                      {p.badge && (
                        <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: p.badge.type === 'eco' ? 'var(--green-bg)' : 'var(--accent-bg)', color: p.badge.type === 'eco' ? 'var(--green)' : 'var(--accent)' }}>
                          {p.badge.label}
                        </span>
                      )}
                    </Link>
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12.5 }}>
                    <span style={{ background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4, color: 'var(--ink-3)', fontSize: 11.5 }}>{p.cat}</span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>€{p.price.toFixed(2)}</td>
                  <td style={{ ...tdStyle, color: 'var(--ink-3)' }}>{p.moq} pz</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
