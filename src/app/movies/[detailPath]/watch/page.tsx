import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import dynamicImport from "next/dynamic";

import {
  absolutizeFiles,
  getMovieDetails,
  getMovieFiles,
  getSeriesEpisodes,
  getSeriesFiles,
} from "@/lib/movie-api";

const MoviePlayer = dynamicImport(
  () => import("@/components/MoviePlayer"),
  { loading: () => <div className="aspect-video w-full animate-pulse rounded-2xl bg-zinc-900" /> }
);
import type {
  MovieDetailsResponse,
  MovieFilesResponse,
  MovieSeriesEpisodesResponse,
} from "@/types/movie-api";

// stream_url kadaluarsa 6 jam — jangan pernah cache halaman ini
export const dynamic = "force-dynamic";

interface WatchSearchParams {
  id?: string;
  season?: string;
  episode?: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ detailPath: string }>;
}): Promise<Metadata> {
  const { detailPath } = await params;
  try {
    const details = await getMovieDetails(decodeURIComponent(detailPath));
    return { title: `Nonton ${details.title} - AniDow Film` };
  } catch {
    return { title: "Nonton Film - AniDow" };
  }
}

export default async function MovieWatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ detailPath: string }>;
  searchParams: Promise<WatchSearchParams>;
}) {
  const [{ detailPath: rawDetailPath }, search] = await Promise.all([params, searchParams]);
  const detailPath = decodeURIComponent(rawDetailPath);
  const season = search.season ? parseInt(search.season, 10) : null;
  const episode = search.episode ? parseInt(search.episode, 10) : null;

  let details: MovieDetailsResponse | null = null;
  try {
    details = await getMovieDetails(detailPath);
  } catch (error) {
    console.error("Failed to load movie details", error);
  }

  if (!details) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl text-zinc-500">Film tidak ditemukan atau terjadi kesalahan server.</h1>
      </div>
    );
  }

  const subjectId = search.id || details.subjectId;
  const isTv = details.subjectType === "tv_series";

  let files: MovieFilesResponse | null = null;
  let filesError: string | null = null;
  let seriesData: MovieSeriesEpisodesResponse | null = null;

  try {
    if (isTv) {
      const s = season ?? 1;
      const e = episode ?? 1;
      [files, seriesData] = await Promise.all([
        getSeriesFiles(subjectId, detailPath, s, e),
        getSeriesEpisodes(detailPath).catch(() => null),
      ]);
    } else {
      files = await getMovieFiles(subjectId, detailPath);
    }
  } catch (error) {
    filesError = error instanceof Error ? error.message : "Gagal memuat sumber video.";
  }

  // Hitung link episode berikutnya untuk TV
  let nextEpisodeHref: string | null = null;
  if (isTv && seriesData) {
    const s = season ?? 1;
    const e = episode ?? 1;
    const currentSeason = seriesData.seasons.find((x) => x.season === s);
    if (currentSeason && e < currentSeason.episodes) {
      nextEpisodeHref = `/movies/${detailPath}/watch?id=${subjectId}&season=${s}&episode=${e + 1}`;
    } else {
      const nextSeason = seriesData.seasons
        .filter((x) => x.season > s)
        .sort((a, b) => a.season - b.season)[0];
      if (nextSeason) {
        nextEpisodeHref = `/movies/${detailPath}/watch?id=${subjectId}&season=${nextSeason.season}&episode=1`;
      }
    }
  }

  const episodeLabel = isTv ? ` — S${season ?? 1} E${episode ?? 1}` : "";

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <Link
          href={`/movies/${detailPath}?id=${subjectId}`}
          className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-amber-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Detail
        </Link>
        <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter">
          {details.title}
          <span className="text-zinc-500">{episodeLabel}</span>
        </h1>
      </div>

      {files ? (
        <MoviePlayer
          initialFiles={absolutizeFiles(files)}
          title={details.title}
          cover={details.cover ?? ""}
          subjectId={subjectId}
          detailPath={detailPath}
          subjectType={details.subjectType}
          season={isTv ? season ?? 1 : null}
          episode={isTv ? episode ?? 1 : null}
          nextEpisodeHref={nextEpisodeHref}
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-2xl border border-white/5 bg-zinc-950 px-6 text-center text-zinc-400">
          {filesError ?? "Video tidak tersedia untuk konten ini."}
        </div>
      )}

      {isTv && seriesData && (
        <section className="glass-card rounded-2xl border border-white/5 p-5">
          <h2 className="mb-4 text-lg font-bold text-white">Episode Lain</h2>
          <div className="flex flex-col gap-4">
            {seriesData.seasons.map((s) => (
              <div key={s.season}>
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">Season {s.season}</p>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
                  {Array.from({ length: s.episodes }, (_, i) => i + 1).map((ep) => {
                    const isActive = s.season === (season ?? 1) && ep === (episode ?? 1);
                    return (
                      <Link
                        key={ep}
                        href={`/movies/${detailPath}/watch?id=${subjectId}&season=${s.season}&episode=${ep}`}
                        prefetch={false}
                        className={`flex items-center justify-center rounded-lg border py-2 text-xs font-bold transition-colors ${
                          isActive
                            ? "border-amber-400/50 bg-amber-500/20 text-amber-300"
                            : "border-white/5 bg-zinc-900/60 text-zinc-300 hover:border-amber-400/30 hover:text-amber-200"
                        }`}
                      >
                        {ep}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
