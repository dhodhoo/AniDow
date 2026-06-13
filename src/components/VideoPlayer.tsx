"use client";

import { GripHorizontal, FastForward, AlertTriangle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useHistory } from "@/hooks/useHistory";
import Link from "next/link";
import { Mirror } from "@/types/anime-api";

// Domain mirror video yang dikenal (allowlist untuk iframe src)
const ALLOWED_IFRAME_HOSTS = new Set([
  "otakudesu.blog",
  "www.otakudesu.blog",
  "desustream.live",
  "www.desustream.live",
  "miku-miku.my.id",
  "www.miku-miku.my.id",
  "filenara.my.id",
  "www.filenara.my.id",
  "lendrive.my.id",
  "www.lendrive.my.id",
  "media-phi.vercel.app",
  "vidhide.com",
  "www.vidhide.com",
  "vidhidepro.com",
  "www.vidhidepro.com",
  "vidhidevip.com",
  "www.vidhidevip.com",
  "vidstream.pro",
  "www.vidstream.pro",
  "streamtape.com",
  "www.streamtape.com",
  "filemoon.sx",
  "www.filemoon.sx",
  "voe.sx",
  "www.voe.sx",
]);

// Private/internal IP prefix yang diblokir
const BLOCKED_URL_PATTERNS = [
  /^https?:\/\/localhost[:\/]/i,
  /^https?:\/\/127\.\d+\.\d+\.\d+/i,
  /^https?:\/\/10\.\d+\.\d+\.\d+/i,
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+/i,
  /^https?:\/\/192\.168\.\d+\.\d+/i,
  /^https?:\/\/169\.254\.\d+\.\d+/i,
  /^https?:\/\/\[::1\]/i,
  /^https?:\/\/0\.0\.0\.0/i,
];

function isValidIframeUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;

  // Hanya izinkan HTTPS
  if (!url.startsWith("https://")) return false;

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  // Blokir private/internal IP
  for (const pattern of BLOCKED_URL_PATTERNS) {
    if (pattern.test(url)) return false;
  }

  // Hostname harus ada di allowlist
  if (!ALLOWED_IFRAME_HOSTS.has(parsed.hostname)) {
    // Log untuk monitoring — host baru mungkin perlu ditambahkan
    if (process.env.NODE_ENV === "development") {
      console.warn("[VideoPlayer] Unknown iframe host:", parsed.hostname);
    }
    // Untuk production, kita tetap izinkan host baru tapi log warning
    // Agar tidak break fitur. Bisa diubah ke return false kalau mau ketat.
  }

  return true;
}

interface VideoPlayerProps {
  embedUrl: string;
  title: string;
  episodeSlug: string;
  episodeLabel: string;
  animeSlug: string;
  mirrors: Mirror[];
  nextEpisodeSlug?: string | null;
}

export default function VideoPlayer({ embedUrl, title, episodeSlug, episodeLabel, animeSlug, mirrors: initialMirrors, nextEpisodeSlug }: VideoPlayerProps) {
  const [lightsOut, setLightsOut] = useState(false);
  const [selectedMirror, setSelectedMirror] = useState("default");
  const [mirrors, setMirrors] = useState<Mirror[]>(initialMirrors);
  const [resolvingMirror, setResolvingMirror] = useState<string | null>(null);
  const { saveHistory } = useHistory();

  // Key unik per mirror: gabungan quality + mirrorIndex + host
  const mirrorKey = (m: Mirror) => `${m.quality}-${m.mirrorIndex}-${m.host ?? ""}`;

  // Semua mirror — yang sudah resolve + yang belum
  const allMirrors = mirrors;
  // Hanya yang sudah punya iframeUrl (playable)
  const playableMirrors = mirrors.filter((mirror) => mirror.iframeUrl);
  // activeMirror: cari berdasarkan key unik (quality+mirrorIndex+host)
  const activeMirror = mirrors.find((mirror) => mirror.iframeUrl && mirrorKey(mirror) === selectedMirror);
  const rawEmbedUrl = activeMirror?.iframeUrl || embedUrl;
  const activeEmbedUrl = useMemo(() => isValidIframeUrl(rawEmbedUrl) ? rawEmbedUrl : null, [rawEmbedUrl]);
  const iframeValid = activeEmbedUrl !== null;


  // Lazy resolve mirror yang belum di-resolve saat diklik
  const handleMirrorClick = async (mirror: Mirror) => {
    const key = mirrorKey(mirror);
    // Kalau sudah resolved, langsung pilih
    if (mirror.iframeUrl) {
      setSelectedMirror(key);
      return;
    }
    // Belum resolve — fetch on-demand
    setResolvingMirror(key);
    try {
      const q = encodeURIComponent(mirror.quality ?? "");
      const res = await fetch(`/api/anime-proxy/mirror/${episodeSlug}/${mirror.mirrorIndex}?q=${q}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json() as { data: Mirror };
      const resolved = json.data;
      // Update mirror yang match quality + mirrorIndex + host
      setMirrors((prev) =>
        prev.map((m) =>
          mirrorKey(m) === key ? { ...m, ...resolved } : m
        )
      );
      setSelectedMirror(key);
    } catch {
      setSelectedMirror(key);
    } finally {
      setResolvingMirror(null);
    }
  };

  useEffect(() => {
    saveHistory({ animeSlug, episodeSlug, episodeLabel, title });
  }, [animeSlug, episodeLabel, episodeSlug, saveHistory, title]);

  return (
    <>
      {/* Lights Out CSS-based Overlay */}
      <div
         className={`fixed inset-0 bg-[#050505]/95 z-40 backdrop-blur-[2px] transition-opacity duration-700 ease-in-out ${
           lightsOut ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
         }`}
         onClick={() => setLightsOut(false)}
      />

      <div className={`relative w-full ${lightsOut ? "z-50 ring-1 ring-white/10" : "z-10"} transition-all duration-700`}>
        {/* Floating Player Frame */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 glass-card bg-black flex flex-col relative group">

          {/* IFrame Embedded Control */}
          {iframeValid ? (
            <iframe
               src={activeEmbedUrl!}
               className="w-full h-full border-none z-0 relative"
               allowFullScreen
               allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
               title={title}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-500 bg-zinc-950">
              <AlertTriangle className="w-10 h-10 text-amber-500" />
              <p className="text-sm font-medium">Sumber video tidak valid atau tidak didukung.</p>
              {playableMirrors.length > 0 && (
                <p className="text-xs text-zinc-600">Coba pilih mirror lain di bawah.</p>
              )}
            </div>
          )}

          {/* Cinematic Overlay Title */}
          <div className="absolute top-0 w-full p-4 lg:p-6 bg-gradient-to-b from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none flex justify-between z-20">
            <h2 className="text-white font-bold tracking-tight text-sm md:text-xl drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
               {title} - {episodeLabel}
            </h2>
          </div>

          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-center gap-2 lg:gap-3">
             {nextEpisodeSlug && (
               <Link href={`/watch/${nextEpisodeSlug}`} scroll={false}>
                 <button className="flex items-center gap-1.5 lg:gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-3 lg:px-4 py-2 rounded-xl text-[10px] lg:text-xs font-bold transition-all border border-white/20 shadow-lg">
                    <FastForward className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                    <span className="hidden sm:inline">Episode Selanjutnya</span>
                    <span className="sm:hidden">Lanjut</span>
                 </button>
               </Link>
             )}
             <button
                onClick={() => setLightsOut(!lightsOut)}
                className={`flex items-center gap-1.5 lg:gap-2 backdrop-blur-md px-3 lg:px-4 py-2 rounded-xl text-[10px] lg:text-xs font-bold transition-all border shadow-xl ${lightsOut ? "bg-indigo-600/90 hover:bg-indigo-500 border-indigo-400/50 text-white" : "bg-zinc-900/80 hover:bg-zinc-800 border-white/10 text-zinc-300"}`}
             >
                <GripHorizontal className={`w-3 h-3 lg:w-4 lg:h-4 ${lightsOut ? "text-indigo-200" : "text-indigo-400"}`} />
                <span className="hidden sm:inline">{lightsOut ? "Nyalakan Lampu" : "Lights Out"}</span>
             </button>
          </div>
        </div>
        {allMirrors.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedMirror("default")}
              className={`rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${selectedMirror === "default" ? "border-indigo-400 bg-indigo-600 text-white" : "border-white/10 bg-zinc-900/70 text-zinc-400 hover:text-white"}`}
            >
              Default
            </button>
            {allMirrors.map((mirror) => {
              const key = mirrorKey(mirror);
              const isResolving = resolvingMirror === key;
              const isUnresolved = !mirror.iframeUrl;
              return (
                <button
                  key={key}
                  onClick={() => handleMirrorClick(mirror)}
                  disabled={isResolving}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${
                    selectedMirror === key
                      ? "border-indigo-400 bg-indigo-600 text-white"
                      : isUnresolved
                      ? "border-white/5 bg-zinc-900/40 text-zinc-600 hover:text-zinc-300 hover:border-white/10"
                      : "border-white/10 bg-zinc-900/70 text-zinc-400 hover:text-white"
                  }`}
                >
                  {isResolving ? "..." : `${mirror.quality}${mirror.host ? ` - ${mirror.host}` : ""}`}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
