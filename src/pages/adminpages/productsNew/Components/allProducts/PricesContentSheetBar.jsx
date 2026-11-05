import { useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

import ProductApi from "../../api/productApi";
import {
  PARTS,
  buildPricesContentCsv,
  buildPricesContentWorkbook,
  readPricesContentWorkbook,
} from "../../service/pricesContentWorkbook";

const XLSX_TYPE = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

/** What each half holds, shown under its heading in the menu. */
const PART_HELP = {
  prices: "Variant name, SKU, EAN, MPN, cost, price, sale price, quantity, active — one row per variant. No descriptions.",
  content: "Summary, description and perks — one row per product. No prices.",
};

function download(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * "Prices & Content" export / import, split into two independent files so each
 * stays small:
 *   - Product Details & Pricing: one row per variant (price, sale price, SKU,
 *     EAN, MPN, cost, quantity, active).
 *   - Descriptions & Perks: one row per product (summary, description, perks).
 * Each has its own Export (.xlsx or .csv) and Import. A pricing import never
 * sends description rows and vice versa. The old combined workbook can still be
 * imported in one go. Import shows every change first; nothing is saved until
 * "Apply" is pressed.
 */
export default function PricesContentSheetBar({ productIds = [], label = "Prices & Content", onImported }) {
  const productApi = useMemo(() => new ProductApi(), []);
  const fileInputRef = useRef(null);
  const importPartRef = useRef(null); // "prices" | "content" | null (combined)
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [preview, setPreview] = useState(null); // { payload, result, fileName, part }

  const ids = productIds.filter(Boolean);
  const scope =
    ids.length === 0 ? "All products" : ids.length === 1 ? "This product" : `These ${ids.length} products`;

  const handleExport = async (part, format) => {
    setMenuOpen(false);
    setBusy(true);
    try {
      const { data } = await productApi.getPricesContentSheet(ids, part);
      if (data?.status !== 200) throw new Error(data?.message || "Export failed");
      const { fileSlug, title } = PARTS[part];
      const name = `${fileSlug}-${ids.length === 1 ? "product" : `${data.products}-products`}-${new Date()
        .toISOString()
        .slice(0, 10)}.${format}`;
      if (format === "csv") {
        download(new Blob([buildPricesContentCsv(data, part)], { type: "text/csv;charset=utf-8" }), name);
      } else {
        const workbook = await buildPricesContentWorkbook(data, part);
        download(new Blob([await workbook.xlsx.writeBuffer()], { type: XLSX_TYPE }), name);
      }
      toast.success(
        part === "prices"
          ? `${title}: exported ${data.variants.length} variants of ${data.products} products`
          : `${title}: exported ${data.content.length} products`
      );
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || error.message || "Export failed");
    } finally {
      setBusy(false);
    }
  };

  const startImport = (part) => {
    setMenuOpen(false);
    importPartRef.current = part;
    fileInputRef.current?.click();
  };

  const handleFilePicked = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const part = importPartRef.current;
    const title = PARTS[part]?.title || "Prices & Content";
    setBusy(true);
    try {
      const parsed = await readPricesContentWorkbook(file, part || undefined);
      const rows = part === "prices" ? parsed.variants : part === "content" ? parsed.content : [...parsed.variants, ...parsed.content];
      if (rows.length === 0) {
        if (parsed.otherPart && PARTS[parsed.otherPart]) {
          const other = PARTS[parsed.otherPart].title;
          throw new Error(`This is a ${other} file. Import it with Prices & Content > ${other} > Import.`);
        }
        if (parsed.missingSheets.length > 0 && parsed.warnings.length === 0) {
          throw new Error(
            part
              ? `This is not a ${title} file: no "${PARTS[part].sheet.name}" sheet and no product_id column in the first row`
              : 'This is not a Prices & Content file: no "Variant Prices" or "Descriptions & Perks" sheet, and no product_id column in the first row'
          );
        }
        throw new Error(parsed.warnings[0] || "No rows with a product_id were found in this file");
      }
      const warnings = [...parsed.warnings];
      if (part && parsed.ignoredSheets.length > 0) {
        const other = PARTS[part === "prices" ? "content" : "prices"].title;
        warnings.push(
          `Only ${title.toLowerCase()} are imported from this file. The "${parsed.ignoredSheets.join('", "')}" sheet was left untouched — import it with ${other} > Import if you changed it.`
        );
      }
      // Each import sends only its own half, so a pricing file can never change a
      // description and a descriptions file can never change a price.
      const payload = {
        variants: part === "content" ? [] : parsed.variants,
        content: part === "prices" ? [] : parsed.content,
      };
      const { data } = await productApi.importPricesContentSheet({ ...payload, dryRun: true });
      if (data?.status !== 200) throw new Error(data?.message || "Could not read the file");
      setPreview({
        payload,
        result: data,
        fileName: file.name,
        title,
        warnings,
        rowsRead: payload.variants.length + payload.content.length,
      });
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || error.message || "Import failed");
    } finally {
      setBusy(false);
    }
  };

  const handleApply = async () => {
    if (!preview) return;
    setBusy(true);
    try {
      const { data } = await productApi.importPricesContentSheet({ ...preview.payload, dryRun: false });
      if (data?.status !== 200) throw new Error(data?.message || "Import failed");
      toast.success(`Saved ${data.changeCount} changes on ${data.productsChanged} products`);
      setPreview(null);
      onImported?.();
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || error.message || "Import failed");
    } finally {
      setBusy(false);
    }
  };

  const fmt = (v) => (v === null || v === undefined || v === "" ? "—" : String(v));
  const result = preview?.result;
  const smallBtn =
    "rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-100";

  return (
    <div className="relative">
      <button
        type="button"
        disabled={busy}
        onClick={() => setMenuOpen((o) => !o)}
        title="Two separate files: Product Details & Pricing (per-variant prices, SKU, EAN, MPN) and Descriptions & Perks"
        className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
      >
        {busy ? "Working…" : label}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute right-0 z-30 mt-1 w-80 rounded-md border border-gray-200 bg-white text-sm shadow-lg">
          <p className="border-b px-4 py-2 text-xs text-gray-500">
            {scope}. Two separate files — each one only changes its own fields.
          </p>
          {Object.values(PARTS).map((part) => (
            <div key={part.key} className="border-b px-4 py-3">
              <p className="font-medium text-gray-800">{part.title}</p>
              <p className="mt-0.5 text-xs text-gray-500">{PART_HELP[part.key]}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button type="button" className={smallBtn} onClick={() => handleExport(part.key, "xlsx")}>
                  Export .xlsx
                </button>
                <button
                  type="button"
                  className={smallBtn}
                  title="Plain CSV: small and easy to paste into ChatGPT or Google Sheets"
                  onClick={() => handleExport(part.key, "csv")}
                >
                  Export .csv
                </button>
                <button
                  type="button"
                  className="rounded bg-primary px-2 py-1 text-xs font-medium text-white hover:bg-primary/90"
                  onClick={() => startImport(part.key)}
                >
                  Import
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => startImport(null)}
            className="block w-full px-4 py-2 text-left text-xs text-gray-500 hover:bg-gray-50"
          >
            Import an older combined file (both sheets at once)
          </button>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFilePicked}
        className="hidden"
      />

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-lg bg-white shadow-xl">
            <div className="border-b px-5 py-4">
              <h3 className="text-lg font-semibold text-gray-900">{preview.title}: check the changes before saving</h3>
              <p className="text-sm text-gray-500">
                {preview.fileName}: {result.changeCount} change{result.changeCount === 1 ? "" : "s"} on{" "}
                {result.productsChanged} product{result.productsChanged === 1 ? "" : "s"}
                {result.errors.length > 0 && `, ${result.errors.length} row${result.errors.length === 1 ? "" : "s"} skipped`}
                {` (${preview.rowsRead} row${preview.rowsRead === 1 ? "" : "s"} read)`}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-3 text-sm">
              {preview.warnings?.length > 0 && (
                <div className="mb-3 rounded-md bg-amber-50 p-3 text-amber-900">
                  {preview.warnings.map((w, i) => (
                    <p key={i}>{w}</p>
                  ))}
                </div>
              )}
              {result.warningCount > 0 && (
                <div className="mb-3 rounded-md bg-orange-50 p-3">
                  <p className="font-medium text-orange-800">
                    Please check {result.warningCount} row{result.warningCount === 1 ? "" : "s"} (they will still be saved):
                  </p>
                  <ul className="mt-1 list-disc pl-5 text-orange-900">
                    {(result.warnings || []).slice(0, 50).map((w, i) => (
                      <li key={i}>
                        {w.sheet}, row {w.row}: {w.message}
                      </li>
                    ))}
                  </ul>
                  {result.warningCount > 50 && <p className="mt-1 text-xs">…and {result.warningCount - 50} more.</p>}
                </div>
              )}
              {result.errors.length > 0 && (
                <div className="mb-3 rounded-md bg-amber-50 p-3">
                  <p className="font-medium text-amber-800">These rows will be skipped:</p>
                  <ul className="mt-1 list-disc pl-5 text-amber-900">
                    {result.errors.slice(0, 100).map((e, i) => (
                      <li key={i}>
                        {e.sheet}, row {e.row}: {e.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.changeCount === 0 ? (
                <p className="text-gray-600">
                  {result.errors.length > 0
                    ? "Nothing can be saved — every row above was skipped."
                    : "Nothing to change — every value in the file is the same as what is saved."}
                </p>
              ) : (
                <table className="w-full text-left">
                  <thead className="text-xs uppercase text-gray-500">
                    <tr>
                      <th className="py-1 pr-2">Product</th>
                      <th className="py-1 pr-2">Variant</th>
                      <th className="py-1 pr-2">Field</th>
                      <th className="py-1 pr-2">Now</th>
                      <th className="py-1">New</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {result.changes.map((c, i) => (
                      <tr key={i}>
                        <td className="py-1 pr-2">{c.product}</td>
                        <td className="py-1 pr-2 text-gray-600">{c.variant || "—"}</td>
                        <td className="py-1 pr-2">{c.field}</td>
                        <td className="py-1 pr-2 text-gray-500">{fmt(c.from)}</td>
                        <td className="py-1 font-medium">{fmt(c.to)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {result.changeCount > result.changes.length && (
                <p className="mt-2 text-xs text-gray-500">Showing the first {result.changes.length} changes.</p>
              )}
            </div>
            <div className="flex justify-end gap-2 border-t px-5 py-3">
              <button
                type="button"
                onClick={() => setPreview(null)}
                disabled={busy}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                disabled={busy || result.changeCount === 0}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 disabled:opacity-50"
              >
                {busy ? "Saving…" : `Apply ${result.changeCount} change${result.changeCount === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

PricesContentSheetBar.propTypes = {
  /** Products to export; empty exports every product. */
  productIds: PropTypes.arrayOf(PropTypes.string),
  label: PropTypes.string,
  onImported: PropTypes.func,
};
