/**
 * Wraps a state-setter callback inside document.startViewTransition when
 * the browser supports it, falling back to a plain call otherwise.
 */
export function startViewTransition(cb: () => void): void {
  if (typeof document !== "undefined" && "startViewTransition" in document) {
    (document as Document & { startViewTransition: (cb: () => void) => void }).startViewTransition(
      cb,
    );
  } else {
    cb();
  }
}
