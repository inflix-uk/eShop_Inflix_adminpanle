import { lazy } from "react";

// One automatic reload a minute. If the chunk is still missing straight after
// a reload, the tab was not simply out of date and reloading again would loop.
const RELOAD_AT_KEY = "eshop:chunkReloadAt";
const RELOAD_GUARD_MS = 60 * 1000;

const reloadOnce = () => {
  // Offline, a reload swaps the admin for the browser's "no internet" page.
  if (navigator.onLine === false) return false;
  try {
    const lastReload = Number(sessionStorage.getItem(RELOAD_AT_KEY)) || 0;
    if (Date.now() - lastReload < RELOAD_GUARD_MS) return false;
    sessionStorage.setItem(RELOAD_AT_KEY, String(Date.now()));
  } catch {
    // Without sessionStorage there is nothing to stop a reload loop.
    return false;
  }
  window.location.reload();
  return true;
};

/**
 * React.lazy for the route pages, with one recovery step.
 *
 * Every build gives the page chunks new hashed names (Orders-<hash>.js) and a
 * deploy removes the old ones. A tab that was already open still asks for the
 * old names the first time each page is visited, the import fails, and the
 * route's error boundary took over the screen until someone refreshed.
 *
 * So do that refresh here. The promise is left pending so Suspense stays on
 * its loading state until the reloaded page, on the new build, replaces it.
 */
export default function lazyWithReload(importPage) {
  return lazy(() =>
    importPage().catch((error) => {
      if (reloadOnce()) return new Promise(() => {});
      throw error;
    })
  );
}
