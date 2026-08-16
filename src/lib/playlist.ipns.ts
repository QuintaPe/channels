/** Gateways that serve elcano.top HTML with CORS (no backend proxy needed). */
const ELCANO_SCRAPE_URLS = [
  "https://elcano-top.ipns.dweb.link/",
  "https://dweb.link/ipns/elcano-top/",
];

/**
 * IPNS key that actually serves the playlist files (found via elcano.top's
 * "Enlaces útiles" section). elcano.top's own DNSLink can go stale/offline
 * independently of this key, so we try it directly before falling back to
 * scraping elcano.top for a (possibly rotated) key.
 */
const KNOWN_IPNS_BASE_URLS = [
  "https://k51qzi5uqu5di462t7j4vu4akwfhvtjhy88qbupktvoacqfqe9uforjvhyi4wr.ipns.dweb.link",
  "https://ipfs.io/ipns/k51qzi5uqu5di462t7j4vu4akwfhvtjhy88qbupktvoacqfqe9uforjvhyi4wr",
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

async function fetchFromBaseUrl(baseUrl: string, path: string): Promise<string> {
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

async function fetchIpnsFile(path: string): Promise<string> {
  for (const baseUrl of KNOWN_IPNS_BASE_URLS) {
    try {
      return await fetchFromBaseUrl(baseUrl, path);
    } catch {
      // try next known base, then fall back to scraping elcano.top
    }
  }
  const baseUrl = await resolveIpnsBaseUrl();
  return fetchFromBaseUrl(baseUrl, path);
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
