import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { useApi } from '../hooks/useApi.js'
import { useMovieApi } from '../hooks/useMovieApi.js'
import { useBreakpoint } from '../hooks/useBreakpoint.js'
import { useScrollToTop } from '../hooks/useScrollToTop.js'

const FILM_GENRE_MAP = {
  'All': 'movie', 'Action': 'movie', 'Drama': 'movie', 'Sci-Fi': 'movie',
  'Thriller': 'movie', 'Horror': 'movie', 'Comedy': 'movie', 'Crime': 'movie',
  'Documentary': 'movie', 'Romance': 'movie',
}
const TV_GENRE_MAP = {
  'All': 'tv', 'Action': 'tv', 'Drama': 'tv', 'Sci-Fi': 'tv',
  'Thriller': 'tv', 'Comedy': 'tv', 'Crime': 'tv', 'Romance': 'tv',
}

export default function BrowseGenrePage() {
  useScrollToTop()
  useEffect(() => { document.title = 'Browse Genre — ANIDOW' }, [])
  const [searchParams] = useSearchParams()
  const [activeAnimeGenre, setActiveAnimeGenre] = useState(searchParams.get('genre') || 'All')
  const [animeGenrePage, setAnimeGenrePage] = useState(1)
  const [browseMode, setBrowseMode] = useState('genre')
  const [activeLetter, setActiveLetter] = useState('A')
  const [alphabetPage, setAlphabetPage] = useState(1)
  const [activeFilmGenre, setActiveFilmGenre] = useState('All')
  const [filmPage, setFilmPage] = useState(1)
  const [filmMode, setFilmMode] = useState('movie') // 'movie' | 'tv'
  const { isMobile, isTablet } = useBreakpoint()

  // Anime: fetch genres + items
  const { data: genresData } = useApi('/api/genres')
  const apiGenres = genresData?.genres || []
  const selectedGenreSlug = activeAnimeGenre === 'All' ? null : activeAnimeGenre.toLowerCase()
  const { data: genreAnimeData, loading: genreLoading, error: genreError } = useApi(
    selectedGenreSlug ? `/api/genre/${selectedGenreSlug}` : '/api/ongoing',
    selectedGenreSlug ? { page: animeGenrePage } : { page: 1 }
  )
  const animeItems = genreAnimeData?.items || []
  const pagination = genreAnimeData?.pagination
  const genreLabels = ['All', ...apiGenres.map(g => g.name)]

  const isAlphabetMode = browseMode === 'alphabet'
  const { data: alphabetData, loading: alphabetLoading, error: alphabetError } = useApi(
    isAlphabetMode ? `/api/alphabet/${activeLetter.toLowerCase()}` : null,
    isAlphabetMode ? { page: alphabetPage } : null
  )
  const alphabetItems = alphabetData?.items || []
  const alphabetPagination = alphabetData?.pagination

  // Film & TV: use /trending for 'All', /search with genre keyword for specific genres
  const isAllGenre = activeFilmGenre === 'All'
  const { data: trendingData, loading: trendingLoading, error: trendingError } = useMovieApi(
    isAllGenre ? '/trending' : null,
    isAllGenre ? { page: filmPage - 1 } : null // trending uses page starting at 0
  )
  const { data: filmSearchData, loading: filmSearchLoading, error: filmSearchError } = useMovieApi(
    !isAllGenre ? '/search' : null,
    !isAllGenre ? { q: activeFilmGenre, type: filmMode, page: filmPage } : null
  )
  const filmLoading = isAllGenre ? trendingLoading : filmSearchLoading
  const filmError = isAllGenre ? trendingError : filmSearchError
  const rawFilmItems = isAllGenre
    ? (trendingData?.items || [])
    : (filmSearchData?.items || [])
  const filmItems = rawFilmItems.filter(i => i.hasResource)
  const filmHasMore = isAllGenre ? trendingData?.hasMore : filmSearchData?.hasMore

  const currentAnimeItems = isAlphabetMode ? alphabetItems : animeItems
  const currentAnimeLoading = isAlphabetMode ? alphabetLoading : genreLoading
  const currentAnimeError = isAlphabetMode ? alphabetError : genreError
  const currentPagination = isAlphabetMode ? alphabetPagination : pagination
  const currentPage = isAlphabetMode ? alphabetPage : animeGenrePage
  const setCurrentPage = isAlphabetMode ? setAlphabetPage : setAnimeGenrePage

  return (
    <div style={{ backgroundColor: '#141414', display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <div style={{ height: '68px', flexShrink: 0 }} />

      {/* Anime Genre Section */}
      <div style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', paddingInline: isMobile ? '16px' : isTablet ? '24px' : '48px', paddingTop: '40px' }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: '14px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#7C3AED', borderRadius: '2px', flexShrink: 0, height: '24px', width: '4px' }} />
          <span style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em' }}>Anime</span>
          <span style={{ color: '#A3A3A3', fontSize: '12px', marginLeft: '4px' }}>&mdash; {isAlphabetMode ? 'Browse by Alphabet' : 'Browse by Genre'}</span>
        </div>

        {/* Tab toggle: Genre | Abjad */}
        <div style={{ alignItems: 'center', backgroundColor: '#1F1F1F', border: '1px solid #333333', borderRadius: '8px', display: 'flex', marginBottom: '16px', padding: '4px', width: 'fit-content' }}>
          <button onClick={() => { setBrowseMode('genre'); setAnimeGenrePage(1) }} style={{
            backgroundColor: !isAlphabetMode ? '#7C3AED' : 'transparent', border: 'none', borderRadius: '6px',
            color: !isAlphabetMode ? '#FFFFFF' : '#A3A3A3', cursor: 'pointer', fontSize: '13px',
            fontWeight: !isAlphabetMode ? 700 : 400, padding: '6px 16px', transition: 'all 0.15s',
          }}>Genre</button>
          <button onClick={() => { setBrowseMode('alphabet'); setAlphabetPage(1) }} style={{
            backgroundColor: isAlphabetMode ? '#7C3AED' : 'transparent', border: 'none', borderRadius: '6px',
            color: isAlphabetMode ? '#FFFFFF' : '#A3A3A3', cursor: 'pointer', fontSize: '13px',
            fontWeight: isAlphabetMode ? 700 : 400, padding: '6px 16px', transition: 'all 0.15s',
          }}>Abjad</button>
        </div>

        {/* Genre filter pills */}
        {!isAlphabetMode && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
          {genreLabels.map(g => (
            <button key={g} onClick={() => { setActiveAnimeGenre(g); setAnimeGenrePage(1) }} style={{
              backgroundColor: activeAnimeGenre === g ? '#7C3AED' : '#1F1F1F',
              border: activeAnimeGenre === g ? 'none' : '1px solid #333333',
              borderRadius: '4px',
              color: activeAnimeGenre === g ? '#FFFFFF' : '#A3A3A3',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeAnimeGenre === g ? 600 : 400,
              paddingBlock: '7px',
              paddingInline: '18px',
              transition: 'background-color 0.15s',
            }}>{g}</button>
          ))}
        </div>
        )}

        {/* Alphabet filter pills */}
        {isAlphabetMode && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
          {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => (
            <button key={letter} onClick={() => { setActiveLetter(letter); setAlphabetPage(1) }} style={{
              backgroundColor: activeLetter === letter ? '#7C3AED' : '#1F1F1F',
              border: activeLetter === letter ? 'none' : '1px solid #333333',
              borderRadius: '4px',
              color: activeLetter === letter ? '#FFFFFF' : '#A3A3A3',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeLetter === letter ? 600 : 400,
              minWidth: '38px',
              paddingBlock: '7px',
              paddingInline: '12px',
              textAlign: 'center',
              transition: 'background-color 0.15s',
            }}>{letter}</button>
          ))}
        </div>
        )}

        {/* Grid */}
        {currentAnimeError ? (
          <div style={{ alignItems: 'center', color: '#E50914', display: 'flex', fontSize: '13px', gap: '8px', padding: '24px 0' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Gagal memuat anime. Coba lagi nanti.
          </div>
        ) : currentAnimeLoading ? (
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '140px' : '180px'}, 1fr))` }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.06}s`,
                aspectRatio: '2/3',
                backgroundColor: '#2D2D2D',
                borderRadius: '8px',
              }} />
            ))}
          </div>
        ) : currentAnimeItems.length === 0 ? (
          <div style={{ color: '#A3A3A3', fontSize: '13px', padding: '16px 0' }}>Tidak ada anime ditemukan.</div>
        ) : (
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '140px' : '180px'}, 1fr))` }}>
            {currentAnimeItems.map((item) => (
              <Link key={item.slug} to={`/detail/${item.slug}`} className="card-thumb" style={{
                borderRadius: '8px',
                display: 'block',
                overflow: 'hidden',
                position: 'relative',
                textDecoration: 'none',
              }}>
                <div style={{ aspectRatio: '2/3', backgroundImage: `url(${item.image || item.img})`, backgroundPosition: '50%', backgroundSize: 'cover', width: '100%' }} />
                <div style={{ background: 'linear-gradient(to top, rgba(20,20,20,0.95) 0%, transparent 60%)', bottom: 0, height: '60%', left: 0, position: 'absolute', right: 0 }} />
                <div style={{ bottom: '7px', left: '7px', position: 'absolute', right: '7px' }}>
                  {(item.currentEpisode || item.totalEpisodes || item.episodes) && (
                    <div style={{ backgroundColor: '#7C3AED', borderRadius: '2px', display: 'inline-block', fontSize: '9px', fontWeight: 700, marginBottom: '3px', paddingBlock: '1px', paddingInline: '4px', color: '#FFF' }}>
                      {item.currentEpisode ? `Ep ${item.currentEpisode}` : item.totalEpisodes || item.episodes}
                    </div>
                  )}
                  <div style={{ color: '#FFFFFF', fontSize: '11px', fontWeight: 700, lineHeight: '1.3' }}>{item.title}</div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {currentPagination && (
          <div style={{ alignItems: 'center', display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px', paddingBottom: '16px' }}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              style={{
                backgroundColor: currentPage <= 1 ? '#1F1F1F' : '#2D2D2D',
                border: '1px solid #333333',
                borderRadius: '4px',
                color: currentPage <= 1 ? '#555' : '#FFFFFF',
                cursor: currentPage <= 1 ? 'default' : 'pointer',
                fontSize: '13px',
                paddingBlock: '8px',
                paddingInline: '16px',
              }}>Sebelumnya</button>
            <span style={{ color: '#A3A3A3', fontSize: '13px' }}>
              Halaman {currentPage} / {currentPagination.totalPages || '?'}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={!currentPagination.nextUrl}
              style={{
                backgroundColor: !currentPagination.nextUrl ? '#1F1F1F' : '#7C3AED',
                border: 'none',
                borderRadius: '4px',
                color: !currentPagination.nextUrl ? '#555' : '#FFFFFF',
                cursor: !currentPagination.nextUrl ? 'default' : 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                paddingBlock: '8px',
                paddingInline: '16px',
              }}>Selanjutnya</button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ backgroundColor: '#2D2D2D', flexShrink: 0, height: '1px', marginTop: '32px' }} />

      {/* Films & TV Genre Section — live from MovieBox API */}
      <div style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', paddingBottom: '56px', paddingInline: isMobile ? '16px' : isTablet ? '24px' : '48px', paddingTop: '40px' }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: '14px', marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#A855F7', borderRadius: '2px', flexShrink: 0, height: '24px', width: '4px' }} />
          <span style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 700, letterSpacing: '-0.01em' }}>Films &amp; TV Series</span>
          <span style={{ color: '#A3A3A3', fontSize: '12px', marginLeft: '4px' }}>&mdash; Browse by Genre</span>
        </div>

        {/* Film / TV mode toggle */}
        <div style={{ alignItems: 'center', backgroundColor: '#1F1F1F', border: '1px solid #333', borderRadius: '8px', display: 'flex', marginBottom: '16px', padding: '4px', width: 'fit-content' }}>
          <button onClick={() => { setFilmMode('movie'); setFilmPage(1) }} style={{
            backgroundColor: filmMode === 'movie' ? '#A855F7' : 'transparent', border: 'none', borderRadius: '6px',
            color: filmMode === 'movie' ? '#141414' : '#A3A3A3', cursor: 'pointer', fontSize: '13px',
            fontWeight: filmMode === 'movie' ? 700 : 400, padding: '6px 16px', transition: 'all 0.15s',
          }}>Film</button>
          <button onClick={() => { setFilmMode('tv'); setFilmPage(1) }} style={{
            backgroundColor: filmMode === 'tv' ? '#A855F7' : 'transparent', border: 'none', borderRadius: '6px',
            color: filmMode === 'tv' ? '#141414' : '#A3A3A3', cursor: 'pointer', fontSize: '13px',
            fontWeight: filmMode === 'tv' ? 700 : 400, padding: '6px 16px', transition: 'all 0.15s',
          }}>TV Series</button>
        </div>

        {/* Genre filter pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' }}>
          {filmGenreList.map(g => (
            <button key={g} onClick={() => { setActiveFilmGenre(g); setFilmPage(1) }} style={{
              backgroundColor: activeFilmGenre === g ? '#A855F7' : '#1F1F1F',
              border: activeFilmGenre === g ? 'none' : '1px solid #333',
              borderRadius: '4px',
              color: activeFilmGenre === g ? '#141414' : '#A3A3A3',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: activeFilmGenre === g ? 600 : 400,
              paddingBlock: '7px',
              paddingInline: '18px',
              transition: 'background-color 0.15s',
            }}>{g}</button>
          ))}
        </div>

        {/* Film grid */}
        {filmError ? (
          <div style={{ alignItems: 'center', color: '#E50914', display: 'flex', fontSize: '13px', gap: '8px', padding: '24px 0' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Gagal memuat konten. Coba lagi nanti.
          </div>
        ) : filmLoading ? (
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '140px' : '180px'}, 1fr))` }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                animation: 'pulse 1.5s ease-in-out infinite',
                animationDelay: `${i * 0.06}s`,
                aspectRatio: '2/3',
                backgroundColor: '#2D2D2D',
                borderRadius: '8px',
              }} />
            ))}
          </div>
        ) : filmItems.length === 0 ? (
          <div style={{ color: '#A3A3A3', fontSize: '13px', padding: '16px 0' }}>Tidak ada konten ditemukan.</div>
        ) : (
          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '140px' : '180px'}, 1fr))` }}>
            {filmItems.map(item => (
              <Link key={item.subjectId} to={`/film/${encodeURIComponent(item.detailPath)}`} className="card-thumb" style={{
                borderRadius: '8px', display: 'block', overflow: 'hidden', position: 'relative', textDecoration: 'none',
              }}>
                <div style={{ aspectRatio: '2/3', backgroundImage: `url(${item.cover})`, backgroundPosition: '50%', backgroundSize: 'cover', width: '100%' }} />
                <div style={{ background: 'linear-gradient(to top, rgba(20,20,20,0.95) 0%, transparent 60%)', bottom: 0, height: '60%', left: 0, position: 'absolute', right: 0 }} />
                <div style={{ bottom: '7px', left: '7px', position: 'absolute', right: '7px' }}>
                  <div style={{ backgroundColor: item.subjectType === 'tv_series' ? '#A855F7' : '#A855F7', borderRadius: '2px', color: item.subjectType === 'tv_series' ? '#FFF' : '#141414', display: 'inline-block', fontSize: '9px', fontWeight: 700, marginBottom: '3px', paddingBlock: '1px', paddingInline: '5px' }}>
                    {item.subjectType === 'tv_series' ? 'TV' : 'Film'}
                  </div>
                  <div style={{ color: '#FFFFFF', fontSize: '11px', fontWeight: 700, lineHeight: '1.3' }}>{item.title}</div>
                  {item.imdbRating && <div style={{ color: '#F5C518', fontSize: '9px', marginTop: '1px' }}>&#9733; {item.imdbRating}</div>}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Film pagination */}
        {(filmHasMore !== undefined || filmPage > 1) && (
          <div style={{ alignItems: 'center', display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '32px' }}>
            <button onClick={() => setFilmPage(p => Math.max(1, p - 1))} disabled={filmPage <= 1} style={{
              backgroundColor: filmPage <= 1 ? '#1F1F1F' : '#2D2D2D', border: '1px solid #333', borderRadius: '4px',
              color: filmPage <= 1 ? '#555' : '#FFF', cursor: filmPage <= 1 ? 'default' : 'pointer', fontSize: '13px', paddingBlock: '8px', paddingInline: '16px',
            }}>Sebelumnya</button>
            <span style={{ color: '#A3A3A3', fontSize: '13px' }}>Halaman {filmPage}</span>
            <button onClick={() => setFilmPage(p => p + 1)} disabled={!filmHasMore} style={{
              backgroundColor: !filmHasMore ? '#1F1F1F' : '#A855F7', border: 'none', borderRadius: '4px',
              color: !filmHasMore ? '#555' : '#141414', cursor: !filmHasMore ? 'default' : 'pointer', fontSize: '13px', fontWeight: 600, paddingBlock: '8px', paddingInline: '16px',
            }}>Selanjutnya</button>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}

const filmGenreList = ['All', 'Action', 'Drama', 'Sci-Fi', 'Thriller', 'Horror', 'Comedy', 'Crime', 'Documentary', 'Romance']
