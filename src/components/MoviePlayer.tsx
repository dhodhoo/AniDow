"use client";

import { Captions, Loader2, RefreshCw, SkipForward } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useContinueWatching } from "@/hooks/useContinueWatching";
import { formatFileSize } from "@/lib/movie-api";
import type {
  MovieDownloadEntry,
  MovieFilesResponse,
  MovieSubjectType,
} from "@/types/movie-api";

interface MoviePlayerProps {
  initialFiles: MovieFilesResponse; // URL media sudah absolut
  title: string;
  cover: string;
  subjectId: string;
  detailPath: string;
  subjectType: MovieSubjectType;
  season: number | null;
  episode: number | null;
  nextEpisodeHref?: string | null;
}

interface SubtitleTrack {
  lan: string;
  label: string;
  blobUrl: string;
}

function getExpiry(url: string): number {
  try {
    const exp = new URL(url).searchParams.get("exp");
    return exp ? parseInt(exp, 10) * 1000 : 0;
  } catch {
    return 0;
  }
}

function isExpiringSoon(url: string, thresholdMs = 30 * 60 * 1000) {
  const exp = getExpiry(url);
  return exp > 0 && exp - Date.now() < thresholdMs;
}

// Konversi SRT ke WebVTT (browser hanya terima VTT di <track>)
async function srtToVttBlobUrl(srtUrl: string): Promise<string> {
  const res = await fetch(srtUrl);
  if (!res.ok) throw new Error(`Subtitle HTTP ${res.status}`);
  const srt = await res.text();
  const vtt = "WEBVTT\n\n" + srt.replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, "$1.$2");
  return URL.createObjectURL(new Blob([vtt], { type: "text/vtt" }));
}

export default function MoviePlayer({
  initialFiles,
  title,
  cover,
  subjectId,
  detailPath,
  subjectType,
  season,
  episode,
  nextEpisodeHref,
}: MoviePlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const resumeAppliedRef = useRef(false);
  const lastSaveRef = useRef(0);
  const refreshingRef = useRef(false);

  const [files, setFiles] = useState(initialFiles);
  const [activeResolution, setActiveResolution] = useState(initialFiles.downloads[0]?.resolution ?? 0);
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [fatalError, setFatalError] = useState<string | null>(null);

  const { getEntry, saveEntry } = useContinueWatching();

  const activeDownload = useMemo(
    () => files.downloads.find((d) => d.resolution === activeResolution) ?? files.downloads[0],
    [files, activeResolution]
  );

  // Konversi semua subtitle SRT -> VTT blob URL
  useEffect(() => {
    let cancelled = false;
    const blobUrls: string[] = [];

    (async () => {
      const tracks: SubtitleTrack[] = [];
      for (const sub of files.subtitles) {
        try {
          const blobUrl = await srtToVttBlobUrl(sub.subtitle_url);
          blobUrls.push(blobUrl);
          tracks.push({ lan: sub.lan, label: sub.lanName, blobUrl });
        } catch {
          // subtitle gagal dimuat — lewati
        }
        if (cancelled) break;
      }
      if (!cancelled) {
        setSubtitleTracks(tracks);
        setActiveSubtitle((prev) => {
          if (prev !== null && tracks.some((t) => t.lan === prev)) return prev;
          const preferred = tracks.find((t) => t.lan === "id") ?? tracks[0];
          return preferred?.lan ?? null;
        });
      }
    })();

    return () => {
      cancelled = true;
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files.subtitles]);

  const fetchFreshFiles = useCallback(async (): Promise<MovieFilesResponse> => {
    const path = subjectType === "tv_series"
      ? `/api/movie-proxy/series/files?subjectId=${encodeURIComponent(subjectId)}&detailPath=${encodeURIComponent(detailPath)}&season=${season}&episode=${episode}`
      : `/api/movie-proxy/movie/files?subjectId=${encodeURIComponent(subjectId)}&detailPath=${encodeURIComponent(detailPath)}`;
    const res = await fetch(path);
    if (!res.ok) {
      const body = await res.json().catch(() => null);
      throw new Error(body?.error ?? `HTTP ${res.status}`);
    }
    return res.json();
  }, [subjectId, detailPath, subjectType, season, episode]);

  const applySource = useCallback((url: string, position: number, shouldPlay: boolean) => {
    const video = videoRef.current;
    if (!video) return;

    video.src = url;
    const restore = () => {
      if (position > 0) video.currentTime = position;
      if (shouldPlay) video.play().catch(() => {});
      video.removeEventListener("loadedmetadata", restore);
    };
    video.addEventListener("loadedmetadata", restore);
    video.load();
  }, []);

  // Refresh link (expired) sambil pertahankan posisi
  const refreshFiles = useCallback(async () => {
    if (refreshingRef.current) return;
    refreshingRef.current = true;
    setRefreshing(true);

    const video = videoRef.current;
    const position = video?.currentTime ?? 0;
    const wasPlaying = video ? !video.paused : false;

    try {
      const fresh = await fetchFreshFiles();
      setFiles(fresh);
      const next = fresh.downloads.find((d) => d.resolution === activeResolution) ?? fresh.downloads[0];
      if (!next) throw new Error("Tidak ada sumber video.");
      setActiveResolution(next.resolution);
      applySource(next.stream_url, position, wasPlaying);
      setFatalError(null);
    } catch (error) {
      setFatalError(error instanceof Error ? error.message : "Gagal memuat ulang video.");
    } finally {
      refreshingRef.current = false;
      setRefreshing(false);
    }
  }, [fetchFreshFiles, activeResolution, applySource]);

  // Pasang sumber awal + pre-check expiry
  useEffect(() => {
    if (!activeDownload) {
      setFatalError("Tidak ada sumber video tersedia.");
      return;
    }
    if (isExpiringSoon(activeDownload.stream_url)) {
      refreshFiles();
      return;
    }
    const video = videoRef.current;
    if (video && !video.src) {
      video.src = activeDownload.stream_url;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const switchQuality = useCallback((download: MovieDownloadEntry) => {
    const video = videoRef.current;
    if (!video || download.resolution === activeResolution) return;

    if (isExpiringSoon(download.stream_url)) {
      setActiveResolution(download.resolution);
      refreshFiles();
      return;
    }

    const position = video.currentTime;
    const wasPlaying = !video.paused;
    setActiveResolution(download.resolution);
    applySource(download.stream_url, position, wasPlaying);
  }, [activeResolution, applySource, refreshFiles]);

  // Resume dari continue watching
  const handleLoadedMetadata = useCallback(() => {
    if (resumeAppliedRef.current) return;
    resumeAppliedRef.current = true;

    const video = videoRef.current;
    if (!video) return;
    const saved = getEntry(subjectId, season, episode);
    if (saved && saved.position > 5 && saved.position < video.duration - 60) {
      video.currentTime = saved.position;
    }
  }, [getEntry, subjectId, season, episode]);

  // Simpan progress tiap 10 detik
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.paused || !video.duration) return;

    const now = Date.now();
    if (now - lastSaveRef.current < 10_000) return;
    lastSaveRef.current = now;

    saveEntry({
      subjectId,
      detailPath,
      title,
      cover,
      subjectType,
      season,
      episode,
      position: video.currentTime,
      duration: video.duration,
    });
  }, [saveEntry, subjectId, detailPath, title, cover, subjectType, season, episode]);

  // Error video — kemungkinan link expired (403) → re-fetch
  const handleError = useCallback(() => {
    const video = videoRef.current;
    if (!video?.src) return;
    refreshFiles();
  }, [refreshFiles]);

  if (files.downloads.length === 0) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-white/5 bg-zinc-950 text-zinc-500">
        Video tidak tersedia untuk konten ini.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative w-full overflow-hidden rounded-2xl border border-white/5 bg-black shadow-[0_0_40px_rgba(0,0,0,0.8)]">
        <video
          ref={videoRef}
          className="aspect-video w-full bg-black"
          controls
          playsInline
          crossOrigin="anonymous"
          poster={cover || undefined}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          onError={handleError}
        >
          {subtitleTracks
            .filter((track) => track.lan === activeSubtitle)
            .map((track) => (
              <track
                key={track.lan}
                kind="subtitles"
                label={track.label}
                srcLang={track.lan}
                src={track.blobUrl}
                default
              />
            ))}
        </video>

        {refreshing && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-black/70 backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
            <p className="text-sm font-semibold text-zinc-200">Memperbarui tautan video...</p>
          </div>
        )}

        {fatalError && !refreshing && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black/80 backdrop-blur-sm px-6 text-center">
            <p className="text-sm text-zinc-300">{fatalError}</p>
            <button
              type="button"
              onClick={refreshFiles}
              className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105"
            >
              <RefreshCw className="h-4 w-4" />
              Coba Lagi
            </button>
          </div>
        )}
      </div>

      <div className="glass-card flex flex-col gap-4 rounded-2xl border border-white/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Kualitas</span>
          {files.downloads.map((download) => (
            <button
              key={download.resolution}
              type="button"
              onClick={() => switchQuality(download)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                download.resolution === activeResolution
                  ? "border-amber-400/50 bg-amber-500/20 text-amber-300"
                  : "border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-amber-400/30 hover:text-amber-200"
              }`}
              title={formatFileSize(download.size)}
            >
              {download.resolution}p
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-zinc-500">
            <Captions className="h-4 w-4" />
            Subtitle
          </span>
          <button
            type="button"
            onClick={() => setActiveSubtitle(null)}
            className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
              activeSubtitle === null
                ? "border-amber-400/50 bg-amber-500/20 text-amber-300"
                : "border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-amber-400/30 hover:text-amber-200"
            }`}
          >
            Off
          </button>
          {subtitleTracks.map((track) => (
            <button
              key={track.lan}
              type="button"
              onClick={() => setActiveSubtitle(track.lan)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                track.lan === activeSubtitle
                  ? "border-amber-400/50 bg-amber-500/20 text-amber-300"
                  : "border-white/10 bg-zinc-900/60 text-zinc-300 hover:border-amber-400/30 hover:text-amber-200"
              }`}
            >
              {track.label}
            </button>
          ))}
        </div>

        {nextEpisodeHref && (
          <Link
            href={nextEpisodeHref}
            className="flex shrink-0 items-center justify-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-transform hover:scale-105 active:scale-95"
          >
            Episode Berikutnya
            <SkipForward className="h-4 w-4 fill-black" />
          </Link>
        )}
      </div>

      {files.limited && (
        <p className="text-xs text-zinc-500">
          Sebagian kualitas dibatasi oleh sumber. Pilihan resolusi mungkin tidak lengkap.
        </p>
      )}
    </div>
  );
}
