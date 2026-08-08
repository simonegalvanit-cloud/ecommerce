'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

const IDLE_MS = 60_000
const SPD     = 1.1  // px per frame at 60fps ≈ 66px/s

export default function Screensaver() {
  const [active, setActive] = useState(false)
  const [flash,  setFlash]  = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef   = useRef<number | null>(null)
  const logoRef  = useRef<HTMLDivElement>(null)
  const posRef   = useRef({ x: 200, y: 150 })
  const velRef   = useRef({ x: SPD,  y: SPD * 0.65 })

  // Idle timer: reset on any user activity, activate after IDLE_MS
  useEffect(() => {
    const restart = () => {
      setActive(false)
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(() => setActive(true), IDLE_MS)
    }
    const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'wheel', 'scroll']
    EVENTS.forEach(ev => window.addEventListener(ev, restart, { passive: true }))
    timerRef.current = setTimeout(() => setActive(true), IDLE_MS)
    return () => {
      EVENTS.forEach(ev => window.removeEventListener(ev, restart))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  // Bounce animation loop — runs only while active
  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      return
    }

    // Fresh random start position + direction each time
    posRef.current = {
      x: 80  + Math.random() * (window.innerWidth  - 300),
      y: 60  + Math.random() * (window.innerHeight - 120),
    }
    velRef.current = {
      x: SPD * (Math.random() > 0.5 ? 1 : -1),
      y: SPD * 0.65 * (Math.random() > 0.5 ? 1 : -1),
    }

    let flashTimer: ReturnType<typeof setTimeout> | null = null

    const step = () => {
      const el = logoRef.current
      if (!el) { rafRef.current = requestAnimationFrame(step); return }

      const vw = window.innerWidth
      const vh = window.innerHeight
      const w  = el.offsetWidth  || 200
      const h  = el.offsetHeight ||  50

      posRef.current.x += velRef.current.x
      posRef.current.y += velRef.current.y

      let hit = false
      if (posRef.current.x <= 0)      { posRef.current.x = 0;      velRef.current.x =  Math.abs(velRef.current.x); hit = true }
      if (posRef.current.x + w >= vw) { posRef.current.x = vw - w; velRef.current.x = -Math.abs(velRef.current.x); hit = true }
      if (posRef.current.y <= 0)      { posRef.current.y = 0;      velRef.current.y =  Math.abs(velRef.current.y); hit = true }
      if (posRef.current.y + h >= vh) { posRef.current.y = vh - h; velRef.current.y = -Math.abs(velRef.current.y); hit = true }

      el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`

      if (hit) {
        setFlash(true)
        if (flashTimer) clearTimeout(flashTimer)
        flashTimer = setTimeout(() => setFlash(false), 450)
      }

      rafRef.current = requestAnimationFrame(step)
    }

    rafRef.current = requestAnimationFrame(step)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (flashTimer) clearTimeout(flashTimer)
    }
  }, [active])

  if (!active) return null

  return (
    <div
      onClick={() => setActive(false)}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#000',
        cursor: 'none',
        animation: 'ssIn 0.5s ease both',
      }}
    >
      {/* Bouncing logo */}
      <div
        ref={logoRef}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          willChange: 'transform',
          transition: 'filter 0.12s ease',
          filter: flash
            ? 'brightness(0) invert(1) drop-shadow(0 0 20px #e8721a) drop-shadow(0 0 50px rgba(232,114,26,0.6))'
            : 'brightness(0) invert(1) drop-shadow(0 0 4px rgba(255,255,255,0.15))',
        }}
      >
        <Image
          src="/logo.png"
          alt="Briopack"
          width={190}
          height={46}
          style={{ height: 46, width: 'auto', display: 'block' }}
          priority
        />
      </div>

      {/* Dim hint */}
      <div style={{
        position: 'absolute',
        bottom: 30,
        left: '50%',
        transform: 'translateX(-50%)',
        fontSize: 12,
        color: 'rgba(255,255,255,0.18)',
        letterSpacing: '0.6px',
        fontFamily: 'var(--f)',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}>
        Tocca o clicca per continuare
      </div>

      <style>{`
        @keyframes ssIn {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
      `}</style>
    </div>
  )
}
