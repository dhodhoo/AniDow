import { useEffect, useState } from 'react'
import { movieApi } from '../lib/movieApi.js'

export function useMovieApi(path, params) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const paramsKey = JSON.stringify(params)

  useEffect(() => {
    if (!path) { setLoading(false); return }
    const ac = new AbortController()
    setLoading(true)
    setError(null)
    movieApi(path, { params, signal: ac.signal })
      .then((d) => setData(d))
      .catch((err) => {
        if (err.name !== 'AbortError') setError(err)
      })
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [path, paramsKey])

  return { data, loading, error }
}
