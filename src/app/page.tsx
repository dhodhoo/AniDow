import Hero from "@/components/Hero";
import { getGenre, getHome, isAnimeApiConfigured, toAnimeCardData } from "@/lib/anime-api";
import { HomeAnimeItem } from "@/types/anime-api";
import Link from "next/link";
import { LayoutGrid } from "lucide-react";
import dynamic from "next/dynamic";

const AnimeCarousel = dynamic(() => import("@/components/AnimeCarousel"));

export const revalidate = 600;

async function safeGenre(slug: string) {
  if (!isAnimeApiConfigured()) {
    return [];
  }

  try {
    const data = await getGenre(slug, 1);
    return data.items.map(toAnimeCardData).slice(0, 12);
  } catch (error) {
    console.error(`Homepage genre ${slug} loading failed:`, error);
    return [];
  }
}

export default async function Home() {
  let ongoing: HomeAnimeItem[] = [];
  let complete: HomeAnimeItem[] = [];

  if (isAnimeApiConfigured()) {
    try {
      const home = await getHome();
      ongoing = home.ongoing;
      complete = home.complete;
    } catch (error) {
      console.error("Homepage anime loading failed:", error);
    }
  }

  const [actionAnime, comedyAnime, romanceAnime] = await Promise.all([
    safeGenre("action"),
    safeGenre("comedy"),
    safeGenre("romance"),
  ]);

  const heroAnime = ongoing[0] || complete[0] || null;
  const latestAnime = ongoing.slice(1, 11).map(toAnimeCardData);
  const completeAnime = complete.slice(0, 10).map(toAnimeCardData);

  return (
    <div className="flex flex-col gap-10">
      <section>
        <Hero anime={heroAnime} />

        <div className="mt-8 mb-12 flex items-center justify-between border border-white/10 bg-zinc-900/50 p-6 rounded-2xl glass-card relative overflow-hidden group">
          <div className="relative z-10 flex flex-col gap-1">
            <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">Perpustakaan AniDow</h3>
            <p className="text-xs sm:text-sm text-zinc-400">Jajaki katalog anime lengkap dengan episode, streaming, dan download.</p>
          </div>
          <Link href="/browse">
            <button className="relative z-10 flex items-center gap-2 bg-white text-black hover:bg-zinc-200 px-4 sm:px-6 py-3 rounded-xl font-bold transition-all shadow-xl group-hover:scale-105 active:scale-95 text-xs sm:text-sm">
              <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">Jelajahi Semua</span>
              <span className="sm:hidden">Semua</span>
            </button>
          </Link>
          <div className="absolute right-0 sm:right-20 top-1/2 -translate-y-1/2 w-48 h-48 bg-indigo-600/20 blur-3xl rounded-full group-hover:bg-indigo-500/30 transition-colors" />
        </div>

      </section>

      <AnimeCarousel
        title="Update Ongoing Terbaru"
        description="Episode terbaru subtitle Indonesia, langsung dari katalog AniDow. Geser untuk melihat lebih banyak."
        animeList={latestAnime}
        routeParam="type=ongoing"
        skeletonCount={10}
        priority
      />
      <AnimeCarousel
        title="Aksi Menegangkan"
        description="Ledakan, pertarungan epik, dan kelangsungan hidup dengan adrenalin penuh."
        animeList={actionAnime}
        routeParam="genre=action"
      />
      <AnimeCarousel
        title="Komedi Segar"
        description="Tawa lepas pengusir penat dengan deret momen absurd yang memecah suasana."
        animeList={comedyAnime}
        routeParam="genre=comedy"
      />
      <AnimeCarousel
        title="Romansa Favorit"
        description="Kisah manis dua insan dan serbarnya bumbu drama yang menggetarkan hati."
        animeList={romanceAnime}
        routeParam="genre=romance"
      />
      <AnimeCarousel
        title="Serial Complete"
        description="Pilihan tamat untuk maraton tanpa menunggu episode baru."
        animeList={completeAnime}
        routeParam="type=complete"
        skeletonCount={10}
      />

    </div>
  );
}
