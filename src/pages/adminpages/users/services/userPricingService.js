import axios from "axios";
import { normalizeApiBase, normalizeProduct } from "../../pricing-groups/api/productsApi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export async function fetchUserPricingProducts() {
  const base = normalizeApiBase(BACKEND_URL);
  const res = await axios.get(`${base}get/all/product/adminpage/v2`, {
    headers: { "x-user-role": "admin" },
  });
  const rows = Array.isArray(res?.data?.products)
    ? res.data.products
    : Array.isArray(res?.data?.data)
      ? res.data.data
      : [];
  return rows.map(normalizeProduct);
}

export async function fetchUserProductPrices(userId) {
  const base = normalizeApiBase(BACKEND_URL);
  const res = await axios.get(`${base}api/users/${userId}/product-prices`, {
    headers: { "x-user-role": "admin" },
  });
  return Array.isArray(res?.data?.data) ? res.data.data : [];
}

/**
 * @param {object} [opts]
 * @param {boolean} [opts.clear] - Remove per-user override for this product/variant.
 */
export function normalizeUserExcludedIds(user) {
  const raw = user?.excludedProductIds;
  if (!Array.isArray(raw)) return [];
  return raw.map((id) => String(id?._id ?? id ?? "")).filter(Boolean);
}

export async function setUserProductInclusion(userId, productId, included) {
  const base = normalizeApiBase(BACKEND_URL);
  const body = { productId: String(productId), included: Boolean(included) };
  const res = await axios.post(`${base}api/users/${userId}/product-inclusion`, body, {
    headers: { "x-user-role": "admin" },
  });
  return res?.data?.data ?? null;
}

export async function saveUserProductPrice(userId, productId, price, variantKey = "", opts = {}) {
  const base = normalizeApiBase(BACKEND_URL);
  const vk = variantKey != null ? String(variantKey).trim() : "";
  const body = opts.clear
    ? { productId, variantKey: vk, clear: true }
    : { productId, price, variantKey: vk };
  const res = await axios.post(`${base}api/users/${userId}/product-price`, body, {
    headers: { "x-user-role": "admin" },
  });
  return res?.data?.data ?? null;
}
