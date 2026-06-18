import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api.js'

/**
 * Full-screen search overlay.
 * Step 1: user picks a category (Anime | Film & TV)
 * Step 2: user types query
 * - Anime: hits /api/search?q=...
 * - Film & TV: filters static list
 */
export default function SearchOverlay({ onClose }) {
  const [category, setCategory] = useState(null) // null | 'anime' | 'film'
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Focus input when category selected
  useEffect(() => {
    if (category) setTimeout(() => inputRef.current?.focus(), 80)
  }, [category])

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2 || !category) { setResults([]); return }
    const id = setTimeout(async () => {
      setLoading(true)
      try {
        if (category === 'anime') {
          const data = await api('/api/search', { params: { q: query } })
          setResults(data.items || [])
        } else {
          // Filter static film data
          const q = query.toLowerCase()
          setResults(filmData.filter(f => f.title.toLowerCase().includes(q)))
        }
      } catch {
        setResults([])
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => clearTimeout(id)
  }, [query, category])

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSelect = (item) => {
    onClose()
    if (category === 'anime' && item.slug) {
      navigate(`/detail/${item.slug}`)
    } else if (category === 'film') {
      navigate(`/detail/${item.slug}`)
    }
  }

  return (
    <div style={{
      alignItems: 'flex-start',
      backdropFilter: 'blur(8px)',
      backgroundColor: 'rgba(14,14,14,0.92)',
      bottom: 0,
      display: 'flex',
      justifyContent: 'center',
      left: 0,
      overflowY: 'auto',
      paddingTop: '120px',
      position: 'fixed',
      right: 0,
      top: 0,
      zIndex: 200,
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '560px' }}>

        {/* Close */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ alignItems: 'center', background: 'none', border: 'none', color: '#A3A3A3', cursor: 'pointer', display: 'flex', gap: '6px', fontSize: '13px', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#FFF'}
            onMouseLeave={e => e.currentTarget.style.color = '#A3A3A3'}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
            ESC
          </button>
        </div>

        {/* Step 1: Category picker */}
        {!category ? (
          <>
            <div style={{ color: '#FFFFFF', fontSize: '22px', fontWeight: 700, textAlign: 'center' }}>Cari di mana?</div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <CategoryBtn
                label="Anime"
                accent="#E50914"
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M8 12s1.5-4 4-4 4 4 4 4"/>
                    <circle cx="9" cy="12" r="1" fill="currentColor"/>
                    <circle cx="15" cy="12" r="1" fill="currentColor"/>
                  </svg>
                }
                onClick={() => setCategory('anime')}
              />
              <CategoryBtn
                label="Film & TV Series"
                accent="#F5C518"
                icon={
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="4" width="20" height="16" rx="2"/>
                    <path d="M8 4v16"/>
                    <path d="M16 4v16"/>
                    <path d="M2 9h20"/>
                    <path d="M2 15h20"/>
                  </svg>
                }
                onClick={() => setCategory('film')}
              />
            </div>
          </>
        ) : (
          <>
            {/* Category badge + back */}
            <div style={{ alignItems: 'center', display: 'flex', gap: '10px' }}>
              <button onClick={() => { setCategory(null); setQuery(''); setResults([]) }} style={{ alignItems: 'center', background: 'none', border: 'none', color: '#A3A3A3', cursor: 'pointer', display: 'flex', gap: '6px', fontSize: '13px' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                Kembali
              </button>
              <span style={{
                backgroundColor: category === 'anime' ? '#E50914' : '#F5C518',
                borderRadius: '4px',
                color: category === 'anime' ? '#FFFFFF' : '#141414',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                paddingBlock: '3px',
                paddingInline: '10px',
                textTransform: 'uppercase',
              }}>
                {category === 'anime' ? 'Anime' : 'Film & TV'}
              </span>
            </div>

            {/* Search input */}
            <div style={{ position: 'relative' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" style={{ left: '14px', position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}>
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={category === 'anime' ? 'Cari anime...' : 'Cari film atau serial...'}
                style={{
                  backgroundColor: '#1F1F1F',
                  border: '1px solid #333333',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '16px',
                  outline: 'none',
                  paddingBlock: '14px',
                  paddingInline: '14px 14px 14px 44px',
                  padding: '14px 14px 14px 44px',
                  width: '100%',
                }}
              />
              {loading && (
                <div style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Results */}
            {results.length > 0 && (
              <div style={{ backgroundColor: '#1F1F1F', border: '1px solid #2D2D2D', borderRadius: '8px', display: 'flex', flexDirection: 'column', maxHeight: '400px', overflowY: 'auto' }}>
                {results.map((item, i) => (
                  <button key={item.slug || item.url || i} onClick={() => handleSelect(item)} style={{
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    borderBottom: i < results.length - 1 ? '1px solid #2D2D2D' : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '12px',
                    padding: '12px 16px',
                    textAlign: 'left',
                    transition: 'background-color 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2D2D2D'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                      {(item.kind || item.status || item.rating) && (
                        <div style={{ color: '#A3A3A3', fontSize: '11px', marginTop: '2px' }}>
                          {[item.kind, item.status, item.rating && `★ ${item.rating}`].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {query.length >= 2 && results.length === 0 && !loading && (
              <div style={{ color: '#A3A3A3', fontSize: '14px', textAlign: 'center' }}>Tidak ada hasil untuk "{query}"</div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function CategoryBtn({ label, accent, icon, onClick }) {
  return (
    <button onClick={onClick} style={{
      alignItems: 'center',
      backgroundColor: '#1F1F1F',
      border: `1px solid #333333`,
      borderRadius: '12px',
      color: '#FFFFFF',
      cursor: 'pointer',
      display: 'flex',
      flex: 1,
      flexDirection: 'column',
      fontSize: '15px',
      fontWeight: 600,
      gap: '12px',
      padding: '28px 20px',
      transition: 'border-color 0.15s, background-color 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = accent; e.currentTarget.style.backgroundColor = '#2D2D2D' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#333333'; e.currentTarget.style.backgroundColor = '#1F1F1F' }}
    >
      <span style={{ color: accent }}>{icon}</span>
      {label}
    </button>
  )
}

// Static film data for client-side search
const filmData = [
  { title: 'Dune: Part Two', slug: 'dune2', rating: '8.5', kind: 'Film' },
  { title: 'Oppenheimer', slug: 'oppenheimer', rating: '8.9', kind: 'Film' },
  { title: 'Poor Things', slug: 'poor-things', rating: '7.9', kind: 'Film' },
  { title: 'Godzilla Minus One', slug: 'godzilla', rating: '7.5', kind: 'Film' },
  { title: 'Inside Out 2', slug: 'insideout2', rating: '7.8', kind: 'Film' },
  { title: 'The Bear', slug: 'the-bear', rating: '9.0', kind: 'TV Series' },
  { title: 'Shogun', slug: 'shogun', rating: '8.8', kind: 'TV Series' },
  { title: 'House of Dragon', slug: 'hod', rating: '8.4', kind: 'TV Series' },
  { title: 'The Last of Us', slug: 'tlou', rating: '8.7', kind: 'TV Series' },
  { title: 'Fallout', slug: 'fallout', rating: '8.5', kind: 'TV Series' },
  { title: 'Severance', slug: 'severance', rating: '8.7', kind: 'TV Series' },
  { title: 'Succession', slug: 'succession', rating: '9.3', kind: 'TV Series' },
  { title: 'True Detective', slug: 'true-detective', rating: '8.9', kind: 'TV Series' },
]
