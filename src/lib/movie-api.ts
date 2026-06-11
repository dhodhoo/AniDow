import type {
  MovieBrowseResponse,
  MovieCardData,
  MovieDetailsRaw,
  MovieDetailsResponse,
  MovieFilesResponse,
  MovieHomeResponse,
  MoviePaginatedResponse,
  MoviePopularResponse,
  MovieSeriesEpisodesResponse,
  MovieSlimItem,
  MovieSuggestResponse,
} from "@/types/movie-api";

export class MovieApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
    message = `Movie API request failed with HTTP ${status}`
  ) {
    super(message);
    this.name = "MovieApiError";
  }
}

interface ApiOptions {
  params?: Record<string, string | number | boolean | null | undefined>;
  revalidate?: number;
}

function getBaseUrl() {
  const baseUrl = process.env.MOVIEBOX_API_BASE_URL;

  if (!baseUrl) {
    throw new MovieApiError(500, {}, "Movie API base URL is not configured.");
  }

  return baseUrl.replace(/\/$/, "");
}

function getApiKey() {
  return process.env.MOVIEBOX_API_KEY;
}

export function isMovieApiConfigured() {
  return Boolean(process.env.MOVIEBOX_API_BASE_URL);
}

async function readJson(response: Response) {
  return response.json().catch(() => ({}));
}

export async function movieApi<T>(path: string, options: ApiOptions = {}): Promise<T> {
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

  const response = await fetch(url, {
    headers,
    next: { revalidate: options.revalidate ?? 600 },
  });
  const body = await readJson(response);

  if (!response.ok) {
    const fallback = response.status === 403
      ? "Tautan video sudah kadaluarsa. Muat ulang halaman."
      : response.status === 404
        ? "Konten tidak tersedia."
        : response.status === 502
          ? "Sumber film sedang bermasalah. Coba lagi nanti."
          : response.status === 504
            ? "Sumber film tidak merespons. Coba lagi."
            : `API film mengembalikan HTTP ${response.status}.`;
    const message = typeof body === "object" && body && "error" in body
      ? String((body as { error?: unknown }).error)
      : fallback;

    throw new MovieApiError(response.status, body, message);
  }

  return body as T;
}

export const getMovieHome = () => movieApi<MovieHomeResponse>("/home", { revalidate: 600 });
export const getTrending = (page = 0) => movieApi<MoviePaginatedResponse<MovieSlimItem>>("/trending", { params: { page }, revalidate: 600 });
export const getPopular = () => movieApi<MoviePopularResponse>("/popular", { revalidate: 600 });
export const getSuggest = (q: string) => movieApi<MovieSuggestResponse>("/suggest", { params: { q }, revalidate: 0 });
export const searchMovies = (q: string, type = "all", page = 1) => movieApi<MoviePaginatedResponse<MovieSlimItem>>("/search", { params: { q, type, page }, revalidate: 300 });
export interface BrowseParams {
  type?: "movie" | "tv";
  genre?: string;
  country?: string;
  year?: string;
  sort?: string;
}
export const browseMovies = ({ type = "movie", genre = "All", country = "All", year = "All", sort = "Hottest" }: BrowseParams = {}) =>
  movieApi<MovieBrowseResponse>("/browse", { params: { type, genre, country, year, sort }, revalidate: 1800 });
export const getMovieDetails = async (detailPath: string): Promise<MovieDetailsResponse> => {
  const raw = await movieApi<MovieDetailsRaw>("/details", { params: { detailPath }, revalidate: 3600 });
  return normalizeDetails(raw, detailPath);
};
export const getRelated = (subjectId: string, page = 1) => movieApi<MoviePaginatedResponse<MovieSlimItem>>("/related", { params: { subjectId, page }, revalidate: 1800 });
export const getSeriesEpisodes = (detailPath: string) => movieApi<MovieSeriesEpisodesResponse>("/series/episodes", { params: { detailPath }, revalidate: 3600 });
// Jangan cache — stream_url punya HMAC yang kadaluarsa 6 jam
export const getMovieFiles = (subjectId: string, detailPath: string) => movieApi<MovieFilesResponse>("/movie/files", { params: { subjectId, detailPath }, revalidate: 0 });
export const getSeriesFiles = (subjectId: string, detailPath: string, season: number, episode: number) =>
  movieApi<MovieFilesResponse>("/series/files", { params: { subjectId, detailPath, season, episode }, revalidate: 0 });

// Respons /details mentah berbentuk nested ({subject, stars, resource}) dengan
// subjectType numerik (1=movie, 2=tv) — normalisasi ke bentuk datar
function normalizeDetails(raw: MovieDetailsRaw, fallbackDetailPath: string): MovieDetailsResponse {
  const subject = raw.subject ?? {};
  const seasons = (raw.resource?.seasons ?? [])
    .filter((s) => (s.se ?? 0) > 0 && (s.maxEp ?? 0) > 0)
    .map((s) => ({
      season: s.se ?? 0,
      episodes: s.maxEp ?? 0,
      resolutions: [...new Set((s.resolutions ?? []).map((r) => r.resolution ?? 0).filter(Boolean))].sort((a, b) => a - b),
    }));

  return {
    subjectId: subject.subjectId ?? "",
    detailPath: subject.detailPath || fallbackDetailPath,
    title: subject.title ?? "",
    cover: subject.cover?.url ?? null,
    subjectType: subject.subjectType === 2 ? "tv_series" : "movies",
    description: subject.description ?? null,
    stars: (raw.stars ?? []).map((s) => s.name ?? "").filter(Boolean),
    imdbRating: toNumberOrNull(subject.imdbRatingValue),
    releaseDate: subject.releaseDate ?? null,
    genre: subject.genre ?? [],
    duration: toNumberOrNull(subject.duration) || null,
    country: subject.countryName ?? null,
    hasResource: subject.hasResource ?? true,
    trailerUrl: subject.trailer?.videoAddress?.url ?? null,
    seasons,
  };
}

// Upstream kadang kirim angka sebagai string — paksa jadi number/null
function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

export function toMovieCardData(item: MovieSlimItem): MovieCardData {
  return {
    subjectId: item.subjectId,
    detailPath: item.detailPath,
    title: item.title,
    subjectType: item.subjectType,
    image: item.cover,
    imdbRating: toNumberOrNull(item.imdbRating),
    hasResource: item.hasResource ?? true,
    description: item.description ?? null,
    releaseDate: item.releaseDate ?? null,
    genre: item.genre ?? [],
    duration: toNumberOrNull(item.duration) || null,
    country: item.country ?? null,
  };
}

export function getPublicMediaBase() {
  return (process.env.NEXT_PUBLIC_MOVIEBOX_BASE ?? "").replace(/\/$/, "");
}

// stream_url/subtitle_url dari API berupa path relatif — gabungkan dengan base publik
export function toAbsoluteMediaUrl(relativePath: string) {
  if (/^https?:\/\//.test(relativePath)) return relativePath;
  return `${getPublicMediaBase()}${relativePath}`;
}

export function absolutizeFiles(files: MovieFilesResponse): MovieFilesResponse {
  return {
    ...files,
    downloads: files.downloads.map((d) => ({ ...d, stream_url: toAbsoluteMediaUrl(d.stream_url) })),
    subtitles: files.subtitles.map((s) => ({ ...s, subtitle_url: toAbsoluteMediaUrl(s.subtitle_url) })),
  };
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  if (h > 0) return m > 0 ? `${h}j ${m}m` : `${h}j`;
  return `${m}m`;
}

export function formatFileSize(bytes: number) {
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  return `${Math.round(bytes / 1024 ** 2)} MB`;
}
