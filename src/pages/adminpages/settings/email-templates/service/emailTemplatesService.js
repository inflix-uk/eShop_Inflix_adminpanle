const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const getHeaders = () => ({
  "x-user-role": "admin",
  "Content-Type": "application/json",
});

export async function getNewsletterEmailTemplates() {
  const res = await fetch(`${BACKEND_URL}newsletter-email-templates`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load email templates");
  const json = await res.json();
  return json.data || null;
}

export async function saveNewsletterEmailTemplates(payload) {
  const res = await fetch(`${BACKEND_URL}newsletter-email-templates`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to save email templates");
  }
  return res.json();
}
