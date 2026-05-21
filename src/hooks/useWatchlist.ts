"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { AnimeCardData } from "@/types/anime-api";

const WATCHLIST_KEY = "anidow_private_watchlist";
const WATCHLIST_EVENT = "anidow_private_watchlist_change";
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

function parseWatchlist(raw: string): AnimeCardData[] {
  try {
    return JSON.parse(raw) as AnimeCardData[];
  } catch (error) {
    console.error("Failed to parse watchlist", error);
    return [];
  }
}

export function useWatchlist() {
  const rawWatchlist = useSyncExternalStore(
    subscribeToWatchlist,
    getWatchlistSnapshot,
    getServerSnapshot
  );
  const watchlist = useMemo(() => parseWatchlist(rawWatchlist), [rawWatchlist]);

  const toggleWatchlist = useCallback((anime: AnimeCardData) => {
    const currentList = parseWatchlist(getWatchlistSnapshot());
    const isCurrentlySaved = currentList.some((item) => item.slug === anime.slug);
    const updatedList = isCurrentlySaved
      ? currentList.filter((item) => item.slug !== anime.slug)
      : [anime, ...currentList];

    window.localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updatedList));
    window.dispatchEvent(new Event(WATCHLIST_EVENT));
  }, []);

  const isSaved = (slug: string) => watchlist.some((item) => item.slug === slug);

  return { watchlist, isLoaded: true, toggleWatchlist, isSaved };
}
