"use client";

import { motion } from "framer-motion";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Anime } from "@/types/jikan";
import { useState, useEffect } from "react";

export default function WatchlistButton({ anime }: { anime: Anime }) {
  const { isSaved, toggleWatchlist, isLoaded } = useWatchlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Use Skeleton fallback if not hydrated to avoid Hydration Mismatch issues on NextJS
  if (!mounted || !isLoaded) {
    return (
      <div className="w-56 h-12 bg-zinc-800/50 animate-pulse rounded-full border border-white/5" />
    );
  }

  const saved = isSaved(anime.mal_id);

  return (
    <motion.button 
      onClick={() => toggleWatchlist(anime)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`flex items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-colors ${
        saved 
          ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_0_20px_rgba(99,102,241,0.4)] border border-indigo-500/50" 
          : "bg-white text-black hover:bg-zinc-200"
      }`}
    >
      {saved ? (
        <>
          <BookmarkCheck className="w-5 h-5 fill-indigo-200" />
          <span>Hapus dari Watchlist</span>
        </>
      ) : (
        <>
          <Bookmark className="w-5 h-5 fill-zinc-900" />
          <span>Tambahkan Ke Watchlist</span>
        </>
      )}
    </motion.button>
  );
}
