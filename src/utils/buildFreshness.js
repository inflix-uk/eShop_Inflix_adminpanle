// The page is served without cache headers, so a browser can reuse a copy of
// it from before a deploy and run the previous build: old screens, old bugs,
// and page chunks that no longer exist on the server. This compares the build
// that is running with the one the server has now.

const RELOAD_AT_KEY = "eshop:staleBuildReloadAt";
const RELOAD_GUARD_MS = 60 * 1000;
const ENTRY_SCRIPT = /\/assets\/index-[\w-]+\.js/;

/** The entry script this tab was started from, e.g. /assets/index-AbC123.js. */
function runningEntry() {
  const script = document.querySelector('script[type="module"][src*="/assets/index-"]');
  if (!script) return null; // dev server: no hashed entry
  try {
    return new URL(script.src, window.location.href).pathname;
  } catch {
    return null;
  }
}

async function latestEntry() {
  const response = await fetch(`/index.html?build=${Date.now()}`, {
    cache: "no-store",
  });
  if (!response.ok) return null;
  const match = (await response.text()).match(ENTRY_SCRIPT);
  return match ? match[0] : null;
}

/**
 * Reload once when the server has a newer build than the one running.
 *
 * Only called while the app starts, when there is no typed-in work to lose.
 * Resolves true when a reload was started.
 */
export async function reloadIfBuildIsStale() {
  const running = runningEntry();
  if (!running || navigator.onLine === false) return false;

  try {
    const latest = await latestEntry();
    if (!latest || latest === running) return false;

    // Still different straight after a reload: the difference is not this
    // tab's cache, and reloading again would loop.
    const lastReload = Number(sessionStorage.getItem(RELOAD_AT_KEY)) || 0;
    if (Date.now() - lastReload < RELOAD_GUARD_MS) return false;
    sessionStorage.setItem(RELOAD_AT_KEY, String(Date.now()));
  } catch {
    return false;
  }

  window.location.reload();
  return true;
}
