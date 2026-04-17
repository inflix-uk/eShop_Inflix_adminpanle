"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { X, Loader2 } from "lucide-react";
import ProductApi from "../../../../productsNew/api/productApi";

const productApi = new ProductApi();

function idKey(id) {
  if (id == null) return "";
  return typeof id === "object" && id.toString ? id.toString() : String(id);
}

/** @typedef {'manual' | 'latest' | 'featured'} ProductSource */

export default function ProductPickerModal({
  isOpen,
  onClose,
  onApply,
  initialProductIds = [],
  initialMeta = [],
  initialProductSource = "manual",
}) {
  const [pickerMode, setPickerMode] = useState("manual");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedCategoryNames, setSelectedCategoryNames] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [availableProducts, setAvailableProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [featuredLoading, setFeaturedLoading] = useState(false);
  const [pickError, setPickError] = useState("");

  const [draftIds, setDraftIds] = useState([]);
  const [draftMetaById, setDraftMetaById] = useState({});
  const prevModalOpen = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setCategoriesLoading(true);
    setPickError("");
    productApi
      .getCategories()
      .then((res) => {
        if (cancelled) return;
        if (res.data?.status === 201 && Array.isArray(res.data.productCategories)) {
          const list = res.data.productCategories
            .filter((c) => c.isPublish)
            .map((c) => ({ name: c.name, _id: c._id }))
            .sort((a, b) => String(a.name).localeCompare(String(b.name)));
          setCategories(list);
        } else {
          setPickError(res.data?.message || "Could not load categories");
        }
      })
      .catch(() => {
        if (!cancelled) setPickError("Failed to load categories");
      })
      .finally(() => {
        if (!cancelled) setCategoriesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      prevModalOpen.current = false;
      return;
    }
    const justOpened = !prevModalOpen.current;
    prevModalOpen.current = true;
    if (!justOpened) return;

    const metaMap = {};
    (initialMeta || []).forEach((m) => {
      const k = idKey(m._id);
      if (k) metaMap[k] = { _id: m._id, name: m.name || k };
    });
    const ids = (initialProductIds || []).map(idKey).filter(Boolean);
    setDraftIds(ids);
    setDraftMetaById(() => {
      const next = { ...metaMap };
      ids.forEach((k) => {
        if (!next[k]) next[k] = { _id: k, name: k };
      });
      return next;
    });

    const src =
      initialProductSource === "latest" || initialProductSource === "featured"
        ? initialProductSource
        : "manual";
    setPickerMode(src);

    setSelectedCategoryNames([]);
    setSearch("");
    setDebouncedSearch("");
    setAvailableProducts([]);
    setFeaturedProducts([]);
  }, [isOpen, initialProductIds, initialMeta, initialProductSource]);

  useEffect(() => {
    if (!isOpen || pickerMode !== "featured") return;
    let cancelled = false;
    setFeaturedLoading(true);
    setPickError("");
    productApi
      .getFeaturedProductsHomepage()
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data?.products) ? res.data.products : [];
        setFeaturedProducts(list);
      })
      .catch(() => {
        if (!cancelled) {
          setPickError("Failed to load featured products");
          setFeaturedProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) setFeaturedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [isOpen, pickerMode]);

  const changePickerMode = (mode) => {
    setPickerMode(mode);
    setPickError("");
    if (mode === "latest") {
      setDraftIds([]);
      setDraftMetaById({});
      setSelectedCategoryNames([]);
      setSearch("");
      setDebouncedSearch("");
      setAvailableProducts([]);
    }
    if (mode === "featured") {
      setSelectedCategoryNames([]);
      setSearch("");
      setDebouncedSearch("");
      setAvailableProducts([]);
    }
    if (mode === "manual") {
      setAvailableProducts([]);
    }
  };

  const toggleCategory = (name) => {
    setSelectedCategoryNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const loadProducts = useCallback(async () => {
    if (selectedCategoryNames.length === 0) {
      setAvailableProducts([]);
      return;
    }
    setProductsLoading(true);
    setPickError("");
    try {
      const responses = await Promise.all(
        selectedCategoryNames.map((cat) =>
          productApi
            .searchProductsByCategory(cat, {
              searchname: debouncedSearch,
              limit: 100,
              page: 1,
            })
            .then((r) => r.data?.products || [])
            .catch(() => [])
        )
      );
      const merged = new Map();
      responses.flat().forEach((p) => {
        const k = idKey(p._id);
        if (k) merged.set(k, p);
      });
      setAvailableProducts([...merged.values()]);
    } catch {
      setPickError("Failed to load products");
      setAvailableProducts([]);
    } finally {
      setProductsLoading(false);
    }
  }, [selectedCategoryNames, debouncedSearch]);

  useEffect(() => {
    if (!isOpen || pickerMode !== "manual") return;
    loadProducts();
  }, [isOpen, pickerMode, loadProducts]);

  const draftSet = useMemo(() => new Set(draftIds.map(String)), [draftIds]);

  const toggleProduct = (p) => {
    const k = idKey(p._id);
    if (!k) return;
    setDraftIds((prev) => {
      if (prev.map(String).includes(k)) {
        return prev.filter((x) => String(x) !== k);
      }
      return [...prev, p._id];
    });
    setDraftMetaById((prev) => ({
      ...prev,
      [k]: { _id: p._id, name: p.name || k },
    }));
  };

  const handleApply = () => {
    if (pickerMode === "latest") {
      onApply({
        productIds: [],
        selectedProductsMeta: [],
        productSource: "latest",
      });
      onClose();
      return;
    }

    const meta = draftIds.map((id) => {
      const k = idKey(id);
      return draftMetaById[k] || { _id: id, name: k };
    });
    onApply({
      productIds: [...draftIds],
      selectedProductsMeta: meta,
      productSource: pickerMode === "featured" ? "featured" : "manual",
    });
    onClose();
  };

  const filteredFeatured = useMemo(() => {
    const q = debouncedSearch.toLowerCase();
    if (!q) return featuredProducts;
    return featuredProducts.filter((p) =>
      String(p.name || "")
        .toLowerCase()
        .includes(q)
    );
  }, [featuredProducts, debouncedSearch]);

  if (!isOpen) return null;

  const canApply =
    pickerMode === "latest" ||
    ((pickerMode === "featured" || pickerMode === "manual") && draftIds.length > 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50">
      <div
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col border border-gray-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-picker-title"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 id="product-picker-title" className="text-lg font-semibold text-gray-900">
            Add products to slider
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {pickError && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md px-3 py-2">
              {pickError}
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Product source</p>
            <div className="space-y-2 rounded-lg border border-gray-100 bg-gray-50 p-3">
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="product-slider-source"
                  className="mt-0.5"
                  checked={pickerMode === "latest"}
                  onChange={() => changePickerMode("latest")}
                />
                <span>
                  <span className="font-medium text-gray-900">Latest products</span>
                  <span className="block text-xs text-gray-600">
                    Always shows the 6 newest in-stock products on the live site (updates automatically).
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="product-slider-source"
                  className="mt-0.5"
                  checked={pickerMode === "featured"}
                  onChange={() => changePickerMode("featured")}
                />
                <span>
                  <span className="font-medium text-gray-900">Featured products</span>
                  <span className="block text-xs text-gray-600">
                    Choose from products marked featured in the catalog (order is preserved).
                  </span>
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="product-slider-source"
                  className="mt-0.5"
                  checked={pickerMode === "manual"}
                  onChange={() => changePickerMode("manual")}
                />
                <span>
                  <span className="font-medium text-gray-900">Categories</span>
                  <span className="block text-xs text-gray-600">
                    Pick categories, then select specific products (unchanged workflow).
                  </span>
                </span>
              </label>
            </div>
          </div>

          {pickerMode === "latest" ? (
            <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-3 text-sm text-emerald-900">
              No product list to edit — saving will show the six latest in-stock products to visitors.
            </div>
          ) : null}

          {pickerMode === "featured" ? (
            <div className="space-y-3">
              <div>
                <label
                  className="text-sm font-medium text-gray-700 block mb-1"
                  htmlFor="featured-product-search"
                >
                  Filter featured products
                </label>
                <input
                  id="featured-product-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name…"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Pick featured products</p>
                {featuredLoading ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500 py-6">
                    <Loader2 className="animate-spin" size={18} />
                    Loading featured products…
                  </div>
                ) : filteredFeatured.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">
                    No featured products found. Mark products as featured in the product admin.
                  </p>
                ) : (
                  <ul className="max-h-52 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100">
                    {filteredFeatured.map((p) => {
                      const k = idKey(p._id);
                      const checked = draftSet.has(k);
                      return (
                        <li key={k}>
                          <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleProduct(p)}
                            />
                            <span className="flex-1 truncate">{p.name}</span>
                            <span className="text-xs text-gray-400 truncate max-w-[120px]">
                              {p.category}
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          ) : null}

          {pickerMode === "manual" ? (
            <>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Categories</p>
                {categoriesLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="animate-spin" size={16} />
                    Loading categories…
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto border border-gray-100 rounded-lg p-2 bg-gray-50">
                    {categories.length === 0 ? (
                      <span className="text-sm text-gray-500">No published categories</span>
                    ) : (
                      categories.map((c) => (
                        <label
                          key={c._id || c.name}
                          className="inline-flex items-center gap-1.5 text-sm cursor-pointer bg-white border border-gray-200 rounded-md px-2 py-1 hover:border-emerald-400"
                        >
                          <input
                            type="checkbox"
                            checked={selectedCategoryNames.includes(c.name)}
                            onChange={() => toggleCategory(c.name)}
                          />
                          <span>{c.name}</span>
                        </label>
                      ))
                    )}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Select one or more categories; products from all selected categories appear below.
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1" htmlFor="product-search">
                  Filter products
                </label>
                <input
                  id="product-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or URL…"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  disabled={selectedCategoryNames.length === 0}
                />
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Pick products</p>
                {selectedCategoryNames.length === 0 ? (
                  <p className="text-sm text-gray-500">Select at least one category first.</p>
                ) : productsLoading ? (
                  <div className="flex items-center gap-2 text-sm text-gray-500 py-6 justify-center">
                    <Loader2 className="animate-spin" size={18} />
                    Loading products…
                  </div>
                ) : availableProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 py-4 text-center">No products match this filter.</p>
                ) : (
                  <ul className="max-h-52 overflow-y-auto border border-gray-100 rounded-lg divide-y divide-gray-100">
                    {availableProducts.map((p) => {
                      const k = idKey(p._id);
                      const checked = draftSet.has(k);
                      return (
                        <li key={k}>
                          <label className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleProduct(p)}
                            />
                            <span className="flex-1 truncate">{p.name}</span>
                            <span className="text-xs text-gray-400 truncate max-w-[120px]">{p.category}</span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </>
          ) : null}

          {pickerMode !== "latest" ? (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">
                Selected ({draftIds.length})
              </p>
              {draftIds.length === 0 ? (
                <p className="text-xs text-gray-500">None yet — use the options above.</p>
              ) : (
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-800 max-h-28 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-white shadow-sm">
                  {draftIds.map((id) => {
                    const k = idKey(id);
                    const name = draftMetaById[k]?.name || k;
                    return <li key={k}>{name}</li>;
                  })}
                </ol>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex justify-end gap-2 px-4 py-3 border-t border-gray-200 bg-white rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-800 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!canApply}
            className="px-4 py-2 text-sm font-medium rounded-md bg-white text-gray-900 border-2 border-gray-900 shadow-sm hover:bg-gray-50 hover:border-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none"
          >
            {pickerMode === "latest" ? "Use latest products" : "Use selected products"}
          </button>
        </div>
      </div>
    </div>
  );
}

ProductPickerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onApply: PropTypes.func.isRequired,
  initialProductIds: PropTypes.array,
  initialMeta: PropTypes.array,
  initialProductSource: PropTypes.oneOf(["manual", "latest", "featured"]),
};
