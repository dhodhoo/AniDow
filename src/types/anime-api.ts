export interface Pagination {
  current?: number;
  currentPage?: number;
  totalPages: number;
  totalItems?: number;
  hasNextPage?: boolean;
  nextUrl?: string | null;
  prevUrl?: string | null;
}

export interface HomeAnimeItem {
  title: string;
  url: string;
  slug: string;
  image: string;
  date: string;
  currentEpisode?: string | null;
  day?: string | null;
  totalEpisodes?: string | null;
  score?: string | null;
}

export interface Genre {
  name: string;
  url: string;
  slug: string;
}

export interface GenreCardItem {
  title: string;
  url: string;
  slug: string;
  studio: string | null;
  episodes: string | null;
  rating: string | null;
  genres: string[];
  image: string | null;
  synopsis: string | null;
  season: string | null;
}

export interface AnimeCardData {
  title: string;
  slug: string;
  image?: string | null;
  date?: string | null;
  currentEpisode?: string | null;
  day?: string | null;
  totalEpisodes?: string | null;
  score?: string | null;
  rating?: string | null;
  episodes?: string | null;
  studio?: string | null;
  genres?: string[];
  season?: string | null;
  synopsis?: string | null;
}

export interface HomeSection {
  heading: string;
  moreUrl: string;
  kind: "ongoing" | "complete" | string;
  items: HomeAnimeItem[];
}

export interface HomeResponse {
  homeUrl: string;
  ongoing: HomeAnimeItem[];
  complete: HomeAnimeItem[];
  sections?: HomeSection[];
}

export interface ListResponse<T> {
  url: string;
  kind?: string;
  count: number;
  items: T[];
  pagination: Pagination | null;
}

export interface AnimeInfo {
  judul: string;
  japanese: string;
  skor: string | null;
  produser: string;
  tipe: string;
  status: string;
  totalEpisode: string;
  durasi: string;
  tanggalRilis: string;
  studio: string;
  genres: string[];
}

export interface EpisodeRef {
  title: string;
  url: string;
  slug: string;
  episode: string | null;
  date: string;
}

export interface AnimeResponse {
  animeUrl: string;
  title: string;
  image: string;
  info: AnimeInfo;
  synopsis: string;
  episodeCount: number;
  episodes: EpisodeRef[];
  batches: EpisodeRef[];
}

export interface DownloadLink {
  host: string;
  url: string;
}

export interface DownloadItem {
  quality: string;
  sizeMB: number | null;
  links: DownloadLink[];
}

export interface DownloadGroup {
  heading: string;
  items: DownloadItem[];
}

export interface Mirror {
  quality: string;
  mirrorIndex: number;
  host: string | null;
  iframeUrl?: string | null;
  directUrl?: string | null;
  error?: string;
  resolved?: boolean;
}

export interface EpisodeListItem {
  url: string;
  slug: string;
  label: string;
  episode: string;
}

export interface EpisodeResponse {
  episodeUrl: string;
  slug: string;
  title: string;
  animeUrl: string;
  animeSlug: string;
  prevEpisodeUrl: string | null;
  nextEpisodeUrl: string | null;
  episodeList: EpisodeListItem[];
  defaultIframe: string | null;
  downloads: DownloadGroup[];
  mirrors: Mirror[];
}

export interface SearchItem {
  title: string;
  url: string;
  kind: "episode" | "anime" | "other";
  slug: string | null;
  status: string | null;
  rating: string | null;
  genres: string | null;
}

export interface SearchResponse {
  keyword: string;
  url: string;
  count: number;
  items: SearchItem[];
}

export interface AnimeListEntry {
  title: string;
  url: string;
  slug: string;
  fullTitle: string;
}

export interface AnimeListGroup {
  letter: string;
  count: number;
  anime: AnimeListEntry[];
}

export interface AnimeListResponse {
  listUrl: string;
  totalAnime: number;
  groups: AnimeListGroup[];
}

export interface SearchAnimeItem {
  title: string;
  slug: string;
  image?: string | null;
  status?: string | null;
  totalEpisodes?: string | null;
  episodes?: string | null;
  score?: string | null;
  rating?: string | null;
  genres?: string[];
  synopsis?: string | null;
  studio?: string | null;
  season?: string | null;
  date?: string | null;
  currentEpisode?: string | null;
  day?: string | null;
}

export interface SearchAnimeResponse {
  query?: string;
  keyword?: string;
  count?: number;
  items: SearchAnimeItem[];
  pagination?: Pagination | null;
}

export interface SearchSuggestionItem {
  title: string;
  slug: string;
}

export interface SearchSuggestionsResponse {
  query?: string;
  items: SearchSuggestionItem[];
}

export interface GenreListResponse {
  genreListUrl: string;
  count: number;
  genres: Genre[];
}
