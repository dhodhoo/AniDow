import { MovieApiError, absolutizeFiles, movieApi } from "@/lib/movie-api";
import type { MovieFilesResponse } from "@/types/movie-api";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

    // Rewrite stream_url/subtitle_url relatif jadi absolut untuk respons /files
    const payload = isFilesResponse(data) ? absolutizeFiles(data) : data;

    return NextResponse.json(payload);
  } catch (error) {
    if (error instanceof MovieApiError) {
      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: error.status,
        }
      );
    }

    return NextResponse.json(
      {
        error: "Layanan film sedang tidak dapat diakses.",
      },
      {
        status: 502,
      }
    );
  }
}
