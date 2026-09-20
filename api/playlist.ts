import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchAcestreamPlaylist } from "../src/lib/playlist.ipns.js";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const { text, generatedAt } = await fetchAcestreamPlaylist();

    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=86400, stale-if-error=86400",
    );
    if (generatedAt) res.setHeader("X-Playlist-Generated", generatedAt);
    res.status(200).send(text);
  } catch (error) {
    console.error("playlist:", error);
    res.status(502).json({ error: "No se pudo cargar la lista" });
  }
}
