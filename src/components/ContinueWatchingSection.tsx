"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, X } from "lucide-react";

import { useContinueWatching } from "@/hooks/useContinueWatching";
import { formatDuration } from "@/lib/movie-api";

export default function ContinueWatchingSection() {
  const { sortedEntries, isLoaded, clearEntry } = useContinueWatching();

  if (!isLoaded || sortedEntries.length === 0) return null;

  return (
    <section className="mt-8 sm:mt-10">
      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1.5 sm:mb-2">
        Lanjutkan Menonton
      </h2>
      <p className="text-sm text-zinc-400 mb-4 sm:mb-6">Teruskan dari posisi terakhir kamu.</p>

      <div className="overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="flex snap-x snap-mandatory gap-4 md:gap-6">
          {sortedEntries.map((entry) => {
            const progress = entry.duration > 0 ? Math.min((entry.position / entry.duration) * 100, 100) : 0;
            const watchHref = entry.subjectType === "tv_series"
              ? `/movies/${entry.detailPath}/watch?id=${entry.subjectId}&season=${entry.season ?? 1}&episode=${entry.episode ?? 1}`
              : `/movies/${entry.detailPath}/watch?id=${entry.subjectId}`;

            return (
              <div
                key={`${entry.subjectId}-${entry.season}-${entry.episode}`}
                className="relative w-[65%] shrink-0 snap-start sm:w-[42%] md:w-[30%] lg:w-[24%]"
              >
                <Link href={watchHref} prefetch={false}>
                  <div className="glass-card group relative overflow-hidden rounded-2xl border border-white/5 transition-all duration-300 hover:border-amber-400/40">
                    <div className="relative aspect-video w-full bg-zinc-900">
                      {entry.cover && (
                        <Image
                          src={entry.cover}
                          alt={entry.title}
                          fill
                          sizes="(max-width: 768px) 65vw, 24vw"
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                          unoptimized
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <span className="rounded-full bg-white p-3 shadow-2xl">
                          <Play className="h-5 w-5 fill-black text-black" />
                        </span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                        <div className="h-full bg-amber-400" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="line-clamp-1 text-sm font-bold text-zinc-100 group-hover:text-amber-400 transition-colors">
                        {entry.title}
                      </h3>
                      <p className="mt-1 text-[11px] text-zinc-400">
                        {entry.subjectType === "tv_series" && entry.season != null
                          ? `S${entry.season} E${entry.episode} · `
                          : ""}
                        {formatDuration(Math.floor(entry.position))} / {formatDuration(Math.floor(entry.duration))}
                      </p>
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  aria-label="Hapus dari lanjutkan menonton"
                  onClick={() => clearEntry(entry.subjectId, entry.season, entry.episode)}
                  className="absolute right-2 top-2 z-20 rounded-full border border-white/10 bg-black/60 p-1.5 text-zinc-300 backdrop-blur-md transition-colors hover:bg-red-500/80 hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
