export type MovieSubjectType = "movies" | "tv_series";

export interface MovieSlimItem {
  subjectId: string;
  detailPath: string;
  title: string;
  subjectType: MovieSubjectType;
  cover: string;
  imdbRating?: number | null;
  hasResource?: boolean;
  description?: string | null;
  releaseDate?: string | null;
  genre?: string[] | null;
  duration?: number | null; // detik
  country?: string | null;
}

export interface MovieBanner {
  title: string;
  image: string;
  subject: MovieSlimItem;
}

export interface MovieHomeRow {
  type: string; // "BANNER" | "SUBJECTS_MOVIE" | ...
  title: string;
  position: number;
  items: MovieSlimItem[];
  banners?: MovieBanner[];
}

export interface MovieHomeResponse {
  rows: MovieHomeRow[];
}

export interface MoviePaginatedResponse<T> {
  items: T[];
  page: number;
  hasMore: boolean;
}

export interface MoviePopularResponse {
  popularSearches: string[];
  hotMovies: MovieSlimItem[];
  hotTvSeries: MovieSlimItem[];
}

export interface MovieSuggestResponse {
  keyword: string;
  suggestions: string[];
}

export interface MovieBrowseResponse {
  items: MovieSlimItem[];
  filters: Record<string, string[]>; // genre, country, year, sort
}

export interface MovieSeasonInfo {
  season: number;
  episodes: number;
  resolutions: number[];
}

// Bentuk mentah respons /details (nested, beda dari slim item)
export interface MovieDetailsRaw {
  subject?: {
    subjectId?: string;
    subjectType?: number; // 1 = movie, 2 = tv_series
    title?: string;
    description?: string | null;
    releaseDate?: string | null;
    duration?: number | null;
    genre?: string[] | null;
    cover?: { url?: string | null } | null;
    countryName?: string | null;
    imdbRatingValue?: number | null;
    detailPath?: string;
    hasResource?: boolean;
    trailer?: { videoAddress?: { url?: string | null } | null } | null;
  } | null;
  stars?: Array<{ name?: string | null; character?: string | null }> | null;
  resource?: {
    seasons?: Array<{
      se?: number;
      maxEp?: number;
      resolutions?: Array<{ resolution?: number }> | null;
    }> | null;
  } | null;
}

export interface MovieDetailsResponse {
  subjectId: string;
  detailPath: string;
  title: string;
  cover: string | null;
  subjectType: MovieSubjectType;
  description: string | null;
  stars: string[];
  imdbRating: number | null;
  releaseDate: string | null;
  genre: string[];
  duration: number | null;
  country: string | null;
  hasResource: boolean;
  trailerUrl: string | null;
  seasons: MovieSeasonInfo[];
}

export interface MovieSeriesEpisodesResponse {
  detailPath: string;
  seasons: MovieSeasonInfo[];
}

export interface MovieDownloadEntry {
  resolution: number;
  size: number; // bytes
  stream_url: string;
}

export interface MovieSubtitleEntry {
  lan: string;
  lanName: string;
  subtitle_url: string;
}

export interface MovieFilesResponse {
  downloads: MovieDownloadEntry[];
  subtitles: MovieSubtitleEntry[];
  limited: boolean;
}

export interface MovieCardData {
  subjectId: string;
  detailPath: string;
  title: string;
  subjectType: MovieSubjectType;
  image: string;
  imdbRating: number | null;
  hasResource: boolean;
  description: string | null;
  releaseDate: string | null;
  genre: string[];
  duration: number | null;
  country: string | null;
}

export interface ContinueWatchingEntry {
  subjectId: string;
  detailPath: string;
  title: string;
  cover: string;
  subjectType: MovieSubjectType;
  season: number | null;
  episode: number | null;
  position: number; // detik
  duration: number; // detik
  updatedAt: number; // unix ms
}

export type ContinueWatchingRecord = Record<string, ContinueWatchingEntry>;
