'use client'

import { useEffect, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

export default function TopLoadingBar() {
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Reset loading when navigation completes
  useEffect(() => {
    setIsLoading(false)
  }, [pathname, searchParams])

  useEffect(() => {
    const start = () => setIsLoading(true)
    const stop = () => setIsLoading(false)

    window.addEventListener('loading-start', start)
    window.addEventListener('loading-stop', stop)

    // Global listener for all Link/A tag clicks to show navigation feedback
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')
      
      if (
        link && 
        link.href && 
        !link.target && 
        !e.ctrlKey && 
        !e.metaKey && 
        !e.shiftKey && 
        !e.altKey &&
        link.origin === window.location.origin
      ) {
        // Only trigger if it's a new page (not just hash or same page)
        const isNewPage = link.pathname !== window.location.pathname || link.search !== window.location.search
        if (isNewPage) {
          start()
        }
      }
    }

    window.addEventListener('click', handleLinkClick)

    return () => {
      window.removeEventListener('loading-start', start)
      window.removeEventListener('loading-stop', stop)
      window.removeEventListener('click', handleLinkClick)
    }
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] bg-transparent z-[9999] pointer-events-none overflow-hidden">
      <div className="absolute top-0 h-full bg-[#1A1953] animate-top-loading-bar shadow-[0_0_8px_rgba(26,25,83,0.5)]" />
    </div>
  )
}
