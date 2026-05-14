/**
 * Page categories API (footer / static pages grouping)
 */

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, "");

const adminHeaders = {
  "Content-Type": "application/json",
  "x-user-role": "admin",
};

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    const error =
      (data && (data.message || data.error)) || response.statusText;
    return Promise.reject(error);
  }
  return data;
}

export const generateSlugFromTitle = (title) => {
  if (!title) return "";
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

export async function getAllPageCategories() {
  const response = await fetch(`${API_BASE_URL}/page-categories`);
  const data = await handleResponse(response);
  return data.data || [];
}

export async function createPageCategory(payload) {
  const response = await fetch(`${API_BASE_URL}/page-categories`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(response);
  return data.data;
}

export async function updatePageCategory(id, payload) {
  const response = await fetch(`${API_BASE_URL}/page-categories/${id}`, {
    method: "PUT",
    headers: adminHeaders,
    body: JSON.stringify(payload),
  });
  const data = await handleResponse(response);
  return data.data;
}

export async function deletePageCategory(id) {
  const response = await fetch(`${API_BASE_URL}/page-categories/${id}`, {
    method: "DELETE",
    headers: adminHeaders,
  });
  await handleResponse(response);
  return true;
}
