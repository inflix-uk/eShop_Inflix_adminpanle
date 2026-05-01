import axios from "axios";

function toNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeProduct(raw) {
  const variantValues = Array.isArray(raw?.variantValues) ? raw.variantValues : [];
  const firstVariant = variantValues[0] || {};
  const price = toNumber(
    firstVariant.salePrice ?? firstVariant.Price ?? raw?.salePrice ?? raw?.price,
    0
  );
  const stockFromVariants = variantValues.reduce(
    (sum, v) => sum + toNumber(v?.quantity ?? v?.stock, 0),
    0
  );
  const stock = toNumber(
    raw?.stock ?? raw?.quantity ?? (stockFromVariants > 0 ? stockFromVariants : 0),
    0
  );

  return {
    id: raw?._id || raw?.id || String(Math.random()),
    name: raw?.name || "Unnamed product",
    sku: firstVariant?.SKU || raw?.SKU || raw?.sku || "-",
    brand: raw?.brand || "N/A",
    category:
      raw?.category?.name ||
      raw?.categoryName ||
      raw?.productCategory ||
      "Uncategorized",
    price,
    stock,
  };
}

export async function fetchPricingGroupProducts(baseUrl) {
  const res = await axios.get(`${baseUrl}get/all/product/adminpage/v2`, {
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
  const res = await axios.get(`${baseUrl}pricing-groups/${groupId}/product-prices`, {
    headers: { "x-user-role": "admin" },
  });
  const rows = Array.isArray(res?.data?.data) ? res.data.data : [];
  return rows;
}

export async function saveGroupProductPrice(baseUrl, groupId, productId, price) {
  const res = await axios.post(
    `${baseUrl}pricing-groups/${groupId}/product-price`,
    { productId, price },
    { headers: { "x-user-role": "admin" } }
  );
  return res?.data?.data || null;
}
