'use client'
import { useState, useEffect, FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { PRODUCTS, SIZES, COLORS, PRINT_OPTIONS, QTY_PRESETS, DISC_TIERS } from '@/lib/products'

/* ── Types ── */
interface DbProduct {
  id: string; key: string; name: string; cat: string; cat_key: string
  price: number; moq: number; badge_label: string | null; badge_type: string | null
  description: string; seo_desc: string
  sizes: SizeRow[]; colors: ColorRow[]; print_options: string[]
  qty_presets: number[]; disc_tiers: DiscRow[]
  active: boolean; sort_order: number; created_at: string
}
type SizeRow  = { label: string; dim: string; price: number | null }
type ColorRow = { label: string; hex: string; border: boolean }
type DiscRow  = { min: number; max: number | null; label: string; disc: string | null }

/* ── Defaults for new products ── */
const DEF_SIZES: SizeRow[]  = SIZES.map(s => ({ label: s.label, dim: s.dim, price: s.price }))
const DEF_COLORS: ColorRow[] = COLORS.map(c => ({ label: c.label, hex: c.hex, border: c.border ?? false }))
const DEF_PRINTS: string[]  = [...PRINT_OPTIONS]
const DEF_QTY: number[]     = [...QTY_PRESETS]
const DEF_DISC: DiscRow[]   = DISC_TIERS.map(t => ({ min: t.min, max: t.max === Infinity ? null : (t.max as number), label: t.label, disc: t.disc ?? null }))

/* ── Style helpers ── */
const th: React.CSSProperties = { fontSize: 11, fontWeight: 600, letterSpacing: '0.4px', textTransform: 'uppercase', color: 'var(--ink-4)', padding: '9px 16px', textAlign: 'left', borderBottom: '1px solid var(--border)', background: 'var(--surface)', whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '11px 16px', fontSize: 13.5, color: 'var(--ink-2)', borderBottom: '1px solid var(--border)', verticalAlign: 'middle' }
const inp: React.CSSProperties = { width: '100%', padding: '8px 11px', fontFamily: 'var(--f)', fontSize: 13.5, color: 'var(--ink)', background: 'var(--surface)', border: '1.5px solid var(--border-2)', borderRadius: 8, outline: 'none', boxSizing: 'border-box' }
const lbl: React.CSSProperties = { display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.3px', marginBottom: 5 }
const sectionHead: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8 }
const rowBtn: React.CSSProperties = { padding: '4px 10px', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 600, background: 'transparent', color: 'var(--red)', border: '1px solid rgba(200,40,30,0.2)', borderRadius: 6, cursor: 'pointer' }
const addBtn: React.CSSProperties = { padding: '6px 14px', fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: 600, background: 'transparent', color: 'var(--ink-3)', border: '1.5px dashed var(--border-2)', borderRadius: 8, cursor: 'pointer', width: '100%', marginTop: 6 }

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={sectionHead}>{title}</div>
      {children}
    </div>
  )
}

function Field({ label, children, span2 }: { label: string; children: React.ReactNode; span2?: boolean }) {
  return (
    <div style={{ marginBottom: 14, gridColumn: span2 ? 'span 2' : undefined }}>
      <label style={lbl}>{label}</label>
      {children}
    </div>
  )
}

export default function ProductsPage() {
  const sb = createClient()

  const [dbProds, setDbProds]   = useState<DbProduct[]>([])
  const [loading, setLoading]   = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editId, setEditId]     = useState<string | null>(null)
  const [saving, setSaving]     = useState(false)
  const [alert, setAlert]       = useState<{ msg: string; type: 'ok' | 'err' } | null>(null)

  /* Form state */
  const [fKey,   setFKey]   = useState('')
  const [fName,  setFName]  = useState('')
  const [fCat,   setFCat]   = useState('')
  const [fCatKey, setFCatKey] = useState('')
  const [fPrice, setFPrice] = useState('')
  const [fMoq,   setFMoq]   = useState('')
  const [fDesc,  setFDesc]  = useState('')
  const [fSeo,   setFSeo]   = useState('')
  const [fBadgeLabel, setFBadgeLabel] = useState('')
  const [fBadgeType,  setFBadgeType]  = useState<'top' | 'eco' | ''>('')
  const [fActive, setFActive] = useState(true)
  const [fSizes,   setFSizes]   = useState<SizeRow[]>(DEF_SIZES)
  const [fColors,  setFColors]  = useState<ColorRow[]>(DEF_COLORS)
  const [fPrints,  setFPrints]  = useState<string[]>(DEF_PRINTS)
  const [fQty,     setFQty]     = useState<string>('100,250,500,1000,5000')
  const [fDisc,    setFDisc]    = useState<DiscRow[]>(DEF_DISC)

  useEffect(() => { loadDbProds() }, [])

  async function loadDbProds() {
    setLoading(true)
    try {
      const { data } = await sb.from('products').select('*').order('sort_order').order('created_at')
      setDbProds((data || []) as DbProduct[])
    } catch { setDbProds([]) }
    setLoading(false)
  }

  function openNew() {
    setEditId(null)
    setFKey(''); setFName(''); setFCat(''); setFCatKey(''); setFPrice(''); setFMoq('100')
    setFDesc(''); setFSeo(''); setFBadgeLabel(''); setFBadgeType(''); setFActive(true)
    setFSizes(DEF_SIZES); setFColors(DEF_COLORS); setFPrints(DEF_PRINTS)
    setFQty('100,250,500,1000,5000'); setFDisc(DEF_DISC)
    setAlert(null); setDrawerOpen(true)
  }

  function openEdit(p: DbProduct) {
    setEditId(p.id)
    setFKey(p.key); setFName(p.name); setFCat(p.cat); setFCatKey(p.cat_key)
    setFPrice(String(p.price)); setFMoq(String(p.moq))
    setFDesc(p.description); setFSeo(p.seo_desc)
    setFBadgeLabel(p.badge_label || ''); setFBadgeType((p.badge_type as any) || '')
    setFActive(p.active)
    setFSizes(p.sizes?.length ? p.sizes : DEF_SIZES)
    setFColors(p.colors?.length ? p.colors : DEF_COLORS)
    setFPrints(p.print_options?.length ? p.print_options : DEF_PRINTS)
    setFQty((p.qty_presets?.length ? p.qty_presets : DEF_QTY).join(','))
    setFDisc(p.disc_tiers?.length ? p.disc_tiers : DEF_DISC)
    setAlert(null); setDrawerOpen(true)
  }

  async function save(e: FormEvent) {
    e.preventDefault()
    if (!fName.trim() || !fKey.trim() || !fPrice) {
      setAlert({ msg: 'Nome, slug e prezzo sono obbligatori.', type: 'err' }); return
    }
    setSaving(true)
    const payload = {
      key: fKey.trim(), name: fName.trim(), cat: fCat.trim(), cat_key: fCatKey.trim() || slugify(fCat),
      price: parseFloat(fPrice), moq: parseInt(fMoq) || 100,
      description: fDesc.trim(), seo_desc: fSeo.trim(),
      badge_label: fBadgeLabel.trim() || null, badge_type: fBadgeType || null,
      active: fActive, updated_at: new Date().toISOString(),
      sizes: fSizes, colors: fColors, print_options: fPrints,
      qty_presets: fQty.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)),
      disc_tiers: fDisc,
    }
    let error: any
    if (editId) {
      ({ error } = await sb.from('products').update(payload).eq('id', editId))
    } else {
      ({ error } = await sb.from('products').insert(payload))
    }
    if (error) {
      setAlert({ msg: error.message, type: 'err' })
    } else {
      setDrawerOpen(false)
      await loadDbProds()
    }
    setSaving(false)
  }

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Eliminare "${name}"?`)) return
    await sb.from('products').delete().eq('id', id)
    await loadDbProds()
  }

  /* Size helpers */
  const addSize = () => setFSizes(s => [...s, { label: '', dim: '', price: null }])
  const rmSize  = (i: number) => setFSizes(s => s.filter((_, j) => j !== i))
  const setSize = (i: number, f: Partial<SizeRow>) => setFSizes(s => s.map((r, j) => j === i ? { ...r, ...f } : r))

  /* Color helpers */
  const addColor = () => setFColors(c => [...c, { label: '', hex: '#cccccc', border: false }])
  const rmColor  = (i: number) => setFColors(c => c.filter((_, j) => j !== i))
  const setColor = (i: number, f: Partial<ColorRow>) => setFColors(c => c.map((r, j) => j === i ? { ...r, ...f } : r))

  /* Print helpers */
  const addPrint = () => setFPrints(p => [...p, ''])
  const rmPrint  = (i: number) => setFPrints(p => p.filter((_, j) => j !== i))
  const setPrint = (i: number, v: string) => setFPrints(p => p.map((r, j) => j === i ? v : r))

  /* Disc helpers */
  const addDisc = () => setFDisc(d => [...d, { min: 0, max: null, label: '', disc: null }])
  const rmDisc  = (i: number) => setFDisc(d => d.filter((_, j) => j !== i))
  const setDisc = (i: number, f: Partial<DiscRow>) => setFDisc(d => d.map((r, j) => j === i ? { ...r, ...f } : r))

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Prodotti</div>
          <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>Gestisci e aggiungi prodotti al catalogo</div>
        </div>
        <button onClick={openNew} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: '#fff', border: 'none', padding: '9px 18px', fontFamily: 'var(--f)', fontSize: 13.5, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 16 16"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
          Nuovo prodotto
        </button>
      </div>

      {/* Hardcoded products */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Catalogo integrato ({PRODUCTS.length})</div>
          <span style={{ fontSize: 11.5, color: 'var(--ink-4)', background: 'var(--surface-2)', padding: '3px 10px', borderRadius: 20, fontWeight: 500 }}>Gestiti nel codice · sola lettura</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr>{['Nome', 'Categoria', 'Prezzo base', 'MOQ', 'Badge', 'Pagina'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody>
            {PRODUCTS.map(p => (
              <tr key={p.key} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'} style={{ transition: 'background .15s' }}>
                <td style={{ ...td, fontWeight: 600 }}>
                  {p.name}
                  <div style={{ fontSize: 11.5, color: 'var(--ink-4)', fontFamily: 'monospace', marginTop: 1 }}>{p.key}</div>
                </td>
                <td style={td}><span style={{ background: 'var(--surface-2)', padding: '3px 8px', borderRadius: 4, color: 'var(--ink-3)', fontSize: 12 }}>{p.cat}</span></td>
                <td style={{ ...td, fontWeight: 600 }}>€{p.price.toFixed(2)}<span style={{ color: 'var(--ink-4)', fontSize: 11, fontWeight: 400 }}>/pz</span></td>
                <td style={{ ...td, color: 'var(--ink-3)' }}>{p.moq}</td>
                <td style={td}>{p.badge ? <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20, background: p.badge.type === 'eco' ? 'var(--green-bg)' : 'var(--accent-bg)', color: p.badge.type === 'eco' ? 'var(--green)' : 'var(--accent)' }}>{p.badge.label}</span> : <span style={{ color: 'var(--ink-5)', fontSize: 12 }}>—</span>}</td>
                <td style={td}><Link href={`/products/${p.key}`} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 6, textDecoration: 'none' }}>↗ Vai</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DB products */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Prodotti personalizzati ({loading ? '…' : dbProds.length})</div>
        </div>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" /></div>
        ) : dbProds.length === 0 ? (
          <div style={{ padding: '52px 24px', textAlign: 'center', color: 'var(--ink-4)' }}>
            <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.2" viewBox="0 0 24 24" style={{ opacity: 0.25, marginBottom: 12 }}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink-3)', margin: '0 0 6px' }}>Nessun prodotto personalizzato</p>
            <p style={{ fontSize: 13, margin: '0 0 18px' }}>Clicca <strong>Nuovo prodotto</strong> per aggiungere un prodotto con configurazione completa.</p>
            <button onClick={openNew} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: '#fff', border: 'none', padding: '9px 18px', fontFamily: 'var(--f)', fontSize: 13.5, fontWeight: 600, borderRadius: 8, cursor: 'pointer' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 16 16"><line x1="8" y1="2" x2="8" y2="14"/><line x1="2" y1="8" x2="14" y2="8"/></svg>
              Nuovo prodotto
            </button>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr>{['Nome', 'Categoria', 'Prezzo', 'MOQ', 'Stato', 'Azioni'].map(h => <th key={h} style={th}>{h}</th>)}</tr></thead>
            <tbody>
              {dbProds.map(p => (
                <tr key={p.id} onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'} onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'} style={{ transition: 'background .15s' }}>
                  <td style={{ ...td, fontWeight: 600 }}>
                    {p.name}
                    <div style={{ fontSize: 11.5, color: 'var(--ink-4)', fontFamily: 'monospace', marginTop: 1 }}>{p.key}</div>
                  </td>
                  <td style={td}><span style={{ background: 'var(--surface-2)', padding: '3px 8px', borderRadius: 4, color: 'var(--ink-3)', fontSize: 12 }}>{p.cat}</span></td>
                  <td style={{ ...td, fontWeight: 600 }}>€{Number(p.price).toFixed(2)}</td>
                  <td style={{ ...td, color: 'var(--ink-3)' }}>{p.moq}</td>
                  <td style={td}><span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 20, background: p.active ? 'var(--green-bg)' : 'var(--surface-2)', color: p.active ? 'var(--green)' : 'var(--ink-3)' }}>{p.active ? 'Attivo' : 'Disattivo'}</span></td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <Link href={`/products/${p.key}`} target="_blank" style={{ padding: '4px 10px', fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 6, textDecoration: 'none' }}>↗ Vai</Link>
                      <button onClick={() => openEdit(p)} style={{ padding: '4px 10px', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 600, background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 6, cursor: 'pointer' }}>Modifica</button>
                      <button onClick={() => deleteProduct(p.id, p.name)} style={{ padding: '4px 10px', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 600, background: 'transparent', color: 'var(--red)', border: '1px solid rgba(200,40,30,0.2)', borderRadius: 6, cursor: 'pointer' }}>Elimina</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Drawer ── */}
      {drawerOpen && (
        <>
          <div onClick={() => setDrawerOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 900, backdropFilter: 'blur(2px)' }} />
          <div style={{ position: 'fixed', right: 0, top: 0, bottom: 0, width: '100%', maxWidth: 720, background: 'var(--white)', boxShadow: 'var(--shadow-xl)', zIndex: 901, display: 'flex', flexDirection: 'column' }}>
            {/* Drawer header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 28px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{editId ? 'Modifica prodotto' : 'Nuovo prodotto'}</div>
              <button onClick={() => setDrawerOpen(false)} style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-2)', border: 'none', borderRadius: '50%', cursor: 'pointer', color: 'var(--ink-3)' }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 16 16"><line x1="2" y1="2" x2="14" y2="14"/><line x1="14" y1="2" x2="2" y2="14"/></svg>
              </button>
            </div>

            {/* Drawer body */}
            <form id="productForm" onSubmit={save} style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
              {alert && (
                <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 20, background: alert.type === 'ok' ? 'var(--green-bg)' : 'var(--red-bg)', color: alert.type === 'ok' ? 'var(--green)' : 'var(--red)' }}>
                  {alert.msg}
                </div>
              )}

              {/* ── Basic Info ── */}
              <Section title="Informazioni base">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <Field label="Nome prodotto *">
                    <input value={fName} onChange={e => { setFName(e.target.value); if (!editId) setFKey(slugify(e.target.value)) }} placeholder="Es. Shopper Lusso Kraft" required style={inp} />
                  </Field>
                  <Field label="Slug (URL) *">
                    <input value={fKey} onChange={e => setFKey(slugify(e.target.value))} placeholder="shopper-lusso-kraft" required style={{ ...inp, fontFamily: 'monospace', fontSize: 13 }} />
                  </Field>
                  <Field label="Categoria">
                    <input value={fCat} onChange={e => setFCat(e.target.value)} placeholder="Es. Shopper & Cartotecnica" style={inp} />
                  </Field>
                  <Field label="Chiave categoria">
                    <input value={fCatKey} onChange={e => setFCatKey(e.target.value)} placeholder="shopper" style={{ ...inp, fontFamily: 'monospace', fontSize: 13 }} />
                  </Field>
                  <Field label="Descrizione breve" span2>
                    <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} rows={2} placeholder="Descrizione mostrata nella pagina prodotto…" style={{ ...inp, resize: 'vertical' }} />
                  </Field>
                  <Field label="Descrizione SEO (meta description)" span2>
                    <textarea value={fSeo} onChange={e => setFSeo(e.target.value)} rows={2} placeholder="Ottimizzata per i motori di ricerca, 120–160 caratteri…" style={{ ...inp, resize: 'vertical' }} />
                  </Field>
                </div>
              </Section>

              {/* ── Pricing ── */}
              <Section title="Prezzi e badge">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '0 12px' }}>
                  <Field label="Prezzo base (€/pz) *">
                    <input type="number" value={fPrice} onChange={e => setFPrice(e.target.value)} placeholder="0.65" min="0" step="0.01" required style={inp} />
                  </Field>
                  <Field label="MOQ (min. ordine)">
                    <input type="number" value={fMoq} onChange={e => setFMoq(e.target.value)} placeholder="100" min="1" style={inp} />
                  </Field>
                  <Field label="Badge etichetta">
                    <input value={fBadgeLabel} onChange={e => setFBadgeLabel(e.target.value)} placeholder="Es. Più venduto" style={inp} />
                  </Field>
                  <Field label="Badge tipo">
                    <select value={fBadgeType} onChange={e => setFBadgeType(e.target.value as any)} style={{ ...inp, cursor: 'pointer' }}>
                      <option value="">Nessuno</option>
                      <option value="top">top (arancione)</option>
                      <option value="eco">eco (verde)</option>
                    </select>
                  </Field>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface)', border: '1.5px solid var(--border-2)', borderRadius: 8, marginTop: 4 }}>
                  <div style={{ position: 'relative', width: 36, height: 20, flexShrink: 0 }}>
                    <input type="checkbox" id="fActiveToggle" checked={fActive} onChange={e => setFActive(e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                    <label htmlFor="fActiveToggle" style={{ position: 'absolute', inset: 0, background: fActive ? 'var(--accent)' : '#ccc', borderRadius: 100, cursor: 'pointer', transition: '.25s', display: 'block' }}>
                      <span style={{ position: 'absolute', width: 14, height: 14, left: fActive ? 19 : 3, bottom: 3, background: '#fff', borderRadius: '50%', transition: '.25s', display: 'block' }} />
                    </label>
                  </div>
                  <span style={{ fontSize: 13.5, color: 'var(--ink)' }}>Prodotto attivo — visibile sul sito</span>
                </div>
              </Section>

              {/* ── Sizes ── */}
              <Section title="Taglie disponibili">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 2 }}>
                    <thead><tr>
                      {['Etichetta', 'Dimensioni', 'Prezzo (€/pz)', ''].map(h => <th key={h} style={{ ...th, padding: '7px 10px' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {fSizes.map((s, i) => (
                        <tr key={i}>
                          <td style={{ padding: '6px 6px 6px 0' }}><input value={s.label} onChange={e => setSize(i, { label: e.target.value })} placeholder="XL" style={{ ...inp, width: 80 }} /></td>
                          <td style={{ padding: '6px' }}><input value={s.dim} onChange={e => setSize(i, { dim: e.target.value })} placeholder="600×450×350 mm" style={inp} /></td>
                          <td style={{ padding: '6px' }}><input type="number" value={s.price ?? ''} onChange={e => setSize(i, { price: e.target.value ? parseFloat(e.target.value) : null })} placeholder="custom" min="0" step="0.01" style={{ ...inp, width: 120 }} /></td>
                          <td style={{ padding: '6px 0' }}><button type="button" onClick={() => rmSize(i)} style={rowBtn}>×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={addSize} style={addBtn}>+ Aggiungi taglia</button>
              </Section>

              {/* ── Colors ── */}
              <Section title="Colori disponibili">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {fColors.map((c, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input type="color" value={c.hex} onChange={e => setColor(i, { hex: e.target.value })} style={{ width: 36, height: 34, border: '1.5px solid var(--border-2)', borderRadius: 6, cursor: 'pointer', padding: 2 }} />
                      <input value={c.label} onChange={e => setColor(i, { label: e.target.value })} placeholder="Naturale" style={{ ...inp, flex: 1 }} />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: 'var(--ink-3)', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                        <input type="checkbox" checked={c.border} onChange={e => setColor(i, { border: e.target.checked })} />
                        Bordo
                      </label>
                      <button type="button" onClick={() => rmColor(i)} style={rowBtn}>×</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addColor} style={addBtn}>+ Aggiungi colore</button>
              </Section>

              {/* ── Print Options ── */}
              <Section title="Opzioni stampa e finitura">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {fPrints.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <input value={p} onChange={e => setPrint(i, e.target.value)} placeholder="Es. Flexo 4 colori" style={{ ...inp, flex: 1 }} />
                      <button type="button" onClick={() => rmPrint(i)} style={rowBtn}>×</button>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addPrint} style={addBtn}>+ Aggiungi opzione</button>
              </Section>

              {/* ── Qty Presets ── */}
              <Section title="Quantità predefinite">
                <Field label="Preset separati da virgola">
                  <input value={fQty} onChange={e => setFQty(e.target.value)} placeholder="100,250,500,1000,5000" style={inp} />
                </Field>
              </Section>

              {/* ── Discount Tiers ── */}
              <Section title="Fasce sconto per quantità">
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 2 }}>
                    <thead><tr>
                      {['Q.tà min', 'Q.tà max', 'Etichetta', 'Sconto', ''].map(h => <th key={h} style={{ ...th, padding: '7px 8px' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {fDisc.map((d, i) => (
                        <tr key={i}>
                          <td style={{ padding: '6px 4px' }}><input type="number" value={d.min} onChange={e => setDisc(i, { min: parseInt(e.target.value) || 0 })} min="0" style={{ ...inp, width: 90 }} /></td>
                          <td style={{ padding: '6px 4px' }}><input type="number" value={d.max ?? ''} onChange={e => setDisc(i, { max: e.target.value ? parseInt(e.target.value) : null })} placeholder="∞" min="0" style={{ ...inp, width: 90 }} /></td>
                          <td style={{ padding: '6px 4px' }}><input value={d.label} onChange={e => setDisc(i, { label: e.target.value })} placeholder="100–499" style={inp} /></td>
                          <td style={{ padding: '6px 4px' }}><input value={d.disc ?? ''} onChange={e => setDisc(i, { disc: e.target.value || null })} placeholder="-10%" style={{ ...inp, width: 90 }} /></td>
                          <td style={{ padding: '6px 0' }}><button type="button" onClick={() => rmDisc(i)} style={rowBtn}>×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={addDisc} style={addBtn}>+ Aggiungi fascia</button>
              </Section>
            </form>

            {/* Drawer footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 28px', borderTop: '1px solid var(--border)', flexShrink: 0, background: 'var(--white)' }}>
              <button type="button" onClick={() => setDrawerOpen(false)} style={{ padding: '9px 20px', fontFamily: 'var(--f)', fontSize: 13.5, fontWeight: 600, background: 'transparent', color: 'var(--ink-3)', border: '1.5px solid var(--border-2)', borderRadius: 8, cursor: 'pointer' }}>Annulla</button>
              <button type="submit" form="productForm" disabled={saving} style={{ padding: '9px 24px', fontFamily: 'var(--f)', fontSize: 13.5, fontWeight: 700, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.65 : 1, display: 'flex', alignItems: 'center', gap: 8 }}>
                {saving ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2, borderTopColor: '#fff', borderColor: 'rgba(255,255,255,.3)' }} />Salvataggio…</> : 'Salva prodotto'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
