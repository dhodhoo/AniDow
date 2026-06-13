"use client";

import Image from "next/image";
import Link from "next/link";
import { Clapperboard, Clock, Play, Star } from "lucide-react";

import { formatDuration } from "@/lib/movie-api";
import { MovieCardData } from "@/types/movie-api";

interface MovieCardProps {
  movie: MovieCardData;
  index: number;
  priority?: boolean;
}

export default function MovieCard({ movie, index, priority = false }: MovieCardProps) {
  const typeLabel = movie.subjectType === "movies" ? "Film" : "TV";
  const year = movie.releaseDate?.slice(0, 4);

  return (
    <Link href={`/movies/${movie.detailPath}?id=${movie.subjectId}`}>
      <div
        className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group cursor-pointer relative border border-white/5 hover:border-amber-400/40 transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] animate-fade-in opacity-0"
        style={{
          animationDelay: `${Math.min(index * 0.03, 0.3)}s`,
          animationFillMode: "forwards"
        }}
      >
        <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/10 transition-colors duration-500 z-10 pointer-events-none" />

        <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900 border-b border-white/5">
          {movie.image ? (
            <Image
              src={movie.image}
              alt={movie.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 18vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 text-zinc-700">
              <Clapperboard className="h-10 w-10" />
            </div>
          )}

          <div className="absolute left-3 top-3 z-20 flex flex-col gap-2">
            <span className={`w-fit rounded-lg border px-2 py-1 text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md ${movie.subjectType === "movies" ? "border-amber-400/30 bg-amber-500/20 text-amber-200" : "border-sky-400/30 bg-sky-500/20 text-sky-200"}`}>
              {typeLabel}
            </span>
            {!movie.hasResource && (
              <span className="w-fit rounded-lg border border-white/10 bg-black/60 px-2 py-1 text-[10px] font-bold text-zinc-400 shadow-lg backdrop-blur-md">
                Belum Tersedia
              </span>
            )}
          </div>
          {movie.imdbRating ? (
            <div className="absolute bottom-3 right-3 md:top-3 md:bottom-auto z-20 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10 shadow-lg">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-white">{movie.imdbRating.toFixed(1)}</span>
            </div>
          ) : null}
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/45 group-hover:opacity-100">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-black uppercase tracking-wider text-black shadow-2xl">
              <Play className="h-3.5 w-3.5 fill-black" />
              Lihat Detail
            </span>
          </div>
        </div>

        <div className="p-4 flex flex-col flex-grow relative z-20 bg-gradient-to-t from-[#050505] via-zinc-900/40 to-[#050505]/20">
          <h3 className="font-bold text-base tracking-tight text-zinc-100 line-clamp-2 mb-2 group-hover:text-amber-400 transition-colors">
            {movie.title}
          </h3>

          <div className="flex items-center gap-2 mb-3 flex-wrap mt-auto">
            {year && (
              <span className="text-[10px] px-2 py-1 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                {year}
              </span>
            )}
            {movie.duration ? (
              <span className="text-[10px] px-2 py-1 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                <Clock className="mr-1 inline h-3 w-3" />
                {formatDuration(movie.duration)}
              </span>
            ) : null}
          </div>

          <div className="flex gap-2">
            {movie.genre.slice(0, 2).map((genre) => (
              <span key={genre} className="text-[10px] uppercase font-semibold tracking-wider text-amber-400/80">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
