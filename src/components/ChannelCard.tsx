import { useState } from "react";
import { Check, Copy, Tv, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type Channel } from "@/lib/playlist.functions";
import { type Programme } from "@/lib/epg.functions";
import { EpgBlock } from "./EpgBlock";
import { ChannelScheduleSheet } from "./ChannelScheduleSheet";

interface ChannelCardProps {
  channel: Channel;
  programmes: Programme[];
  isSignedIn: boolean;
}

export function ChannelCard({ channel, programmes, isSignedIn }: ChannelCardProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(channel.acestreamUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // ignore
    }
  };

  const title = channel.tvgId || channel.name;

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen(true);
          }
        }}
        className="group relative flex cursor-pointer flex-col gap-3 rounded-lg border border-border bg-card p-3.5 transition-colors hover:border-primary/50 hover:bg-card/80 focus:outline-none focus-visible:ring-1 focus-visible:ring-primary"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-background">
            {channel.logo ? (
              <img
                src={channel.logo}
                alt={channel.name}
                className="h-full w-full object-contain p-1"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <Tv className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-[13px] font-semibold leading-tight tracking-tight text-foreground">
              {title}
            </h3>
            {isSignedIn && (
              <button
                type="button"
                className="mt-1 truncate font-mono text-[10.5px] text-muted-foreground/80 hover:text-foreground transition-colors text-left cursor-pointer flex items-center gap-1.5 max-w-full"
                title={channel.acestreamUrl}
                onClick={copy}
              >
                <span className="truncate flex-1">{channel.acestreamUrl}</span>
                {copied ? (
                  <Check className="h-3.5 w-3.5 shrink-0 text-green-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 shrink-0" />
                )}
              </button>
            )}
          </div>
          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 transition-colors group-hover:text-primary" />
        </div>

        <EpgBlock programmes={programmes} />
      </div>
      <ChannelScheduleSheet
        open={open}
        onOpenChange={setOpen}
        channel={channel}
        programmes={programmes}
        title={title}
      />
    </>
  );
}
