import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/Auth";
import Side from "../nav/Side";
import Top from "../nav/Top";
import {
  fetchGroupProductPrices,
  fetchPricingGroupProducts,
  flattenProductsToPricingRows,
  groupPricesRowsToMap,
  priceMapKey,
  saveGroupProductPrice,
} from "./api/productsApi";

export default function PricingGroupProducts() {
  const { groupId } = useParams();
  const auth = useAuth();
  const [selectedPage] = useState("pricing-groups");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [search, setSearch] = useState("");
  const [brand, setBrand] = useState("all");
  const [category, setCategory] = useState("all");
  const [stock, setStock] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [groupPrices, setGroupPrices] = useState({});
  /** While typing, show draft string; commit to API on blur (avoids debounce cleared when switching fields). */
  const [priceDraftByKey, setPriceDraftByKey] = useState({});

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  const apiBase = auth?.ip || import.meta.env.VITE_BACKEND_URL || "";

  useEffect(() => {
    if (!apiBase) return;
    let cancelled = false;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        if (!cancelled) {
          const rows = await fetchPricingGroupProducts(apiBase);
          setProducts(rows);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
        if (!cancelled) {
          toast.error("Failed to fetch products");
          setProducts([]);
        }
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }
    };

    fetchProducts();
    return () => {
      cancelled = true;
    };
  }, [apiBase]);

  useEffect(() => {
    if (!apiBase || !groupId) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchGroupProductPrices(apiBase, groupId);
        if (cancelled) return;
        setGroupPrices(groupPricesRowsToMap(rows));
        setPriceDraftByKey({});
      } catch (error) {
        console.error("Failed to fetch group product prices:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiBase, groupId]);

  const displayRows = useMemo(() => flattenProductsToPricingRows(products), [products]);

  /** Saved group override for this row only: variant rows never read product-level (`variantKey` ''). */
  const getSavedCustomGroupPrice = (productId, variantKey) => {
    const vk = variantKey != null ? String(variantKey).trim() : "";
    if (vk) {
      const k = priceMapKey(productId, vk);
      return Object.prototype.hasOwnProperty.call(groupPrices, k) ? groupPrices[k] : undefined;
    }
    const k0 = priceMapKey(productId, "");
    return Object.prototype.hasOwnProperty.call(groupPrices, k0) ? groupPrices[k0] : undefined;
  };

  const parsePriceInput = (raw) => {
    const s = String(raw ?? "")
      .trim()
      .replace(/£/g, "")
      .replace(/,/g, ".");
    if (s === "") return null;
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return false;
    return n;
  };

  const persistGroupPrice = async (productId, variantKey, numeric, { clear = false } = {}) => {
    const vk = variantKey != null ? String(variantKey).trim() : "";
    if (!apiBase || !groupId) {
      toast.error("Backend URL or group is missing; price was not saved.");
      return;
    }
    await saveGroupProductPrice(apiBase, groupId, String(productId), numeric, vk, { clear });
  };

  const rowKey = (productId, variantKey) =>
    priceMapKey(productId, variantKey != null ? String(variantKey).trim() : "");

  const onPriceDraftChange = (productId, variantKey, value) => {
    const key = rowKey(productId, variantKey);
    setPriceDraftByKey((prev) => ({ ...prev, [key]: value }));
  };

  const savePriceOnBlur = async (productId, variantKey, rawFromInput) => {
    const key = rowKey(productId, variantKey);
    const raw = String(rawFromInput ?? "").trim();
    if (raw === "") {
      setPriceDraftByKey((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setGroupPrices((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      try {
        await persistGroupPrice(productId, variantKey, null, { clear: true });
        toast.success("Group override removed");
      } catch (error) {
        console.error("Failed to clear group product price:", error);
        const msg = error?.response?.data?.message || "Failed to clear group price";
        toast.error(msg);
      }
      return;
    }

    const parsed = parsePriceInput(raw);
    if (parsed === false) {
      toast.error("Enter a valid price (e.g. 12.99)");
      return;
    }

    setGroupPrices((prev) => ({ ...prev, [key]: parsed }));
    try {
      await persistGroupPrice(productId, variantKey, parsed);
      setPriceDraftByKey((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      toast.success("Group price saved");
    } catch (error) {
      console.error("Failed to save product override price:", error);
      const msg = error?.response?.data?.message || "Failed to save product price";
      toast.error(msg);
    }
  };

  const brands = useMemo(
    () => ["all", ...new Set(displayRows.map((item) => item.brand))],
    [displayRows]
  );
  const categories = useMemo(
    () => ["all", ...new Set(displayRows.map((item) => item.category))],
    [displayRows]
  );

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return displayRows.filter((row) => {
      const searchMatch =
        !q ||
        row.productName.toLowerCase().includes(q) ||
        String(row.sku).toLowerCase().includes(q) ||
        String(row.variantLabel).toLowerCase().includes(q);
      const brandMatch = brand === "all" || row.brand === brand;
      const categoryMatch = category === "all" || row.category === category;
      const stockMatch =
        stock === "all" ||
        (stock === "in-stock" && row.stock > 0) ||
        (stock === "low-stock" && row.stock > 0 && row.stock <= 10);
      const bp = row.basePrice;
      const priceMatch =
        priceRange === "all" ||
        (priceRange === "0-300" && bp <= 300) ||
        (priceRange === "301-800" && bp > 300 && bp <= 800) ||
        (priceRange === "801+" && bp > 800);
      return searchMatch && brandMatch && categoryMatch && stockMatch && priceMatch;
    });
  }, [displayRows, search, brand, category, stock, priceRange]);

  return (
    <>
      <Helmet>
        <title>Pricing Group Products | Admin</title>
      </Helmet>

      <Side selectedPage={selectedPage} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />

      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} selectedPage={selectedPage} />

        <main className="py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Pricing Group Products</h1>
                <p className="mt-1 truncate text-sm text-gray-600" title={groupId}>
                  Group <span className="font-mono text-xs text-gray-500">{groupId}</span>
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Blur field to save. Clear price and blur to remove override.
                </p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pt-1">
                <Link
                  to={`/admin/pricing-groups/${groupId}/customers`}
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Customers
                </Link>
                <Link
                  to="/admin/pricing-groups"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  All groups
                </Link>
              </div>
            </div>

            <div className="mt-6 rounded-lg border bg-white p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search product, variation, or SKU"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {brands.map((item) => (
                    <option key={item} value={item}>
                      {item === "all" ? "All Brands" : item}
                    </option>
                  ))}
                </select>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item === "all" ? "All Categories" : item}
                    </option>
                  ))}
                </select>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">All Prices</option>
                  <option value="0-300">$0 - $300</option>
                  <option value="301-800">$301 - $800</option>
                  <option value="801+">$801+</option>
                </select>
                <select
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">All Stock</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                </select>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <h2 className="text-sm font-semibold text-gray-900">Product variations</h2>
                <span className="text-xs text-gray-500">{filteredRows.length} rows</span>
              </div>
              <div className="overflow-x-auto overflow-y-visible rounded-b-lg">
                <table className="min-w-[800px] w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Product
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Variation
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Brand
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Stock
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Base (£)
                      </th>
                      <th className="min-w-[10rem] px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Custom group (£)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {loadingProducts ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                          Loading products...
                        </td>
                      </tr>
                    ) : filteredRows.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-6 text-center text-sm text-gray-500">
                          No rows found for selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row) => {
                        const saved = getSavedCustomGroupPrice(row.productId, row.variantKey);
                        const rk = rowKey(row.productId, row.variantKey);
                        const hasDraft = Object.prototype.hasOwnProperty.call(priceDraftByKey, rk);
                        const inputValue = hasDraft
                          ? priceDraftByKey[rk]
                          : saved !== undefined && saved !== null
                            ? String(saved)
                            : "";
                        const ph =
                          row.basePrice != null && Number.isFinite(Number(row.basePrice)) && Number(row.basePrice) > 0
                            ? String(Number(row.basePrice).toFixed(2))
                            : "e.g. 99.99";
                        return (
                        <tr key={row.rowKey} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">{row.productName}</p>
                            <p className="text-xs text-gray-500">SKU: {row.sku}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-800">{row.variantLabel}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{row.brand}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-700">{row.stock}</td>
                          <td className="px-4 py-3 text-right text-sm tabular-nums text-gray-700">
                            £{Number(row.basePrice || 0).toFixed(2)}
                          </td>
                          <td className="min-w-[10rem] px-4 py-3 text-right align-middle">
                            <label className="sr-only">
                              Custom group price for {row.productName}
                              {row.variantKey ? ` — ${row.variantLabel}` : ""}
                            </label>
                            <input
                              type="text"
                              inputMode="decimal"
                              autoComplete="off"
                              value={inputValue}
                              placeholder={ph}
                              onChange={(e) => onPriceDraftChange(row.productId, row.variantKey, e.target.value)}
                              onBlur={(e) => savePriceOnBlur(row.productId, row.variantKey, e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  e.currentTarget.blur();
                                }
                              }}
                              className="inline-block min-w-[8.5rem] max-w-[10rem] rounded-md border-2 border-gray-400 bg-white px-2 py-2 text-right text-sm font-medium tabular-nums text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                              title="Type a price and click outside (or press Enter) to save for this pricing group"
                            />
                          </td>
                        </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
