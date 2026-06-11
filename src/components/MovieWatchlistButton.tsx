"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useMovieWatchlist } from "@/hooks/useMovieWatchlist";
import { MovieCardData } from "@/types/movie-api";

export default function MovieWatchlistButton({ movie }: { movie: MovieCardData }) {
  const { isSaved, toggleWatchlist, isLoaded } = useMovieWatchlist();

  if (!isLoaded) {
    return (
      <div className="w-full sm:w-56 h-12 bg-zinc-800/50 animate-pulse rounded-full border border-white/5" />
    );
  }

  const saved = isSaved(movie.subjectId);

  return (
    <button
      onClick={() => toggleWatchlist(movie)}
      className={`flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 transition-all duration-300 ${
        saved
          ? "bg-amber-600 text-white hover:bg-amber-700 shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-500/50"
          : "bg-white text-black hover:bg-zinc-200"
      }`}
    >
      {saved ? (
        <>
          <BookmarkCheck className="w-5 h-5 fill-amber-200" />
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
