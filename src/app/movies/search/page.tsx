import Link from "next/link";
import { Suspense } from "react";

import MovieCard from "@/components/MovieCard";
import MovieSearchBar from "@/components/MovieSearchBar";
import { searchMovies, toMovieCardData } from "@/lib/movie-api";
import type { MovieSlimItem } from "@/types/movie-api";

export const dynamic = "force-dynamic";

const TYPE_FILTERS = [
  { value: "all", label: "Semua" },
  { value: "movie", label: "Film" },
  { value: "tv", label: "TV" },
] as const;

export default async function MovieSearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  const type = TYPE_FILTERS.some((f) => f.value === params.type) ? params.type! : "all";
  const page = Math.max(parseInt(params.page ?? "1", 10) || 1, 1);

  let results: MovieSlimItem[] = [];
  let hasMore = false;

  if (query) {
    try {
      const data = await searchMovies(query, type, page);
      results = data.items;
      hasMore = data.hasMore;
    } catch (error) {
      console.error("Movie search API error:", error);
    }
  }

  const buildHref = (overrides: { type?: string; page?: number }) => {
    const sp = new URLSearchParams({ q: query });
    const t = overrides.type ?? type;
    const p = overrides.page ?? 1;
    if (t !== "all") sp.set("type", t);
    if (p > 1) sp.set("page", String(p));
    return `/movies/search?${sp.toString()}`;
  };

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-5">
        <Suspense>
          <MovieSearchBar />
        </Suspense>

        {query && (
          <div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Hasil Pencarian: &quot;{query}&quot;</h1>
            <p className="text-zinc-400">Film dan serial TV dari katalog MovieBox</p>
          </div>
        )}

        {query && (
          <div className="flex gap-2">
            {TYPE_FILTERS.map((filter) => (
              <Link
                key={filter.value}
                href={buildHref({ type: filter.value })}
                className={`rounded-lg border px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                  filter.value === type
                    ? "border-amber-400/50 bg-amber-500/20 text-amber-300"
                    : "border-white/10 bg-zinc-900/60 text-zinc-400 hover:border-amber-400/30 hover:text-amber-200"
                }`}
              >
                {filter.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {!query ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <h2 className="text-2xl font-bold text-zinc-500">Mulai ketik untuk mencari film...</h2>
        </div>
      ) : results.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {results.map((item, index) => (
              <MovieCard key={`${item.subjectId}-${index}`} movie={toMovieCardData(item)} index={index} priority={index < 8} />
            ))}
          </div>

          <div className="flex items-center justify-center gap-3">
            {page > 1 && (
              <Link
                href={buildHref({ page: page - 1 })}
                className="rounded-full border border-white/10 bg-zinc-900/60 px-5 py-2.5 text-sm font-bold text-zinc-300 transition-colors hover:border-amber-400/30 hover:text-amber-200"
              >
                Sebelumnya
              </Link>
            )}
            <span className="text-sm font-semibold text-zinc-500">Halaman {page}</span>
            {hasMore && (
              <Link
                href={buildHref({ page: page + 1 })}
                className="rounded-full border border-white/10 bg-zinc-900/60 px-5 py-2.5 text-sm font-bold text-zinc-300 transition-colors hover:border-amber-400/30 hover:text-amber-200"
              >
                Berikutnya
              </Link>
            )}
          </div>
        </>
      ) : (
        <div className="flex items-center justify-center min-h-[40vh] border border-dashed border-zinc-800 rounded-3xl glass-card">
          <p className="text-zinc-400 text-lg">Tidak ada film yang cocok dengan kueri tersebut.</p>
        </div>
      )}
    </div>
  );
}
