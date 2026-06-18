# AniDow v2

**Frontend SPA** untuk platform nonton dual-source (Anime + Film & TV) — rewrite dari Next.js ke Vite React, self-hosted di VPS dengan nginx reverse proxy.

## Perbedaan dari v1

| | v1 (`anidow` — Next.js) | v2 (`anidow-v2` — Vite React) |
|---|---|---|
| **Framework** | Next.js 16 App Router | Vite + React 18 SPA |
| **Rendering** | SSR + client | Client-only (static build) |
| **Styling** | Tailwind CSS v4 | Inline styles + index.css |
| **Animasi** | Framer Motion | CSS keyframes + transitions |
| **Icon** | Lucide React | Inline SVG |
| **Runtime deps** | clsx, lucide-react, tailwind-merge, framer-motion | react, react-dom, react-router-dom, plyr |
| **API proxy** | Next.js route handlers (`/api/anime-proxy`, `/api/movie-proxy`) | nginx reverse proxy (`/api/` → port 5001, `/movie-api/` → port 5002) |
| **Hosting** | Vercel | VPS pribadi (43.157.235.239) + nginx |
| **SSL** | Auto (Vercel) | Let's Encrypt via certbot |
| **Domain** | anidow.vercel.app | anidow.site (redirect dari vercel.app) |

## Fitur Baru (v2)

- **Feedback FAB** — tombol lingkaran di kanan bawah untuk kirim saran/kritik/bug ke Discord webhook, rate-limited per-IP via nginx
- **Anime content filter** — backend moviebox API memfilter konten anime/hentai/NSFW secara otomatis
- **"Tonton Sekarang" selalu ke episode 1** — tidak lagi ke episode terakhir
- **Deploy otomatis** — build lokal → pscp upload ke VPS via PowerShell

## Arsitektur Deploy (VPS)

```
Browser (HTTPS) → nginx (port 443)
  ├── /              → /var/www/anidow-frontend (static SPA)
  ├── /api/          → 127.0.0.1:5001 (otakudesu-scrape, Node.js)
  ├── /movie-api/    → 127.0.0.1:5002 (moviebox-api, Python/FastAPI)
  └── /api/feedback  → 127.0.0.1:5003 (Node.js → Discord webhook)
```

Semua dikelola oleh **PM2**:

| Proses | Port | Status |
|---|---|---|
| anidow-otakudesu | 5001 | online |
| anidow-moviebox | 5002 | online |
| anidow-feedback | 5003 | online |
| otakudesu-api (v1) | 3001 | stopped |
| moviebox-api (v1) | 8000 | stopped |

## Struktur Proyek

```text
src/
  App.jsx                       # Router + lazy routes + FeedbackButton global
  index.css                     # Global reset, scrollbar, hover classes
  main.jsx                      # Entry point
  components/
    ErrorBoundary.jsx
    FeedbackButton.jsx          # NEW: FAB + modal + Discord webhook
    Navbar.jsx
    ScrollCarousel.jsx
    SearchOverlay.jsx
  hooks/
    useApi.js                   # Anime API data-fetch
    useBreakpoint.js            # Responsive detection
    useMovieApi.js              # Movie API data-fetch
    useScrollToTop.js
    useWatchlist.js             # localStorage watchlist
  lib/
    api.js                      # Anime API client (X-API-Key)
    movieApi.js                 # Movie API client (X-API-Key) + subtitle utils
  pages/
    BrowseGenrePage.jsx         # Browse anime + film
    DetailPage.jsx              # Anime detail + episodes
    FilmDetailPage.jsx          # Film/TV detail
    FilmWatchPage.jsx           # Native video player (Plyr)
    HomePage.jsx                # Landing dual-source
    NotFoundPage.jsx
    SearchPage.jsx              # Search overlay page
    WatchPage.jsx               # Anime iframe player
    WatchlistPage.jsx
public/
  logo.png, logo-icon.png, favicon.svg, icons.svg
```

## Environment Variables

Buat `.env.production` (gitignored):

```env
VITE_API_BASE_URL=
VITE_API_KEY=local-anime-api-key-123
VITE_MOVIE_API_BASE_URL=/movie-api
VITE_MOVIE_API_KEY=local-movie-api-key-123
```

- `VITE_API_BASE_URL` kosong → fetch ke origin (relative path), nginx proxy ke backend
- `VITE_MOVIE_API_BASE_URL` = `/movie-api` → path di-rewrite nginx

## Development

```bash
npm install
cp .env.local.example .env.local   # Isi API keys + localhost ports
npm run dev                         # Vite dev server (port 5173)
```

## Production Build & Deploy

```bash
npm run build            # tsc + vite build → dist/
# Upload ke VPS:
pscp -pw ... dist/* ubuntu@43.157.235.239:/var/www/anidow-frontend/
# Nginx auto-serve — tidak perlu reload
```

## Kredit

- Anime data: [Otakudesu](https://otakudesu.blog) via self-hosted scraper API
- Film/TV data: MovieBox CDN via self-hosted proxy API
- Logo & desain: original
- [@dhodho](https://github.com/dhodhoo/AniDow)
