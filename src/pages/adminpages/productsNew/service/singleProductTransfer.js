/**
 * Export / import of ONE product, in the same Excel format as the bulk
 * Export Excel / Import buttons on the products list, so a file made here can
 * be used there and the other way round.
 */

import { csvToRows, rowsToProducts } from "./productCsvSchema";
import { buildProductWorkbook, readProductWorkbook } from "./productWorkbook";

const XLSX_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function downloadBlob(blob, filename) {
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
 * Download one product as an .xlsx file.
 * @param {ProductApi} productApi
 * @param {string} productId
 * @returns {Promise<{ filename: string, withDropdowns: boolean }>}
 */
export async function exportSingleProduct(productApi, productId) {
  // The list rows are trimmed, so always export from the full record.
  const { data } = await productApi.getProduct(productId);
  if (data?.status !== 201 || !data.product) {
    throw new Error(data?.message || "Could not load the product");
  }
  const product = data.product;

  // Dropdown options are optional: without them the cells are free text.
  let reference = null;
  try {
    const { data: refData } = await productApi.getCsvReferenceData();
    if (refData?.status === 200) reference = refData.reference;
  } catch (error) {
    console.warn("Reference data unavailable — exporting without dropdowns", error);
  }

  const workbook = await buildProductWorkbook({ products: [product], reference });
  const buffer = await workbook.xlsx.writeBuffer();
  const filename = `product-${product.producturl || productId}-${new Date()
    .toISOString()
    .slice(0, 10)}.xlsx`;
  downloadBlob(new Blob([buffer], { type: XLSX_TYPE }), filename);

  return { filename, withDropdowns: Boolean(reference) };
}

/**
 * Read an .xlsx / .csv file and keep only the rows of one product.
 * @param {File} file
 * @param {string} producturl - The product the file must describe
 * @returns {Promise<{ product: Object|null, otherProducts: number, errors: Array, hasProductUrlColumn: boolean }>}
 */
export async function readSingleProductFile(file, producturl) {
  const isExcel = /\.xlsx?$/i.test(file.name);
  const { headers, rows } = isExcel
    ? await readProductWorkbook(await file.arrayBuffer())
    : csvToRows(await file.text());

  if (!headers.includes("producturl")) {
    return { product: null, otherProducts: 0, errors: [], hasProductUrlColumn: false };
  }

  const { products, errors } = rowsToProducts(rows);
  const target = String(producturl || "").trim().toLowerCase();
  const product =
    products.find((p) => String(p.producturl).trim().toLowerCase() === target) || null;

  return {
    product,
    otherProducts: products.length - (product ? 1 : 0),
    errors: errors.filter((e) => !product || e.message.includes(`"${product.producturl}"`)),
    hasProductUrlColumn: true,
  };
}
