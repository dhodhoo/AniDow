import { useEffect, useRef } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export function useScrollToTop() {
  const { pathname } = useLocation()
  const navigationType = useNavigationType()
  const latestY = useRef(0)

  useEffect(() => {
    const onScroll = () => { latestY.current = window.scrollY }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    if (navigationType === 'POP') {
      const saved = sessionStorage.getItem(`scroll:${pathname}`)
      window.scrollTo(0, saved ? parseInt(saved, 10) : 0)
    } else {
      window.scrollTo(0, 0)
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      sessionStorage.setItem(`scroll:${pathname}`, String(latestY.current !== 0 ? latestY.current : window.scrollY))
    }
  }, [])
}
