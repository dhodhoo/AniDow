import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { movieApi, movieUrl, fetchSubtitleAsVtt, isStreamUrlExpiringSoon } from '../lib/movieApi.js'
import 'plyr/dist/plyr.css'
import { useBreakpoint } from '../hooks/useBreakpoint.js'
import { useWatchlist } from '../hooks/useWatchlist.js'
import { useScrollToTop } from '../hooks/useScrollToTop.js'

export default function FilmWatchPage() {
  useScrollToTop()
  const { detailPath } = useParams()
  const [searchParams] = useSearchParams()
  const decodedPath = detailPath || ''

  const subjectId = searchParams.get('subjectId') || ''
  const season = parseInt(searchParams.get('season') || '0', 10)
  const episode = parseInt(searchParams.get('episode') || '0', 10)
  const isTV = season > 0 && episode > 0

  const [files, setFiles] = useState(null)
  const [filesLoading, setFilesLoading] = useState(true)
  const [filesError, setFilesError] = useState(null)
  const [activeQuality, setActiveQuality] = useState(0)
  const [activeSubtitle, setActiveSubtitle] = useState('id')
  const [vttUrls, setVttUrls] = useState({})
  const [title, setTitle] = useState('')
  const [episodeList, setEpisodeList] = useState([]) // [{season, episodes}]

  const videoRef = useRef(null)
  const vttUrlsRef = useRef({})

  const { isMobile, isTablet } = useBreakpoint()

  const { toggle, isInWatchlist } = useWatchlist()
  const inWatchlist = isInWatchlist(subjectId)

  useEffect(() => { if (title) document.title = `Nonton ${title} — ANIDOW` }, [title])

  // ---- Fetch /files ----
  const fetchFiles = useCallback(async () => {
    if (!subjectId || !decodedPath) return
    setFilesLoading(true)
    setFilesError(null)
    try {
      const data = isTV
        ? await movieApi('/series/files', { params: { subjectId, detailPath: decodedPath, season, episode } })
        : await movieApi('/movie/files', { params: { subjectId, detailPath: decodedPath } })
      setFiles(data)
      setActiveQuality(0)
    } catch (err) {
      setFilesError(err.message)
    } finally {
      setFilesLoading(false)
    }
  }, [subjectId, decodedPath, isTV, season, episode])

  useEffect(() => { fetchFiles() }, [fetchFiles])

  // ---- Fetch title + episode list ----
  useEffect(() => {
    if (!decodedPath) return
    movieApi('/details', { params: { detailPath: decodedPath } })
      .then(d => setTitle(d.subject?.title || ''))
      .catch(() => {})
  }, [decodedPath])

  useEffect(() => {
    if (!isTV || !decodedPath) return
    movieApi('/series/episodes', { params: { detailPath: decodedPath } })
      .then(d => setEpisodeList(d.seasons || []))
      .catch(() => {})
  }, [isTV, decodedPath])

  // ---- Set video source when files arrive ----
  useEffect(() => {
    if (!files?.downloads?.length || !videoRef.current) return
    const dl = files.downloads[activeQuality]
    if (!dl) return
    if (isStreamUrlExpiringSoon(dl.stream_url)) { fetchFiles(); return }
    const video = videoRef.current
    const prev = video.currentTime
    const wasPlaying = !video.paused
    video.src = movieUrl(dl.stream_url)
    video.load()
    video.addEventListener('loadedmetadata', () => {
      if (prev > 0) video.currentTime = prev
      if (wasPlaying) video.play().catch(() => {})
    }, { once: true })
  }, [files, activeQuality])

  // ---- Re-fetch on 403 ----
  useEffect(() => {
    if (!videoRef.current) return
    const onErr = () => { fetchFiles() }
    videoRef.current.addEventListener('error', onErr)
    return () => videoRef.current?.removeEventListener('error', onErr)
  }, [fetchFiles])

  // ---- Subtitles SRT -> VTT ----
  useEffect(() => {
    if (!files?.subtitles?.length) return
    Object.values(vttUrlsRef.current).forEach(u => URL.revokeObjectURL(u))
    vttUrlsRef.current = {}
    setVttUrls({})
    Promise.all(
      files.subtitles.map(async sub => [sub.lan, await fetchSubtitleAsVtt(sub.subtitle_url)])
    ).then(pairs => {
      const map = Object.fromEntries(pairs.filter(([, v]) => v))
      vttUrlsRef.current = map
      setVttUrls(map)
    })
    return () => { Object.values(vttUrlsRef.current).forEach(u => URL.revokeObjectURL(u)) }
  }, [files?.subtitles])

  // ---- Attach <track> elements ----
  useEffect(() => {
    if (!videoRef.current || !files?.subtitles?.length) return
    videoRef.current.querySelectorAll('track').forEach(t => t.remove())
    files.subtitles.forEach(sub => {
      const vtt = vttUrls[sub.lan]
      if (!vtt) return
      const track = document.createElement('track')
      track.kind = 'subtitles'
      track.label = sub.lanName
      track.srclang = sub.lan
      track.src = vtt
      if (sub.lan === activeSubtitle) track.default = true
      videoRef.current.appendChild(track)
    })
  }, [vttUrls, activeSubtitle, files?.subtitles])

  const downloads = files?.downloads || []
  const subtitles = files?.subtitles || []
  const currentSeasonEpisodes = isTV
    ? (episodeList.find(s => s.season === season)?.episodes || 0)
    : 0

  return (
    <div style={{ backgroundColor: '#141414', display: 'flex', flexDirection: 'column', height: isMobile ? 'auto' : '100vh', minHeight: '100vh', overflow: isMobile ? 'visible' : 'hidden' }}>
      <Navbar />
      <div style={{ height: '68px', flexShrink: 0 }} />

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flex: isMobile ? 'none' : 1, minHeight: isMobile ? 'auto' : 0, overflow: isMobile ? 'visible' : 'hidden' }}>

        {/* ---- LEFT: Player — no scroll ---- */}
        <div style={{ backgroundColor: '#0d0d0d', display: 'flex', flex: isMobile ? 'none' : 1, flexDirection: 'column', minWidth: 0, overflow: isMobile ? 'visible' : 'hidden', padding: isMobile ? '12px' : isTablet ? '16px' : '24px 24px 24px 32px' }}>
          {/* Video container — fixed ~1100x620, centered */}
          <div style={{ position: 'relative', width: '100%', maxWidth: isMobile ? '100%' : '1100px', margin: '0 auto' }}>
            {/* Loading overlay */}
            {filesLoading && (
              <div style={{
                alignItems: 'center', aspectRatio: '16/9', backgroundColor: '#0a0a0a', borderRadius: '8px',
                display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center',
                left: 0, position: 'absolute', top: 0, width: '100%', zIndex: 5,
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <span style={{ color: '#A3A3A3', fontSize: '13px' }}>Memuat video...</span>
              </div>
            )}
            {/* Error overlay */}
            {filesError && !filesLoading && (
              <div style={{
                alignItems: 'center', aspectRatio: '16/9', backgroundColor: '#0a0a0a', borderRadius: '8px',
                display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center',
                left: 0, position: 'absolute', top: 0, width: '100%', zIndex: 5,
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E50914" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ color: '#A3A3A3', fontSize: '13px' }}>Konten tidak tersedia</span>
                <span style={{ color: '#555', fontSize: '12px' }}>{filesError}</span>
                <button onClick={fetchFiles} style={{ backgroundColor: '#A855F7', border: 'none', borderRadius: '4px', color: '#FFFFFF', cursor: 'pointer', fontSize: '13px', fontWeight: 700, paddingBlock: '8px', paddingInline: '20px' }}>Coba Lagi</button>
              </div>
            )}
            {/* Video — always in DOM, native controls */}
            <video
              ref={videoRef}
              crossOrigin="anonymous"
              controls
              style={{
                aspectRatio: '16/9',
                backgroundColor: '#000',
                borderRadius: '8px',
                display: 'block',
                opacity: filesLoading || filesError ? 0 : 1,
                outline: 'none',
                transition: 'opacity 0.3s',
                width: '100%',
              }}
              playsInline
            />
          </div>
        </div>

        {/* ---- RIGHT: Info + Controls ---- */}
        <div style={{
          backgroundColor: '#141414',
          borderLeft: isMobile ? 'none' : '1px solid #1F1F1F',
          borderTop: isMobile ? '1px solid #1F1F1F' : 'none',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflowY: isMobile ? 'visible' : 'auto',
          padding: isMobile ? '16px' : '24px',
          width: isMobile ? '100%' : isTablet ? '320px' : '380px',
        }}>
          {/* Title */}
          <div style={{ marginBottom: '20px' }}>
            <SmallBadge bg="#A855F7" text={isTV ? 'TV Series' : 'Film'} textColor="#FFFFFF" />
            {files?.limited && <SmallBadge bg="#E50914" text="Limited" style={{ marginLeft: '6px' }} />}
            <div style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginTop: '10px' }}>
              {title || '—'}
            </div>
            {isTV && (
              <div style={{ color: '#A3A3A3', fontSize: '13px', marginTop: '4px' }}>Season {season} &bull; Episode {episode}</div>
            )}
          </div>

          {/* Quality */}
          {downloads.length > 0 && (
            <Section icon={<MonitorIcon />} label="Kualitas">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {downloads.map((d, i) => (
                  <button key={i} onClick={() => setActiveQuality(i)} className="server-btn" style={{
                    backgroundColor: activeQuality === i ? '#A855F7' : '#1F1F1F',
                    border: `1px solid ${activeQuality === i ? '#A855F7' : '#333'}`,
                    borderRadius: '4px', color: activeQuality === i ? '#FFFFFF' : '#A3A3A3',
                    cursor: 'pointer', fontSize: '12px', fontWeight: activeQuality === i ? 700 : 400,
                    paddingBlock: '6px', paddingInline: '14px',
                  }}>{d.resolution}p {d.size ? `· ${(d.size / 1e9).toFixed(1)}GB` : ''}</button>
                ))}
              </div>
            </Section>
          )}

          {/* Subtitle */}
          {subtitles.length > 0 && (
            <Section icon={<SubtitleIcon />} label="Subtitle">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {subtitles.map(sub => (
                  <button key={sub.lan} onClick={() => setActiveSubtitle(sub.lan)} className="server-btn" style={{
                    backgroundColor: activeSubtitle === sub.lan ? '#46D369' : '#1F1F1F',
                    border: `1px solid ${activeSubtitle === sub.lan ? '#46D369' : '#333'}`,
                    borderRadius: '4px', color: activeSubtitle === sub.lan ? '#FFFFFF' : '#A3A3A3',
                    cursor: 'pointer', fontSize: '11px', fontWeight: activeSubtitle === sub.lan ? 700 : 400,
                    paddingBlock: '5px', paddingInline: '12px',
                  }}>{sub.lanName}</button>
                ))}
              </div>
            </Section>
          )}

          {/* Prev / Next for TV */}
          {isTV && (
            <Section icon={null} label="Navigasi Episode">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {episode > 1 && (
                  <Link
                    to={`/film-watch/${encodeURIComponent(decodedPath)}?subjectId=${subjectId}&season=${season}&episode=${episode - 1}`}
                    style={{ alignItems: 'center', backgroundColor: '#1F1F1F', border: '1px solid #333', borderRadius: '6px', color: '#A3A3A3', display: 'flex', fontSize: '13px', gap: '8px', paddingBlock: '10px', paddingInline: '14px', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#A855F7'; e.currentTarget.style.color = '#FFF' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#A3A3A3' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                    Episode Sebelumnya
                  </Link>
                )}
                <Link
                  to={`/film-watch/${encodeURIComponent(decodedPath)}?subjectId=${subjectId}&season=${season}&episode=${episode + 1}`}
                  style={{ alignItems: 'center', backgroundColor: '#A855F7', border: 'none', borderRadius: '6px', color: '#FFFFFF', display: 'flex', fontSize: '13px', fontWeight: 700, gap: '8px', paddingBlock: '10px', paddingInline: '14px', textDecoration: 'none', transition: 'filter 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                >
                  Episode Selanjutnya
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </Section>
          )}

          {/* Actions */}
          <Section icon={null} label="">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => toggle({ slug: subjectId, title, image: null, type: isTV ? 'tv' : 'film', detailPath: decodedPath })}
                style={{ alignItems: 'center', background: inWatchlist ? 'rgba(168,85,247,0.1)' : '#1F1F1F', border: `1px solid ${inWatchlist ? '#A855F7' : '#333'}`, borderRadius: '6px', color: inWatchlist ? '#A855F7' : '#A3A3A3', cursor: 'pointer', display: 'flex', fontSize: '13px', gap: '8px', paddingBlock: '10px', paddingInline: '14px', transition: 'all 0.15s', width: '100%' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={inWatchlist ? '#A855F7' : 'none'} stroke={inWatchlist ? '#A855F7' : 'currentColor'} strokeWidth="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
                {inWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
              </button>
              <Link
                to={`/film/${encodeURIComponent(decodedPath)}`}
                style={{ alignItems: 'center', backgroundColor: '#1F1F1F', border: '1px solid #333', borderRadius: '6px', color: '#A3A3A3', display: 'flex', fontSize: '13px', gap: '8px', paddingBlock: '10px', paddingInline: '14px', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#FFF' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#A3A3A3' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Lihat Detail
              </Link>
            </div>
          </Section>

          {/* Episode list for TV */}
          {isTV && currentSeasonEpisodes > 0 && (
            <Section icon={null} label={`Daftar Episode — Season ${season}`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: isMobile ? 'none' : '320px', overflowY: 'auto' }}>
                {Array.from({ length: currentSeasonEpisodes }, (_, i) => i + 1).map(ep => {
                  const isActive = ep === episode
                  return (
                    <Link
                      key={ep}
                      to={`/film-watch/${encodeURIComponent(decodedPath)}?subjectId=${subjectId}&season=${season}&episode=${ep}`}
                      style={{
                        alignItems: 'center',
                        backgroundColor: isActive ? 'rgba(168,85,247,0.1)' : 'transparent',
                        borderLeft: isActive ? '3px solid #A855F7' : '3px solid transparent',
                        borderRadius: '4px',
                        color: isActive ? '#A855F7' : '#A3A3A3',
                        display: 'flex',
                        fontSize: '13px',
                        fontWeight: isActive ? 700 : 400,
                        gap: '10px',
                        paddingBlock: '8px',
                        paddingInline: '10px',
                        textDecoration: 'none',
                        transition: 'background-color 0.12s, color 0.12s',
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#FFF' } }}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#A3A3A3' } }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill={isActive ? '#A855F7' : 'none'} stroke={isActive ? '#A855F7' : 'currentColor'} strokeWidth="2" style={{ flexShrink: 0 }}>
                        <polygon points="5,3 19,12 5,21"/>
                      </svg>
                      Episode {ep}
                    </Link>
                  )
                })}
              </div>
            </Section>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        video::-webkit-media-controls { border-radius: 0 0 8px 8px; }
      `}</style>
    </div>
  )
}

function Section({ icon, label, children }) {
  return (
    <div style={{ borderTop: '1px solid #1F1F1F', marginBottom: '0', paddingBlock: '16px' }}>
      {label && (
        <div style={{ alignItems: 'center', display: 'flex', gap: '7px', marginBottom: '10px' }}>
          {icon && <span style={{ color: '#A3A3A3' }}>{icon}</span>}
          <span style={{ color: '#FFFFFF', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        </div>
      )}
      {children}
    </div>
  )
}

function SmallBadge({ bg, text, textColor }) {
  return (
    <span style={{ backgroundColor: bg, borderRadius: '3px', color: textColor || '#FFFFFF', display: 'inline-block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', paddingBlock: '2px', paddingInline: '8px', textTransform: 'uppercase' }}>
      {text}
    </span>
  )
}

function MonitorIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  )
}

function SubtitleIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  )
}
