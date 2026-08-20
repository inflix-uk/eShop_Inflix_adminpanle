import {
  buildCategoryGooglePathMap,
  resolveGoogleProductCategoryForExport,
} from "../../../../../utils/googleProductCategoryExport";

export { buildCategoryGooglePathMap, resolveGoogleProductCategoryForExport };

export const filterProducts = (products, searchQuery) => {
  return products.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const conditionMatch = product.condition.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = product.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Check if search query is a number and compare with total variants count
    const variantMatch = !isNaN(searchQuery) && product.variantValues.length === parseInt(searchQuery);

    return nameMatch || conditionMatch || categoryMatch || variantMatch;
  });
};

export const paginateProducts = (products, currentPage, itemsPerPage) => {
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return { paginatedProducts, totalPages };
};

export const correctFilePath = (path) => {
  if (!path) return "";

  // Replace Windows backslashes with forward slashes
  let correctedPath = path.replace(/\\/g, "/");

  // Remove extra parts if needed, modify based on your file structure
  if (correctedPath.includes("/uploads/")) {
    correctedPath = correctedPath.split("/uploads/")[1];
  }

  // Construct the full URL
  return `${import.meta.env.VITE_BACKEND_URL}uploads/${correctedPath}`;
};

const DEFAULT_STOREFRONT_ORIGIN = "";

/** @type {{ key: string, value: string } | null} */
let cachedStorefrontPick = undefined;

let storefrontDiagLogged = false;

/**
 * First non-empty env among these (same order as Vite docs / common monorepos).
 * VITE_FRONTEND_URL is already used in this project's .env for the public site.
 */
function pickStorefrontFromEnv() {
  if (cachedStorefrontPick !== undefined) return cachedStorefrontPick;

  const pairs = [
    ["VITE_PUBLIC_SITE_URL", import.meta.env.VITE_PUBLIC_SITE_URL],
    ["VITE_FRONTEND_URL", import.meta.env.VITE_FRONTEND_URL],
    ["VITE_STOREFRONT_URL", import.meta.env.VITE_STOREFRONT_URL],
  ];

  for (const [key, val] of pairs) {
    const s = val != null ? String(val).trim() : "";
    if (s) {
      cachedStorefrontPick = { key, value: s };
      return cachedStorefrontPick;
    }
  }
  cachedStorefrontPick = null;
  return cachedStorefrontPick;
}

function logStorefrontDiagnostics(resolvedOrigin, slug, finalUrl) {
  if (storefrontDiagLogged) return;
  storefrontDiagLogged = true;

  const picked = pickStorefrontFromEnv();
  const env = import.meta.env;
  const viteKeys = Object.keys(env)
    .filter((k) => k.startsWith("VITE_"))
    .sort();

  console.info("[Admin storefront] Product link base URL (one-time diagnostic)", {
    mode: env.MODE,
    dev: env.DEV,
    pickedFromEnv: picked
      ? { variable: picked.key, rawValue: picked.value, normalizedOrigin: resolvedOrigin }
      : null,
    usingEnvFallback: !picked,
    sampleProductUrl: finalUrl,
    slugUsed: slug || "(none)",
    allViteKeysInBundle: viteKeys,
    valuesChecked: {
      VITE_PUBLIC_SITE_URL: env.VITE_PUBLIC_SITE_URL,
      VITE_FRONTEND_URL: env.VITE_FRONTEND_URL,
      VITE_STOREFRONT_URL: env.VITE_STOREFRONT_URL,
    },
    ifWrongUrl:
      "If `usingEnvFallback` is true, no VITE_* storefront URL was set. Set VITE_PUBLIC_SITE_URL or VITE_FRONTEND_URL in .env and restart Vite.",
  });
}

/**
 * Live storefront origin without trailing slash.
 * Configure any of: VITE_PUBLIC_SITE_URL, VITE_FRONTEND_URL, VITE_STOREFRONT_URL in .env.
 */
export function getStorefrontOrigin() {
  const picked = pickStorefrontFromEnv();
  const origin = picked
    ? String(picked.value).trim().replace(/\/+$/, "")
    : DEFAULT_STOREFRONT_ORIGIN;
  return origin;
}

/** Full URL to a product page on the public storefront (slug = producturl or variant path segment). */
export function getStorefrontProductUrl(productSlug) {
  const origin = getStorefrontOrigin();
  const slug = productSlug ? String(productSlug).replace(/^\/+/, "").replace(/\/+$/, "") : "";
  const finalUrl = !slug ? `${origin}/products` : `${origin}/products/${slug}`;
  logStorefrontDiagnostics(origin, slug, finalUrl);
  return finalUrl;
}

/**
 * Storefront path for CSV export — uses saved variant.slug (same as live site), not legacy phone parsing.
 */
export function buildExportVariantProductSlug(product, variant) {
  const base = product?.producturl
    ? String(product.producturl).replace(/^\/+|\/+$/g, "")
    : "";

  if (product?.productType?.type === "single") {
    return base;
  }

  let variantSlug = "";
  if (variant?.slug) {
    variantSlug = String(variant.slug).replace(/^\/+|\/+$/g, "");
  } else if (variant?.name) {
    variantSlug = String(variant.name)
      .toLowerCase()
      .replace(/_/g, "-")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-");
  }

  if (!base) return variantSlug;
  if (!variantSlug) return base;
  return `${base}-${variantSlug}`;
}

/**
 * Google Merchant mobile_link — same URL as desktop link (no ?mobile=true).
 * Mobile query params break storefront routing and are not required by Merchant.
 */
export function getStorefrontMobileProductUrl(productSlug) {
  return getStorefrontProductUrl(productSlug);
}

/** @deprecated Use resolveGoogleProductCategoryForExport(product, categoryMap) */
export const getGoogleProductCategory = (productCategory) =>
  resolveGoogleProductCategoryForExport({ category: productCategory }, null);

function normalizeAttrKey(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, "");
}

function findVariantAttributeValue(variant, matchers) {
  const attrs = Array.isArray(variant?.attributes) ? variant.attributes : [];
  const wanted = matchers.map(normalizeAttrKey);
  const hit = attrs.find((attr) => {
    const slug = normalizeAttrKey(attr?.attributeSlug);
    const name = normalizeAttrKey(attr?.attributeName);
    return wanted.includes(slug) || wanted.includes(name);
  });
  return hit?.value ? String(hit.value).trim() : "";
}

/**
 * Color for merchant feed: prefer variant attribute, then phone-style name parse.
 * Returns "" (not "N/A") when unknown — Google treats blank as optional.
 */
export function getExportColor(variant, productType) {
  if (!variant) return "";
  if (productType === "single" || variant.name === "single") {
    return findVariantAttributeValue(variant, ["color", "colour"]) || "";
  }

  const fromAttr = findVariantAttributeValue(variant, ["color", "colour"]);
  if (fromAttr) return fromAttr;

  const variantName = String(variant.name || "").trim();
  if (!variantName || variantName === "single") return "";

  const nameParts = variantName.split("-").map((p) => p.trim()).filter(Boolean);
  const colorParts = nameParts.filter((part) => !/\d+(gb|tb)/i.test(part));
  const colorName = colorParts
    .join("-")
    .split(" (")[0]
    .trim()
    .replace(/\s+/g, "-");
  return colorName || "";
}

/** Capacity / storage for merchant feed. */
export function getExportCapacity(variant, productType) {
  if (!variant) return "";
  if (productType === "single" || variant.name === "single") {
    return (
      findVariantAttributeValue(variant, [
        "capacity",
        "storage",
        "size",
        "memory",
      ]) || ""
    );
  }

  const fromAttr = findVariantAttributeValue(variant, [
    "capacity",
    "storage",
    "size",
    "memory",
  ]);
  if (fromAttr) return fromAttr;

  const variantName = String(variant.name || "").trim();
  const storagePart =
    variantName.split("-").find((part) => /\d+(gb|tb)/i.test(part.trim())) ||
    "";
  return storagePart.trim();
}

/** Product brand for feed — trimmed display name only (never invent a default). */
export function getExportBrand(product) {
  return String(product?.brand || "").trim();
}

/**
 * Merchant feed description must be plain text — Product_summary is often
 * rich-text HTML from the admin editor (&lt;p&gt;, spans, entities, etc.).
 */
export function stripHtmlForExport(value) {
  if (value == null) return "";
  let text = String(value);

  // Drop script/style blocks entirely
  text = text.replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, " ");
  // Line breaks from block tags
  text = text.replace(/<\/(p|div|h[1-6]|li|tr|br)\s*>/gi, "\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  // Strip remaining tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode common entities (order matters for &amp;)
  const entities = {
    "&nbsp;": " ",
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
    "&rsquo;": "'",
    "&lsquo;": "'",
    "&rdquo;": '"',
    "&ldquo;": '"',
    "&mdash;": "—",
    "&ndash;": "–",
    "&hellip;": "…",
  };
  text = text.replace(
    /&(?:nbsp|amp|lt|gt|quot|apos|rsquo|lsquo|rdquo|ldquo|mdash|ndash|hellip|#39);/gi,
    (m) => entities[m.toLowerCase()] ?? entities[m] ?? " "
  );
  // Numeric entities
  text = text.replace(/&#(\d+);/g, (_, n) => {
    const code = Number(n);
    return Number.isFinite(code) ? String.fromCharCode(code) : " ";
  });
  text = text.replace(/&#x([0-9a-f]+);/gi, (_, h) => {
    const code = parseInt(h, 16);
    return Number.isFinite(code) ? String.fromCharCode(code) : " ";
  });

  return text
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export function getExportDescription(product) {
  const summary = stripHtmlForExport(product?.Product_summary);
  if (summary) return summary;
  // Fallback if summary empty — still strip HTML from long description
  return stripHtmlForExport(product?.Product_description);
}

/**
 * GTIN from variant EIN — always export as Excel text formula so spreadsheet
 * apps keep full 13-digit EAN (not 5.06503E+12). Merchant Center reads the
 * digits inside; plain numbers get destroyed by Excel's float display.
 */
export function formatExportGtin(ein) {
  const raw = String(ein ?? "").trim();
  if (!raw) return "";
  // Strip any prior tab/spaces; keep digits (and rare letter GTINs)
  const gtin = raw.replace(/^[\t\s]+|[\t\s]+$/g, "").replace(/\s+/g, "");
  if (!gtin) return "";
  // Leading ="" forces Excel/Sheets to treat cell as text and show full value
  return `="${gtin}"`;
}

export function getExportIdentifierExists(ein) {
  return String(ein ?? "").trim() ? "yes" : "no";
}

function resolveImageUrl(img) {
  if (!img) return "";
  if (img.url) return img.url;
  if (img.path) {
    const base = String(import.meta.env.VITE_BACKEND_URL || "").replace(
      /\/+$/,
      ""
    );
    const path = String(img.path).startsWith("/")
      ? img.path
      : `/${img.path}`;
    return `${base}${path}`;
  }
  return "";
}

/**
 * Build Google Merchant CSV rows.
 * @param {object} options
 * @param {boolean} [options.includeAccessories=false]
 * @param {boolean} [options.includeOutOfStock=false] — when true, emit out_of_stock rows
 * @param {object|null} [options.categoryGooglePathMap]
 * @param {(productName: string, variantName?: string) => string} [options.generateSku]
 */
export function buildMerchantFeedRows(
  products,
  {
    includeAccessories = false,
    includeOutOfStock = false,
    categoryGooglePathMap = null,
    generateSku = null,
  } = {}
) {
  if (!Array.isArray(products)) return [];

  return products.flatMap((product) => {
    const category = String(product?.category || "");
    if (
      !includeAccessories &&
      (category.includes("Accessories") || category.includes("PAYG-SIM-Card"))
    ) {
      return [];
    }

    const variants = Array.isArray(product?.variantValues)
      ? product.variantValues
      : [];
    if (variants.length === 0) return [];

    const googleProductCategory = resolveGoogleProductCategoryForExport(
      product,
      categoryGooglePathMap
    );
    const condition =
      product.condition === "Brand New" ? "New" : product.condition || "";
    const brand = getExportBrand(product);
    const productType = product.productType?.type || "single";
    const isRefurbished =
      String(product.condition || "").toLowerCase() === "refurbished";

    if (productType === "single") {
      const variant = variants[0];
      const quantity = Number(variant?.Quantity) || 0;
      if (!includeOutOfStock && quantity <= 0) return [];

      const productNameSlug = product.producturl;
      const ein = variant?.EIN;
      const sku =
        variant?.SKU ||
        (generateSku ? generateSku(product.name) : "") ||
        product._id;

      return [
        {
          id: sku,
          title: product.name || "",
          description: getExportDescription(product),
          availability: quantity > 0 ? "in_stock" : "out_of_stock",
          link: getStorefrontProductUrl(productNameSlug),
          image_link: resolveImageUrl(product.thumbnail_image),
          additional_image_link: (product.Gallery_Images || [])
            .map((img) => resolveImageUrl(img))
            .filter(Boolean)
            .join(", "),
          price: `${variant?.Price ?? ""} GBP`,
          sale_price: variant?.salePrice ? `${variant.salePrice} GBP` : null,
          identifier_exists: getExportIdentifierExists(ein),
          gtin: formatExportGtin(ein),
          mpn: variant?.MPN || "",
          brand,
          condition: condition || "",
          custom_label_0: "",
          color: getExportColor(variant, productType),
          capacity: getExportCapacity(variant, productType),
          shipping: product.shipping_cost || "0.00 GBP",
          tax: product.tax_rate || "0%",
          mobile_link: getStorefrontMobileProductUrl(productNameSlug),
          google_product_category: googleProductCategory,
        },
      ];
    }

    return variants.flatMap((variant) => {
      const quantity = Number(variant?.Quantity) || 0;
      if (!includeOutOfStock && quantity <= 0) return [];

      const variantName = variant.name || "";
      const fullProductNameSlug = buildExportVariantProductSlug(
        product,
        variant
      );
      const colorName = getExportColor(variant, productType);
      const storage = getExportCapacity(variant, productType);
      const ein = variant?.EIN;
      const firstImageLink =
        Array.isArray(variant.variantImages) && variant.variantImages.length > 0
          ? resolveImageUrl(variant.variantImages[0])
          : "";
      const titleParts = [product.name, colorName, storage].filter(Boolean);
      const sku =
        variant.SKU ||
        (generateSku ? generateSku(product.name, variantName) : "") ||
        product._id;

      return [
        {
          id: sku,
          title: titleParts.join(" - "),
          description: getExportDescription(product),
          availability: quantity > 0 ? "in_stock" : "out_of_stock",
          link: getStorefrontProductUrl(fullProductNameSlug),
          image_link: firstImageLink,
          additional_image_link: (variant.variantImages || [])
            .map((img) => resolveImageUrl(img))
            .filter(Boolean)
            .join(", "),
          price: `${variant.Price ?? ""} GBP`,
          sale_price: variant.salePrice ? `${variant.salePrice} GBP` : null,
          identifier_exists: getExportIdentifierExists(ein),
          gtin: formatExportGtin(ein),
          mpn: variant.MPN || "",
          brand,
          condition: condition || "",
          custom_label_0: isRefurbished
            ? variant.slug || variantName || ""
            : "",
          color: colorName,
          capacity: storage,
          shipping: product.shipping_cost || "0.00 GBP",
          tax: product.tax_rate || "0%",
          mobile_link: getStorefrontMobileProductUrl(fullProductNameSlug),
          google_product_category: googleProductCategory,
        },
      ];
    });
  });
}

export const transformProductsForExport = (
  products,
  includeAccessories = false,
  categoryGooglePathMap = null
) =>
  buildMerchantFeedRows(products, {
    includeAccessories,
    includeOutOfStock: false,
    categoryGooglePathMap,
  });
