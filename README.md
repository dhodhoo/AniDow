# AniDow

AniDow adalah web anime berbasis Next.js untuk menjelajah katalog pribadi, membaca detail anime, menonton episode lewat mirror iframe, menyimpan watchlist, melanjutkan riwayat tontonan, dan membuka link download per kualitas/host.

Project ini menggunakan branding logo custom di navbar dan favicon, dengan tampilan gelap bertema night-sky.

## Fitur

- Katalog anime ongoing dan complete dari API pribadi.
- Browse berdasarkan status rilis dan genre.
- Search berbasis daftar judul anime, bukan daftar episode, supaya hasil pencarian lebih enak dipakai.
- Halaman detail anime dengan poster, metadata, sinopsis, genre, dan daftar episode asli.
- Cinematic player dengan fitur Lights Out.
- Mirror selector untuk memilih iframe streaming yang tersedia.
- Panel download per kualitas dan host eksternal.
- Watchlist lokal berbasis `localStorage`.
- History tontonan lokal berbasis slug anime dan episode.
- Responsive UI untuk desktop dan mobile.

## Teknologi

- Framework: Next.js 16 App Router
- UI: React 19
- Styling: Tailwind CSS v4
- Animasi: Framer Motion
- Icon: Lucide React
- API data: API pribadi
- Storage lokal: browser `localStorage`

## API

Default API base URL:

```env
ANIDOW_API_BASE_URL=https://your-private-api.example.com
```

Jika API pribadi menggunakan key, tambahkan:

```env
OTAKUDESU_API_KEY=your_api_key
```

Variabel env ini dibaca server-side oleh wrapper di `src/lib/anime-api.ts`. Browser tidak memanggil backend langsung; jika butuh akses dari client, gunakan proxy internal `/api/anime-proxy/*` supaya header API key tetap dikirim dari server Vercel.

Endpoint utama yang digunakan:

- `/api/home`
- `/api/ongoing?page=1`
- `/api/complete?page=1`
- `/api/anime-list`
- `/api/genres`
- `/api/genre/:slug?page=1`
- `/api/search?q=keyword`
- `/api/anime/:slug`
- `/api/episode/:slug`

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

3. Buat `.env.local` jika ingin override API:

```env
ANIDOW_API_BASE_URL=https://your-private-api.example.com
OTAKUDESU_API_KEY=
```

4. Jalankan dev server:

```bash
npm run dev
```

5. Buka:

```text
http://localhost:3000
```

## Scripts

```bash
npm run dev     # menjalankan development server
npm run build   # production build
npm run start   # menjalankan build production
npm run lint    # ESLint
```

## Struktur Penting

```text
src/app/                  # route utama Next.js
src/components/           # komponen UI
src/hooks/                # watchlist dan history localStorage
src/lib/anime-api.ts      # API wrapper dan mapper data pribadi
src/types/anime-api.ts    # tipe response API
public/logo.png           # logo navbar
public/logo-icon.png      # favicon/app icon
```

## Catatan Legal

Project ini dibuat untuk eksplorasi teknis dan penggunaan pribadi. Pastikan penggunaan data, streaming, download, iklan, atau distribusi publik mematuhi hukum, hak cipta, dan Terms of Service sumber terkait. Jika ingin memonetisasi project ini, pendekatan yang lebih aman adalah mengembangkan sisi discovery, watchlist, jadwal, review, artikel original, atau affiliate legal.

## Kredit

- Project by [@dhodho](https://github.com/dhodhoo/AniDow)
- Data dan link episode dikonsumsi melalui API pribadi yang di-host terpisah.
