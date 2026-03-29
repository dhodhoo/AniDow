/**
 * Stream Provider Module
 * Dirancang untuk memetakan respon Consumet atau Provider Eksternal.
 */

export interface Episode {
  id: string;
  number: number;
  title?: string;
  url?: string;
  isFiller?: boolean;
}

export interface StreamInfo {
  mal_id: number;
  anime_title: string;
  totalEpisodes: number;
  episodes: Episode[];
}

// Simulasi Jeda Network untuk Pembuktian UI
export async function fetchAnimeEpisodes(title: string, mal_id: number, maxEp: number = 24): Promise<StreamInfo> {
  await new Promise(resolve => setTimeout(resolve, 600)); 

  // Simulasi Array Endpoint Episode Consumet/Gogoanime
  const episodes: Episode[] = Array.from({ length: maxEp || 12 }).map((_, i) => ({
    id: `${mal_id}-episode-${i + 1}`,
    number: i + 1,
    title: `Episode ${i + 1}`,
  }));

  return {
    mal_id,
    anime_title: title,
    totalEpisodes: maxEp || 12,
    episodes
  };
}

export async function fetchEpisodeVideoURL(episodeId: string): Promise<string> {
  // Simulasi proses scraping Consumet untuk mendapatkan link M3u8 atau Iframe Source.
  // Sesuai permintaan, dialihkan ke link rahasia (Rickroll Playlist) dengan dukungan Autoplay aktif
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&list=RDdQw4w9WgXcQ&start_radio=1"; 
}
