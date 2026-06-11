import Image from "next/image";
import Link from "next/link";
import { Calendar, Clapperboard, Clock, Globe, Play, Star, Tv } from "lucide-react";
import type { Metadata } from "next";
import dynamic from "next/dynamic";

import MovieCard from "@/components/MovieCard";
import SeasonEpisodePicker from "@/components/SeasonEpisodePicker";
import {
  formatDuration,
  getMovieDetails,
  getRelated,
  getSeriesEpisodes,
  toMovieCardData,
} from "@/lib/movie-api";
import type {
  MovieDetailsResponse,
  MovieSeriesEpisodesResponse,
  MovieSlimItem,
} from "@/types/movie-api";

const MovieWatchlistButton = dynamic(() => import("@/components/MovieWatchlistButton"));

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ detailPath: string }>;
}): Promise<Metadata> {
  const { detailPath } = await params;
  try {
    const details = await getMovieDetails(decodeURIComponent(detailPath));
    const synopsis = details.description || "";

    return {
      title: `${details.title} - AniDow Film`,
      description: synopsis.substring(0, 160) || "Nonton film dan serial TV di AniDow.",
      openGraph: {
        images: details.cover ? [details.cover] : [],
      },
      twitter: {
        card: "summary_large_image",
      },
    };
  } catch {
    return { title: "Detail Film - AniDow" };
  }
}

export default async function MovieDetailPage({
  params,
}: {
  params: Promise<{ detailPath: string }>;
}) {
  const { detailPath: rawDetailPath } = await params;
  const detailPath = decodeURIComponent(rawDetailPath);

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

  const isTv = details.subjectType === "tv_series";

  let related: MovieSlimItem[] = [];
  let seriesData: MovieSeriesEpisodesResponse | null = null;

  const [relatedResult, seriesResult] = await Promise.allSettled([
    getRelated(details.subjectId, 1),
    isTv ? getSeriesEpisodes(detailPath) : Promise.resolve(null),
  ]);

  if (relatedResult.status === "fulfilled") {
    related = relatedResult.value.items;
  }
  if (seriesResult.status === "fulfilled" && seriesResult.value) {
    seriesData = seriesResult.value;
  }
  // Fallback: pakai seasons dari details kalau endpoint episodes gagal
  if (isTv && !seriesData && details.seasons.length > 0) {
    seriesData = { detailPath, seasons: details.seasons };
  }

  const synopsis = details.description || "";
  const stars = details.stars;
  const cardData = toMovieCardData({
    subjectId: details.subjectId,
    detailPath: details.detailPath || detailPath,
    title: details.title,
    subjectType: details.subjectType,
    cover: details.cover ?? "",
    imdbRating: details.imdbRating,
    hasResource: details.hasResource,
    description: synopsis,
    releaseDate: details.releaseDate,
    genre: details.genre,
    duration: details.duration,
    country: details.country,
  });

  const watchHref = isTv
    ? `/movies/${detailPath}/watch?id=${details.subjectId}&season=${seriesData?.seasons[0]?.season ?? 1}&episode=1`
    : `/movies/${detailPath}/watch?id=${details.subjectId}`;
  const canPlay = details.hasResource !== false;

  return (
    <div className="flex flex-col gap-8 lg:gap-10 lg:flex-row pb-10 lg:pb-12">
      <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-5 lg:gap-6">
        <div className="relative w-full max-w-[260px] mx-auto lg:max-w-none aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/10 group bg-zinc-950">
          {details.cover && (
            <Image
              src={details.cover}
              alt={details.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
            />
          )}
        </div>

        <div className="glass-card p-5 sm:p-6 rounded-2xl flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">IMDb</p>
              <div className="flex items-center gap-1 font-bold text-white text-lg">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                {details.imdbRating ? details.imdbRating.toFixed(1) : "N/A"}
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Tipe</p>
              <p className="font-semibold text-white text-sm">{isTv ? "TV Series" : "Film"}</p>
            </div>
          </div>
          <hr className="border-white/5" />
          <div className="flex flex-col gap-3">
            <InfoRow label="Rilis" value={details.releaseDate || "N/A"} icon={<Calendar className="h-4 w-4" />} />
            {details.duration ? (
              <InfoRow label="Durasi" value={formatDuration(details.duration)} icon={<Clock className="h-4 w-4" />} />
            ) : null}
            <InfoRow label="Negara" value={details.country || "N/A"} icon={<Globe className="h-4 w-4" />} />
            {isTv && seriesData ? (
              <InfoRow label="Season" value={String(seriesData.seasons.length)} icon={<Tv className="h-4 w-4" />} />
            ) : null}
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col gap-8 lg:gap-10">
        <div>
          <div className="flex flex-wrap gap-2 mb-5">
            {details.genre.map((genre) => (
              <span key={genre} className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20">
                {genre}
              </span>
            ))}
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-6 sm:mb-8 drop-shadow-md">
            {details.title}
          </h1>

          <div className="grid grid-cols-1 sm:flex sm:items-center gap-3 sm:gap-4 border-b border-white/5 pb-6 sm:pb-8">
            {canPlay ? (
              <Link
                href={watchHref}
                className="flex w-full sm:w-auto items-center justify-center gap-2 bg-amber-500 text-black px-6 py-3 rounded-full font-bold text-sm hover:bg-amber-400 hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
              >
                <Play className="w-5 h-5 fill-black" />
                <span>{isTv ? "Tonton S1 E1" : "Tonton Sekarang"}</span>
              </Link>
            ) : (
              <span className="flex w-full sm:w-auto items-center justify-center gap-2 bg-zinc-800 text-zinc-500 px-6 py-3 rounded-full font-bold text-sm cursor-not-allowed">
                <Clapperboard className="w-5 h-5" />
                <span>Belum Tersedia</span>
              </span>
            )}
            <MovieWatchlistButton movie={cardData} />
          </div>
        </div>

        <section>
          <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Synopsis</h3>
          <p className="text-zinc-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
            {synopsis || "Synopsis belum tersedia."}
          </p>
          {stars.length > 0 && (
            <p className="mt-4 text-sm text-zinc-500">
              <span className="font-semibold text-zinc-400">Pemeran:</span> {stars.slice(0, 8).join(", ")}
            </p>
          )}
        </section>

        {isTv && seriesData && seriesData.seasons.length > 0 && (
          <SeasonEpisodePicker
            detailPath={detailPath}
            subjectId={details.subjectId}
            seasons={seriesData.seasons}
          />
        )}

        {related.length > 0 && (
          <section className="mt-2 border-t border-white/5 pt-10">
            <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">Serupa</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {related.slice(0, 8).map((item, index) => (
                <MovieCard key={item.subjectId} movie={toMovieCardData(item)} index={index} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function InfoRow({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4 text-sm">
      <span className="flex items-center gap-2 text-zinc-500">
        {icon}
        {label}
      </span>
      <span className="text-white font-medium text-right max-w-[170px]">{value}</span>
    </div>
  );
}
