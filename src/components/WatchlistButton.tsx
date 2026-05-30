"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useWatchlist } from "@/hooks/useWatchlist";
import { AnimeCardData } from "@/types/anime-api";

export default function WatchlistButton({ anime }: { anime: AnimeCardData }) {
  const { isSaved, toggleWatchlist, isLoaded } = useWatchlist();

  // Use Skeleton fallback if not hydrated to avoid Hydration Mismatch issues on NextJS
  if (!isLoaded) {
    return (
      <div className="w-full sm:w-56 h-12 bg-zinc-800/50 animate-pulse rounded-full border border-white/5" />
    );
  }

  const saved = isSaved(anime.slug);

  return (
    <button
      onClick={() => toggleWatchlist(anime)}
      className={`flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all duration-300 ${
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
    </button>
  );
}
