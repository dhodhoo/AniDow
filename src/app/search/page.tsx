import AnimeCard from "@/components/AnimeCard";
import { searchAnimeTitles, toAnimeCardData } from "@/lib/anime-api";
import { SearchAnimeItem } from "@/types/anime-api";

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

  let results: SearchAnimeItem[] = [];
  try {
    const data = await searchAnimeTitles(query, 1, 40);
    results = data.items;
  } catch (error) {
    console.error("Search API Error:", error);
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Hasil Pencarian: &quot;{query}&quot;</h1>
        <p className="text-zinc-400">Ditemukan {results.length} judul anime dari katalog AniDow</p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {results.map((item, index) => (
            <AnimeCard key={`${item.slug}-${index}`} anime={toAnimeCardData(item)} index={index} priority={index < 8} />
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
