"use client";

import { EpisodeListItem, EpisodeRef } from "@/types/anime-api";
import Link from "next/link";
import { PlayCircle } from "lucide-react";

interface EpisodeListProps {
  episodes: Array<EpisodeRef | EpisodeListItem>;
  currentEpisodeSlug: string;
}

function getEpisodeLabel(ep: EpisodeRef | EpisodeListItem) {
  if ("label" in ep) return ep.label;
  return ep.episode ? `Episode ${ep.episode}` : ep.title;
}

export default function EpisodeList({ episodes, currentEpisodeSlug }: EpisodeListProps) {
  return (
    <div className="flex flex-col h-full bg-[#0a0a0a]/60 glass-card rounded-2xl border border-white/5 overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
       <div className="p-3 sm:p-4 border-b border-white/5 bg-[#050505]/40 backdrop-blur-md shrink-0">
          <h3 className="text-lg font-bold tracking-tight text-zinc-100">Daftar Tayang</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{episodes.length} Episodes Tersedia</p>
       </div>

       {/* Tailwind Thin scrollbar inject rules */}
       <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2
                       [&::-webkit-scrollbar]:w-1.5
                       [&::-webkit-scrollbar-track]:bg-transparent
                       [&::-webkit-scrollbar-thumb]:bg-zinc-800
                       [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600 transition-colors">
          {episodes.map((ep, i) => {
            const isActive = ep.slug === currentEpisodeSlug;
            return (
              <Link key={ep.slug} href={`/watch/${ep.slug}`} scroll={false} prefetch={false}>
                <div
                   className={`flex items-center gap-3 p-2.5 sm:p-3 rounded-xl cursor-pointer transition-all duration-300 border animate-slide-left opacity-0 ${
                    isActive
                      ? "bg-indigo-600/10 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
                      : "bg-[#111] border-transparent hover:bg-zinc-800/80 hover:border-zinc-700/50"
                  }`}
                  style={{
                    animationDelay: `${Math.min(i * 0.02, 0.4)}s`,
                    animationFillMode: "forwards"
                  }}
                >
                  <div className={`flex items-center justify-center shrink-0 w-8 h-8 rounded-lg ${isActive ? "bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.5)]" : "bg-zinc-900 text-zinc-500 font-medium"}`}>
                    <span className="text-xs">{"episode" in ep ? ep.episode || i + 1 : i + 1}</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-zinc-400"}`}>
                      {getEpisodeLabel(ep)}
                    </span>
                    {isActive && <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold mt-0.5 animate-pulse">Sedang Putar</span>}
                  </div>
                  {isActive && <PlayCircle className="w-5 h-5 ml-auto text-indigo-400" />}
                </div>
              </Link>
            );
          })}
       </div>
    </div>
  );
}
