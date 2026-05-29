"use client";

import { motion } from "framer-motion";
import { MonitorPlay, History } from "lucide-react";
import Link from "next/link";
import { useHistory } from "@/hooks/useHistory";
import { EpisodeRef } from "@/types/anime-api";

interface PlayNowButtonProps {
  animeSlug: string;
  episodes: EpisodeRef[];
}

function findFirstEpisode(episodes: EpisodeRef[]) {
  return [...episodes].sort((a, b) => Number(a.episode || 0) - Number(b.episode || 0))[0];
}

export default function PlayNowButton({ animeSlug, episodes }: PlayNowButtonProps) {
  const { getLastWatched, isLoaded } = useHistory();

  // Structural pulse while fetching client storages seamlessly
  if (!isLoaded) {
    return <div className="w-full sm:w-48 h-12 bg-indigo-500/20 animate-[pulse_2s_ease-out_infinite] rounded-full border border-indigo-400/30" />;

  }

  const lastWatched = getLastWatched(animeSlug);
  const firstEpisode = findFirstEpisode(episodes);
  const targetEpisode = lastWatched?.episodeSlug || firstEpisode?.slug;

  return (
    <Link href={targetEpisode ? `/watch/${targetEpisode}` : "#"} aria-disabled={!targetEpisode} className="w-full sm:w-auto">

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex w-full sm:w-auto items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-500 transition-all text-white px-8 py-3.5 rounded-full font-black text-sm shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-indigo-400"
      >
        {lastWatched ? <History className="w-5 h-5 fill-indigo-200" /> : <MonitorPlay className="w-5 h-5 fill-indigo-200" />}
        {lastWatched ? `Lanjutkan ${lastWatched.episodeLabel}` : "Tonton Anime"}
      </motion.button>
    </Link>
  );
}
