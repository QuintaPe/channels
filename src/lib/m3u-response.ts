/** Tipo que suelen esperar reproductores IPTV / HLS. */
export const M3U_IPTV_CONTENT_TYPE = "application/vnd.apple.mpegurl";

/** Navegadores muestran el contenido como texto en lugar de abrir el reproductor. */
export const M3U_TEXT_CONTENT_TYPE = "text/plain; charset=utf-8";

/**
 * Navegación en pestaña (Accept con text/html) → texto plano.
 * Clientes IPTV y descargas directas → tipo M3U habitual.
 * `?view=text` / `?view=iptv` fuerzan el formato.
 */
export function resolveM3uContentType(
  acceptHeader: string | undefined,
  viewParam?: string | string[],
): string {
  const view = typeof viewParam === "string" ? viewParam : undefined;
  if (view === "text") return M3U_TEXT_CONTENT_TYPE;
  if (view === "iptv") return M3U_IPTV_CONTENT_TYPE;

  const accept = acceptHeader?.toLowerCase() ?? "";
  if (accept.includes("text/html")) {
    return M3U_TEXT_CONTENT_TYPE;
  }

  return M3U_IPTV_CONTENT_TYPE;
}
