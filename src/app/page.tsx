import Hero from "@/components/Hero";
import AnimeCard from "@/components/AnimeCard";
import AnimeSkeleton from "@/components/AnimeSkeleton";
import { fetchJikanAPI, delay } from "@/lib/jikan";
import { JikanResponse, Anime } from "@/types/jikan";
import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";

export const revalidate = 3600; 

function CategoryRowView({ title, description, animeList, routeParam }: { title: string, description: string, animeList: Anime[], routeParam: string }) {
  return (
    <section className="mt-16 relative">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
         <div>
           <h2 className="text-2xl font-bold text-white tracking-tight mb-2 flex items-center gap-2">
             {title}
           </h2>
           <p className="text-sm text-zinc-400 max-w-2xl">{description}</p>
         </div>
         <Link href={`/browse?${routeParam}`} className="shrink-0 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors group bg-indigo-500/10 px-4 py-2 rounded-lg border border-indigo-500/20">
           Lihat Semua
           <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
         </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
        {animeList.length > 0 ? (
          animeList.slice(0, 5).map((anime, index) => (
            <AnimeCard key={`${anime.mal_id}-${index}`} anime={anime} index={index} priority={false} />
          ))
        ) : (
          Array.from({ length: 5 }).map((_, i) => <AnimeSkeleton key={i} />)
        )}
      </div>
    </section>
  );
}

export default async function Home() {
  let topAnimeList: Anime[] = [];
  let actionAnime: Anime[] = [];
  let romanceAnime: Anime[] = [];
  let comedyAnime: Anime[] = [];
  
  // Mengambil Kategori Berurutan (Mencegah Jikan 429 Too Many Requests 3 req/sec Limit)
  try {
    const topData = await fetchJikanAPI<JikanResponse<Anime[]>>("/top/anime?limit=11");
    topAnimeList = topData.data || [];
    await delay(350); 
    
    const actionData = await fetchJikanAPI<JikanResponse<Anime[]>>("/anime?genres=1&order_by=popularity&limit=5");
    actionAnime = actionData.data || [];
    await delay(350);

    const romanceData = await fetchJikanAPI<JikanResponse<Anime[]>>("/anime?genres=22&order_by=popularity&limit=5");
    romanceAnime = romanceData.data || [];
    await delay(350);

    const comedyData = await fetchJikanAPI<JikanResponse<Anime[]>>("/anime?genres=4&order_by=popularity&limit=5");
    comedyAnime = comedyData.data || [];

  } catch (err) {
    console.error("Homepage Murni Anime loading failed:", err);
  }

  const topAnime = topAnimeList.length > 0 ? topAnimeList[0] : null;
  const gridAnime = topAnimeList.slice(1, 11);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <Hero anime={topAnime} />

        {/* Global Browse Button Box (Melihat Semua Pustaka) */}
        <div className="mt-8 mb-12 flex items-center justify-between border border-white/10 bg-zinc-900/50 p-6 rounded-2xl glass-card relative overflow-hidden group">
           <div className="relative z-10 flex flex-col gap-1">
             <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">Perpustakaan AniDow</h3>
             <p className="text-xs sm:text-sm text-zinc-400">Jajaki lebih dari puluhan ribu judul serial dan film.</p>
           </div>
           <Link href="/browse">
              <button className="relative z-10 flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all shadow-xl group-hover:scale-105 active:scale-95 text-xs sm:text-sm">
                <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Jelajahi Semua</span>
                <span className="sm:hidden">Semua</span>
              </button>
           </Link>
           {/* Abstract glowing decoration */}
           <div className="absolute right-0 sm:right-20 top-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-600/20 blur-3xl rounded-full group-hover:bg-indigo-500/30 transition-colors" />
        </div>

        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight mb-2">Pilihan Tren Teratas</h2>
            <p className="text-sm text-zinc-400">Jelajahi berbagai series anime terbaru dengan gaya antigravity.</p>
          </div>
          <Link href="/browse?order_by=popularity" className="shrink-0 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition-colors bg-white/5 py-1 px-3 rounded-md border border-white/5">
            <span className="hidden sm:inline">Lihat Tren</span> <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {gridAnime.length > 0 ? (
            gridAnime.map((anime, index) => (
              <AnimeCard 
                key={`${anime.mal_id}-${index}`} 
                anime={anime} 
                index={index} 
                priority={index < 5} 
              />
            ))
          ) : (
            Array.from({ length: 10 }).map((_, i) => (
              <AnimeSkeleton key={i} />
            ))
          )}
        </div>
      </section>

      {/* Barisan Kategori Otomatis */}
      <CategoryRowView 
         title="Aksi Menegangkan" 
         description="Ledakan, pertarungan epik, dan kelangsungan hidup dengan adrenalin penuh." 
         animeList={actionAnime} 
         routeParam="genre=1" 
      />
      <CategoryRowView 
         title="Komedi Segar" 
         description="Tawa lepas pengusir penat dengan deret momen absurd yang memecah suasana." 
         animeList={comedyAnime} 
         routeParam="genre=4" 
      />
      <CategoryRowView 
         title="Romansa Favorit" 
         description="Kisah manis dua insan dan serbarnya bumbu drama yang menggetarkan hati." 
         animeList={romanceAnime} 
         routeParam="genre=22" 
      />

      {/* Website Information Section */}
      <section className="mt-20 py-12 border-t border-zinc-800/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-lg">Teknologi</h4>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Dibangun menggunakan <span className="text-zinc-300">Next.js 16</span> dengan arsitektur App Router, 
              <span className="text-zinc-300"> Tailwind CSS</span> untuk styling, dan 
              <span className="text-zinc-300"> Framer Motion</span> untuk animasi transisi yang halus.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-lg">Sumber Data</h4>
            <p className="text-zinc-500 text-sm leading-relaxed">
              Informasi judul dan daftar episode bersumber dari <span className="text-zinc-300 text-indigo-400 hover:underline cursor-pointer"><a href="https://jikan.moe/" target="_blank">Jikan API</a></span> (Unofficial MyAnimeList API). 
              Link streaming disimulasikan menggunakan <span className="text-zinc-300">YouTube Embed API</span> untuk keperluan demonstrasi UI.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-white font-bold text-lg">Tentang Proyek</h4>
            <p className="text-zinc-500 text-sm leading-relaxed">
              AniDow adalah hasil eksplorasi desain bertema <span className="text-zinc-300 italic">"Night Sky"</span> 
              yang mengutamakan estetika kaca (glassmorphism) dan pengalaman menonton yang imersif.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
