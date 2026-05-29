"use client";

import { motion } from "framer-motion";
import { Search, Bookmark, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchSuggestion {
  title: string;
  slug: string;
}


export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  
  const [isFocused, setIsFocused] = useState(false);
  const [search, setSearch] = useState(q);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const suggestionCacheRef = useRef(new Map<string, SearchSuggestion[]>());

  useEffect(() => {
    if (isFocused) return;

    const timeout = setTimeout(() => {
      setSearch(q);
    }, 0);

    return () => clearTimeout(timeout);
  }, [isFocused, q]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const loadSuggestions = async (value: string) => {
    const query = value.trim();
    abortControllerRef.current?.abort();

    if (!query) {
      setSuggestions([]);
      return;
    }

    const cacheKey = query.toLowerCase();
    const cachedSuggestions = suggestionCacheRef.current.get(cacheKey);
    if (cachedSuggestions) {
      setSuggestions(cachedSuggestions);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const params = new URLSearchParams({ q: query, limit: "6" });
      const response = await fetch(`/api/anime-proxy/search/suggestions?${params.toString()}`, {
        signal: controller.signal,
      });
      if (!response.ok) return;

      const data = await response.json() as { items?: SearchSuggestion[] };
      const items = data.items ?? [];
      suggestionCacheRef.current.set(cacheKey, items);
      setSuggestions(items);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setSuggestions([]);
      }
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setIsFocused(true);
    loadSuggestions(value);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = search.trim();
    setIsFocused(false);
    setSuggestions([]);
    router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/");
  };

  const handleSuggestionClick = () => {
    setIsFocused(false);
    setSuggestions([]);
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ ease: "easeOut", duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-3 py-3 sm:px-6 sm:py-4"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card rounded-2xl px-3 py-2.5 sm:px-6 sm:py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-white/95 flex items-center justify-center border border-indigo-300/60 shadow-[0_0_18px_rgba(168,85,247,0.35)] transition-all shrink-0"

          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt="AniDow logo"
              className="h-full w-full object-cover"
            />
          </motion.div>
          <span className="font-bold text-xl tracking-tight text-white hover:text-indigo-400 transition-colors hidden sm:block">
            AniDow
          </span>
        </Link>

        {/* Dynamic Search Bar & Shortcuts */}
        <div className="flex items-center w-full ml-3 sm:ml-0 sm:w-auto">
          <div className="relative w-full sm:w-80 md:w-96">
            <motion.form
              onSubmit={handleSearchSubmit}
              animate={{ 
                boxShadow: isFocused ? "0 0 0 1px rgba(99,102,241,0.5)" : "0 0 0 0px rgba(99,102,241,0)"
              }}
              className="flex items-center bg-zinc-900/50 rounded-xl px-3 py-2 sm:px-4 border border-zinc-700/50 transition-colors hover:border-zinc-600/50"
            >
              <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
              <input 
                type="search"
                placeholder="Cari anime..."
                value={search}
                onChange={handleSearchChange}
                className="bg-transparent border-none outline-none text-sm text-zinc-200 placeholder:text-zinc-500 w-full"
                onFocus={() => {
                  setIsFocused(true);
                  loadSuggestions(search);
                }}
                onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              />
            </motion.form>

            {isFocused && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-[60vh] overflow-y-auto rounded-xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl">
                {suggestions.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/anime/${item.slug}`}
                    onClick={handleSuggestionClick}
                    className="block border-b border-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors last:border-b-0 hover:bg-indigo-500/15 hover:text-indigo-300"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Quick Nav Links */}
          <div className="flex items-center gap-1.5 ml-2 sm:gap-2 sm:ml-3">
            <Link 
               href="/browse" 
               title="Jelajahi Semua"
               className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-700/50 text-zinc-400 hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <LayoutGrid className="w-4 h-4" />
            </Link>
            <Link 
               href="/watchlist" 
               title="Watchlist Saya"
               className="p-2 sm:p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-700/50 text-zinc-400 hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/50 transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            >
              <Bookmark className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </motion.nav>
  );
}
