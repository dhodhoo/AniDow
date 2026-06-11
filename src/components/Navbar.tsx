"use client";

import { Search, Bookmark, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchSuggestion {
  title: string;
  slug: string | null; // null = saran film (hanya keyword, tanpa halaman detail langsung)
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";

  // Mode mengikuti rute: /movies* = film, sisanya = anime
  const isMovieMode = pathname === "/movies" || pathname.startsWith("/movies/");

  const [isFocused, setIsFocused] = useState(false);
  const [search, setSearch] = useState(q);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const suggestionCacheRef = useRef(new Map<string, SearchSuggestion[]>());

  const debouncedSearch = useDebounce(search, 300);

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

  const loadSuggestions = async (value: string, movieMode: boolean) => {
    const query = value.trim();
    abortControllerRef.current?.abort();

    if (!query) {
      Promise.resolve().then(() => setSuggestions([]));
      return;
    }

    const cacheKey = `${movieMode ? "m" : "a"}:${query.toLowerCase()}`;
    const cachedSuggestions = suggestionCacheRef.current.get(cacheKey);
    if (cachedSuggestions) {
      Promise.resolve().then(() => setSuggestions(cachedSuggestions));
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      let items: SearchSuggestion[] = [];

      if (movieMode) {
        const params = new URLSearchParams({ q: query });
        const response = await fetch(`/api/movie-proxy/suggest?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = await response.json() as { suggestions?: string[] };
        items = (data.suggestions ?? []).slice(0, 6).map((title) => ({ title, slug: null }));
      } else {
        const params = new URLSearchParams({ q: query, limit: "6" });
        const response = await fetch(`/api/anime-proxy/search/suggestions?${params.toString()}`, {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data = await response.json() as { items?: Array<{ title: string; slug: string }> };
        items = data.items ?? [];
      }

      suggestionCacheRef.current.set(cacheKey, items);
      setSuggestions(items);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        setSuggestions([]);
      }
    }
  };

  useEffect(() => {
    if (isFocused) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadSuggestions(debouncedSearch, isMovieMode);
    }
  }, [debouncedSearch, isFocused, isMovieMode]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setIsFocused(true);
  };

  const submitSearch = (query: string) => {
    setIsFocused(false);
    setSuggestions([]);
    if (isMovieMode) {
      router.push(query ? `/movies/search?q=${encodeURIComponent(query)}` : "/movies");
    } else {
      router.push(query ? `/search?q=${encodeURIComponent(query)}` : "/");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitSearch(search.trim());
  };

  const handleSuggestionClick = () => {
    setIsFocused(false);
    setSuggestions([]);
  };

  // Warna aksen mengikuti mode
  const accent = isMovieMode
    ? {
        focusBorder: "border-amber-500/50 shadow-[0_0_0_1px_rgba(245,158,11,0.5)]",
        suggestionHover: "hover:bg-amber-500/15 hover:text-amber-300",
        logoHover: "hover:text-amber-400",
        logoRing: "border-amber-300/60 shadow-[0_0_18px_rgba(245,158,11,0.35)]",
        navHover: "hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/50",
      }
    : {
        focusBorder: "border-indigo-500/50 shadow-[0_0_0_1px_rgba(99,102,241,0.5)]",
        suggestionHover: "hover:bg-indigo-500/15 hover:text-indigo-300",
        logoHover: "hover:text-indigo-400",
        logoRing: "border-indigo-300/60 shadow-[0_0_18px_rgba(168,85,247,0.35)]",
        navHover: "hover:bg-indigo-500/20 hover:text-indigo-400 hover:border-indigo-500/50",
      };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-3 py-3 sm:px-6 sm:py-4 animate-slide-down">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass-card rounded-2xl px-3 py-2.5 sm:px-6 sm:py-3 gap-2">
        {/* Logo + Mode Switcher */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link href={isMovieMode ? "/movies" : "/"} className="flex items-center gap-2">
            <div className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-white/95 flex items-center justify-center border transition-all duration-300 hover:scale-105 hover:rotate-5 shrink-0 ${accent.logoRing}`}>
              <Image
                src="/logo.png"
                alt="AniDow logo"
                fill
                sizes="(max-width: 640px) 36px, 40px"
                priority
                className="object-cover"
              />
            </div>
            <span className={`font-bold text-xl tracking-tight text-white transition-colors hidden lg:block ${accent.logoHover}`}>
              AniDow
            </span>
          </Link>

          {/* Segmented Anime | Film */}
          <div className="flex items-center rounded-xl border border-zinc-700/50 bg-zinc-900/50 p-1 shadow-[0_0_15px_rgba(0,0,0,0.5)]">
            <Link
              href="/"
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors sm:px-3.5 ${
                !isMovieMode
                  ? "bg-indigo-600 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                  : "text-zinc-400 hover:text-indigo-300"
              }`}
            >
              Anime
            </Link>
            <Link
              href="/movies"
              className={`rounded-lg px-2.5 py-1.5 text-xs font-bold transition-colors sm:px-3.5 ${
                isMovieMode
                  ? "bg-amber-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                  : "text-zinc-400 hover:text-amber-300"
              }`}
            >
              Film
            </Link>
          </div>
        </div>

        {/* Dynamic Search Bar & Shortcuts */}
        <div className="flex items-center w-full sm:w-auto min-w-0">
          <div className="relative w-full sm:w-64 md:w-80">
            <form
              onSubmit={handleSearchSubmit}
              className={`flex items-center bg-zinc-900/50 rounded-xl px-3 py-2 sm:px-4 border transition-all duration-300 ${
                isFocused ? accent.focusBorder : "border-zinc-700/50 hover:border-zinc-600/50"
              }`}
            >
              <Search className="w-4 h-4 text-zinc-400 mr-2 shrink-0" />
              <input
                type="search"
                placeholder={isMovieMode ? "Cari film atau TV..." : "Cari anime..."}
                value={search}
                onChange={handleSearchChange}
                className="bg-transparent border-none outline-none text-sm text-zinc-200 placeholder:text-zinc-500 w-full"
                onFocus={() => {
                  setIsFocused(true);
                }}
                onBlur={() => setTimeout(() => setIsFocused(false), 150)}
              />
            </form>

            {isFocused && suggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 max-h-[60vh] overflow-y-auto rounded-xl border border-white/10 bg-zinc-950/95 shadow-2xl backdrop-blur-xl">
                {suggestions.map((item) =>
                  item.slug ? (
                    <Link
                      key={item.slug}
                      href={`/anime/${item.slug}`}
                      onClick={handleSuggestionClick}
                      className={`block border-b border-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors last:border-b-0 ${accent.suggestionHover}`}
                    >
                      {item.title}
                    </Link>
                  ) : (
                    <button
                      key={item.title}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearch(item.title);
                        submitSearch(item.title);
                      }}
                      className={`block w-full text-left border-b border-white/5 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors last:border-b-0 ${accent.suggestionHover}`}
                    >
                      {item.title}
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          {/* Quick Nav Links */}
          <div className="flex items-center gap-1.5 ml-2 sm:gap-2 sm:ml-3">
            <Link
               href={isMovieMode ? "/movies/browse" : "/browse"}
               title="Jelajahi Semua"
               className={`p-2 sm:p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-700/50 text-zinc-400 transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] ${accent.navHover}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </Link>
            <Link
               href="/watchlist"
               title="Watchlist Saya"
               className={`p-2 sm:p-2.5 rounded-xl bg-zinc-900/50 border border-zinc-700/50 text-zinc-400 transition-colors flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] ${accent.navHover}`}
            >
              <Bookmark className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </nav>
  );
}
