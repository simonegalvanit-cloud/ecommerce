'use client'
import { useEffect, useState, FormEvent } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Setting {
  key: string
  label: string | null
  value: string | null
}

const inputStyle: React.CSSProperties = {
  flex: 1, padding: '8px 12px', fontFamily: 'var(--f)', fontSize: 13.5,
  color: 'var(--ink)', background: 'var(--surface)', border: '1.5px solid var(--border-2)',
  borderRadius: 'var(--r)', outline: 'none',
}

export default function SettingsPage() {
  const sb = createClient()

  const [settings, setSettings] = useState<Setting[]>([])
  const [values, setValues]     = useState<Record<string, string>>({})
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [alert, setAlert]       = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => { loadSettings() }, [])

  async function loadSettings() {
    setLoading(true)
    const { data } = await sb.from('site_settings').select('*').order('key')
    const list = (data || []) as Setting[]
    setSettings(list)
    const vals: Record<string, string> = {}
    list.forEach(s => { vals[s.key] = s.value || '' })
    setValues(vals)
    setLoading(false)
  }

  async function saveSettings(e: FormEvent) {
    e.preventDefault()
    setSaving(true)
    setAlert(null)
    const updates = settings.map(s => ({
      key: s.key,
      label: s.label,
      value: values[s.key] ?? s.value ?? '',
      updated_at: new Date().toISOString(),
    }))
    const { error } = await sb.from('site_settings').upsert(updates, { onConflict: 'key' })
    if (error) {
      setAlert({ msg: error.message, type: 'error' })
    } else {
      setAlert({ msg: 'Impostazioni salvate con successo.', type: 'success' })
      setTimeout(() => setAlert(null), 3000)
    }
    setSaving(false)
  }

  return (
    <div style={{ padding: '28px 32px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-0.4px' }}>Impostazioni</div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)', marginTop: 2 }}>Configura i parametri del sito</div>
      </div>

      {alert && (
        <div style={{ padding: '10px 14px', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 500, marginBottom: 16, background: alert.type === 'success' ? 'var(--green-bg)' : 'var(--red-bg)', color: alert.type === 'success' ? 'var(--green)' : 'var(--red)' }}>
          {alert.msg}
        </div>
      )}

      <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>Impostazioni sito</div>
          <button
            form="settingsForm"
            type="submit"
            disabled={saving || loading}
            style={{ padding: '7px 16px', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 'var(--r)', cursor: saving || loading ? 'not-allowed' : 'pointer', opacity: saving || loading ? 0.6 : 1 }}>
            {saving ? 'Salvataggio…' : 'Salva'}
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 48, textAlign: 'center' }}><span className="spinner" /></div>
        ) : settings.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--ink-4)' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>⚙️</div>
            <p style={{ fontSize: 14 }}>Nessuna impostazione trovata nella tabella <code>site_settings</code>.</p>
          </div>
        ) : (
          <form id="settingsForm" onSubmit={saveSettings} style={{ padding: '4px 0' }}>
            {settings.map((s, idx) => (
              <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '14px 20px', borderBottom: idx < settings.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ flex: '0 0 220px' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{s.label || s.key}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)', fontFamily: 'monospace', marginTop: 2 }}>{s.key}</div>
                </div>
                <input
                  type="text"
                  value={values[s.key] ?? ''}
                  onChange={e => setValues(prev => ({ ...prev, [s.key]: e.target.value }))}
                  placeholder="—"
                  style={inputStyle}
                />
              </div>
            ))}
          </form>
        )}
      </div>
    </div>
  )
}
