import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect } from "vite";
import { resolveM3uContentType } from "./src/lib/m3u-response";
import { fetchM3uManifest, fetchM3uRaw } from "./src/lib/playlist.ipns";

const ROBOTS = "noindex, nofollow, noarchive, nosnippet, noimageindex";

function getQueryParams(req: IncomingMessage): URLSearchParams {
  const query = req.url?.split("?")[1] ?? "";
  return new URLSearchParams(query);
}

async function serveM3u(
  req: IncomingMessage,
  res: ServerResponse,
  fetcher: (ip?: string) => Promise<string>,
): Promise<void> {
  try {
    const params = getQueryParams(req);
    const content = await fetcher(params.get("ip") ?? undefined);
    res.statusCode = 200;
    res.setHeader(
      "Content-Type",
      resolveM3uContentType(req.headers.accept, params.get("view") ?? undefined),
    );
    res.setHeader("X-Robots-Tag", ROBOTS);
    res.end(content);
  } catch (error) {
    console.error("M3U dev middleware:", error);
    res.statusCode = 502;
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.end("No se pudo generar la lista M3U");
  }
}

export const m3uDevMiddleware: Connect.NextHandleFunction = (req, res, next) => {
  const path = req.url?.split("?")[0] ?? "";

  if (path === "/canales_manifest.m3u") {
    void serveM3u(req, res, fetchM3uManifest);
    return;
  }
  if (path === "/canales.m3u") {
    void serveM3u(req, res, fetchM3uRaw);
    return;
  }

  next();
};
