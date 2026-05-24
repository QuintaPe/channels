import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { type Programme } from "@/lib/epg.functions";
import { formatTime } from "@/lib/utils";

interface EpgBlockProps {
  programmes: Programme[];
}

export function EpgBlock({ programmes }: EpgBlockProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!programmes.length) {
    return (
      <div className="rounded-md border border-dashed border-border bg-secondary/40 px-2.5 py-2 text-[11px] text-muted-foreground">
        Sin guía disponible
      </div>
    );
  }

  const current = programmes.find((p) => p.start <= now && p.stop > now);
  const next = programmes.find((p) => p.start > now);

  const pct = current
    ? Math.min(100, Math.max(0, ((now - current.start) / (current.stop - current.start)) * 100))
    : 0;

  return (
    <div className="space-y-1.5 rounded-md border border-border/70 bg-secondary/40 p-2.5">
      {current ? (
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              En directo
            </span>
            <span className="text-[10px] text-muted-foreground">
              {formatTime(current.start)} – {formatTime(current.stop)}
            </span>
          </div>
          <p
            className="mt-0.5 line-clamp-2 text-xs font-medium text-foreground"
            title={current.desc || current.title}
          >
            {current.title}
          </p>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-background/60">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-muted-foreground">Sin emisión actual</div>
      )}
      {next && (
        <div className="flex items-center gap-1.5 border-t border-border/60 pt-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <div className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className="shrink-0 font-medium text-foreground/80">
              {formatTime(next.start)}
            </span>
            <span className="truncate text-foreground/90" title={next.title}>
              {next.title}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
