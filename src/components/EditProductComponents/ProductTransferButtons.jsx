import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";

// Brings the Excel library with it (about 1 MB): loaded on click, not with
// every Edit Product page.
const loadTransfer = () =>
  import("../../pages/adminpages/productsNew/service/singleProductTransfer");

/**
 * Export / import for the product being edited. Uses the same Excel format as
 * the bulk buttons on the products list, limited to this one product.
 */
export default function ProductTransferButtons({ product, productApi, onImported }) {
  const fileInputRef = useRef(null);
  const [busy, setBusy] = useState(null); // null | 'export' | 'import'

  const producturl = product?.producturl || "";

  const handleExport = async () => {
    setBusy("export");
    try {
      const { exportSingleProduct } = await loadTransfer();
      const { withDropdowns } = await exportSingleProduct(productApi, product._id);
      toast.success(
        withDropdowns
          ? "Product exported"
          : "Product exported — dropdowns unavailable, values are free text"
      );
    } catch (error) {
      console.error("Product export failed:", error);
      toast.error("Could not export this product");
    } finally {
      setBusy(null);
    }
  };

  const handleFilePicked = async (event) => {
    const file = event.target.files?.[0];
    // Reset immediately so picking the same file twice still fires onChange.
    event.target.value = "";
    if (!file) return;

    setBusy("import");
    try {
      const { readSingleProductFile } = await loadTransfer();
      const { product: parsed, otherProducts, errors, hasProductUrlColumn } =
        await readSingleProductFile(file, producturl);

      if (!hasProductUrlColumn) {
        toast.error("Missing the 'producturl' column — export this product first to get the right file");
        return;
      }
      if (!parsed) {
        toast.error(
          `That file has no rows for this product. The producturl column must be "${producturl}".`
        );
        return;
      }

      // Dry run first: the rows are validated and nothing is written.
      const { data: preview } = await productApi.importProducts([parsed], {
        updateExisting: true,
        dryRun: true,
      });
      const failed = (preview.details || []).find((d) => d.action === "failed");
      if (preview.status !== 201 || !preview.results || failed) {
        toast.error(failed?.message || preview.message || "The file did not pass validation");
        return;
      }
      // This button only ever updates the open product; never create from here.
      if (!preview.results.updated) {
        toast.error("That file does not match this product — nothing was changed");
        return;
      }

      // A row with every variant cell empty only carries product-level changes.
      const variantRows = parsed.variants.filter(
        (v) =>
          [v.SKU, v.EIN, v.MPN, v.Cost, v.Price, v.salePrice, v.Quantity].some(
            (cell) => cell !== null && cell !== undefined && cell !== ""
          ) ||
          v.attributes.length > 0 ||
          v.imageUrls.length > 0 ||
          (v.name && v.name !== "single")
      ).length;
      // This button only updates, so warnings about creating a product do not apply.
      const warnings = errors.filter((e) => !e.message.includes("NEW product"));

      const confirmed = window.confirm(
        `Update "${product.name}" from "${file.name}"?\n\n` +
          (variantRows
            ? `• ${variantRows} variant row(s) in the file\n`
            : `• No variant rows in the file: prices and stock stay as saved\n`) +
          `• Blank cells keep the values already saved\n` +
          (otherProducts
            ? `• ${otherProducts} other product(s) in the file will be ignored\n`
            : "") +
          (warnings.length ? `• ${warnings.length} warning(s): ${warnings[0].message}\n` : "") +
          `\nChanges on this page that you have not saved with Update will be lost.`
      );
      if (!confirmed) return;

      const { data: response } = await productApi.importProducts([parsed], {
        updateExisting: true,
      });
      if (response.status === 201 && response.results?.updated) {
        toast.success("Product updated from the file");
        onImported?.();
      } else {
        const detail = (response.details || []).find((d) => d.action === "failed");
        toast.error(detail?.message || response.message || "Import failed");
      }
    } catch (error) {
      console.error("Product import failed:", error);
      toast.error("Could not read that file — is it a valid Excel or CSV file?");
    } finally {
      setBusy(null);
    }
  };

  const disabled = busy !== null || !product?._id;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={disabled}
        title="Download this product as an Excel file"
        className="inline-flex items-center gap-2 rounded-md bg-white border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
        </svg>
        {busy === "export" ? "Exporting…" : "Export this product"}
      </button>

      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        title="Update this product from an Excel or CSV file"
        className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 disabled:opacity-50"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
            d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 9l5-5 5 5M12 4v12" />
        </svg>
        {busy === "import" ? "Importing…" : "Import into this product"}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        onChange={handleFilePicked}
        className="hidden"
      />
    </div>
  );
}

ProductTransferButtons.propTypes = {
  product: PropTypes.object.isRequired,
  productApi: PropTypes.object.isRequired,
  /** Called after a successful import so the page can reload the product. */
  onImported: PropTypes.func,
};
