# 🌌 AniDow — Elegant Anime Exploration & Streaming

AniDow adalah platform penjelajahan dan streaming anime modern yang dibangun dengan fokus pada estetika **Night Sky**. Menggabungkan kecepatan Next.js 16 dengan animasi halus dari Framer Motion untuk memberikan pengalaman menonton yang imersif dan berkelas.

## ✨ Fitur Unggulan

- **🎬 Cinematic Player**: Pemutar video dengan fitur **"Lights Out"** (meredupkan seluruh UI) untuk fokus maksimal.
- **🚀 Advanced History Tracker**: Mengingat episode terakhir yang Anda tonton secara otomatis menggunakan `localStorage`.
- **📂 Global Browse Directory**: Jelajahi ribuan judul anime berdasarkan genre (Aksi, Romansa, Komedi, dll) dengan sistem *pagination*.
- **🔖 Watchlist System**: Simpan anime favorit Anda ke daftar tontonan pribadi tanpa perlu login.
- **✨ Fluid Transitions**: Perpindahan antar halaman yang sangat halus menggunakan kurva animasi kustom.
- **🔍 Smart Search**: Pencarian anime dengan fitur *debounce* untuk performa API yang optimal.
- **📱 Ultra Responsive**: Pengalaman menonton yang sama baiknya di perangkat mobile maupun desktop.

## 🛠️ Teknologi yang Digunakan

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API Data**: [Jikan API v4](https://jikan.moe/) (Unofficial MyAnimeList API)
- **Database Lokal**: Browser `localStorage`

## 🚀 Cara Menjalankan Secara Lokal

1. **Clone repositori**:
   ```bash
   git clone https://github.com/dhodhoo/AniDow.git
   cd AniDow
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Jalankan server pengembangan**:
   ```bash
   npm run dev
   ```

4. **Buka di browser**:
   Kunjungi `http://localhost:3000`

## 📡 Integrasi API & Rate Limiting

Proyek ini menggunakan **Jikan API**. Karena batasan *rate limit* publik (3 request/detik), AniDow dilengkapi dengan:
- **Sequential Fetching**: Pengambilan data kategori di halaman utama dilakukan secara berurutan dengan jeda (*backoff*).
- **Manual Backoff Logic**: Penanganan otomatis jika terkena HTTP 429 (Too Many Requests).

## 📄 Lisensi & Kredit

- **Project gabut by [@dhodho](https://github.com/dhodhoo/AniDow)**
- Gambar & Detail Anime: [MyAnimeList](https://myanimelist.net/)
- Video Mockup: [YouTube API](https://developers.google.com/youtube/iframe_api_reference)
