import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, Clapperboard, Star, Tv } from "lucide-react";
import { animeDetailToCard, getAnime, getFirstEpisode } from "@/lib/anime-api";
import { AnimeResponse } from "@/types/anime-api";
import WatchlistButton from "@/components/WatchlistButton";
import PlayNowButton from "@/components/PlayNowButton";
import type { Metadata } from "next";

export const revalidate = 3600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const anime = await getAnime(id);

    return {
      title: `${anime.info.judul || anime.title} - AniDow`,
      description: anime.synopsis?.substring(0, 160) || "Jelajahi detail anime dan episode streaming di AniDow.",
      openGraph: {
        images: anime.image ? [anime.image] : [],
      },
      twitter: {
        card: "summary_large_image",
      },
    };
  } catch {
    return { title: "Anime Detail - AniDow" };
  }
}

export default async function AnimeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let anime: AnimeResponse | null = null;

  try {
    anime = await getAnime(id);
  } catch (error) {
    console.error("Failed to load anime metadata", error);
  }

  if (!anime) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl text-zinc-500">Anime tidak ditemukan atau terjadi kesalahan server.</h1>
      </div>
    );
  }

  const firstEpisode = getFirstEpisode(anime.episodes);
  const cardData = animeDetailToCard(id, anime);

  return (
    <div className="flex flex-col gap-10 lg:flex-row pb-12">
      <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/10 group bg-zinc-950">
          {anime.image && (
            <Image
              src={anime.image}
              alt={anime.info.judul || anime.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              priority
              unoptimized
            />
          )}
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Score</p>
              <div className="flex items-center gap-1 font-bold text-white text-lg">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                {anime.info.skor || "N/A"}
              </div>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Status</p>
              <p className="font-semibold text-white text-sm">{anime.info.status || "Unknown"}</p>
            </div>
          </div>
          <hr className="border-white/5" />
          <div className="flex flex-col gap-3">
            <InfoRow label="Episodes" value={anime.info.totalEpisode || String(anime.episodeCount || "?")} icon={<Clapperboard className="h-4 w-4" />} />
            <InfoRow label="Rilis" value={anime.info.tanggalRilis || "N/A"} icon={<Calendar className="h-4 w-4" />} />
            <InfoRow label="Durasi" value={anime.info.durasi || "N/A"} icon={<Clock className="h-4 w-4" />} />
            <InfoRow label="Tipe" value={anime.info.tipe || "N/A"} icon={<Tv className="h-4 w-4" />} />
            <InfoRow label="Studio" value={anime.info.studio || "Unknown"} />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col gap-10">
        <div>
          <div className="flex flex-wrap gap-2 mb-5">
            {anime.info.genres.map((genre) => (
              <span key={genre} className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
                {genre}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-md">
            {anime.info.judul || anime.title}
          </h1>
          {anime.info.japanese && (
            <h2 className="text-xl text-zinc-400 font-medium tracking-tight mb-8">
              {anime.info.japanese}
            </h2>
          )}

          <div className="flex items-center gap-4 border-b border-white/5 pb-8 flex-wrap">
            <PlayNowButton animeSlug={id} episodes={anime.episodes} />
            <WatchlistButton anime={cardData} />
          </div>
        </div>

        <section>
          <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Synopsis</h3>
          <p className="text-zinc-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
            {anime.synopsis || "No synopsis available."}
          </p>
        </section>

        <section className="mt-2 border-t border-white/5 pt-10">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white tracking-tight">Daftar Episode</h3>
              <p className="text-sm text-zinc-500">{anime.episodeCount} episode tersedia</p>
            </div>
            {firstEpisode && (
              <Link href={`/watch/${firstEpisode.slug}`} className="rounded-full bg-white px-5 py-2 text-sm font-bold text-black transition-colors hover:bg-zinc-200">
                Mulai Ep {firstEpisode.episode || "1"}
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {anime.episodes.map((episode) => (
              <Link key={episode.slug} href={`/watch/${episode.slug}`} className="glass-card group rounded-xl border border-white/5 p-4 transition-colors hover:border-indigo-500/40 hover:bg-zinc-800/70">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-bold text-zinc-100 group-hover:text-indigo-300">{episode.title}</h4>
                    <p className="mt-1 text-xs text-zinc-500">{episode.date}</p>
                  </div>
                  <span className="shrink-0 rounded-lg bg-indigo-500/10 px-3 py-1 text-xs font-bold text-indigo-300">
                    EP {episode.episode || "?"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
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
