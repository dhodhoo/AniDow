import Hero from "@/components/Hero";
import AnimeCard from "@/components/AnimeCard";
import AnimeSkeleton from "@/components/AnimeSkeleton";
import { getGenre, getHome, isAnimeApiConfigured, toAnimeCardData } from "@/lib/anime-api";
import { AnimeCardData, HomeAnimeItem } from "@/types/anime-api";
import Link from "next/link";
import { ChevronRight, LayoutGrid } from "lucide-react";

export const revalidate = 600;

async function safeGenre(slug: string) {
  if (!isAnimeApiConfigured()) {
    return [];
  }

  try {
    const data = await getGenre(slug, 1);
    return data.items.map(toAnimeCardData).slice(0, 5);
  } catch (error) {
    console.error(`Homepage genre ${slug} loading failed:`, error);
    return [];
  }
}

function AnimeCarousel({ title, description, animeList, routeParam, skeletonCount = 5, priority = false }: { title: string; description: string; animeList: AnimeCardData[]; routeParam: string; skeletonCount?: number; priority?: boolean }) {
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

      <div className="-mx-6 overflow-x-auto px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex snap-x snap-mandatory gap-4 md:gap-6">
          {animeList.length > 0 ? (
            animeList.map((anime, index) => (
              <div key={anime.slug} className="w-[46%] shrink-0 snap-start sm:w-[30%] md:w-[22%] lg:w-[18%] xl:w-[16%]">
                <AnimeCard anime={anime} index={index} priority={priority && index < 5} />
              </div>
            ))
          ) : (
            Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="w-[46%] shrink-0 snap-start sm:w-[30%] md:w-[22%] lg:w-[18%] xl:w-[16%]">
                <AnimeSkeleton />
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
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
