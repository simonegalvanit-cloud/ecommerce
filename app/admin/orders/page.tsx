'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CartItem } from '@/lib/cart-context'

interface Order {
  id: string
  created_at: string
  total_eur: number | null
  status: string
  customer_name: string | null
  customer_email: string | null
  customer_phone: string | null
  address: string | null
  city: string | null
  zip: string | null
  province: string | null
  notes: string | null
  stripe_session_id: string | null
  cart_json: CartItem[]
}

const STATUS_LABEL: Record<string, string> = {
  pending:    'In attesa',
  paid:       'Pagato',
  processing: 'In lavorazione',
  shipped:    'Spedito',
  delivered:  'Consegnato',
  cancelled:  'Annullato',
  refunded:   'Rimborsato',
}
const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  pending:    { background: 'var(--yellow-bg)', color: 'var(--yellow)' },
  paid:       { background: 'var(--green-bg)',  color: 'var(--green)' },
  processing: { background: 'var(--blue-bg)',   color: 'var(--blue)' },
  shipped:    { background: 'var(--accent-bg)', color: 'var(--accent)' },
  delivered:  { background: 'var(--green-bg)',  color: 'var(--green)' },
  cancelled:  { background: 'var(--red-bg)',    color: 'var(--red)' },
  refunded:   { background: 'var(--surface-2)', color: 'var(--ink-3)' },
}

const th: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase',
  color: 'var(--ink-4)', padding: '10px 16px', textAlign: 'left',
  borderBottom: '1px solid var(--border)', background: 'var(--surface)',
}
const td: React.CSSProperties = {
  padding: '11px 16px', fontSize: 13.5, color: 'var(--ink-2)',
  borderBottom: '1px solid var(--border)', verticalAlign: 'middle',
}
const inp: React.CSSProperties = {
  padding: '9px 12px', fontFamily: 'var(--f)', fontSize: 13.5,
  color: 'var(--ink)', background: 'var(--surface)', border: '1.5px solid var(--border-2)',
  borderRadius: 'var(--r)', outline: 'none', boxSizing: 'border-box' as const,
}

function fmt(n: number) { return n.toLocaleString('it-IT', { minimumFractionDigits: 2 }) }

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLE[status] || { background: 'var(--surface-2)', color: 'var(--ink-3)' }
  return (
    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.4px', whiteSpace: 'nowrap', ...s }}>
      {STATUS_LABEL[status] || status}
    </span>
  )
}

function exportCSV(orders: Order[], dateFrom: string, dateTo: string) {
  const inRange = orders.filter(o => {
    const d = new Date(o.created_at)
    if (dateFrom && d < new Date(dateFrom)) return false
    if (dateTo   && d > new Date(dateTo + 'T23:59:59')) return false
    return true
  })

  const headers = ['ID', 'Data', 'Cliente', 'Email', 'Telefono', 'Indirizzo', 'Città', 'CAP', 'Prov.', 'Totale EUR', 'Stato', 'Note', 'Prodotti']
  const rows = inRange.map(o => [
    o.id,
    new Date(o.created_at).toLocaleDateString('it-IT'),
    o.customer_name || '',
    o.customer_email || '',
    o.customer_phone || '',
    o.address || '',
    o.city || '',
    o.zip || '',
    o.province || '',
    (o.total_eur || 0).toFixed(2),
    STATUS_LABEL[o.status] || o.status,
    o.notes || '',
    (o.cart_json || []).map(i => `${i.name}${i.size ? ` (${i.size})` : ''} x${i.qty}`).join('; '),
  ])

  const csv = [headers, ...rows]
    .map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `ordini-briopack${dateFrom ? '-dal-' + dateFrom : ''}${dateTo ? '-al-' + dateTo : ''}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function OrdersPage() {
  const sb = createClient()

  const [all, setAll]         = useState<Order[]>([])
  const [filtered, setFiltered] = useState<Order[]>([])
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo]   = useState('')
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const [detail, setDetail] = useState<Order | null>(null)

  useEffect(() => { loadOrders() }, [])

  async function loadOrders() {
    setLoading(true)
    try {
      const { data } = await sb
        .from('orders')
        .select('id,created_at,total_eur,status,customer_name,customer_email,customer_phone,address,city,zip,province,notes,stripe_session_id,cart_json')
        .order('created_at', { ascending: false })
      const list = (data || []) as Order[]
      setAll(list)
      applyFilter(list, search, statusFilter, dateFrom, dateTo)
    } catch { /* table may not exist yet */ }
    setLoading(false)
  }

  function applyFilter(list: Order[], q: string, st: string, from: string, to: string) {
    setFiltered(list.filter(o => {
      if (q && !o.id.toLowerCase().includes(q.toLowerCase()) &&
               !(o.customer_name  || '').toLowerCase().includes(q.toLowerCase()) &&
               !(o.customer_email || '').toLowerCase().includes(q.toLowerCase())) return false
      if (st && o.status !== st) return false
      const d = new Date(o.created_at)
      if (from && d < new Date(from)) return false
      if (to   && d > new Date(to + 'T23:59:59')) return false
      return true
    }))
  }

  function onSearch(v: string) { setSearch(v);       applyFilter(all, v, statusFilter, dateFrom, dateTo) }
  function onStatus(v: string) { setStatusFilter(v); applyFilter(all, search, v, dateFrom, dateTo) }
  function onFrom(v: string)   { setDateFrom(v);     applyFilter(all, search, statusFilter, v, dateTo) }
  function onTo(v: string)     { setDateTo(v);       applyFilter(all, search, statusFilter, dateFrom, v) }

  async function updateStatus(order: Order, status: string) {
    setUpdatingId(order.id)
    try {
      const res = await fetch('/api/admin/order-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId:       order.id,
          status,
          customerEmail: order.customer_email,
          customerName:  order.customer_name,
          orderRef:      order.stripe_session_id || order.id,
        }),
      })
      if (res.ok) {
        const updated = all.map(o => o.id === order.id ? { ...o, status } : o)
        setAll(updated)
        applyFilter(updated, search, statusFilter, dateFrom, dateTo)
        if (detail?.id === order.id) setDetail({ ...detail, status })
      }
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Ordini</div>
          <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>Gestisci e aggiorna gli ordini dei clienti</div>
        </div>
        <button
          onClick={() => exportCSV(filtered, dateFrom, dateTo)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 18px', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600, background: 'var(--white)', color: 'var(--ink-2)', border: '1.5px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Esporta CSV ({filtered.length})
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => onSearch(e.target.value)} placeholder="Cerca nome, email, ID…" style={{ ...inp, flex: '1 1 200px', minWidth: 0 }} />
        <select value={statusFilter} onChange={e => onStatus(e.target.value)} style={{ ...inp, width: 'auto' }}>
          <option value="">Tutti gli stati</option>
          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>Dal</span>
          <input type="date" value={dateFrom} onChange={e => onFrom(e.target.value)} style={{ ...inp, width: 150 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 13, color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>Al</span>
          <input type="date" value={dateTo} onChange={e => onTo(e.target.value)} style={{ ...inp, width: 150 }} />
        </div>
        {(dateFrom || dateTo) && (
          <button onClick={() => { setDateFrom(''); setDateTo(''); applyFilter(all, search, statusFilter, '', '') }}
            style={{ padding: '9px 12px', fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: 600, background: 'transparent', color: 'var(--ink-4)', border: '1.5px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer' }}>
            ✕ Date
          </button>
        )}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>
            {filtered.length} {filtered.length === 1 ? 'ordine' : 'ordini'}
            {(dateFrom || dateTo) && <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--ink-4)', marginLeft: 8 }}>(filtrati per data)</span>}
          </div>
          <button onClick={loadOrders} style={{ padding: '5px 12px', fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: 600, background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer' }}>
            Aggiorna
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" /></div>
        ) : all.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--ink-4)' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-3)', margin: '0 0 6px' }}>Nessun ordine ancora</p>
            <p style={{ fontSize: 13, margin: 0, color: 'var(--ink-4)' }}>Gli ordini appariranno qui dopo il primo pagamento ricevuto.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 14 }}>Nessun risultato.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
              <thead>
                <tr>{['#', 'Cliente', 'Indirizzo', 'Data', 'Totale', 'Stato', 'Azioni'].map(h => <th key={h} style={th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map(o => (
                  <tr key={o.id} style={{ transition: 'background .12s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                    <td style={td}>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, background: 'var(--surface-2)', padding: '2px 7px', borderRadius: 4 }}>
                        {(o.stripe_session_id || o.id).slice(-8).toUpperCase()}
                      </span>
                    </td>
                    <td style={td}>
                      <div style={{ fontWeight: 500 }}>{o.customer_name || '—'}</div>
                      {o.customer_email && <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{o.customer_email}</div>}
                      {o.customer_phone && <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{o.customer_phone}</div>}
                    </td>
                    <td style={{ ...td, fontSize: 12.5, color: 'var(--ink-3)', maxWidth: 200 }}>
                      {o.address ? <>{o.address}<br />{o.zip} {o.city} ({o.province})</> : o.city || '—'}
                    </td>
                    <td style={{ ...td, fontSize: 12.5, color: 'var(--ink-4)', whiteSpace: 'nowrap' }}>
                      {new Date(o.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ ...td, fontWeight: 700 }}>€{fmt(o.total_eur || 0)}</td>
                    <td style={td}><StatusBadge status={o.status} /></td>
                    <td style={td}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <button onClick={() => setDetail(o)}
                          style={{ padding: '5px 12px', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 600, background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                          Dettagli
                        </button>
                        <select
                          value={o.status}
                          disabled={updatingId === o.id}
                          onChange={e => updateStatus(o, e.target.value)}
                          style={{ ...inp, padding: '5px 8px', fontSize: 12, width: 'auto', opacity: updatingId === o.id ? 0.5 : 1 }}>
                          {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div onClick={e => { if (e.target === e.currentTarget) setDetail(null) }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 640, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>

            {/* Modal header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
                  Ordine #{(detail.stripe_session_id || detail.id).slice(-8).toUpperCase()}
                </div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 2 }}>
                  {new Date(detail.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <button onClick={() => setDetail(null)}
                style={{ width: 30, height: 30, border: 'none', background: 'var(--surface-2)', borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)' }}>✕</button>
            </div>

            <div style={{ padding: 24 }}>
              {/* Status row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: '12px 16px', background: 'var(--surface)', borderRadius: 'var(--r)' }}>
                <StatusBadge status={detail.status} />
                <select
                  value={detail.status}
                  disabled={updatingId === detail.id}
                  onChange={e => updateStatus(detail, e.target.value)}
                  style={{ ...inp, padding: '6px 10px', fontSize: 13, width: 'auto', opacity: updatingId === detail.id ? 0.5 : 1 }}>
                  {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>

              {/* Customer info */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Cliente</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { lbl: 'Nome', val: detail.customer_name || '—' },
                    { lbl: 'Email', val: detail.customer_email || '—' },
                    { lbl: 'Telefono', val: detail.customer_phone || '—' },
                    { lbl: 'Totale', val: `€${fmt(detail.total_eur || 0)}` },
                  ].map(({ lbl, val }) => (
                    <div key={lbl} style={{ background: 'var(--surface)', borderRadius: 8, padding: '10px 14px' }}>
                      <div style={{ fontSize: 11, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 3 }}>{lbl}</div>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping address */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Indirizzo di consegna</div>
                <div style={{ background: 'var(--surface)', borderRadius: 8, padding: '14px 16px', fontSize: 14, color: 'var(--ink)', lineHeight: 1.7 }}>
                  {detail.address || '—'}<br />
                  {detail.zip} {detail.city} ({detail.province})
                </div>
                {detail.notes && (
                  <div style={{ marginTop: 8, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#92400e', lineHeight: 1.6 }}>
                    📝 <strong>Note:</strong> {detail.notes}
                  </div>
                )}
              </div>

              {/* Cart items */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Prodotti ordinati</div>
                {(!detail.cart_json || detail.cart_json.length === 0) ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'var(--ink-4)', fontSize: 13.5, background: 'var(--surface)', borderRadius: 8 }}>
                    Nessun dettaglio prodotto disponibile.
                  </div>
                ) : (
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        {['Prodotto', 'Q.tà', 'Prezzo unit.', 'Totale'].map(h => (
                          <th key={h} style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--ink-4)', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {detail.cart_json.map((item, i) => (
                        <tr key={i}>
                          <td style={{ padding: '10px 12px', fontSize: 13.5, borderBottom: '1px solid var(--border)', fontWeight: 500 }}>
                            {item.name}
                            {item.size && <span style={{ fontSize: 12, color: 'var(--ink-4)', marginLeft: 6 }}>· {item.size}</span>}
                          </td>
                          <td style={{ padding: '10px 12px', fontSize: 13.5, borderBottom: '1px solid var(--border)' }}>{item.qty.toLocaleString('it-IT')} pz</td>
                          <td style={{ padding: '10px 12px', fontSize: 13.5, borderBottom: '1px solid var(--border)' }}>€{fmt(item.unitPrice)}</td>
                          <td style={{ padding: '10px 12px', fontSize: 13.5, borderBottom: '1px solid var(--border)', fontWeight: 700 }}>
                            €{fmt(item.unitPrice * item.qty + item.setupCost)}
                            {item.setupCost > 0 && <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 400 }}>+ €{fmt(item.setupCost)} avv. stampa</div>}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={3} style={{ padding: '12px 12px', fontWeight: 700, textAlign: 'right', borderTop: '2px solid var(--border)', fontSize: 14 }}>Totale ordine</td>
                        <td style={{ padding: '12px 12px', fontWeight: 800, fontSize: 15, color: 'var(--accent)', borderTop: '2px solid var(--border)' }}>€{fmt(detail.total_eur || 0)}</td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div style={{ padding: '14px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setDetail(null)}
                style={{ padding: '9px 18px', fontFamily: 'var(--f)', fontSize: 13.5, fontWeight: 600, background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer' }}>
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
