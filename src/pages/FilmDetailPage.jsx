import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import ScrollCarousel from '../components/ScrollCarousel.jsx'
import { useMovieApi } from '../hooks/useMovieApi.js'
import { useWatchlist } from '../hooks/useWatchlist.js'
import { useBreakpoint } from '../hooks/useBreakpoint.js'
import { useScrollToTop } from '../hooks/useScrollToTop.js'

// subjectType: 1 = movies, 2 = tv_series
const isSubjectTV = (t) => t === 2 || t === 'tv_series'

export default function FilmDetailPage() {
  useScrollToTop()
  const { detailPath } = useParams()
  const navigate = useNavigate()
  const { isMobile, isTablet } = useBreakpoint()
  // React Router already decodes params — no need for extra decodeURIComponent
  const decodedPath = detailPath || ''

  const { data: raw, loading, error } = useMovieApi(decodedPath ? '/details' : null, { detailPath: decodedPath })

  // /details nests everything under `subject`
  const data = raw?.subject || null
  const subjectId = data?.subjectId
  const isTV = isSubjectTV(data?.subjectType)

  const { data: episodesData } = useMovieApi(
    isTV && subjectId ? '/series/episodes' : null,
    { detailPath: decodedPath }
  )
  const { data: relatedData } = useMovieApi(
    subjectId ? '/related' : null,
    { subjectId, page: 1 }
  )

  const { toggle, isInWatchlist } = useWatchlist()
  const [activeSeason, setActiveSeason] = useState(1)

  useEffect(() => { if (data?.title) document.title = `${data.title} — ANIDOW` }, [data?.title])

  if (error) return <PageError msg={error.message} />
  if (loading || !data) return <FilmDetailSkeleton />

  const inWatchlist = isInWatchlist(subjectId)
  const seasons = episodesData?.seasons || []
  const currentSeason = seasons.find(s => s.season === activeSeason) || seasons[0]
  const episodeCount = currentSeason?.episodes || 0
  const relatedItems = (relatedData?.items || []).filter(i => i.hasResource)

  // cover can be an object {url: ...} or a string
  const coverUrl = typeof data.cover === 'string' ? data.cover : data.cover?.url || ''
  const rating = data.imdbRatingValue || data.imdbRating
  const country = data.countryName || data.country
  const description = data.description
  const title = data.title
  const genres = data.genre || []
  const cast = raw?.stars || []

  const watchUrl = isTV
    ? `/film-watch/${encodeURIComponent(decodedPath)}?subjectId=${subjectId}&season=${activeSeason}&episode=1`
    : `/film-watch/${encodeURIComponent(decodedPath)}?subjectId=${subjectId}`

  return (
    <div style={{ backgroundColor: '#141414', display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Hero */}
      <div style={{ position: 'relative' }}>
        <Navbar transparent />
        <div style={{ alignItems: 'flex-end', display: 'flex', height: isMobile ? '300px' : '460px', overflow: 'hidden', position: 'relative' }}>
          <img src={coverUrl} alt={title} style={{ height: '100%', left: 0, objectFit: 'cover', objectPosition: '50% 20%', position: 'absolute', top: 0, width: '100%' }} />
          <div style={{ background: 'linear-gradient(to right, rgba(20,20,20,0.98) 0%, rgba(20,20,20,0.7) 45%, rgba(20,20,20,0.2) 100%)', height: '100%', left: 0, position: 'absolute', top: 0, width: '100%' }} />
          <div style={{ background: 'linear-gradient(to top, rgba(20,20,20,1) 0%, transparent 100%)', bottom: 0, height: '50%', left: 0, position: 'absolute', width: '100%' }} />
          {/* Breadcrumb */}
          <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px', left: isMobile ? '16px' : isTablet ? '24px' : '48px', position: 'absolute', top: isMobile ? '76px' : '88px', right: isMobile ? '16px' : isTablet ? '24px' : '48px' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate(-1)}>
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
            <span style={{ color: '#A3A3A3', cursor: 'pointer', fontSize: '13px', flexShrink: 0 }} onClick={() => navigate(-1)}>{isTV ? 'TV Series' : 'Film'}</span>
            {!isMobile && genres[0] && <><span style={{ color: '#333', fontSize: '13px', flexShrink: 0 }}>/</span><span style={{ color: '#A3A3A3', fontSize: '13px', flexShrink: 0 }}>{genres[0]}</span></>}
            <span style={{ color: '#333', fontSize: '13px', flexShrink: 0 }}>/</span>
            <span style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 500, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
          </div>
          {/* Cover + Meta */}
          <div style={{ alignItems: 'flex-end', display: 'flex', gap: isMobile ? '16px' : '32px', padding: isMobile ? '0 16px 24px' : isTablet ? '0 24px 32px' : '0 48px 40px', position: 'relative', width: '100%' }}>
            <div style={{ border: '1px solid #333', borderRadius: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', flexShrink: 0, height: isMobile ? '142px' : '228px', overflow: 'hidden', width: isMobile ? '100px' : '160px' }}>
              <img src={coverUrl} alt={title} style={{ height: '100%', objectFit: 'cover', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '4px' }}>
              <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Badge bg="#A855F7" text={isTV ? 'TV Series' : 'Film'} textColor="#FFFFFF" />
                {rating && (
                  <span style={{ alignItems: 'center', color: '#F5C518', display: 'flex', fontSize: '13px', fontWeight: 700, gap: '3px' }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="#F5C518"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    {rating} IMDb
                  </span>
                )}
                {data.duration > 0 && !isTV && (
                  <span style={{ color: '#A3A3A3', fontSize: '12px' }}>{Math.floor(data.duration / 60)} min</span>
                )}
              </div>
              <h1 style={{ color: '#FFFFFF', fontFamily: '"Arial Black", Arial, system-ui, sans-serif', fontSize: isMobile ? '22px' : isTablet ? '32px' : '44px', fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1, margin: 0 }}>{title}</h1>
              <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {data.releaseDate && <MetaItem icon="calendar" text={data.releaseDate?.slice(0, 4)} />}
                {country && <MetaItem icon="globe" text={country} />}
                {isTV && seasons.length > 0 && <MetaItem icon="box" text={`${seasons.length} Season`} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flexDirection: isMobile ? 'column' : 'row', display: 'flex', gap: '48px', padding: isMobile ? '24px 16px 0' : isTablet ? '32px 24px 0' : '40px 48px 0' }}>
        {/* Left */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '32px', minWidth: 0 }}>
          {/* Genre + CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {genres.length > 0 && (
              <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {genres.map((g, i) => (
                  <span key={g} style={{
                    backgroundColor: i === 0 ? '#A855F7' : '#1F1F1F',
                    border: i === 0 ? 'none' : '1px solid #333',
                    borderRadius: '9999px',
                    color: i === 0 ? '#FFFFFF' : '#A3A3A3',
                    fontSize: '12px',
                    fontWeight: i === 0 ? 600 : 400,
                    paddingBlock: '4px',
                    paddingInline: '12px',
                  }}>{g}</span>
                ))}
              </div>
            )}
            <div style={{ alignItems: isMobile ? 'stretch' : 'center', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
                <Link to={watchUrl} style={{ alignItems: 'center', backgroundColor: '#A855F7', borderRadius: '4px', display: 'flex', gap: '10px', justifyContent: 'center', paddingBlock: '14px', paddingInline: '32px', textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF"><polygon points="5,3 19,12 5,21"/></svg>
                  <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700 }}>Tonton Sekarang</span>
                </Link>
              <button
                onClick={() => toggle({ slug: subjectId, title, image: coverUrl, type: isTV ? 'tv' : 'film', detailPath: decodedPath })}
                style={{
                  alignItems: 'center',
                  background: inWatchlist ? 'rgba(168,85,247,0.15)' : 'transparent',
                  border: `1px solid ${inWatchlist ? '#A855F7' : '#FFFFFF'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '10px',
                  paddingBlock: '13px',
                  paddingInline: '24px',
                  transition: 'all 0.2s',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill={inWatchlist ? '#A855F7' : 'none'} stroke={inWatchlist ? '#A855F7' : '#FFFFFF'} strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                <span style={{ color: inWatchlist ? '#A855F7' : '#FFFFFF', fontSize: '15px', fontWeight: 600 }}>
                  {inWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
                </span>
              </button>
            </div>
          </div>

          {/* Synopsis */}
          {description && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>Sinopsis</h3>
              <p style={{ color: '#A3A3A3', fontSize: '14px', lineHeight: '1.75', margin: 0 }}>{description}</p>
            </div>
          )}

          {/* Cast */}
          {cast.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>Pemeran</h3>
              <div style={{ color: '#A3A3A3', fontSize: '14px' }}>
                {cast.slice(0, 5).map(s => typeof s === 'string' ? s : s.name || s.title || '').filter(Boolean).join(', ')}
              </div>
            </div>
          )}

          {/* TV Season/Episode Picker */}
          {isTV && seasons.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
                <div style={{ backgroundColor: '#A855F7', borderRadius: '2px', flexShrink: 0, height: '22px', width: '4px' }} />
                <h2 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, margin: 0 }}>Episode</h2>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {seasons.map(s => (
                  <button key={s.season} onClick={() => setActiveSeason(s.season)} style={{
                    backgroundColor: activeSeason === s.season ? '#A855F7' : '#1F1F1F',
                    border: activeSeason === s.season ? 'none' : '1px solid #333',
                    borderRadius: '4px',
                    color: activeSeason === s.season ? '#FFFFFF' : '#A3A3A3',
                    cursor: 'pointer',
                    fontSize: '13px',
                    fontWeight: activeSeason === s.season ? 700 : 400,
                    paddingBlock: '6px',
                    paddingInline: '16px',
                    transition: 'all 0.15s',
                  }}>Season {s.season}</button>
                ))}
              </div>
              {currentSeason && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {Array.from({ length: episodeCount }, (_, i) => i + 1).map(ep => (
                    <Link
                      key={ep}
                      to={`/film-watch/${encodeURIComponent(decodedPath)}?subjectId=${subjectId}&season=${activeSeason}&episode=${ep}`}
                      style={{
                        alignItems: 'center', backgroundColor: '#1F1F1F', border: '1px solid #333', borderRadius: '4px',
                        color: '#FFFFFF', display: 'flex', fontSize: '13px', fontWeight: 600, justifyContent: 'center',
                        minWidth: '48px', paddingBlock: '8px', paddingInline: '12px', textDecoration: 'none', transition: 'background-color 0.15s, border-color 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#A855F7'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = '#A855F7' }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#1F1F1F'; e.currentTarget.style.color = '#FFFFFF'; e.currentTarget.style.borderColor = '#333' }}
                    >{ep}</Link>
                  ))}
                </div>
              )}
              {currentSeason?.resolutions?.length > 0 && (
                <div style={{ alignItems: 'center', display: 'flex', gap: '6px' }}>
                  <span style={{ color: '#A3A3A3', fontSize: '12px' }}>Tersedia:</span>
                  {currentSeason.resolutions.map(r => (
                    <span key={r} style={{ backgroundColor: '#1F1F1F', border: '1px solid #333', borderRadius: '3px', color: '#46D369', fontSize: '11px', fontWeight: 600, paddingBlock: '2px', paddingInline: '6px' }}>{r}p</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right — Details card */}
        <div style={{ display: 'flex', flexDirection: 'column', flexShrink: isMobile ? 1 : 0, gap: '20px', width: isMobile ? '100%' : '300px' }}>
          <div style={{ backgroundColor: '#1F1F1F', border: '1px solid #2D2D2D', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>
            <h4 style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>Detail</h4>
            {[
              ['Tipe', isTV ? 'TV Series' : 'Film'],
              ['IMDb Rating', rating ? `${rating} / 10` : null],
              ['Tahun Rilis', data.releaseDate?.slice(0, 4)],
              ['Durasi', data.duration > 0 && !isTV ? `${Math.floor(data.duration / 60)} menit` : null],
              ['Negara', country],
              ['Genre', genres.slice(0, 3).join(', ')],
              ['Subtitle', data.subtitles?.slice(0, 3).join(', ')],
            ].filter(([, v]) => v).map(([k, v], i, arr) => (
              <div key={k} style={{ alignItems: 'flex-start', borderBottom: i < arr.length - 1 ? '1px solid #2D2D2D' : 'none', display: 'flex', justifyContent: 'space-between', paddingBottom: i < arr.length - 1 ? '10px' : '0', gap: '12px' }}>
                <span style={{ color: '#A3A3A3', fontSize: '12px', flexShrink: 0 }}>{k}</span>
                <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 600, textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Related Content */}
      {relatedItems.length > 0 && (
        <div style={{ padding: isMobile ? '24px 16px 32px' : isTablet ? '32px 24px 40px' : '40px 48px 56px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
            <div style={{ backgroundColor: '#A855F7', borderRadius: '2px', flexShrink: 0, height: '22px', width: '4px' }} />
            <h2 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, margin: 0 }}>Mungkin Kamu Suka</h2>
          </div>
          <ScrollCarousel gap={12}>
            {relatedItems.map(item => {
              const rc = typeof item.cover === 'string' ? item.cover : item.cover?.url || ''
              return (
                <Link key={item.subjectId} to={`/film/${encodeURIComponent(item.detailPath)}`} className="card-thumb" style={{
                  borderRadius: '8px', display: 'block', flexShrink: 0, height: '270px', overflow: 'hidden', position: 'relative', textDecoration: 'none', width: '180px',
                }}>
                  <img src={rc} alt={item.title} loading="lazy" style={{ height: '100%', objectFit: 'cover', width: '100%' }} />
                  <div style={{ background: 'linear-gradient(to top, rgba(20,20,20,0.9) 0%, transparent 60%)', bottom: 0, height: '60%', left: 0, position: 'absolute', right: 0 }} />
                  <div style={{ bottom: '8px', left: '8px', position: 'absolute', right: '8px' }}>
                    <div style={{ color: '#FFFFFF', fontSize: '11px', fontWeight: 700, lineHeight: '1.3', marginBottom: '2px' }}>{item.title}</div>
                    {(item.imdbRating || item.imdbRatingValue) && <div style={{ color: '#F5C518', fontSize: '10px' }}>&#9733; {item.imdbRating || item.imdbRatingValue}</div>}
                  </div>
                </Link>
              )
            })}
          </ScrollCarousel>
        </div>
      )}
    </div>
  )
}

function Badge({ bg, text, textColor, border }) {
  return (
    <span style={{ backgroundColor: bg, border: border ? '1px solid #333' : 'none', borderRadius: '3px', color: textColor || '#FFFFFF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', paddingBlock: '3px', paddingInline: '10px', textTransform: 'uppercase' }}>{text}</span>
  )
}

function MetaItem({ icon, text }) {
  const icons = {
    calendar: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    globe: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    box: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
  }
  return (
    <div style={{ alignItems: 'center', display: 'flex', gap: '6px' }}>
      {icons[icon]}
      <span style={{ color: '#A3A3A3', fontSize: '13px' }}>{text}</span>
    </div>
  )
}

function PageError({ msg }) {
  return (
    <div style={{ alignItems: 'center', backgroundColor: '#141414', display: 'flex', flexDirection: 'column', gap: '12px', height: '100vh', justifyContent: 'center' }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E50914" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>Film / TV Series tidak ditemukan</span>
      <span style={{ color: '#A3A3A3', fontSize: '13px' }}>Konten ini sedang tidak tersedia.</span>
    </div>
  )
}

function Skeleton({ width = '100%', height = 16, radius = 4 }) {
  return (
    <div style={{
      animation: 'pulse 1.5s ease-in-out infinite',
      backgroundColor: '#2D2D2D',
      borderRadius: radius,
      flexShrink: 0,
      height,
      width,
    }} />
  )
}

function FilmDetailSkeleton() {
  const { isMobile, isTablet } = useBreakpoint()
  return (
    <div style={{ backgroundColor: '#141414', display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}>
      <div style={{ position: 'relative' }}>
        <Navbar transparent />
        <div style={{ alignItems: 'flex-end', display: 'flex', height: isMobile ? '300px' : '460px', overflow: 'hidden', position: 'relative', backgroundColor: '#0d0d0d' }}>
          <div style={{ background: 'linear-gradient(to right, rgba(20,20,20,0.98) 0%, rgba(20,20,20,0.7) 45%, rgba(20,20,20,0.2) 100%)', height: '100%', left: 0, position: 'absolute', top: 0, width: '100%' }} />
          <div style={{ background: 'linear-gradient(to top, rgba(20,20,20,1) 0%, transparent 100%)', bottom: 0, height: '50%', left: 0, position: 'absolute', width: '100%' }} />
          <div style={{ alignItems: 'flex-end', display: 'flex', gap: isMobile ? '16px' : '32px', padding: isMobile ? '0 16px 24px' : isTablet ? '0 24px 32px' : '0 48px 40px', position: 'relative', width: '100%' }}>
            <div style={{ border: '1px solid #333', borderRadius: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', flexShrink: 0, height: isMobile ? 142 : 228, overflow: 'hidden', width: isMobile ? 100 : 160, backgroundColor: '#2D2D2D', animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '4px', flex: 1, minWidth: 0 }}>
              <Skeleton width={80} height={18} radius={3} />
              <Skeleton width={isMobile ? 220 : 400} height={isMobile ? 28 : 44} radius={6} />
              <div style={{ alignItems: 'center', display: 'flex', gap: '20px' }}>
                <Skeleton width={100} height={13} />
                <Skeleton width={80} height={13} />
                <Skeleton width={90} height={13} />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ flexDirection: isMobile ? 'column' : 'row', display: 'flex', gap: '32px', padding: isMobile ? '24px 16px 0' : isTablet ? '32px 24px 0' : '40px 48px 0' }}>
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '32px', minWidth: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {[140, 90, 110, 70].map((w, i) => <Skeleton key={i} width={w} height={26} radius={9999} />)}
            </div>
            <div style={{ alignItems: isMobile ? 'stretch' : 'center', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
              <Skeleton width={200} height={46} radius={4} />
              <Skeleton width={220} height={46} radius={4} />
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Skeleton width={80} height={14} />
            <Skeleton width="100%" height={14} />
            <Skeleton width="80%" height={14} />
            <Skeleton width="60%" height={14} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <Skeleton width={80} height={14} />
            <Skeleton width="70%" height={14} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', flexShrink: isMobile ? 1 : 0, gap: '20px', width: isMobile ? '100%' : '300px' }}>
          <div style={{ backgroundColor: '#1F1F1F', border: '1px solid #2D2D2D', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>
            <Skeleton width={60} height={12} />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', borderBottom: i < 5 ? '1px solid #2D2D2D' : 'none', paddingBottom: i < 5 ? '10px' : '0' }}>
                <Skeleton width={80} height={12} />
                <Skeleton width={100} height={12} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ padding: isMobile ? '24px 16px 32px' : isTablet ? '32px 24px 40px' : '40px 48px 56px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
          <div style={{ backgroundColor: '#A855F7', borderRadius: '2px', flexShrink: 0, height: '22px', width: '4px' }} />
          <Skeleton width={180} height={18} />
        </div>
        <div style={{ display: 'flex', gap: '12px', overflowX: 'hidden' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ borderRadius: '8px', flexShrink: 0, height: 270, width: 180, backgroundColor: '#2D2D2D', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: `${i * 0.06}s` }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}
