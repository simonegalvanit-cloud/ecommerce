'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Request {
  id: string
  created_at: string
  service: string
  nome: string
  email: string
  azienda: string | null
  tel: string | null
  note: string | null
  status: 'new' | 'read' | 'replied'
}

const SERVICE_LABEL: Record<string, string> = {
  'stoccaggio':            'Stoccaggio',
  'progettazione-tecnica': 'Prog. Tecnica',
  'progettazione-grafica': 'Prog. Grafica',
}
const SERVICE_COLOR: Record<string, string> = {
  'stoccaggio':            '#6366f1',
  'progettazione-tecnica': '#0ea5e9',
  'progettazione-grafica': '#ec4899',
}
const STATUS_LABEL: Record<string, string> = {
  new:     'Nuova',
  read:    'Letta',
  replied: 'Risposto',
}
const STATUS_STYLE: Record<string, { background: string; color: string }> = {
  new:     { background: '#fef3c7', color: '#d97706' },
  read:    { background: 'var(--blue-bg)', color: 'var(--blue)' },
  replied: { background: 'var(--green-bg)', color: 'var(--green)' },
}

const thS: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase',
  color: 'var(--ink-4)', padding: '10px 16px', textAlign: 'left',
  borderBottom: '1px solid var(--border)', background: 'var(--surface)',
}
const tdS: React.CSSProperties = {
  padding: '12px 16px', fontSize: 13.5, color: 'var(--ink-2)',
  borderBottom: '1px solid var(--border)', verticalAlign: 'middle',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function buildMailto(r: Request) {
  const subject = encodeURIComponent(`Re: Richiesta ${SERVICE_LABEL[r.service] ?? r.service} — Briopack`)
  const body = encodeURIComponent(
    `Gentile ${r.nome},\n\nGrazie per averci contattato riguardo al servizio di ${SERVICE_LABEL[r.service] ?? r.service}.\n\n[SCRIVI QUI LA TUA RISPOSTA]\n\nCordiali saluti,\nBriopack Srl\n0871 869378 — info@briopack.com`
  )
  return `mailto:${r.email}?subject=${subject}&body=${body}`
}

export default function AdminServiziPage() {
  const sb = createClient()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  async function load() {
    setLoading(true)
    const { data } = await sb
      .from('servizi_requests')
      .select('*')
      .order('created_at', { ascending: false })
    setRequests((data as Request[]) ?? [])
    setLoading(false)
  }

  async function markStatus(id: string, status: Request['status']) {
    setUpdating(id)
    await sb.from('servizi_requests').update({ status }).eq('id', id)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r))
    setUpdating(null)
  }

  async function handleExpand(r: Request) {
    const isOpen = expanded === r.id
    setExpanded(isOpen ? null : r.id)
    if (!isOpen && r.status === 'new') {
      await markStatus(r.id, 'read')
    }
  }

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter)
  const counts = {
    all:     requests.length,
    new:     requests.filter(r => r.status === 'new').length,
    read:    requests.filter(r => r.status === 'read').length,
    replied: requests.filter(r => r.status === 'replied').length,
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Richieste Servizi</div>
          <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>Richieste di preventivo dalla pagina /servizi</div>
        </div>
        <button
          onClick={load}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: 'var(--ink-3)', cursor: 'pointer', fontFamily: 'var(--f)', transition: 'all .15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--accent)'; (e.currentTarget as HTMLElement).style.color = 'var(--accent)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink-3)' }}
        >
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          Aggiorna
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['all', 'new', 'read', 'replied'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 14px', borderRadius: 100, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--f)', transition: 'all .15s', border: '1.5px solid',
              background: filter === f ? (f === 'new' ? '#fef3c7' : filter === 'all' ? 'var(--accent-bg)' : 'var(--surface-2)') : 'transparent',
              borderColor: filter === f ? (f === 'new' ? '#d97706' : f === 'all' ? 'var(--accent)' : 'var(--border)') : 'var(--border)',
              color: filter === f ? (f === 'new' ? '#d97706' : f === 'all' ? 'var(--accent)' : 'var(--ink-3)') : 'var(--ink-4)',
            }}
          >
            {f === 'all' ? 'Tutte' : STATUS_LABEL[f]}
            <span style={{ marginLeft: 6, background: 'rgba(0,0,0,0.08)', borderRadius: 100, padding: '0 7px', fontSize: 11 }}>{counts[f]}</span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center', color: 'var(--ink-4)' }}>
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" style={{ opacity: 0.25, marginBottom: 12 }}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 4 }}>Nessuna richiesta</div>
            <div style={{ fontSize: 13 }}>Le richieste dalla pagina Servizi appariranno qui.</div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Stato', 'Data', 'Nominativo', 'Servizio', 'Email', 'Azioni'].map(h => <th key={h} style={thS}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <>
                  <tr
                    key={r.id}
                    style={{ cursor: 'pointer', background: expanded === r.id ? 'var(--accent-bg)' : r.status === 'new' ? '#fffbf5' : 'transparent', transition: 'background .15s' }}
                    onMouseEnter={e => { if (expanded !== r.id && r.status !== 'new') (e.currentTarget as HTMLElement).style.background = 'var(--surface)' }}
                    onMouseLeave={e => { if (expanded !== r.id && r.status !== 'new') (e.currentTarget as HTMLElement).style.background = 'transparent' }}
                    onClick={() => handleExpand(r)}
                  >
                    <td style={tdS}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 100, letterSpacing: '0.4px', textTransform: 'uppercase', whiteSpace: 'nowrap', ...STATUS_STYLE[r.status] }}>
                        {r.status === 'new' && '● '}{STATUS_LABEL[r.status]}
                      </span>
                    </td>
                    <td style={{ ...tdS, color: 'var(--ink-4)', fontSize: 12.5, whiteSpace: 'nowrap' }}>{fmtDate(r.created_at)}</td>
                    <td style={tdS}>
                      <div style={{ fontWeight: 600, color: 'var(--ink)' }}>{r.nome}</div>
                      {r.azienda && <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{r.azienda}</div>}
                    </td>
                    <td style={tdS}>
                      <span style={{ fontSize: 11.5, fontWeight: 700, padding: '3px 10px', borderRadius: 100, background: (SERVICE_COLOR[r.service] ?? '#888') + '18', color: SERVICE_COLOR[r.service] ?? '#888', whiteSpace: 'nowrap' }}>
                        {SERVICE_LABEL[r.service] ?? r.service}
                      </span>
                    </td>
                    <td style={{ ...tdS, fontSize: 13 }}>{r.email}</td>
                    <td style={tdS} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                        <a
                          href={buildMailto(r)}
                          onClick={() => { if (r.status !== 'replied') markStatus(r.id, 'replied') }}
                          style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--accent)', color: '#fff', borderRadius: 7, padding: '5px 11px', fontSize: 12.5, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', transition: 'background .15s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--accent-h)'}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--accent)'}
                        >
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                          Rispondi
                        </a>
                        {r.status !== 'replied' && (
                          <button
                            disabled={updating === r.id}
                            onClick={() => markStatus(r.id, 'replied')}
                            style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, padding: '5px 10px', fontSize: 12, fontWeight: 600, color: 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--f)', transition: 'all .15s', whiteSpace: 'nowrap' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--green)'; (e.currentTarget as HTMLElement).style.color = 'var(--green)' }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink-4)' }}
                          >
                            ✓ Segna risposto
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>

                  {/* Expanded detail row */}
                  {expanded === r.id && (
                    <tr key={r.id + '-detail'}>
                      <td colSpan={6} style={{ padding: '0 20px 20px', background: 'var(--accent-bg)', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, padding: '16px 0' }}>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 6 }}>Contatti</div>
                            <div style={{ fontSize: 13.5, color: 'var(--ink)', marginBottom: 3 }}>{r.nome}</div>
                            <a href={`mailto:${r.email}`} style={{ fontSize: 13, color: 'var(--accent)', textDecoration: 'none' }}>{r.email}</a>
                            {r.tel && <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 3 }}><a href={`tel:${r.tel}`} style={{ color: 'inherit', textDecoration: 'none' }}>{r.tel}</a></div>}
                            {r.azienda && <div style={{ fontSize: 12.5, color: 'var(--ink-4)', marginTop: 3 }}>{r.azienda}</div>}
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 6 }}>Servizio richiesto</div>
                            <span style={{ fontSize: 14, fontWeight: 700, color: SERVICE_COLOR[r.service] ?? '#888' }}>{SERVICE_LABEL[r.service] ?? r.service}</span>
                            <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 4 }}>ID: <span style={{ fontFamily: 'monospace' }}>{r.id.slice(0, 8).toUpperCase()}</span></div>
                            <div style={{ fontSize: 12, color: 'var(--ink-4)', marginTop: 2 }}>{fmtDate(r.created_at)}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 6 }}>Note</div>
                            {r.note ? (
                              <div style={{ fontSize: 13.5, color: 'var(--ink)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{r.note}</div>
                            ) : (
                              <div style={{ fontSize: 13, color: 'var(--ink-5)', fontStyle: 'italic' }}>Nessuna nota aggiuntiva</div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 8, paddingTop: 12, borderTop: '1px solid rgba(232,114,26,0.15)' }}>
                          <a
                            href={buildMailto(r)}
                            onClick={() => { if (r.status !== 'replied') markStatus(r.id, 'replied') }}
                            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: '#fff', borderRadius: 9, padding: '9px 18px', fontSize: 13.5, fontWeight: 700, textDecoration: 'none', transition: 'background .15s' }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--accent-h)'}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--accent)'}
                          >
                            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            Apri email a {r.email}
                          </a>
                          {r.status !== 'replied' && (
                            <button
                              disabled={updating === r.id}
                              onClick={() => markStatus(r.id, 'replied')}
                              style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--green-bg)', border: '1px solid var(--green)', borderRadius: 9, padding: '9px 18px', fontSize: 13.5, fontWeight: 700, color: 'var(--green)', cursor: 'pointer', fontFamily: 'var(--f)', transition: 'all .15s' }}
                            >
                              ✓ Segna come risposto
                            </button>
                          )}
                          <button
                            onClick={() => setExpanded(null)}
                            style={{ marginLeft: 'auto', background: 'transparent', border: '1px solid var(--border)', borderRadius: 9, padding: '9px 14px', fontSize: 13, color: 'var(--ink-4)', cursor: 'pointer', fontFamily: 'var(--f)' }}
                          >
                            Chiudi
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
