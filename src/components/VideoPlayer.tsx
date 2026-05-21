"use client";

import { motion, AnimatePresence } from "framer-motion";
import { GripHorizontal, FastForward } from "lucide-react";
import { useState, useEffect } from "react";
import { useHistory } from "@/hooks/useHistory";
import Link from "next/link";
import { Mirror } from "@/types/anime-api";

interface VideoPlayerProps {
  embedUrl: string;
  title: string;
  episodeSlug: string;
  episodeLabel: string;
  animeSlug: string;
  mirrors: Mirror[];
  nextEpisodeSlug?: string | null;
}

export default function VideoPlayer({ embedUrl, title, episodeSlug, episodeLabel, animeSlug, mirrors, nextEpisodeSlug }: VideoPlayerProps) {
  const [lightsOut, setLightsOut] = useState(false);
  const [selectedMirror, setSelectedMirror] = useState("default");
  const { saveHistory } = useHistory();
  const playableMirrors = mirrors.filter((mirror) => mirror.iframeUrl);
  const activeMirror = playableMirrors.find((mirror) => `${mirror.quality}-${mirror.mirrorIndex}` === selectedMirror);
  const activeEmbedUrl = activeMirror?.iframeUrl || embedUrl;

  useEffect(() => {
    saveHistory({ animeSlug, episodeSlug, episodeLabel, title });
  }, [animeSlug, episodeLabel, episodeSlug, saveHistory, title]);

  return (
    <>
      <AnimatePresence>
        {lightsOut && (
          <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             exit={{ opacity: 0 }}
             transition={{ duration: 0.8, ease: "easeInOut" }}
             className="fixed inset-0 bg-[#050505]/95 z-40 backdrop-blur-[2px]"
             onClick={() => setLightsOut(false)}
          />
        )}
      </AnimatePresence>

      <div className={`relative w-full ${lightsOut ? "z-50 ring-1 ring-white/10" : "z-10"} transition-all duration-700`}>
        {/* Floating Player Frame */}
        <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 glass-card bg-black flex flex-col relative group">
          
          {/* IFrame Embedded Control */}
          <iframe 
             src={activeEmbedUrl}
             className="w-full h-full border-none z-0 relative"
             allowFullScreen
             allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
             title={title}
          />

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
        {playableMirrors.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedMirror("default")}
              className={`rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${selectedMirror === "default" ? "border-indigo-400 bg-indigo-600 text-white" : "border-white/10 bg-zinc-900/70 text-zinc-400 hover:text-white"}`}
            >
              Default
            </button>
            {playableMirrors.map((mirror) => {
              const key = `${mirror.quality}-${mirror.mirrorIndex}`;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedMirror(key)}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold transition-colors ${selectedMirror === key ? "border-indigo-400 bg-indigo-600 text-white" : "border-white/10 bg-zinc-900/70 text-zinc-400 hover:text-white"}`}
                >
                  {mirror.quality} {mirror.host ? `- ${mirror.host}` : ""}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
