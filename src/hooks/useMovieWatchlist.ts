"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { MovieCardData } from "@/types/movie-api";

const WATCHLIST_KEY = "anidow_movie_watchlist";
const WATCHLIST_EVENT = "anidow_movie_watchlist_change";
const EMPTY_WATCHLIST = "[]";

function getWatchlistSnapshot() {
  return window.localStorage.getItem(WATCHLIST_KEY) ?? EMPTY_WATCHLIST;
}

function getServerSnapshot() {
  return EMPTY_WATCHLIST;
}

function subscribeToWatchlist(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === WATCHLIST_KEY) callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(WATCHLIST_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(WATCHLIST_EVENT, callback);
  };
}

function parseWatchlist(raw: string): MovieCardData[] {
  try {
    return JSON.parse(raw) as MovieCardData[];
  } catch (error) {
    console.error("Failed to parse movie watchlist", error);
    return [];
  }
}

export function useMovieWatchlist() {
  const rawWatchlist = useSyncExternalStore(
    subscribeToWatchlist,
    getWatchlistSnapshot,
    getServerSnapshot
  );
  const watchlist = useMemo(() => parseWatchlist(rawWatchlist), [rawWatchlist]);

  const toggleWatchlist = useCallback((movie: MovieCardData) => {
    const currentList = parseWatchlist(getWatchlistSnapshot());
    const isCurrentlySaved = currentList.some((item) => item.subjectId === movie.subjectId);
    const updatedList = isCurrentlySaved
      ? currentList.filter((item) => item.subjectId !== movie.subjectId)
      : [movie, ...currentList];

    window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new Event(WATCHLIST_EVENT));
  }, []);

  const isSaved = (subjectId: string) => watchlist.some((item) => item.subjectId === subjectId);

  return { watchlist, isLoaded: true, toggleWatchlist, isSaved };
}
