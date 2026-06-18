import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useBreakpoint } from "../hooks/useBreakpoint.js";
import { useWatchlist } from "../hooks/useWatchlist.js";
import { useScrollToTop } from "../hooks/useScrollToTop.js";
import { useEffect } from "react";

export default function WatchlistPage() {
  useScrollToTop();
  useEffect(() => { document.title = 'Watchlist — ANIDOW' }, [])
  const { isMobile } = useBreakpoint();
  const { watchlist, remove } = useWatchlist();

  const animeList = watchlist.filter((i) => i.type === "anime" || !i.type);
  const filmList = watchlist.filter(
    (i) => i.type === "film" || i.type === "tv",
  );

  function timeAgo(ts) {
    if (!ts) return "";
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} hari lalu`;
    return `${Math.floor(days / 7)} minggu lalu`;
  }

  return (
    <div
      style={{
        backgroundColor: "#141414",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      <Navbar />
      <div style={{ height: "68px", flexShrink: 0 }} />

      {/* Page Header */}
      <div
        style={{
          boxSizing: "border-box",
          paddingInline: isMobile ? "16px" : "48px",
          paddingTop: "40px",
        }}
      >
        <div
          style={{
            alignItems: "flex-end",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "6px",
          }}
        >
          <div>
            <div
              style={{
                color: "#FFFFFF",
                fontFamily: '"Arial Black", Arial, system-ui, sans-serif',
                fontSize: isMobile ? "22px" : "32px",
                fontWeight: 900,
                letterSpacing: "-0.02em",
                lineHeight: "40px",
                marginBottom: "6px",
              }}
            >
              My Watchlist
            </div>
            <div style={{ color: "#A3A3A3", fontSize: "14px" }}>
              {watchlist.length} judul tersimpan
            </div>
          </div>
        </div>
      </div>

      {watchlist.length === 0 ? (
        <div
          style={{
            alignItems: "center",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            marginTop: "80px",
          }}
        >
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#333333"
            strokeWidth="1.5"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
          <span style={{ color: "#A3A3A3", fontSize: "16px" }}>
            Watchlist kamu masih kosong
          </span>
          <Link
            to="/"
            style={{
              backgroundColor: "#7C3AED",
              borderRadius: "4px",
              color: "#FFFFFF",
              fontSize: "14px",
              fontWeight: 600,
              paddingBlock: "10px",
              paddingInline: "24px",
              textDecoration: "none",
            }}
          >
            Cari Anime/Film
          </Link>
        </div>
      ) : (
        <>
          {/* Anime section */}
          {animeList.length > 0 && (
            <div
              style={{
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                paddingInline: isMobile ? "16px" : "48px",
                paddingTop: "32px",
              }}
            >
              <WatchlistSectionHeader
                accent="#7C3AED"
                title="Anime"
                count={`${animeList.length} judul`}
              />
              <WatchlistTable
                items={animeList}
                onRemove={remove}
                timeAgo={timeAgo}
                showType={false}
                isMobile={isMobile}
              />
            </div>
          )}

          {/* Films & TV section */}
          {filmList.length > 0 && (
            <>
              <div
                style={{
                  backgroundColor: "#2D2D2D",
                  flexShrink: 0,
                  height: "1px",
                  marginTop: "32px",
                }}
              />
              <div
                style={{
                  boxSizing: "border-box",
                  display: "flex",
                  flexDirection: "column",
                  paddingBottom: "56px",
                  paddingInline: isMobile ? "16px" : "48px",
                  paddingTop: "32px",
                }}
              >
                <WatchlistSectionHeader
                  accent="#A855F7"
                  title="Films &amp; TV Series"
                  count={`${filmList.length} judul`}
                />
                <WatchlistTable
                  items={filmList}
                  onRemove={remove}
                  timeAgo={timeAgo}
                  showType
                  isMobile={isMobile}
                />
              </div>
            </>
          )}

          {/* If only anime, add bottom padding */}
          {filmList.length === 0 && <div style={{ paddingBottom: "56px" }} />}
        </>
      )}
    </div>
  );
}

function WatchlistSectionHeader({ accent, title, count }) {
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "20px",
      }}
    >
      <div style={{ alignItems: "center", display: "flex", gap: "12px" }}>
        <div
          style={{
            backgroundColor: accent,
            borderRadius: "2px",
            flexShrink: 0,
            height: "22px",
            width: "4px",
          }}
        />
        <span
          style={{ color: "#FFFFFF", fontSize: "18px", fontWeight: 700 }}
          dangerouslySetInnerHTML={{ __html: title }}
        />
        <div
          style={{
            backgroundColor: "#1F1F1F",
            borderRadius: "9999px",
            paddingBlock: "2px",
            paddingInline: "10px",
          }}
        >
          <span style={{ color: "#A3A3A3", fontSize: "12px", fontWeight: 700 }}>
            {count}
          </span>
        </div>
      </div>
    </div>
  );
}

function WatchlistTable({ items, onRemove, timeAgo, showType, isMobile }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
      {/* Header row */}
      <div
        style={{
          alignItems: "center",
          borderBottom: "1px solid #1F1F1F",
          display: "flex",
          paddingBottom: "8px",
          paddingInline: "8px",
        }}
      >
        <ColHead
          width={isMobile ? undefined : "340px"}
          flex={isMobile ? true : undefined}
          flexShrink={isMobile ? 1 : 0}
          minWidth={isMobile ? 0 : undefined}
        >
          Judul
        </ColHead>
        {!isMobile && showType && <ColHead width="100px">Tipe</ColHead>}
        {!isMobile && <ColHead flex>Ditambahkan</ColHead>}
        <ColHead width={isMobile ? "40px" : "80px"}>Aksi</ColHead>
      </div>
      {items.map((item) => (
        <div
          key={item.slug}
          style={{
            alignItems: "center",
            borderBottom: "1px solid #1F1F1F",
            display: "flex",
            paddingBlock: "10px",
            paddingInline: "8px",
          }}
        >
          {/* Title cell */}
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flex: isMobile ? 1 : undefined,
              flexShrink: isMobile ? 1 : 0,
              gap: "12px",
              minWidth: isMobile ? 0 : undefined,
              width: isMobile ? undefined : "340px",
            }}
          >
            <div
              style={{
                borderRadius: "3px",
                flexShrink: 0,
                height: "56px",
                overflow: "hidden",
                width: "40px",
              }}
            >
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  style={{ height: "100%", objectFit: "cover", width: "100%" }}
                />
              ) : (
                <div
                  style={{
                    backgroundColor: "#2D2D2D",
                    height: "100%",
                    width: "100%",
                  }}
                />
              )}
            </div>
            <div>
              <Link
                to={`/detail/${item.slug}`}
                style={{
                  color: "#FFFFFF",
                  fontSize: "13px",
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#7C3AED")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#FFFFFF")}
              >
                {item.title}
              </Link>
            </div>
          </div>
          {!isMobile && showType && (
            <div style={{ flexShrink: 0, width: "100px" }}>
              <span
                style={{
                  backgroundColor: "#1F1F1F",
                  border: "1px solid #333333",
                  borderRadius: "3px",
                  color: "#A3A3A3",
                  fontSize: "11px",
                  paddingBlock: "2px",
                  paddingInline: "8px",
                }}
              >
                {item.type === "film" ? "Film" : "TV Series"}
              </span>
            </div>
          )}
          {!isMobile && (
            <div style={{ color: "#A3A3A3", flex: 1, fontSize: "12px" }}>
              {timeAgo(item.addedAt)}
            </div>
          )}
          <div
            style={{
              display: "flex",
              flexShrink: 0,
              gap: "10px",
              width: isMobile ? "40px" : "80px",
            }}
          >
            <Link to={`/detail/${item.slug}`}>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                style={{ cursor: "pointer" }}
              >
                <polygon
                  points="5,3 19,12 5,21"
                  fill="none"
                  stroke="#A3A3A3"
                  strokeWidth="2"
                />
              </svg>
            </Link>
            <button
              onClick={() => onRemove(item.slug)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                transition: "opacity 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                style={{ display: "block" }}
              >
                <polyline
                  points="3 6 5 6 21 6"
                  fill="none"
                  stroke="#E50914"
                  strokeWidth="2"
                />
                <path
                  d="M19 6l-1 14H6L5 6"
                  fill="none"
                  stroke="#E50914"
                  strokeWidth="2"
                />
                <path
                  d="M10 11v6"
                  fill="none"
                  stroke="#E50914"
                  strokeWidth="2"
                />
                <path
                  d="M14 11v6"
                  fill="none"
                  stroke="#E50914"
                  strokeWidth="2"
                />
                <path
                  d="M9 6V4h6v2"
                  fill="none"
                  stroke="#E50914"
                  strokeWidth="2"
                />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ColHead({ children, width, flex, flexShrink, minWidth }) {
  return (
    <div
      style={{
        color: "#A3A3A3",
        display: "inline-block",
        flex: flex ? 1 : undefined,
        flexShrink:
          flexShrink !== undefined ? flexShrink : flex ? undefined : 0,
        fontSize: "11px",
        fontWeight: 700,
        letterSpacing: "0.1em",
        minWidth,
        textTransform: "uppercase",
        width: width || undefined,
      }}
    >
      {children}
    </div>
  );
}
