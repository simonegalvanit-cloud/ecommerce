'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Customer {
  email: string
  name: string | null
  phone: string | null
  city: string | null
  first_order: string
  order_count: number
  total_spent: number
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

export default function CustomersPage() {
  const sb = createClient()

  const [all, setAll]           = useState<Customer[]>([])
  const [filtered, setFiltered] = useState<Customer[]>([])
  const [search, setSearch]     = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => { loadCustomers() }, [])

  async function loadCustomers() {
    setLoading(true)
    const { data } = await sb
      .from('orders')
      .select('customer_email,customer_name,customer_phone,city,created_at,total_eur,status')
      .not('customer_email', 'is', null)
      .order('created_at', { ascending: false })

    const rows = data || []
    const map = new Map<string, Customer>()
    for (const o of rows) {
      const email = o.customer_email as string
      if (!email) continue
      if (!map.has(email)) {
        map.set(email, {
          email,
          name:        o.customer_name || null,
          phone:       o.customer_phone || null,
          city:        o.city || null,
          first_order: o.created_at,
          order_count: 0,
          total_spent: 0,
        })
      }
      const c = map.get(email)!
      c.order_count++
      c.total_spent += o.total_eur || 0
      if (o.created_at < c.first_order) c.first_order = o.created_at
    }

    const list = Array.from(map.values()).sort((a, b) => b.order_count - a.order_count)
    setAll(list)
    applyFilter(list, search)
    setLoading(false)
  }

  function applyFilter(list: Customer[], q: string) {
    const f = list.filter(c =>
      !q ||
      (c.name  || '').toLowerCase().includes(q.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(q.toLowerCase()) ||
      (c.city  || '').toLowerCase().includes(q.toLowerCase())
    )
    setFiltered(f)
  }

  function handleSearch(v: string) { setSearch(v); applyFilter(all, v) }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Clienti</div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>Clienti che hanno effettuato almeno un ordine</div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16 }}>
        <input
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Cerca per nome, email o città…"
          style={inputStyle}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Clienti ({filtered.length})</div>
        </div>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--ink-4)' }}>
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" style={{ opacity: 0.25, marginBottom: 12 }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
            <p style={{ fontSize: 14, margin: 0 }}>Nessun cliente trovato.</p>
            <p style={{ fontSize: 12.5, margin: '5px 0 0', color: 'var(--ink-5)' }}>I clienti appariranno qui dopo il primo ordine ricevuto.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Nome', 'Email', 'Telefono', 'Città', 'Ordini', 'Spesa totale', 'Primo ordine'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.email}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  style={{ transition: 'background .15s' }}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{c.name || '—'}</td>
                  <td style={{ ...tdStyle, color: 'var(--ink-3)' }}>{c.email}</td>
                  <td style={{ ...tdStyle, color: 'var(--ink-3)' }}>{c.phone || '—'}</td>
                  <td style={{ ...tdStyle, color: 'var(--ink-3)' }}>{c.city || '—'}</td>
                  <td style={tdStyle}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-bg)', color: 'var(--accent)', fontSize: 12, fontWeight: 700 }}>
                      {c.order_count}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, fontWeight: 700, color: 'var(--ink)' }}>
                    €{c.total_spent.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ ...tdStyle, fontSize: 12.5, color: 'var(--ink-4)' }}>
                    {new Date(c.first_order).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
