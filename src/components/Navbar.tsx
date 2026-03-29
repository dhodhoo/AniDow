"use client";

import { motion } from "framer-motion";
import { Search, Bookmark, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  
  const [isFocused, setIsFocused] = useState(false);
  const [search, setSearch] = useState(q);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  // Sinkronisasi teks pencarian saat user berpindah halaman melalui link
  useEffect(() => {
    setSearch(q);
  }, [q]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (val) {
        router.push(`/search?q=${encodeURIComponent(val)}`);
      } else {
        router.push('/');
      }
    }, 500);
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeOut", duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card rounded-2xl px-6 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all"
          >
            <div className="w-3 h-3 rounded-full bg-indigo-400" />
          </motion.div>
          <span className="font-bold text-xl tracking-tight text-white hover:text-indigo-400 transition-colors hidden sm:block">
            AniDow
          </span>
        </Link>

        {/* Dynamic Search Bar & Shortcuts */}
        <div className="flex items-center w-full ml-4 sm:ml-0 sm:w-auto">
          <div className="relative w-full sm:w-80 md:w-96">
            <motion.div 
              animate={{ 
                boxShadow: isFocused ? "0 0 0 1px rgba(99,102,241,0.5)" : "0 0 0 0px rgba(99,102,241,0)"
              }}
              className="flex items-center bg-zinc-900/50 rounded-xl px-4 py-2 border border-zinc-700/50 transition-colors hover:border-zinc-600/50"
            >
              <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
              <input 
                type="text"
                placeholder="Cari anime..."
                value={search}
                onChange={handleSearchChange}
                className="bg-transparent border-none outline-none text-sm text-zinc-200 placeholder:text-zinc-500 w-full"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
              />
            </motion.div>
          </div>

          {/* Quick Nav Links */}
          <div className="flex items-center gap-2 ml-3">
            <Link 
               href="/browse" 
               title="Jelajahi Semua"
               className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-700/50 text-zinc-400 hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <LayoutGrid className="w-4 h-4" />
            </Link>
            <Link 
               href="/watchlist" 
               title="Watchlist Saya"
               className="p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-700/50 text-zinc-400 hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <Bookmark className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </motion.nav>
  );
}
