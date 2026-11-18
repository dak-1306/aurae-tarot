import dns from "node:dns";
import { TAROT_CARD_MAP } from "@/constants/tarot-deck";

dns.setDefaultResultOrder("ipv4first");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cardId = searchParams.get("cardId")?.trim() ?? "";

  const card = TAROT_CARD_MAP[cardId];
  if (!card) {
    return Response.json({ error: "Mã lá bài không hợp lệ." }, { status: 400 });
  }

  try {
    const upstream = await fetch(card.imageUrl, {
      headers: {
        "User-Agent": "AuraeTarotApp/1.0 (Editorial Tarot Reader)",
        Accept: "image/webp,image/jpeg,image/png,image/*,*/*;q=0.8",
      },
      redirect: "follow",
    });

    if (!upstream.ok) {
      return Response.json(
        { error: "Không thể tải ảnh nguồn của lá bài." },
        { status: 502 },
      );
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg";
    const imageBuffer = await upstream.arrayBuffer();

    return new Response(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=604800, immutable",
      },
    });
  } catch {
    return Response.json(
      { error: "Lỗi kết nối khi lấy ảnh lá bài." },
      { status: 502 },
    );
  }
}
