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

function StatCard({ icon, value, label, bg }: { icon: React.ReactNode; value: React.ReactNode; label: string; bg: string }) {
  return (
    <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: 20, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.8px', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 5 }}>{label}</div>
      </div>
    </div>
  )
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
      if (custResult.status === 'fulfilled') setCustomers(custResult.value.count ?? 0)
      if (ordersResult.status === 'fulfilled') {
        const orders = (ordersResult.value.data || []) as Order[]
        setPending(orders.filter(o => o.status === 'pending').length)
        setRevenue(orders.reduce((s, o) => s + (o.total || 0), 0))
        setRecentOrders(orders.slice(0, 8))
      }
      setLoading(false)
    })()
  }, [])

  return (
    <div style={{ padding: '28px 32px' }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Dashboard</div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>Panoramica generale Briopack</div>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard
          bg="var(--accent-bg)"
          value={PRODUCTS.length}
          label="Prodotti catalogo"
          icon={<svg width="18" height="18" fill="none" stroke="var(--accent)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 20 20"><path d="M17 6L10 2 3 6v8l7 4 7-4V6z"/><path d="M10 2v10M3 6l7 4 7-4"/></svg>}
        />
        <StatCard
          bg="var(--yellow-bg)"
          value={loading ? '—' : pending}
          label="Ordini in attesa"
          icon={<svg width="18" height="18" fill="none" stroke="var(--yellow)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/><path d="M10 6v4l2.5 2.5"/></svg>}
        />
        <StatCard
          bg="var(--blue-bg)"
          value={loading ? '—' : customers}
          label="Clienti registrati"
          icon={<svg width="18" height="18" fill="none" stroke="var(--blue)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 20 20"><circle cx="7.5" cy="6" r="3.5"/><path d="M1 18c0-3.5 2.9-6 6.5-6s6.5 2.5 6.5 6"/><path d="M13 2c2 0 3.5 1.5 3.5 3.5S15 9 13 9"/><path d="M19 18c0-2.5-1.5-4.5-4-5.5"/></svg>}
        />
        <StatCard
          bg="var(--green-bg)"
          value={loading ? '—' : `€${revenue.toFixed(0)}`}
          label="Ricavi totali"
          icon={<svg width="18" height="18" fill="none" stroke="var(--green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 20 20"><circle cx="10" cy="10" r="8"/><path d="M10 5v10M7 7.5C7 6.1 8.3 5 10 5s3 1.1 3 2.5-1.3 2.5-3 2.5c-1.7 0-3 1.1-3 2.5S8.3 15 10 15s3-1.1 3-2.5"/></svg>}
        />
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
              <svg width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" style={{ opacity: 0.3, marginBottom: 10 }}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.8 19.8 0 01-8.63-3.07A19.5 19.5 0 013.95 11 19.8 19.8 0 01.88 2.38 2 2 0 012.86.22h3a2 2 0 012 1.72 12.8 12.8 0 00.7 2.81 2 2 0 01-.45 2.11L7.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.8 12.8 0 002.81.7A2 2 0 0122 14.92v2z"/></svg>
              <p style={{ fontSize: 13.5, margin: 0, fontWeight: 500, color: 'var(--ink-3)' }}>Nessun ordine ancora</p>
              <p style={{ fontSize: 12, margin: '5px 0 0', color: 'var(--ink-5)' }}>Gli ordini appariranno qui in tempo reale.</p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead><tr>
                {['ID', 'Cliente', 'Stato', 'Totale'].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr></thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td style={tdStyle}><span style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 4 }}>#{o.id.slice(0, 8).toUpperCase()}</span></td>
                    <td style={{ ...tdStyle, fontSize: 13 }}>{o.shipping_name || '—'}</td>
                    <td style={tdStyle}><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap', ...(STATUS_STYLE[o.status] || { background: 'var(--surface-2)', color: 'var(--ink-3)' }) }}>{STATUS_LABEL[o.status] || o.status}</span></td>
                    <td style={{ ...tdStyle, fontWeight: 600 }}>€{(o.total || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Catalog */}
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Catalogo prodotti</div>
            <Link href="/admin/products" style={{ fontSize: 12.5, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Gestisci →</Link>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>
              {['Prodotto', 'Categoria', 'Da', 'MOQ'].map(h => <th key={h} style={thStyle}>{h}</th>)}
            </tr></thead>
            <tbody>
              {PRODUCTS.map(p => (
                <tr key={p.key}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  style={{ transition: 'background .15s' }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>
                    <Link href={`/products/${p.key}`} target="_blank" style={{ color: 'inherit', textDecoration: 'none' }}>{p.name}</Link>
                    {p.badge && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 4, background: p.badge.type === 'eco' ? 'var(--green-bg)' : 'var(--accent-bg)', color: p.badge.type === 'eco' ? 'var(--green)' : 'var(--accent)' }}>{p.badge.label}</span>}
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12.5 }}><span style={{ background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 4, color: 'var(--ink-3)', fontSize: 11.5 }}>{p.cat}</span></td>
                  <td style={{ ...tdStyle, fontWeight: 500 }}>€{p.price.toFixed(2)}</td>
                  <td style={{ ...tdStyle, color: 'var(--ink-3)' }}>{p.moq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
