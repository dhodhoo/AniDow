import { useEffect, useState, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { api } from '../lib/api.js'
import { movieApi } from '../lib/movieApi.js'
import { useBreakpoint } from '../hooks/useBreakpoint.js'
import { useScrollToTop } from '../hooks/useScrollToTop.js'

export default function SearchPage() {
  useScrollToTop()
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const query = searchParams.get('q') || ''
  const mode = searchParams.get('mode') || 'anime'
  const { isMobile, isTablet } = useBreakpoint()

  useEffect(() => {
    document.title = query ? `Hasil "${query}" — ANIDOW` : 'Cari Anime & Film — ANIDOW'
  }, [query])

  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [inputVal, setInputVal] = useState(query)

  // Suggestions state
  const [suggestions, setSuggestions] = useState([])
  const [suggestLoading, setSuggestLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef(null)
  const suggestRef = useRef(null)

  // Sync input with URL
  useEffect(() => { setInputVal(query) }, [query])

  // Close suggestions on outside click
  useEffect(() => {
    const onClick = (e) => {
      if (suggestRef.current && !suggestRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Debounced suggestions fetch
  useEffect(() => {
    if (inputVal.length < 2) { setSuggestions([]); setShowSuggestions(false); return }
    const id = setTimeout(async () => {
      setSuggestLoading(true)
      try {
        if (mode === 'film') {
          const data = await movieApi('/suggest', { params: { q: inputVal } })
          const items = (data.suggestions || []).slice(0, 7).map(s => ({ title: s, slug: null }))
          setSuggestions(items)
        } else {
          const data = await api('/api/search', { params: { q: inputVal } })
          const items = (data.items || []).filter(i => i.kind !== 'episode').slice(0, 7)
          setSuggestions(items)
        }
        setShowSuggestions(true)
      } catch {
        setSuggestions([])
      } finally {
        setSuggestLoading(false)
      }
    }, 300)
    return () => clearTimeout(id)
  }, [inputVal, mode])

  // Fetch results when query or mode changes
  useEffect(() => {
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    setError(null)

    if (mode === 'film') {
      // Use MovieBox API for film search
      const ac = new AbortController()
      movieApi('/search', { params: { q: query, type: 'all', page: 1 }, signal: ac.signal })
        .then(data => {
          setResults((data.items || []).filter(i => i.hasResource))
        })
        .catch(err => {
          if (err.name !== 'AbortError') setError(err.message)
        })
        .finally(() => setLoading(false))
      return () => ac.abort()
    }

    // Anime: hit API
    const ac = new AbortController()
    api('/api/search', { params: { q: query }, signal: ac.signal })
      .then(data => {
        const items = (data.items || []).filter(i => i.kind !== 'episode')
        setResults(items)
      })
      .catch(err => {
        if (err.name !== 'AbortError') setError(err.message)
      })
      .finally(() => setLoading(false))
    return () => ac.abort()
  }, [query, mode])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!inputVal.trim()) return
    setShowSuggestions(false)
    setSearchParams({ q: inputVal.trim(), mode })
  }

  const handleSuggestionClick = (item) => {
    setShowSuggestions(false)
    if (mode === 'film') {
      // Film suggestions from /suggest only return title strings — go to search results
      if (item.slug) {
        navigate(`/film/${encodeURIComponent(item.slug)}`)
      } else {
        setSearchParams({ q: item.title, mode })
      }
    } else {
      navigate(`/detail/${item.slug}`)
    }
  }

  const switchMode = (newMode) => {
    setSuggestions([])
    setSearchParams({ q: query, mode: newMode })
  }

  return (
    <div style={{ backgroundColor: '#141414', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ height: '68px', flexShrink: 0 }} />

      {/* Search header */}
      <div style={{ boxSizing: 'border-box', paddingInline: isMobile ? '16px' : isTablet ? '24px' : '48px', paddingTop: '40px' }}>
        <form onSubmit={handleSearch} style={{ alignItems: isMobile ? 'stretch' : 'center', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px', marginBottom: '32px' }}>
          {/* Mode toggles */}
          <div style={{ alignItems: 'center', backgroundColor: '#1F1F1F', border: '1px solid #333333', borderRadius: '8px', display: 'flex', flexShrink: 0, padding: '4px' }}>
            <ModeBtn label="Anime" active={mode === 'anime'} accent="#7C3AED" onClick={() => switchMode('anime')} />
            <ModeBtn label="Film & TV" active={mode === 'film'} accent="#A855F7" onClick={() => switchMode('film')} />
          </div>

          {/* Input + suggestion dropdown */}
          <div ref={suggestRef} style={{ flex: 1, maxWidth: isMobile ? '100%' : '560px', position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2"
              style={{ left: '14px', pointerEvents: 'none', position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            {suggestLoading && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2"
                style={{ animation: 'spin 0.8s linear infinite', position: 'absolute', right: '14px', top: '19px', zIndex: 1 }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            )}
            <input
              ref={inputRef}
              autoFocus
              value={inputVal}
              onChange={e => { setInputVal(e.target.value); if (e.target.value.length >= 2) setShowSuggestions(true) }}
              onKeyDown={e => { if (e.key === 'Escape') setShowSuggestions(false) }}
              onFocus={e => { e.target.style.borderColor = '#7C3AED'; if (suggestions.length > 0) setShowSuggestions(true) }}
              onBlur={e => e.target.style.borderColor = '#333333'}
              placeholder={mode === 'anime' ? 'Cari anime...' : 'Cari film atau serial...'}
              style={{
                backgroundColor: '#1F1F1F',
                border: '1px solid #333333',
                borderRadius: showSuggestions && suggestions.length > 0 ? '8px 8px 0 0' : '8px',
                color: '#FFFFFF',
                fontSize: '15px',
                outline: 'none',
                padding: '12px 40px 12px 44px',
                transition: 'border-color 0.15s',
                width: '100%',
              }}
            />

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div style={{
                backgroundColor: '#1A1A1A',
                border: '1px solid #333333',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                left: 0,
                maxHeight: '360px',
                overflowY: 'auto',
                position: 'absolute',
                right: 0,
                top: '100%',
                zIndex: 50,
              }}>
                {suggestions.map((item, i) => (
                  <button
                    key={item.slug || i}
                    type="button"
                    onClick={() => handleSuggestionClick(item)}
                    style={{
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      borderBottom: i < suggestions.length - 1 ? '1px solid #2D2D2D' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '12px',
                      padding: '10px 14px',
                      textAlign: 'left',
                      transition: 'background-color 0.12s',
                      width: '100%',
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2D2D2D'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Thumbnail */}
                    <div style={{ borderRadius: '4px', flexShrink: 0, height: '48px', overflow: 'hidden', width: '34px' }}>
                      {(item.image || item.img) ? (
                        <img src={item.image || item.img} alt={item.title}
                          style={{ height: '100%', objectFit: 'cover', width: '100%' }} />
                      ) : (
                        <div style={{ backgroundColor: '#2D2D2D', height: '100%', width: '100%' }} />
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </div>
                      <div style={{ alignItems: 'center', display: 'flex', gap: '8px', marginTop: '2px' }}>
                        {item.status && <span style={{ color: '#A3A3A3', fontSize: '11px' }}>{item.status}</span>}
                        {item.rating && <span style={{ color: '#A855F7', fontSize: '11px' }}>&#9733; {item.rating}</span>}
                        {item.genres && <span style={{ color: '#555', fontSize: '10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.genres}</span>}
                      </div>
                    </div>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path d="M9 18l6-6-6-6"/>
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" style={{
            alignItems: 'center',
            backgroundColor: '#7C3AED',
            border: 'none',
            borderRadius: '8px',
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            fontSize: '14px',
            fontWeight: 700,
            gap: '8px',
            paddingBlock: '12px',
            paddingInline: '24px',
            transition: 'filter 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            Cari
          </button>
        </form>

        {/* Result count */}
        {query && !loading && (
          <div style={{ color: '#A3A3A3', fontSize: '14px', marginBottom: '24px' }}>
            {error ? (
              <span style={{ color: '#7C3AED' }}>Gagal memuat: {error}</span>
            ) : (
              <>
                Menampilkan <span style={{ color: '#FFFFFF', fontWeight: 600 }}>{results.length}</span> hasil untuk{' '}
                <span style={{ color: '#FFFFFF', fontWeight: 600 }}>&ldquo;{query}&rdquo;</span>
                {' '}di <span style={{ color: mode === 'anime' ? '#7C3AED' : '#A855F7', fontWeight: 600 }}>
                  {mode === 'anime' ? 'Anime' : 'Film & TV Series'}
                </span>
              </>
            )}
          </div>
        )}

        {/* Loading skeletons */}
        {loading && (
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '140px' : '180px'}, 1fr))`, paddingBottom: '56px' }}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} style={{
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.06}s`,
                aspectRatio: '2/3',
                backgroundColor: '#2D2D2D',
                borderRadius: '8px',
              }} />
            ))}
          </div>
        )}

        {/* Results grid */}
        {!loading && results.length > 0 && (
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '140px' : '180px'}, 1fr))`, paddingBottom: '56px' }}>
            {results.map((item, i) => (
              <ResultCard key={item.slug || i} item={item} mode={mode} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && query && results.length === 0 && (
          <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '16px', paddingBlock: '80px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span style={{ color: '#A3A3A3', fontSize: '16px' }}>Tidak ada hasil untuk &ldquo;{query}&rdquo;</span>
            <span style={{ color: '#555555', fontSize: '13px' }}>Coba kata kunci lain atau ganti mode pencarian</span>
          </div>
        )}

        {/* Initial state — no query yet */}
        {!query && (
          <div style={{ alignItems: 'center', display: 'flex', flexDirection: 'column', gap: '12px', paddingBlock: '80px' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#333333" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <span style={{ color: '#A3A3A3', fontSize: '16px' }}>Ketik untuk mulai mencari</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}

function ResultCard({ item, mode }) {
  // Film mode: item has subjectId, detailPath, cover, subjectType from MovieBox
  // Anime mode: item has slug, image from Otakudesu
  const isFilm = mode === 'film'
  const img = isFilm ? item.cover : (item.image || item.img)
  const to = isFilm
    ? `/film/${encodeURIComponent(item.detailPath)}`
    : `/detail/${item.slug}`
  const badgeBg = isFilm
    ? (item.subjectType === 'tv_series' ? '#A855F7' : '#A855F7')
    : '#7C3AED'
  const badgeText = isFilm
    ? (item.subjectType === 'tv_series' ? 'TV' : 'Film')
    : (item.status || null)
  const badgeTextColor = badgeBg === '#A855F7' ? '#FFFFFF' : '#FFFFFF'

  return (
    <Link to={to} className="card-thumb" style={{
      borderRadius: '8px',
      display: 'block',
      overflow: 'hidden',
      position: 'relative',
      textDecoration: 'none',
    }}>
      {img ? (
        <img src={img} alt={item.title} loading="lazy"
          style={{ aspectRatio: '2/3', display: 'block', objectFit: 'cover', width: '100%' }} />
      ) : (
        <div style={{ aspectRatio: '2/3', backgroundColor: '#2D2D2D', width: '100%' }} />
      )}
      <div style={{ background: 'linear-gradient(to top, rgba(20,20,20,0.95) 0%, transparent 60%)', bottom: 0, height: '60%', left: 0, position: 'absolute', right: 0 }} />
      <div style={{ bottom: '8px', left: '8px', position: 'absolute', right: '8px' }}>
        {badgeText && (
          <div style={{
            backgroundColor: badgeBg,
            borderRadius: '3px',
            color: badgeTextColor,
            display: 'inline-block',
            fontSize: '9px',
            fontWeight: 700,
            marginBottom: '4px',
            paddingBlock: '2px',
            paddingInline: '6px',
          }}>{badgeText}</div>
        )}
        <div style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 700, lineHeight: '1.35' }}>{item.title}</div>
        {item.rating && <div style={{ color: '#A855F7', fontSize: '10px', marginTop: '2px' }}>&#9733; {item.rating}</div>}
        {item.genres && <div style={{ color: '#A3A3A3', fontSize: '10px', marginTop: '1px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.genres}</div>}
      </div>
    </Link>
  )
}

function ModeBtn({ label, active, accent, onClick }) {
  return (
    <button type="button" onClick={onClick} style={{
      backgroundColor: active ? accent : 'transparent',
      border: 'none',
      borderRadius: '6px',
      color: active ? (accent === '#A855F7' ? '#FFFFFF' : '#FFFFFF') : '#A3A3A3',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: active ? 700 : 400,
      padding: '6px 14px',
      transition: 'background-color 0.15s, color 0.15s',
      whiteSpace: 'nowrap',
    }}>{label}</button>
  )
}
