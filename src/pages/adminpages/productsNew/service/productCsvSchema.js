/**
 * Product CSV Schema
 *
 * One row per variant, grouped by `producturl`. A single product is simply a
 * group of one. This mirrors how the existing Google Merchant export flattens
 * variants, so the two stay symmetrical.
 *
 * Product-level columns are read from the FIRST row of each group and ignored
 * on subsequent rows. Variant-level columns are read from every row.
 *
 * Multi-value cells use `|` (not a comma) so that names containing commas —
 * "Cassis Rose & Oud, Large" — never collide with the CSV delimiter.
 */

export const MULTI = "|";

/** Product-level columns — taken from the first row of each producturl group. */
export const PRODUCT_COLUMNS = [
  "producturl",
  "name",
  "product_type",
  "status",
  "category",
  "subcategory",
  "brand",
  "condition",
  "tags",
  "main_category",
  "summary",
  "description",
  "specs",
  "meta_title",
  "meta_description",
  "meta_keywords",
  "thumbnail_url",
  "gallery_urls",
  "is_featured",
  "is_authenticated",
  "low_stock_alert",
  "comes_with",
  "top_section",
];

/** Variant-level columns — read from every row. */
export const VARIANT_COLUMNS = [
  "variant_attributes",
  "variant_name",
  "sku",
  "ean",
  "mpn",
  "cost",
  "price",
  "sale_price",
  "quantity",
  "variant_image_urls",
];

export const ALL_COLUMNS = [...PRODUCT_COLUMNS, ...VARIANT_COLUMNS];

/**
 * Human documentation for every column, rendered on the workbook's
 * Instructions sheet. `level` mirrors the PRODUCT/VARIANT split above;
 * keep this list in the same order as ALL_COLUMNS.
 */
export const COLUMN_GUIDE = [
  {
    key: "producturl",
    level: "product",
    required: "REQUIRED — every row",
    howToFill:
      "Unique lowercase-with-hyphens slug; becomes the storefront URL. Rows sharing the same producturl belong to ONE product (one row per variant). If it matches an existing product, that product is UPDATED instead of created.",
    example: "aroma-desire-hanging-diffuser",
    formLocation: "Basic Information → Product URL",
  },
  {
    key: "name",
    level: "product",
    required: "New products: REQUIRED",
    howToFill:
      "Display name shown on the storefront. Only read from the FIRST row of each producturl group. May stay blank when updating an existing product — the stored name is kept.",
    example: "Aroma Desire Hanging Diffuser",
    formLocation: "Basic Information → Product Name",
  },
  {
    key: "product_type",
    level: "product",
    required: "Recommended",
    howToFill: "single or variant. single = one price/stock, exactly one row. variant = one row per variant. Blank counts as single for new products.",
    example: "variant",
    formLocation: "Pricing & Inventory → Product Type",
  },
  {
    key: "status",
    level: "product",
    required: "Optional",
    howToFill: "true = live on the storefront, false = draft. Blank = draft for new products, unchanged for updates.",
    example: "false",
    formLocation: "Publish / Save as Draft buttons",
  },
  {
    key: "category",
    level: "product",
    required: "Recommended",
    howToFill: "Pick from the Reference sheet 'category' list (dropdown). The product's main storefront category.",
    example: "Car-Fragrance",
    formLocation: "Basic Information → Category",
  },
  {
    key: "subcategory",
    level: "product",
    required: "Optional",
    howToFill: "Category:Subcategory pairs joined by | . Pick ready-made pairs from the Reference sheet 'subcategory' list.",
    example: "Car-Fragrance:Hanging|Car-Fragrance:Vent-Clip",
    formLocation: "Basic Information → Subcategory",
  },
  {
    key: "brand",
    level: "product",
    required: "Recommended",
    howToFill: "Pick from the Reference sheet 'brand' list. Unknown brands fail the row. The form requires a brand before publishing.",
    example: "Aroma Desire",
    formLocation: "Basic Information → Brand",
  },
  {
    key: "condition",
    level: "product",
    required: "Optional",
    howToFill: "Pick from the Reference sheet 'condition' list, or type a custom condition (custom text is allowed here).",
    example: "Brand New",
    formLocation: "Basic Information → Condition",
  },
  {
    key: "tags",
    level: "product",
    required: "Optional",
    howToFill: "Tag names joined by | . Each tag must exist in the Reference sheet 'tags' list.",
    example: "Hanging Car Fragrances|Aroma Desire",
    formLocation: "Basic Information → Tag",
  },
  {
    key: "main_category",
    level: "product",
    required: "Optional",
    howToFill: "Central category used for Google Merchant feeds. Leave blank unless you manage feed taxonomy.",
    example: "Vehicles & Parts",
    formLocation: "Edit product → Basic Information",
  },
  {
    key: "summary",
    level: "product",
    required: "Optional",
    howToFill: "Short blurb shown near the price. HTML allowed.",
    example: "<p>Long-lasting hanging car fragrance.</p>",
    formLocation: "Basic Information → Product Summary",
  },
  {
    key: "description",
    level: "product",
    required: "Optional",
    howToFill: "Full product description for the detail page. HTML allowed.",
    example: "<p>Osmanthus notes in a teardrop glass bottle…</p>",
    formLocation: "Basic Information → Product Description",
  },
  {
    key: "specs",
    level: "product",
    required: "Optional",
    howToFill: "Key:Value pairs joined by | . Shown in the specifications table.",
    example: "Volume:8ml|Bottle Shape:Teardrop Glass",
    formLocation: "Product Details → Specifications",
  },
  {
    key: "meta_title",
    level: "product",
    required: "Optional",
    howToFill: "SEO page title. Blank = keep stored value on update.",
    example: "Hanging Diffuser | Aroma Desire",
    formLocation: "SEO & Meta → Meta Title",
  },
  {
    key: "meta_description",
    level: "product",
    required: "Optional",
    howToFill: "SEO description for search results.",
    example: "Shop the Aroma Desire hanging diffuser…",
    formLocation: "SEO & Meta → Meta Description",
  },
  {
    key: "meta_keywords",
    level: "product",
    required: "Optional",
    howToFill: "Comma-separated SEO keywords.",
    example: "car fragrance, hanging diffuser",
    formLocation: "SEO & Meta → Meta Keywords",
  },
  {
    key: "thumbnail_url",
    level: "product",
    required: "Recommended",
    howToFill: "Full https:// URL of the main image. The image is linked as-is (not re-uploaded), so the URL must stay publicly reachable.",
    example: "https://cdn.example.com/img/thumb.png",
    formLocation: "Images & Media → Thumbnail",
  },
  {
    key: "gallery_urls",
    level: "product",
    required: "Optional",
    howToFill: "Gallery image URLs joined by | .",
    example: "https://…/1.png|https://…/2.png",
    formLocation: "Images & Media → Gallery",
  },
  {
    key: "is_featured",
    level: "product",
    required: "Optional",
    howToFill: "true shows the product in featured sections; false/blank does not.",
    example: "false",
    formLocation: "Settings → Featured",
  },
  {
    key: "is_authenticated",
    level: "product",
    required: "Optional",
    howToFill: "true shows the authenticity-checked badge.",
    example: "true",
    formLocation: "Settings → Authenticated",
  },
  {
    key: "low_stock_alert",
    level: "product",
    required: "Optional",
    howToFill: "Number. Admin shows a low-stock warning when quantity falls to this level.",
    example: "2",
    formLocation: "Settings → Low Stock Quantity",
  },
  {
    key: "comes_with",
    level: "product",
    required: "Optional",
    howToFill: "Item slugs joined by | . Pick from the Reference sheet 'comes_with' list.",
    example: "1x-car-vent-clip|2x-fragrance-tablet",
    formLocation: "Settings → Comes With",
  },
  {
    key: "top_section",
    level: "product",
    required: "Optional",
    howToFill: "Highlight slugs joined by | . Pick from the Reference sheet 'top_section' list.",
    example: "free_delivery|30_day_returns",
    formLocation: "Settings → Top Section",
  },
  {
    key: "variant_attributes",
    level: "variant",
    required: "Variant products: REQUIRED",
    howToFill:
      "What makes this variant different: slug=Value pairs joined by | . Pick pairs from the Reference sheet 'variant_attributes' list. LEAVE EMPTY for single products. Every variant row of a product should use the same attribute slugs.",
    example: "scent=White Tea|size=S",
    formLocation: "Pricing & Inventory → Variants",
  },
  {
    key: "variant_name",
    level: "variant",
    required: "Optional",
    howToFill: "Auto-built from the attribute values when blank. Single products use the reserved name 'single'.",
    example: "white-tea-s",
    formLocation: "Pricing & Inventory → Variants",
  },
  {
    key: "sku",
    level: "variant",
    required: "Recommended",
    howToFill: "Your stock-keeping code, unique per variant. Used to match variants when re-importing an update.",
    example: "AD-WT-S-001",
    formLocation: "Pricing & Inventory → SKU",
  },
  {
    key: "ean",
    level: "variant",
    required: "Optional",
    howToFill: "EAN / GTIN barcode number.",
    example: "5012345678900",
    formLocation: "Pricing & Inventory → EAN",
  },
  {
    key: "mpn",
    level: "variant",
    required: "Optional",
    howToFill: "Manufacturer part number.",
    example: "AD-WT-S",
    formLocation: "Pricing & Inventory → MPN",
  },
  {
    key: "cost",
    level: "variant",
    required: "Optional",
    howToFill: "What the item costs you. Never shown to customers.",
    example: "4.00",
    formLocation: "Pricing & Inventory → Cost",
  },
  {
    key: "price",
    level: "variant",
    required: "New products: price or sale_price REQUIRED",
    howToFill: "Regular price in GBP, numbers only. Shown struck-through when a sale_price exists.",
    example: "19.99",
    formLocation: "Pricing & Inventory → Price",
  },
  {
    key: "sale_price",
    level: "variant",
    required: "Optional",
    howToFill: "Current selling price when discounted. Customers pay this when set.",
    example: "9.99",
    formLocation: "Pricing & Inventory → Sale Price",
  },
  {
    key: "quantity",
    level: "variant",
    required: "Recommended",
    howToFill: "Stock on hand, whole number. 0 = shown as out of stock.",
    example: "25",
    formLocation: "Pricing & Inventory → Quantity",
  },
  {
    key: "variant_image_urls",
    level: "variant",
    required: "Optional",
    howToFill: "Image URLs for THIS variant joined by | .",
    example: "https://…/white-tea.png",
    formLocation: "Images & Media → Variant Images",
  },
];

/**
 * Rows whose producturl starts with this are treated as documentation, not
 * data. The export ships template rows so the format is self-describing; the
 * importer skips them so round-tripping never creates junk products.
 */
export const SAMPLE_PREFIX = "sample-";

export const isSampleRow = (row) =>
  String(row?.producturl || "").trim().toLowerCase().startsWith(SAMPLE_PREFIX);

/* ------------------------------------------------------------------ */
/* CSV encoding / decoding (RFC 4180)                                   */
/* ------------------------------------------------------------------ */

/** Byte-order mark — Excel needs it to open a UTF-8 CSV without mangling £ and accents. */
const BOM = String.fromCharCode(0xfeff);

/** Quote a cell only when it needs it. */
function escapeCell(value) {
  const s = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function rowsToCsv(rows, columns = ALL_COLUMNS) {
  const lines = [columns.join(",")];
  rows.forEach((row) => {
    lines.push(columns.map((c) => escapeCell(row[c])).join(","));
  });
  // Excel needs the BOM to read UTF-8 (£, &, accented scent names) correctly.
  return BOM + lines.join("\r\n");
}

/**
 * Parse CSV text into an array of objects keyed by header.
 * Handles quoted fields, escaped quotes, and embedded newlines.
 */
export function csvToRows(text) {
  const src = String(text || "");
  const body = src.startsWith(BOM) ? src.slice(BOM.length) : src;
  const table = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < body.length; i += 1) {
    const ch = body[i];

    if (inQuotes) {
      if (ch === '"') {
        if (body[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      table.push(row);
      row = [];
      cell = "";
    } else if (ch !== "\r") {
      cell += ch;
    }
  }
  // Flush the final cell/row when the file has no trailing newline.
  if (cell !== "" || row.length > 0) {
    row.push(cell);
    table.push(row);
  }

  const nonEmpty = table.filter((r) => r.some((c) => String(c).trim() !== ""));
  if (nonEmpty.length === 0) return { headers: [], rows: [] };

  const headers = nonEmpty[0].map((h) => String(h).trim().toLowerCase());
  const rows = nonEmpty.slice(1).map((cells) => {
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = (cells[idx] ?? "").trim();
    });
    return obj;
  });

  return { headers, rows };
}

/* ------------------------------------------------------------------ */
/* Value encoders                                                       */
/* ------------------------------------------------------------------ */

export const joinMulti = (arr) =>
  Array.isArray(arr) ? arr.filter(Boolean).join(MULTI) : "";

export const splitMulti = (str) =>
  String(str || "")
    .split(MULTI)
    .map((s) => s.trim())
    .filter(Boolean);

/** `product_Specifications` <-> `Key:Value|Key:Value` */
export const encodeSpecs = (specs) =>
  Array.isArray(specs)
    ? specs
        .filter((s) => s && s.key)
        .map((s) => `${s.key}:${s.value ?? ""}`)
        .join(MULTI)
    : "";

export const decodeSpecs = (str) =>
  splitMulti(str).map((pair) => {
    const idx = pair.indexOf(":");
    return idx === -1
      ? { key: pair, value: "" }
      : { key: pair.slice(0, idx).trim(), value: pair.slice(idx + 1).trim() };
  });

/** `variantValues[].attributes` <-> `condition=Brand New|color=Red` */
export const encodeVariantAttributes = (attributes) =>
  Array.isArray(attributes)
    ? attributes
        .filter((a) => a && (a.attributeSlug || a.attributeName))
        .map((a) => `${a.attributeSlug || a.attributeName}=${a.value ?? ""}`)
        .join(MULTI)
    : "";

export const decodeVariantAttributes = (str) =>
  splitMulti(str)
    .map((pair) => {
      const idx = pair.indexOf("=");
      if (idx === -1) return null;
      return {
        attributeSlug: pair.slice(0, idx).trim(),
        value: pair.slice(idx + 1).trim(),
      };
    })
    .filter(Boolean);

/** Image objects -> URL list. Prefers `url`, falls back to `path`. */
export const encodeImages = (images) =>
  Array.isArray(images)
    ? images.map((i) => i?.url || i?.path).filter(Boolean).join(MULTI)
    : "";

/**
 * subCategory is stored as a JSON string of { Category: [Sub, ...] }.
 * CSV carries the far friendlier `Category:Sub|Category:Sub2`.
 */
export function encodeSubCategory(raw) {
  if (!raw) return "";
  let obj = raw;
  if (typeof raw === "string") {
    try {
      obj = JSON.parse(raw);
    } catch {
      return raw; // already plain text — pass it through untouched
    }
  }
  if (!obj || typeof obj !== "object") return "";
  return Object.entries(obj)
    .flatMap(([cat, subs]) =>
      (Array.isArray(subs) ? subs : [subs]).filter(Boolean).map((s) => `${cat}:${s}`)
    )
    .join(MULTI);
}

export function decodeSubCategory(str) {
  const out = {};
  splitMulti(str).forEach((pair) => {
    const idx = pair.indexOf(":");
    if (idx === -1) return;
    const cat = pair.slice(0, idx).trim();
    const sub = pair.slice(idx + 1).trim();
    if (!cat || !sub) return;
    if (!out[cat]) out[cat] = [];
    out[cat].push(sub);
  });
  return Object.keys(out).length ? JSON.stringify(out) : "";
}

export const encodeBool = (v) => (v === true ? "true" : v === false ? "false" : "");

/* ------------------------------------------------------------------ */
/* Product -> CSV rows                                                  */
/* ------------------------------------------------------------------ */

/** Product-level cells, repeated only on the first row of a group. */
function productCells(p) {
  return {
    producturl: p.producturl || "",
    name: p.name || "",
    product_type: p.productType?.type || "single",
    status: encodeBool(p.status === true || p.status === "true"),
    category: p.category || "",
    subcategory: encodeSubCategory(p.subCategory),
    brand: p.brand && p.brand !== "null" ? p.brand : "",
    condition: p.condition && p.condition !== "null" ? p.condition : "",
    tags: p.tags || "",
    main_category: p.mainCategory || "",
    summary: p.Product_summary || "",
    description: p.Product_description || "",
    specs: encodeSpecs(p.product_Specifications),
    meta_title: p.Seo_Meta?.metaTitle || "",
    meta_description: p.Seo_Meta?.metaDescription || "",
    meta_keywords: p.Seo_Meta?.metaKeywords || "",
    thumbnail_url: p.thumbnail_image?.url || p.thumbnail_image?.path || "",
    gallery_urls: encodeImages(p.Gallery_Images),
    is_featured: encodeBool(p.is_featured),
    is_authenticated: encodeBool(p.is_authenticated),
    low_stock_alert: p.low_stock_quantity_alert ?? "",
    comes_with: joinMulti(p.comesWithItems),
    // Product stores this as `topsection`; tolerate `topSectionItems` too.
    top_section: joinMulti(p.topSectionItems || p.topsection),
  };
}

const blankProductCells = () =>
  PRODUCT_COLUMNS.reduce((acc, c) => ({ ...acc, [c]: "" }), {});

function variantCells(v) {
  return {
    variant_attributes: encodeVariantAttributes(v?.attributes),
    variant_name: v?.name || "",
    sku: v?.SKU || "",
    ean: v?.EIN || "",
    mpn: v?.MPN || "",
    cost: v?.Cost ?? "",
    price: v?.Price ?? "",
    sale_price: v?.salePrice ?? "",
    quantity: v?.Quantity ?? "",
    variant_image_urls: encodeImages(v?.variantImages),
  };
}

/** Flatten one product into N rows (one per variant, minimum one). */
export function productToRows(product) {
  const head = productCells(product);
  const variants = Array.isArray(product.variantValues) ? product.variantValues : [];

  if (variants.length === 0) {
    return [{ ...head, ...variantCells(null) }];
  }

  return variants.map((v, idx) => ({
    // Only the first row of a group carries product-level data.
    ...(idx === 0 ? head : { ...blankProductCells(), producturl: head.producturl }),
    ...variantCells(v),
  }));
}

export function productsToRows(products) {
  return (Array.isArray(products) ? products : []).flatMap(productToRows);
}

/* ------------------------------------------------------------------ */
/* Template rows                                                        */
/* ------------------------------------------------------------------ */

/**
 * Shipped at the top of every export so the file is self-documenting:
 * one variant product with three variants, and one single product.
 * `SAMPLE_PREFIX` makes the importer skip them.
 */
export function sampleRows() {
  const variantHead = {
    producturl: "sample-variant-product",
    name: "SAMPLE — Variant Product (3 variants)",
    product_type: "variant",
    status: "false",
    category: "Car-Fragrance",
    subcategory: "Car-Fragrance:Hanging",
    brand: "Aroma Desire",
    condition: "Brand New",
    tags: "Hanging Car Fragrances|Aroma Desire",
    main_category: "",
    summary: "<p>Short summary shown above the fold.</p>",
    description: "<p>Full HTML description for the product detail page.</p>",
    specs: "Fragrance Name:Osmanthus|Bottle Shape:Teardrop Glass|Volume:8ml",
    meta_title: "Sample Variant Product | Aroma Desire",
    meta_description: "Meta description used for the page title tag and search results.",
    meta_keywords: "sample, variant, fragrance",
    thumbnail_url: "https://example.com/images/sample-thumb.png",
    gallery_urls: "https://example.com/images/g1.png|https://example.com/images/g2.png",
    is_featured: "false",
    is_authenticated: "true",
    low_stock_alert: "1",
    comes_with: "1x-car-vent-clip|2x-fragrance-tablet",
    top_section: "free_delivery|30_day_returns",
  };

  const variantRows = [
    {
      variant_attributes: "scent=White Tea|size=S",
      variant_name: "white-tea-s",
      sku: "SAMPLE-WT-S",
      ean: "5012345678900",
      mpn: "AD-WT-S",
      cost: "4.00",
      price: "19.99",
      sale_price: "9.99",
      quantity: "25",
      variant_image_urls: "https://example.com/images/white-tea.png",
    },
    {
      variant_attributes: "scent=English Pear|size=S",
      variant_name: "english-pear-s",
      sku: "SAMPLE-EP-S",
      ean: "5012345678917",
      mpn: "AD-EP-S",
      cost: "4.00",
      price: "19.99",
      sale_price: "11.99",
      quantity: "12",
      variant_image_urls: "https://example.com/images/english-pear.png",
    },
    {
      variant_attributes: "scent=Bamboo|size=M",
      variant_name: "bamboo-m",
      sku: "SAMPLE-BM-M",
      ean: "5012345678924",
      mpn: "AD-BM-M",
      cost: "5.00",
      price: "24.99",
      sale_price: "14.99",
      quantity: "0",
      variant_image_urls: "https://example.com/images/bamboo.png",
    },
  ];

  const singleRow = {
    ...blankProductCells(),
    producturl: "sample-single-product",
    name: "SAMPLE — Single Product",
    product_type: "single",
    status: "false",
    category: "Home-Fragrances",
    subcategory: "Home-Fragrances:Reed-Diffuser",
    brand: "Aroma Desire",
    condition: "Brand New",
    tags: "Home Fragrances",
    main_category: "",
    summary: "<p>A single product has no variant options.</p>",
    description: "<p>One fixed price, one stock count.</p>",
    specs: "Volume:100ml|Burn Time:N/A",
    meta_title: "Sample Single Product | Aroma Desire",
    meta_description: "Single products still store their price inside one variant row.",
    meta_keywords: "sample, single",
    thumbnail_url: "https://example.com/images/sample-single.png",
    gallery_urls: "https://example.com/images/single-1.png",
    is_featured: "false",
    is_authenticated: "true",
    low_stock_alert: "1",
    comes_with: "1x-product-box",
    top_section: "free_delivery",
    // Single products leave variant_attributes empty and use the reserved name.
    variant_attributes: "",
    variant_name: "single",
    sku: "SAMPLE-SINGLE-001",
    ean: "5012345678931",
    mpn: "AD-SINGLE-001",
    cost: "6.00",
    price: "29.99",
    sale_price: "19.99",
    quantity: "40",
    variant_image_urls: "",
  };

  return [
    { ...variantHead, ...variantRows[0] },
    { ...blankProductCells(), producturl: variantHead.producturl, ...variantRows[1] },
    { ...blankProductCells(), producturl: variantHead.producturl, ...variantRows[2] },
    singleRow,
  ];
}

/* ------------------------------------------------------------------ */
/* CSV rows -> import payload                                           */
/* ------------------------------------------------------------------ */

const toNumber = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  // Tolerate "£19.99" and "1,299.00" from hand-edited spreadsheets.
  const n = Number(String(v).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : null;
};

const toBool = (v) => {
  const s = String(v || "").trim().toLowerCase();
  if (["true", "1", "yes", "y"].includes(s)) return true;
  if (["false", "0", "no", "n"].includes(s)) return false;
  return null;
};

/**
 * Group flat rows back into product payloads.
 * Returns { products, errors } — errors are per-row and never throw.
 */
export function rowsToProducts(rows) {
  const groups = new Map();
  const errors = [];
  let skippedSamples = 0;

  rows.forEach((row, idx) => {
    const line = idx + 2; // +1 for the header, +1 for 1-based numbering

    if (isSampleRow(row)) {
      skippedSamples += 1;
      return;
    }

    const producturl = String(row.producturl || "").trim();
    if (!producturl) {
      errors.push({ line, message: "Missing producturl — this column is the group key and is required." });
      return;
    }

    if (!groups.has(producturl)) {
      const name = String(row.name || "").trim();
      if (!name) {
        // Not fatal: updates only need the producturl (the stored name is
        // kept). The importer rejects a CREATE without a name server-side.
        errors.push({ line, message: `"${producturl}" has no name on its first row — fine when updating an existing product, but a NEW product will be rejected.` });
      }

      // Blank cells stay null so the importer can tell "not provided" (keep
      // the stored value on update / apply the default on create) apart from
      // an explicit value.
      const rawType = String(row.product_type || "").trim().toLowerCase();

      groups.set(producturl, {
        producturl,
        name: name || null,
        productType: { type: rawType ? (rawType === "variant" ? "variant" : "single") : null },
        status: toBool(row.status),
        category: String(row.category || "").trim() || null,
        subCategory: decodeSubCategory(row.subcategory) || null,
        brand: String(row.brand || "").trim() || null,
        condition: String(row.condition || "").trim() || null,
        tags: String(row.tags || "").split(MULTI).map((s) => s.trim()).filter(Boolean).join(",") || null,
        mainCategory: String(row.main_category || "").trim() || null,
        Product_summary: row.summary || null,
        Product_description: row.description || null,
        product_Specifications: decodeSpecs(row.specs),
        Seo_Meta: {
          metaTitle: String(row.meta_title || "").trim() || null,
          metaDescription: String(row.meta_description || "").trim() || null,
          metaKeywords: String(row.meta_keywords || "").trim() || null,
          metaSchemas: [],
        },
        thumbnailUrl: String(row.thumbnail_url || "").trim() || null,
        galleryUrls: splitMulti(row.gallery_urls),
        is_featured: toBool(row.is_featured),
        is_authenticated: toBool(row.is_authenticated),
        low_stock_quantity_alert: toNumber(row.low_stock_alert),
        comesWithItems: splitMulti(row.comes_with),
        topSectionItems: splitMulti(row.top_section),
        variants: [],
      });
    }

    const group = groups.get(producturl);
    const price = toNumber(row.price);
    const salePrice = toNumber(row.sale_price);

    if (price === null && salePrice === null) {
      errors.push({ line, message: `"${producturl}" variant has neither price nor sale_price — a NEW product would show as £0 (updates keep the stored price).` });
    }

    group.variants.push({
      name: String(row.variant_name || "").trim() || (group.productType.type === "single" ? "single" : ""),
      attributes: decodeVariantAttributes(row.variant_attributes),
      Cost: toNumber(row.cost),
      Price: price,
      // salePrice is typed String in the schema — keep it a plain numeric string.
      salePrice: salePrice === null ? null : String(salePrice),
      Quantity: toNumber(row.quantity),
      SKU: String(row.sku || "").trim() || null,
      EIN: String(row.ean || "").trim() || null,
      MPN: String(row.mpn || "").trim() || null,
      imageUrls: splitMulti(row.variant_image_urls),
    });
  });

  // A variant product needs its option list rebuilt from the variant rows.
  const products = [...groups.values()].map((g) => {
    if (g.productType.type === "variant") {
      const byAttribute = new Map();
      g.variants.forEach((v) => {
        v.attributes.forEach((a) => {
          if (!byAttribute.has(a.attributeSlug)) byAttribute.set(a.attributeSlug, new Set());
          byAttribute.get(a.attributeSlug).add(a.value);
        });
      });
      g.variantNames = [...byAttribute.entries()].map(([slug, values]) => ({
        name: slug,
        attributeSlug: slug,
        hasModels: false,
        options: [...values].map((value) => ({ value })),
      }));
    } else {
      g.variantNames = [];
    }
    return g;
  });

  return { products, errors, skippedSamples };
}
