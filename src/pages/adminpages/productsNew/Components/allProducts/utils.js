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

const DEFAULT_STOREFRONT_ORIGIN = "https://aromadesire.co.uk";

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
    usingAromaDefaultFallback: !picked,
    sampleProductUrl: finalUrl,
    slugUsed: slug || "(none)",
    allViteKeysInBundle: viteKeys,
    valuesChecked: {
      VITE_PUBLIC_SITE_URL: env.VITE_PUBLIC_SITE_URL,
      VITE_FRONTEND_URL: env.VITE_FRONTEND_URL,
      VITE_STOREFRONT_URL: env.VITE_STOREFRONT_URL,
    },
    ifWrongUrl:
      "If `usingAromaDefaultFallback` is true, no VITE_* storefront URL was set; links use https://aromadesire.co.uk. Override with VITE_PUBLIC_SITE_URL in .env and restart Vite (stop + npm run dev).",
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

/** Storefront product URL with ?mobile=true for Google Merchant mobile_link. */
export function getStorefrontMobileProductUrl(productSlug) {
  return `${getStorefrontProductUrl(productSlug)}?mobile=true`;
}

/** @deprecated Use resolveGoogleProductCategoryForExport(product, categoryMap) */
export const getGoogleProductCategory = (productCategory) =>
  resolveGoogleProductCategoryForExport({ category: productCategory }, null);

export const transformProductsForExport = (
  products,
  includeAccessories = false,
  categoryGooglePathMap = null
) => {
  return products.flatMap(product => {
    // Filter out accessories and SIM cards for standard export
    if (!includeAccessories && (product.category.includes("Accessories") || product.category.includes("PAYG-SIM-Card"))) {
      return [];
    }

    const googleProductCategory = resolveGoogleProductCategoryForExport(
      product,
      categoryGooglePathMap
    );

    if (product.productType?.type === 'single') {
      // Check product stock for single-type products
      if (!product.variantValues[0].Quantity || product.variantValues[0].Quantity <= 0) {
        return [];
      }

      const productNameSlug = product.producturl;
      const condition = product.condition === 'Brand New' ? 'New' : product.condition;

      return [{
        id: product.variantValues[0].SKU,
        title: `${product.name}`,
        description: product.Product_summary || '',
        availability: 'in_stock',
        link: getStorefrontProductUrl(productNameSlug),
        image_link: `${import.meta.env.VITE_BACKEND_URL}${product.thumbnail_image.path}`,
        additional_image_link: product.Gallery_Images.map(img => `${import.meta.env.VITE_BACKEND_URL}/${img.path}`).join(", "),
        price: `${product.variantValues[0].Price} GBP`,
        sale_price: product.variantValues[0].salePrice ? `${product.variantValues[0].salePrice} GBP` : null,
        identifier_exists: product.variantValues[0].EIN ? 'yes' : 'no',
        gtin: product.variantValues[0].EIN ? product.variantValues[0].EIN : '',
        mpn: product.variantValues[0].MPN || "",
        brand: product.brand || '',
        condition: condition || 'N/A',
        custom_label_0: product.condition?.toLowerCase() === 'refurbished' ? '' : '',
        color: 'N/A',
        capacity: 'N/A',
        shipping: product.shipping_cost || '0.00 GBP',
        tax: product.tax_rate || '0%',
        mobile_link: getStorefrontMobileProductUrl(productNameSlug),
        google_product_category: googleProductCategory
      }];
    } else {
      // Handle variant-based products
      return product.variantValues.flatMap(variant => {
        // Exclude out of stock variants
        if (!variant.Quantity || variant.Quantity <= 0) {
          return [];
        }

        const productNameSlug = product.producturl;

        // Use SEO-friendly slug field if available, otherwise convert variant name
        let variantSlug;
        if (variant.slug) {
          variantSlug = variant.slug;
        } else {
          // Fallback: convert variant name to SEO slug (replace underscores with hyphens)
          variantSlug = (variant.name || '')
            .toLowerCase()
            .replace(/_/g, '-')
            .replace(/[^a-z0-9-]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-+/g, '-');
        }

        const fullProductNameSlug = `${productNameSlug}-${variantSlug}`;

        // Extract color and storage for title (dynamic parsing)
        const variantName = variant.name || '';
        const nameParts = variantName.split('-');
        const storage = nameParts.find(part => /\d+(gb|tb)/i.test(part)) || '';
        const colorParts = nameParts.filter(part => !(/\d+(gb|tb)/i.test(part)));
        const colorName = colorParts.join('-').split(' (')[0].trim().replace(/\s+/g, '-');
        const firstImageLink = variant.variantImages.length > 0
          ? `${import.meta.env.VITE_BACKEND_URL}${variant.variantImages[0].path}`
          : '';
        const condition = product.condition === 'Brand New' ? 'New' : product.condition;

        return {
          id: variant.SKU || product._id,
          title: `${product.name} - ${colorName} - ${storage}`,
          description: product.Product_summary || '',
          availability: 'in_stock',
          link: getStorefrontProductUrl(fullProductNameSlug),
          image_link: firstImageLink,
          additional_image_link: variant.variantImages.map(img => `${import.meta.env.VITE_BACKEND_URL}/${img.path}`).join(", "),
          price: `${variant.Price} GBP`,
          sale_price: variant.salePrice ? `${variant.salePrice} GBP` : null,
          identifier_exists: variant.EIN ? 'yes' : 'no',
          gtin: variant.EIN ? variant.EIN : '',
          mpn: variant.MPN || "",
          brand: product.brand || '',
          condition: condition || 'N/A',
          custom_label_0: product.condition?.toLowerCase() === 'refurbished' ? '' : '',
          color: colorName || 'N/A',
          capacity: storage || 'N/A',
          shipping: product.shipping_cost || '0.00 GBP',
          tax: product.tax_rate || '0%',
          mobile_link: getStorefrontMobileProductUrl(fullProductNameSlug),
          google_product_category: googleProductCategory
        };
      });
    }
  });
};