/** Stored on product.mainCategory when a subcategory is selected: `parentName::subName` */
export const MAIN_CATEGORY_SUB_DELIMITER = "::";

/**
 * React-select options: parents with nested subcategories (Google path from parent category).
 */
export function buildMainCategorySelectOptions(storeCategories) {
  if (!Array.isArray(storeCategories)) return [];

  return storeCategories.map((cat) => {
    const parentName = cat.name || "";
    const googleCategoryFullPath = cat.googleCategoryFullPath || "";
    const subs = (cat.subCategory || []).filter((s) => String(s).trim());

    if (subs.length === 0) {
      return {
        label: parentName,
        value: parentName,
        parentName,
        googleCategoryFullPath,
      };
    }

    return {
      label: parentName,
      options: [
        {
          label: `${parentName} (parent)`,
          value: parentName,
          parentName,
          googleCategoryFullPath,
        },
        ...subs.map((sub) => ({
          label: sub,
          value: `${parentName}${MAIN_CATEGORY_SUB_DELIMITER}${sub}`,
          parentName,
          subcategoryName: sub,
          googleCategoryFullPath,
        })),
      ],
    };
  });
}

/** Find selected option after load (supports parent, parent::sub, or legacy sub-only value). */
export function findMainCategorySelectOption(mainCategoryOptions, mainCategoryValue) {
  const needle = String(mainCategoryValue || "").trim();
  if (!needle) return null;

  const flat = [];
  for (const item of mainCategoryOptions) {
    if (item.options) flat.push(...item.options);
    else flat.push(item);
  }

  let found = flat.find((o) => o.value === needle);
  if (found) return found;

  if (needle.includes(MAIN_CATEGORY_SUB_DELIMITER)) {
    found = flat.find((o) => o.value.toLowerCase() === needle.toLowerCase());
    if (found) return found;
  }

  found = flat.find(
    (o) =>
      o.subcategoryName &&
      (o.subcategoryName === needle ||
        String(o.subcategoryName).toLowerCase() === needle.toLowerCase())
  );
  if (found) return found;

  return { label: needle, value: needle, googleCategoryFullPath: "" };
}

/** Legacy hardcoded map (fallback when main category has no Google path). */
const LEGACY_CATEGORY_MAPPING = {
  "Mobile-Phones":
    "Electronics / Communications / Telephony / Mobile Phones / Unlocked Mobile Phones",
  "iPads-and-Tablets": "Electronics / Computers / Tablet Computers",
  "Laptops-and-Macbooks": "Electronics / Computers / Laptops",
  "Game-Consoles": "Electronics / Video Game Consoles",
  Accessories:
    "Electronics / Communications / Telephony / Mobile Phone Accessories",
};

/**
 * Google taxonomy paths use " > " in DB; Merchant CSV expects " / " between segments.
 * Does not add a leading slash — use {@link ensureLeadingSlashGoogleMerchantCsv} for export.
 */
export function formatGoogleCategoryPathForCsv(fullPath) {
  const raw = String(fullPath || "").trim();
  if (!raw) return "";
  if (raw.includes(" > ")) {
    return raw
      .split(" > ")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" / ");
  }
  if (raw.includes(" / ")) {
    return raw
      .split(" / ")
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" / ");
  }
  return raw;
}

/** Merchant Center-style path with leading slash: `/Electronics / ...` */
export function ensureLeadingSlashGoogleMerchantCsv(path) {
  const s = String(path || "").trim();
  if (!s) return "";
  return s.startsWith("/") ? s : `/${s}`;
}

/**
 * @param {Array<{ name?: string, slug?: string, googleCategoryFullPath?: string }>} storeCategories
 */
export function buildCategoryGooglePathMap(storeCategories) {
  const map = new Map();
  if (!Array.isArray(storeCategories)) return map;

  for (const cat of storeCategories) {
    const formatted = formatGoogleCategoryPathForCsv(cat.googleCategoryFullPath);
    if (!formatted) continue;
    const parentKey = cat.name ? String(cat.name).trim().toLowerCase() : "";
    if (parentKey) map.set(parentKey, formatted);
    if (cat.slug) map.set(String(cat.slug).trim().toLowerCase(), formatted);

    for (const sub of cat.subCategory || []) {
      const subKey = String(sub || "").trim().toLowerCase();
      if (!subKey) continue;
      map.set(subKey, formatted);
      if (parentKey) {
        map.set(`${parentKey}${MAIN_CATEGORY_SUB_DELIMITER}${subKey}`, formatted);
      }
    }
  }
  return map;
}

function legacyGooglePathFromProductCategories(productCategoryString) {
  const haystack = String(productCategoryString || "");
  for (const key of Object.keys(LEGACY_CATEGORY_MAPPING)) {
    if (haystack.includes(key)) {
      return LEGACY_CATEGORY_MAPPING[key];
    }
  }
  return "";
}

/**
 * Resolve google_product_category for CSV export.
 * Priority: product.mainCategory → store category's googleCategoryFullPath → legacy map on multi category string.
 */
export function resolveGoogleProductCategoryForExport(product, categoryGooglePathMap) {
  const mainKey = String(product?.mainCategory || "")
    .trim()
    .toLowerCase();
  let path = "";
  if (mainKey && categoryGooglePathMap?.get?.(mainKey)) {
    path = categoryGooglePathMap.get(mainKey);
  } else {
    path = legacyGooglePathFromProductCategories(product?.category);
  }
  return ensureLeadingSlashGoogleMerchantCsv(path);
}
