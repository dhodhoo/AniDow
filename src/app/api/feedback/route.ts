import { NextRequest, NextResponse } from "next/server";

// Rate limit per IP: in-memory sliding window (reset saat server restart)
const RATE_LIMIT = 5; // max request
const RATE_WINDOW = 10 * 60 * 1000; // 10 menit
const rateBuckets = new Map<string, number[]>();

function checkRate(ip: string): boolean {
  const now = Date.now();
  const bucket = (rateBuckets.get(ip) || []).filter((t) => now - t < RATE_WINDOW);
  if (bucket.length >= RATE_LIMIT) return false;
  bucket.push(now);
  rateBuckets.set(ip, bucket);
  return true;
}

// Validasi origin: tolak request cross-site
function isValidOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin) return true; // same-origin request kadang tanpa origin header
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Origin validation
    if (!isValidOrigin(request)) {
      return NextResponse.json({ error: "Origin tidak valid" }, { status: 403 });
    }

    // Rate limit per IP
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")
      || "unknown";
    if (!checkRate(ip)) {
      return NextResponse.json(
        { error: "Terlalu banyak feedback. Coba lagi nanti." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name, type, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Pesan wajib diisi" }, { status: 400 });
    }

    // Batasi panjang input (cegah abuse)
    if (message.length > 2000 || (name && name.length > 100)) {
      return NextResponse.json({ error: "Input terlalu panjang" }, { status: 400 });
    }

    const webhookUrl = process.env.DISCORD_FEEDBACK_WEBHOOK;

    if (webhookUrl) {
      // Forward ke Discord webhook
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          embeds: [
            {
              title: `[${type}] dari ${name || "Anonim"}`,
              description: message.trim(),
              color: type === "Bug" ? 0xef4444 : type === "Saran" ? 0x6366f1 : 0xf59e0b,
              timestamp: new Date().toISOString(),
              footer: { text: "AniDow Feedback" },
            },
          ],
        }),
      });
    } else {
      // Fallback: log ke console
      console.log(`[FEEDBACK] ${type} dari ${name || "Anonim"}: ${message.trim()}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Feedback API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
