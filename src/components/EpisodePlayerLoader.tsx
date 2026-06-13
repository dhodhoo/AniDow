"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import { absolutizeFiles } from "@/lib/movie-api";
import type { MovieFilesResponse, MovieSubjectType } from "@/types/movie-api";

const MoviePlayer = dynamic(() => import("@/components/MoviePlayer"), {
  loading: () => <div className="aspect-video w-full animate-pulse rounded-2xl bg-zinc-900" />,
});

interface EpisodePlayerLoaderProps {
  subjectId: string;
  detailPath: string;
  season: number;
  episode: number;
  title: string;
  cover: string;
  subjectType: MovieSubjectType;
  nextEpisodeHref?: string | null;
}

export default function EpisodePlayerLoader({
  subjectId,
  detailPath,
  season,
  episode,
  title,
  cover,
  subjectType,
  nextEpisodeHref,
}: EpisodePlayerLoaderProps) {
  const [files, setFiles] = useState<MovieFilesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setFiles(null);
    setError(null);

    const params = new URLSearchParams({
      subjectId,
      detailPath,
      season: String(season),
      episode: String(episode),
    });

    fetch(`/api/movie-proxy/series/files?${params}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: MovieFilesResponse) => {
        if (!controller.signal.aborted) {
          setFiles(absolutizeFiles(data));
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err instanceof Error ? err.message : "Gagal memuat sumber video.");
        }
      });

    return () => controller.abort();
  }, [subjectId, detailPath, season, episode]);

  if (error) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-white/5 bg-zinc-950 px-6 text-center text-zinc-400">
        {error}
      </div>
    );
  }

  if (!files) {
    return <div className="aspect-video w-full animate-pulse rounded-2xl bg-zinc-900" />;
  }

  return (
    <MoviePlayer
      initialFiles={files}
      title={title}
      cover={cover}
      subjectId={subjectId}
      detailPath={detailPath}
      subjectType={subjectType}
      season={season}
      episode={episode}
      nextEpisodeHref={nextEpisodeHref}
    />
  );
}
