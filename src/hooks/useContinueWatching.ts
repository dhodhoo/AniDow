"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { ContinueWatchingEntry, ContinueWatchingRecord } from "@/types/movie-api";

const CONTINUE_KEY = "anidow_movie_continue";
const CONTINUE_EVENT = "anidow_movie_continue_change";
const EMPTY_RECORD = "{}";

export function continueWatchingKey(subjectId: string, season: number | null, episode: number | null) {
  return `${subjectId}:${season ?? 0}:${episode ?? 0}`;
}

function getContinueSnapshot() {
  return window.localStorage.getItem(CONTINUE_KEY) ?? EMPTY_RECORD;
}

function getServerSnapshot() {
  return EMPTY_RECORD;
}

function subscribeToContinue(callback: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === CONTINUE_KEY) callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(CONTINUE_EVENT, callback);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(CONTINUE_EVENT, callback);
  };
}

function parseRecord(raw: string): ContinueWatchingRecord {
  try {
    return JSON.parse(raw) as ContinueWatchingRecord;
  } catch (error) {
    console.error("Failed to parse continue watching record", error);
    return {};
  }
}

function writeRecord(record: ContinueWatchingRecord) {
  window.localStorage.setItem(CONTINUE_KEY, JSON.stringify(record));
  window.dispatchEvent(new Event(CONTINUE_EVENT));
}

export function useContinueWatching() {
  const rawRecord = useSyncExternalStore(subscribeToContinue, getContinueSnapshot, getServerSnapshot);
  const entries = useMemo(() => parseRecord(rawRecord), [rawRecord]);

  const sortedEntries = useMemo(
    () => Object.values(entries).sort((a, b) => b.updatedAt - a.updatedAt).slice(0, 20),
    [entries]
  );

  const getEntry = useCallback(
    (subjectId: string, season: number | null, episode: number | null) =>
      entries[continueWatchingKey(subjectId, season, episode)],
    [entries]
  );

  const saveEntry = useCallback((entry: Omit<ContinueWatchingEntry, "updatedAt">) => {
    const record = parseRecord(getContinueSnapshot());
    const key = continueWatchingKey(entry.subjectId, entry.season, entry.episode);

    // Dianggap selesai — hapus dari continue watching
    if (entry.duration > 0 && entry.position > entry.duration * 0.95) {
      delete record[key];
    } else {
      record[key] = { ...entry, updatedAt: Date.now() };
    }

    writeRecord(record);
  }, []);

  const clearEntry = useCallback((subjectId: string, season: number | null, episode: number | null) => {
    const record = parseRecord(getContinueSnapshot());
    delete record[continueWatchingKey(subjectId, season, episode)];
    writeRecord(record);
  }, []);

  return { entries, sortedEntries, isLoaded: true, getEntry, saveEntry, clearEntry };
}
