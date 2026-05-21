"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

export interface HistoryEntry {
  animeSlug: string;
  episodeSlug: string;
  episodeLabel: string;
  title: string;
}

interface HistoryRecord {
  [animeSlug: string]: HistoryEntry;
}

const HISTORY_KEY = "anidow_private_history";
const HISTORY_EVENT = "anidow_private_history_change";
const EMPTY_HISTORY = "{}";

function getHistorySnapshot() {
  return window.localStorage.getItem(HISTORY_KEY) ?? EMPTY_HISTORY;
}

function getServerSnapshot() {
  return EMPTY_HISTORY;
}

function subscribeToHistory(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === HISTORY_KEY) callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(HISTORY_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(HISTORY_EVENT, callback);
  };
}

function parseHistory(raw: string): HistoryRecord {
  try {
    return JSON.parse(raw) as HistoryRecord;
  } catch (error) {
    console.error("Gagal membaca history", error);
    return {};
  }
}

export function useHistory() {
  const rawHistory = useSyncExternalStore(
    subscribeToHistory,
    getHistorySnapshot,
    getServerSnapshot
  );
  const history = useMemo(() => parseHistory(rawHistory), [rawHistory]);

  const saveHistory = useCallback((entry: HistoryEntry) => {
    const nextHistory = { ...parseHistory(getHistorySnapshot()), [entry.animeSlug]: entry };
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(nextHistory));
    window.dispatchEvent(new Event(HISTORY_EVENT));
  }, []);

  const getLastWatched = (animeSlug: string): HistoryEntry | undefined => {
    return history[animeSlug];
  };

  return { history, isLoaded: true, saveHistory, getLastWatched };
}
