import { useEffect } from "react";
import { setFavicon, clearFavicon } from "../utils/faviconManager";

/**
 * Sync document favicon when URL changes (CMS path or absolute).
 * @param {string | null | undefined} url
 */
export function useFavicon(url) {
  useEffect(() => {
    if (url && String(url).trim()) {
      setFavicon(String(url).trim());
    } else {
      clearFavicon();
    }
  }, [url]);
}
