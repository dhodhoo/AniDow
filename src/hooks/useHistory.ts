"use client";

import { useState, useEffect } from "react";

interface HistoryRecord {
  [mal_id: number]: number; // Maps anime ID key to the last watched episode
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryRecord>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Hydrate LocalStorage Client Process
    const stored = window.localStorage.getItem("anidow_history");
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Gagal membaca history", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveHistory = (mal_id: number, episodeNumber: number) => {
    setHistory((prev) => {
      // Create new shallow copy dictionary
      const nextHistory = { ...prev, [mal_id]: episodeNumber };
      window.localStorage.setItem("anidow_history", JSON.stringify(nextHistory));
      return nextHistory;
    });
  };

  const getLastWatched = (mal_id: number): number | undefined => {
    return history[mal_id];
  };

  return { history, isLoaded, saveHistory, getLastWatched };
}
