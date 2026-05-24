import { type Group } from "@/lib/playlist.functions";
import { type EpgData } from "@/lib/epg.functions";
import { ChannelCard } from "./ChannelCard";
import { resolveProgrammes, slug } from "@/lib/utils";

interface GroupSectionProps {
  group: Group;
  epg: EpgData | undefined;
  isSignedIn: boolean;
}

export function GroupSection({ group, epg, isSignedIn }: GroupSectionProps) {
  return (
    <section id={`group-${slug(group.name)}`} className="scroll-mt-24">
      <div className="mb-4 flex items-end justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-3">
          {group.logo ? (
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-md border border-border bg-background">
              <img
                src={group.logo}
                alt=""
                className="h-full w-full object-contain p-1"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ) : null}
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
              {group.name}
            </h2>
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
              {group.channels.length} canal{group.channels.length === 1 ? "" : "es"}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {group.channels.map((c) => (
          <ChannelCard
            key={c.id}
            channel={c}
            programmes={resolveProgrammes(c, epg)}
            isSignedIn={isSignedIn}
          />
        ))}
      </div>
    </section>
  );
}
