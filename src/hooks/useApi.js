import { useEffect, useState, useRef } from 'react'
import { api } from '../lib/api.js'

export function useApi(path, params) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const paramsKey = JSON.stringify(params)

  useEffect(() => {
    if (!path) return
    const ac = new AbortController()
    setLoading(true)
    setError(null)
    api(path, { params, signal: ac.signal })
      .then((d) => setData(d))
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err)
      })
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [path, paramsKey])

  return { data, loading, error }
}
