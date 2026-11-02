/**
 * Excel file for the "Prices & Content" export / import.
 *
 * Two editable sheets:
 *   - "Variant Prices": one row per variant (SKU, EAN, MPN, cost, price, sale price,
 *     quantity, active). Each variant keeps its own price.
 *   - "Descriptions & Perks": one row per product (summary, description, perks).
 * The id columns tie each row to the exact product / variant it came from, so they
 * must not be edited. Blank cells keep what is stored.
 */
import ExcelJS from "exceljs";

export const NOT_EDITABLE_DESCRIPTION = "(edit this description in the product form)";

const VARIANT_COLUMNS = [
  { header: "product_id", key: "productId", width: 26, locked: true },
  { header: "variant_id", key: "variantId", width: 26, locked: true },
  { header: "product_name", key: "productName", width: 40, locked: true },
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

export async function buildPricesContentWorkbook({ variants = [], content = [] }) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Admin panel";
  workbook.created = new Date();

  const info = workbook.addWorksheet("How to use");
  info.getColumn(1).width = 110;
  [
    "PRICES & CONTENT SHEET",
    "",
    "1. Edit the white cells on the 'Variant Prices' and 'Descriptions & Perks' sheets.",
    "   Every variant has its own row, so each variant keeps its own price.",
    "2. Do not change the grey columns (product_id, variant_id, names). They tell the system which product/variant a row belongs to.",
    "3. A blank cell means 'keep what is saved'. To change a value, type the new one.",
    "4. Prices: numbers only (e.g. 249.99). active / perks_enabled: Yes or No.",
    "5. Descriptions and perks are HTML, e.g. <p>Text</p>. Keep the tags if you copy text in.",
    `6. A description showing "${NOT_EDITABLE_DESCRIPTION}" has several parts — change it in the product form.`,
    "7. You can delete rows you are not changing. Rows cannot add or remove variants.",
    "8. Import the file from the products page (Prices & Content > Import). You will see every change before it is saved.",
  ].forEach((line, i) => {
    const cell = info.getCell(i + 1, 1);
    cell.value = line;
    if (i === 0) cell.font = { bold: true, size: 14 };
  });

  addSheet(workbook, SHEETS[0], variants);
  addSheet(
    workbook,
    SHEETS[1],
    content.map((r) => ({
      ...r,
      description: r.descriptionEditable === false ? NOT_EDITABLE_DESCRIPTION : r.description,
    }))
  );
  return workbook;
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

/**
 * Read an edited workbook back into { variants, content } rows for the API.
 * Columns are found by header name, so reordering columns is fine.
 * Each row carries its spreadsheet row number for error messages.
 */
export async function readPricesContentWorkbook(file) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await file.arrayBuffer());
  const out = { variants: [], content: [], missingSheets: [] };

  SHEETS.forEach(({ name, columns, dataKey }) => {
    const ws = workbook.getWorksheet(name);
    if (!ws) {
      out.missingSheets.push(name);
      return;
    }
    const headerIndex = {};
    ws.getRow(1).eachCell((cell, col) => {
      const h = String(cellText(cell.value)).trim().toLowerCase();
      if (h) headerIndex[h] = col;
    });
    ws.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const record = { row: rowNumber };
      let hasId = false;
      columns.forEach((c) => {
        const col = headerIndex[c.header];
        if (!col) return;
        let v = cellText(row.getCell(col).value);
        if (typeof v === "string") v = v.trim();
        if (c.key === "description" && v === NOT_EDITABLE_DESCRIPTION) v = "";
        record[c.key] = v;
        if (c.key === "productId" && v) hasId = true;
      });
      if (hasId) out[dataKey].push(record);
    });
  });
  return out;
}
