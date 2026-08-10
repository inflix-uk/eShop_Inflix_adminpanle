import { useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

import ProductApi from "../../api/productApi";
import {
  csvToRows,
  rowsToProducts,
} from "../../service/productCsvSchema";
import {
  buildProductWorkbook,
  readProductWorkbook,
} from "../../service/productWorkbook";

/**
 * Export / Import toolbar for the products list.
 *
 * Export always ships four template rows at the top — one variant product with
 * three variants and one single product — so the file documents its own format.
 * Those rows use a `sample-` producturl, which the importer skips.
 */
export default function ImportExportBar({ products, onImported, compact }) {
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState(null);
  const productApi = useMemo(() => new ProductApi(), []);

  const download = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stamp = () => new Date().toISOString().slice(0, 10);

  const exportedCount = () =>
    products.length
      ? `Exported ${products.length} products (plus 4 template rows)`
      : "Exported the template — open a brand first to include your products";

  /**
   * The products list endpoint returns trimmed rows: variant products arrive
   * WITHOUT their `variantValues`, and detail fields (summary, specs, gallery,
   * SEO meta) are omitted to keep the table light. Flattening those directly
   * would export every variant product as a single blank-priced row and lose
   * all product detail. Pull each product's full record first so the export is
   * lossless. Runs bounded-concurrency and falls back to the trimmed row on
   * any failure rather than dropping the product.
   */
  const loadFullProducts = async (list) => {
    const items = Array.isArray(list) ? list : [];
    if (items.length === 0) return [];

    const CONCURRENCY = 6;
    const out = new Array(items.length);
    let cursor = 0;

    const worker = async () => {
      while (cursor < items.length) {
        const idx = cursor;
        cursor += 1;
        const listProduct = items[idx];
        const id = listProduct?._id;
        if (!id) {
          out[idx] = listProduct;
          continue;
        }
        try {
          const { data } = await productApi.getProduct(id);
          out[idx] =
            data?.status === 201 && data.product ? data.product : listProduct;
        } catch (error) {
          console.warn(
            `Export: full detail unavailable for ${listProduct?.producturl || id}`,
            error
          );
          out[idx] = listProduct; // keep the row instead of losing the product
        }
      }
    };

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, items.length) }, worker)
    );
    return out;
  };

  /** Excel export with dropdowns on every list-backed field. */
  const handleExportExcel = async () => {
    setBusy(true);
    try {
      // Dropdown options are pulled live so they always match the product form.
      let reference = null;
      try {
        const { data } = await productApi.getCsvReferenceData();
        if (data?.status === 200) reference = data.reference;
      } catch (refError) {
        console.warn("Reference data unavailable — exporting without dropdowns", refError);
      }

      // Enrich the trimmed list rows into full product records so variant
      // pricing/SKUs and product detail actually make it into the file.
      const fullProducts = await loadFullProducts(products);

      const workbook = await buildProductWorkbook({ products: fullProducts, reference });
      const buffer = await workbook.xlsx.writeBuffer();
      download(
        new Blob([buffer], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `products-${stamp()}.xlsx`
      );

      toast.success(
        reference
          ? `${exportedCount()} — with dropdowns`
          : `${exportedCount()} — dropdowns unavailable, values are free text`
      );
    } catch (error) {
      console.error("Excel export failed:", error);
      toast.error("Could not build the Excel file");
    } finally {
      setBusy(false);
    }
  };

  const handleFilePicked = async (event) => {
    const file = event.target.files?.[0];
    // Reset immediately so picking the same file twice still fires onChange.
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setReport(null);

    try {
      const isExcel = /\.xlsx?$/i.test(file.name);
      const { headers, rows } = isExcel
        ? await readProductWorkbook(await file.arrayBuffer())
        : csvToRows(await file.text());

      if (rows.length === 0) {
        toast.error("That file has no data rows");
        return;
      }
      if (!headers.includes("producturl")) {
        toast.error("Missing the 'producturl' column — export a file first to get the right headers");
        return;
      }

      const { products: parsed, errors, skippedSamples } = rowsToProducts(rows);

      if (parsed.length === 0) {
        toast.error(
          skippedSamples > 0
            ? "Only template rows found — replace them with your own products"
            : "No importable products found in that file"
        );
        setReport({ errors, skippedSamples, results: null });
        return;
      }

      // Server-side dry run first: rows are validated against the live
      // reference data (categories, tags, brands, attribute values) and
      // nothing is written, so the confirm dialog shows real outcomes.
      const { data: preview } = await productApi.importProducts(parsed, {
        updateExisting: true,
        dryRun: true,
      });

      if (preview.status !== 201 || !preview.results) {
        toast.error(preview.message || "Could not validate the file");
        return;
      }

      const failedRows = (preview.details || []).filter((d) => d.action === "failed");
      const importable = preview.results.created + preview.results.updated;

      if (importable === 0) {
        toast.error("No rows passed validation — see the report for details");
        setReport({ preview: true, errors, skippedSamples, results: preview.results, details: preview.details });
        return;
      }

      const confirmed = window.confirm(
        `Import preview for "${file.name}":\n\n` +
          `• ${preview.results.created} new product(s) will be created\n` +
          `• ${preview.results.updated} existing product(s) will be updated ` +
          `(matched by producturl — blank cells keep the stored values)\n` +
          (failedRows.length
            ? `• ${failedRows.length} row(s) failed validation and will be skipped\n`
            : "") +
          (errors.length ? `• ${errors.length} row warning(s) from the file\n` : "") +
          `\nProceed with the import?`
      );
      if (!confirmed) {
        // Leave the preview on screen so failed rows can be inspected.
        setReport({ preview: true, errors, skippedSamples, results: preview.results, details: preview.details });
        return;
      }

      const { data: response } = await productApi.importProducts(parsed, {
        updateExisting: true,
      });

      if (response.status === 201) {
        toast.success(response.message);
        setReport({ errors, skippedSamples, results: response.results, details: response.details });
        onImported?.();
      } else {
        toast.error(response.message || "Import failed");
        setReport({ errors, skippedSamples, results: response.results, details: response.details });
      }
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Could not read that file — is it a valid CSV?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={compact ? "relative" : "mb-3"}>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleExportExcel}
          disabled={busy}
          title="Excel file with an Instructions sheet plus dropdowns for brand, category, condition, tags and variant attributes"
          className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
          </svg>
          {busy ? "Building…" : "Export Excel"}
        </button>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
              d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5 5 5M12 4v12" />
          </svg>
          {busy ? "Importing…" : "Import"}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          onChange={handleFilePicked}
          className="hidden"
        />

        {!compact && (
          <span className="text-xs text-gray-500">
            Excel export ships three sheets: Products (with dropdowns for brand, category,
            condition, tags and variant attributes), Reference (the allowed values) and
            Instructions (how to fill the file). Both .xlsx and .csv import; template rows are skipped.
          </span>
        )}
      </div>

      {report && (
        <div
          className={
            compact
              ? "absolute right-0 top-full z-20 mt-2 w-96 rounded-md border border-gray-200 bg-white p-3 text-sm shadow-lg"
              : "mt-3 rounded-md border border-gray-200 bg-gray-50 p-3 text-sm"
          }
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-800">
              {report.preview ? "Import preview (nothing was written)" : "Import report"}
            </span>
            <button
              type="button"
              onClick={() => setReport(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>

          {report.results && (
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-gray-700">
              <span>Created: <b>{report.results.created}</b></span>
              <span>Updated: <b>{report.results.updated}</b></span>
              <span>Skipped: <b>{report.results.skipped}</b></span>
              <span className={report.results.failed ? "text-red-600" : ""}>
                Failed: <b>{report.results.failed}</b>
              </span>
            </div>
          )}

          {report.skippedSamples > 0 && (
            <p className="mt-2 text-gray-600">
              Ignored {report.skippedSamples} template row{report.skippedSamples === 1 ? "" : "s"}.
            </p>
          )}

          {report.errors?.length > 0 && (
            <div className="mt-2">
              <p className="text-amber-700 font-medium">
                {report.errors.length} row warning{report.errors.length === 1 ? "" : "s"}:
              </p>
              <ul className="mt-1 max-h-40 overflow-y-auto list-disc pl-5 text-gray-600">
                {report.errors.slice(0, 50).map((e, i) => (
                  <li key={i}>Row {e.line}: {e.message}</li>
                ))}
              </ul>
            </div>
          )}

          {report.details?.some((d) => d.action === "failed") && (
            <div className="mt-2">
              <p className="text-red-600 font-medium">Failed rows:</p>
              <ul className="mt-1 max-h-40 overflow-y-auto list-disc pl-5 text-gray-600">
                {report.details
                  .filter((d) => d.action === "failed")
                  .map((d, i) => (
                    <li key={i}>{d.producturl}: {d.message}</li>
                  ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

ImportExportBar.propTypes = {
  products: PropTypes.array,
  onImported: PropTypes.func,
  /** Inline placement (e.g. beside the brand stats): drops the helper text and floats the report. */
  compact: PropTypes.bool,
};

ImportExportBar.defaultProps = {
  products: [],
  onImported: undefined,
  compact: false,
};
