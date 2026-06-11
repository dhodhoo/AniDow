# AniDow

AniDow adalah platform nonton dual-source berbasis Next.js — **Anime** dan **Film & TV** — dalam satu web app. Jelajah katalog, cari judul, streaming episode/film, simpan watchlist lintas sumber, dan lanjutkan tontonan — semua tersimpan lokal di browser.

Tampilan gelap bertema night-sky, responsive mobile/desktop, teks berbahasa Indonesia.

## Fitur

### Anime
- Homepage dengan carousel ongoing terbaru, genre (aksi, komedi, romansa), dan serial complete.
- Browse katalog anime berdasarkan status rilis dan genre.
- Search berbasis daftar judul anime.
- Halaman detail: poster, metadata, skor, sinopsis, genre, daftar episode.
- Player iframe dengan mirror selector + fitur Lights Out.
- Panel download per kualitas dan host eksternal.

### Film & TV
- Landing page: hero banner carousel, trending, kategori, film populer & serial TV populer.
- **Browse** dengan filter: genre, negara, tahun rilis, sort (Untukmu/Terpopuler/Terbaru/Rating).
- **Search** dengan autocomplete live (debounce) + filter tipe (semua/film/TV).
- Halaman detail: poster, IMDb rating, sinopsis, pemeran, genre, season/episode picker (untuk TV).
- **Native `<video>` player**: pilih kualitas (1080p, 720p, 480p), subtitle multi-bahasa (default Indonesia), ganti kualitas tanpa kehilangan posisi, auto re-fetch saat link kadaluarsa, resume dari posisi terakhir (Continue Watching).
- Episode berikutnya / next-season otomatis untuk TV series.

### Bersama (Anime + Film)
- **Watchlist** terpadu dua seksi: anime dan film/TV.
- **Continue Watching**: posisi tonton film/TV disimpan, tampil di landing, auto-hapus saat >95% ditonton.
- Riwayat tonton anime per slug.

### Navigasi
- Navbar dengan **mode switcher Anime | Film** — search bar context-aware, aksen warna mengikuti mode (indigo = anime, amber = film).
- Link Jelajahi dan Watchlist tersedia di kedua mode.

## Teknologi

- Framework: Next.js 16 App Router
- UI: React 19
- Styling: Tailwind CSS v4
- Animasi: Framer Motion
- Icon: Lucide React
- Storage lokal: browser `localStorage` via `useSyncExternalStore`

## Arsitektur

```
API eksternal → api wrapper (server) → Server Components
              ↘ proxy route → Client Components
                              ↘ Stream URL (HMAC, keyless) → browser langsung
```

**Key principle**: API key tidak pernah sampai browser. Stream/subtitle URL adalah pengecualian — HMAC-signed, expire otomatis, tanpa API key.

## Environment Variables

Salin `.env.example` ke `.env.local` untuk development, atau set di dashboard Vercel untuk production.

```env
MOVIEBOX_API_BASE_URL=http://127.0.0.1:8000
MOVIEBOX_API_KEY=your_api_key
NEXT_PUBLIC_MOVIEBOX_BASE=http://127.0.0.1:8000

OTAKUDESU_API_KEY=your_api_key_here
```

## Menjalankan Lokal

1. Clone repo:
```bash
git clone https://github.com/dhodhoo/AniDow.git
cd AniDow
```

2. Install dependencies:
```bash
npm install
```

3. Copy `.env.example` ke `.env.local` dan isi API key:
```bash
cp .env.example .env.local
```

4. Jalankan dev server:
```bash
npm run dev
```

5. Buka:
```
http://localhost:3000           # Anime
http://localhost:3000/movies    # Film & TV
```

## Scripts

```bash
npm run dev     # Development server
npm run build   # Production build
npm run start   # Jalankan build production
npm run lint    # ESLint
```

## Struktur Proyek

```text
src/app/                              # Route Next.js (App Router)
  api/anime-proxy/[...path]/route.ts  # Proxy anime
  api/movie-proxy/[...path]/route.ts  # Proxy film
  anime/[id]/page.tsx                 # Detail anime
  browse/page.tsx                     # Browse anime
  movies/
    page.tsx                          # Landing film & TV
    browse/page.tsx                   # Browse film (genre/negara/tahun/sort)
    search/page.tsx                   # Search film
    [detailPath]/page.tsx             # Detail film/TV
    [detailPath]/watch/page.tsx       # Native video player
  search/page.tsx                     # Search anime
  watch/[id]/page.tsx                 # Player anime (iframe)
  watchlist/page.tsx                  # Watchlist dua seksi
src/components/                       # Komponen UI
src/hooks/                            # useWatchlist, useHistory, useMovieWatchlist, useContinueWatching
src/lib/anime-api.ts                  # API wrapper + transform anime
src/lib/movie-api.ts                  # API wrapper + transform film
src/types/anime-api.ts                # Tipe respons anime
src/types/movie-api.ts                # Tipe respons film
public/logo.png                       # Logo navbar
public/logo-icon.png                  # Favicon/app icon
```

## Catatan

- Project ini dibuat untuk eksplorasi teknis dan penggunaan pribadi. Pastikan penggunaan data, streaming, dan download mematuhi hukum, hak cipta, serta Terms of Service sumber terkait.
- Video player film menggunakan native `<video>` — subtitle SRT dikonversi ke WebVTT di client.
- Kredit by [@dhodho](https://github.com/dhodhoo/AniDow)
