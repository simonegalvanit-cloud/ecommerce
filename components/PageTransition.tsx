'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.animation = 'none'
    void el.offsetHeight // force reflow so animation restarts
    el.style.animation = ''
  }, [pathname])

  return (
    <div ref={ref} className="page-transition">
      {children}
    </div>
  )
}
