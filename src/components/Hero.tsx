"use client";

import { motion } from "framer-motion";
import { HomeAnimeItem } from "@/types/anime-api";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

interface HeroProps {
  anime: HomeAnimeItem | null;
}

export default function Hero({ anime }: HeroProps) {
  if (!anime) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative w-full h-[320px] sm:h-[400px] md:h-[500px] mb-8 sm:mb-12 rounded-3xl overflow-hidden glass-card group"
    >
      {/* Background Image Overlay */}
      <div className="absolute inset-0">
        <Image
          src={anime.image}
          alt={anime.title}
          fill
          priority // Highest priority for rendering Above the fold LCP component
          sizes="100vw"
          className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
      </div>

      {/* Floating Info Layout */}
      <div className="relative z-10 h-full flex flex-col justify-end p-5 sm:p-6 md:p-12 max-w-3xl">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex flex-wrap gap-2 mb-4">
            {anime.currentEpisode && (
              <span className="text-[10px] sm:text-xs font-semibold px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 backdrop-blur-md">
                Episode {anime.currentEpisode}
              </span>
            )}
            {anime.day && (
              <span className="text-[10px] sm:text-xs font-semibold px-3 py-1 bg-white/10 text-zinc-200 rounded-full border border-white/15 backdrop-blur-md">
                {anime.day}
              </span>
            )}
          </div>
          
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter mb-3 sm:mb-4 drop-shadow-lg line-clamp-2">

            {anime.title}
          </h1>
          
          <p className="text-zinc-300 text-xs sm:text-sm md:text-base line-clamp-2 sm:line-clamp-3 mb-5 sm:mb-6 max-w-2xl leading-relaxed">

            Update terbaru AniDow. Streaming subtitle Indonesia dengan pilihan mirror dan link download.
          </p>

          <Link href={`/anime/${anime.slug}`}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 bg-white text-black px-5 py-2.5 sm:px-6 sm:py-3 rounded-full font-semibold text-sm sm:text-base hover:bg-zinc-200 transition-colors"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Lihat Detail</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
