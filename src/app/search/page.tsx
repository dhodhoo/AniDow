import AnimeCard from "@/components/AnimeCard";
import { fetchJikanAPI } from "@/lib/jikan";
import { JikanResponse, Anime } from "@/types/jikan";

// Always Fetch dynamically based on search Params
export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const params = await searchParams;
  const query = params.q || "";
  
  if (!query) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <h1 className="text-2xl font-bold text-zinc-500">Mulai ketik untuk mencari...</h1>
      </div>
    );
  }

  let results: Anime[] = [];
  try {
    const data = await fetchJikanAPI<JikanResponse<Anime[]>>(`/anime?q=${encodeURIComponent(query)}&limit=20`);
    results = data.data || [];
  } catch (error) {
    console.error("Search API Error:", error);
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Hasil Pencarian: &quot;{query}&quot;</h1>
        <p className="text-zinc-400">Ditemukan {results.length} hasil kecocokan</p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((anime, index) => (
            <AnimeCard key={`${anime.mal_id}-${index}`} anime={anime} index={index} priority={index < 10} />
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[40vh] border border-dashed border-zinc-800 rounded-3xl glass-card">
          <p className="text-zinc-400 text-lg">Tidak ada anime yang cocok dengan kueri tersebut.</p>
        </div>
      )}
    </div>
  );
}
