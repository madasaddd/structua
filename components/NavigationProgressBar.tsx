'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

// Module-level trigger — import and call this from any client component to start the bar
let _start: (() => void) | null = null

export function startNavigationProgress() {
  _start?.()
}

export function NavigationProgressBar() {
  const pathname = usePathname()
  const [phase, setPhase] = useState<'idle' | 'running' | 'completing'>('idle')
  const [width, setWidth] = useState(0)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const clear = () => {
    timers.current.forEach(clearTimeout)
    timers.current = []
  }

  // Expose start fn to module scope
  _start = () => {
    clear()
    setPhase('running')
    setWidth(15)
    // Fake incremental progress
    timers.current = [
      setTimeout(() => setWidth(35), 150),
      setTimeout(() => setWidth(55), 500),
      setTimeout(() => setWidth(72), 1200),
      setTimeout(() => setWidth(82), 2500),
    ]
  }

  // When pathname changes → navigation completed → sweep to 100% then hide
  useEffect(() => {
    if (phase === 'running') {
      clear()
      setPhase('completing')
      setWidth(100)
      const t = setTimeout(() => {
        setPhase('idle')
        setWidth(0)
      }, 450)
      timers.current = [t]
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  if (phase === 'idle') return null

  return (
    <div
      className="fixed top-0 left-0 z-[9999] h-[3px] rounded-r-full pointer-events-none"
      style={{
        width: `${width}%`,
        background: 'linear-gradient(90deg, #6366f1, #3b82f6, #06b6d4)',
        transition: phase === 'completing'
          ? 'width 350ms ease-out'
          : 'width 800ms cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 0 8px rgba(99, 102, 241, 0.6)',
      }}
    />
  )
}
