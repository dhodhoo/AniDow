"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clapperboard, Star } from "lucide-react";
import { AnimeCardData } from "@/types/anime-api";

interface AnimeCardProps {
  anime: AnimeCardData;
  index: number;
  priority?: boolean;
}

export default function AnimeCard({ anime, index, priority = false }: AnimeCardProps) {
  const score = anime.score || anime.rating;
  const episodeLabel = anime.currentEpisode
    ? `EP ${anime.currentEpisode}`
    : anime.totalEpisodes
      ? `${anime.totalEpisodes} EPS`
      : anime.episodes
        ? `${anime.episodes} EPS`
        : null;

  return (
    <Link href={`/anime/${anime.slug}`}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          ease: "easeOut",
          delay: Math.min(index * 0.05, 0.5) // Cap maximum stagger delay to feel extremely responsive
        }}
        whileHover={{ 
          y: -10, 
          scale: 1.02,
          transition: { duration: 0.3, ease: "easeOut" }
        }}
        className="glass-card rounded-2xl overflow-hidden flex flex-col h-full group cursor-pointer relative"
      >
        {/* Glow effect on hover */}
        <div className="absolute inset-0 bg-indigo-500/0 group-hover:bg-indigo-500/10 transition-colors duration-500 z-10 pointer-events-none" />

        {/* Thumbnail */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-zinc-900 border-b border-white/5">
          {anime.image ? (
            <Image
              src={anime.image}
              alt={anime.title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 18vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              unoptimized
              priority={priority}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950 text-zinc-700">
              <Clapperboard className="h-10 w-10" />
            </div>
          )}
          
          {/* Top badging (Score) */}
          {score && (
            <div className="absolute top-3 right-3 z-20 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1 border border-white/10 shadow-lg">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="text-xs font-bold text-white">{score}</span>
            </div>
          )}
        </div>

        {/* Content Details */}
        <div className="p-4 flex flex-col flex-grow relative z-20 bg-gradient-to-t from-[#050505] via-zinc-900/40 to-[#050505]/20">
          <h3 className="font-bold text-base tracking-tight text-zinc-100 line-clamp-2 mb-2 group-hover:text-indigo-400 transition-colors">
            {anime.title}
          </h3>
          
          <div className="flex items-center gap-2 mb-3 flex-wrap mt-auto">
            {episodeLabel && (
              <span className="text-[10px] px-2 py-1 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                {episodeLabel}
              </span>
            )}
            {(anime.day || anime.date || anime.season) && (
              <span className="text-[10px] px-2 py-1 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
                <Calendar className="mr-1 inline h-3 w-3" />
                {anime.day || anime.date || anime.season}
              </span>
            )}
          </div>
          
          {/* Genres limit 2 */}
          <div className="flex gap-2">
            {anime.genres?.slice(0, 2).map((genre) => (
              <span key={genre} className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400/80">
                {genre}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
