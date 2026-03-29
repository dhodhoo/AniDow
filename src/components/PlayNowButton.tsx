"use client";

import { motion } from "framer-motion";
import { MonitorPlay, History } from "lucide-react";
import Link from "next/link";
import { useHistory } from "@/hooks/useHistory";
import { useState, useEffect } from "react";

export default function PlayNowButton({ animeId }: { animeId: number }) {
  const { getLastWatched, isLoaded } = useHistory();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Structural pulse while fetching client storages seamlessly
  if (!mounted || !isLoaded) {
    return <div className="w-48 h-12 bg-indigo-500/20 animate-[pulse_2s_ease-out_infinite] rounded-full border border-indigo-400/30" />;
  }

  const lastEp = getLastWatched(animeId);
  const targetEp = lastEp || 1;

  return (
    <Link href={`/watch/${animeId}?ep=${targetEp}`}>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-500 transition-all text-white px-8 py-3.5 rounded-full font-black text-sm shadow-[0_0_20px_rgba(99,102,241,0.5)] border border-indigo-400"
      >
        {lastEp ? <History className="w-5 h-5 fill-indigo-200" /> : <MonitorPlay className="w-5 h-5 fill-indigo-200" />}
        {lastEp ? `Lanjutkan Ep ${lastEp}` : "Tonton Anime"}
      </motion.button>
    </Link>
  );
}
