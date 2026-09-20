/** Gateways that serve elcano.top HTML with CORS (no backend proxy needed). */
const ELCANO_SCRAPE_URLS = [
  "https://elcano-top.ipns.dweb.link/",
  "https://dweb.link/ipns/elcano-top/",
];

/**
 * IPNS key that actually serves the playlist files (found via elcano.top's
 * "Enlaces útiles" section). elcano.top's own DNSLink can go stale/offline
 * independently of this key.
 */
const IPNS_KEY = "k51qzi5uqu5di462t7j4vu4akwfhvtjhy88qbupktvoacqfqe9uforjvhyi4wr";

/**
 * ipfs.io / dweb.link (and w3s.link, nftstorage.link) are moving to a service
 * worker gateway only and answer plain fetches with 429 (Sunset 2026-09-21).
 * So we resolve the IPNS name ourselves through delegated routing and download
 * the file by CID from gateways that still serve plain HTTP.
 */
const DELEGATED_ROUTING_IPNS_URL = "https://delegated-ipfs.dev/routing/v1/ipns";
const CID_GATEWAYS = ["https://ipfs.filebase.io/ipfs", "https://gateway.pinata.cloud/ipfs"];

/** Legacy public gateways: kept as a last resort in case they come back. */
const KNOWN_IPNS_BASE_URLS = [
  `https://${IPNS_KEY}.ipns.dweb.link`,
  `https://ipfs.io/ipns/${IPNS_KEY}`,
];

/** Last good content per file, so a warm instance survives a gateway outage. */
const lastGood = new Map<string, string>();

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
    throw new Error("No se pudo descargar la lista: las gateways IPFS no responden");
  }
  return baseUrl;
}

type Validator = (text: string) => boolean;

const isM3u: Validator = (text) => text.includes("#EXTM3U");
const isHashesJson: Validator = (text) => /"generated"\s*:/.test(text);

async function fetchFromBaseUrl(
  baseUrl: string,
  path: string,
  isValid: Validator,
): Promise<string> {
  const res = await fetch(`${baseUrl}/${path}`, {
    headers: { accept: "*/*" },
    redirect: "follow",
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    throw new Error(`Error al descargar ${path}: ${res.status}`);
  }
  const text = await res.text();
  if (!isValid(text)) {
    throw new Error(`La respuesta de ${path} no tiene el formato esperado`);
  }
  return text;
}

/**
 * Resolves the IPNS key to its current root CID via delegated routing.
 * The IPNS record signature is not verified here (same trust level as the
 * public gateways this replaces).
 */
async function fetchIpnsRecordCid(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { accept: "application/vnd.ipfs.ipns-record" },
    signal: AbortSignal.timeout(8_000),
  });
  if (!res.ok) {
    throw new Error(`Error al resolver IPNS: ${res.status}`);
  }
  const record = new TextDecoder("latin1").decode(await res.arrayBuffer());
  const cid = record.match(/\/ipfs\/([A-Za-z0-9]+)/)?.[1];
  if (!cid) {
    throw new Error("El registro IPNS no contiene un CID");
  }
  return cid;
}

async function resolveIpnsCidUncached(): Promise<string> {
  const url = `${DELEGATED_ROUTING_IPNS_URL}/${IPNS_KEY}`;
  try {
    // The router's CDN can serve a record up to ~24h old (stale-while-revalidate),
    // so ask with a unique query string to skip that cache and get the current one.
    return await fetchIpnsRecordCid(`${url}?cb=${Date.now()}`);
  } catch {
    return fetchIpnsRecordCid(url);
  }
}

/** Shared for a few seconds so the list and its date come from the same CID. */
let pendingCid: { promise: Promise<string>; at: number } | null = null;

function resolveIpnsCid(): Promise<string> {
  if (pendingCid && Date.now() - pendingCid.at < 30_000) return pendingCid.promise;
  const promise = resolveIpnsCidUncached();
  pendingCid = { promise, at: Date.now() };
  promise.catch(() => {
    if (pendingCid?.promise === promise) pendingCid = null;
  });
  return promise;
}

async function fetchViaResolvedCid(path: string, isValid: Validator): Promise<string> {
  const cid = await resolveIpnsCid();
  return Promise.any(
    CID_GATEWAYS.map((gateway) => fetchFromBaseUrl(`${gateway}/${cid}`, path, isValid)),
  );
}

async function fetchIpnsFileUncached(path: string, isValid: Validator): Promise<string> {
  try {
    return await fetchViaResolvedCid(path, isValid);
  } catch {
    // fall through to the legacy gateways
  }
  for (const baseUrl of KNOWN_IPNS_BASE_URLS) {
    try {
      return await fetchFromBaseUrl(baseUrl, path, isValid);
    } catch {
      // try next known base, then fall back to scraping elcano.top
    }
  }
  const baseUrl = await resolveIpnsBaseUrl();
  return fetchFromBaseUrl(baseUrl, path, isValid);
}

async function fetchIpnsFile(path: string, isValid: Validator = isM3u): Promise<string> {
  try {
    const text = await fetchIpnsFileUncached(path, isValid);
    lastGood.set(path, text);
    return text;
  } catch (error) {
    const stale = lastGood.get(path);
    if (stale) return stale;
    throw error;
  }
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

/**
 * When the publisher generated the list (ISO 8601), read from hashes.json.
 * Best effort: returns null instead of throwing, the list is still usable without it.
 */
async function fetchPlaylistGeneratedAt(): Promise<string | null> {
  try {
    const json = JSON.parse(await fetchIpnsFile("hashes.json", isHashesJson));
    const time = Date.parse(json.generated);
    return Number.isNaN(time) ? null : new Date(time).toISOString();
  } catch {
    return null;
  }
}

export async function fetchAcestreamPlaylist(): Promise<{
  text: string;
  generatedAt: string | null;
}> {
  const [text, generatedAt] = await Promise.all([
    fetchIpnsFile("hashes_acestream.m3u"),
    fetchPlaylistGeneratedAt(),
  ]);
  return { text, generatedAt };
}
