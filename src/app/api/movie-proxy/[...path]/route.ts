import { MovieApiError, absolutizeFiles, movieApi } from "@/lib/movie-api";
import type { MovieFilesResponse } from "@/types/movie-api";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Cache-Control selektif per jenis endpoint
// /files: stream URL expire 6 jam — tidak boleh cache
// /suggest: live autocomplete — tidak cache
// endpoint stabil: cache di CDN edge + stale-while-revalidate
const SHORT_CACHE = "public, s-maxage=300, stale-while-revalidate=3600";
const LONG_CACHE = "public, s-maxage=3600, stale-while-revalidate=86400";
const HOME_CACHE = "public, s-maxage=600, stale-while-revalidate=86400";

const CACHE_POLICY: Record<string, string> = {
  home: HOME_CACHE,
  trending: HOME_CACHE,
  popular: HOME_CACHE,
  search: SHORT_CACHE,
  browse: SHORT_CACHE,
  related: SHORT_CACHE,
  details: LONG_CACHE,
  "series/episodes": LONG_CACHE,
};

function isFilesResponse(data: unknown): data is MovieFilesResponse {
  return typeof data === "object" && data !== null && "downloads" in data && "subtitles" in data;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendPath = `/${path.join("/")}`;
  const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());

  try {
    const data = await movieApi<unknown>(backendPath, {
      params: queryParams,
      revalidate: 0,
    });

    const payload = isFilesResponse(data) ? absolutizeFiles(data) : data;

    const endpointKey = path[0];
    const cacheHeader = CACHE_POLICY[endpointKey];

    return NextResponse.json(payload, cacheHeader ? {
      headers: { "Cache-Control": cacheHeader },
    } : undefined);
  } catch (error) {
    if (error instanceof MovieApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      { error: "Layanan film sedang tidak dapat diakses." },
      { status: 502 }
    );
  }
}
