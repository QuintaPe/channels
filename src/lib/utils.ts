import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { type Channel } from "./playlist.functions";
import { type EpgData, type Programme } from "./epg.functions";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(t: number): string {
  const d = new Date(t);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** "hoy a las 10:00", "ayer a las 10:00" or "18 sep a las 10:00". */
export function formatUpdatedAt(t: number): string {
  const d = new Date(t);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const time = formatTime(t);
  if (sameDay(d, today)) return `hoy a las ${time}`;
  if (sameDay(d, yesterday)) return `ayer a las ${time}`;
  return `${d.toLocaleDateString([], { day: "numeric", month: "short" })} a las ${time}`;
}

export function formatDayLabel(t: number): string {
  const d = new Date(t);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  if (sameDay(d, today)) return "Hoy";
  if (sameDay(d, tomorrow)) return "Mañana";
  return d.toLocaleDateString([], { weekday: "long", day: "2-digit", month: "short" });
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function resolveProgrammes(channel: Channel, epg: EpgData | undefined): Programme[] {
  if (!epg) return [];
  const candidates: string[] = [];
  if (channel.tvgId) candidates.push(channel.tvgId);
  // strip quality suffixes like "DAZN 1 720p **" -> "DAZN 1"
  const base = channel.name.replace(/\s+(?:\d{3,4}p|HD|SD|FHD|UHD).*$/i, "").trim();
  if (base) candidates.push(base);
  candidates.push(channel.name);
  for (const c of candidates) {
    const direct = epg.byChannel[c];
    if (direct?.length) return direct;
    const aliased = epg.aliases[c.toLowerCase()];
    if (aliased && epg.byChannel[aliased]?.length) return epg.byChannel[aliased];
  }
  return [];
}
