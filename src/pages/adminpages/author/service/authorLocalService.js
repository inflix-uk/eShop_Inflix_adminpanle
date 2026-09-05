const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const AUTHORS_STORAGE_KEY = "admin_authors_v1";

function apiBase() {
  return String(BACKEND_URL || "").replace(/\/$/, "");
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
  };
}

/** Slim profile for embedding on blog posts (avoids huge payload errors). */
export function toBlogAuthorPayload(person) {
  if (!person) return null;
  const image = String(person.image || "");
  const safeImage =
    image.startsWith("data:") && image.length > 200000 ? "" : image;
  return {
    id: person.id || person._id || undefined,
    name: person.name || "",
    email: person.email || "",
    designation: person.designation || "",
    role: person.role === "reviewer" ? "reviewer" : "author",
    image: safeImage,
    bio: person.bio || "",
  };
}

async function parseJson(response) {
  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.success === false) {
    const message =
      json.message || `Request failed (${response.status || "unknown"})`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = json;
    throw error;
  }
  return json;
}

export async function fetchAuthors() {
  const base = apiBase();
  if (!base) return [];
  const response = await fetch(`${base}/blog-authors`, {
    method: "GET",
    credentials: "include",
    headers: authHeaders(),
  });
  const json = await parseJson(response);
  const list = Array.isArray(json.data) ? json.data : [];
  // Keep a light local cache for offline/fallback (ids + names only)
  try {
    window.localStorage.setItem(
      AUTHORS_STORAGE_KEY,
      JSON.stringify(
        list.map((a) => ({
          id: a.id,
          name: a.name,
          email: a.email,
          role: a.role,
          designation: a.designation,
          image: a.image?.startsWith("data:") ? "" : a.image,
          bio: a.bio,
        }))
      )
    );
  } catch {
    /* ignore quota */
  }
  return list;
}

/** Sync helper used by older callers — prefer fetchAuthors(). */
export function getStoredAuthors() {
  try {
    const raw = window.localStorage.getItem(AUTHORS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function setStoredAuthors(authors) {
  try {
    const safeAuthors = Array.isArray(authors) ? authors : [];
    window.localStorage.setItem(AUTHORS_STORAGE_KEY, JSON.stringify(safeAuthors));
  } catch (error) {
    console.error("Failed to store authors cache:", error);
  }
}

export async function createAuthor(profile) {
  const base = apiBase();
  if (!base) throw new Error("Backend URL is not configured");
  const response = await fetch(`${base}/blog-authors`, {
    method: "POST",
    credentials: "include",
    headers: authHeaders(),
    body: JSON.stringify(profile),
  });
  const json = await parseJson(response);
  return json.data;
}

export async function updateAuthor(id, profile) {
  const base = apiBase();
  if (!base) throw new Error("Backend URL is not configured");
  const response = await fetch(`${base}/blog-authors/${encodeURIComponent(id)}`, {
    method: "PUT",
    credentials: "include",
    headers: authHeaders(),
    body: JSON.stringify(profile),
  });
  const json = await parseJson(response);
  return json.data;
}

export async function deleteAuthor(id) {
  const base = apiBase();
  if (!base) throw new Error("Backend URL is not configured");
  const response = await fetch(`${base}/blog-authors/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
    headers: authHeaders(),
  });
  await parseJson(response);
  return true;
}

export async function syncAuthorToBlogs(profile, previousName) {
  try {
    const base = apiBase();
    if (!base || !profile?.name) return;
    await fetch(`${base}/newblog/blog/profile-sync`, {
      method: "POST",
      credentials: "include",
      headers: authHeaders(),
      body: JSON.stringify({
        role: profile.role === "reviewer" ? "reviewer" : "author",
        profile: toBlogAuthorPayload(profile),
        previousName: previousName || profile.name,
      }),
    });
  } catch (error) {
    console.error("Failed to sync author/reviewer to blogs:", error);
  }
}

export { AUTHORS_STORAGE_KEY };
