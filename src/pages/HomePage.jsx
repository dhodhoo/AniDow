import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import ScrollCarousel from "../components/ScrollCarousel.jsx";
import { useApi } from "../hooks/useApi.js";
import { useMovieApi } from "../hooks/useMovieApi.js";
import { useBreakpoint } from "../hooks/useBreakpoint.js";
import { useScrollToTop } from "../hooks/useScrollToTop.js";

// Whitelist carousel Film & TV yang ditampilkan (urutan sesuai list ini)
const FILM_ROW_WHITELIST = [
  "Trending Movies",
  "Trending Drama",
  "Trending Western",
  "Recently Added",
  "Dubbing Indonesia",
  "K-Drama: New Release",
];

function normalizeTitle(t) {
  return t
    .trim()
    .replace(/[^\w\s]/g, "")
    .toLowerCase();
}

function CardSkeleton({ count = 6 }) {
  return (
    <div style={{ display: "flex", gap: "12px" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          style={{
            animation: "pulse 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.06}s`,
            backgroundColor: "#2D2D2D",
            borderRadius: "8px",
            flexShrink: 0,
            height: "300px",
            width: "200px",
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  useScrollToTop()
  useEffect(() => { document.title = 'ANIDOW — Nonton Anime, Film & TV Series Gratis' }, [])
  const {
    data: homeData,
    loading: homeLoading,
    error: homeError,
  } = useApi("/api/home");
  const { data: movieHome, loading: movieHomeLoading } = useMovieApi("/home");

  const ongoing = homeData?.ongoing || [];
  const complete = homeData?.complete || [];

  // Anime genre carousels
  const { data: actionData, loading: actionLoading } = useApi(
    "/api/genre/action",
    { page: 1 },
  );
  const { data: comedyData, loading: comedyLoading } = useApi(
    "/api/genre/comedy",
    { page: 1 },
  );
  const { data: romanceData, loading: romanceLoading } = useApi(
    "/api/genre/romance",
    { page: 1 },
  );

  // Parse movie home rows sorted by position + whitelist filter
  const movieRows = (movieHome?.rows || []).sort(
    (a, b) => a.position - b.position,
  );
  const bannerRow = movieRows.find((r) => r.type === "BANNER");
  const banners = bannerRow?.banners || [];
  const allCarouselRows = movieRows.filter(
    (r) =>
      r.type !== "BANNER" &&
      r.type !== "APPOINTMENT_LIST" &&
      r.items?.length > 0 &&
      FILM_ROW_WHITELIST.some((w) =>
        normalizeTitle(r.title).includes(normalizeTitle(w)),
      ),
  );
  // Sort by whitelist order
  const movieCarouselRows = FILM_ROW_WHITELIST.map((w) =>
    allCarouselRows.find((r) =>
      normalizeTitle(r.title).includes(normalizeTitle(w)),
    ),
  ).filter(Boolean);

  return (
    <div
      style={{
        backgroundColor: "#141414",
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <Navbar transparent />

      {/* Hero Slideshow � from MovieBox /home BANNER row */}
      <HeroBanner banners={banners} loading={movieHomeLoading} />

      {/* ===== ANIME SECTION ===== */}
      <div
        id="anime"
        style={{
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          paddingTop: "48px",
        }}
      >
        <SectionHeader accent="#7C3AED" title="Anime" />
        <CarouselSection
          title="Sedang Tayang"
          loading={homeLoading}
          error={homeError}
        >
          {ongoing.slice(0, 20).map((item) => (
            <PortraitCard
              key={item.slug}
              item={item}
              badge={`Ep ${item.currentEpisode}`}
              badgeColor="#7C3AED"
              to={`/detail/${item.slug}`}
            />
          ))}
        </CarouselSection>
        <CarouselSection
          title="Baru Selesai Tayang"
          loading={homeLoading}
          error={homeError}
        >
          {complete.slice(0, 20).map((item) => (
            <PortraitCard
              key={item.slug}
              item={item}
              badge={`${item.totalEpisodes} Eps`}
              badgeColor="#46D369"
              to={`/detail/${item.slug}`}
            />
          ))}
        </CarouselSection>
        <CarouselSection
          title="Aksi Menegangkan"
          loading={actionLoading}
          error={null}
        >
          {(actionData?.items || []).slice(0, 20).map((item) => (
            <PortraitCard
              key={item.slug}
              item={{ ...item, image: item.image }}
              badge="Action"
              badgeColor="#7C3AED"
              to={`/detail/${item.slug}`}
            />
          ))}
        </CarouselSection>
        <CarouselSection
          title="Komedi Segar"
          loading={comedyLoading}
          error={null}
        >
          {(comedyData?.items || []).slice(0, 20).map((item) => (
            <PortraitCard
              key={item.slug}
              item={{ ...item, image: item.image }}
              badge="Comedy"
              badgeColor="#7C3AED"
              to={`/detail/${item.slug}`}
            />
          ))}
        </CarouselSection>
        <CarouselSection
          title="Romansa Favorit"
          loading={romanceLoading}
          error={null}
        >
          {(romanceData?.items || []).slice(0, 20).map((item) => (
            <PortraitCard
              key={item.slug}
              item={{ ...item, image: item.image }}
              badge="Romance"
              badgeColor="#7C3AED"
              to={`/detail/${item.slug}`}
            />
          ))}
        </CarouselSection>
      </div>

      {/* Divider */}
      <div
        style={{ backgroundColor: "#333333", flexShrink: 0, height: "1px" }}
      />

      {/* ===== FILMS & TV SECTION ===== */}
      <div
        id="films"
        style={{
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          paddingTop: "48px",
        }}
      >
        <SectionHeader accent="#A855F7" title="Films &amp; TV Series" />
        {movieHomeLoading ? (
          <div style={{ paddingInline: "48px", paddingBottom: "32px" }}>
            <CardSkeleton count={6} />
          </div>
        ) : movieCarouselRows.length > 0 ? (
          movieCarouselRows.map((row) => (
            <CarouselSection
              key={row.title}
              title={row.title}
              loading={false}
              error={null}
            >
              {row.items
                .filter((i) => i.hasResource)
                .map((item) => (
                  <PortraitCard
                    key={item.subjectId}
                    item={{
                      title: item.title,
                      image: item.cover,
                      slug: item.subjectId,
                    }}
                    badge={item.subjectType === "tv_series" ? "TV" : "Film"}
                    badgeColor={
                      item.subjectType === "tv_series" ? "#A855F7" : "#A855F7"
                    }
                    to={`/film/${encodeURIComponent(item.detailPath)}`}
                    badgeTextColor="#FFFFFF"
                  />
                ))}
            </CarouselSection>
          ))
        ) : null}
      </div>

      <Footer />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideDots { from{transform:scaleX(0)} to{transform:scaleX(1)} }
      `}</style>
    </div>
  );
}

// ---- Hero Slideshow ----
function HeroBanner({ banners, loading }) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef(null);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(
      () => setCurrent((c) => (c + 1) % Math.max(banners.length, 1)),
      5000,
    );
  };

  useEffect(() => {
    if (banners.length === 0) return;
    resetTimer();
    return () => clearInterval(timerRef.current);
  }, [banners.length]);

  const goTo = (i) => {
    setCurrent(i);
    resetTimer();
  };
  const prev = () => {
    goTo((current - 1 + banners.length) % banners.length);
  };
  const next = () => {
    goTo((current + 1) % banners.length);
  };

  const banner = banners[current];
  const subject = banner?.subject;

  return (
    <div
      style={{
        alignItems: "flex-end",
        display: "flex",
        flexShrink: 0,
        height: "100vh",
        minHeight: "600px",
        overflow: "hidden",
        position: "relative",
        width: "100%",
      }}
    >
      {/* Background */}
      {loading || !banner ? (
        <div
          style={{
            backgroundColor: "#0d0d0d",
            height: "100%",
            left: 0,
            position: "absolute",
            top: 0,
            width: "100%",
          }}
        />
      ) : (
        <>
          {banners.map((b, i) => {
            // Use cover (portrait poster) as the only background � blurred + scaled to fill
            const coverImg =
              typeof b.subject?.cover === "string"
                ? b.subject.cover
                : b.subject?.cover?.url || b.image;
            return (
              <div
                key={i}
                style={{
                  height: "100%",
                  left: 0,
                  opacity: i === current ? 1 : 0,
                  overflow: "hidden",
                  position: "absolute",
                  top: 0,
                  transition: "opacity 0.8s ease",
                  width: "100%",
                }}
              >
                {/* Blurred portrait cover fills entire container seamlessly */}
                <img
                  src={coverImg}
                  alt=""
                  style={{
                    filter: "blur(20px) brightness(0.55)",
                    height: "130%",
                    left: "-15%",
                    objectFit: "cover",
                    objectPosition: "50% 30%",
                    position: "absolute",
                    top: "-15%",
                    width: "130%",
                  }}
                />
              </div>
            );
          })}
        </>
      )}
      <div
        style={{
          background:
            "linear-gradient(to right, rgba(20,20,20,0.95) 0%, rgba(20,20,20,0.5) 50%, rgba(20,20,20,0.1) 100%)",
          height: "100%",
          left: 0,
          position: "absolute",
          top: 0,
          width: "100%",
        }}
      />
      <div
        style={{
          background:
            "linear-gradient(to top, rgba(20,20,20,1) 0%, rgba(20,20,20,0.4) 60%, transparent 100%)",
          bottom: 0,
          height: "60%",
          left: 0,
          position: "absolute",
          width: "100%",
        }}
      />

      {/* Content */}
      <HeroContent
        banner={banner}
        subject={subject}
        goTo={goTo}
        current={current}
        banners={banners}
      />
      <HeroNavigation
        banners={banners}
        current={current}
        prev={prev}
        next={next}
        goTo={goTo}
      />
    </div>
  );
}

function HeroContent({ banner, subject, goTo, current, banners }) {
  const { isMobile, isTablet } = useBreakpoint();
  return (
    <div
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        maxWidth: isMobile ? "100%" : "600px",
        paddingBottom: isMobile ? "40px" : "80px",
        paddingInline: isMobile ? "20px" : isTablet ? "32px" : "64px",
        position: "relative",
        width: "100%",
      }}
    >
      {banner && (
        <>
          <div style={{ alignItems: "center", display: "flex", gap: "8px" }}>
            <span
              style={{
                color: "#A855F7",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Featured
            </span>
            <span style={{ color: "#A3A3A3", fontSize: "11px" }}>
              &bull;{" "}
              {subject?.subjectType === "tv_series" ? "TV Series" : "Film"}
            </span>
          </div>
          <HeroTitle banner={banner} subject={subject} />
          {subject?.imdbRating && (
            <div style={{ alignItems: "center", display: "flex", gap: "8px" }}>
              <span
                style={{
                  alignItems: "center",
                  color: "#F5C518",
                  display: "flex",
                  fontSize: "13px",
                  fontWeight: 700,
                  gap: "4px",
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="#F5C518">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                {subject.imdbRating}
              </span>
              {subject.releaseDate && (
                <span style={{ color: "#A3A3A3", fontSize: "12px" }}>
                  {subject.releaseDate?.slice(0, 4)}
                </span>
              )}
            </div>
          )}
          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: "12px",
              marginTop: "4px",
            }}
          >
            <Link
              to={`/film/${encodeURIComponent(subject?.detailPath || "")}`}
              className="btn-primary"
              style={{
                alignItems: "center",
                backgroundColor: "#A855F7",
                borderRadius: "4px",
                display: "flex",
                gap: "8px",
                paddingBlock: "12px",
                paddingInline: "28px",
                textDecoration: "none",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span
                style={{
                  color: "#FFFFFF",
                  fontSize: "15px",
                  fontWeight: 700,
                }}
              >
                Lihat Detail
              </span>
            </Link>
          </div>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: "8px",
            marginTop: "8px",
          }}
        >
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <div
                style={{
                  backgroundColor:
                    i === current ? "#A855F7" : "rgba(255,255,255,0.3)",
                  borderRadius: "9999px",
                  height: "6px",
                  transition: "all 0.3s ease",
                  width: i === current ? "24px" : "6px",
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function HeroNavigation({ banners, current, prev, next, goTo }) {
  return (
    <>
      {/* Prev/Next arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            style={{
              alignItems: "center",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "9999px",
              color: "#FFF",
              cursor: "pointer",
              display: "flex",
              height: "44px",
              justifyContent: "center",
              left: "24px",
              position: "absolute",
              top: "50%",
              transform: "translateY(-50%)",
              transition: "background 0.15s",
              width: "44px",
              zIndex: 5,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(168,85,247,0.7)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(0,0,0,0.4)")
            }
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <button
            onClick={next}
            style={{
              alignItems: "center",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "9999px",
              color: "#FFF",
              cursor: "pointer",
              display: "flex",
              height: "44px",
              justifyContent: "center",
              position: "absolute",
              right: "24px",
              top: "50%",
              transform: "translateY(-50%)",
              transition: "background 0.15s",
              width: "44px",
              zIndex: 5,
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(168,85,247,0.7)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(0,0,0,0.4)")
            }
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}
    </>
  );
}

function HeroTitle({ banner, subject }) {
  const { isMobile, isTablet } = useBreakpoint();
  return (
    <div
      style={{
        color: "#FFFFFF",
        fontFamily: '"Arial Black", Arial, system-ui, sans-serif',
        fontSize: isMobile ? "26px" : isTablet ? "36px" : "52px",
        fontWeight: 900,
        letterSpacing: "-0.025em",
        lineHeight: "105%",
        transition: "opacity 0.4s ease",
      }}
    >
      {banner.title || subject?.title}
    </div>
  );
}

// ---- Shared Components ----

function SectionHeader({ accent, title }) {
  const { isMobile, isTablet } = useBreakpoint();
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        marginBottom: "16px",
        paddingInline: isMobile ? "16px" : isTablet ? "24px" : "48px",
      }}
    >
      <div
        style={{
          backgroundColor: accent,
          borderRadius: "2px",
          flexShrink: 0,
          height: "24px",
          marginRight: "14px",
          width: "4px",
        }}
      />
      <span
        style={{
          color: "#FFFFFF",
          fontSize: "22px",
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
        dangerouslySetInnerHTML={{ __html: title }}
      />
      <Link
        to="/browse"
        style={{
          color: accent,
          cursor: "pointer",
          fontSize: "13px",
          letterSpacing: "0.01em",
          marginLeft: "16px",
          textDecoration: "none",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.7")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Explore All &rsaquo;
      </Link>
    </div>
  );
}

function CarouselSection({ title, loading, error, children }) {
  const { isMobile, isTablet } = useBreakpoint();
  return (
    <div
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        paddingBottom: "32px",
        paddingInline: isMobile ? "16px" : isTablet ? "24px" : "48px",
      }}
    >
      <span
        style={{
          color: "#FFFFFF",
          fontSize: "16px",
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </span>
      {loading ? (
        <CardSkeleton count={6} />
      ) : error ? (
        <div style={{ color: "#A3A3A3", fontSize: "13px" }}>
          Gagal memuat: {error.message}
        </div>
      ) : (
        <ScrollCarousel gap={12}>{children}</ScrollCarousel>
      )}
    </div>
  );
}

function PortraitCard({ item, badge, badgeColor, badgeTextColor, to }) {
  const { isMobile } = useBreakpoint();
  return (
    <Link
      to={to || `/detail/${item.slug}`}
      className="card-thumb"
      style={{
        borderRadius: "8px",
        display: "block",
        flexShrink: 0,
        height: isMobile ? "210px" : "300px",
        overflow: "hidden",
        position: "relative",
        textDecoration: "none",
        width: isMobile ? "140px" : "200px",
      }}
    >
      <img
        src={item.image || item.img}
        alt={item.title}
        loading="lazy"
        style={{ height: "100%", objectFit: "cover", width: "100%" }}
      />
      <div
        style={{
          background:
            "linear-gradient(to top, rgba(20,20,20,0.9) 0%, transparent 60%)",
          bottom: 0,
          height: "60%",
          left: 0,
          position: "absolute",
          right: 0,
        }}
      />
      {badge && (
        <div
          style={{
            backgroundColor: badgeColor || "#7C3AED",
            borderRadius: "3px",
            left: "8px",
            paddingBlock: "2px",
            paddingInline: "6px",
            position: "absolute",
            top: "8px",
          }}
        >
          <span
            style={{
              color: badgeTextColor || "#FFFFFF",
              fontSize: "9px",
              fontWeight: 700,
            }}
          >
            {badge}
          </span>
        </div>
      )}
      <span
        style={{
          bottom: "8px",
          color: "#FFFFFF",
          fontSize: "12px",
          fontWeight: 700,
          left: "8px",
          lineHeight: "1.3",
          position: "absolute",
          right: "8px",
        }}
      >
        {item.title}
      </span>
    </Link>
  );
}

function StaticCarouselSection({ title, items, showRating }) {
  const { isMobile, isTablet } = useBreakpoint();
  return (
    <div
      style={{
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        paddingBottom: "32px",
        paddingInline: isMobile ? "16px" : isTablet ? "24px" : "48px",
      }}
    >
      <span
        style={{
          color: "#FFFFFF",
          fontSize: "16px",
          fontWeight: 700,
          letterSpacing: "-0.01em",
        }}
      >
        {title}
      </span>
      <ScrollCarousel gap={12}>
        {items.map((item, i) => (
          <Link
            key={i}
            to={`/detail/${item.slug}`}
            className="card-thumb"
            style={{
              borderRadius: "8px",
              display: "block",
              flexShrink: 0,
              height: isMobile ? "210px" : "300px",
              overflow: "hidden",
              position: "relative",
              textDecoration: "none",
              width: isMobile ? "140px" : "200px",
            }}
          >
            <div
              style={{
                backgroundImage: `url(${item.img})`,
                backgroundPosition: "50%",
                backgroundSize: "cover",
                height: "100%",
                width: "100%",
              }}
            />
            <div
              style={{
                background:
                  "linear-gradient(to top, rgba(20,20,20,0.9) 0%, transparent 60%)",
                bottom: 0,
                height: "60%",
                left: 0,
                position: "absolute",
                right: 0,
              }}
            />
            <div
              style={{
                bottom: "8px",
                left: "8px",
                position: "absolute",
                right: "8px",
              }}
            >
              <div
                style={{
                  color: "#FFFFFF",
                  fontSize: "12px",
                  fontWeight: 700,
                  lineHeight: "1.3",
                  marginBottom: "2px",
                }}
              >
                {item.title}
              </div>
              {showRating && (
                <span style={{ color: "#F5C518", fontSize: "10px" }}>
                  &#9733; {item.rating}
                </span>
              )}
            </div>
          </Link>
        ))}
      </ScrollCarousel>
    </div>
  );
}

function Footer() {
  const { isMobile } = useBreakpoint();
  return (
    <div
      style={{
        backgroundColor: "#0D0D0D",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        padding: isMobile ? "24px 16px" : "48px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          gap: isMobile ? "24px" : "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <div style={{ alignItems: "center", display: "flex", gap: "8px" }}>
            <img
              src="/logo.png"
              alt="ANIDOW"
              style={{ height: "24px", objectFit: "contain" }}
            />
            <span
              style={{
                color: "#FFFFFF",
                fontFamily: '"Arial Black", Arial, system-ui, sans-serif',
                fontSize: "18px",
                fontWeight: 900,
                letterSpacing: "-0.02em",
              }}
            >
              ANIDOW
            </span>
          </div>
          <span
            style={{
              color: "#A3A3A3",
              fontSize: "13px",
              lineHeight: "170%",
              maxWidth: "260px",
            }}
          >
            Nonton anime, film, dan TV series gratis. Tanpa akun.
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <span
            style={{
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Anime
          </span>
          <span
            style={{ color: "#A3A3A3", cursor: "pointer", fontSize: "13px" }}
          >
            Sedang Tayang
          </span>
          <span
            style={{ color: "#A3A3A3", cursor: "pointer", fontSize: "13px" }}
          >
            Selesai Tayang
          </span>
          <span
            style={{ color: "#A3A3A3", cursor: "pointer", fontSize: "13px" }}
          >
            Daftar Anime
          </span>
          <span
            style={{ color: "#A3A3A3", cursor: "pointer", fontSize: "13px" }}
          >
            Per Genre
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <span
            style={{
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Films &amp; TV Series
          </span>
          <span
            style={{ color: "#A3A3A3", cursor: "pointer", fontSize: "13px" }}
          >
            Trending
          </span>
          <span
            style={{ color: "#A3A3A3", cursor: "pointer", fontSize: "13px" }}
          >
            TV Series
          </span>
          <span
            style={{ color: "#A3A3A3", cursor: "pointer", fontSize: "13px" }}
          >
            Browse Genre
          </span>
        </div>
      </div>
      <div
        style={{ backgroundColor: "#333333", flexShrink: 0, height: "1px" }}
      />
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <span style={{ color: "#A3A3A3", fontSize: "12px" }}>
          project gabut by{" "}
          <a
            href="https://github.com/dhodhoo"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#7C3AED", textDecoration: "none" }}
          >
            @dhodho
          </a>
        </span>
      </div>
    </div>
  );
}