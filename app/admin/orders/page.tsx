'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Order {
  id: string
  created_at: string
  total_eur: number | null
  status: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  city: string | null
  address: string | null
  zip: string | null
  province: string | null
  notes: string | null
  stripe_session_id: string | null
}

interface OrderItem {
  id: string
  product_name: string
  quantity: number
  unit_price: number
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
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '9px 12px', fontFamily: 'var(--f)', fontSize: 14,
  color: 'var(--ink)', background: 'var(--surface)', border: '1.5px solid var(--border-2)',
  borderRadius: 'var(--r)', outline: 'none', boxSizing: 'border-box',
}

export default function OrdersPage() {
  const sb = createClient()

  const [all, setAll]           = useState<Order[]>([])
  const [filtered, setFiltered] = useState<Order[]>([])
  const [search, setSearch]     = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading]   = useState(true)

  const [detailOrder, setDetailOrder]   = useState<Order | null>(null)
  const [detailItems, setDetailItems]   = useState<OrderItem[]>([])
  const [loadingItems, setLoadingItems] = useState(false)

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    setLoading(true)
    try {
      const { data } = await sb
        .from('orders')
        .select('id,created_at,total_eur,status,customer_name,customer_email,customer_phone,city,address,zip,province,notes,stripe_session_id')
        .order('created_at', { ascending: false })
      const list = (data || []) as Order[]
      setAll(list)
      applyFilter(list, search, statusFilter)
    } catch {
      // table may not exist yet
    }
    setLoading(false)
  }

  function applyFilter(list: Order[], q: string, st: string) {
    const f = list.filter(o =>
      (!q  || o.id.toLowerCase().includes(q.toLowerCase()) ||
              (o.customer_name  || '').toLowerCase().includes(q.toLowerCase()) ||
              (o.customer_email || '').toLowerCase().includes(q.toLowerCase())) &&
      (!st || o.status === st)
    )
    setFiltered(f)
  }

  function handleSearch(v: string) { setSearch(v);       applyFilter(all, v, statusFilter) }
  function handleStatus(v: string) { setStatusFilter(v); applyFilter(all, search, v) }

  async function updateStatus(id: string, status: string) {
    await sb.from('orders').update({ status, updated_at: new Date().toISOString() }).eq('id', id)
    const updated = all.map(o => o.id === id ? { ...o, status } : o)
    setAll(updated)
    applyFilter(updated, search, statusFilter)
  }

  async function openDetail(order: Order) {
    setDetailOrder(order)
    setLoadingItems(true)
    try {
      const { data } = await sb.from('order_items').select('*').eq('order_id', order.id)
      setDetailItems((data || []) as OrderItem[])
    } catch {
      setDetailItems([])
    }
    setLoadingItems(false)
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Ordini</div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>Visualizza e aggiorna gli ordini dei clienti</div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Cerca per ID, nome o email…" style={{ ...inputStyle, flex: 1 }} />
        <select value={statusFilter} onChange={e => handleStatus(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 180 }}>
          <option value="">Tutti gli stati</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Ordini ({filtered.length})</div>
        </div>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" /></div>
        ) : all.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--ink-4)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-3)', margin: '0 0 6px' }}>Nessun ordine ancora</p>
            <p style={{ fontSize: 13, margin: 0, maxWidth: 340, marginLeft: 'auto', marginRight: 'auto' }}>
              Quando i clienti effettuano un ordine tramite il checkout, appariranno qui in tempo reale.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-4)' }}>
            <p style={{ fontSize: 14 }}>Nessun risultato per questa ricerca.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['ID', 'Cliente', 'Città', 'Data', 'Totale', 'Stato', 'Azioni'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <tr key={o.id}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  style={{ transition: 'background .15s' }}>
                  <td style={tdStyle}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 4 }}>#{o.id.slice(0, 8).toUpperCase()}</span>
                  </td>
                  <td style={{ ...tdStyle }}>
                    <div style={{ fontWeight: 500 }}>{o.customer_name || '—'}</div>
                    {o.customer_email && <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{o.customer_email}</div>}
                  </td>
                  <td style={{ ...tdStyle, color: 'var(--ink-3)' }}>{o.city || '—'}</td>
                  <td style={{ ...tdStyle, fontSize: 12.5, color: 'var(--ink-4)' }}>
                    {new Date(o.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>€{(o.total_eur || 0).toFixed(2)}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap', ...(STATUS_STYLE[o.status] || { background: 'var(--surface-2)', color: 'var(--ink-3)' }) }}>
                      {STATUS_LABEL[o.status] || o.status}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <button onClick={() => openDetail(o)} style={{ padding: '5px 12px', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 600, background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer', whiteSpace: 'nowrap' }}>Dettagli</button>
                      <select
                        defaultValue={o.status}
                        onChange={e => updateStatus(o.id, e.target.value)}
                        style={{ padding: '5px 8px', fontFamily: 'var(--f)', fontSize: 12, background: 'var(--surface)', border: '1.5px solid var(--border-2)', borderRadius: 'var(--r)', outline: 'none', color: 'var(--ink)', cursor: 'pointer' }}>
                        {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {detailOrder && (
        <div onClick={e => { if (e.target === e.currentTarget) setDetailOrder(null) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Ordine #{detailOrder.id.slice(0, 8).toUpperCase()}</div>
              <button onClick={() => setDetailOrder(null)} style={{ width: 30, height: 30, border: 'none', background: 'var(--surface-2)', borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)' }}>✕</button>
            </div>
            <div style={{ padding: 24 }}>
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 20 }}>
                {[
                  { lbl: 'Cliente', val: detailOrder.customer_name || '—' },
                  { lbl: 'Email', val: detailOrder.customer_email || '—' },
                  { lbl: 'Città', val: detailOrder.city || '—' },
                  { lbl: 'Data', val: new Date(detailOrder.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }) },
                  { lbl: 'Totale', val: `€${(detailOrder.total_eur || 0).toFixed(2)}` },
                ].map(item => (
                  <div key={item.lbl}>
                    <div style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>{item.lbl}</div>
                    <div style={{ fontWeight: 600, fontSize: 13.5 }}>{item.val}</div>
                  </div>
                ))}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>Stato</div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.4px', ...(STATUS_STYLE[detailOrder.status] || { background: 'var(--surface-2)', color: 'var(--ink-3)' }) }}>
                    {STATUS_LABEL[detailOrder.status] || detailOrder.status}
                  </span>
                </div>
              </div>

              {detailOrder.notes && (
                <div style={{ background: 'var(--surface-2)', padding: '10px 14px', borderRadius: 'var(--r)', fontSize: 13, marginBottom: 16, color: 'var(--ink-3)' }}>
                  📝 {detailOrder.notes}
                </div>
              )}

              <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 13.5 }}>Articoli ordinati</div>
              {loadingItems ? (
                <div style={{ padding: 24, textAlign: 'center' }}><span className="spinner" /></div>
              ) : detailItems.length === 0 ? (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-4)', fontSize: 13.5, background: 'var(--surface)', borderRadius: 'var(--r)' }}>
                  Nessun articolo disponibile.
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Prodotto', 'Q.tà', 'Prezzo unit.', 'Subtotale'].map(h => (
                        <th key={h} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--ink-4)', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detailItems.map(item => (
                      <tr key={item.id}>
                        <td style={{ padding: '10px 12px', fontSize: 13.5, borderBottom: '1px solid var(--border)', fontWeight: 500 }}>{item.product_name}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13.5, borderBottom: '1px solid var(--border)' }}>{item.quantity}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13.5, borderBottom: '1px solid var(--border)' }}>€{Number(item.unit_price).toFixed(2)}</td>
                        <td style={{ padding: '10px 12px', fontSize: 13.5, borderBottom: '1px solid var(--border)', fontWeight: 600 }}>€{(item.quantity * item.unit_price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setDetailOrder(null)} style={{ padding: '9px 18px', fontFamily: 'var(--f)', fontSize: 13.5, fontWeight: 600, background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer' }}>Chiudi</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
