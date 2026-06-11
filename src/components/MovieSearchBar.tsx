"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useDebounce } from "@/hooks/useDebounce";
import type { MovieSuggestResponse } from "@/types/movie-api";

export default function MovieSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const cacheRef = useRef<Map<string, string[]>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = debouncedQuery.trim();
    if (q.length < 2) {
      Promise.resolve().then(() => setSuggestions([]));
      return;
    }

    const cached = cacheRef.current.get(q);
    if (cached) {
      Promise.resolve().then(() => setSuggestions(cached));
      return;
    }

    const controller = new AbortController();
    fetch(`/api/movie-proxy/suggest?q=${encodeURIComponent(q)}`, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: MovieSuggestResponse | null) => {
        if (!data) return;
        cacheRef.current.set(q, data.suggestions);
        setSuggestions(data.suggestions);
      })
      .catch(() => {});

    return () => controller.abort();
  }, [debouncedQuery]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const submit = (value: string) => {
    const q = value.trim();
    if (!q) return;
    setShowSuggestions(false);
    router.push(`/movies/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submit(query);
        }}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Cari film atau serial TV..."
            className="w-full rounded-2xl border border-white/10 bg-zinc-900/70 py-3.5 pl-12 pr-12 text-sm text-white placeholder-zinc-500 outline-none backdrop-blur-xl transition-colors focus:border-amber-400/50"
          />
          {query && (
            <button
              type="button"
              aria-label="Hapus pencarian"
              onClick={() => {
                setQuery("");
                setSuggestions([]);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-zinc-950/95 p-1.5 shadow-2xl backdrop-blur-xl">
          {suggestions.slice(0, 8).map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                setQuery(suggestion);
                submit(suggestion);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm text-zinc-200 transition-colors hover:bg-amber-500/10 hover:text-amber-300"
            >
              <Search className="h-3.5 w-3.5 shrink-0 text-zinc-600" />
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
