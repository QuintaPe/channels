export type Channel = {
  id: string;
  name: string;
  tvgId: string;
  logo: string;
  group: string;
  acestreamId: string;
  acestreamUrl: string;
};

export type Group = {
  name: string;
  logo: string;
  channels: Channel[];
};

export type PlaylistData = {
  epgUrls: string[];
  groups: Group[];
  totalChannels: number;
};

/** Gateways that serve elcano.top HTML with CORS (no backend proxy needed). */
const ELCANO_SCRAPE_URLS = [
  "https://elcano-top.ipns.dweb.link/",
  "https://dweb.link/ipns/elcano-top/",
];

function parseIpnsBaseUrlFromElcanoHtml(html: string): string | null {
  const doc = new DOMParser().parseFromString(html, "text/html");

  const headings = Array.from(doc.querySelectorAll("h2"));
  const h2 = headings.find((el) => el.textContent?.includes("Enlaces útiles"));
  if (!h2) return null;

  let sibling: Element | null = h2.nextElementSibling;
  while (sibling && sibling.tagName !== "UL") {
    sibling = sibling.nextElementSibling;
  }
  if (!sibling) return null;

  const firstAnchor = sibling.querySelector("a");
  if (!firstAnchor) return null;

  const href = firstAnchor.getAttribute("href")?.trim();
  if (!href) return null;

  return href.replace(/\/$/, "");
}

/**
 * Scrapes elcano.top directly from IPFS gateways (CORS-enabled) to find the
 * first link under "Enlaces útiles".
 */
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

function attr(line: string, key: string): string {
  const m = line.match(new RegExp(`${key}="([^"]*)"`));
  return m ? m[1] : "";
}

async function fetchPlaylistText(): Promise<string> {
  return fetchIpnsFile("hashes_acestream.m3u");
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

export async function getPlaylist(): Promise<PlaylistData> {
  const text = await fetchPlaylistText();
  const lines = text.split(/\r?\n/);

  let epgUrls: string[] = [];
  const groupLogos = new Map<string, string>();
  const groupOrder: string[] = [];
  const channels: Channel[] = [];

  let pending: Channel | null = null;
  let counter = 0;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("#EXTM3U")) {
      const tvg = attr(line, "url-tvg");
      if (tvg)
        epgUrls = tvg
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      continue;
    }
    if (line.startsWith("#EXTGRP:")) {
      const g = attr(line, "group-title");
      const logo = attr(line, "group-logo");
      if (g && !groupLogos.has(g)) {
        groupLogos.set(g, logo);
        groupOrder.push(g);
      }
      continue;
    }
    if (line.startsWith("#EXTINF")) {
      const commaIdx = line.indexOf(",");
      const name = commaIdx >= 0 ? line.slice(commaIdx + 1).trim() : "Unknown";
      pending = {
        id: `c-${counter++}`,
        name,
        tvgId: attr(line, "tvg-id"),
        logo: attr(line, "tvg-logo"),
        group: attr(line, "group-title") || "OTROS",
        acestreamId: "",
        acestreamUrl: "",
      };
      continue;
    }
    if (line.startsWith("acestream://") && pending) {
      pending.acestreamUrl = line;
      pending.acestreamId = line.replace("acestream://", "");
      channels.push(pending);
      pending = null;
    }
  }

  const byGroup = new Map<string, Channel[]>();
  for (const c of channels) {
    if (!byGroup.has(c.group)) byGroup.set(c.group, []);
    byGroup.get(c.group)!.push(c);
  }

  // include any groups that appeared in channels but not in EXTGRP
  for (const g of byGroup.keys()) {
    if (!groupLogos.has(g)) {
      groupLogos.set(g, "");
      groupOrder.push(g);
    }
  }

  const groups: Group[] = groupOrder
    .filter((g) => byGroup.has(g))
    .map((g) => ({
      name: g,
      logo: groupLogos.get(g) || "",
      channels: byGroup.get(g) || [],
    }));

  return { epgUrls, groups, totalChannels: channels.length };
}
