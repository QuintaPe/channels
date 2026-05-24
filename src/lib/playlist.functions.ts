import {
  fetchAcestreamPlaylistText,
  fetchM3uManifest,
  fetchM3uRaw,
} from "@/lib/playlist.ipns";

export { fetchM3uManifest, fetchM3uRaw };

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

function attr(line: string, key: string): string {
  const m = line.match(new RegExp(`${key}="([^"]*)"`));
  return m ? m[1] : "";
}

export async function getPlaylist(): Promise<PlaylistData> {
  const text = await fetchAcestreamPlaylistText();
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
