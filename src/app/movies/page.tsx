import type { Metadata } from "next";
import dynamic from "next/dynamic";

import MovieCarousel from "@/components/MovieCarousel";
import MovieHero from "@/components/MovieHero";
import {
  getMovieHome,
  getPopular,
  getTrending,
  isMovieApiConfigured,
  toMovieCardData,
} from "@/lib/movie-api";

const ContinueWatchingSection = dynamic(
  () => import("@/components/ContinueWatchingSection")
);
import type { MovieHomeResponse, MoviePaginatedResponse, MoviePopularResponse, MovieSlimItem } from "@/types/movie-api";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Film & TV - AniDow",
  description: "Nonton film dan serial TV favorit dengan subtitle Indonesia.",
};

export default async function MoviesPage() {
  if (!isMovieApiConfigured()) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-center text-zinc-400">
        Layanan film belum dikonfigurasi. Atur MOVIEBOX_API_BASE_URL di .env.local.
      </div>
    );
  }

  let homeData: MovieHomeResponse | null = null;
  let trendingData: MoviePaginatedResponse<MovieSlimItem> | null = null;
  let popularData: MoviePopularResponse | null = null;

  try {
    [homeData, trendingData, popularData] = await Promise.all([
      getMovieHome(),
      getTrending(0),
      getPopular(),
    ]);
  } catch {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-center text-zinc-400">
        Layanan film sedang tidak dapat diakses. Coba lagi nanti.
      </div>
    );
  }

  const rows = [...homeData.rows].sort((a, b) => a.position - b.position);
  const bannerRow = rows.find((row) => row.type === "BANNER");
  const contentRows = rows.filter((row) => row.type !== "BANNER" && row.items.length > 0);

  return (
    <div className="flex flex-col">
      {bannerRow?.banners && bannerRow.banners.length > 0 && (
        <MovieHero banners={bannerRow.banners} />
      )}

      <ContinueWatchingSection />

      {trendingData.items.length > 0 && (
        <MovieCarousel
          title="Sedang Trending"
          description="Film dan serial yang paling banyak ditonton saat ini."
          movieList={trendingData.items.map(toMovieCardData)}
          seeAllHref="/movies/browse"
          priority
        />
      )}

      {contentRows.map((row) => (
        <MovieCarousel
          key={`${row.position}-${row.title}`}
          title={row.title}
          description={`Pilihan ${row.title.toLowerCase()} untuk kamu.`}
          movieList={row.items.map(toMovieCardData)}
        />
      ))}

      {popularData.hotMovies.length > 0 && (
        <MovieCarousel
          title="Film Populer"
          description="Film yang paling banyak dicari minggu ini."
          movieList={popularData.hotMovies.map(toMovieCardData)}
          seeAllHref="/movies/browse?type=movie"
        />
      )}

      {popularData.hotTvSeries.length > 0 && (
        <MovieCarousel
          title="Serial TV Populer"
          description="Serial TV yang sedang naik daun."
          movieList={popularData.hotTvSeries.map(toMovieCardData)}
          seeAllHref="/movies/browse?type=tv"
        />
      )}
    </div>
  );
}
