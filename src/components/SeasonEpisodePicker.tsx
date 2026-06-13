"use client";

import Link from "next/link";
import { ChevronDown, Play } from "lucide-react";
import { useState } from "react";

import { MovieSeasonInfo } from "@/types/movie-api";

interface SeasonEpisodePickerProps {
  detailPath: string;
  subjectId: string;
  seasons: MovieSeasonInfo[];
}

export default function SeasonEpisodePicker({ detailPath, subjectId, seasons }: SeasonEpisodePickerProps) {
  const [activeSeason, setActiveSeason] = useState(seasons[0]?.season ?? 1);
  const [open, setOpen] = useState(false);

  const current = seasons.find((s) => s.season === activeSeason) ?? seasons[0];

  if (!current) return null;

  return (
    <section className="mt-2 border-t border-white/5 pt-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-white tracking-tight">Daftar Episode</h3>
          <p className="text-sm text-zinc-500">
            {current.episodes} episode · {current.resolutions.map((r) => `${r}p`).join(", ")}
          </p>
        </div>

        {seasons.length > 1 && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-900/70 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:border-amber-400/40"
            >
              Season {activeSeason}
              <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
              <div className="absolute right-0 top-full z-30 mt-2 max-h-64 w-40 overflow-y-auto rounded-xl border border-white/10 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-xl">
                {seasons.map((s) => (
                  <button
                    key={s.season}
                    type="button"
                    onClick={() => {
                      setActiveSeason(s.season);
                      setOpen(false);
                    }}
                    className={`block w-full rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
                      s.season === activeSeason
                        ? "bg-amber-500/20 text-amber-300"
                        : "text-zinc-300 hover:bg-zinc-800"
                    }`}
                  >
                    Season {s.season}
                    <span className="ml-2 text-xs text-zinc-500">{s.episodes} ep</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
        {Array.from({ length: current.episodes }, (_, i) => i + 1).map((episode) => (
          <Link
            key={episode}
            href={`/movies/${detailPath}/watch?id=${subjectId}&season=${current.season}&episode=${episode}`}
            className="glass-card group flex items-center justify-center gap-1.5 rounded-xl border border-white/5 py-3 text-sm font-bold text-zinc-200 transition-colors hover:border-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300"
          >
            <Play className="hidden h-3 w-3 fill-current sm:inline" />
            {episode}
          </Link>
        ))}
      </div>
    </section>
  );
}
