'use client'
import { useEffect, useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Product {
  id: string
  name: string
  category: string | null
  unit: string | null
  price: number
  moq: number
  stock: number | null
  image_url: string | null
  description: string | null
  active: boolean
  created_at: string
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
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 11.5, fontWeight: 600, color: 'var(--ink-3)',
  letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 5,
}

export default function ProductsPage() {
  const sb = createClient()

  const [all, setAll]         = useState<Product[]>([])
  const [filtered, setFiltered] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [search, setSearch]   = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [activeFilter, setActiveFilter] = useState('')
  const [loading, setLoading] = useState(true)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId]   = useState<string | null>(null)
  const [modalAlert, setModalAlert] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)
  const [saving, setSaving]   = useState(false)

  // Form fields
  const [fName, setFName]     = useState('')
  const [fCategory, setFCategory] = useState('')
  const [fUnit, setFUnit]     = useState('pz')
  const [fPrice, setFPrice]   = useState('')
  const [fMoq, setFMoq]       = useState('')
  const [fStock, setFStock]   = useState('')
  const [fImage, setFImage]   = useState('')
  const [fDesc, setFDesc]     = useState('')
  const [fActive, setFActive] = useState(true)

  useEffect(() => { loadProducts() }, [])

  async function loadProducts() {
    setLoading(true)
    const { data } = await sb.from('products').select('*').order('created_at', { ascending: false })
    const list = (data || []) as Product[]
    setAll(list)
    const cats = [...new Set(list.map(p => p.category).filter(Boolean))] as string[]
    setCategories(cats)
    applyFilter(list, search, catFilter, activeFilter)
    setLoading(false)
  }

  function applyFilter(list: Product[], q: string, cat: string, act: string) {
    const f = list.filter(p =>
      (!q   || p.name.toLowerCase().includes(q.toLowerCase()) || (p.description || '').toLowerCase().includes(q.toLowerCase())) &&
      (!cat || p.category === cat) &&
      (act === '' || String(p.active) === act)
    )
    setFiltered(f)
  }

  function handleSearch(v: string)   { setSearch(v);      applyFilter(all, v, catFilter, activeFilter) }
  function handleCat(v: string)      { setCatFilter(v);   applyFilter(all, search, v, activeFilter) }
  function handleActive(v: string)   { setActiveFilter(v);applyFilter(all, search, catFilter, v) }

  function openModal(product?: Product) {
    setModalAlert(null)
    if (product) {
      setEditId(product.id)
      setFName(product.name)
      setFCategory(product.category || '')
      setFUnit(product.unit || 'pz')
      setFPrice(String(product.price))
      setFMoq(String(product.moq))
      setFStock(product.stock != null ? String(product.stock) : '')
      setFImage(product.image_url || '')
      setFDesc(product.description || '')
      setFActive(product.active)
    } else {
      setEditId(null)
      setFName(''); setFCategory(''); setFUnit('pz'); setFPrice(''); setFMoq(''); setFStock(''); setFImage(''); setFDesc(''); setFActive(true)
    }
    setModalOpen(true)
  }

  async function saveProduct(e: FormEvent) {
    e.preventDefault()
    if (!fName.trim() || !fPrice) { setModalAlert({ msg: 'Nome e prezzo sono obbligatori.', type: 'error' }); return }
    setSaving(true)
    const payload = {
      name: fName.trim(), category: fCategory.trim() || null, unit: fUnit.trim() || 'pz',
      price: parseFloat(fPrice), moq: parseInt(fMoq) || 1,
      stock: fStock !== '' ? parseInt(fStock) : null,
      image_url: fImage.trim() || null, description: fDesc.trim() || null,
      active: fActive, updated_at: new Date().toISOString(),
    }
    let error
    if (editId) {
      ({ error } = await sb.from('products').update(payload).eq('id', editId))
    } else {
      ({ error } = await sb.from('products').insert(payload))
    }
    if (error) {
      setModalAlert({ msg: error.message, type: 'error' })
    } else {
      setModalOpen(false)
      await loadProducts()
    }
    setSaving(false)
  }

  async function deleteProduct(id: string, name: string) {
    if (!window.confirm(`Eliminare "${name}"? L'azione è irreversibile.`)) return
    await sb.from('products').delete().eq('id', id)
    await loadProducts()
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Prodotti</div>
          <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>Gestisci il catalogo prodotti</div>
        </div>
        <button onClick={() => openModal()} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent)', color: '#fff', border: 'none', padding: '9px 18px', fontFamily: 'var(--f)', fontSize: 13.5, fontWeight: 600, borderRadius: 'var(--r)', cursor: 'pointer' }}>
          <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Nuovo prodotto
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <input value={search} onChange={e => handleSearch(e.target.value)} placeholder="Cerca prodotto…" style={{ ...inputStyle, flex: 1 }} />
        <select value={catFilter} onChange={e => handleCat(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 160 }}>
          <option value="">Tutte le categorie</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={activeFilter} onChange={e => handleActive(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: 120 }}>
          <option value="">Tutti</option>
          <option value="true">Attivi</option>
          <option value="false">Disattivati</option>
        </select>
      </div>

      {/* Table card */}
      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Prodotti ({filtered.length})</div>
        </div>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-4)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📦</div>
            <p style={{ fontSize: 14 }}>Nessun prodotto trovato.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Prodotto', 'Categoria', 'Prezzo', 'MOQ', 'Stock', 'Stato', 'Azioni'].map(h => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ transition: 'background .15s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--surface)'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <td style={{ ...tdStyle, fontWeight: 600 }}>{p.name}</td>
                  <td style={tdStyle}>
                    {p.category ? (
                      <span style={{ fontSize: 11, fontWeight: 500, background: 'var(--surface-2)', color: 'var(--ink-3)', padding: '2px 8px', borderRadius: 4 }}>{p.category}</span>
                    ) : '—'}
                  </td>
                  <td style={tdStyle}>
                    €{Number(p.price).toFixed(2)}
                    <span style={{ color: 'var(--ink-4)', fontSize: 11 }}>/{p.unit || 'pz'}</span>
                  </td>
                  <td style={tdStyle}>{p.moq}</td>
                  <td style={tdStyle}>{p.stock ?? '—'}</td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.4px', background: p.active ? 'var(--green-bg)' : 'var(--surface-2)', color: p.active ? 'var(--green)' : 'var(--ink-3)' }}>
                      {p.active ? 'Attivo' : 'Off'}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openModal(p)} style={{ padding: '5px 12px', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 600, background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer' }}>Modifica</button>
                      <button onClick={() => deleteProduct(p.id, p.name)} style={{ padding: '5px 12px', fontFamily: 'var(--f)', fontSize: 12, fontWeight: 600, background: 'transparent', color: 'var(--red)', border: '1px solid rgba(217,48,37,0.25)', borderRadius: 'var(--r)', cursor: 'pointer' }}>Elimina</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div onClick={e => { if (e.target === e.currentTarget) setModalOpen(false) }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <div style={{ background: 'var(--white)', borderRadius: 'var(--r-xl)', width: '100%', maxWidth: 580, maxHeight: '90vh', overflowY: 'auto', boxShadow: 'var(--shadow-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{editId ? 'Modifica prodotto' : 'Nuovo prodotto'}</div>
              <button onClick={() => setModalOpen(false)} style={{ width: 30, height: 30, border: 'none', background: 'var(--surface-2)', borderRadius: '50%', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-3)' }}>✕</button>
            </div>
            <form onSubmit={saveProduct} style={{ padding: 24 }}>
              {modalAlert && (
                <div style={{ padding: '10px 14px', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 500, marginBottom: 16, background: modalAlert.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)', color: modalAlert.type === 'success' ? 'var(--green)' : 'var(--red)' }}>
                  {modalAlert.msg}
                </div>
              )}
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Nome prodotto *</label>
                <input value={fName} onChange={e => setFName(e.target.value)} placeholder="Es. Shopper Kraft Naturale" required style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Categoria</label>
                  <input value={fCategory} onChange={e => setFCategory(e.target.value)} placeholder="Es. Shopper" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Unità</label>
                  <input value={fUnit} onChange={e => setFUnit(e.target.value)} placeholder="pz" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Prezzo (€) *</label>
                  <input type="number" value={fPrice} onChange={e => setFPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" required style={inputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>MOQ (min. ordine)</label>
                  <input type="number" value={fMoq} onChange={e => setFMoq(e.target.value)} placeholder="100" min="1" style={inputStyle} />
                </div>
                <div style={{ marginBottom: 14 }}>
                  <label style={labelStyle}>Stock</label>
                  <input type="number" value={fStock} onChange={e => setFStock(e.target.value)} placeholder="0" min="0" style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>URL immagine</label>
                <input type="url" value={fImage} onChange={e => setFImage(e.target.value)} placeholder="https://…" style={inputStyle} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Descrizione</label>
                <textarea value={fDesc} onChange={e => setFDesc(e.target.value)} placeholder="Descrizione prodotto…" rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Stato</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'var(--surface)', border: '1.5px solid var(--border-2)', borderRadius: 'var(--r)' }}>
                  <div style={{ position: 'relative', width: 36, height: 20, flexShrink: 0 }}>
                    <input type="checkbox" id="fActiveToggle" checked={fActive} onChange={e => setFActive(e.target.checked)} style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }} />
                    <label htmlFor="fActiveToggle" style={{ position: 'absolute', inset: 0, background: fActive ? 'var(--accent)' : '#ccc', borderRadius: 100, cursor: 'pointer', transition: '.25s', display: 'block' }}>
                      <span style={{ position: 'absolute', width: 14, height: 14, left: fActive ? 19 : 3, bottom: 3, background: '#fff', borderRadius: '50%', transition: '.25s', display: 'block' }} />
                    </label>
                  </div>
                  <span style={{ fontSize: 13.5, color: 'var(--ink)' }}>Prodotto attivo (visibile nel negozio)</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)', marginTop: 8 }}>
                <button type="button" onClick={() => setModalOpen(false)} style={{ padding: '9px 18px', fontFamily: 'var(--f)', fontSize: 13.5, fontWeight: 600, background: 'transparent', color: 'var(--ink-3)', border: '1px solid var(--border-2)', borderRadius: 'var(--r)', cursor: 'pointer' }}>Annulla</button>
                <button type="submit" disabled={saving} style={{ padding: '9px 18px', fontFamily: 'var(--f)', fontSize: 13.5, fontWeight: 600, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--r)', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}>
                  {saving ? 'Salvataggio…' : 'Salva prodotto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
