import { useRef, useEffect, useState, useCallback } from 'react'

/**
 * Horizontal scroll carousel with left/right arrow buttons and fade edge indicators.
 * Fades disappear when scroll reaches the respective edge.
 */
export default function ScrollCarousel({ children, gap = 12 }) {
  const trackRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const updateScrollState = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(updateScrollState)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      ro.disconnect()
    }
  }, [updateScrollState])

  const scroll = (dir) => {
    const el = trackRef.current
    if (!el) return
    // Scroll by ~3 card widths (approx 660px for 200px cards)
    el.scrollBy({ left: dir * 660, behavior: 'smooth' })
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Left fade */}
      <div style={{
        background: 'linear-gradient(to right, rgba(20,20,20,0.95) 0%, transparent 100%)',
        bottom: 0,
        left: 0,
        opacity: canScrollLeft ? 1 : 0,
        pointerEvents: 'none',
        position: 'absolute',
        top: 0,
        transition: 'opacity 0.25s ease',
        width: '80px',
        zIndex: 2,
      }} />
      {/* Right fade */}
      <div style={{
        background: 'linear-gradient(to left, rgba(20,20,20,0.95) 0%, transparent 100%)',
        bottom: 0,
        opacity: canScrollRight ? 1 : 0,
        pointerEvents: 'none',
        position: 'absolute',
        right: 0,
        top: 0,
        transition: 'opacity 0.25s ease',
        width: '80px',
        zIndex: 2,
      }} />

      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll(-1)}
          style={{
            alignItems: 'center',
            backgroundColor: 'rgba(20,20,20,0.85)',
            border: '1px solid #333333',
            borderRadius: '9999px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.6)',
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            height: '40px',
            justifyContent: 'center',
            left: '8px',
            position: 'absolute',
            top: '50%',
            transform: 'translateY(-50%)',
            transition: 'background-color 0.15s',
            width: '40px',
            zIndex: 3,
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7C3AED'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(20,20,20,0.85)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      )}

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll(1)}
          style={{
            alignItems: 'center',
            backgroundColor: 'rgba(20,20,20,0.85)',
            border: '1px solid #333333',
            borderRadius: '9999px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.6)',
            color: '#FFFFFF',
            cursor: 'pointer',
            display: 'flex',
            height: '40px',
            justifyContent: 'center',
            position: 'absolute',
            right: '8px',
            top: '50%',
            transform: 'translateY(-50%)',
            transition: 'background-color 0.15s',
            width: '40px',
            zIndex: 3,
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#7C3AED'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(20,20,20,0.85)'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      )}

      {/* Scrollable track — paddingBlock gives room for hover scale without triggering vertical scroll */}
      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: `${gap}px`,
          overflowX: 'auto',
          overflowY: 'hidden',
          paddingBlock: '10px',
          marginBlock: '-10px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {children}
      </div>
    </div>
  )
}
