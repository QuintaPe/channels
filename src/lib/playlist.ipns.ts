/** Gateways that serve elcano.top HTML with CORS (no backend proxy needed). */
const ELCANO_SCRAPE_URLS = [
  "https://elcano-top.ipns.dweb.link/",
  "https://dweb.link/ipns/elcano-top/",
];

function parseIpnsBaseUrlFromElcanoHtml(html: string): string | null {
  const section = html.match(
    /<h2[^>]*>[\s\S]*?Enlaces útiles[\s\S]*?<\/h2>\s*<ul[^>]*>([\s\S]*?)<\/ul>/i,
  );
  if (!section) return null;

  const href = section[1].match(/<a[^>]+href="([^"]+)"/i)?.[1]?.trim();
  if (!href) return null;

  return href.replace(/\/$/, "");
}

async function scrapeIpnsBaseUrl(): Promise<string | null> {
  for (const url of ELCANO_SCRAPE_URLS) {
    try {
      const res = await fetch(url, {
        headers: { accept: "text/html,*/*" },
        redirect: "follow",
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) continue;

      const html = await res.text();
      const baseUrl = parseIpnsBaseUrlFromElcanoHtml(html);
      if (baseUrl) return baseUrl;
    } catch {
      // try next gateway
    }
  }
  return null;
}

async function resolveIpnsBaseUrl(): Promise<string> {
  const baseUrl = await scrapeIpnsBaseUrl();
  if (!baseUrl) {
    throw new Error("No se pudo obtener el enlace IPNS desde elcano.top");
  }
  return baseUrl;
}

async function fetchIpnsFile(path: string): Promise<string> {
  const baseUrl = await resolveIpnsBaseUrl();
  const res = await fetch(`${baseUrl}/${path}`, {
    headers: { accept: "*/*" },
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    throw new Error(`Error al descargar ${path}: ${res.status}`);
  }
  const text = await res.text();
  if (!text.includes("#EXTM3U")) {
    throw new Error(`La respuesta de ${path} no es un M3U válido`);
  }
  return text;
}

/**
 * Fetches the raw M3U content without any transformations
 */
export async function fetchM3uRaw(ipOverride?: string): Promise<string> {
  let text = await fetchIpnsFile("hashes.m3u");
  if (ipOverride) {
    text = text.replace(/127\.0\.0\.1/g, ipOverride);
  }
  return text;
}

/**
 * Fetches the M3U manifest and replaces all "getstream" URLs with "manifest.m3u8"
 */
export async function fetchM3uManifest(ipOverride?: string): Promise<string> {
  let text = await fetchIpnsFile("hashes.m3u");
  text = text.replace(/getstream/g, "manifest.m3u8");
  if (ipOverride) {
    text = text.replace(/127\.0\.0\.1/g, ipOverride);
  }
  return text;
}

export async function fetchAcestreamPlaylistText(): Promise<string> {
  return fetchIpnsFile("hashes_acestream.m3u");
}
