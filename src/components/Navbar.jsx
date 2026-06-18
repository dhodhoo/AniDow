import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { api } from "../lib/api.js";
import { movieApi } from "../lib/movieApi.js";
import { useBreakpoint } from '../hooks/useBreakpoint.js'

// Brand colors
const ANIME_PURPLE = "#7C3AED";
const FILM_PURPLE = "#A855F7";

export default function Navbar({ transparent = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false);
  const isHome = location.pathname === "/";
  const isGenre = location.pathname === "/browse";
  const isWatchlist = location.pathname === "/watchlist";
  const [searchMode, setSearchMode] = useState("anime");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const mobileInputRef = useRef(null);
  const searchWrapRef = useRef(null);

  const [activeSection, setActiveSection] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.4);
      if (!isHome) return;
      const anime = document.getElementById("anime");
      const films = document.getElementById("films");
      if (!anime || !films) return;
      const scrollY = window.scrollY + 80;
      if (scrollY >= films.offsetTop) setActiveSection("films");
      else if (scrollY >= anime.offsetTop) setActiveSection("anime");
      else setActiveSection(null);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    // Run once on mount to set initial state
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const handleHome = (e) => {
    e.preventDefault();
    if (isHome) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "instant" }), 50);
    }
  };

  const openSearch = () => {
    setSearchOpen(true);
    setQuery("");
    setResults([]);
    setTimeout(() => inputRef.current?.focus(), 60);
  };

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setQuery("");
    setResults([]);
  }, []);

  useEffect(() => {
    if (!searchOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    if (!searchOpen) return;
    const onClick = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target))
        closeSearch();
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [searchOpen, closeSearch]);

  useEffect(() => {
    if (!searchOpen || query.length < 2) {
      setResults([]);
      return;
    }
    const id = setTimeout(async () => {
      setSearching(true);
      try {
        if (searchMode === "anime") {
          const data = await api("/api/search", { params: { q: query } });
          const items = (data.items || []).filter((i) => i.kind !== "episode");
          setResults(items.slice(0, 10));
        } else {
          const data = await movieApi("/suggest", { params: { q: query } });
          const items = (data.suggestions || [])
            .slice(0, 8)
            .map((s) => ({ title: s, slug: null, isFilmSuggest: true }));
          setResults(items);
        }
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => clearTimeout(id);
  }, [query, searchMode, searchOpen]);

  const handleSelect = (item) => {
    closeSearch();
    if (searchMode === "film") {
      navigate(`/search?q=${encodeURIComponent(item.title)}&mode=film`);
    } else {
      navigate(`/detail/${item.slug}`);
    }
  };

  const accentColor = ANIME_PURPLE;

  return (
    <>
      <div
        style={{
          alignItems: "center",
          backgroundColor: transparent && !scrolled ? "transparent" : "#141414",
          backgroundImage:
            transparent && !scrolled
              ? "linear-gradient(to bottom, rgba(20,20,20,0.97) 0%, rgba(20,20,20,0) 100%)"
              : "none",
          borderBottom:
            transparent && !scrolled
              ? "0px solid #1F1F1F"
              : "1px solid #1F1F1F",
          transition: "background-color 0.3s ease, border-color 0.3s ease",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          boxSizing: "border-box",
          display: "flex",
          height: "68px",
          justifyContent: "space-between",
          left: 0,
          paddingInline: isMobile ? '16px' : isTablet ? '24px' : '48px',
          position: "fixed",
          right: 0,
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Left: logo + nav */}
        <div style={{ alignItems: "center", display: "flex", gap: "40px" }}>
          {/* Brand: logo icon + ANIDOW text */}
          <a
            href="/"
            onClick={handleHome}
            style={{
              alignItems: "center",
              display: "flex",
              gap: "8px",
              textDecoration: "none",
            }}
          >
            <img
              src="/logo.png"
              alt="ANIDOW"
              style={{ height: "28px", objectFit: "contain" }}
            />
            <span
              style={{
                color: "#FFFFFF",
                fontFamily: '"Arial Black", Arial, system-ui, sans-serif',
                fontSize: "20px",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                lineHeight: "28px",
              }}
            >
              ANIDOW
            </span>
          </a>
          {!isMobile && (
            <nav style={{ alignItems: "center", display: "flex", gap: "28px" }}>
              <NavItem
                label="Home"
                active={isHome && !activeSection && !isGenre}
                onClick={handleHome}
                href="/"
                accent={accentColor}
              />
              <NavItem
                label="Anime"
                active={activeSection === "anime"}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isHome) {
                    navigate("/");
                    setTimeout(() => scrollToId("anime"), 200);
                  } else scrollToId("anime");
                }}
                href="/#anime"
                accent={accentColor}
              />
              <NavItem
                label="Film & TV Series"
                active={activeSection === "films"}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isHome) {
                    navigate("/");
                    setTimeout(() => scrollToId("films"), 200);
                  } else scrollToId("films");
                }}
                href="/#films"
                accent={accentColor}
              />
              <Link
                to="/browse"
                style={navLinkStyle(isGenre, accentColor)}
                onMouseEnter={(e) => {
                  if (!isGenre) e.currentTarget.style.color = "#FFFFFF";
                }}
                onMouseLeave={(e) => {
                  if (!isGenre) e.currentTarget.style.color = "#A3A3A3";
                }}
              >
                Genre
              </Link>
            </nav>
          )}
        </div>

      {/* Right: search + watchlist */}
      {!isMobile && (
        <div style={{ alignItems: 'center', display: 'flex', gap: '12px' }}>
          <div ref={searchWrapRef} style={{ position: 'relative' }}>
            {!searchOpen ? (
              <button
                onClick={openSearch}
                style={{
                  alignItems: 'center',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  flexShrink: 0,
                  padding: '4px',
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  style={{ flexShrink: 0 }}
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="8"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line
                    x1="21"
                    y1="21"
                    x2="16.65"
                    y2="16.65"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : (
              <div style={{ alignItems: 'center', display: 'flex', gap: '8px' }}>
                {/* Mode toggles */}
                <div
                  style={{
                    alignItems: 'center',
                    backgroundColor: '#1F1F1F',
                    border: '1px solid #333333',
                    borderRadius: '6px',
                    display: 'flex',
                    padding: '3px',
                  }}
                >
                  <ModeToggle
                    label="Anime"
                    active={searchMode === 'anime'}
                    accent={ANIME_PURPLE}
                    onClick={() => {
                      setSearchMode('anime');
                      setResults([]);
                      inputRef.current?.focus();
                    }}
                  />
                  <ModeToggle
                    label="Film & TV"
                    active={searchMode === 'film'}
                    accent={FILM_PURPLE}
                    onClick={() => {
                      setSearchMode('film');
                      setResults([]);
                      inputRef.current?.focus();
                    }}
                  />
                </div>
                {/* Input */}
                <div style={{ position: 'relative' }}>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#A3A3A3"
                    strokeWidth="2"
                    style={{
                      left: '10px',
                      pointerEvents: 'none',
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && query.trim()) {
                        closeSearch();
                        navigate(
                          `/search?q=${encodeURIComponent(query.trim())}&mode=${searchMode}`,
                        );
                      }
                    }}
                    placeholder={
                      searchMode === 'anime'
                        ? 'Cari anime...'
                        : 'Cari film atau serial...'
                    }
                    style={{
                      backgroundColor: '#1F1F1F',
                      border: '1px solid #333333',
                      borderRadius: '6px',
                      color: '#FFFFFF',
                      fontSize: '13px',
                      outline: 'none',
                      padding: '7px 10px 7px 30px',
                      width: '220px',
                      transition: 'border-color 0.15s',
                    }}
                    onFocus={(e) => (e.target.style.borderColor = ANIME_PURPLE)}
                    onBlur={(e) => (e.target.style.borderColor = '#333333')}
                  />
                  {searching && (
                    <div
                      style={{
                        position: 'absolute',
                        right: '8px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                      }}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#A3A3A3"
                        strokeWidth="2"
                        style={{ animation: 'spin 0.8s linear infinite' }}
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    </div>
                  )}
                </div>
                <button
                  onClick={closeSearch}
                  style={{
                    alignItems: 'center',
                    background: 'none',
                    border: 'none',
                    color: '#A3A3A3',
                    cursor: 'pointer',
                    display: 'flex',
                    flexShrink: 0,
                    padding: '4px',
                    transition: 'color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#FFF')}
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.color = '#A3A3A3')
                  }
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            )}

            {/* Dropdown results */}
            {searchOpen && results.length > 0 && (
              <div
                style={{
                  backgroundColor: '#1F1F1F',
                  border: '1px solid #2D2D2D',
                  borderRadius: '8px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  left: 0,
                  maxHeight: '360px',
                  overflowY: 'auto',
                  position: 'absolute',
                  right: 0,
                  top: 'calc(100% + 8px)',
                  zIndex: 101,
                }}
              >
                {results.map((item, i) => (
                  <button
                    key={item.slug || i}
                    onClick={() => handleSelect(item)}
                    style={{
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      borderBottom:
                        i < results.length - 1 ? '1px solid #2D2D2D' : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      gap: '10px',
                      padding: '10px 12px',
                      textAlign: 'left',
                      transition: 'background-color 0.15s',
                      width: '100%',
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = '#2D2D2D')
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = 'transparent')
                    }
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#A3A3A3"
                      strokeWidth="2"
                      style={{ flexShrink: 0 }}
                    >
                      <polygon points="5,3 19,12 5,21" />
                    </svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          color: '#FFFFFF',
                          fontSize: '13px',
                          fontWeight: 500,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.title}
                      </div>
                      {(item.status || item.rating) && (
                        <div
                          style={{
                            color: '#A3A3A3',
                            fontSize: '10px',
                            marginTop: '1px',
                          }}
                        >
                          {[item.status, item.rating && `\u2605 ${item.rating}`]
                            .filter(Boolean)
                            .join(' \u00b7 ')}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {searchOpen &&
              query.length >= 2 &&
              results.length === 0 &&
              !searching && (
                <div
                  style={{
                    backgroundColor: '#1F1F1F',
                    border: '1px solid #2D2D2D',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                    color: '#A3A3A3',
                    fontSize: '13px',
                    left: 0,
                    padding: '14px 12px',
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    zIndex: 101,
                  }}
                >
                  Tidak ada hasil untuk &ldquo;{query}&rdquo;
                </div>
              )}
          </div>

          {/* Watchlist */}
          <Link
            to="/watchlist"
            style={{ flexShrink: 0, textDecoration: 'none' }}
          >
            <div
              style={{
                alignItems: 'center',
                backgroundColor: isWatchlist ? ANIME_PURPLE : '#1F1F1F',
                border: `1px solid ${isWatchlist ? ANIME_PURPLE : '#333333'}`,
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                gap: '8px',
                paddingBlock: '6px',
                paddingInline: '16px',
                transition: 'background-color 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                if (!isWatchlist)
                  e.currentTarget.style.backgroundColor = '#2D2D2D';
              }}
              onMouseLeave={(e) => {
                if (!isWatchlist)
                  e.currentTarget.style.backgroundColor = isWatchlist
                    ? ANIME_PURPLE
                    : '#1F1F1F';
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                style={{ flexShrink: 0 }}
              >
                <path
                  d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                style={{
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  lineHeight: '16px',
                }}
              >
                Watchlist
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* Mobile: Hamburger button */}
      {isMobile && (
        <button
          onClick={() => setMenuOpen(prev => !prev)}
          style={{ alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '5px', padding: '4px' }}
        >
          <span style={{ backgroundColor: '#FFFFFF', borderRadius: '2px', display: 'block', height: '2px', width: '22px' }} />
          <span style={{ backgroundColor: '#FFFFFF', borderRadius: '2px', display: 'block', height: '2px', width: '22px' }} />
          <span style={{ backgroundColor: '#FFFFFF', borderRadius: '2px', display: 'block', height: '2px', width: '22px' }} />
        </button>
      )}
    </div>

    {/* Mobile drawer */}
    {isMobile && menuOpen && (
      <div
        onClick={() => setMenuOpen(false)}
        style={{
          backdropFilter: 'blur(8px)',
          backgroundColor: 'rgba(14,14,14,0.97)',
          bottom: 0, left: 0, right: 0,
          display: 'flex', flexDirection: 'column',
          padding: '24px 16px',
          position: 'fixed',
          top: '68px',
          zIndex: 99,
        }}
      >
        {[['/', 'Home'], ['/#anime', 'Anime'], ['/#films', 'Film & TV Series'], ['/browse', 'Genre']].map(([href, label]) => (
          <a key={href} href={href} onClick={() => setMenuOpen(false)} style={{
            borderBottom: '1px solid #1F1F1F', color: '#FFFFFF', display: 'block',
            fontSize: '16px', fontWeight: 600, paddingBlock: '16px', textDecoration: 'none',
          }}>{label}</a>
        ))}
        <a href="/watchlist" onClick={() => setMenuOpen(false)} style={{
          alignItems: 'center', color: '#7C3AED', display: 'flex', fontSize: '16px',
          fontWeight: 600, gap: '8px', marginTop: '16px', textDecoration: 'none',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
          </svg>
          Watchlist
        </a>
        {/* Mobile search */}
        <div onClick={(e) => e.stopPropagation()} style={{ marginTop: '16px' }}>
          <div style={{ alignItems: 'center', display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <div style={{
              alignItems: 'center', backgroundColor: '#1F1F1F', border: '1px solid #333333',
              borderRadius: '6px', display: 'flex', padding: '3px',
            }}>
              <MobileModeToggle
                label="Anime"
                active={searchMode === 'anime'}
                accent={ANIME_PURPLE}
                onClick={() => {
                  setSearchMode('anime')
                  setResults([])
                  mobileInputRef.current?.focus()
                }}
              />
              <MobileModeToggle
                label="Film & TV"
                active={searchMode === 'film'}
                accent={FILM_PURPLE}
                onClick={() => {
                  setSearchMode('film')
                  setResults([])
                  mobileInputRef.current?.focus()
                }}
              />
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2"
              style={{ left: '10px', pointerEvents: 'none', position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              ref={mobileInputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setSearchOpen(true) }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && query.trim()) {
                  setMenuOpen(false)
                  setSearchOpen(false)
                  navigate(`/search?q=${encodeURIComponent(query.trim())}&mode=${searchMode}`)
                }
              }}
              placeholder={searchMode === 'anime' ? 'Cari anime...' : 'Cari film atau serial...'}
              style={{
                backgroundColor: '#1F1F1F', border: '1px solid #333333', borderRadius: '6px',
                boxSizing: 'border-box', color: '#FFFFFF', fontSize: '14px', outline: 'none',
                padding: '10px 10px 10px 32px', width: '100%',
              }}
            />
            {searching && (
              <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2"
                  style={{ animation: 'spin 0.8s linear infinite' }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
              </div>
            )}
          </div>
          {/* Mobile search results */}
          {query.length >= 2 && (
            <div style={{ maxHeight: '280px', overflowY: 'auto', marginTop: '8px' }}>
              {results.length > 0 ? (
                results.map((item, i) => (
                  <button key={item.slug || i}
                    onClick={() => {
                      setMenuOpen(false)
                      handleSelect(item)
                    }}
                    style={{
                      alignItems: 'center', background: 'none', border: 'none',
                      borderBottom: i < results.length - 1 ? '1px solid #1F1F1F' : 'none',
                      cursor: 'pointer', display: 'flex', gap: '10px', padding: '12px 0',
                      textAlign: 'left', transition: 'opacity 0.15s', width: '100%',
                    }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#A3A3A3" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <polygon points="5,3 19,12 5,21"/>
                    </svg>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: '#FFFFFF', fontSize: '14px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.title}
                      </div>
                      {(item.status || item.rating) && (
                        <div style={{ color: '#A3A3A3', fontSize: '10px', marginTop: '2px' }}>
                          {[item.status, item.rating && `\u2605 ${item.rating}`].filter(Boolean).join(' \u00b7 ')}
                        </div>
                      )}
                    </div>
                  </button>
                ))
              ) : !searching && (
                <div style={{ color: '#A3A3A3', fontSize: '13px', padding: '8px 0' }}>
                  Tidak ada hasil untuk &ldquo;{query}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )}
  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </>
  )
}

function scrollToId(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}

function navLinkStyle(active, accent) {
  return {
    borderBottom: active ? `2px solid ${accent}` : "2px solid transparent",
    color: active ? "#FFFFFF" : "#A3A3A3",
    fontFamily: "Arial, system-ui, sans-serif",
    fontSize: "14px",
    fontWeight: active ? 500 : 400,
    lineHeight: "18px",
    paddingBottom: "2px",
    textDecoration: "none",
    transition: "color 0.15s ease",
    cursor: "pointer",
  };
}

function NavItem({ label, active, onClick, href, accent }) {
  return (
    <a
      href={href}
      onClick={onClick}
      style={navLinkStyle(active, accent)}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.color = "#FFFFFF";
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.color = "#A3A3A3";
      }}
    >
      {label}
    </a>
  );
}

function ModeToggle({ label, active, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: active ? accent : 'transparent',
        border: 'none',
        borderRadius: '4px',
        color: active ? '#FFFFFF' : '#A3A3A3',
        cursor: 'pointer',
        fontSize: '11px',
        fontWeight: active ? 700 : 400,
        padding: '4px 10px',
        transition: 'background-color 0.15s, color 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

function MobileModeToggle({ label, active, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: active ? accent : 'transparent',
        border: 'none',
        borderRadius: '4px',
        color: active ? '#FFFFFF' : '#A3A3A3',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: active ? 700 : 400,
        padding: '6px 12px',
        transition: 'background-color 0.15s, color 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}
