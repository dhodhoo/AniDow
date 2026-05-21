import { getAnimeList, searchAnimeEntries } from "@/lib/anime-api";
import { AnimeListEntry } from "@/types/anime-api";
import { Clapperboard } from "lucide-react";
import Link from "next/link";

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

  let results: AnimeListEntry[] = [];
  try {
    const data = await getAnimeList();
    const entries = data.groups.flatMap((group) => group.anime);
    results = searchAnimeEntries(entries, query).slice(0, 40);
  } catch (error) {
    console.error("Search API Error:", error);
  }

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Hasil Pencarian: &quot;{query}&quot;</h1>
        <p className="text-zinc-400">Ditemukan {results.length} judul anime dari direktori API pribadi</p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((item, index) => (
            <Link
              key={`${item.slug}-${index}`}
              href={`/anime/${item.slug}`}
              className="glass-card group flex items-center gap-4 rounded-2xl p-4 border border-white/5 hover:border-indigo-500/40 transition-colors"
            >
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                <Clapperboard className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <div className="mb-2">
                  <span className="rounded-md bg-zinc-800/80 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                    Anime
                  </span>
                </div>
                <h2 className="truncate font-bold text-zinc-100 group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h2>
                {item.fullTitle && item.fullTitle !== item.title && (
                  <p className="mt-1 truncate text-xs text-zinc-500">{item.fullTitle}</p>
                )}
              </div>
            </Link>
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
