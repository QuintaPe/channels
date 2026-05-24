import { useEffect, useMemo, useState } from "react";
import { X, Tv } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { type Channel } from "@/lib/playlist.functions";
import { type Programme } from "@/lib/epg.functions";
import { formatDayLabel, formatTime } from "@/lib/utils";

interface ChannelScheduleSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: Channel;
  programmes: Programme[];
  title: string;
}

export function ChannelScheduleSheet({
  open,
  onOpenChange,
  channel,
  programmes,
  title,
}: ChannelScheduleSheetProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [open]);

  const grouped = useMemo(() => {
    const map = new Map<string, Programme[]>();
    for (const p of programmes) {
      const key = new Date(p.start).toDateString();
      const arr = map.get(key) ?? [];
      arr.push(p);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [programmes]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {/* p-0 so we control all spacing; flex flex-col so header + body stack correctly */}
      <SheetContent side="right" className="flex flex-col !p-0 w-full sm:max-w-md">
        {/* ── Sticky header ── */}
        <div className="shrink-0 border-b border-border bg-background px-5 py-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-secondary">
              {channel.logo ? (
                <img
                  src={channel.logo}
                  alt={channel.name}
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <Tv className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            {/* Title */}
            <div className="min-w-0 flex-1">
              <SheetTitle className="truncate text-[15px] leading-tight">{title}</SheetTitle>
              <SheetDescription className="truncate text-[12px]">{channel.name}</SheetDescription>
            </div>

            {/* Close button */}
            <SheetClose className="ml-2 shrink-0 rounded-md p-1.5 text-muted-foreground opacity-70 transition-opacity hover:opacity-100 hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer">
              <X className="h-4 w-4" />
              <span className="sr-only">Cerrar</span>
            </SheetClose>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
          {programmes.length === 0 && (
            <p className="rounded-md border border-dashed border-border bg-secondary/40 p-4 text-center text-sm text-muted-foreground">
              Sin guía disponible para este canal.
            </p>
          )}
          {grouped.map(([day, items]) => (
            <div key={day}>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {formatDayLabel(items[0].start)}
              </h4>
              <ul className="space-y-2">
                {items.map((p, i) => {
                  const live = p.start <= now && p.stop > now;
                  return (
                    <li
                      key={`${p.start}-${i}`}
                      className={`rounded-lg border p-3 ${
                        live ? "border-primary/60 bg-primary/5" : "border-border/70 bg-secondary/30"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono text-muted-foreground">
                          {formatTime(p.start)} – {formatTime(p.stop)}
                        </span>
                        {live && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                            </span>
                            En directo
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm font-medium text-foreground">{p.title}</p>
                      {p.desc && <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
