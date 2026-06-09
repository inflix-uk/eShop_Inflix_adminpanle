import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import EditVariantCard from "./EditVariantCard";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const SORT_FIELDS = [
  { value: "name", label: "Name" },
  { value: "price", label: "Price" },
  { value: "salePrice", label: "Sale Price" },
  { value: "quantity", label: "Quantity" },
];

function SortHeaderButton({ label, field, sortField, sortDir, onSort }) {
  const active = sortField === field;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={`inline-flex items-center gap-1 hover:text-primary ${
        active ? "text-primary" : ""
      }`}
    >
      {label}
      {active ? (
        <span className="text-[10px] font-normal">{sortDir === "asc" ? "↑" : "↓"}</span>
      ) : (
        <span className="text-[10px] font-normal text-gray-400">↕</span>
      )}
    </button>
  );
}

export default function GeneratedVariants({
  product,
  setProduct,
  modal,
  toggleDropdown,
}) {
  const [selectedVariants, setSelectedVariants] = useState([]);
  const [bulkEditModal, setBulkEditModal] = useState(false);
  const [bulkEditValues, setBulkEditValues] = useState({
    Cost: "",
    Price: "",
    salePrice: "",
    Quantity: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [stockFilter, setStockFilter] = useState("all");

  const displayRows = useMemo(() => {
    let rows = (product?.variantValues || []).map((variant, index) => ({
      variant,
      index,
    }));

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      rows = rows.filter((row) =>
        String(row.variant?.name || "").toLowerCase().includes(query)
      );
    }

    if (stockFilter === "in_stock") {
      rows = rows.filter((row) => Number(row.variant?.Quantity) > 0);
    } else if (stockFilter === "out_of_stock") {
      rows = rows.filter(
        (row) => !row.variant?.Quantity || Number(row.variant?.Quantity) === 0
      );
    } else if (stockFilter === "low_stock") {
      rows = rows.filter((row) => {
        const qty = Number(row.variant?.Quantity);
        return qty > 0 && qty <= 5;
      });
    }

    rows.sort((a, b) => {
      let av;
      let bv;
      switch (sortField) {
        case "price":
          av = parseFloat(a.variant?.Price) || 0;
          bv = parseFloat(b.variant?.Price) || 0;
          break;
        case "salePrice":
          av = parseFloat(a.variant?.salePrice) || 0;
          bv = parseFloat(b.variant?.salePrice) || 0;
          break;
        case "quantity":
          av = parseFloat(a.variant?.Quantity) || 0;
          bv = parseFloat(b.variant?.Quantity) || 0;
          break;
        default:
          av = String(a.variant?.name || "").toLowerCase();
          bv = String(b.variant?.name || "").toLowerCase();
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });

    return rows;
  }, [product?.variantValues, searchQuery, sortField, sortDir, stockFilter]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "name" ? "asc" : "desc");
    }
  };

  const handleSelectVariant = (index) => {
    setSelectedVariants((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    const visibleIndices = displayRows.map((row) => row.index);
    const allVisibleSelected =
      visibleIndices.length > 0 &&
      visibleIndices.every((i) => selectedVariants.includes(i));
    if (allVisibleSelected) {
      setSelectedVariants((prev) =>
        prev.filter((i) => !visibleIndices.includes(i))
      );
    } else {
      setSelectedVariants((prev) => [...new Set([...prev, ...visibleIndices])]);
    }
  };

  const handleBulkEditSubmit = () => {
    const updatedVariants = [...product.variantValues];
    selectedVariants.forEach((index) => {
      updatedVariants[index] = {
        ...updatedVariants[index],
        ...(bulkEditValues.Cost !== "" && { Cost: bulkEditValues.Cost }),
        ...(bulkEditValues.Price !== "" && { Price: bulkEditValues.Price }),
        ...(bulkEditValues.salePrice !== "" && { salePrice: bulkEditValues.salePrice }),
        ...(bulkEditValues.Quantity !== "" && { Quantity: bulkEditValues.Quantity }),
      };
    });
    setProduct({
      ...product,
      variantValues: updatedVariants,
    });
    setSelectedVariants([]);
    setBulkEditValues({ Cost: "", Price: "", salePrice: "", Quantity: "" });
    setBulkEditModal(false);
  };

  return (
    <>
      {/* Bulk Edit Modal */}
      {bulkEditModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setBulkEditModal(false)}
            />
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
              <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 mb-4">
                  Bulk Edit ({selectedVariants.length} variants selected)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cost
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      placeholder="Leave empty to skip"
                      value={bulkEditValues.Cost}
                      onChange={(e) =>
                        setBulkEditValues({ ...bulkEditValues, Cost: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      placeholder="Leave empty to skip"
                      value={bulkEditValues.Price}
                      onChange={(e) =>
                        setBulkEditValues({ ...bulkEditValues, Price: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sale Price
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      placeholder="Leave empty to skip"
                      value={bulkEditValues.salePrice}
                      onChange={(e) =>
                        setBulkEditValues({ ...bulkEditValues, salePrice: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="text"
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                      placeholder="Leave empty to skip"
                      value={bulkEditValues.Quantity}
                      onChange={(e) =>
                        setBulkEditValues({ ...bulkEditValues, Quantity: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 sm:ml-3 sm:w-auto"
                  onClick={handleBulkEditSubmit}
                >
                  Apply to Selected
                </button>
                <button
                  type="button"
                  className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                  onClick={() => setBulkEditModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="px-0 shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl ">
        <div className="py-4 px-4 space-y-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <h1 className="font-bold">Product Price And Stock</h1>
              {product?.variantValues?.length > 0 && (
                <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                  Total: {product.variantValues.length} variants
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {selectedVariants.length > 0 && (
              <button
                type="button"
                className="inline-flex items-center gap-x-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                onClick={() => setBulkEditModal(true)}
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
                Bulk Edit ({selectedVariants.length})
              </button>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:flex-wrap sm:items-center">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search variants..."
              className="w-full min-w-[180px] flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm sm:max-w-xs"
            />
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
            >
              <option value="all">All stock</option>
              <option value="in_stock">In stock</option>
              <option value="out_of_stock">Out of stock</option>
              <option value="low_stock">Low stock (1–5)</option>
            </select>
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm"
            >
              {SORT_FIELDS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Sort: {opt.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setSortDir((prev) => (prev === "asc" ? "desc" : "asc"))}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium hover:bg-gray-100"
              title="Toggle sort direction"
            >
              {sortDir === "asc" ? "Ascending ↑" : "Descending ↓"}
            </button>
            {(searchQuery || stockFilter !== "all") && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStockFilter("all");
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear filters
              </button>
            )}
            <span className="text-xs text-gray-500 sm:ml-auto">
              Showing {displayRows.length} of {product?.variantValues?.length || 0}
            </span>
          </div>

          <div className="px-1 sm:px-6 ">
            {/* Mobile Card View - visible on small screens */}
            <div className="block md:hidden mt-8 overflow-hidden">
              {/* Mobile Bulk Edit Button */}
              {selectedVariants.length > 0 && (
                <div className="mb-4">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-x-2 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90"
                    onClick={() => setBulkEditModal(true)}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                      />
                    </svg>
                    Bulk Edit ({selectedVariants.length})
                  </button>
                </div>
              )}
              {/* Select All for Mobile */}
              <div className="flex items-center gap-2 mb-4 p-2 bg-gray-50 rounded-md">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  checked={
                    displayRows.length > 0 &&
                    displayRows.every((row) => selectedVariants.includes(row.index))
                  }
                  onChange={handleSelectAll}
                />
                <span className="text-sm font-medium text-gray-700">Select All (visible)</span>
              </div>
              {displayRows.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-500">No variants match your filters.</p>
              ) : null}
              {displayRows.map(({ variant, index }) => (
                <div key={variant?.name || variant?._tempId || variant?._id || `variant-${index}`} className={`relative ${selectedVariants.includes(index) ? "ring-2 ring-primary rounded-lg" : ""}`}>
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      checked={selectedVariants.includes(index)}
                      onChange={() => handleSelectVariant(index)}
                    />
                  </div>
                  <EditVariantCard
                    variant={variant}
                    index={index}
                    product={product}
                    setProduct={setProduct}
                    toggleDropdown={toggleDropdown}
                    modal={modal}
                  />
                </div>
              ))}
            </div>

            {/* Desktop Table View - visible on medium screens and up */}
            <div className="hidden md:block mt-8 overflow-x-auto">
              <div className="flow-root">
                <div className="inline-block min-w-full py-2 align-middle">
                  <table className="min-w-full border-separate border-spacing-0">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter px-2"
                        >
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                            checked={
                              displayRows.length > 0 &&
                              displayRows.every((row) =>
                                selectedVariants.includes(row.index)
                              )
                            }
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75   text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter  "
                        >
                          <SortHeaderButton
                            label="Name"
                            field="name"
                            sortField={sortField}
                            sortDir={sortDir}
                            onSort={handleSort}
                          />
                        </th>

                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75   text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter  "
                        >
                          Cost
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75   text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter  "
                        >
                          <SortHeaderButton
                            label="Price"
                            field="price"
                            sortField={sortField}
                            sortDir={sortDir}
                            onSort={handleSort}
                          />
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75   text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter  "
                        >
                          <SortHeaderButton
                            label="Sale Price"
                            field="salePrice"
                            sortField={sortField}
                            sortDir={sortDir}
                            onSort={handleSort}
                          />
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75   text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter  "
                        >
                          <SortHeaderButton
                            label="Quantity"
                            field="quantity"
                            sortField={sortField}
                            sortDir={sortDir}
                            onSort={handleSort}
                          />
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75   text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter  "
                        >
                          SKU
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75   text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter  "
                        >
                          EAN
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75   text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter  "
                        >
                          MPN
                        </th>
                        <th
                          scope="col"
                          className="sticky top-0 z-10 border-b border-gray-300 bg-white bg-opacity-75   text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter  "
                        >
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayRows.length === 0 ? (
                        <tr>
                          <td
                            colSpan={11}
                            className="py-8 text-center text-sm text-gray-500"
                          >
                            No variants match your filters.
                          </td>
                        </tr>
                      ) : null}
                      {displayRows.map(({ variant, index }) => (
                        <React.Fragment key={variant?.name || variant?._tempId || variant?._id || `variant-${index}`}>
                          <tr className={selectedVariants.includes(index) ? "bg-primary/5" : ""}>
                            <td className="whitespace-nowrap py-1 text-sm font-medium text-gray-900 px-2">
                              <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                checked={selectedVariants.includes(index)}
                                onChange={() => handleSelectVariant(index)}
                              />
                            </td>
                            <td className="whitespace-nowrap py-1 text-sm font-medium text-gray-900 ">
                              {variant?.name}
                            </td>

                            <td className="whitespace-nowrap py-1 text-sm font-medium text-gray-900 ">
                              <div className="relative rounded-md w-2/3 flex flex-row">
                                <input
                                  type="text"
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                  value={variant?.Cost || ""}
                                  onChange={(e) => {
                                    const updatedVariants = [
                                      ...product.variantValues,
                                    ];
                                    updatedVariants[index] = {
                                      ...updatedVariants[index],
                                      ["Cost"]: e.target.value,
                                    };
                                    setProduct({
                                      ...product,
                                      variantValues: updatedVariants,
                                    });
                                    // console.log(updatedVariants);
                                  }}
                                />
                              </div>
                            </td>
                            <td className="whitespace-nowrap py-1 text-sm font-medium text-gray-900 ">
                              <div className="relative rounded-md w-2/3 flex flex-row">
                                <input
                                  type="text"
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                  value={variant?.Price || ""}
                                  onChange={(e) => {
                                    const updatedVariants = [
                                      ...product.variantValues,
                                    ];
                                    updatedVariants[index] = {
                                      ...updatedVariants[index],
                                      ["Price"]: e.target.value,
                                    };
                                    setProduct({
                                      ...product,
                                      variantValues: updatedVariants,
                                    });
                                    // console.log(updatedVariants);
                                  }}
                                />
                              </div>
                            </td>
                            <td className="whitespace-nowrap py-1 text-sm font-medium text-gray-900 ">
                              <div className="relative rounded-md w-2/3 flex flex-row">
                                <input
                                  type="text"
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                  value={variant?.salePrice || ""}
                                  onChange={(e) => {
                                    const updatedVariants = [
                                      ...product.variantValues,
                                    ];
                                    updatedVariants[index] = {
                                      ...updatedVariants[index],
                                      ["salePrice"]: e.target.value,
                                    };
                                    setProduct({
                                      ...product,
                                      variantValues: updatedVariants,
                                    });
                                    // console.log(updatedVariants);
                                  }}
                                />
                              </div>
                            </td>
                            <td className="whitespace-nowrap py-1 text-sm font-medium text-gray-900 ">
                              <div className="relative rounded-md w-2/3 flex flex-row">
                                <input
                                  type="text"
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                  value={variant?.Quantity || ""}
                                  onChange={(e) => {
                                    const updatedVariants = [
                                      ...product.variantValues,
                                    ];
                                    updatedVariants[index] = {
                                      ...updatedVariants[index],
                                      ["Quantity"]: e.target.value,
                                    };
                                    setProduct({
                                      ...product,
                                      variantValues: updatedVariants,
                                    });
                                    console.log(updatedVariants);
                                  }}
                                />
                              </div>
                            </td>
                            <td className="whitespace-nowrap py-1 text-sm font-medium text-gray-900 ">
                              <div className="relative rounded-md w-2/3 flex flex-row">
                                <input
                                  type="text"
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                  value={variant?.SKU || ""}
                                  onChange={(e) => {
                                    const updatedVariants = [
                                      ...product.variantValues,
                                    ];
                                    updatedVariants[index] = {
                                      ...updatedVariants[index],
                                      ["SKU"]: e.target.value,
                                    };
                                    setProduct({
                                      ...product,
                                      variantValues: updatedVariants,
                                    });
                                    console.log(updatedVariants);
                                  }}
                                />
                              </div>
                            </td>
                            <td className="whitespace-nowrap py-1 text-sm font-medium text-gray-900 ">
                              <div className="relative rounded-md w-2/3 flex flex-row">
                                <input
                                  type="text"
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                  value={variant?.EIN || ""}
                                  onChange={(e) => {
                                    const updatedVariants = [
                                      ...product.variantValues,
                                    ];
                                    updatedVariants[index] = {
                                      ...updatedVariants[index],
                                      ["EIN"]: e.target.value,
                                    };
                                    setProduct({
                                      ...product,
                                      variantValues: updatedVariants,
                                    });
                                    console.log(updatedVariants);
                                  }}
                                />
                              </div>
                            </td>
                            <td className="whitespace-nowrap py-1 text-sm font-medium text-gray-900 ">
                              <div className="relative rounded-md w-2/3 flex flex-row">
                                <input
                                  type="text"
                                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                  value={variant?.MPN || ""}
                                  onChange={(e) => {
                                    const updatedVariants = [
                                      ...product.variantValues,
                                    ];
                                    updatedVariants[index] = {
                                      ...updatedVariants[index],
                                      ["MPN"]: e.target.value,
                                    };
                                    setProduct({
                                      ...product,
                                      variantValues: updatedVariants,
                                    });
                                    console.log(updatedVariants);
                                  }}
                                />
                              </div>
                            </td>
                            <td className="whitespace-nowrap py-1 text-sm font-medium text-gray-900 ">
                              <div className="relative rounded-md w-2/3 flex flex-row">
                                <label className="items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={
                                      variant?.status !== undefined
                                        ? variant.status
                                        : true
                                    }
                                    onChange={() => {
                                      const updatedVariants = [
                                        ...product.variantValues,
                                      ];
                                      const newStatus =
                                        updatedVariants[index]?.status !==
                                        undefined
                                          ? !updatedVariants[index].status
                                          : false;
                                      updatedVariants[index] = {
                                        ...updatedVariants[index],
                                        status: newStatus,
                                      };
                                      setProduct({
                                        ...product,
                                        variantValues: updatedVariants,
                                      });

                                      console.log(
                                        "╔════════════════════════════════════════════════════════════╗"
                                      );
                                      console.log(
                                        "║  [FRONTEND] STATUS TOGGLE CHANGED                          ║"
                                      );
                                      console.log(
                                        "╚════════════════════════════════════════════════════════════╝"
                                      );
                                      console.log(
                                        `📦 Variant Name: ${updatedVariants[index].name}`
                                      );
                                      console.log(
                                        `🔄 New Status: ${
                                          newStatus
                                            ? "✅ ON (true)"
                                            : "❌ OFF (false)"
                                        }`
                                      );
                                      console.log(`📊 All Variant Statuses:`);
                                      updatedVariants.forEach((v, i) => {
                                        const statusIcon =
                                          v.status !== false ? "✅" : "❌";
                                        console.log(
                                          `   [${i}] ${v.name}: ${statusIcon} ${
                                            v.status !== false ? "ON" : "OFF"
                                          }`
                                        );
                                      });
                                      console.log(
                                        "═══════════════════════════════════════════════════════════\n"
                                      );
                                    }}
                                    className="sr-only peer"
                                  />
                                  <div className="relative w-11 h-6 bg-red-500 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                                </label>
                              </div>
                            </td>
                            <td className="whitespace-nowrap py-1 text-sm font-medium text-gray-900 ">
                              <div className="relative rounded-md w-2/3 flex flex-row">
                                <button
                                  className="text-primary bg-gray-50 group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-semibold ml-2"
                                  onClick={() => {
                                    toggleDropdown(variant?._id);
                                  }}
                                >
                                  <svg
                                    className="h-3 w-3 shrink-0 text-primary my-auto"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 20 20"
                                    fill="none"
                                  >
                                    <path
                                      d="M8.5 18C8.5 18.3978 8.65804 18.7794 8.93934 19.0607C9.22064 19.342 9.60218 19.5 10 19.5C10.3978 19.5 10.7794 19.342 11.0607 19.0607C11.342 18.7794 11.5 18.3978 11.5 18V11.5H18C18.3978 11.5 18.7794 11.342 19.0607 11.0607C19.342 10.7794 19.5 10.3978 19.5 10C19.5 9.60218 19.342 9.22064 19.0607 8.93934C18.7794 8.65804 18.3978 8.5 18 8.5H11.5V2C11.5 1.60218 11.342 1.22064 11.0607 0.93934C10.7794 0.658035 10.3978 0.5 10 0.5C9.60218 0.5 9.22064 0.658035 8.93934 0.93934C8.65804 1.22064 8.5 1.60218 8.5 2V8.5H2C1.60218 8.5 1.22064 8.65804 0.93934 8.93934C0.658035 9.22064 0.5 9.60218 0.5 10C0.5 10.3978 0.658035 10.7794 0.93934 11.0607C1.22064 11.342 1.60218 11.5 2 11.5H8.5V18Z"
                                      fill="currentColor"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                          {modal[variant._id] && (
                            <tr>
                              <td></td>
                              <td></td>
                              <td colSpan={6}>
                                <label
                                  htmlFor="description"
                                  className="block  text-sm font-medium text-gray-900 "
                                >
                                  Variant Images
                                </label>
                                <div className=" flex justify-center rounded-lg border border-dashed border-gray-900/25  col-span-2">
                                  <div className="text-center">
                                    <div className="flex flex-row gap-x-4">
                                      {variant?.variantImages?.length > 0 ? (
                                        variant.variantImages.map(
                                          (image, imageIndex) => (
                                            <img
                                              key={
                                                image.filename ||
                                                `${variant.name || variant._tempId || variant._id}-image-${imageIndex}`
                                              }
                                              src={
                                                image.url
                                                  ? image.url
                                                  : image.path
                                                  ? `${BACKEND_URL}${image.path}`
                                                  : image instanceof File ||
                                                    image instanceof Blob
                                                  ? URL.createObjectURL(image)
                                                  : typeof image === "string"
                                                  ? image
                                                  : ""
                                              }
                                              alt={`Image ${imageIndex + 1}`}
                                              className="h-12 rounded-md mx-auto cursor-pointer"
                                            />
                                          )
                                        )
                                      ) : (
                                        <svg
                                          className="mx-auto h-12 w-12 text-gray-300"
                                          viewBox="0 0 24 24"
                                          fill="currentColor"
                                          aria-hidden="true"
                                        >
                                          <path
                                            fillRule="evenodd"
                                            d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                                            clipRule="evenodd"
                                          />
                                        </svg>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                <div className="col-span-2">
                                  <label
                                    htmlFor="name"
                                    className="block mb-2 text-sm font-medium text-gray-900 "
                                  >
                                    Meta Title
                                  </label>
                                  <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    placeholder="Type product name"
                                    value={variant.metaTitle || ""}
                                    onChange={(e) => {
                                      const updatedVariants = [
                                        ...product.variantValues,
                                      ];
                                      updatedVariants[index] = {
                                        ...updatedVariants[index],
                                        ["metaTitle"]: e.target.value,
                                      };
                                      setProduct({
                                        ...product,
                                        variantValues: updatedVariants,
                                      });
                                      console.log(updatedVariants);
                                    }}
                                  />
                                </div>
                                <div className="flex justify-center rounded-lg border border-dashed border-gray-900/25 col-span-2">
                                  <div className="text-center">
                                    {variant.metaImage ? (
                                      <>
                                        {(variant.metaImage.url || variant.metaImage.path) ? (
                                          // Display existing meta image from server
                                          <>
                                            <img
                                              src={variant.metaImage.url || `${BACKEND_URL}${variant.metaImage.path}`}
                                              alt="Thumbnail"
                                              className="h-12 rounded-md mx-auto cursor-pointer"
                                              onClick={() => {
                                                const updatedVariants = [
                                                  ...product.variantValues,
                                                ];
                                                updatedVariants[index] = {
                                                  ...updatedVariants[index],
                                                  metaImage: null,
                                                };
                                                setProduct({
                                                  ...product,
                                                  variantValues:
                                                    updatedVariants,
                                                });
                                              }}
                                            />
                                            <p className="text-xs leading-5 text-red-600">
                                              Click image to delete
                                            </p>
                                          </>
                                        ) : (
                                          // Display newly uploaded meta image
                                          <>
                                            <img
                                              src={
                                                variant.metaImage instanceof
                                                  File ||
                                                variant.metaImage instanceof
                                                  Blob
                                                  ? URL.createObjectURL(
                                                      variant.metaImage
                                                    )
                                                  : typeof variant.metaImage ===
                                                    "string"
                                                  ? variant.metaImage
                                                  : ""
                                              }
                                              alt="Thumbnail"
                                              className="h-12 rounded-md mx-auto cursor-pointer"
                                              onClick={() => {
                                                const updatedVariants = [
                                                  ...product.variantValues,
                                                ];
                                                updatedVariants[index] = {
                                                  ...updatedVariants[index],
                                                  metaImage: null,
                                                };
                                                setProduct({
                                                  ...product,
                                                  variantValues:
                                                    updatedVariants,
                                                });
                                              }}
                                            />
                                            <p className="text-xs leading-5 text-red-600">
                                              Click image to delete
                                            </p>
                                          </>
                                        )}
                                      </>
                                    ) : (
                                      <svg
                                        className="mx-auto h-12 w-12 text-gray-300"
                                        viewBox="0 0 24 24"
                                        fill="currentColor"
                                        aria-hidden="true"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                    <div className="mt-2 text-sm leading-6 text-gray-600">
                                      <label
                                        htmlFor={`metaImage-${index}`}
                                        className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary"
                                      >
                                        <span>Upload a file</span>
                                        <input
                                          id={`metaImage-${index}`}
                                          name={`metaImage-${index}`}
                                          type="file"
                                          className="sr-only"
                                          accept="image/*"
                                          onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) {
                                              const updatedVariants = [
                                                ...product.variantValues,
                                              ];
                                              updatedVariants[index] = {
                                                ...updatedVariants[index],
                                                metaImage: file,
                                              };
                                              setProduct({
                                                ...product,
                                                variantValues: updatedVariants,
                                              });
                                              console.log(updatedVariants);
                                            }
                                          }}
                                        />
                                      </label>
                                    </div>
                                  </div>
                                </div>

                                <div className="col-span-2">
                                  <label
                                    htmlFor="description"
                                    className="block mb-2 text-sm font-medium text-gray-900 "
                                  >
                                    Meta Description
                                  </label>
                                  <textarea
                                    id="description"
                                    rows="4"
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    placeholder="meta description here"
                                    value={variant.metaDescription || ""}
                                    onChange={(e) => {
                                      const updatedVariants = [
                                        ...product.variantValues,
                                      ];
                                      updatedVariants[index] = {
                                        ...updatedVariants[index],
                                        ["metaDescription"]: e.target.value,
                                      };
                                      setProduct({
                                        ...product,
                                        variantValues: updatedVariants,
                                      });
                                      console.log(updatedVariants);
                                    }}
                                  />
                                </div>
                                {/* Meta Keywords */}
                                <div className="col-span-2 mt-4">
                                  <label
                                    htmlFor={`metaKeywords-${variant._id}`}
                                    className="block mb-2 text-sm font-medium text-gray-900"
                                  >
                                    Meta Keywords
                                  </label>
                                  <input
                                    type="text"
                                    name={`metaKeywords-${variant._id}`}
                                    id={`metaKeywords-${variant._id}`}
                                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                    placeholder="Type meta keywords"
                                    value={variant.metaKeywords || ""}
                                    onChange={(e) => {
                                      const updatedVariants = [
                                        ...product.variantValues,
                                      ];
                                      updatedVariants[index] = {
                                        ...updatedVariants[index],
                                        metaKeywords: e.target.value,
                                      };
                                      setProduct({
                                        ...product,
                                        variantValues: updatedVariants,
                                      });
                                    }}
                                  />
                                </div>
                                {/* Meta Schemas */}
                                <div className="col-span-2 mt-4">
                                  <div className="flex justify-between items-center">
                                    <label
                                      htmlFor={`metaSchemas-${variant._id}`}
                                      className="block  text-sm font-medium text-gray-900"
                                    >
                                      Meta Schemas
                                    </label>
                                    <div className="flex justify-end mt-2 items-center">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const updatedSchemas =
                                            variant.metaSchemas
                                              ? [...variant.metaSchemas, ""]
                                              : [""];
                                          const updatedVariants = [
                                            ...product.variantValues,
                                          ];
                                          updatedVariants[index] = {
                                            ...updatedVariants[index],
                                            metaSchemas: updatedSchemas,
                                          };
                                          setProduct({
                                            ...product,
                                            variantValues: updatedVariants,
                                          });
                                        }}
                                        className="text-blue-600 bg-gray-50 group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-semibold ml-2 border border-gray-300"
                                      >
                                        <svg
                                          className="h-3 w-3 shrink-0 text-blue-600 my-auto"
                                          width="20"
                                          height="20"
                                          viewBox="0 0 20 20"
                                          fill="none"
                                        >
                                          <path
                                            d="M8.5 18C8.5 18.3978 8.65804 18.7794 8.93934 19.0607C9.22064 19.342 9.60218 19.5 10 19.5C10.3978 19.5 10.7794 19.342 11.0607 19.0607C11.342 18.7794 11.5 18.3978 11.5 18V11.5H18C18.3978 11.5 18.7794 11.342 19.0607 11.0607C19.342 10.7794 19.5 10.3978 19.5 10C19.5 9.60218 19.342 9.22064 19.0607 8.93934C18.7794 8.65804 18.3978 8.5 18 8.5H11.5V2C11.5 1.60218 11.342 1.22064 11.0607 0.93934C10.7794 0.658035 10.3978 0.5 10 0.5C9.60218 0.5 9.22064 0.658035 8.93934 0.93934C8.65804 1.22064 8.5 1.60218 8.5 2V8.5H2C1.60218 8.5 1.22064 8.65804 0.93934 8.93934C0.658035 9.22064 0.5 9.60218 0.5 10C0.5 10.3978 0.658035 10.7794 0.93934 11.0607C1.22064 11.342 1.60218 11.5 2 11.5H8.5V18Z"
                                            fill="currentColor"
                                          />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>

                                  <div className="relative mt-2 rounded-md shadow-sm w-full">
                                    {/* Add Schema Button */}

                                    {/* Schema Inputs */}
                                    {(variant.metaSchemas &&
                                    variant.metaSchemas.length > 0
                                      ? variant.metaSchemas
                                      : [""]
                                    ).map((schema, schemaIndex) => (
                                      <div
                                        key={`${variant.name || variant._tempId || variant._id}-schema-${schemaIndex}`}
                                        className="relative mt-2 rounded-md w-full flex items-center gap-2"
                                      >
                                        <textarea
                                          id={`metaSchema-${variant._id}-${schemaIndex}`}
                                          name={`metaSchema-${variant._id}-${schemaIndex}`}
                                          rows="3"
                                          className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                                          value={schema || ""}
                                          onChange={(e) => {
                                            // Store the value directly without modifying it
                                            const updatedSchemas =
                                              variant.metaSchemas
                                                ? [...variant.metaSchemas]
                                                : [""];
                                            updatedSchemas[schemaIndex] =
                                              e.target.value; // Use the raw value
                                            const updatedVariants = [
                                              ...product.variantValues,
                                            ];
                                            updatedVariants[index] = {
                                              ...updatedVariants[index],
                                              metaSchemas: updatedSchemas,
                                            };
                                            setProduct({
                                              ...product,
                                              variantValues: updatedVariants,
                                            });
                                          }}
                                        />
                                        {schemaIndex > 0 && (
                                          <button
                                            type="button"
                                            className="text-red-600 bg-gray-50 group flex gap-x-3 rounded-lg p-2 text-sm leading-6 font-semibold items-center border border-gray-300"
                                            onClick={() => {
                                              const updatedSchemas =
                                                variant.metaSchemas.filter(
                                                  (_, i) => i !== schemaIndex
                                                );
                                              const updatedVariants = [
                                                ...product.variantValues,
                                              ];
                                              updatedVariants[index] = {
                                                ...updatedVariants[index],
                                                metaSchemas: updatedSchemas,
                                              };
                                              setProduct({
                                                ...product,
                                                variantValues: updatedVariants,
                                              });
                                            }}
                                          >
                                            <svg
                                              className="h-4 w-4 shrink-0 text-red-600 my-auto"
                                              width="16"
                                              height="18"
                                              viewBox="0 0 16 18"
                                              fill="none"
                                            >
                                              <path
                                                d="M3 18C2.45 18 1.97933 17.8043 1.588 17.413C1.19667 17.0217 1.00067 16.5507 1 16V3H0V1H5V0H11V1H16V3H15V16C15 16.55 14.8043 17.021 14.413 17.413C14.0217 17.805 13.5507 18.0007 13 18H3ZM13 3H3V16H13V3ZM5 14H7V5H5V14ZM9 14H11V5H9V14Z"
                                                fill="currentColor"
                                              />
                                            </svg>
                                          </button>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

GeneratedVariants.propTypes = {
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
  modal: PropTypes.object.isRequired,
  toggleDropdown: PropTypes.func.isRequired,
};
