import { useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { useApi } from '../hooks/useApi.js'
import { useWatchlist } from '../hooks/useWatchlist.js'
import { useBreakpoint } from '../hooks/useBreakpoint.js'
import { useScrollToTop } from '../hooks/useScrollToTop.js'

export default function DetailPage() {
  useScrollToTop()
  const { id: slug } = useParams()
  const navigate = useNavigate()
  const { isMobile, isTablet } = useBreakpoint()
  const [activeSeason, setActiveSeason] = useState(null)

  const { data, loading, error } = useApi(slug ? `/api/anime/${slug}` : null)
  const { toggle, isInWatchlist } = useWatchlist()

  useEffect(() => { if (data?.title) document.title = `${data.title} — ANIDOW` }, [data?.title])

  if (error) return <PageError msg={error.message} />
  if (loading || !data) return <DetailSkeleton />

  const { title, image, info, synopsis, episodes = [], batches = [] } = data
  const inWatchlist = isInWatchlist(slug)

  // Sort episodes ascending for "Tonton Sekarang" (ep 1 first).
  // Display list stays descending (newest first).
  const sortedEps = [...episodes].sort((a, b) => {
    const na = parseInt(a.episode || a.title?.match(/\d+/)?.[0] || '9999', 10)
    const nb = parseInt(b.episode || b.title?.match(/\d+/)?.[0] || '9999', 10)
    return na - nb
  })
  const displayEps = episodes

  return (
    <div style={{ backgroundColor: '#141414', display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* Hero */}
      <div style={{ position: 'relative' }}>
        <Navbar transparent />
        <div style={{ alignItems: 'flex-end', display: 'flex', height: isMobile ? '300px' : '460px', overflow: 'hidden', position: 'relative' }}>
          <img src={image} alt={title} style={{ height: '100%', left: 0, objectFit: 'cover', position: 'absolute', top: 0, width: '100%' }} />
          <div style={{ background: 'linear-gradient(to right, rgba(20,20,20,0.98) 0%, rgba(20,20,20,0.7) 45%, rgba(20,20,20,0.2) 100%)', height: '100%', left: 0, position: 'absolute', top: 0, width: '100%' }} />
          <div style={{ background: 'linear-gradient(to top, rgba(20,20,20,1) 0%, transparent 100%)', bottom: 0, height: '50%', left: 0, position: 'absolute', width: '100%' }} />
          {/* Breadcrumb */}
          <div
            style={{
              position: 'absolute',
              top: isMobile ? '76px' : '88px',
              left: isMobile ? '16px' : isTablet ? '24px' : '48px',
              right: isMobile ? '16px' : isTablet ? '24px' : '48px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'center',
              fontSize: '14px'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" style={{ cursor: 'pointer', flexShrink: 0 }} onClick={() => navigate(-1)}>
              <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
            </svg>
            <span style={{ color: '#A3A3A3', cursor: 'pointer', fontSize: '13px', flexShrink: 0 }} onClick={() => navigate(-1)}>Anime</span>
            {!isMobile && info?.genre && <><span style={{ color: '#333', fontSize: '13px', flexShrink: 0 }}>/</span><span style={{ color: '#A3A3A3', fontSize: '13px', flexShrink: 0 }}>{info.genre}</span></>}
            <span style={{ color: '#333', fontSize: '13px', flexShrink: 0 }}>/</span>
            <span style={{ color: '#FFFFFF', fontSize: '13px', fontWeight: 500, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
          </div>
          {/* Cover + Meta */}
          <div style={{ alignItems: 'flex-end', display: 'flex', gap: isMobile ? '16px' : '32px', padding: isMobile ? '0 16px 24px' : isTablet ? '0 24px 32px' : '0 48px 40px', position: 'relative', width: '100%' }}>
            <div style={{ border: '1px solid #333', borderRadius: '6px', boxShadow: '0 8px 32px rgba(0,0,0,0.7)', flexShrink: 0, height: isMobile ? '142px' : '228px', overflow: 'hidden', width: isMobile ? '100px' : '160px' }}>
              <img src={image} alt={title} style={{ height: '100%', objectFit: 'cover', width: '100%' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '4px' }}>
              <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                <Badge bg="#7C3AED" text="Anime" />
                {info?.status && (
                  <span style={{ color: info.status?.toLowerCase().includes('ongoing') ? '#46D369' : '#A3A3A3', fontSize: '12px', fontWeight: 600 }}>
                    {info.status}
                  </span>
                )}
              </div>
              <h1 style={{ color: '#FFFFFF', fontSize: isMobile ? '22px' : isTablet ? '32px' : '44px', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2, margin: 0 }}>{title}</h1>
              <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
                {info?.tanggalRilis && <MetaItem icon="calendar" text={info.tanggalRilis} />}
                {info?.studio && <MetaItem icon="box" text={info.studio} />}
                {info?.totalEpisode && <MetaItem icon="chat" text={`${info.totalEpisode} Episode`} />}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '32px', padding: isMobile ? '24px 16px 0' : isTablet ? '32px 24px 0' : '40px 48px 0' }}>
        {/* Left */}
        <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '32px', minWidth: 0 }}>
          {/* Genre + CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {info?.genre && (
              <div style={{ alignItems: 'center', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {info.genre.split(',').map((g, i) => (
                  <span key={g.trim()} style={{
                    backgroundColor: i === 0 ? '#7C3AED' : '#1F1F1F',
                    border: i === 0 ? 'none' : '1px solid #333',
                    borderRadius: '9999px',
                    color: i === 0 ? '#FFFFFF' : '#A3A3A3',
                    fontSize: '12px',
                    fontWeight: i === 0 ? 600 : 400,
                    paddingBlock: '4px',
                    paddingInline: '12px',
                  }}>{g.trim()}</span>
                ))}
              </div>
            )}
            <div style={{ alignItems: isMobile ? 'stretch' : 'center', display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
              {episodes.length > 0 && (
                <Link to={`/watch/${slug}/${sortedEps[0].slug}`} style={{ alignItems: 'center', backgroundColor: '#7C3AED', borderRadius: '4px', display: 'flex', gap: '10px', justifyContent: 'center', paddingBlock: '14px', paddingInline: '32px', textDecoration: 'none' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#FFFFFF"><polygon points="5,3 19,12 5,21"/></svg>
                  <span style={{ color: '#FFFFFF', fontSize: '15px', fontWeight: 700 }}>Tonton Sekarang</span>
                </Link>
              )}
              <button
                onClick={() => toggle({ slug, title, image, type: 'anime' })}
                style={{
                  alignItems: 'center',
                  background: inWatchlist ? 'rgba(124,58,237,0.15)' : 'transparent',
                  border: `1px solid ${inWatchlist ? '#7C3AED' : '#FFFFFF'}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'center',
                  paddingBlock: '13px',
                  paddingInline: '24px',
                  transition: 'all 0.2s',
                }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill={inWatchlist ? '#7C3AED' : 'none'} stroke={inWatchlist ? '#7C3AED' : '#FFFFFF'} strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                <span style={{ color: inWatchlist ? '#7C3AED' : '#FFFFFF', fontSize: '15px', fontWeight: 600 }}>
                  {inWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
                </span>
              </button>
            </div>
          </div>

          {/* Synopsis */}
          {synopsis && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <h3 style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 700, letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>Sinopsis</h3>
              <p style={{ color: '#A3A3A3', fontSize: '14px', lineHeight: '1.75', margin: 0 }}>{synopsis}</p>
            </div>
          )}

          {/* Staff */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
            {info?.studio && <StaffItem label="Studio" value={info.studio} />}
            {info?.produser && <StaffItem label="Produser" value={info.produser} />}
            {info?.status && <StaffItem label="Status" value={info.status} color={info.status?.toLowerCase().includes('ongoing') || info.status?.toLowerCase().includes('berlangsung') ? '#46D369' : '#FFFFFF'} />}
          </div>
        </div>

        {/* Right — Details card */}
        <div style={{ display: 'flex', flexDirection: 'column', flexShrink: isMobile ? 1 : 0, gap: '20px', width: isMobile ? '100%' : '300px' }}>
          <div style={{ backgroundColor: '#1F1F1F', border: '1px solid #2D2D2D', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '14px', padding: '20px' }}>
            <h4 style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 700, letterSpacing: '0.1em', margin: 0, textTransform: 'uppercase' }}>Detail</h4>
            {[
              ['Judul Jepang', info?.japanese],
              ['Tipe', info?.tipe],
              ['Status', info?.status],
              ['Episode', info?.totalEpisode],
              ['Durasi', info?.durasi],
              ['Rilis', info?.tanggalRilis],
              ['Studio', info?.studio],
              ['Skor', info?.skor],
            ].filter(([, v]) => v).map(([k, v], i, arr) => (
              <div key={k} style={{ alignItems: 'center', borderBottom: i < arr.length - 1 ? '1px solid #2D2D2D' : 'none', display: 'flex', justifyContent: 'space-between', paddingBottom: i < arr.length - 1 ? '10px' : '0' }}>
                <span style={{ color: '#A3A3A3', fontSize: '12px' }}>{k}</span>
                <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 600, maxWidth: '160px', textAlign: 'right' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Episode list */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: isMobile ? '24px 16px 32px' : isTablet ? '32px 24px 40px' : '40px 48px 56px' }}>
        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
            <div style={{ backgroundColor: '#7C3AED', borderRadius: '2px', flexShrink: 0, height: '22px', width: '4px' }} />
            <h2 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, margin: 0 }}>Episode</h2>
            <span style={{ backgroundColor: '#1F1F1F', borderRadius: '9999px', color: '#A3A3A3', fontSize: '12px', fontWeight: 600, paddingBlock: '2px', paddingInline: '10px' }}>
              {episodes.length} episode
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayEps.map((ep, i) => (
            <EpisodeRow key={ep.slug || i} ep={ep} animeSlug={slug} />
          ))}
        </div>
        {batches.length > 0 && (
          <>
            <div style={{ alignItems: 'center', display: 'flex', gap: '12px', margin: '32px 0 16px' }}>
              <div style={{ backgroundColor: '#F5C518', borderRadius: '2px', flexShrink: 0, height: '22px', width: '4px' }} />
              <h2 style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 700, margin: 0 }}>Batch Download</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {batches.map((ep, i) => (
                <EpisodeRow key={ep.slug || i} ep={ep} animeSlug={slug} isBatch />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function EpisodeRow({ ep, animeSlug, isBatch }) {
  return (
    <Link to={`/watch/${animeSlug}/${ep.slug}`} style={{ textDecoration: 'none' }}>
      <div className="ep-row" style={{
        alignItems: 'center',
        backgroundColor: 'transparent',
        border: '1px solid #2D2D2D',
        borderRadius: '6px',
        display: 'flex',
        gap: '16px',
        padding: '12px 16px',
      }}>
        <span style={{ color: '#A3A3A3', flexShrink: 0, fontSize: '13px', fontWeight: 700, width: '60px' }}>
          {isBatch ? 'Batch' : ep.episode || ep.title?.match(/\d+/)?.[0] || '—'}
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>{ep.title}</span>
        </div>
        <div style={{ alignItems: 'center', display: 'flex', flexShrink: 0, gap: '12px' }}>
          {ep.date && <span style={{ color: '#A3A3A3', fontSize: '12px' }}>{ep.date}</span>}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#A3A3A3"><polygon points="5,3 19,12 5,21"/></svg>
        </div>
      </div>
    </Link>
  )
}

function Badge({ bg, text, border }) {
  return (
    <span style={{ backgroundColor: bg, border: border ? '1px solid #333333' : 'none', borderRadius: '3px', color: '#FFFFFF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', paddingBlock: '3px', paddingInline: '10px', textTransform: 'uppercase' }}>{text}</span>
  )
}

function StaffItem({ label, value, color }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <span style={{ color: '#A3A3A3', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
      <span style={{ color: color || '#FFFFFF', fontSize: '13px', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function MetaItem({ icon, text }) {
  const icons = {
    calendar: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    box: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>,
    chat: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
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
      <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>Anime tidak ditemukan</span>
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

function DetailSkeleton() {
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '32px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <Skeleton width={60} height={11} />
                <Skeleton width={80} height={13} />
              </div>
            ))}
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
      <div style={{ display: 'flex', flexDirection: 'column', padding: isMobile ? '24px 16px 32px' : isTablet ? '32px 24px 40px' : '40px 48px 56px' }}>
        <div style={{ alignItems: 'center', display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#7C3AED', borderRadius: '2px', flexShrink: 0, height: '22px', width: '4px' }} />
          <Skeleton width={100} height={18} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ alignItems: 'center', backgroundColor: 'transparent', border: '1px solid #2D2D2D', borderRadius: '6px', display: 'flex', gap: '16px', padding: '12px 16px' }}>
              <Skeleton width={60} height={13} />
              <Skeleton width="60%" height={14} />
              <div style={{ marginLeft: 'auto' }}>
                <Skeleton width={14} height={14} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  )
}
