import { SignInButton, SignedIn, SignedOut, useUser, UserButton } from "@clerk/clerk-react";
import { type PlaylistData } from "@/lib/playlist.functions";
import { startViewTransition } from "@/hooks/useViewTransition";

interface SidebarProps {
  activeGroup: string | null;
  setActiveGroup: (group: string | null) => void;
  data: PlaylistData | undefined;
}

export function Sidebar({ activeGroup, setActiveGroup, data }: SidebarProps) {
  const { user } = useUser();

  return (
    <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-border bg-(--sidebar-bg)/60 px-3 py-5 lg:flex lg:flex-col">
      <div className="flex-1 overflow-y-auto">
        <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Categorías
        </p>
        <nav className="mt-3 space-y-0.5">
          <button
            type="button"
            onClick={() => startViewTransition(() => setActiveGroup(null))}
            className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors cursor-pointer ${activeGroup === null
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
              }`}
          >
            <span className="font-medium">Todos</span>
            {data && (
              <span className="font-mono text-[10.5px] text-muted-foreground">
                {data.totalChannels}
              </span>
            )}
          </button>
          {data?.groups.map((g) => {
            const active = activeGroup === g.name;
            return (
              <button
                key={g.name}
                type="button"
                onClick={() => startViewTransition(() => setActiveGroup(active ? null : g.name))}
                className={`flex w-full items-center justify-between gap-2 rounded-md px-2.5 py-1.5 text-left text-[13px] transition-colors cursor-pointer ${active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
                  }`}
              >
                <span className="truncate">{g.name}</span>
                <span className="font-mono text-[10.5px] text-muted-foreground">
                  {g.channels.length}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-border pt-4">
        <SignedIn>
          {user && (
            <div className="relative flex items-center gap-3 rounded-lg border border-border bg-secondary/15 p-3 hover:bg-secondary/30 transition-all duration-200 cursor-pointer">
              <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full border border-border bg-background">
                <img
                  src={user.imageUrl}
                  alt={user.fullName || "Usuario"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold tracking-tight text-foreground">
                  {user.fullName || user.primaryEmailAddress?.emailAddress.split("@")[0]}
                </p>
                <p className="truncate text-[10.5px] text-muted-foreground">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
              </div>

              {/* Invisible Clerk UserButton overlaying the entire card to trigger native dropdown */}
              <div className="absolute inset-0 z-10 opacity-0 [&_button]:h-full [&_button]:w-full [&_button]:cursor-pointer">
                <UserButton
                  appearance={{
                    elements: {
                      rootBox: "!h-full !w-full",
                      userButtonBox: "!h-full !w-full",
                      userButtonTrigger:
                        "!h-full !w-full !border-none !bg-transparent !shadow-none",
                    },
                  }}
                />
              </div>
            </div>
          )}
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="w-full rounded-md border border-border bg-secondary/30 px-3 py-2 text-sm text-foreground transition-all duration-200 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary cursor-pointer">
              Iniciar sesión
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </aside>
  );
}
