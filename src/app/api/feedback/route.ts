import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Pesan wajib diisi" }, { status: 400 });
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
