import axios from "axios";

/** Ensures `${base}get/...` resolves correctly when env omits a trailing slash. */
export function normalizeApiBase(baseUrl) {
  const s = String(baseUrl ?? "").trim();
  if (!s) return s;
  return s.endsWith("/") ? s : `${s}/`;
}

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

/** Must match backend `utils/pricingVariantKey.js`. */
export function computeVariantKey(variant, idx = 0) {
  if (!variant) return "";
  const id = String(variant.variantId || "").trim();
  if (id) return id;
  const slug = String(variant.slug || "").trim();
  if (slug) return slug;
  return `__idx_${idx}`;
}

function variantUnitPrice(v) {
  if (!v) return NaN;
  const sale = toNumber(v.salePrice, NaN);
  if (Number.isFinite(sale) && sale > 0) return sale;
  const list = toNumber(v.Price, NaN);
  if (Number.isFinite(list) && list > 0) return list;
  return NaN;
}

function variantLabel(v, idx) {
  const n = String(v?.name || "").trim();
  if (n) return n;
  const sl = String(v?.slug || "").trim();
  if (sl) return sl.replace(/-/g, " ");
  return `Variant ${idx + 1}`;
}

/**
 * Normalized product for pricing-group UI: includes `variants` for per-row editing.
 */
export function normalizeProduct(raw) {
  const variantValues = Array.isArray(raw?.variantValues) ? raw.variantValues : [];
  const variants = variantValues.map((v, idx) => ({
    key: computeVariantKey(v, idx),
    label: variantLabel(v, idx),
    sku: String(v?.SKU || "").trim() || "-",
    stock: toNumber(v?.Quantity ?? v?.quantity ?? v?.stock, 0),
    basePrice: (() => {
      const p = variantUnitPrice(v);
      return Number.isFinite(p) && p > 0 ? p : 0;
    })(),
  }));

  const firstVariant = variantValues[0] || {};
  const prices = variantValues.map(variantUnitPrice).filter((n) => Number.isFinite(n) && n > 0);
  const priceFromVariants = prices.length > 0 ? Math.min(...prices) : NaN;
  const price = Number.isFinite(priceFromVariants)
    ? priceFromVariants
    : toNumber(firstVariant.salePrice ?? firstVariant.Price ?? raw?.salePrice ?? raw?.price, 0);
  const stockFromVariants = variantValues.reduce(
    (sum, v) => sum + toNumber(v?.Quantity ?? v?.quantity ?? v?.stock, 0),
    0
  );
  const stock = toNumber(
    raw?.stock ?? raw?.quantity ?? (stockFromVariants > 0 ? stockFromVariants : 0),
    0
  );

  return {
    id: raw?._id != null ? String(raw._id) : raw?.id != null ? String(raw.id) : String(Math.random()),
    name: raw?.name || "Unnamed product",
    sku: String(firstVariant?.SKU || raw?.SKU || raw?.sku || "-").trim() || "-",
    brand: raw?.brand || "N/A",
    category:
      raw?.category?.name ||
      raw?.categoryName ||
      raw?.productCategory ||
      "Uncategorized",
    productType: raw?.productType?.type || null,
    price,
    stock,
    variants,
  };
}

/** Map API rows to composite keys: `productId` or `productId::variantKey`. */
export function groupPricesRowsToMap(rows) {
  const map = {};
  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const pid = row?.productId != null ? String(row.productId) : "";
    if (!pid) return;
    const vk = row?.variantKey != null && String(row.variantKey).trim() !== "" ? String(row.variantKey).trim() : "";
    const key = vk ? `${pid}::${vk}` : pid;
    map[key] = Number(row.price);
  });
  return map;
}

export function priceMapKey(productId, variantKey) {
  const pid = String(productId);
  const vk = variantKey != null ? String(variantKey).trim() : "";
  return vk ? `${pid}::${vk}` : pid;
}

/** One UI row per product (no variants) or per variant — same shape as pricing-group products table. */
export function flattenProductsToPricingRows(products) {
  const rows = [];
  for (const p of products || []) {
    const vars = Array.isArray(p.variants) && p.variants.length > 0 ? p.variants : [];
    if (vars.length === 0) {
      rows.push({
        rowKey: String(p.id),
        productId: String(p.id),
        variantKey: "",
        productName: p.name,
        variantLabel: "—",
        sku: p.sku,
        stock: p.stock,
        basePrice: p.price,
        brand: p.brand,
        category: p.category,
      });
    } else {
      for (const v of vars) {
        rows.push({
          rowKey: `${p.id}::${v.key}`,
          productId: String(p.id),
          variantKey: v.key,
          productName: p.name,
          variantLabel: v.label,
          sku: v.sku,
          stock: v.stock,
          basePrice: v.basePrice,
          brand: p.brand,
          category: p.category,
        });
      }
    }
  }
  return rows;
}

export async function fetchPricingGroupProducts(baseUrl) {
  const base = normalizeApiBase(baseUrl);
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

export async function fetchGroupProductPrices(baseUrl, groupId) {
  const base = normalizeApiBase(baseUrl);
  const headers = { "x-user-role": "admin" };
  try {
    const res = await axios.get(`${base}api/pricing-groups/${groupId}/product-prices`, { headers });
    const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
    return rows;
  } catch (err) {
    if (err?.response?.status !== 404) throw err;
    const res = await axios.get(`${base}pricing-groups/${groupId}/product-prices`, { headers });
    const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
    return rows;
  }
}

/**
 * @param {object} [opts]
 * @param {boolean} [opts.clear] - Remove group override for this product/variant (empty field save).
 */
export async function saveGroupProductPrice(baseUrl, groupId, productId, price, variantKey = "", opts = {}) {
  const base = normalizeApiBase(baseUrl);
  const vk = variantKey != null ? String(variantKey).trim() : "";
  const body = opts.clear
    ? { productId, variantKey: vk, clear: true }
    : { productId, price, variantKey: vk };
  const headers = { "x-user-role": "admin" };
  try {
    const res = await axios.post(`${base}api/pricing-groups/${groupId}/product-price`, body, { headers });
    return res?.data?.data ?? null;
  } catch (err) {
    if (err?.response?.status !== 404) throw err;
    const res = await axios.post(`${base}pricing-groups/${groupId}/product-price`, body, { headers });
    return res?.data?.data ?? null;
  }
}
