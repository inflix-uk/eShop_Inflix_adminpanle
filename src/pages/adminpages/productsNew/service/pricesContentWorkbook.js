/**
 * Files for the "Prices & Content" export / import, offered as two separate,
 * small files so each can be edited (or pasted into ChatGPT) on its own:
 *   - "Product Details & Pricing" (part "prices"): sheet "Variant Prices", one row
 *     per variant (SKU, EAN, MPN, cost, price, sale price, quantity, active).
 *   - "Descriptions & Perks" (part "content"): one row per product (summary,
 *     description, perks).
 * Each can be .xlsx or .csv. The old combined workbook (both sheets) still imports.
 * The id columns tie each row to the exact product / variant it came from, so they
 * must not be edited. Blank cells keep what is stored.
 */
import ExcelJS from "exceljs";

export const NOT_EDITABLE_DESCRIPTION = "(edit this description in the product form)";

const VARIANT_COLUMNS = [
  { header: "product_id", key: "productId", width: 26, locked: true },
  { header: "variant_id", key: "variantId", width: 26, locked: true },
  { header: "product_name", key: "productName", width: 40, locked: true },
  { header: "brand", key: "brand", width: 16, locked: true },
  { header: "variant", key: "variant", width: 34, locked: true },
  { header: "sku", key: "sku", width: 20 },
  { header: "ean", key: "ean", width: 18 },
  { header: "mpn", key: "mpn", width: 16 },
  { header: "cost", key: "cost", width: 10, number: true },
  { header: "price", key: "price", width: 10, number: true },
  { header: "sale_price", key: "salePrice", width: 11, number: true },
  { header: "quantity", key: "quantity", width: 10, number: true },
  { header: "active", key: "active", width: 9, yesNo: true },
];

const CONTENT_COLUMNS = [
  { header: "product_id", key: "productId", width: 26, locked: true },
  { header: "product_name", key: "productName", width: 40, locked: true },
  { header: "product_url", key: "productUrl", width: 34, locked: true },
  { header: "summary", key: "summary", width: 50, wrap: true },
  { header: "description_html", key: "description", width: 80, wrap: true },
  { header: "perks_enabled", key: "perksEnabled", width: 14, yesNo: true },
  { header: "perks_html", key: "perks", width: 80, wrap: true },
];

const SHEETS = [
  { name: "Variant Prices", columns: VARIANT_COLUMNS, dataKey: "variants" },
  { name: "Descriptions & Perks", columns: CONTENT_COLUMNS, dataKey: "content" },
];

/** The two halves the admin exports / imports separately. */
export const PARTS = {
  prices: {
    key: "prices",
    title: "Product Details & Pricing",
    fileSlug: "product-pricing",
    sheet: SHEETS[0],
  },
  content: {
    key: "content",
    title: "Descriptions & Perks",
    fileSlug: "descriptions-perks",
    sheet: SHEETS[1],
  },
};

const sheetsFor = (part) => (PARTS[part] ? [PARTS[part].sheet] : SHEETS);
const partOfSheet = (sheet) => Object.values(PARTS).find((p) => p.sheet === sheet)?.key || null;

const LOCKED_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF3F4F6" } };
const HEADER_FILL = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F2937" } };

function addSheet(workbook, { name, columns }, rows) {
  const ws = workbook.addWorksheet(name, { views: [{ state: "frozen", xSplit: 0, ySplit: 1 }] });
  ws.columns = columns.map((c) => ({ header: c.header, key: c.key, width: c.width }));
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  ws.getRow(1).fill = HEADER_FILL;
  rows.forEach((r) => ws.addRow(r));
  const last = Math.max(rows.length + 1, 2);
  columns.forEach((c, i) => {
    for (let r = 2; r <= last; r += 1) {
      const cell = ws.getCell(r, i + 1);
      if (c.locked) cell.fill = LOCKED_FILL;
      if (c.wrap) cell.alignment = { wrapText: true, vertical: "top" };
      if (c.yesNo) {
        cell.dataValidation = { type: "list", allowBlank: true, formulae: ['"Yes,No"'] };
      }
    }
  });
  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: columns.length } };
  return ws;
}

const contentRowsForFile = (content) =>
  content.map((r) => ({
    ...r,
    description: r.descriptionEditable === false ? NOT_EDITABLE_DESCRIPTION : r.description,
  }));

function howToLines(part) {
  const one = PARTS[part];
  const lines = [one ? `${one.title.toUpperCase()} SHEET` : "PRICES & CONTENT SHEET", ""];
  lines.push(
    one
      ? `1. Edit the white cells on the '${one.sheet.name}' sheet.`
      : "1. Edit the white cells on the 'Variant Prices' and 'Descriptions & Perks' sheets."
  );
  if (part !== "content") lines.push("   Every variant has its own row, so each variant keeps its own price.");
  lines.push(
    "2. Do not change the grey columns (product_id, variant_id, names, brand). They tell the system which product/variant a row belongs to.",
    "3. A blank cell means 'keep what is saved'. To change a value, type the new one."
  );
  if (part !== "content") lines.push("4. Prices: numbers only (e.g. 249.99). active: Yes or No.");
  if (part !== "prices") {
    lines.push(
      "5. Descriptions and perks are HTML, e.g. <p>Text</p>. Keep the tags if you copy text in. perks_enabled: Yes or No.",
      `6. A description showing "${NOT_EDITABLE_DESCRIPTION}" has several parts — change it in the product form.`
    );
  }
  lines.push(
    "7. You can delete rows you are not changing. Rows cannot add or remove variants.",
    one
      ? `8. Import it with Prices & Content > ${one.title} > Import. You will see every change before it is saved. This file only ever changes ${one.title.toLowerCase()}.`
      : "8. Import the file from the products page (Prices & Content). You will see every change before it is saved."
  );
  return lines;
}

/**
 * Excel file for one part ("prices" | "content"), or both sheets when `part` is
 * omitted (the original combined workbook).
 */
export async function buildPricesContentWorkbook({ variants = [], content = [] }, part) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Admin panel";
  workbook.created = new Date();

  const info = workbook.addWorksheet("How to use");
  info.getColumn(1).width = 110;
  howToLines(part).forEach((line, i) => {
    const cell = info.getCell(i + 1, 1);
    cell.value = line;
    if (i === 0) cell.font = { bold: true, size: 14 };
  });

  sheetsFor(part).forEach((sheet) => {
    addSheet(workbook, sheet, sheet.dataKey === "variants" ? variants : contentRowsForFile(content));
  });
  return workbook;
}

const csvCell = (value) => {
  const text = value === null || value === undefined ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/**
 * CSV text for one part ("prices" | "content"): a header row, then one row per
 * variant or per product. Starts with a BOM so Excel reads £ and accents as UTF-8.
 */
export function buildPricesContentCsv({ variants = [], content = [] }, part) {
  const { sheet } = PARTS[part];
  const rows = sheet.dataKey === "variants" ? variants : contentRowsForFile(content);
  const lines = [sheet.columns.map((c) => c.header).join(",")];
  rows.forEach((r) => lines.push(sheet.columns.map((c) => csvCell(r[c.key])).join(",")));
  return String.fromCharCode(0xfeff) + lines.join("\r\n") + "\r\n";
}

/** Plain text of an ExcelJS cell value (rich text, hyperlinks, formula results). */
export function cellText(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") {
    if (Array.isArray(value.richText)) return value.richText.map((p) => p.text).join("");
    if ("result" in value) return cellText(value.result);
    if ("text" in value) return cellText(value.text);
    if ("hyperlink" in value) return String(value.hyperlink);
    return "";
  }
  return String(value);
}

// Byte-order mark Excel/Notepad put at the start of UTF-8 CSV files.
const LEADING_BOM = new RegExp("^" + String.fromCharCode(0xfeff));

/** Header text as the importer compares it: no BOM, trimmed, lowercase, "Sale Price" -> "sale_price". */
export function normalizeHeader(text) {
  return String(text ?? "")
    .replace(LEADING_BOM, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/** Minimal CSV parser (quoted fields, "" escapes, CRLF). Returns rows of strings. */
export function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  const src = String(text).replace(LEADING_BOM, "");
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        quoted = false;
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i += 1;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => String(c).trim() !== ""));
}

/**
 * Turn a header row + data rows into API records for one sheet.
 * `rowNumberOf(i)` gives the spreadsheet row number of data row i (for messages).
 */
function rowsToRecords(headers, dataRows, columns, rowNumberOf) {
  const headerIndex = {};
  headers.forEach((h, i) => {
    const key = normalizeHeader(h);
    if (key && headerIndex[key] === undefined) headerIndex[key] = i;
  });
  const missingId = headerIndex.product_id === undefined;
  const records = [];
  let rowsWithoutId = 0;
  dataRows.forEach((cells, i) => {
    const record = { row: rowNumberOf(i) };
    let hasId = false;
    let hasAny = false;
    columns.forEach((c) => {
      const col = headerIndex[c.header];
      if (col === undefined) return;
      let v = cells[col];
      if (v === undefined || v === null) v = "";
      if (typeof v === "string") v = v.trim();
      if (c.key === "description" && v === NOT_EDITABLE_DESCRIPTION) v = "";
      record[c.key] = v;
      if (v !== "") hasAny = true;
      if (c.key === "productId" && v) hasId = true;
    });
    if (hasId) records.push(record);
    else if (hasAny) rowsWithoutId += 1;
  });
  return { records, missingId, rowsWithoutId };
}

/**
 * Read an edited file back into { variants, content } rows for the API.
 * `part` ("prices" | "content") reads only that half — from a split file, a CSV,
 * or the matching sheet of an old combined workbook. The other half's sheet is
 * never read; it is listed in `ignoredSheets`, and `otherPart` is set when the
 * file holds the other half. Without `part` both halves are read.
 * Columns are found by header name, so reordering columns is fine.
 * Each row carries its spreadsheet row number for error messages, and
 * `warnings` lists anything that was ignored so nothing is dropped silently.
 */
export async function readPricesContentWorkbook(file, part) {
  const wanted = sheetsFor(part);
  const out = {
    variants: [],
    content: [],
    missingSheets: [],
    warnings: [],
    ignoredSheets: [],
    otherPart: null,
  };
  const isCsv = /\.csv$/i.test(file.name || "") || file.type === "text/csv";

  const addRows = ({ name, columns, dataKey }, headers, dataRows, rowNumberOf) => {
    const { records, missingId, rowsWithoutId } = rowsToRecords(headers, dataRows, columns, rowNumberOf);
    if (missingId) {
      out.warnings.push(
        `"${name}": no product_id column was found in the first row, so no rows could be read. Keep the header row exactly as exported.`
      );
    } else if (rowsWithoutId > 0) {
      out.warnings.push(`"${name}": ${rowsWithoutId} row(s) have no product_id and were ignored.`);
    }
    out[dataKey].push(...records);
  };
  const skipSheet = (sheet) => {
    if (!out.ignoredSheets.includes(sheet.name)) out.ignoredSheets.push(sheet.name);
    out.otherPart = partOfSheet(sheet);
  };

  if (isCsv) {
    const rows = parseCsv(await file.text());
    const headers = (rows[0] || []).map(normalizeHeader);
    // A CSV holds one sheet: variant rows have a variant_id column.
    const sheet = headers.includes("variant_id") ? SHEETS[0] : SHEETS[1];
    out.missingSheets = wanted.filter((s) => s !== sheet).map((s) => s.name);
    if (!headers.includes("product_id")) out.missingSheets = wanted.map((s) => s.name);
    else if (!wanted.includes(sheet)) skipSheet(sheet);
    else addRows(sheet, rows[0], rows.slice(1), (i) => i + 2);
    return out;
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const readSheet = (ws) => {
    const headers = [];
    ws.getRow(1).eachCell((cell, col) => {
      headers[col - 1] = String(cellText(cell.value));
    });
    for (let i = 0; i < headers.length; i += 1) if (headers[i] === undefined) headers[i] = "";
    const dataRows = [];
    const rowNumbers = [];
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const cells = [];
      for (let c = 1; c <= headers.length; c += 1) cells.push(cellText(row.getCell(c).value));
      dataRows.push(cells);
      rowNumbers.push(rowNumber);
    });
    return { headers, dataRows, rowNumberOf: (i) => rowNumbers[i] };
  };
  // Sheet names are matched loosely ("variant prices", "Variant Prices ").
  const findSheet = (sheet) =>
    workbook.getWorksheet(sheet.name) ||
    workbook.worksheets.find((w) => normalizeHeader(w.name) === normalizeHeader(sheet.name));

  SHEETS.forEach((sheet) => {
    const ws = findSheet(sheet);
    if (!wanted.includes(sheet)) {
      // e.g. the descriptions sheet of an old combined workbook during a pricing import.
      if (ws) skipSheet(sheet);
      return;
    }
    if (!ws) {
      out.missingSheets.push(sheet.name);
      return;
    }
    const { headers, dataRows, rowNumberOf } = readSheet(ws);
    addRows(sheet, headers, dataRows, rowNumberOf);
  });

  // No wanted sheet name found (e.g. a CSV re-saved as Excel, "Sheet1"): use any
  // other sheet whose header row has product_id, deciding by whether it has variant_id.
  if (out.missingSheets.length === wanted.length) {
    const named = SHEETS.map(findSheet).filter(Boolean);
    workbook.worksheets.forEach((ws) => {
      if (named.includes(ws)) return;
      const { headers, dataRows, rowNumberOf } = readSheet(ws);
      const keys = headers.map(normalizeHeader);
      if (!keys.includes("product_id")) return;
      const sheet = keys.includes("variant_id") ? SHEETS[0] : SHEETS[1];
      if (!wanted.includes(sheet)) {
        skipSheet(sheet);
        return;
      }
      out.missingSheets = out.missingSheets.filter((n) => n !== sheet.name);
      addRows(sheet, headers, dataRows, rowNumberOf);
    });
  }

  // A combined import without the "Variant Prices" sheet cannot change any price.
  if (!part && out.missingSheets.includes(SHEETS[0].name) && !out.missingSheets.includes(SHEETS[1].name)) {
    const names = workbook.worksheets.map((w) => `"${w.name}"`).join(", ");
    out.warnings.push(
      `No "Variant Prices" sheet was found (sheets in this file: ${names}), so no prices were read. Keep the sheet names from the export.`
    );
  }
  return out;
}
