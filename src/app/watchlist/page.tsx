"use client";

import AnimeCard from "@/components/AnimeCard";
import AnimeSkeleton from "@/components/AnimeSkeleton";
import { useWatchlist } from "@/hooks/useWatchlist";
import { Bookmark } from "lucide-react";
import Link from "next/link";

export default function WatchlistPage() {
  const { watchlist, isLoaded } = useWatchlist();

  return (
    <div className="flex flex-col gap-10 min-h-[60vh] animate-in fade-in duration-500">
      <div className="mb-4 flex items-center gap-4 pb-8 border-b border-white/5">
        <div className="p-3 bg-indigo-500/20 rounded-2xl border border-indigo-500/30">
          <Bookmark className="w-8 h-8 text-indigo-400 fill-indigo-400/20" />
        </div>
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight">Koleksi Watchlist</h1>
           <p className="text-zinc-400 mt-1">{isLoaded ? `Tersimpan ${watchlist.length} anime pilihan Anda.` : "Melakukan sinkronisasi memori..."}</p>
        </div>
      </div>

      {!isLoaded ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <AnimeSkeleton key={i} />
          ))}
        </div>
      ) : watchlist.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-in slide-in-from-bottom-8 duration-700 fade-in">
          {watchlist.map((anime, index) => (
            <AnimeCard key={anime.mal_id} anime={anime} index={index} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center w-full min-h-[40vh] border border-dashed border-white/10 rounded-3xl glass-card">
          <Bookmark className="w-16 h-16 text-zinc-600 mb-4" />
          <h2 className="text-xl font-bold text-zinc-300">Belum ada koleksi yang disimpan</h2>
          <p className="text-zinc-500 mt-2 mb-6">Jelajahi dan tambahkan anime favorit Anda.</p>
          <Link href="/">
             <button className="px-6 py-2 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-full font-medium transition-colors border border-indigo-500">
               Eksplor Sekarang
             </button>
          </Link>
        </div>
      )}
    </div>
  );
}
