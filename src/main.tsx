import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { esES } from "@clerk/localizations";
import { clerkAppearance } from "@/lib/clerk-appearance";
import Index from "./routes/index";
import NotFound from "./routes/NotFound";
import M3uManifest from "./routes/M3uManifest";
import M3u from "./routes/M3u";

import "@fontsource/outfit/400.css";
import "@fontsource/outfit/500.css";
import "@fontsource/outfit/600.css";
import "@fontsource/outfit/700.css";
import "@fontsource/figtree/400.css";
import "@fontsource/figtree/500.css";
import "@fontsource/figtree/600.css";

import "./styles.css";

const clerkPublishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={clerkAppearance}
      localization={esES}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/canales.m3u" element={<M3u />} />
          <Route path="/canales_manifest.m3u" element={<M3uManifest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>,
);
