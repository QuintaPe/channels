import { useEffect, useMemo, useState } from "react";
import { startViewTransition } from "@/hooks/useViewTransition";
import { Search, Loader2, CalendarDays } from "lucide-react";
import { useUser, useAuth } from "@clerk/clerk-react";
import { getPlaylist, type Group, type PlaylistData } from "@/lib/playlist.functions";
import { getEpg, type EpgData } from "@/lib/epg.functions";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { GroupSection } from "@/components/GroupSection";

export default function Index() {
  const { isSignedIn, isLoaded } = useUser();
  const [data, setData] = useState<PlaylistData | null>(null);
  const [epg, setEpg] = useState<EpgData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = async (isRefetch = false) => {
    if (isRefetch) setIsFetching(true);
    else setIsLoading(true);
    setError(null);
    try {
      const [playlistResult, epgResult] = await Promise.allSettled([getPlaylist(), getEpg()]);

      if (playlistResult.status === "fulfilled") {
        setData(playlistResult.value);
      } else {
        throw playlistResult.reason;
      }

      if (epgResult.status === "fulfilled") {
        setEpg(epgResult.value);
      } else {
        console.error("Error loading EPG:", epgResult.reason);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const [query, setQuery] = useState("");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  const filtered = useMemo<Group[]>(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.groups
      .filter((g) => (activeGroup ? g.name === activeGroup : true))
      .map((g) => ({
        ...g,
        channels: q
          ? g.channels.filter(
              (c) =>
                c.name.toLowerCase().includes(q) ||
                c.tvgId.toLowerCase().includes(q) ||
                c.acestreamId.toLowerCase().includes(q),
            )
          : g.channels,
      }))
      .filter((g) => g.channels.length > 0);
  }, [data, query, activeGroup]);

  const visibleCount = filtered.reduce((n, g) => n + g.channels.length, 0);

  return (
    <div className="min-h-screen bg-background">
      <Header
        query={query}
        setQuery={setQuery}
        refetch={() => loadData(true)}
        isFetching={isFetching}
      />

      {!isLoaded && (
        <div className="flex items-center justify-center gap-3 py-32 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm">Cargando…</span>
        </div>
      )}

      {isLoaded && (
        <div className="mx-auto flex w-full max-w-[1500px] gap-0">
          <Sidebar
            activeGroup={activeGroup}
            setActiveGroup={setActiveGroup}
            data={data || undefined}
          />

          {/* Main */}
          <main className="main-content min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {/* Mobile search */}
            <div className="relative mb-4 md:hidden">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar canal, tvg-id o hash"
                className="h-10 pl-9"
              />
            </div>

            {/* Page title */}
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-border pb-5">
              <div>
                <div className="flex items-center gap-2 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  Lista en directo
                </div>
                <h1 className="mt-2 font-display text-[26px] font-semibold tracking-tight text-foreground">
                  {activeGroup ?? "Todos los canales"}
                </h1>
                <p className="mt-1 text-[13px] text-muted-foreground">
                  {data
                    ? `${visibleCount} de ${data.totalChannels} canales · ${data.groups.length} categorías`
                    : "Cargando lista de canales…"}
                </p>
              </div>
            </div>

            {/* Mobile group filter */}
            {data && (
              <div className="-mx-4 mb-6 flex gap-1.5 overflow-x-auto px-4 lg:hidden">
                <button
                  type="button"
                  onClick={() => startViewTransition(() => setActiveGroup(null))}
                  className={`shrink-0 rounded-full border px-3 py-1 text-[12px] transition-colors cursor-pointer ${
                    activeGroup === null
                      ? "border-primary/40 bg-primary/10 text-primary"
                      : "border-border bg-secondary/50 text-muted-foreground"
                  }`}
                >
                  Todos
                </button>
                {data.groups.map((g) => (
                  <button
                    key={g.name}
                    type="button"
                    onClick={() =>
                      startViewTransition(() =>
                        setActiveGroup((c) => (c === g.name ? null : g.name)),
                      )
                    }
                    className={`shrink-0 whitespace-nowrap rounded-full border px-3 py-1 text-[12px] transition-colors cursor-pointer ${
                      activeGroup === g.name
                        ? "border-primary/40 bg-primary/10 text-primary"
                        : "border-border bg-secondary/50 text-muted-foreground"
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center gap-3 py-32 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando playlist…</span>
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-5 text-sm">
                <p className="font-semibold text-destructive">No se pudo cargar la lista.</p>
                <p className="mt-1 text-muted-foreground">{(error as Error).message}</p>
              </div>
            )}

            {data && (
              <div className="space-y-10">
                {filtered.map((g) => (
                  <GroupSection
                    key={g.name}
                    group={g}
                    epg={epg || undefined}
                    isSignedIn={isSignedIn ?? false}
                  />
                ))}
                {filtered.length === 0 && (
                  <p className="py-16 text-center text-sm text-muted-foreground">
                    Sin resultados para “{query}”.
                  </p>
                )}
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
