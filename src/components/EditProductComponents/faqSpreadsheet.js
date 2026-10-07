/**
 * Product FAQ spreadsheet (.xlsx / .csv) builder and reader.
 *
 * Export writes a `FAQs` sheet (question, answer, status) plus a plain-English
 * `Instructions` sheet. Import reads the same three columns back and sorts
 * every row into new / duplicate / invalid / template, so the component only
 * has to POST the rows returned in `toAdd`.
 */
import ExcelJS from "exceljs";

import { csvToRows } from "../../pages/adminpages/productsNew/service/productCsvSchema";

const DATA_SHEET = "FAQs";
const INSTRUCTIONS_SHEET = "Instructions";

export const FAQ_COLUMNS = ["question", "answer", "status"];
export const FAQ_STATUSES = ["Published", "Draft"];
const DEFAULT_STATUS = "Published";

/** A question starting with this marks a template row — exported as an example, never imported. */
export const SAMPLE_PREFIX = "SAMPLE — ";

/**
 * Spreadsheet apps and non-UTF-8 CSV saves swap the em dash for a hyphen, an
 * en dash or a replacement character, so any dash after an upper-case SAMPLE
 * counts. Upper-case only, so a real "Sample-size…" question still imports.
 */
const SAMPLE_PATTERN = /^SAMPLE\s*[—–\-�]/;

const SAMPLE_ROW = {
  question: `${SAMPLE_PREFIX}How long does delivery take?`,
  answer:
    "Example only — this row is ignored on import. Replace it with your own question and answer, or delete it.",
  status: DEFAULT_STATUS,
};

/** Rows that get the status dropdown, beyond the ones already filled in. */
const VALIDATED_ROWS = 500;

const COLUMN_WIDTH = { question: 50, answer: 80, status: 14 };

const SLATE = "FF33415A";
const AMBER = "FFB45309";
const GREY_TEXT = "FF8A94A6";

const text = (value) =>
  value === null || value === undefined ? "" : String(value).trim();

/** Published / Draft in any case; anything else (or blank) falls back to Published. */
export function normaliseStatus(value) {
  const wanted = text(value).toLowerCase();
  return FAQ_STATUSES.find((s) => s.toLowerCase() === wanted) || DEFAULT_STATUS;
}

/** Duplicate questions are compared trimmed and case-insensitively. */
const questionKey = (question) => text(question).toLowerCase();

/* ------------------------------------------------------------------ */
/* Export                                                               */
/* ------------------------------------------------------------------ */

function buildInstructionsSheet(workbook) {
  const sheet = workbook.addWorksheet(INSTRUCTIONS_SHEET, {
    properties: { tabColor: { argb: AMBER } },
  });
  sheet.getColumn(1).width = 110;

  const title = sheet.addRow(["How to add FAQs with this file"]);
  title.font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
  title.height = 26;
  title.alignment = { vertical: "middle" };
  title.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: SLATE } };

  [
    `Fill the ${DATA_SHEET} sheet with one row per FAQ, save the file, then use "Import FAQs" on the product's FAQs tab.`,
    "Keep the header row (question, answer, status) exactly as it is.",
    "question and answer are required. A row missing either one is reported as invalid and is not imported.",
    "status is Published or Draft — pick it from the dropdown. Leave it blank and the FAQ is imported as Published.",
    "Rows whose question already exists on the product are skipped on import. Capital letters and spaces around the text are ignored when comparing, and a question repeated inside this file is only added once.",
    `Rows whose question starts with "${SAMPLE_PREFIX.trim()}" are examples and are always ignored.`,
    "Import only adds new FAQs, after the existing ones and in the order of this file. It never changes or deletes an existing FAQ — do that on the FAQs tab.",
    "You are shown a summary to confirm before anything is added.",
  ].forEach((line) => {
    sheet.addRow([`•  ${line}`]).alignment = { vertical: "top", wrapText: true };
  });

  return sheet;
}

/** Build the .xlsx workbook for a product's FAQs, in the order given. */
export async function buildFaqWorkbook(faqs = []) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "eShop Admin";
  workbook.created = new Date();

  const sheet = workbook.addWorksheet(DATA_SHEET, {
    views: [{ state: "frozen", ySplit: 1 }],
    properties: { tabColor: { argb: SLATE } },
  });

  const wrapped = { vertical: "top", wrapText: true };

  /* ---------------- header ---------------- */
  sheet.columns = FAQ_COLUMNS.map((key) => ({
    header: key,
    key,
    width: COLUMN_WIDTH[key],
    // Column-level, so rows typed in later wrap as well.
    style: { alignment: wrapped },
  }));

  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.alignment = { vertical: "middle" };
  headerRow.height = 22;
  FAQ_COLUMNS.forEach((_, idx) => {
    headerRow.getCell(idx + 1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: SLATE },
    };
  });

  /* ---------------- data ---------------- */
  const isTemplate = faqs.length === 0;
  const rows = isTemplate
    ? [SAMPLE_ROW]
    : faqs.map((faq) => ({
        question: text(faq.question),
        answer: text(faq.answer),
        status: normaliseStatus(faq.status),
      }));

  rows.forEach((row) => {
    sheet.addRow(row).alignment = wrapped;
  });

  // Grey out the example so it reads as documentation, not data.
  if (isTemplate) sheet.getRow(2).font = { italic: true, color: { argb: GREY_TEXT } };

  /* ---------------- status dropdown ---------------- */
  const statusLetter = sheet.getColumn("status").letter;
  const lastRow = rows.length + VALIDATED_ROWS + 1;
  for (let r = 2; r <= lastRow; r += 1) {
    sheet.getCell(`${statusLetter}${r}`).dataValidation = {
      type: "list",
      allowBlank: true,
      formulae: [`"${FAQ_STATUSES.join(",")}"`],
      showErrorMessage: true,
      errorStyle: "warning",
      errorTitle: "Not a known status",
      error: `Use ${FAQ_STATUSES.join(" or ")}, or leave the cell blank for ${DEFAULT_STATUS}.`,
    };
  }

  buildInstructionsSheet(workbook);

  return workbook;
}

/** `faqs-<slug or id>-YYYY-MM-DD.xlsx`, dated in the user's own timezone. */
export function faqExportFilename(slugOrId) {
  const name =
    text(slugOrId)
      .replace(/[\\/:*?"<>|\s]+/g, "-")
      .replace(/^-+|-+$/g, "") || "product";
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const stamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return `faqs-${name}-${stamp}.xlsx`;
}

/* ------------------------------------------------------------------ */
/* Import                                                               */
/* ------------------------------------------------------------------ */

/** Excel hands back objects for formulas, hyperlinks and rich text. */
function cellText(raw) {
  if (raw === null || raw === undefined) return "";
  if (raw instanceof Date) return raw.toISOString();
  if (typeof raw === "object") {
    if ("richText" in raw) return text((raw.richText || []).map((t) => t.text).join(""));
    if ("text" in raw) return cellText(raw.text);
    if ("result" in raw) return cellText(raw.result);
    return "";
  }
  return text(raw);
}

/** Keep only the FAQ columns, plus the spreadsheet row the values came from. */
const toFaqRow = (source, rowNumber) => ({
  rowNumber,
  question: text(source.question),
  answer: text(source.answer),
  status: text(source.status),
});

/**
 * Read a .xlsx into `{ headers, rows }` — lower-cased headers, and rows of
 * `{ rowNumber, question, answer, status }` text values.
 */
export async function readFaqWorkbook(arrayBuffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(arrayBuffer);

  const sheet = workbook.getWorksheet(DATA_SHEET) || workbook.worksheets[0];
  if (!sheet) return { headers: [], rows: [] };

  const headers = [];
  sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, col) => {
    headers[col - 1] = cellText(cell.value).toLowerCase();
  });

  const rows = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj = {};
    headers.forEach((h, idx) => {
      if (h) obj[h] = cellText(row.getCell(idx + 1).value);
    });
    rows.push(toFaqRow(obj, rowNumber));
  });

  return { headers: headers.filter(Boolean), rows };
}

/** Same shape as readFaqWorkbook, from CSV text. */
export function readFaqCsv(csvText) {
  const { headers, rows } = csvToRows(csvText);
  // csvToRows drops blank lines, so numbers count non-blank rows (header = row 1).
  return { headers, rows: rows.map((row, idx) => toFaqRow(row, idx + 2)) };
}

/**
 * Decide what an import would do, without writing anything.
 *
 * @param rows          rows from readFaqWorkbook / readFaqCsv
 * @param existingFaqs  FAQs already on the product (only `question` is read)
 * @returns `toAdd` ({ rowNumber, question, answer, status }, in file order),
 *          `invalid` ({ rowNumber, reason }), and counts of `duplicates`
 *          (already on the product, or repeated earlier in the file) and
 *          `samples` (template rows).
 */
export function planFaqImport(rows = [], existingFaqs = []) {
  const seen = new Set(existingFaqs.map((faq) => questionKey(faq?.question)).filter(Boolean));
  const plan = { toAdd: [], invalid: [], duplicates: 0, samples: 0 };

  rows.forEach(({ rowNumber, question, answer, status }) => {
    if (!question && !answer && !status) return; // fully blank row

    if (SAMPLE_PATTERN.test(question)) {
      plan.samples += 1;
      return;
    }

    if (!question || !answer) {
      const missing = [!question && "question", !answer && "answer"].filter(Boolean);
      plan.invalid.push({ rowNumber, reason: `Missing ${missing.join(" and ")}` });
      return;
    }

    const key = questionKey(question);
    if (seen.has(key)) {
      plan.duplicates += 1;
      return;
    }
    seen.add(key);

    plan.toAdd.push({ rowNumber, question, answer, status: normaliseStatus(status) });
  });

  return plan;
}
