import { useEffect } from "react";

const ROBOTS_CONTENT = "noindex, nofollow, noarchive, nosnippet, noimageindex";

export function useNoIndex() {
  useEffect(() => {
    const cleanups: Array<() => void> = [];

    for (const name of ["robots", "googlebot"] as const) {
      let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
      const hadExisting = Boolean(el);
      const previousContent = el?.content;

      if (!el) {
        el = document.createElement("meta");
        el.name = name;
        document.head.appendChild(el);
      }

      el.content = ROBOTS_CONTENT;

      cleanups.push(() => {
        if (hadExisting && previousContent !== undefined) {
          el!.content = previousContent;
        } else {
          el?.remove();
        }
      });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);
}
