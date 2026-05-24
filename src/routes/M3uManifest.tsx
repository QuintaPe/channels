import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useNoIndex } from "@/hooks/useNoIndex";
import { fetchM3uManifest } from "@/lib/playlist.functions";

export default function M3uManifest() {
  useNoIndex();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loadAndServe = async () => {
      try {
        const ip = searchParams.get("ip");
        const content = await fetchM3uManifest(ip ?? undefined);

        // Create a blob with the M3U content
        const blob = new Blob([content], { type: "application/vnd.apple.mpegurl" });
        const url = URL.createObjectURL(blob);

        // Create a download link and trigger it
        const link = document.createElement("a");
        link.href = url;
        link.download = "canales_manifest.m3u";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Redirect back to home after a short delay
        setTimeout(() => {
          window.location.href = "/";
        }, 1000);
      } catch (error) {
        console.error("Error loading M3U manifest:", error);
        window.location.href = "/";
      }
    };

    loadAndServe();
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <p className="text-lg">Downloading manifest...</p>
      </div>
    </div>
  );
}
