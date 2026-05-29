import { getAnime, getEpisode } from "@/lib/anime-api";
import VideoPlayer from "@/components/VideoPlayer";
import EpisodeList from "@/components/EpisodeList";
import { Download, ExternalLink, Star } from "lucide-react";
import type { Metadata } from "next";
import type { AnimeResponse, DownloadGroup, EpisodeResponse } from "@/types/anime-api";
import Link from "next/link";

function slugFromUrl(url: string | null) {
  return url?.split("/").filter(Boolean).pop() || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const episode = await getEpisode(id, true);
    return {
      title: `${episode.title} - AniDow`,
      description: `Streaming ${episode.title} secara elegan di AniDow Cinematic Player.`,
    };
  } catch {
    return { title: "Nonton Anime - AniDow" };
  }
}

export default async function WatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let episode: EpisodeResponse | null = null;
  let anime: AnimeResponse | null = null;

  try {
    episode = await getEpisode(id);
    anime = await getAnime(episode.animeSlug);
  } catch (error) {
    console.error("Failed to load episode metadata", error);
  }

  if (!episode) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl text-zinc-500">Video atau episode anime tidak ditemukan.</h1>
      </div>
    );
  }

  const currentEpisode = episode.episodeList.find((item) => item.slug === id);
  const episodeLabel = currentEpisode?.label || "Episode";
  const embedUrl = episode.defaultIframe || episode.mirrors.find((mirror) => mirror.iframeUrl)?.iframeUrl || "";
  const nextEpisodeSlug = slugFromUrl(episode.nextEpisodeUrl);
  const prevEpisodeSlug = slugFromUrl(episode.prevEpisodeUrl);

  return (
    <div className="flex flex-col lg:flex-row gap-5 lg:gap-6 w-full pb-24 lg:pb-10 max-w-[1600px] mx-auto">
      <div className="flex-1 flex flex-col gap-6">
        {embedUrl ? (
          <VideoPlayer
            key={episode.slug}
            embedUrl={embedUrl}
            title={anime?.info.judul || episode.title}
            episodeSlug={episode.slug}
            episodeLabel={episodeLabel}
            animeSlug={episode.animeSlug}
            mirrors={episode.mirrors}
            nextEpisodeSlug={nextEpisodeSlug}
          />
        ) : (
          <div className="glass-card flex aspect-video items-center justify-center rounded-2xl border border-white/10 text-zinc-500">
            Streaming mirror tidak tersedia untuk episode ini.
          </div>
        )}

        <div className="glass-card p-5 md:p-8 rounded-2xl flex flex-col gap-4 md:gap-5 border border-white/5 mt-1 md:mt-2">
          <div className="flex flex-wrap gap-2">
            {anime?.info.genres?.slice(0, 3).map((genre) => (
              <span key={genre} className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-zinc-800/80 text-zinc-400 rounded-md border border-zinc-700/50">
                {genre}
              </span>
            ))}
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tighter shadow-sm mb-3">{anime?.info.judul || episode.title}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-1 font-bold text-lg text-white">
                <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                {anime?.info.skor || "N/A"}
              </div>
              <span className="text-sm text-zinc-500 font-medium">{anime?.info.status || "Unknown"}</span>
              <span className="text-sm text-zinc-500 font-medium border-l border-white/10 pl-4">{episodeLabel}</span>
              <Link href={`/anime/${episode.animeSlug}`} className="text-sm font-bold text-indigo-400 hover:text-indigo-300">
                Detail Anime
              </Link>
            </div>
          </div>
          {anime?.synopsis && (
            <p className="text-sm text-zinc-400 leading-relaxed text-left sm:text-justify mt-2 max-w-4xl line-clamp-4 sm:line-clamp-5">
              {anime.synopsis}
            </p>
          )}
          <div className="hidden sm:flex flex-wrap gap-3 border-t border-white/5 pt-5">
            <Link href={prevEpisodeSlug ? `/watch/${prevEpisodeSlug}` : "#"} className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${prevEpisodeSlug ? "bg-zinc-900 text-white hover:bg-zinc-800 border border-white/10" : "pointer-events-none bg-transparent text-zinc-700"}`}>
              Episode Sebelumnya
            </Link>
            <Link href={nextEpisodeSlug ? `/watch/${nextEpisodeSlug}` : "#"} className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${nextEpisodeSlug ? "bg-indigo-600 text-white hover:bg-indigo-500 border border-indigo-400" : "pointer-events-none bg-transparent text-zinc-700"}`}>
              Episode Selanjutnya
            </Link>
          </div>
        </div>

        <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 gap-3 border-t border-white/10 bg-[#050505]/95 p-3 backdrop-blur-xl sm:hidden">
          <Link href={prevEpisodeSlug ? `/watch/${prevEpisodeSlug}` : "#"} className={`rounded-full px-4 py-3 text-center text-xs font-bold transition-colors ${prevEpisodeSlug ? "bg-zinc-900 text-white border border-white/10" : "pointer-events-none bg-zinc-950 text-zinc-700 border border-white/5"}`}>
            Sebelumnya
          </Link>
          <Link href={nextEpisodeSlug ? `/watch/${nextEpisodeSlug}` : "#"} className={`rounded-full px-4 py-3 text-center text-xs font-bold transition-colors ${nextEpisodeSlug ? "bg-indigo-600 text-white border border-indigo-400" : "pointer-events-none bg-zinc-950 text-zinc-700 border border-white/5"}`}>
            Selanjutnya
          </Link>
        </div>

        <DownloadPanel downloads={episode.downloads} />
      </div>

      <aside className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 h-[420px] sm:h-[520px] lg:h-[calc(100vh-140px)] lg:sticky top-28">
        <EpisodeList episodes={episode.episodeList} currentEpisodeSlug={episode.slug} />
      </aside>
    </div>
  );
}

function DownloadPanel({ downloads }: { downloads: DownloadGroup[] }) {
  if (downloads.length === 0) {
    return null;
  }

  return (
    <section className="glass-card rounded-2xl border border-white/5 p-6 md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-500/15 p-3 text-indigo-300">
          <Download className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">Download Episode</h2>
          <p className="text-sm text-zinc-500">Pilih kualitas dan host eksternal yang tersedia.</p>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        {downloads.map((group) => (
          <div key={group.heading} className="rounded-2xl border border-white/5 bg-black/20 p-4">
            <h3 className="mb-4 text-sm font-bold text-zinc-300">{group.heading}</h3>
            <div className="grid grid-cols-1 gap-3">
              {group.items.map((item) => (
                <div key={item.quality} className="rounded-xl bg-zinc-950/60 p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="font-bold text-white">{item.quality}</span>
                    <span className="text-xs text-zinc-500">{item.sizeMB ? `${item.sizeMB} MB` : "Size unknown"}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.links.map((link) => (
                      <a
                        key={`${item.quality}-${link.host}-${link.url}`}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-zinc-300 transition-colors hover:border-indigo-400/50 hover:text-white"
                      >
                        {link.host}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
