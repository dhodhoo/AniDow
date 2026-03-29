export interface JikanImage {
  image_url: string;
  small_image_url: string;
  large_image_url: string;
}

export interface AnimeGenre {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface Anime {
  mal_id: number;
  url: string;
  images: {
    jpg: JikanImage;
    webp: JikanImage;
  };
  trailer?: {
    youtube_id: string;
    url: string;
    embed_url: string;
    images?: {
      image_url: string;
      small_image_url: string;
      medium_image_url: string;
      large_image_url: string;
      maximum_image_url: string;
    };
  };
  title: string;
  title_english: string | null;
  title_japanese: string | null;
  synopsis: string | null;
  score: number | null;
  scored_by: number | null;
  episodes: number | null;
  status: string;
  genres: AnimeGenre[];
  year: number | null;
  type: string;
  studios?: { name: string }[];
}

export interface JikanResponse<T> {
  data: T;
  pagination?: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: { count: number; total: number; per_page: number; };
  };
}

export interface Character {
  character: {
    mal_id: number;
    name: string;
    images: { webp: { image_url: string } };
  };
  role: string;
}
