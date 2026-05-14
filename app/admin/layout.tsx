'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type NavItem = { href: string; label: string; icon: string; external?: boolean }
type NavGroup = { section: string; items: NavItem[] }

const NAV_ITEMS: NavGroup[] = [
  { section: 'Principale', items: [
    { href: '/admin',          label: 'Dashboard', icon: '⊞' },
    { href: '/admin/products', label: 'Prodotti',  icon: '📦' },
    { href: '/admin/orders',   label: 'Ordini',    icon: '🗒️' },
  ]},
  { section: 'Gestione', items: [
    { href: '/admin/customers', label: 'Clienti',      icon: '👥' },
    { href: '/admin/settings',  label: 'Impostazioni', icon: '⚙️' },
  ]},
  { section: 'Negozio', items: [
    { href: '/', label: 'Vai al negozio', icon: '↗', external: true },
  ]},
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const sb       = createClient()

  const [adminName, setAdminName] = useState('Admin')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Bypass: hardcoded admin token from /admin-panel
    if (sessionStorage.getItem('bp_admin_bypass') === 'briopack_admin_2025') {
      setAdminName('Simone')
      setReady(true)
      return
    }

    // Normal Supabase role check
    ;(async () => {
      const { data: { session } } = await sb.auth.getSession()
      if (!session) { router.push('/admin-panel'); return }

      const { data: profile } = await sb.from('profiles').select('role,full_name').eq('id', session.user.id).single()
      if (!profile || profile.role !== 'admin') {
        router.push('/admin-panel')
        return
      }
      setAdminName(profile.full_name || session.user.email || 'Admin')
      setReady(true)
    })()
  }, [])

  async function handleLogout() {
    sessionStorage.removeItem('bp_admin_bypass')
    await sb.auth.signOut()
    router.push('/')
  }

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a1a' }}>
        <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3, borderTopColor: '#e8721a' }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--f)' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, flexShrink: 0, background: '#1a1a1a', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto' }}>
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Image src="/logo.png" alt="Briopack" width={100} height={24} style={{ height: 24, width: 'auto', filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontSize: 9, fontWeight: 600, background: 'var(--accent)', color: '#fff', padding: '2px 6px', borderRadius: 3, letterSpacing: '0.5px', textTransform: 'uppercase', flexShrink: 0 }}>Admin</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px' }}>
          {NAV_ITEMS.map(group => (
            <div key={group.section}>
              <div style={{ fontSize: 9.5, fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', padding: '12px 12px 6px' }}>{group.section}</div>
              {group.items.map(item => {
                const isActive = item.href !== '/' && (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href))
                if (item.external) {
                  return (
                    <a key={item.href} href="/" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 'var(--r)', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', transition: 'all .18s', textDecoration: 'none' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#2e2e2e'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)' }}>
                      <span style={{ fontSize: 14 }}>{item.icon}</span>
                      <span>{item.label}</span>
                    </a>
                  )
                }
                return (
                  <Link key={item.href} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 'var(--r)', fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? '#fff' : 'rgba(255,255,255,0.6)', background: isActive ? 'var(--accent)' : 'transparent', cursor: 'pointer', transition: 'all .18s', textDecoration: 'none' }}>
                    <span style={{ fontSize: 14 }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Bottom user + logout */}
        <div style={{ padding: '12px 8px 16px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--r)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0 }}>👤</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminName}</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)' }}>Amministratore</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '8px 12px', fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.5)', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 'var(--r)', cursor: 'pointer', transition: 'all .18s', marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.25)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)' }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 5l4 3-4 3M15 8H7"/></svg>
            <span>Esci</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflow: 'auto', background: 'var(--surface)' }}>
        {children}
      </div>
    </div>
  )
}
