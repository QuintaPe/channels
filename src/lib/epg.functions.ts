const EPG_URL =
  "https://raw.githubusercontent.com/davidmuma/EPG_dobleM/refs/heads/master/guiatv.xml";

export type Programme = {
  channel: string;
  start: number; // epoch ms
  stop: number;
  title: string;
  desc: string;
};

export type EpgData = {
  // tvg-id (or normalized display-name) -> programmes (now/next), sorted by start asc
  byChannel: Record<string, Programme[]>;
  // alias map: lowercased display-name -> canonical channel id
  aliases: Record<string, string>;
  fetchedAt: number;
};

function parseXmltvTime(s: string): number {
  // Format: "20260523140000 +0200" or "20260523140000"
  const m = s.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(?:\s*([+-]\d{2})(\d{2}))?/);
  if (!m) return 0;
  const [, Y, Mo, D, H, Mi, S, oh, om] = m;
  const iso = `${Y}-${Mo}-${D}T${H}:${Mi}:${S}${oh ? `${oh}:${om}` : "Z"}`;
  const t = Date.parse(iso);
  return Number.isNaN(t) ? 0 : t;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&amp;/g, "&");
}

function inner(block: string, tag: string): string {
  const m = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`));
  return m ? decodeEntities(m[1].trim()) : "";
}

export async function getEpg(): Promise<EpgData> {
  const res = await fetch(EPG_URL, {
    headers: { accept: "*/*" },
  });
  if (!res.ok || !res.body) {
    throw new Error(`Failed to fetch EPG: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buf = "";

  const now = Date.now();
  const cutoff = now + 48 * 3600 * 1000; // next 48h
  const byChannel: Record<string, Programme[]> = {};
  const aliases: Record<string, string> = {};

  while (true) {
    const { value, done } = await reader.read();
    if (value) buf += decoder.decode(value, { stream: !done });

    // Extract channel aliases
    let cIdx: number;
    while ((cIdx = buf.indexOf("</channel>")) !== -1) {
      const start = buf.lastIndexOf("<channel ", cIdx);
      if (start === -1) {
        buf = buf.slice(cIdx + "</channel>".length);
        continue;
      }
      const block = buf.slice(start, cIdx + "</channel>".length);
      const idMatch = block.match(/<channel\s+id="([^"]+)"/);
      if (idMatch) {
        const id = idMatch[1];
        aliases[id.toLowerCase()] = id;
        const nameRegex = /<display-name[^>]*>([\s\S]*?)<\/display-name>/g;
        let nm: RegExpExecArray | null;
        while ((nm = nameRegex.exec(block)) !== null) {
          const name = decodeEntities(nm[1].trim()).toLowerCase();
          if (name && !aliases[name]) aliases[name] = id;
        }
      }
      buf = buf.slice(cIdx + "</channel>".length);
    }

    // Extract programmes
    let pIdx: number;
    while ((pIdx = buf.indexOf("</programme>")) !== -1) {
      const startTag = buf.lastIndexOf("<programme ", pIdx);
      if (startTag === -1) {
        buf = buf.slice(pIdx + "</programme>".length);
        continue;
      }
      const block = buf.slice(startTag, pIdx + "</programme>".length);
      buf = buf.slice(pIdx + "</programme>".length);

      const head = block.match(/<programme\s+start="([^"]+)"\s+stop="([^"]+)"\s+channel="([^"]+)"/);
      if (!head) continue;
      const start = parseXmltvTime(head[1]);
      const stop = parseXmltvTime(head[2]);
      if (!start || !stop) continue;
      if (stop <= now || start >= cutoff) continue;

      const channel = decodeEntities(head[3]);
      const title = inner(block, "title");
      const desc = inner(block, "desc");

      const prog: Programme = { channel, start, stop, title, desc };
      (byChannel[channel] ||= []).push(prog);
    }

    if (done) break;
  }

  // Sort programmes per channel
  for (const k of Object.keys(byChannel)) {
    byChannel[k].sort((a, b) => a.start - b.start);
  }

  return { byChannel, aliases, fetchedAt: now };
}
