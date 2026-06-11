# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AniDow is a Next.js 16 dual-source streaming web app that consumes two private external APIs:
- **Anime** (Otakudesu) — browsing, search, iframe-embed playback, watch history
- **Film & TV** (MovieBox) — native `<video>` player, quality selection, SRT→VTT subtitles, browse with genre/country/year filters

Both sections share watchlist management and watch history tracking, all stored locally in the browser. The MovieBox backend (FastAPI) is deployed separately at `moviebox-api.nexaworks.me`.

## Development Commands

```bash
npm run dev      # Start development server on localhost:3000
npm run build    # Production build
npm run start    # Run production build locally
npm run lint     # Run ESLint
```

## Environment Configuration

Required environment variables (copy `.env.example` to `.env.local`):

```env
# MovieBox API (Film & TV)
MOVIEBOX_API_BASE_URL=http://127.0.0.1:8000
MOVIEBOX_API_KEY=your_moviebox_api_key
NEXT_PUBLIC_MOVIEBOX_BASE=http://127.0.0.1:8000

# Anime API (optional legacy)
OTAKUDESU_API_KEY=your_otakudesu_api_key_here
```

**Production (Vercel):** set `MOVIEBOX_API_BASE_URL` and `NEXT_PUBLIC_MOVIEBOX_BASE` to `https://moviebox-api.nexaworks.me`, and `MOVIEBOX_API_KEY` to the production key.

## Architecture

### API Layer Pattern

The app uses a **two-tier API architecture** for both sources:

1. **Server-side calls** (default): Pages and server components call the external API directly via `src/lib/anime-api.ts` or `src/lib/movie-api.ts`. These wrappers handle authentication headers, error mapping, and Next.js revalidation.

2. **Client-side proxy**: Client components use Next.js API routes `/api/anime-proxy/[...path]` and `/api/movie-proxy/[...path]` which forward requests while keeping API keys server-side.

**Key principle**: Never expose API keys to the browser. Stream/subtitle URLs for MovieBox are an exception — they are HMAC-signed, expire after 6 hours, and need no API key, so they point directly to `NEXT_PUBLIC_MOVIEBOX_BASE`.

### Data Flow

```
Anime: External API → anime-api.ts wrapper → Server Components (direct)
                                             ↘ /api/anime-proxy → Client Components

Film:  MovieBox API → movie-api.ts wrapper → Server Components (direct)
                                             ↘ /api/movie-proxy → Client Components
                                                                  ↘ Stream URLs → Browser (HMAC, keyless)
```

The API modules export:
- Typed API functions with revalidation strategy
- Data transformation utilities (`toAnimeCardData`, `toMovieCardData`, `normalizeDetails`, `absolutizeFiles`)
- Client-side search filtering (`searchAnimeEntries`)
- Error classes (`AnimeApiError`, `MovieApiError`) with Indonesian messages

### localStorage State Management

Watchlist and watch history use **React 19's `useSyncExternalStore`** pattern for localStorage synchronization:

- `useWatchlist()` - Stores `AnimeCardData[]` in `anidow_private_watchlist`
- `useHistory()` - Stores `{[animeSlug]: HistoryEntry}` in `anidow_private_history`

Both hooks:
- Subscribe to storage events for cross-tab sync
- Dispatch custom events for same-tab updates
- Return SSR-safe empty state on server
- Parse/validate JSON with error handling

### Type System

All API responses are typed in `src/types/anime-api.ts`. The external API returns various item shapes (`HomeAnimeItem`, `GenreCardItem`, `SearchAnimeItem`) which are normalized to `AnimeCardData` for consistent rendering across the app.

### Routing Structure

```
/                          # Anime homepage with carousels
/browse?status=ongoing     # Paginated anime list
/search?q=keyword          # Anime search results
/anime/[slug]              # Anime detail page
/watch/[episode-slug]      # Anime player page (iframe)
/watchlist                 # Watchlist (anime + film sections)

/movies                    # Film & TV landing
/movies/search?q=&type=    # Film search with type filter (all/movie/tv)
/movies/browse?type=&genre=&country=&year=&sort=   # Filterable browse
/movies/[detailPath]?id=   # Film/TV detail page
/movies/[detailPath]/watch?id=&season=&episode=     # Native video player
```

Anime episode slugs follow `{anime-slug}-episode-{number}`. MovieBox items use `detailPath` (URL-safe slug) + `subjectId` query param.

## Key Conventions

### API Revalidation Strategy

Different content types use different revalidation intervals in `anime-api.ts`:

- Homepage/ongoing: 600s (10 min)
- Complete anime: 3600s (1 hour)
- Anime list: 86400s (24 hours)
- Search: 300s (5 min)
- Episode data: 600s (10 min)

### Error Handling

`AnimeApiError` class wraps API failures with:
- HTTP status code
- Original response body
- User-friendly Indonesian error messages for common status codes (429, 502)

### Component Patterns

- **Loading states**: Each route has a `loading.tsx` with skeleton UI
- **Animations**: Framer Motion is used for page transitions (see `template.tsx`) and interactive elements
- **Styling**: Tailwind CSS v4 with `clsx` and `tailwind-merge` via `src/lib/utils.ts`

### Search Implementation

Search uses a **hybrid approach**:
- Fetches full anime list once (cached 24h)
- Filters client-side with `searchAnimeEntries()` for instant results
- Scoring: exact match → starts with → contains → no match
- Normalizes text by removing common suffixes ("Subtitle Indonesia", "Sub Indo", "Batch")

## Important Notes

- The app uses **React 19** and **Next.js 16 App Router**—ensure compatibility when adding dependencies
- **Babel React Compiler** is enabled (`babel-plugin-react-compiler`)
- All anime data comes from the external API; there is no local database
- Video playback uses iframe embeds from the API's mirror URLs
- Download links are external and provided by the API
- The project is in Indonesian—UI text, error messages, and comments use Indonesian language
