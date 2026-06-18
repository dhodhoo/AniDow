import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'anistream_watchlist'

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch {
    return []
  }
}

function save(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState(load)

  // Sync across tabs
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === STORAGE_KEY) setWatchlist(load())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const add = useCallback((item) => {
    setWatchlist(prev => {
      if (prev.find(i => i.slug === item.slug)) return prev
      const next = [{ ...item, addedAt: Date.now() }, ...prev]
      save(next)
      return next
    })
  }, [])

  const remove = useCallback((slug) => {
    setWatchlist(prev => {
      const next = prev.filter(i => i.slug !== slug)
      save(next)
      return next
    })
  }, [])

  const toggle = useCallback((item) => {
    setWatchlist(prev => {
      const exists = prev.find(i => i.slug === item.slug)
      const next = exists
        ? prev.filter(i => i.slug !== item.slug)
        : [{ ...item, addedAt: Date.now() }, ...prev]
      save(next)
      return next
    })
  }, [])

  const isInWatchlist = useCallback((slug) => {
    return watchlist.some(i => i.slug === slug)
  }, [watchlist])

  return { watchlist, add, remove, toggle, isInWatchlist }
}
