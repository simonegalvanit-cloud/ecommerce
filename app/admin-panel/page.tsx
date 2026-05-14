'use client'
import { useState, FormEvent } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function AdminPanelLogin() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Credenziali non valide.')
        setLoading(false)
        return
      }
      // Store name for sidebar display (non-sensitive)
      sessionStorage.setItem('bp_admin_name', data.name || 'Admin')
      router.push('/admin')
    } catch {
      setError('Errore di connessione. Riprova.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#111', fontFamily: 'var(--f)',
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        background: '#1a1a1a', borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '40px 36px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <Image src="/logo.png" alt="Briopack" width={110} height={28}
            style={{ height: 26, width: 'auto', filter: 'brightness(0) invert(1)' }} />
          <span style={{
            fontSize: 9, fontWeight: 700, background: 'var(--accent)', color: '#fff',
            padding: '3px 8px', borderRadius: 4, letterSpacing: '0.8px', textTransform: 'uppercase',
          }}>Admin</span>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginBottom: 6, letterSpacing: '-0.4px' }}>
          Accesso amministratore
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>
          Pannello di controllo Briopack
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.3px' }}>
              Email
            </label>
            <input
              type="email" required autoComplete="email"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="admin@briopack.com"
              style={{
                padding: '11px 14px', borderRadius: 10, fontSize: 14,
                background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)',
                color: '#fff', fontFamily: 'var(--f)', outline: 'none',
                transition: 'border-color .18s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.3px' }}>
              Password
            </label>
            <input
              type="password" required autoComplete="current-password"
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                padding: '11px 14px', borderRadius: 10, fontSize: 14,
                background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)',
                color: '#fff', fontFamily: 'var(--f)', outline: 'none',
                transition: 'border-color .18s',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(229,57,53,0.12)', border: '1px solid rgba(229,57,53,0.3)',
              borderRadius: 8, padding: '10px 14px',
              fontSize: 13, color: '#ef9a9a',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit" disabled={loading}
            style={{
              marginTop: 6, padding: '13px', borderRadius: 10, border: 'none',
              background: loading ? 'rgba(232,114,26,0.6)' : 'var(--accent)',
              color: '#fff', fontSize: 15, fontWeight: 700,
              fontFamily: 'var(--f)', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <span style={{
                width: 18, height: 18, border: '2.5px solid rgba(255,255,255,0.3)',
                borderTopColor: '#fff', borderRadius: '50%',
                animation: 'spin .7s linear infinite', display: 'inline-block',
              }} />
            ) : 'Accedi al pannello'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <a href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', textDecoration: 'none' }}>
            ← Torna al sito
          </a>
        </div>
      </div>
    </div>
  )
}
