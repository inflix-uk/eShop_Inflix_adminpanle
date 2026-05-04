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

export async function getOrderEmailTemplates() {
  const res = await fetch(`${BACKEND_URL}order-email-templates`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load order email templates");
  const json = await res.json();
  return json.data || null;
}

export async function saveOrderEmailTemplates(payload) {
  const res = await fetch(`${BACKEND_URL}order-email-templates`, {
    method: "PUT",
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to save order email templates");
  }
  return res.json();
}

/** Same resolved branding as server `getEmailBranding()` — logo, colors, fonts, store URL. */
export async function getEmailBrandingPreview() {
  const res = await fetch(`${BACKEND_URL}email-branding/preview`, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });
  if (!res.ok) return null;
  const json = await res.json();
  if (!json.success || !json.data) return null;
  return json.data;
}
