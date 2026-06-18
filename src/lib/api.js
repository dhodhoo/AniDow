const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
const KEY = import.meta.env.VITE_API_KEY || ''

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error || `HTTP ${status}`)
    this.status = status
    this.body = body
  }
}

export async function api(path, { params, signal } = {}) {
  const url = BASE.startsWith('http') ? new URL(BASE + path) : new URL(BASE + path, window.location.origin)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v != null && v !== '') url.searchParams.set(k, String(v))
    }
  }
  const res = await fetch(url, {
    headers: KEY ? { 'X-API-Key': KEY } : {},
    signal,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(res.status, body)
  return body
}
