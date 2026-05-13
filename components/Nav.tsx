'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NavProps {
  cartCount?: number
  onCartClick?: () => void
  activeLink?: string
}

export default function Nav({ cartCount = 0, onCartClick, activeLink }: NavProps) {
  const [accountLabel, setAccountLabel] = useState<string | null>(null)
  const [accountHref, setAccountHref]   = useState('/login')

  useEffect(() => {
    const sb = createClient()
    sb.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { setAccountLabel('Accedi'); return }
      const { data: profile } = await sb.from('profiles').select('role,full_name').eq('id', session.user.id).single()
      if (profile?.role === 'admin') {
        setAccountLabel('Admin')
        setAccountHref('/admin')
      } else {
        const first = (profile?.full_name || '').split(' ')[0] || 'Account'
        setAccountLabel(first)
        setAccountHref('/account')
      }
    })
  }, [])

  return (
    <nav className="site-nav">
      <Link href="/" className="logo">
        <span className="logo-pip" />
        Briopack
      </Link>

      <div className="nav-center">
        <Link href="/" className={`nav-link ${activeLink === 'shop' ? 'active' : ''}`}>Shop</Link>
        <Link href="#" className="nav-link">Industriale</Link>
        <Link href="#" className="nav-link">Food & Wine</Link>
        <Link href="#" className="nav-link">E-commerce</Link>
        <Link href="#" className="nav-link">BrioGreenPack</Link>
      </div>

      <div className="nav-right">
        {accountLabel && (
          <Link href={accountHref} className="account-pill">
            <span className="account-pip" />
            {accountLabel}
          </Link>
        )}
        <button className="cart-pill" onClick={onCartClick}>
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
          </svg>
          Carrello <span className="cart-badge">{cartCount}</span>
        </button>
      </div>
    </nav>
  )
}
