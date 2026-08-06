import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Briopack — Packaging professionale su misura'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d1f0e 50%, #1a1a1a 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Glow */}
        <div style={{
          position: 'absolute', width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(232,114,26,0.25) 0%, transparent 70%)',
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        }} />

        {/* Logo area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          {/* Cube icon */}
          <svg width="72" height="72" viewBox="0 0 60 60" fill="none">
            <polygon points="30,4 56,18 56,42 30,56 4,42 4,18" fill="#e8721a" opacity="0.15"/>
            <polygon points="30,4 56,18 30,32 4,18" fill="#f9b133"/>
            <polygon points="4,18 30,32 30,56 4,42" fill="#e8891a"/>
            <polygon points="56,18 30,32 30,56 56,42" fill="#c97010"/>
          </svg>
          {/* BRI text */}
          <span style={{ fontSize: 72, fontWeight: 900, color: '#ffffff', letterSpacing: '-2px', lineHeight: 1 }}>BRI</span>
          <span style={{ fontSize: 72, fontWeight: 900, color: '#9a9a9a', letterSpacing: '-2px', lineHeight: 1 }}>PACK</span>
        </div>

        <div style={{ fontSize: 13, letterSpacing: '6px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', marginBottom: 48 }}>
          PACKAGING
        </div>

        {/* Tagline */}
        <div style={{ fontSize: 36, fontWeight: 700, color: '#ffffff', textAlign: 'center', lineHeight: 1.3, maxWidth: 700 }}>
          Il packaging professionale,<br/>ordinato online.
        </div>
        <div style={{ fontSize: 20, color: 'rgba(255,255,255,0.55)', marginTop: 20, textAlign: 'center' }}>
          Shopper · Wine box · Buste e-commerce · Cesti regalo
        </div>

        {/* Bottom bar */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 6, background: 'linear-gradient(90deg, #f9b133, #e8721a, #c97010)',
        }} />
      </div>
    ),
    size,
  )
}
