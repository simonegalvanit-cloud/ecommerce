'use client'
import { useState, useEffect } from 'react'
import type { InstagramPost } from '@/app/api/instagram/route'

interface FeedData {
  posts: InstagramPost[]
  configured: boolean
}

function IgIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" fill="url(#ig-grad)" />
      <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.6" fill="none" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
    </svg>
  )
}

function formatItalianDate(iso: string): string {
  const d = new Date(iso)
  const months = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

function PlaceholderCard() {
  return (
    <div style={{ borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--white)' }}>
      <div style={{
        aspectRatio: '1/1', background: 'linear-gradient(135deg,#f7ede0,#ecdcc6)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10,
      }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(165,100,35,0.35)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
          <circle cx="12" cy="12" r="4"/>
          <circle cx="17.5" cy="6.5" r="0.8" fill="rgba(165,100,35,0.35)" stroke="none"/>
        </svg>
        <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(165,100,35,0.45)', letterSpacing: '0.3px' }}>Foto in arrivo</span>
      </div>
    </div>
  )
}

export function InstagramFeed() {
  const [data, setData] = useState<FeedData | null>(null)

  useEffect(() => {
    fetch('/api/instagram')
      .then(r => r.json())
      .then(setData)
      .catch(() => setData({ posts: [], configured: false }))
  }, [])

  const showPlaceholders = !data || !data.configured || data.posts.length === 0

  return (
    <div style={{ padding: '64px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <IgIcon />
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--ink)', letterSpacing: '-0.4px', lineHeight: 1 }}>
              Seguici su Instagram
            </div>
            <a
              href="https://www.instagram.com/briopack_packaging/"
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: 13, color: 'var(--ink-4)', textDecoration: 'none', marginTop: 3, display: 'block' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#dc2743'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = 'var(--ink-4)'}
            >
              @briopack_packaging
            </a>
          </div>
        </div>
        <a
          href="https://www.instagram.com/briopack_packaging/"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 700,
            border: '1.5px solid var(--border)', color: 'var(--ink-3)',
            textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6,
            transition: 'all .15s',
          }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = '#dc2743'; el.style.color = '#dc2743' }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border)'; el.style.color = 'var(--ink-3)' }}
        >
          Apri profilo →
        </a>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20 }}>
        {showPlaceholders
          ? [0,1,2].map(i => <PlaceholderCard key={i} />)
          : data.posts.slice(0,3).map(post => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ textDecoration: 'none', color: 'inherit', display: 'block', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--white)', transition: 'transform .18s, box-shadow .18s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 12px 36px rgba(0,0,0,0.10)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '' }}
            >
              <div style={{ aspectRatio: '1/1', overflow: 'hidden', background: 'linear-gradient(135deg,#f7ede0,#ecdcc6)' }}>
                <img
                  src={post.media_url}
                  alt={post.caption?.slice(0,60) ?? 'Post Instagram'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .3s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'}
                  onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = ''}
                />
              </div>
              <div style={{ padding: '12px 14px 14px' }}>
                {post.caption && (
                  <div style={{ fontSize: 12.5, color: 'var(--ink-3)', lineHeight: 1.55, marginBottom: 6 }}>
                    {post.caption.length > 90 ? post.caption.slice(0,90) + '…' : post.caption}
                  </div>
                )}
                <div style={{ fontSize: 11, color: 'var(--ink-5)' }}>{formatItalianDate(post.timestamp)}</div>
              </div>
            </a>
          ))
        }
      </div>

      <style>{`@media(max-width:640px){.ig-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}
