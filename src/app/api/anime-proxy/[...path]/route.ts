import { AnimeApiError, animeApi } from "@/lib/anime-api";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const backendPath = `/api/${path.join("/")}`;
  const queryParams = Object.fromEntries(request.nextUrl.searchParams.entries());

  try {
    const data = await animeApi<unknown>(backendPath, {
      params: queryParams,
      revalidate: 0,
    });

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof AnimeApiError) {
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
        error: "API pribadi sedang tidak dapat diakses.",
      },
      {
        status: 502,
      }
    );
  }
}
