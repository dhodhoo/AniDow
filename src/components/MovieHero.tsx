"use client";

import { MovieBanner } from "@/types/movie-api";
import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "lucide-react";
import { useEffect, useState } from "react";

interface MovieHeroProps {
  banners: MovieBanner[];
}

export default function MovieHero({ banners }: MovieHeroProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % banners.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [banners.length]);

  if (banners.length === 0) return null;

  const banner = banners[active];
  const subject = banner.subject;

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] md:h-[500px] mb-8 sm:mb-12 rounded-3xl overflow-hidden glass-card group animate-fade-in">
      <div className="absolute inset-0">
        <Image
          key={banner.image}
          src={banner.image}
          alt={banner.title}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000 ease-out animate-fade-in"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
      </div>

      <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-6 md:p-12 max-w-3xl">
        <div
          key={active}
          className="animate-slide-up opacity-0"
          style={{ animationDelay: "0.15s", animationFillMode: "forwards" }}
        >
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-[10px] sm:text-xs font-semibold px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full border border-amber-500/30 backdrop-blur-md">
              {subject.subjectType === "movies" ? "Film" : "TV Series"}
            </span>
            {subject.imdbRating ? (
              <span className="text-[10px] sm:text-xs font-semibold px-3 py-1 bg-white/10 text-zinc-200 rounded-full border border-white/15 backdrop-blur-md inline-flex items-center gap-1">
                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                {subject.imdbRating.toFixed(1)}
              </span>
            ) : null}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter mb-3 sm:mb-4 drop-shadow-lg line-clamp-2">
            {banner.title}
          </h1>

          <p className="text-zinc-300 text-xs sm:text-sm md:text-base line-clamp-2 sm:line-clamp-3 mb-5 sm:mb-6 max-w-2xl leading-relaxed">
            {subject.description || "Film dan serial TV pilihan. Streaming dengan subtitle dan pilihan kualitas."}
          </p>

          <Link href={`/movies/${subject.detailPath}?id=${subject.subjectId}`}>
            <button
              className="flex items-center justify-center gap-2 bg-white text-black px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Lihat Detail</span>
            </button>
          </Link>
        </div>
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-4 right-5 z-20 flex gap-1.5">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Banner ${i + 1}`}
              onClick={() => setActive(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-amber-400" : "w-1.5 bg-white/30 hover:bg-white/60"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
