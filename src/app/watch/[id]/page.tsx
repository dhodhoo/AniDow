import { fetchJikanAPI } from "@/lib/jikan";
import { fetchAnimeEpisodes, fetchEpisodeVideoURL } from "@/lib/stream";
import { JikanResponse, Anime } from "@/types/jikan";
import VideoPlayer from "@/components/VideoPlayer";
import EpisodeList from "@/components/EpisodeList";
import { Star } from "lucide-react";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sParams = await searchParams;
  const ep = sParams.ep || "1";
  
  try {
    const fullData = await fetchJikanAPI<JikanResponse<Anime>>(`/anime/${id}`);
    const anime = fullData.data;
    return {
      title: `Tonton ${anime.title} Episode ${ep} - AniDow`,
      description: `Streaming ${anime.title} Episode ${ep} secara elegan di AniDow Cinematic Player.`
    };
  } catch (err) {
    return { title: "Nonton Anime - AniDow" };
  }
}

export default async function WatchPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ep?: string }>;
}) {
  const { id } = await params;
  const sParams = await searchParams;
  const currentEp = parseInt(sParams.ep || "1", 10);

  let anime: Anime | null = null;
  
  try {
    const fullData = await fetchJikanAPI<JikanResponse<Anime>>(`/anime/${id}`);
    anime = fullData.data;
  } catch (error) {
    console.error("Failed to load anime metadata", error);
  }

  if (!anime) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <h1 className="text-2xl text-zinc-500">Video atau Seri Anime tidak ditemukan.</h1>
      </div>
    );
  }

  // Orchestrate Streaming data resolution
  const streamInfo = await fetchAnimeEpisodes(anime.title_english || anime.title, anime.mal_id, anime.episodes || 12);
  const targetEpisode = streamInfo.episodes.find(e => e.number === currentEp) || streamInfo.episodes[0];
  const embedUrl = await fetchEpisodeVideoURL(targetEpisode.id);

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full pb-10 max-w-[1600px] mx-auto">
      
      {/* KIRI 70%: Cinematic Player & Details */}
      <div className="flex-1 flex flex-col gap-6">
        <VideoPlayer 
           embedUrl={embedUrl} 
           title={anime.title} 
           episodeNumber={currentEp} 
           animeId={anime.mal_id}
           hasNextEpisode={currentEp < streamInfo.totalEpisodes}
        />
        
        <div className="glass-card p-6 md:p-8 rounded-2xl flex flex-col gap-5 border border-white/5 mt-2">
          <div className="flex flex-wrap gap-2">
            {anime.genres?.slice(0, 3).map((g) => (
              <span key={g.mal_id} className="text-[10px] uppercase font-bold tracking-wider px-3 py-1 bg-zinc-800/80 text-zinc-400 rounded-md border border-zinc-700/50">
                {g.name}
              </span>
            ))}
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter shadow-sm mb-3">{anime.title}</h1>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-1 font-bold text-lg text-white">
                  <Star className="w-5 h-5 fill-yellow-500 text-yellow-500" />
                  {anime.score || "N/A"}
               </div>
               <span className="text-sm text-zinc-500 font-medium">{anime.status}</span>
               <span className="text-sm text-zinc-500 font-medium border-l border-white/10 pl-4">{anime.year || "Unknown"}</span>
            </div>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed text-justify mt-2 max-w-4xl">
            {anime.synopsis}
          </p>
        </div>
      </div>

      {/* KANAN 30%: Seamless Episode Explorer */}
      <aside className="w-full lg:w-[350px] xl:w-[400px] flex-shrink-0 h-[600px] lg:h-[calc(100vh-140px)] lg:sticky top-28">
         <EpisodeList animeId={id} episodes={streamInfo.episodes} currentEpisode={currentEp} />
      </aside>

    </div>
  );
}
