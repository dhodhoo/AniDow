import Link from "next/link";
import type { Metadata } from "next";

import MovieCard from "@/components/MovieCard";
import { browseMovies, isMovieApiConfigured, toMovieCardData } from "@/lib/movie-api";
import type { MovieBrowseResponse } from "@/types/movie-api";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Jelajahi Film & TV - AniDow",
  description: "Jelajahi katalog film dan serial TV berdasarkan genre, negara, dan tahun.",
};

const TYPE_TABS = [
  { value: "movie", label: "Film" },
  { value: "tv", label: "TV Series" },
] as const;

const SORT_LABELS: Record<string, string> = {
  ForYou: "Untukmu",
  Hottest: "Terpopuler",
  Latest: "Terbaru",
  Rating: "Rating",
};

interface BrowseSearchParams {
  type?: string;
  genre?: string;
  country?: string;
  year?: string;
  sort?: string;
}

export default async function MovieBrowsePage({
  searchParams,
}: {
  searchParams: Promise<BrowseSearchParams>;
}) {
  if (!isMovieApiConfigured()) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-center text-zinc-400">
        Layanan film belum dikonfigurasi.
      </div>
    );
  }

  const params = await searchParams;
  const type = params.type === "tv" ? "tv" : "movie";
  const genre = params.genre || "All";
  const country = params.country || "All";
  const year = params.year || "All";
  const sort = params.sort || "Hottest";

  let data: MovieBrowseResponse | null = null;
  try {
    data = await browseMovies({ type, genre, country, year, sort });
  } catch {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-center text-zinc-400">
        Layanan film sedang tidak dapat diakses. Coba lagi nanti.
      </div>
    );
  }

  const buildHref = (overrides: Partial<Record<keyof BrowseSearchParams, string>>) => {
    const next = {
      type,
      genre,
      country,
      year,
      sort,
      ...overrides,
    };
    const sp = new URLSearchParams();
    if (next.type !== "movie") sp.set("type", next.type);
    if (next.genre !== "All") sp.set("genre", next.genre);
    if (next.country !== "All") sp.set("country", next.country);
    if (next.year !== "All") sp.set("year", next.year);
    if (next.sort !== "Hottest") sp.set("sort", next.sort);
    const qs = sp.toString();
    return `/movies/browse${qs ? `?${qs}` : ""}`;
  };

  const genres = data.filters.genre ?? [];
  const countries = data.filters.country ?? [];
  const years = data.filters.year ?? [];
  const sorts = data.filters.sort ?? ["Hottest", "Latest", "Rating"];

  return (
    <div className="flex flex-col gap-6 pb-12 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Jelajahi Film & TV</h1>
        <p className="text-zinc-400">Temukan tontonan berdasarkan genre, negara, dan tahun rilis.</p>
      </div>

      {/* Tab tipe */}
      <div className="flex gap-2">
        {TYPE_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildHref({ type: tab.value, genre: "All" })}
            className={`rounded-xl border px-5 py-2.5 text-sm font-bold transition-colors ${
              tab.value === type
                ? "border-amber-400/50 bg-amber-500/20 text-amber-300"
                : "border-white/10 bg-zinc-900/60 text-zinc-400 hover:border-amber-400/30 hover:text-amber-200"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Filter genre */}
      <FilterRow label="Genre" options={genres} active={genre} buildHref={(v) => buildHref({ genre: v })} />
      {/* Filter negara */}
      <FilterRow label="Negara" options={countries} active={country} buildHref={(v) => buildHref({ country: v })} />
      {/* Filter tahun */}
      <FilterRow label="Tahun" options={years} active={year} buildHref={(v) => buildHref({ year: v })} />

      {/* Sort */}
      <div className="flex items-center gap-2 border-t border-white/5 pt-5">
        <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-zinc-500">Urutkan</span>
        <div className="flex flex-wrap gap-1.5">
          {sorts.map((s) => (
            <Link
              key={s}
              href={buildHref({ sort: s })}
              className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors ${
                s === sort
                  ? "border-amber-400/50 bg-amber-500/20 text-amber-300"
                  : "border-white/10 bg-zinc-900/60 text-zinc-400 hover:border-amber-400/30 hover:text-amber-200"
              }`}
            >
              {SORT_LABELS[s] ?? s}
            </Link>
          ))}
        </div>
      </div>

      {/* Hasil */}
      {data.items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {data.items.map((item, index) => (
            <MovieCard key={`${item.subjectId}-${index}`} movie={toMovieCardData(item)} index={index} priority={index < 8} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[40vh] border border-dashed border-zinc-800 rounded-3xl glass-card">
          <p className="text-zinc-400 text-lg">Tidak ada hasil untuk kombinasi filter ini.</p>
        </div>
      )}
    </div>
  );
}

function FilterRow({
  label,
  options,
  active,
  buildHref,
}: {
  label: string;
  options: string[];
  active: string;
  buildHref: (value: string) => string;
}) {
  if (options.length === 0) return null;

  return (
    <div className="flex items-start gap-2">
      <span className="shrink-0 pt-1.5 text-xs font-bold uppercase tracking-wider text-zinc-500 w-14">{label}</span>
      <div className="flex gap-1.5 overflow-x-auto pb-1.5 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible">
        {options.map((option) => (
          <Link
            key={option}
            href={buildHref(option)}
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              option === active
                ? "border-amber-400/50 bg-amber-500/20 text-amber-300"
                : "border-white/10 bg-zinc-900/60 text-zinc-400 hover:border-amber-400/30 hover:text-amber-200"
            }`}
          >
            {option === "All" ? "Semua" : option}
          </Link>
        ))}
      </div>
    </div>
  );
}
