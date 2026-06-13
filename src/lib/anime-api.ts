import type {
  AnimeCardData,
  AnimeListEntry,
  AnimeListResponse,
  AnimeResponse,
  EpisodeRef,
  EpisodeResponse,
  GenreCardItem,
  GenreListResponse,
  HomeAnimeItem,
  HomeResponse,
  ListResponse,
  SearchAnimeItem,
  SearchAnimeResponse,
  SearchResponse,
  SearchSuggestionsResponse,
} from "@/types/anime-api";

export class AnimeApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message = `Anime API request failed with HTTP ${status}`
  ) {
    super(message);
    this.name = "AnimeApiError";
  }
}

interface ApiOptions {
  params?: Record<string, string | number | boolean | null | undefined>;
  revalidate?: number;
  headers?: HeadersInit;
}

function getBaseUrl() {
  const baseUrl =
    process.env.ANIDOW_API_BASE_URL ||
    process.env.OTAKUDESU_API_BASE_URL;

  if (!baseUrl) {
    throw new AnimeApiError(500, {}, "Anime API base URL is not configured.");
  }

  return baseUrl.replace(/\/$/, "");
}

export function isAnimeApiConfigured() {
  return Boolean((process.env.ANIDOW_API_BASE_URL || process.env.OTAKUDESU_API_BASE_URL) && getApiKey());
}

async function readJson(response: Response) {
  return response.json().catch(() => ({}));
}

function getApiKey() {
  return process.env.OTAKUDESU_API_KEY;
}

export async function animeApi<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const url = new URL(`${getBaseUrl()}${path}`);

  for (const [key, value] of Object.entries(options.params ?? {})) {
    if (value !== null && value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  const headers: HeadersInit = {};
  const apiKey = getApiKey();
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }
  // Merge extra headers (mis. X-Real-IP dari proxy)
  if (options.headers) {
    Object.assign(headers, options.headers);
  }

  const response = await fetch(url, {
    headers,
    next: { revalidate: options.revalidate ?? 600 },
  });
  const body = await readJson(response);

  if (!response.ok) {
    const fallback = response.status === 429
      ? "Terlalu banyak request ke API anime. Coba lagi sebentar."
      : response.status === 502
        ? "Sumber anime sedang bermasalah."
        : `API anime mengembalikan HTTP ${response.status}.`;
    const message = typeof body === "object" && body && "error" in body
      ? String((body as { error?: unknown }).error)
      : fallback;

    throw new AnimeApiError(response.status, body, message);
  }

  return body as T;
}

export const getHome = () => animeApi<HomeResponse>("/api/home", { revalidate: 600 });
export const getOngoing = (page: number) => animeApi<ListResponse<HomeAnimeItem>>("/api/ongoing", { params: { page }, revalidate: 600 });
export const getComplete = (page: number) => animeApi<ListResponse<HomeAnimeItem>>("/api/complete", { params: { page }, revalidate: 3600 });
export const getAnimePage = (status: "ongoing" | "complete", page: number, limit = 24) => {
  const path = status === "complete" ? "/api/complete" : "/api/ongoing";
  return animeApi<ListResponse<SearchAnimeItem>>(path, { params: { page, limit }, revalidate: status === "complete" ? 3600 : 600 });
}
export const getAnimeList = () => animeApi<AnimeListResponse>("/api/anime-list", { revalidate: 86400 });
export const getGenres = () => animeApi<GenreListResponse>("/api/genres", { revalidate: 86400 });
export const getGenre = (slug: string, page: number) => animeApi<ListResponse<GenreCardItem>>(`/api/genre/${slug}`, { params: { page }, revalidate: 1800 });
export const searchAnime = (q: string) => animeApi<SearchResponse>("/api/search", { params: { q }, revalidate: 300 });
export const searchAnimeTitles = (q: string, page = 1, limit = 40) => animeApi<SearchAnimeResponse>("/api/search/anime", { params: { q, page, limit }, revalidate: 300 });
export const getSearchSuggestions = (q: string, limit = 8) => animeApi<SearchSuggestionsResponse>("/api/search/suggestions", { params: { q, limit }, revalidate: 300 });
export const getAnime = (slug: string) => animeApi<AnimeResponse>(`/api/anime/${slug}`, { revalidate: 3600 });
export const getEpisode = (slug: string, skipMirrors = false) => animeApi<EpisodeResponse>(`/api/episode/${slug}`, { params: { skipMirrors: skipMirrors ? 1 : undefined }, revalidate: 600 });

export function toAnimeCardData(item: HomeAnimeItem | GenreCardItem | SearchAnimeItem): AnimeCardData {
  // HomeAnimeItem & SearchAnimeItem punya currentEpisode/day/totalEpisodes/status
  // GenreCardItem tidak punya field status sama sekali → null (tanpa badge)
  const isHomeOrSearch = "currentEpisode" in item;
  const currentEpisode = "currentEpisode" in item ? item.currentEpisode : null;
  const day = "day" in item ? item.day : null;
  const totalEpisodes = "totalEpisodes" in item ? item.totalEpisodes : null;
  const rawStatus = "status" in item ? item.status : null;

  const status = rawStatus
    || (isHomeOrSearch && (currentEpisode || day) ? "Ongoing" : null)
    || (isHomeOrSearch && totalEpisodes ? "Complete" : null);

  return {
    title: item.title,
    slug: item.slug,
    image: item.image,
    date: "date" in item ? item.date : null,
    currentEpisode,
    day,
    totalEpisodes,
    score: "score" in item ? item.score : null,
    rating: "rating" in item ? item.rating : null,
    episodes: "episodes" in item ? item.episodes : null,
    studio: "studio" in item ? item.studio : null,
    genres: "genres" in item ? item.genres : undefined,
    season: "season" in item ? item.season : null,
    synopsis: "synopsis" in item ? item.synopsis : null,
    status,
  };
}

export function animeDetailToCard(slug: string, anime: AnimeResponse): AnimeCardData {
  return {
    title: anime.info.judul || anime.title,
    slug,
    image: anime.image,
    score: anime.info.skor,
    episodes: anime.info.totalEpisode,
    studio: anime.info.studio,
    genres: anime.info.genres,
    synopsis: anime.synopsis,
  };
}

export function getFirstEpisode(episodes: EpisodeRef[]) {
  return [...episodes].sort((a, b) => Number(a.episode || 0) - Number(b.episode || 0))[0];
}

function normalizeSearchText(value: string) {
  return value
    .toLowerCase()
    .replace(/subtitle indonesia|sub indo|batch/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function searchAnimeEntries(entries: AnimeListEntry[], query: string) {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return [];
  }

  return entries
    .map((entry) => {
      const title = normalizeSearchText(entry.title);
      const fullTitle = normalizeSearchText(entry.fullTitle || entry.title);
      const haystack = `${title} ${fullTitle}`;
      const score = title === normalizedQuery
        ? 0
        : title.startsWith(normalizedQuery)
          ? 1
          : fullTitle.startsWith(normalizedQuery)
            ? 2
            : haystack.includes(normalizedQuery)
              ? 3
              : 99;

      return { entry, score };
    })
    .filter((result) => result.score < 99)
    .sort((a, b) => a.score - b.score || a.entry.title.localeCompare(b.entry.title))
    .map((result) => result.entry);
}
