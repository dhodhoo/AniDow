import AnimeCard from "@/components/AnimeCard";
import { fetchJikanAPI } from "@/lib/jikan";
import { JikanResponse, Anime } from "@/types/jikan";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jelajahi Semua Anime - AniDow",
  description: "Pustaka raksasa AniDow menyajikan navigasi katalog tak terbatas ke dunia Anime favorit.",
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; genre?: string; order_by?: string }>;
}) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || "1", 10);
  
  const buildCurrentUrl = (pageParam: number) => {
    const url = new URLSearchParams();
    url.set("page", pageParam.toString());
    if (params.genre) url.set("genres", params.genre);
    if (params.order_by) url.set("order_by", params.order_by);
    return `/browse?${url.toString()}`;
  };

  const genreSegment = params.genre ? `&genres=${params.genre}` : "";
  const sortSegment = params.order_by ? `&order_by=${params.order_by}` : "&order_by=score";

  let animeList: Anime[] = [];
  let hasNextPage = false;
  
  try {
    const data = await fetchJikanAPI<JikanResponse<Anime[]>>(`/anime?page=${currentPage}&limit=24${genreSegment}${sortSegment}`);
    animeList = data.data || [];
    hasNextPage = (data as any).pagination?.has_next_page || false;
  } catch (err) {
    console.error("Browse Anime loading failed:", err);
  }

  const getGenreName = (gId: string) => {
    switch (gId) {
       case "1": return "Aksi Memukau";
       case "4": return "Komedi Segar";
       case "22": return "Romansa & Cinta";
       case "10": return "Fantasi & Sihir";
       case "36": return "Slice of Life";
       default: return "Semua Koleksi";
    }
  };

  const currentCategoryLabel = params.genre ? getGenreName(params.genre) : "Semua Koleksi";

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      
      {/* Header Ensiklopedia */}
      <section className="glass-card p-6 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col items-center text-center justify-center">
         <div className="relative z-10 flex flex-col items-center gap-4 max-w-2xl">
           <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 mb-2">
              <LayoutGrid className="w-8 h-8 text-indigo-400" />
           </div>
           <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
             Pustaka {currentCategoryLabel}
           </h1>
           <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
             Mengarungi ribuan dimensi animasi dan jelajahi arsip raksasa secara berurutan. Cari berdasarkan rekam jejak, ketenaran, maupun tanggal perilisan di semesta ini.
           </p>
         </div>
      </section>

      {/* Grid Content */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {animeList.length > 0 ? (
            animeList.map((anime, index) => (
              <AnimeCard 
                key={`${anime.mal_id}-${index}`} 
                anime={anime} 
                index={index} 
                priority={index < 8} 
              />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-zinc-500 font-medium">
               Gagal mengambil data atau halaman terakhir telah tercapai.
            </div>
          )}
        </div>
      </section>

      {/* Pagination Module */}
      <section className="flex items-center justify-between border-t border-white/5 pt-8 mt-4">
         <Link 
            href={currentPage > 1 ? buildCurrentUrl(currentPage - 1) : "#"}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all text-sm md:text-base ${currentPage > 1 ? "bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800" : "bg-transparent text-zinc-700 cursor-not-allowed pointer-events-none"}`}
         >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Sebelumnya</span>
         </Link>
         
         <div className="text-zinc-400 font-bold text-sm tracking-widest uppercase">
            Halaman {currentPage}
         </div>

         <Link 
            href={hasNextPage ? buildCurrentUrl(currentPage + 1) : "#"}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all text-sm md:text-base ${hasNextPage ? "bg-indigo-600 border border-indigo-400 text-white hover:bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)]" : "bg-transparent text-zinc-700 cursor-not-allowed pointer-events-none"}`}
         >
            <span className="hidden sm:inline">Selanjutnya</span>
            <ChevronRight className="w-5 h-5" />
         </Link>
      </section>

    </div>
  );
}
