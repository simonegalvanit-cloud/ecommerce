'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NavProps {
  cartCount?: number
  onCartClick?: () => void
  activeLink?: string
}

const NAV_LINKS = [
  { href: '/',  label: 'Shop',          key: 'shop' },
  { href: '#',  label: 'Industriale',   key: 'ind'  },
  { href: '#',  label: 'Food & Wine',   key: 'food' },
  { href: '#',  label: 'E-commerce',    key: 'ecom' },
  { href: '#',  label: 'BrioGreenPack', key: 'eco'  },
]

export default function Nav({ cartCount = 0, onCartClick, activeLink }: NavProps) {
  const [accountLabel, setAccountLabel] = useState<string | null>(null)
  const [accountHref, setAccountHref]   = useState('/login')
  const [scrolled, setScrolled]         = useState(false)
  const [menuOpen, setMenuOpen]         = useState(false)
  const [badgeBump, setBadgeBump]       = useState(false)
  const prevCount = useRef(cartCount)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setAccountLabel('Accedi'); return }
      const { data: profile } = await sb.from('profiles').select('role,full_name').eq('id', session.user.id).single()
      if (profile?.role === 'admin') {
        setAccountLabel('Admin'); setAccountHref('/admin')
      } else {
        const first = (profile?.full_name || '').split(' ')[0] || 'Account'
        setAccountLabel(first); setAccountHref('/account')
      }
    })
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (cartCount !== prevCount.current && cartCount > 0) {
      setBadgeBump(true)
      setTimeout(() => setBadgeBump(false), 350)
    }
    prevCount.current = cartCount
  }, [cartCount])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <nav className={`site-nav${scrolled ? ' scrolled' : ''}`}>
        <Link href="/" className="logo" onClick={() => setMenuOpen(false)} aria-label="Briopack home">
          <Image
            src="/logo.svg"
            alt="Briopack Packaging"
            width={148}
            height={36}
            priority
            style={{ filter: 'brightness(0) invert(1)', height: 32, width: 'auto' }}
          />
        </Link>

        {/* Desktop links */}
        <div className="nav-center">
          {NAV_LINKS.map(l => (
            <Link key={l.key} href={l.href} className={`nav-link${activeLink === l.key ? ' active' : ''}`}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className="nav-right">
          {accountLabel && (
            <Link href={accountHref} className="account-pill">
              <span className="account-pip" />
              {accountLabel}
            </Link>
          )}
          <button className="cart-pill" onClick={onCartClick} aria-label={`Carrello (${cartCount} articoli)`}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span className="hidden sm:inline">Carrello</span>
            <span className={`cart-badge${badgeBump ? ' bump' : ''}`}>{cartCount}</span>
          </button>

          <button
            className={`nav-hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="mobile-drawer open" onClick={() => setMenuOpen(false)}>
          <div className="mobile-drawer-panel" onClick={e => e.stopPropagation()}>
            <div className="mobile-drawer-logo">
              <Image src="/logo.svg" alt="Briopack" width={120} height={30} style={{ filter: 'brightness(0) invert(1)', height: 28, width: 'auto' }} />
            </div>
            {NAV_LINKS.map(l => (
              <Link key={l.key} href={l.href} className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="mobile-nav-divider" />
            <div className="mobile-nav-actions">
              {accountLabel ? (
                <Link href={accountHref} className="mobile-nav-btn primary" onClick={() => setMenuOpen(false)}>
                  {accountLabel === 'Admin' ? '⚙ Admin' : `👤 ${accountLabel}`}
                </Link>
              ) : (
                <Link href="/login" className="mobile-nav-btn primary" onClick={() => setMenuOpen(false)}>
                  Accedi
                </Link>
              )}
              <button className="mobile-nav-btn ghost" onClick={() => { setMenuOpen(false); onCartClick?.() }}>
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
                Carrello ({cartCount})
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="nav-spacer" />
    </>
  )
}
