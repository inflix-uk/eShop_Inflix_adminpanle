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
  PRODUCT_COLUMNS,
  productsToRows,
  rowsToProducts,
  sampleRows,
} from "./productCsvSchema";

const DATA_SHEET = "Products";
const REFERENCE_SHEET = "Reference";

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

/** Build and download the .xlsx workbook. */
export async function buildProductWorkbook({ products = [], reference = null } = {}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "eShop Admin";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(DATA_SHEET, {
    views: [{ state: "frozen", ySplit: 1, xSplit: 1 }],
  });
  const refSheet = workbook.addWorksheet(REFERENCE_SHEET);

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
      fgColor: { argb: PRODUCT_COLUMNS.includes(key) ? "FF33415A" : "FF1D6B58" },
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
