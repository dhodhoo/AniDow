# AniDow

AniDow adalah platform nonton dual-source berbasis Next.js — **Anime** (Otakudesu) dan **Film & TV** (MovieBox) — dalam satu web app. Jelajah katalog, cari judul, streaming episode/film, simpan watchlist lintas sumber, dan lanjutkan tontonan — semua tersimpan lokal di browser.

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
- Landing page: hero banner carousel, trending, kategori dari MovieBox, film populer & serial TV populer.
- **Browse** dengan filter: genre, negara, tahun rilis, sort (Untukmu/Terpopuler/Terbaru/Rating).
- **Search** dengan autocomplete live (debounce) + filter tipe (semua/film/TV).
- Halaman detail: poster, IMDb rating, sinopsis, pemeran, genre, season/episode picker (untuk TV).
- **Native `<video>` player**: pilih kualitas (1080p, 720p, 480p), subtitle SRT→VTT multi-bahasa (default Indonesia), ganti kualitas tanpa kehilangan posisi, auto re-fetch saat link kadaluarsa (6 jam), resume dari posisi terakhir (Continue Watching).
- Episode berikutnya / next-season otomatis untuk TV series.

### Bersama (Anime + Film)
- **Watchlist** terpadu dua seksi: anime dan film/TV.
- **Continue Watching**: posisi tonton film/TV disimpan, tampil di landing `/movies`, auto-hapus saat >95% ditonton.
- Riwayat tonton anime per slug.

### Navigasi
- Navbar dengan **mode switcher Anime | Film** — search bar context-aware (cari anime di mode Anime, cari film di mode Film), aksen warna mengikuti mode (indigo = anime, amber = film).
- Link Jelajahi dan Watchlist tersedia di kedua mode.

## Teknologi

- Framework: Next.js 16 App Router
- UI: React 19
- Styling: Tailwind CSS v4
- Animasi: Framer Motion
- Icon: Lucide React
- API anime: API pribadi (Otakudesu)
- API film: [MovieBox FastAPI](https://moviebox-api.nexaworks.me) (deploy terpisah)
- Storage lokal: browser `localStorage` via `useSyncExternalStore`

## Arsitektur

```
Anime: Otakudesu API → anime-api.ts (server) → Server Components
                      ↘ /api/anime-proxy → Client Components

Film:  MovieBox API → movie-api.ts (server) → Server Components
                     ↘ /api/movie-proxy → Client Components
                                         ↘ Stream URL (HMAC, keyless) → browser langsung
```

**Key principle**: API key tidak pernah sampai browser. Stream/subtitle URL MovieBox adalah pengecualian — HMAC-signed, expire 6 jam, tanpa API key.

## Environment Variables

Salin `.env.example` ke `.env.local` untuk development, atau set di dashboard Vercel untuk production.

```env
# MovieBox API (Film & TV)
MOVIEBOX_API_BASE_URL=http://127.0.0.1:8000
MOVIEBOX_API_KEY=your_moviebox_api_key
NEXT_PUBLIC_MOVIEBOX_BASE=http://127.0.0.1:8000

# Anime API (optional legacy)
OTAKUDESU_API_KEY=your_otakudesu_api_key_here
```

**Production (Vercel):** set `MOVIEBOX_API_BASE_URL` dan `NEXT_PUBLIC_MOVIEBOX_BASE` ke `https://moviebox-api.nexaworks.me`, dan `MOVIEBOX_API_KEY` ke production key.

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

3. Copy `.env.example` ke `.env.local`, isi `MOVIEBOX_API_KEY`, dan pastikan MovieBox API (`http://127.0.0.1:8000`) sudah jalan:
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
  api/anime-proxy/[...path]/route.ts  # Proxy anime (server-side API key)
  api/movie-proxy/[...path]/route.ts  # Proxy film (server-side API key + rewrite stream URL)
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

## API Endpoint MovieBox

| Endpoint | Keterangan |
|---|---|
| `GET /health` | Health check (tanpa auth) |
| `GET /home` | Homepage rows (banner + kategori) |
| `GET /trending?page=0` | Konten trending |
| `GET /popular` | Pencarian populer + rank film/TV |
| `GET /suggest?q=` | Autocomplete search bar |
| `GET /search?q=&type=all\|movie\|tv&page=1` | Cari konten |
| `GET /details?detailPath=...` | Detail film/TV |
| `GET /related?subjectId=&page=1` | More Like This |
| `GET /series/episodes?detailPath=...` | Daftar season + episode |
| `GET /browse?type=movie\|tv&genre=&country=&year=&sort=` | Browse dengan filter |
| `GET /movie/files?subjectId=&detailPath=` | Daftar kualitas + subtitle film |
| `GET /series/files?subjectId=&detailPath=&season=&episode=` | Sama, per episode |
| `GET /stream?u=&exp=&sig=` | Proxy video (Range/206, `<video src>`) |
| `GET /subtitle?u=&exp=&sig=` | Proxy subtitle |

Swagger UI: `https://moviebox-api.nexaworks.me/docs`

## Catatan

- Project ini dibuat untuk eksplorasi teknis dan penggunaan pribadi. Pastikan penggunaan data, streaming, dan download mematuhi hukum, hak cipta, serta Terms of Service sumber terkait.
- Video player film menggunakan native `<video>` — subtitle SRT dikonversi ke WebVTT di client.
- Kredit by [@dhodho](https://github.com/dhodhoo/AniDow)
