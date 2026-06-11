"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import MovieCard from "@/components/MovieCard";
import AnimeSkeleton from "@/components/AnimeSkeleton";
import { MovieCardData } from "@/types/movie-api";

interface MovieCarouselProps {
  title: string;
  description: string;
  movieList: MovieCardData[];
  seeAllHref?: string;
  skeletonCount?: number;
  priority?: boolean;
}

export default function MovieCarousel({ title, description, movieList, seeAllHref, skeletonCount = 5, priority = false }: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLeftFade, setShowLeftFade] = useState(false);
  const [showRightFade, setShowRightFade] = useState(true);

  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;

    setShowLeftFade(scrollLeft > 5);
    setShowRightFade(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    handleScroll();

    window.addEventListener("resize", handleScroll);
    return () => window.removeEventListener("resize", handleScroll);
  }, [movieList]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollRef.current;
    if (!container) return;

    container.scrollBy({
      left: direction === "right" ? container.clientWidth * 0.85 : -container.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-8 sm:mt-10 relative group/carousel">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1.5 sm:mb-2 flex items-center gap-2">
            {title}
          </h2>
          <p className="text-sm text-zinc-400 max-w-2xl">{description}</p>
        </div>
        {seeAllHref && (
          <Link href={seeAllHref} className="shrink-0 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors group bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20">
            Lihat Semua
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      <div className="relative">
        <button
          type="button"
          aria-label={`Geser ${title} ke kiri`}
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 z-30 hidden h-11 w-11 -translate-x-2 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-zinc-950/70 text-white/80 shadow-2xl backdrop-blur-xl transition-all hover:border-amber-400/50 hover:bg-amber-600 hover:text-white md:flex"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          type="button"
          aria-label={`Geser ${title} ke kanan`}
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 z-30 hidden h-11 w-11 -translate-y-1/2 translate-x-2 items-center justify-center rounded-full border border-white/10 bg-zinc-950/70 text-white/80 shadow-2xl backdrop-blur-xl transition-all hover:border-amber-400/50 hover:bg-amber-600 hover:text-white md:flex"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        <div className={`pointer-events-none absolute left-0 top-0 z-20 hidden h-full w-16 bg-gradient-to-r from-[#050505] to-transparent md:block transition-opacity duration-300 ${showLeftFade ? "opacity-100" : "opacity-0"}`} />
        <div className={`pointer-events-none absolute right-0 top-0 z-20 hidden h-full w-16 bg-gradient-to-l from-[#050505] to-transparent md:block transition-opacity duration-300 ${showRightFade ? "opacity-100" : "opacity-0"}`} />

        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="flex snap-x snap-mandatory gap-4 md:gap-6">
            {movieList.length > 0 ? (
              movieList.map((movie, index) => (
                <div key={movie.subjectId} className="w-[43%] shrink-0 snap-start sm:w-[30%] md:w-[22%] lg:w-[18%] xl:w-[16%]">
                  <MovieCard movie={movie} index={index} priority={priority && index < 5} />
                </div>
              ))
            ) : (
              Array.from({ length: skeletonCount }).map((_, i) => (
                <div key={i} className="w-[43%] shrink-0 snap-start sm:w-[30%] md:w-[22%] lg:w-[18%] xl:w-[16%]">
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
