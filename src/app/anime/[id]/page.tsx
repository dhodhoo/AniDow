import Image from "next/image";
import { Star, Users } from "lucide-react";
import { fetchJikanAPI } from "@/lib/jikan";
import { JikanResponse, Anime, Character } from "@/types/jikan";
import WatchlistButton from "@/components/WatchlistButton";
import PlayNowButton from "@/components/PlayNowButton";
import type { Metadata } from "next";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const fullData = await fetchJikanAPI<JikanResponse<Anime>>(`/anime/${id}/full`);
    const anime = fullData.data;
    
    return {
      title: `${anime.title || anime.title_english} - AniDow`,
      description: anime.synopsis?.substring(0, 160) || "Jelajahi detail anime premium ini di platform AniDow.",
      openGraph: {
        images: [anime.images.webp.large_image_url],
      },
      twitter: {
        card: "summary_large_image"
      }
    };
  } catch (err) {
    return { title: "Anime Detail - AniDow" };
  }
}

export default async function AnimeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let anime: Anime | null = null;
  let characters: Character[] = [];

  try {
    const fullData = await fetchJikanAPI<JikanResponse<Anime>>(`/anime/${id}/full`);
    anime = fullData.data;

    const charData = await fetchJikanAPI<JikanResponse<Character[]>>(`/anime/${id}/characters`);
    characters = charData.data || [];
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

  return (
    <div className="flex flex-col gap-10 lg:flex-row pb-12">
      <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
        <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/10 group">
          <Image
            src={anime.images.webp.large_image_url || anime.images.jpg.large_image_url}
            alt={anime.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            priority
            unoptimized
          />
        </div>

        <div className="glass-card p-6 rounded-2xl flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Score</p>
              <div className="flex items-center gap-1 font-bold text-white text-lg">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                {anime.score || "N/A"}
              </div>
              <p className="text-[10px] text-zinc-500 mt-0.5">{anime.scored_by?.toLocaleString()} users</p>
            </div>
            <div>
              <p className="text-xs text-zinc-500 mb-1 font-semibold uppercase tracking-wider">Status</p>
              <p className="font-semibold text-white text-sm">{anime.status}</p>
            </div>
          </div>
          <hr className="border-white/5" />
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Episodes</span>
              <span className="text-white font-medium">{anime.episodes || "?"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Year</span>
              <span className="text-white font-medium">{anime.year || "N/A"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-zinc-500">Type</span>
              <span className="text-white font-medium">{anime.type}</span>
            </div>
            <div className="flex justify-between items-start text-sm mt-1">
               <span className="text-zinc-500">Studio</span>
               <span className="text-white font-medium text-right max-w-[150px]">
                  {anime.studios?.map(s => s.name).join(", ") || "Unknown"}
               </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col gap-10">
        <div>
          <div className="flex flex-wrap gap-2 mb-5">
            {anime.genres.map(g => (
              <span key={g.mal_id} className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-md border border-indigo-500/20">
                {g.name}
              </span>
            ))}
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter mb-4 drop-shadow-md">
            {anime.title || anime.title_english}
          </h1>
          {anime.title_japanese && (
            <h2 className="text-xl text-zinc-400 font-medium tracking-tight mb-8">
              {anime.title_japanese}
            </h2>
          )}
          
          <div className="flex items-center gap-4 border-b border-white/5 pb-8 flex-wrap">
             <PlayNowButton animeId={anime.mal_id} />
             <WatchlistButton anime={anime} />
          </div>
        </div>

        <section>
          <h3 className="text-2xl font-bold text-white mb-4 tracking-tight">Synopsis</h3>
          <p className="text-zinc-300 leading-relaxed text-sm md:text-base whitespace-pre-line">
            {anime.synopsis || "No synopsis available."}
          </p>
        </section>

        {anime.trailer?.embed_url && (
          <section className="mt-2">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 tracking-tight">
              Trailer Resmi
            </h3>
            <div className="w-full aspect-video rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-white/10 glass-card p-1 md:p-2 bg-[#050505]">
               <div className="w-full h-full rounded-2xl overflow-hidden relative">
                 <iframe 
                   src={anime.trailer.embed_url.replace("autoplay=1", "autoplay=0")}
                   className="absolute inset-0 w-full h-full border-none"
                   allowFullScreen
                   title="Anime Trailer"
                   allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                 />
               </div>
            </div>
          </section>
        )}

        {characters.length > 0 && (
          <section className="mt-6 border-t border-white/5 pt-10">
             <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3 tracking-tight">
                <Users className="w-6 h-6 text-indigo-400" />
                Karakter Dominan
             </h3>
             <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {characters.slice(0, 12).map((char, index) => (
                  <div key={`${char.character.mal_id}-${index}`} className="flex items-center gap-3 p-3 rounded-2xl glass-card hover:bg-zinc-800/80 transition-colors cursor-default border border-white/5">
                     <div className="w-14 h-14 relative rounded-xl overflow-hidden shrink-0 border border-white/10 shadow-lg">
                       <Image 
                         src={char.character.images.webp.image_url}
                         alt={char.character.name}
                         fill
                         sizes="56px"
                         className="object-cover"
                         unoptimized
                       />
                     </div>
                     <div className="flex flex-col truncate">
                       <span className="text-white font-bold text-sm truncate">{char.character.name}</span>
                       <span className="text-zinc-500 text-xs truncate">{char.role}</span>
                     </div>
                  </div>
                ))}
             </div>
          </section>
        )}
      </main>
    </div>
  );
}
