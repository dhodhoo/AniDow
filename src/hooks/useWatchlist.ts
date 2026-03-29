"use client";

import { useState, useEffect } from "react";
import { Anime } from "@/types/jikan";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Anime[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Client-side hydration of localStorage
    const stored = window.localStorage.getItem("anidow_watchlist");
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse watchlist", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const toggleWatchlist = (anime: Anime) => {
    setWatchlist((prev) => {
      const isCurrentlySaved = prev.some((item) => item.mal_id === anime.mal_id);
      let updatedList;
      
      if (isCurrentlySaved) {
        // Hapus jika sudah ada
        updatedList = prev.filter((item) => item.mal_id !== anime.mal_id);
      } else {
        // Tambahkan ke urutan paling atas jika belum ada
        updatedList = [anime, ...prev]; 
      }
      
      window.localStorage.setItem("anidow_watchlist", JSON.stringify(updatedList));
      return updatedList;
    });
  };

  const isSaved = (mal_id: number) => watchlist.some((item) => item.mal_id === mal_id);

  return { watchlist, isLoaded, toggleWatchlist, isSaved };
}
