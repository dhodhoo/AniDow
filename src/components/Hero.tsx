"use client";

import { motion } from "framer-motion";
import { Anime } from "@/types/jikan";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";

interface HeroProps {
  anime: Anime | null;
}

export default function Hero({ anime }: HeroProps) {
  if (!anime) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full h-[400px] md:h-[500px] mb-12 rounded-3xl overflow-hidden glass-card group"
    >
      {/* Background Image Overlay */}
      <div className="absolute inset-0">
        <Image
          src={anime.trailer?.images?.maximum_image_url || anime.images.webp.large_image_url}
          alt={anime.title}
          fill
          priority // Highest priority for rendering Above the fold LCP component
          sizes="100vw"
          className="object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000 ease-out"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/40 to-transparent" />
      </div>

      {/* Floating Info Layout */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 md:p-12 max-w-3xl">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
        >
          {anime.genres && (
            <div className="flex flex-wrap gap-2 mb-4">
              {anime.genres.slice(0, 3).map(g => (
                <span key={g.mal_id} className="text-[10px] sm:text-xs font-semibold px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30 backdrop-blur-md">
                  {g.name}
                </span>
              ))}
            </div>
          )}
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter mb-4 drop-shadow-lg line-clamp-2">
            {anime.title || anime.title_english}
          </h1>
          
          <p className="text-zinc-300 text-sm md:text-base line-clamp-3 mb-6 max-w-2xl leading-relaxed">
            {anime.synopsis}
          </p>

          <Link href={`/anime/${anime.mal_id}`}>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center justify-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-zinc-200 transition-colors"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Saksikan Trailer</span>
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
}
