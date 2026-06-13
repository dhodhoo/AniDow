"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

import type { EpisodeResponse, Mirror } from "@/types/anime-api";

const VideoPlayer = dynamic(() => import("@/components/VideoPlayer"));

interface AnimeEpisodeLoaderProps {
  episodeSlug: string;
  animeSlug: string;
  episodeLabel: string;
  animeTitle: string;
  nextEpisodeSlug: string | null;
}

export default function AnimeEpisodeLoader({
  episodeSlug,
  animeSlug,
  episodeLabel,
  animeTitle,
  nextEpisodeSlug,
}: AnimeEpisodeLoaderProps) {
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [mirrors, setMirrors] = useState<Mirror[]>([]);
  const [error, setError] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setEmbedUrl(null);
    setMirrors([]);
    setError(false);

    fetch(`/api/anime-proxy/episode/${episodeSlug}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<EpisodeResponse>;
      })
      .then((data) => {
        if (controller.signal.aborted) return;
        const url =
          data.defaultIframe ||
          data.mirrors.find((m) => m.iframeUrl)?.iframeUrl ||
          "";
        setEmbedUrl(url);
        setMirrors(data.mirrors);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(true);
      });

    return () => controller.abort();
  }, [episodeSlug]);

  if (error) {
    return (
      <div className="glass-card flex aspect-video items-center justify-center rounded-2xl border border-white/10 text-zinc-500">
        Gagal memuat streaming mirror. Coba refresh halaman.
      </div>
    );
  }

  if (embedUrl === null) {
    return (
      <div className="w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-white/5 animate-pulse" />
    );
  }

  if (!embedUrl) {
    return (
      <div className="glass-card flex aspect-video items-center justify-center rounded-2xl border border-white/10 text-zinc-500">
        Streaming mirror tidak tersedia untuk episode ini.
      </div>
    );
  }

  return (
    <VideoPlayer
      key={episodeSlug}
      embedUrl={embedUrl}
      title={animeTitle}
      episodeSlug={episodeSlug}
      episodeLabel={episodeLabel}
      animeSlug={animeSlug}
      mirrors={mirrors}
      nextEpisodeSlug={nextEpisodeSlug}
    />
  );
}
