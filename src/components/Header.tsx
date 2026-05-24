import { Search, RefreshCw } from "lucide-react";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  query: string;
  setQuery: (q: string) => void;
  refetch: () => void;
  isFetching: boolean;
}

export function Header({ query, setQuery, refetch, isFetching }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="flex h-14 items-center gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <img
            src="/favicon.svg"
            alt=""
            className="h-7 w-7 rounded-md ring-1 ring-primary/30"
          />
          <p className="font-display text-[13px] font-semibold tracking-tight text-foreground">
            SportStream
          </p>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar canal, tvg-id o hash"
              className="h-9 w-80 border-border bg-secondary/60 pl-8 text-[13px] placeholder:text-muted-foreground/60"
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-9 gap-2 text-[12px]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
          <div className="lg:hidden">
            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    rootBox: "!flex !items-center !justify-center !h-9 !w-9",
                    userButtonBox: "!h-full !w-full !flex !items-center !justify-center",
                    userButtonTrigger:
                      "!h-8 !w-8 !rounded-full !focus:outline-none !focus-visible:ring-2 !focus-visible:ring-primary !transition-all !duration-200",
                    userButtonAvatarBox:
                      "!h-8 !w-8 !rounded-full !ring-1 !ring-border hover:!ring-primary !transition-all !duration-200",
                  },
                }}
              />
            </SignedIn>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-secondary/30 px-3 text-sm text-foreground transition-all duration-200 hover:bg-secondary/60 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
                  Entrar
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
