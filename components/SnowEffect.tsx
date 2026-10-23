'use client'
import { useEffect, useRef } from 'react'

function isSnowSeason(): boolean {
  const now = new Date()
  const m = now.getMonth() + 1 // 1-12
  const d = now.getDate()
  return (m === 12 && d >= 1) || (m === 1 && d <= 6)
}

interface Flake {
  x: number
  y: number
  r: number
  speed: number
  drift: number
  driftPhase: number
  driftFreq: number
  opacity: number
}

export function SnowEffect() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!isSnowSeason()) return

    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    function resize() {
      if (!canvas) return
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const COUNT = 52
    const flakes: Flake[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      r: 1.5 + Math.random() * 2.8,
      speed: 0.4 + Math.random() * 1.1,
      drift: 0.3 + Math.random() * 0.5,
      driftPhase: Math.random() * Math.PI * 2,
      driftFreq: 0.004 + Math.random() * 0.006,
      opacity: 0.35 + Math.random() * 0.45,
    }))

    let frame = 0

    function draw() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      frame++

      for (const f of flakes) {
        f.y += f.speed
        f.x += Math.sin(frame * f.driftFreq + f.driftPhase) * f.drift

        if (f.y > canvas.height + 10) {
          f.y = -10
          f.x = Math.random() * canvas.width
        }
        if (f.x > canvas.width + 10) f.x = -10
        if (f.x < -10) f.x = canvas.width + 10

        ctx.beginPath()
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${f.opacity})`
        ctx.fill()
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  if (!isSnowSeason()) return null

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9990,
      }}
      aria-hidden="true"
    />
  )
}
