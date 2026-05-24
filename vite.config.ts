import type { IncomingMessage, ServerResponse } from "node:http";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { m3uDevMiddleware } from "./vite.m3u-middleware";

const HIDDEN_ROUTE_HEADERS = {
  "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet, noimageindex",
} as const;

const HIDDEN_ROUTES = new Set(["/canales.m3u", "/canales_manifest.m3u"]);

function applyNoIndexHeaders(req: IncomingMessage, res: ServerResponse, next: () => void) {
  const path = req.url?.split("?")[0] ?? "";

  if (HIDDEN_ROUTES.has(path)) {
    for (const [header, value] of Object.entries(HIDDEN_ROUTE_HEADERS)) {
      res.setHeader(header, value);
    }
  }

  next();
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    {
      name: "noindex-hidden-routes",
      configureServer(server) {
        server.middlewares.use(applyNoIndexHeaders);
      },
      configurePreviewServer(server) {
        server.middlewares.use(applyNoIndexHeaders);
      },
    },
    {
      name: "m3u-dev-server",
      configureServer(server) {
        server.middlewares.use(m3uDevMiddleware);
      },
      configurePreviewServer(server) {
        server.middlewares.use(m3uDevMiddleware);
      },
    },
  ],
});
