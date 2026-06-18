const BASE = import.meta.env.VITE_MOVIE_API_BASE_URL ?? 'http://127.0.0.1:8000'
const KEY = import.meta.env.VITE_MOVIE_API_KEY || ''

export class MovieApiError extends Error {
  constructor(status, body) {
    super(body?.detail || body?.error || `HTTP ${status}`)
    this.status = status
    this.body = body
  }
}

export async function movieApi(path, { params, signal } = {}) {
  const url = BASE.startsWith('http') ? new URL(BASE + path) : new URL(BASE + path, window.location.origin)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v != null && v !== '') url.searchParams.set(k, String(v))
    }
  }
  const res = await fetch(url, {
    headers: { 'X-API-Key': KEY },
    signal,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new MovieApiError(res.status, body)
  return body
}

/** Full URL for stream/subtitle paths (which are relative paths from /files) */
export function movieUrl(path) {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return BASE.startsWith('http') ? BASE + path : `${BASE}${path}`
}

/**
 * Convert SRT subtitle text to WebVTT blob URL.
 * Browsers only support WebVTT in <track> — SRT must be converted.
 */
export function srtToVttUrl(srtText) {
  const vtt = 'WEBVTT\n\n' + srtText.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2')
  return URL.createObjectURL(new Blob([vtt], { type: 'text/vtt' }))
}

/**
 * Fetch a subtitle file and return a WebVTT blob URL.
 * Handles the SRT->VTT conversion automatically.
 */
export async function fetchSubtitleAsVtt(subtitlePath) {
  const url = movieUrl(subtitlePath)
  const res = await fetch(url)
  if (!res.ok) return null
  const text = await res.text()
  return srtToVttUrl(text)
}

/**
 * Check if a signed stream URL is about to expire (< 30 min remaining).
 * Returns true if we should re-fetch /files before playing.
 */
export function isStreamUrlExpiringSoon(streamUrl) {
  try {
    const params = new URLSearchParams(streamUrl.split('?')[1])
    const exp = parseInt(params.get('exp') || '0', 10)
    const remaining = exp - Math.floor(Date.now() / 1000)
    return remaining < 30 * 60
  } catch {
    return false
  }
}
