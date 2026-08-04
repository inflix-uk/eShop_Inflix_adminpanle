const AUTHORS_STORAGE_KEY = "admin_authors_v1";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function getStoredAuthors() {
  try {
    const raw = window.localStorage.getItem(AUTHORS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to parse stored authors:", error);
    return [];
  }
}

export function setStoredAuthors(authors) {
  try {
    const safeAuthors = Array.isArray(authors) ? authors : [];
    window.localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(safeAuthors));
  } catch (error) {
    console.error("Failed to store authors:", error);
  }
}

export async function syncAuthorToBlogs(profile, previousName) {
  try {
    if (!BACKEND_URL || !profile?.name) return;
    const base = String(BACKEND_URL).replace(/\/$/, "");
    await fetch(`${base}/newblog/blog/profile-sync`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: profile.role === "reviewer" ? "reviewer" : "author",
        profile,
        previousName: previousName || profile.name,
      }),
    });
  } catch (error) {
    console.error("Failed to sync author/reviewer to blogs:", error);
  }
}

export { AUTHORS_STORAGE_KEY };
