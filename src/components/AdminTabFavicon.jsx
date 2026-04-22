import { useEffect } from "react";
import { fetchAndApplyAdminTabFavicon } from "../utils/adminTabFavicon";

/**
 * Sets document favicon from CMS (public API). No static placeholder in index.html.
 */
export default function AdminTabFavicon() {
  useEffect(() => {
    void fetchAndApplyAdminTabFavicon();
  }, []);
  return null;
}
