'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)
  const [animOut, setAnimOut] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem('bp_cookie_consent')) {
      const t = setTimeout(() => setVisible(true), 800)
      return () => clearTimeout(t)
    }
  }, [])

  function dismiss(choice: 'accepted' | 'declined') {
    localStorage.setItem('bp_cookie_consent', choice)
    setAnimOut(true)
    setTimeout(() => setVisible(false), 380)
  }

  if (!visible) return null

  return (
    <>
      <style>{`
        @keyframes cookieSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cookieSlideDown {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(24px); }
        }
        .cookie-banner {
          position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
          z-index: 9999; width: calc(100% - 32px); max-width: 680px;
          background: #fff; border: 1px solid rgba(0,0,0,0.1);
          border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.14), 0 2px 12px rgba(0,0,0,0.08);
          padding: 20px 24px; display: flex; align-items: center; gap: 20; flex-wrap: wrap;
          animation: cookieSlideUp .4s cubic-bezier(0.22,1,0.36,1) both;
        }
        .cookie-banner.out { animation: cookieSlideDown .38s ease forwards; }
        @media (max-width: 560px) {
          .cookie-banner { padding: 18px 16px; bottom: 16px; }
        }
      `}</style>
      <div className={`cookie-banner${animOut ? ' out' : ''}`} role="dialog" aria-label="Cookie consent">
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <svg width="16" height="16" fill="none" stroke="#e8721a" strokeWidth="1.8" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
            <span style={{ fontSize: 14, fontWeight: 700, color: '#111', fontFamily: 'var(--f)' }}>Utilizziamo i cookie</span>
          </div>
          <p style={{ fontSize: 13, color: '#666', lineHeight: 1.6, margin: 0, fontFamily: 'var(--f)' }}>
            Usiamo cookie tecnici necessari al funzionamento del sito e, previo consenso, cookie analitici per migliorare l&apos;esperienza.{' '}
            <Link href="/privacy" style={{ color: '#e8721a', textDecoration: 'underline', fontWeight: 500 }}>
              Privacy & Cookie Policy
            </Link>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <button
            onClick={() => dismiss('declined')}
            style={{ padding: '9px 18px', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 600, background: 'transparent', color: '#555', border: '1.5px solid #ddd', borderRadius: 9, cursor: 'pointer', transition: 'all .18s', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#bbb'; (e.currentTarget as HTMLElement).style.color = '#111' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#ddd'; (e.currentTarget as HTMLElement).style.color = '#555' }}>
            Solo necessari
          </button>
          <button
            onClick={() => dismiss('accepted')}
            style={{ padding: '9px 20px', fontFamily: 'var(--f)', fontSize: 13, fontWeight: 700, background: '#e8721a', color: '#fff', border: 'none', borderRadius: 9, cursor: 'pointer', transition: 'all .18s', boxShadow: '0 3px 12px rgba(232,114,26,0.35)', whiteSpace: 'nowrap' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#d4611a'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 16px rgba(232,114,26,0.5)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#e8721a'; (e.currentTarget as HTMLElement).style.boxShadow = '0 3px 12px rgba(232,114,26,0.35)' }}>
            Accetta tutti
          </button>
        </div>
      </div>
    </>
  )
}
