import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import { useApi } from '../hooks/useApi.js'
import { useWatchlist } from '../hooks/useWatchlist.js'
import { useBreakpoint } from '../hooks/useBreakpoint.js'
import { useScrollToTop } from '../hooks/useScrollToTop.js'

export default function WatchPage() {
  useScrollToTop()
  const { id: animeSlug, episode: episodeSlug } = useParams()
  const [activeServer, setActiveServer] = useState(0)
  const { isMobile, isTablet } = useBreakpoint()

  const { data: epData, loading: epLoading, error: epError } = useApi(
    episodeSlug ? `/api/episode/${episodeSlug}` : null
  )
  const { data: animeData } = useApi(
    animeSlug ? `/api/anime/${animeSlug}` : null
  )

  const { toggle, isInWatchlist } = useWatchlist()
  const mirrors = epData?.mirrors || []
  const downloads = epData?.downloads || []
  const episodeList = epData?.episodeList || animeData?.episodes || []
  const activeMirror = mirrors[activeServer]
  const iframeUrl = activeMirror?.iframeUrl || epData?.defaultIframe
  const inWatchlist = isInWatchlist(animeSlug)

  useEffect(() => {
    if (animeData?.title) document.title = `Nonton ${animeData.title} — ANIDOW`
  }, [animeData?.title])

  return (
    <div style={{ backgroundColor: '#141414', display: 'flex', flexDirection: 'column', height: isMobile ? 'auto' : '100vh', minHeight: '100vh', overflow: isMobile ? 'visible' : 'hidden' }}>
      <Navbar />
      <div style={{ height: '68px', flexShrink: 0 }} />

      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flex: isMobile ? 'none' : 1, minHeight: isMobile ? 'auto' : 0, overflow: isMobile ? 'visible' : 'hidden' }}>

        {/* ---- LEFT: Player ---- */}
        <div style={{ backgroundColor: '#0d0d0d', display: 'flex', flex: isMobile ? 'none' : 1, flexDirection: 'column', minWidth: 0, overflow: isMobile ? 'visible' : 'hidden', padding: isMobile ? '12px' : isTablet ? '16px' : '24px 24px 24px 32px' }}>
          <div style={{ margin: '0 auto', maxWidth: isMobile ? '100%' : '1100px', position: 'relative', width: '100%' }}>
            {/* Loading overlay */}
            {epLoading && (
              <div style={{
                alignItems: 'center', aspectRatio: '16/9', backgroundColor: '#0a0a0a', borderRadius: '8px',
                display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center',
                left: 0, position: 'absolute', top: 0, width: '100%', zIndex: 5,
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <span style={{ color: '#A3A3A3', fontSize: '13px' }}>Memuat player...</span>
              </div>
            )}
            {/* Error overlay */}
            {epError && !epLoading && (
              <div style={{
                alignItems: 'center', aspectRatio: '16/9', backgroundColor: '#0a0a0a', borderRadius: '8px',
                display: 'flex', flexDirection: 'column', gap: '12px', justifyContent: 'center',
                left: 0, position: 'absolute', top: 0, width: '100%', zIndex: 5,
              }}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#E50914" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 600 }}>Anime tidak ditemukan</span>
                <span style={{ color: '#A3A3A3', fontSize: '12px' }}>Episode ini sedang tidak tersedia.</span>
              </div>
            )}
            {/* Player: iframe or fallback */}
            {!epLoading && !epError && (
              iframeUrl ? (
                <iframe
                  src={iframeUrl}
                  style={{ aspectRatio: '16/9', border: 'none', borderRadius: '8px', display: 'block', width: '100%' }}
                  allow="autoplay; fullscreen"
                  title={epData?.title || 'Episode'}
                />
              ) : (
                <div style={{ aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', position: 'relative', width: '100%' }}>
                  <div style={{ backgroundImage: `url(${animeData?.image})`, backgroundPosition: '50%', backgroundSize: 'cover', height: '100%', opacity: 0.5, width: '100%' }} />
                  <div style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85) 100%)', bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 }} />
                  <div style={{ bottom: '20px', color: '#A3A3A3', fontSize: '13px', left: 0, position: 'absolute', right: 0, textAlign: 'center' }}>
                    Pilih mirror di sidebar untuk mulai streaming
                  </div>
                </div>
              )
            )}
            {/* Spacer when loading */}
            {epLoading && <div style={{ aspectRatio: '16/9', width: '100%' }} />}

            {/* Badges */}
            {!epLoading && !epError && (
              <div style={{ display: 'flex', gap: '8px', position: 'absolute', right: '12px', top: '12px', zIndex: 2 }}>
                <span style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: '4px', color: '#FFFFFF', fontSize: '11px', fontWeight: 700, paddingBlock: '4px', paddingInline: '10px' }}>HD</span>
                <span style={{ backgroundColor: 'rgba(124,58,237,0.85)', borderRadius: '4px', color: '#FFFFFF', fontSize: '11px', fontWeight: 700, paddingBlock: '4px', paddingInline: '10px' }}>SUB</span>
              </div>
            )}
          </div>
        </div>

        {/* ---- RIGHT: Sidebar ---- */}
        <div style={{
          backgroundColor: '#141414',
          borderLeft: isMobile ? 'none' : '1px solid #1F1F1F',
          borderTop: isMobile ? '1px solid #1F1F1F' : 'none',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          overflowY: isMobile ? 'visible' : 'auto',
          padding: isMobile ? '16px' : '24px',
          width: isMobile ? '100%' : isTablet ? '320px' : '400px',
        }}>
          {/* Title */}
          <div style={{ marginBottom: '4px' }}>
            <SmallBadge bg="#7C3AED" text="Anime" />
            <div style={{ color: '#FFFFFF', fontSize: '18px', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginTop: '10px' }}>
              {animeData?.title || '—'}
            </div>
            {epData?.title && (
              <div style={{ color: '#A3A3A3', fontSize: '13px', marginTop: '4px' }}>{epData.title}</div>
            )}
          </div>

          {/* Streaming Server */}
          <Section icon={<MonitorIcon />} label="Streaming Server">
            {epLoading ? (
              <span style={{ color: '#A3A3A3', fontSize: '12px' }}>Memuat mirror...</span>
            ) : mirrors.length === 0 ? (
              <span style={{ color: '#A3A3A3', fontSize: '12px' }}>Tidak ada mirror tersedia</span>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {mirrors.map((m, i) => (
                  <button key={i} onClick={() => setActiveServer(i)} className="server-btn" style={{
                    backgroundColor: activeServer === i ? '#7C3AED' : '#1F1F1F',
                    border: `1px solid ${activeServer === i ? '#7C3AED' : '#333'}`,
                    borderRadius: '4px',
                    color: activeServer === i ? '#FFFFFF' : '#A3A3A3',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: activeServer === i ? 700 : 400,
                    paddingBlock: '6px',
                    paddingInline: '14px',
                    transition: 'background-color 0.15s',
                  }}>
                    {m.host || `Mirror ${i + 1}`}{m.quality ? ` (${m.quality})` : ''}
                  </button>
                ))}
              </div>
            )}
          </Section>

          {/* Prev / Next */}
          {(epData?.prevEpisodeUrl || epData?.nextEpisodeUrl) && (
            <Section icon={null} label="Navigasi Episode">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {epData?.prevEpisodeUrl && (
                  <Link
                    to={`/watch/${animeSlug}/${extractSlug(epData.prevEpisodeUrl)}`}
                    style={{ alignItems: 'center', backgroundColor: '#1F1F1F', border: '1px solid #333', borderRadius: '6px', color: '#A3A3A3', display: 'flex', fontSize: '13px', gap: '8px', paddingBlock: '10px', paddingInline: '14px', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#7C3AED'; e.currentTarget.style.color = '#FFF' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#A3A3A3' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
                    Episode Sebelumnya
                  </Link>
                )}
                {epData?.nextEpisodeUrl && (
                  <Link
                    to={`/watch/${animeSlug}/${extractSlug(epData.nextEpisodeUrl)}`}
                    style={{ alignItems: 'center', backgroundColor: '#7C3AED', border: 'none', borderRadius: '6px', color: '#FFFFFF', display: 'flex', fontSize: '13px', fontWeight: 700, gap: '8px', paddingBlock: '10px', paddingInline: '14px', textDecoration: 'none', transition: 'filter 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                  >
                    Episode Selanjutnya
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                  </Link>
                )}
              </div>
            </Section>
          )}

          {/* Actions */}
          <Section icon={null} label="">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => toggle({ slug: animeSlug, title: animeData?.title || epData?.title, image: animeData?.image, type: 'anime' })}
                style={{
                  alignItems: 'center', background: inWatchlist ? 'rgba(124,58,237,0.1)' : '#1F1F1F',
                  border: `1px solid ${inWatchlist ? '#7C3AED' : '#333'}`, borderRadius: '6px',
                  color: inWatchlist ? '#7C3AED' : '#A3A3A3', cursor: 'pointer', display: 'flex',
                  fontSize: '13px', gap: '8px', paddingBlock: '10px', paddingInline: '14px',
                  transition: 'all 0.15s', width: '100%',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill={inWatchlist ? '#7C3AED' : 'none'} stroke={inWatchlist ? '#7C3AED' : 'currentColor'} strokeWidth="2">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
                </svg>
                {inWatchlist ? 'Hapus dari Watchlist' : 'Tambah ke Watchlist'}
              </button>
              <Link
                to={`/detail/${animeSlug}`}
                style={{ alignItems: 'center', backgroundColor: '#1F1F1F', border: '1px solid #333', borderRadius: '6px', color: '#A3A3A3', display: 'flex', fontSize: '13px', gap: '8px', paddingBlock: '10px', paddingInline: '14px', textDecoration: 'none', transition: 'border-color 0.15s, color 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.color = '#FFF' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#A3A3A3' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                Lihat Detail
              </Link>
            </div>
          </Section>

          {/* Episode List */}
          {episodeList.length > 0 && (
            <Section icon={null} label={`Daftar Episode (${episodeList.length})`}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: isMobile ? 'none' : '400px', overflowY: 'auto' }}>
                {episodeList.map((ep, idx) => {
                  const epSlug = ep.slug
                  const isActive = epSlug === episodeSlug
                  const epNum = ep.episode || ep.label || String(idx + 1)
                  return (
                    <Link key={epSlug} to={`/watch/${animeSlug}/${epSlug}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        alignItems: 'center',
                        backgroundColor: isActive ? 'rgba(124,58,237,0.1)' : 'transparent',
                        borderLeft: `3px solid ${isActive ? '#7C3AED' : 'transparent'}`,
                        borderRadius: '4px',
                        color: isActive ? '#7C3AED' : '#A3A3A3',
                        cursor: 'pointer',
                        display: 'flex',
                        fontSize: '13px',
                        fontWeight: isActive ? 700 : 400,
                        gap: '10px',
                        paddingBlock: '8px',
                        paddingInline: '10px',
                        transition: 'background-color 0.12s, color 0.12s',
                      }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#FFF' } }}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#A3A3A3' } }}
                      >
                        {/* Episode number */}
                        <span style={{ color: isActive ? '#7C3AED' : '#555', flexShrink: 0, fontSize: '11px', fontWeight: 700, minWidth: '28px', textAlign: 'right' }}>
                          {epNum}
                        </span>
                        {/* Play icon */}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill={isActive ? '#7C3AED' : '#555'} style={{ flexShrink: 0 }}>
                          <polygon points="5,3 19,12 5,21"/>
                        </svg>
                        {/* Title */}
                        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ep.title}
                        </span>
                        {isActive && (
                          <span style={{ backgroundColor: 'rgba(124,58,237,0.15)', borderRadius: '3px', color: '#7C3AED', flexShrink: 0, fontSize: '9px', fontWeight: 700, paddingBlock: '2px', paddingInline: '6px' }}>Playing</span>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
            </Section>
          )}

          {/* Download — paling bawah */}
          {downloads.length > 0 && (
            <Section icon={<DownloadIcon />} label="Download">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {downloads.map((group, gi) => (
                  <div key={gi}>
                    {group.heading && (
                      <div style={{ color: '#A3A3A3', fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', marginBottom: '6px', textTransform: 'uppercase' }}>{group.heading}</div>
                    )}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {group.items?.map((item, ii) =>
                        item.links?.[0] ? (
                          <a key={ii} href={item.links[0].url} target="_blank" rel="noopener noreferrer" className="server-btn" style={{
                            alignItems: 'center', backgroundColor: '#1F1F1F', border: '1px solid #333', borderRadius: '4px',
                            color: '#46D369', display: 'flex', fontSize: '11px', fontWeight: 600, gap: '4px',
                            paddingBlock: '5px', paddingInline: '10px', textDecoration: 'none',
                          }}>
                            <DownloadIcon size={10} />
                            {item.quality}{item.sizeMB ? ` · ${item.sizeMB}MB` : ''}
                          </a>
                        ) : null
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

function extractSlug(url) {
  if (!url) return ''
  const m = url.match(/\/episode\/([^/]+)/)
  return m ? m[1] : url
}

function Section({ icon, label, children }) {
  return (
    <div style={{ borderTop: '1px solid #1F1F1F', paddingBlock: '16px' }}>
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

function SmallBadge({ bg, text }) {
  return (
    <span style={{ backgroundColor: bg, borderRadius: '3px', color: '#FFFFFF', display: 'inline-block', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', paddingBlock: '2px', paddingInline: '8px', textTransform: 'uppercase' }}>
      {text}
    </span>
  )
}

function MonitorIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <line x1="8" y1="21" x2="16" y2="21"/>
      <line x1="12" y1="17" x2="12" y2="21"/>
    </svg>
  )
}

function DownloadIcon({ size = 13 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/>
      <line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  )
}
