/**
 * Product spreadsheet (.xlsx) builder / reader.
 *
 * CSV cannot express dropdowns, so the spreadsheet export attaches Excel data
 * validation to every column whose value is a controlled list in the product
 * form (brand, condition, category, tags, variant attributes, comes-with…).
 * The lists live on a `Reference` sheet and are pulled live from the backend,
 * so the options in the file always match what the admin UI itself offers.
 */
import ExcelJS from "exceljs";

import {
  ALL_COLUMNS,
  COLUMN_GUIDE,
  PRODUCT_COLUMNS,
  productsToRows,
  rowsToProducts,
  sampleRows,
} from "./productCsvSchema";

const DATA_SHEET = "Products";
const REFERENCE_SHEET = "Reference";
const INSTRUCTIONS_SHEET = "Instructions";

/** Excel refuses to open a workbook with more than 1000 validated rows cheaply. */
const VALIDATED_ROWS = 500;

/** Attribute slugs that are product-level columns rather than variant dimensions. */
const COLUMN_FOR_ATTRIBUTE = {
  brands: "brand",
  condition: "condition",
  comes_with: "comes_with",
  top_section: "top_section",
};

/** Wider columns for the fields people actually read. */
const COLUMN_WIDTH = {
  producturl: 34,
  name: 38,
  description: 46,
  summary: 34,
  specs: 40,
  meta_title: 32,
  meta_description: 44,
  meta_keywords: 26,
  thumbnail_url: 38,
  gallery_urls: 38,
  variant_attributes: 34,
  variant_name: 24,
  variant_image_urls: 32,
  comes_with: 28,
  top_section: 26,
  category: 22,
  subcategory: 26,
  tags: 26,
  brand: 20,
  condition: 22,
};

/**
 * Turn the backend reference payload into named value lists, keyed by the
 * spreadsheet column they belong to.
 */
export function buildReferenceLists(reference) {
  const lists = {};
  if (!reference) return lists;

  const categories = reference.categories || [];
  lists.category = categories.map((c) => c.name).filter(Boolean);
  lists.subcategory = categories
    // The category model stores its children under `subCategory` (singular) —
    // accept `subCategories` too in case the reference endpoint pluralises it,
    // otherwise the subcategory dropdown ships empty.
    .flatMap((c) => (c.subCategories || c.subCategory || []).map((s) => `${c.name}:${s}`))
    .filter(Boolean);
  lists.tags = (reference.tags || []).filter(Boolean);

  (reference.attributes || []).forEach((attr) => {
    const column = COLUMN_FOR_ATTRIBUTE[attr.slug];
    // comes_with / top_section are stored as slugs; everything else by display name.
    const useSlug = attr.slug === "comes_with" || attr.slug === "top_section";
    const values = (attr.values || [])
      .map((v) => (useSlug ? v.slug : v.name))
      .filter(Boolean);

    if (column) {
      lists[column] = values;
    } else {
      // A variant dimension — offered as ready-made `slug=Value` pairs.
      lists[`attr:${attr.slug}`] = values.map((v) => `${attr.slug}=${v}`);
    }
  });

  return lists;
}

const TRUE_FALSE = ["true", "false"];

/* ------------------------------------------------------------------ */
/* Instructions sheet                                                   */
/* ------------------------------------------------------------------ */

const SLATE = "FF33415A";
const TEAL = "FF1D6B58";
const AMBER = "FFB45309";
const PALE_AMBER = "FFFEF3C7";
const PALE_GREY = "FFF1F5F9";

/**
 * A step-by-step guide rendered inside the workbook itself, so the file can
 * be handed to someone who has never seen the admin panel. Content lives in
 * COLUMN_GUIDE (productCsvSchema.js) so the guide can never drift from the
 * columns the importer actually reads.
 */
function buildInstructionsSheet(workbook) {
  const sheet = workbook.addWorksheet(INSTRUCTIONS_SHEET, {
    properties: { tabColor: { argb: AMBER } },
  });

  const WIDTHS = [26, 11, 30, 56, 40, 34];
  WIDTHS.forEach((w, i) => {
    sheet.getColumn(i + 1).width = w;
  });

  let rowIdx = 1;

  const addRow = (values = [], opts = {}) => {
    const row = sheet.getRow(rowIdx);
    values.forEach((v, i) => {
      row.getCell(i + 1).value = v;
    });
    if (opts.merge) sheet.mergeCells(rowIdx, 1, rowIdx, WIDTHS.length);
    if (opts.font) row.font = opts.font;
    if (opts.fill) {
      // Fill each cell (not the row) so the colour survives column resizing.
      for (let c = 1; c <= WIDTHS.length; c += 1) {
        row.getCell(c).fill = { type: "pattern", pattern: "solid", fgColor: { argb: opts.fill } };
      }
    }
    row.alignment = { vertical: "top", wrapText: true, ...opts.alignment };
    if (opts.height) row.height = opts.height;
    rowIdx += 1;
    return row;
  };

  const addBlank = () => addRow([]);

  const addTitle = (text) =>
    addRow([text], {
      merge: true,
      font: { bold: true, size: 16, color: { argb: "FFFFFFFF" } },
      fill: SLATE,
      height: 30,
      alignment: { vertical: "middle" },
    });

  const addSection = (text) =>
    addRow([text], {
      merge: true,
      font: { bold: true, size: 12, color: { argb: "FFFFFFFF" } },
      fill: TEAL,
      height: 22,
      alignment: { vertical: "middle" },
    });

  const addStep = (n, text) =>
    addRow([`${n}.  ${text}`], { merge: true });

  const addBullet = (text) => addRow([`•  ${text}`], { merge: true });

  /* ---------- header ---------- */
  addTitle("How to create products with this file");
  addRow(
    [
      "Fill the Products sheet (one row per variant), save, then import the file on the admin panel's products page. " +
        "A preview always runs first — nothing is written until you confirm it.",
    ],
    { merge: true, height: 30 }
  );
  addBlank();

  /* ---------- ground rules ---------- */
  addSection("Read this first");
  [
    "The Products sheet starts with grey SAMPLE rows (producturl begins with 'sample-'). They exist to show the format. The importer always skips them — you can overwrite or delete them freely.",
    "Header colours on the Products sheet: dark blue columns describe the PRODUCT (read from the first row of each product only); green columns describe each VARIANT (read from every row).",
    "Cells that offer multiple values use the pipe character | between values — never a comma. Example: tag1|tag2.",
    "Dropdown-backed cells (category, brand, condition, tags, variant attributes…) must use values from the Reference sheet. The dropdowns are attached to the first 500 rows; a typo fails that row on import instead of creating a broken product.",
    "Do not rename or reorder the header row — the importer finds columns by these exact names.",
    "Images are carried as https:// URLs and linked as-is. Keep the URLs publicly reachable, or add images later in the product form.",
    "Prices are numbers only (19.99). Currency symbols are tolerated but not needed.",
    "Re-importing a file with the same producturl UPDATES that product: blank cells keep the stored value, filled cells overwrite it. Variants are matched by SKU first, then name, then slug.",
  ].forEach(addBullet);
  addBlank();

  /* ---------- single product ---------- */
  addSection("Create a SINGLE product (one price, one stock count)");
  [
    "Add ONE row. Set producturl (unique slug), name, and product_type = single.",
    "Leave variant_attributes EMPTY and set variant_name = single (or leave it blank — it is filled automatically).",
    "Fill price (or sale_price), quantity, and ideally sku.",
    "Pick category, brand and condition from the dropdowns; join tags with | .",
    "Optionally fill summary, description, specs, SEO columns, thumbnail_url and gallery_urls.",
    "Set status = false to import as a draft you can finish in the admin form, or true to go live immediately.",
  ].forEach((text, i) => addStep(i + 1, text));
  addBlank();

  /* ---------- variant product ---------- */
  addSection("Create a VARIANT product (sizes, colours, scents…)");
  [
    "Add ONE ROW PER VARIANT and give every row the SAME producturl — that is what groups them into one product.",
    "On the FIRST row only, fill the product columns (name, product_type = variant, category, brand, description…). Product columns on later rows are ignored.",
    "On EVERY row, fill variant_attributes with what makes that variant different, as slug=Value pairs joined by | . Example: scent=White Tea|size=S. Pick ready-made pairs from the Reference sheet.",
    "Use the same attribute slugs on every row of the product (e.g. every row sets scent and size). The storefront's option pickers are built from these.",
    "Give each row its own price / sale_price, quantity, sku and (optionally) variant_image_urls.",
    "The 'sample-variant-product' rows at the top of the Products sheet show a complete worked example with three variants.",
  ].forEach((text, i) => addStep(i + 1, text));
  addBlank();

  /* ---------- updating ---------- */
  addSection("Update existing products");
  [
    "Export first — the file arrives pre-filled with your live catalogue, one row per variant.",
    "Edit the cells you want to change. Blank cells always mean 'keep what is stored', so you only fill what changes.",
    "Keep the producturl column untouched — it is how rows find their product. Keep SKUs stable so variants match up.",
    "Import the file. The preview lists exactly what will be created, updated and rejected before anything is written.",
  ].forEach((text, i) => addStep(i + 1, text));
  addBlank();

  /* ---------- column guide ---------- */
  addSection("Every column, explained");
  const headerRow = addRow(
    ["Column", "Applies to", "Required?", "How to fill it", "Example", "Where it lives in the admin form"],
    { font: { bold: true }, fill: PALE_GREY }
  );
  headerRow.alignment = { vertical: "middle", wrapText: true };

  COLUMN_GUIDE.forEach((col) => {
    const row = addRow([
      col.key,
      col.level === "product" ? "Product" : "Variant",
      col.required,
      col.howToFill,
      col.example,
      col.formLocation,
    ]);
    row.getCell(1).font = { bold: true, color: { argb: col.level === "product" ? SLATE : TEAL } };
    // Make the hard requirements visually loud.
    if (/REQUIRED/.test(col.required)) {
      row.getCell(3).fill = { type: "pattern", pattern: "solid", fgColor: { argb: PALE_AMBER } };
      row.getCell(3).font = { bold: true };
    }
  });
  addBlank();

  /* ---------- out of scope ---------- */
  addSection("Not carried by this file — finish these in the product form");
  addRow(
    [
      "Battery options, warranty, refund policy, perks & benefits, SIM options, meta image / meta schemas, " +
        "block-based descriptions, per-option image groups, related products, reviews and FAQs can't ride in a spreadsheet. " +
        "Import the product first, then open it in the admin panel (Edit Product) to complete those tabs.",
    ],
    { merge: true, height: 44 }
  );

  return sheet;
}

/** Build and download the .xlsx workbook. */
export async function buildProductWorkbook({ products = [], reference = null } = {}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "eShop Admin";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(DATA_SHEET, {
    views: [{ state: "frozen", ySplit: 1, xSplit: 1 }],
    properties: { tabColor: { argb: SLATE } },
  });
  const refSheet = workbook.addWorksheet(REFERENCE_SHEET, {
    properties: { tabColor: { argb: TEAL } },
  });

  /* ---------------- header ---------------- */
  sheet.columns = ALL_COLUMNS.map((key) => ({
    header: key,
    key,
    width: COLUMN_WIDTH[key] || 16,
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { vertical: "middle" };
  headerRow.height = 22;
  ALL_COLUMNS.forEach((key, idx) => {
    headerRow.getCell(idx + 1).fill = {
      type: "pattern",
      pattern: "solid",
      // Product-level columns in slate, variant-level in teal, so the split is obvious.
      fgColor: { argb: PRODUCT_COLUMNS.includes(key) ? SLATE : TEAL },
    };
  });

  /* ---------------- data ---------------- */
  const rows = [...sampleRows(), ...productsToRows(products)];
  rows.forEach((row) => sheet.addRow(row));

  // Grey out the template rows so they read as documentation, not data.
  rows.forEach((row, idx) => {
    if (String(row.producturl || "").startsWith("sample-")) {
      sheet.getRow(idx + 2).font = { italic: true, color: { argb: "FF8A94A6" } };
    }
  });

  /* ---------------- reference lists ---------------- */
  const lists = buildReferenceLists(reference);
  const listNames = Object.keys(lists).filter((k) => lists[k]?.length);

  refSheet.getRow(1).font = { bold: true };
  const rangeFor = {};

  listNames.forEach((name, colIdx) => {
    const values = lists[name];
    const colLetter = refSheet.getColumn(colIdx + 1).letter;
    refSheet.getCell(1, colIdx + 1).value = name;
    values.forEach((v, i) => {
      refSheet.getCell(i + 2, colIdx + 1).value = v;
    });
    refSheet.getColumn(colIdx + 1).width = Math.min(
      40,
      Math.max(14, ...values.map((v) => String(v).length + 2))
    );
    // Absolute range so Excel keeps the reference when rows are copied.
    rangeFor[name] = `${REFERENCE_SHEET}!$${colLetter}$2:$${colLetter}$${values.length + 1}`;
  });

  /* ---------------- data validation ---------------- */
  const applyList = (column, formula, { allowBlank = true, strict = true } = {}) => {
    const colIdx = ALL_COLUMNS.indexOf(column);
    if (colIdx === -1) return;
    const letter = sheet.getColumn(colIdx + 1).letter;
    for (let r = 2; r <= VALIDATED_ROWS + 1; r += 1) {
      sheet.getCell(`${letter}${r}`).dataValidation = {
        type: "list",
        allowBlank,
        formulae: [formula],
        // Non-strict lets people paste multi-value cells (tags, comes_with).
        showErrorMessage: strict,
        errorStyle: "warning",
        errorTitle: "Not a known value",
        error: `Pick a value from the ${REFERENCE_SHEET} sheet, or clear the cell.`,
      };
    }
  };

  // Single-value dropdowns — strict.
  ["category", "brand", "condition"].forEach((col) => {
    if (rangeFor[col]) applyList(col, rangeFor[col]);
  });

  // Multi-value cells: the dropdown inserts one value; users may join more
  // with `|`, so validation must not reject the combined string.
  ["subcategory", "tags", "comes_with", "top_section"].forEach((col) => {
    if (rangeFor[col]) applyList(col, rangeFor[col], { strict: false });
  });

  // product_type and the booleans are fixed vocabularies.
  applyList("product_type", '"single,variant"');
  ["status", "is_featured", "is_authenticated"].forEach((col) =>
    applyList(col, `"${TRUE_FALSE.join(",")}"`)
  );

  // variant_attributes accepts any `slug=Value` pair, so offer every dimension
  // in one combined list and keep it non-strict for multi-attribute cells.
  const attrRanges = listNames.filter((n) => n.startsWith("attr:"));
  if (attrRanges.length) {
    const combined = attrRanges.flatMap((n) => lists[n]);
    const colLetter = refSheet.getColumn(listNames.length + 1).letter;
    refSheet.getCell(1, listNames.length + 1).value = "variant_attributes";
    combined.forEach((v, i) => {
      refSheet.getCell(i + 2, listNames.length + 1).value = v;
    });
    refSheet.getColumn(listNames.length + 1).width = 34;
    applyList(
      "variant_attributes",
      `${REFERENCE_SHEET}!$${colLetter}$2:$${colLetter}$${combined.length + 1}`,
      { strict: false }
    );
  }

  sheet.autoFilter = { from: "A1", to: { row: 1, column: ALL_COLUMNS.length } };

  buildInstructionsSheet(workbook);

  return workbook;
}

/** Read a .xlsx back into the same row objects the CSV parser produces. */
export async function readProductWorkbook(arrayBuffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const sheet = workbook.getWorksheet(DATA_SHEET) || workbook.worksheets[0];
  if (!sheet) return { headers: [], rows: [] };

  const headers = [];
  sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, col) => {
    headers[col - 1] = String(cell.value ?? "").trim().toLowerCase();
  });

  const rows = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj = {};
    headers.forEach((h, idx) => {
      if (!h) return;
      const raw = row.getCell(idx + 1).value;
      // Excel hands back objects for formulas, hyperlinks and rich text.
      let value = raw;
      if (raw && typeof raw === "object") {
        if ("text" in raw) value = raw.text;
        else if ("result" in raw) value = raw.result;
        else if ("richText" in raw) value = raw.richText.map((t) => t.text).join("");
        else if (raw instanceof Date) value = raw.toISOString();
        else value = "";
      }
      obj[h] = value === null || value === undefined ? "" : String(value).trim();
    });
    if (Object.values(obj).some((v) => v !== "")) rows.push(obj);
  });

  return { headers: headers.filter(Boolean), rows };
}

export { rowsToProducts };
