import { useEffect, useState } from 'react'
import type { TapControlAvailability } from '../types'

function detectTapControlAvailability(): TapControlAvailability {
  if (typeof window === 'undefined') {
    return 'desktop'
  }

  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches
  const isMobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(
    window.navigator.userAgent,
  )

  return isCoarsePointer || isMobileUserAgent ? 'mobile' : 'desktop'
}

export function useTapControlAvailability() {
  const [availability, setAvailability] = useState<TapControlAvailability>(
    detectTapControlAvailability(),
  )

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)')

    const updateAvailability = () => {
      setAvailability(detectTapControlAvailability())
    }

    updateAvailability()
    mediaQuery.addEventListener('change', updateAvailability)

    return () => mediaQuery.removeEventListener('change', updateAvailability)
  }, [])

  return availability
}
