'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const IcGrid = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
const IcBox = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M13.5 4.5L8 1.5 2.5 4.5v7L8 14.5l5.5-3v-7z"/><path d="M8 1.5v13M2.5 4.5l5.5 3 5.5-3"/></svg>
const IcClipboard = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><rect x="2" y="3" width="12" height="12" rx="1"/><path d="M5 3V2a1 1 0 011-1h4a1 1 0 011 1v1M5 8h6M5 11h4"/></svg>
const IcUsers = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><circle cx="6" cy="5" r="3"/><path d="M1 14c0-3 2-5 5-5s5 2 5 5"/><path d="M11 2c1.7 0 3 1.3 3 3s-1.3 3-3 3"/><path d="M15 14c0-2-1-4-3-4.5"/></svg>
const IcSettings = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.41 1.41M11.54 11.54l1.41 1.41M3.05 12.95l1.41-1.41M11.54 4.46l1.41-1.41"/></svg>
const IcExternalLink = () => <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 16 16"><path d="M7 3H3a1 1 0 00-1 1v9a1 1 0 001 1h9a1 1 0 001-1V9"/><path d="M10 1h5v5"/><path d="M15 1L8 8"/></svg>
const IcLogout = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" viewBox="0 0 16 16"><path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M11 5l4 3-4 3M15 8H7"/></svg>

type NavItem  = { href: string; label: string; icon: React.ReactElement; external?: boolean }
type NavGroup = { section: string; items: NavItem[] }

const NAV_ITEMS: NavGroup[] = [
  { section: 'Principale', items: [
    { href: '/admin',          label: 'Dashboard', icon: <IcGrid /> },
    { href: '/admin/products', label: 'Prodotti',  icon: <IcBox /> },
    { href: '/admin/orders',   label: 'Ordini',    icon: <IcClipboard /> },
  ]},
  { section: 'Gestione', items: [
    { href: '/admin/customers', label: 'Clienti',      icon: <IcUsers /> },
    { href: '/admin/settings',  label: 'Impostazioni', icon: <IcSettings /> },
  ]},
  { section: 'Negozio', items: [
    { href: '/', label: 'Vai al negozio', icon: <IcExternalLink />, external: true },
  ]},
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const sb       = createClient()

  const [adminName, setAdminName] = useState('Admin')
  const [ready, setReady] = useState(false)
  const [newOrders, setNewOrders] = useState(0)

  useEffect(() => {
    // Cookie is httpOnly — if middleware allowed through, bypass is valid
    const storedName = sessionStorage.getItem('bp_admin_name')
    if (storedName) {
      setAdminName(storedName)
      setReady(true)
    } else {
      ;(async () => {
        const { data: { session } } = await sb.auth.getSession()
        if (!session) { router.push('/admin-panel'); return }
        const { data: profile } = await sb.from('profiles').select('role,full_name').eq('id', session.user.id).single()
        if (!profile || profile.role !== 'admin') { router.push('/admin-panel'); return }
        setAdminName(profile.full_name || session.user.email || 'Admin')
        setReady(true)
      })()
    }
  }, [])

  // Poll for new orders every 30s
  useEffect(() => {
    async function checkNewOrders() {
      const lastSeen = localStorage.getItem('bp_admin_orders_seen') || new Date(0).toISOString()
      const { count } = await sb
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .gt('created_at', lastSeen)
      setNewOrders(count ?? 0)
    }
    checkNewOrders()
    const t = setInterval(checkNewOrders, 30000)
    return () => clearInterval(t)
  }, [])

  async function handleLogout() {
    sessionStorage.removeItem('bp_admin_name')
    await fetch('/api/admin-logout', { method: 'POST' })
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

  const initials = adminName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'var(--f)' }}>
      {/* Sidebar */}
      <aside style={{ width: 224, flexShrink: 0, background: '#161616', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Logo */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Image src="/logo.png" alt="Briopack" width={100} height={24} style={{ height: 22, width: 'auto', filter: 'brightness(0) invert(1)' }} />
          <span style={{ fontSize: 9, fontWeight: 700, background: 'var(--accent)', color: '#fff', padding: '2px 7px', borderRadius: 4, letterSpacing: '0.6px', textTransform: 'uppercase', flexShrink: 0 }}>Admin</span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '10px 8px' }}>
          {NAV_ITEMS.map(group => (
            <div key={group.section} style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.25)', padding: '10px 12px 5px' }}>{group.section}</div>
              {group.items.map(item => {
                const isActive = item.href !== '/' && (item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href))
                if (item.external) {
                  return (
                    <a key={item.href} href="/" target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.45)', cursor: 'pointer', transition: 'all .15s', textDecoration: 'none' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.45)' }}>
                      <span style={{ opacity: 0.6 }}>{item.icon}</span>
                      {item.label}
                    </a>
                  )
                }
                const isOrders = item.href === '/admin/orders'
                const badge = isOrders && newOrders > 0
                return (
                  <Link key={item.href} href={item.href}
                    onClick={() => {
                      if (isOrders) {
                        localStorage.setItem('bp_admin_orders_seen', new Date().toISOString())
                        setNewOrders(0)
                      }
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', borderRadius: 8, fontSize: 13, fontWeight: isActive ? 600 : 500, color: isActive ? '#fff' : 'rgba(255,255,255,0.5)', background: isActive ? 'rgba(232,114,26,0.18)' : 'transparent', cursor: 'pointer', transition: 'all .15s', textDecoration: 'none' }}
                    onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.8)' }}}
                    onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)' }}}>
                    <span style={{ color: isActive ? 'var(--accent)' : undefined }}>{item.icon}</span>
                    {item.label}
                    {badge && (
                      <span style={{ marginLeft: 'auto', minWidth: 18, height: 18, borderRadius: 9, background: '#ef4444', color: '#fff', fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 5px', flexShrink: 0 }}>
                        {newOrders > 99 ? '99+' : newOrders}
                      </span>
                    )}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Bottom: user + logout */}
        <div style={{ padding: '10px 8px 14px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 12px', borderRadius: 8, marginBottom: 4 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adminName}</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)' }}>Amministratore</div>
            </div>
          </div>
          <button onClick={handleLogout}
            style={{ width: '100%', padding: '7px 12px', fontFamily: 'var(--f)', fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.4)', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center', gap: 7 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)' }}>
            <IcLogout />
            Esci
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
