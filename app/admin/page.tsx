'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Order {
  id: string
  created_at: string
  total: number | null
  status: string
}

interface Product {
  id: string
  name: string
  price: number
  active: boolean
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'In attesa',
  confirmed: 'Confermato',
  processing: 'In lavorazione',
  shipped: 'Spedito',
  delivered: 'Consegnato',
  cancelled: 'Annullato',
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

  const [products, setProducts] = useState<number>(0)
  const [pending, setPending]   = useState<number>(0)
  const [customers, setCustomers] = useState<number>(0)
  const [revenue, setRevenue]   = useState<number>(0)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [topProducts, setTopProducts]   = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const [
        { count: prodCount },
        { count: custCount },
        { data: orders },
        { data: prods },
      ] = await Promise.all([
        sb.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
        sb.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer'),
        sb.from('orders').select('id,created_at,total,status').order('created_at', { ascending: false }),
        sb.from('products').select('id,name,price,active').order('created_at', { ascending: false }).limit(6),
      ])

      const allOrders = (orders || []) as Order[]
      setProducts(prodCount ?? 0)
      setCustomers(custCount ?? 0)
      setPending(allOrders.filter(o => o.status === 'pending').length)
      setRevenue(allOrders.reduce((s, o) => s + (o.total || 0), 0))
      setRecentOrders(allOrders.slice(0, 8))
      setTopProducts((prods || []) as Product[])
      setLoading(false)
    })()
  }, [])

  const statCards = [
    { icon: '📦', val: loading ? '…' : products,           lbl: 'Prodotti attivi',    bg: 'var(--accent-bg)' },
    { icon: '🕐', val: loading ? '…' : pending,            lbl: 'Ordini in attesa',   bg: 'var(--yellow-bg)' },
    { icon: '👥', val: loading ? '…' : customers,          lbl: 'Clienti registrati', bg: 'var(--blue-bg)' },
    { icon: '💰', val: loading ? '…' : `€${revenue.toFixed(2)}`, lbl: 'Ricavi totali',   bg: 'var(--green-bg)' },
  ]

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Topbar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Dashboard</div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>Panoramica generale</div>
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
              <p style={{ fontSize: 13.5 }}>Nessun ordine ancora.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
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
                    <td style={tdStyle}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.4px', ...(STATUS_STYLE[o.status] || { background: 'var(--surface-2)', color: 'var(--ink-3)' }) }}>
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

        {/* Top products */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Prodotti recenti</div>
            <Link href="/admin/products" style={{ fontSize: 12.5, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Vedi tutti →</Link>
          </div>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center' }}><span className="spinner" /></div>
          ) : topProducts.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-4)' }}>
              <p style={{ fontSize: 13.5 }}>Nessun prodotto.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}>Prodotto</th>
                  <th style={thStyle}>Prezzo</th>
                  <th style={thStyle}>Stato</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map(p => (
                  <tr key={p.id}>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>{p.name}</td>
                    <td style={tdStyle}>€{Number(p.price).toFixed(2)}</td>
                    <td style={tdStyle}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.4px', background: p.active ? 'var(--green-bg)' : 'var(--surface-2)', color: p.active ? 'var(--green)' : 'var(--ink-3)' }}>
                        {p.active ? 'Attivo' : 'Off'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
