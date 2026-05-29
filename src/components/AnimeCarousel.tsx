"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import AnimeCard from "@/components/AnimeCard";
import AnimeSkeleton from "@/components/AnimeSkeleton";
import { AnimeCardData } from "@/types/anime-api";

interface AnimeCarouselProps {
  title: string;
  description: string;
  animeList: AnimeCardData[];
  routeParam: string;
  skeletonCount?: number;
  priority?: boolean;
}

export default function AnimeCarousel({ title, description, animeList, routeParam, skeletonCount = 5, priority = false }: AnimeCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction === "right" ? container.clientWidth * 0.85 : -container.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-16 relative group/carousel">
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

      <div className="relative">
        <button
          type="button"
          aria-label={`Geser ${title} ke kiri`}
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 z-30 hidden h-12 w-12 -translate-x-3 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-zinc-950/80 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:border-indigo-400/50 hover:bg-indigo-600 md:flex md:group-hover/carousel:opacity-100"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          aria-label={`Geser ${title} ke kanan`}
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 z-30 hidden h-12 w-12 -translate-y-1/2 translate-x-3 items-center justify-center rounded-full border border-white/10 bg-zinc-950/80 text-white opacity-0 shadow-2xl backdrop-blur-xl transition-all hover:border-indigo-400/50 hover:bg-indigo-600 md:flex md:group-hover/carousel:opacity-100"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div ref={scrollRef} className="-mx-6 overflow-x-auto scroll-smooth px-6 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
      </div>
    </section>
  );
}
