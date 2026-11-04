import { useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

import ProductApi from "../../api/productApi";
import {
  buildPricesContentWorkbook,
  readPricesContentWorkbook,
} from "../../service/pricesContentWorkbook";

/**
 * "Prices & Content" export / import.
 * Export: an Excel file with one row per variant (own price, sale price, SKU, EAN, MPN,
 * cost, quantity) and one row per product (summary, description, perks).
 * Import: shows every change first; nothing is saved until "Apply" is pressed.
 */
export default function PricesContentSheetBar({ productIds = [], label = "Prices & Content", onImported }) {
  const productApi = useMemo(() => new ProductApi(), []);
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [preview, setPreview] = useState(null); // { payload, result, fileName }

  const ids = productIds.filter(Boolean);

  const handleExport = async () => {
    setMenuOpen(false);
    setBusy(true);
    try {
      const { data } = await productApi.getPricesContentSheet(ids);
      if (data?.status !== 200) throw new Error(data?.message || "Export failed");
      const workbook = await buildPricesContentWorkbook(data);
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `prices-content-${ids.length === 1 ? "product" : `${data.products}-products`}-${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${data.products} products, ${data.variants.length} variants`);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || error.message || "Export failed");
    } finally {
      setBusy(false);
    }
  };

  const handleFilePicked = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    try {
      const parsed = await readPricesContentWorkbook(file);
      if (parsed.missingSheets.length === 2) {
        throw new Error(
          'This is not a Prices & Content file: no "Variant Prices" or "Descriptions & Perks" sheet, and no product_id column in the first row'
        );
      }
      if (parsed.variants.length === 0 && parsed.content.length === 0) {
        throw new Error(parsed.warnings[0] || "No rows with a product_id were found in this file");
      }
      const payload = { variants: parsed.variants, content: parsed.content };
      const { data } = await productApi.importPricesContentSheet({ ...payload, dryRun: true });
      if (data?.status !== 200) throw new Error(data?.message || "Could not read the file");
      setPreview({
        payload,
        result: data,
        fileName: file.name,
        warnings: parsed.warnings,
        rowsRead: parsed.variants.length + parsed.content.length,
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

  return (
    <div className="relative">
      <button
        type="button"
        disabled={busy}
        onClick={() => setMenuOpen((o) => !o)}
        title="Excel file with each variant's own price, SKU, EAN and MPN, plus product descriptions and perks"
        className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
      >
        {busy ? "Working…" : label}
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {menuOpen && (
        <div className="absolute right-0 z-30 mt-1 w-72 rounded-md border border-gray-200 bg-white py-1 text-sm shadow-lg">
          <button type="button" onClick={handleExport} className="block w-full px-4 py-2 text-left hover:bg-gray-50">
            <span className="font-medium text-gray-800">Export</span>
            <span className="block text-xs text-gray-500">
              {ids.length === 0
                ? "All products"
                : ids.length === 1
                  ? "This product"
                  : `These ${ids.length} products`}
              : variant prices, SKU, EAN, MPN, descriptions, perks
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              fileInputRef.current?.click();
            }}
            className="block w-full px-4 py-2 text-left hover:bg-gray-50"
          >
            <span className="font-medium text-gray-800">Import</span>
            <span className="block text-xs text-gray-500">
              Upload the edited file (.xlsx, or a .csv of one sheet). You will see the changes before saving.
            </span>
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
              <h3 className="text-lg font-semibold text-gray-900">Check the changes before saving</h3>
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
