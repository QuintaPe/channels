import type { VercelRequest, VercelResponse } from "@vercel/node";
import { fetchM3uManifest } from "../src/lib/playlist.ipns.js";
import { resolveM3uContentType } from "../src/lib/m3u-response.js";

const ROBOTS = "noindex, nofollow, noarchive, nosnippet, noimageindex";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const ipParam = req.query.ip;
    const ipOverride = typeof ipParam === "string" ? ipParam : undefined;
    const content = await fetchM3uManifest(ipOverride);

    res.setHeader("Content-Type", resolveM3uContentType(req.headers.accept, req.query.view));
    res.setHeader("Cache-Control", "public, max-age=300");
    res.setHeader("X-Robots-Tag", ROBOTS);
    res.status(200).send(content);
  } catch (error) {
    console.error("canales_manifest.m3u:", error);
    res.setHeader("X-Robots-Tag", ROBOTS);
    res.status(502).json({ error: "No se pudo generar la lista M3U" });
  }
}
