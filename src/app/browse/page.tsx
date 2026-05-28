import AnimeCard from "@/components/AnimeCard";
import { getAnimePage, getGenre, getGenres, toAnimeCardData } from "@/lib/anime-api";
import { AnimeCardData, Genre } from "@/types/anime-api";
import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Jelajahi Semua Anime - AniDow",
  description: "Pustaka AniDow menyajikan katalog anime dengan streaming dan download.",
};

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; genre?: string; type?: "ongoing" | "complete" }>;
}) {
  const params = await searchParams;
  const currentPage = Math.max(parseInt(params.page || "1", 10) || 1, 1);
  const type = params.type || "ongoing";

  const buildCurrentUrl = (pageParam: number) => {
    const url = new URLSearchParams();
    url.set("page", pageParam.toString());
    if (params.genre) url.set("genre", params.genre);
    if (!params.genre) url.set("type", type);
    return `/browse?${url.toString()}`;
  };

  let animeList: AnimeCardData[] = [];
  let totalPages = currentPage;
  let currentCategoryLabel = type === "complete" ? "Anime Complete" : "Anime Ongoing";
  let genres: Genre[] = [];

  try {
    const [genreList, data] = await Promise.all([
      getGenres(),
      params.genre
        ? getGenre(params.genre, currentPage)
        : getAnimePage(type, currentPage),
    ]);
    genres = genreList.genres;
    animeList = data.items.map(toAnimeCardData);
    totalPages = data.pagination?.totalPages || currentPage;
    currentCategoryLabel = params.genre
      ? genreList.genres.find((genre) => genre.slug === params.genre)?.name || params.genre
      : currentCategoryLabel;
  } catch (err) {
    console.error("Browse Anime loading failed:", err);
  }

  const hasNextPage = currentPage < totalPages;

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
      <section className="glass-card p-6 md:p-12 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col items-center text-center justify-center">
        <div className="relative z-10 flex flex-col items-center gap-4 max-w-2xl">
          <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center border border-indigo-500/30 mb-2">
            <LayoutGrid className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter">
            Pustaka {currentCategoryLabel}
          </h1>
          <p className="text-zinc-400 leading-relaxed text-sm md:text-base">
            Jelajahi katalog anime berdasarkan status rilis dan genre, lengkap dengan episode streaming serta link download.
          </p>
        </div>
      </section>

      <section className="flex flex-wrap gap-2">
        <Link href="/browse?type=ongoing" className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${!params.genre && type === "ongoing" ? "border-indigo-400 bg-indigo-600 text-white" : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"}`}>
          Ongoing
        </Link>
        <Link href="/browse?type=complete" className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${!params.genre && type === "complete" ? "border-indigo-400 bg-indigo-600 text-white" : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"}`}>
          Complete
        </Link>
        {genres.slice(0, 12).map((genre) => (
          <Link key={genre.slug} href={`/browse?genre=${genre.slug}`} className={`rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${params.genre === genre.slug ? "border-indigo-400 bg-indigo-600 text-white" : "border-white/10 bg-white/5 text-zinc-400 hover:text-white"}`}>
            {genre.name}
          </Link>
        ))}
      </section>

      <section>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {animeList.length > 0 ? (
            animeList.map((anime, index) => (
              <AnimeCard key={anime.slug} anime={anime} index={index} priority={index < 8} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-zinc-500 font-medium">
              Gagal mengambil data atau halaman terakhir telah tercapai.
            </div>
          )}
        </div>
      </section>

      <section className="flex items-center justify-between border-t border-white/5 pt-8 mt-4">
        <Link
          href={currentPage > 1 ? buildCurrentUrl(currentPage - 1) : "#"}
          className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all text-sm md:text-base ${currentPage > 1 ? "bg-zinc-900 border border-white/10 text-white hover:bg-zinc-800" : "bg-transparent text-zinc-700 cursor-not-allowed pointer-events-none"}`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </Link>

        <div className="text-zinc-400 font-bold text-sm tracking-widest uppercase">
          Halaman {currentPage} / {totalPages}
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
