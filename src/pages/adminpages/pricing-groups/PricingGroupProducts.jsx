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
  const [saveTimers, setSaveTimers] = useState({});

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  useEffect(() => {
    return () => {
      Object.values(saveTimers).forEach((t) => clearTimeout(t));
    };
  }, [saveTimers]);

  useEffect(() => {
    if (!auth?.ip) return;
    let cancelled = false;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        if (!cancelled) {
          const rows = await fetchPricingGroupProducts(auth.ip);
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
  }, [auth?.ip]);

  useEffect(() => {
    if (!auth?.ip || !groupId) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await fetchGroupProductPrices(auth.ip, groupId);
        if (cancelled) return;
        const map = rows.reduce((acc, row) => {
          acc[String(row.productId)] = Number(row.price);
          return acc;
        }, {});
        setGroupPrices(map);
      } catch (error) {
        console.error("Failed to fetch group product prices:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [auth?.ip, groupId]);

  const updatePrice = (productId, value) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric) || numeric < 0) return;

    const key = String(productId);
    setGroupPrices((prev) => ({ ...prev, [key]: numeric }));

    if (!auth?.ip || !groupId) return;

    if (saveTimers[key]) {
      clearTimeout(saveTimers[key]);
    }
    const timer = setTimeout(async () => {
      try {
        await saveGroupProductPrice(auth.ip, groupId, key, numeric);
      } catch (error) {
        console.error("Failed to save product override price:", error);
        toast.error("Failed to save product price");
      }
    }, 350);
    setSaveTimers((prev) => ({ ...prev, [key]: timer }));
  };

  const brands = useMemo(
    () => ["all", ...new Set(products.map((item) => item.brand))],
    [products]
  );
  const categories = useMemo(
    () => ["all", ...new Set(products.map((item) => item.category))],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((product) => {
      const searchMatch = !q || product.name.toLowerCase().includes(q) || product.sku.toLowerCase().includes(q);
      const brandMatch = brand === "all" || product.brand === brand;
      const categoryMatch = category === "all" || product.category === category;
      const stockMatch = stock === "all" || (stock === "in-stock" && product.stock > 0) || (stock === "low-stock" && product.stock > 0 && product.stock <= 10);
      const priceMatch = priceRange === "all" || (priceRange === "0-300" && product.price <= 300) || (priceRange === "301-800" && product.price > 300 && product.price <= 800) || (priceRange === "801+" && product.price > 800);
      return searchMatch && brandMatch && categoryMatch && stockMatch && priceMatch;
    });
  }, [products, search, brand, category, stock, priceRange]);

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Pricing Group Products</h1>
                <p className="mt-1 text-sm text-gray-600">Group: {groupId}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to={`/admin/pricing-groups/${groupId}/customers`}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Add Customers
                </Link>
                <Link
                  to="/admin/pricing-groups"
                  className="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                >
                  Back to Groups
                </Link>
              </div>
            </div>

            <div className="mt-6 rounded-lg border bg-white p-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
                <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search product or SKU" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30" />
                <select value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {brands.map((item) => <option key={item} value={item}>{item === "all" ? "All Brands" : item}</option>)}
                </select>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {categories.map((item) => <option key={item} value={item}>{item === "all" ? "All Categories" : item}</option>)}
                </select>
                <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="all">All Prices</option>
                  <option value="0-300">$0 - $300</option>
                  <option value="301-800">$301 - $800</option>
                  <option value="801+">$801+</option>
                </select>
                <select value={stock} onChange={(e) => setStock(e.target.value)} className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="all">All Stock</option>
                  <option value="in-stock">In Stock</option>
                  <option value="low-stock">Low Stock</option>
                </select>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg border bg-white">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h2 className="text-sm font-semibold text-gray-900">Product List</h2>
                <span className="text-xs text-gray-500">{filteredProducts.length} items</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Brand</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Category</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Stock</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {loadingProducts ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">Loading products...</td>
                      </tr>
                    ) : filteredProducts.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-500">No products found for selected filters.</td>
                      </tr>
                    ) : (
                      filteredProducts.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <p className="text-sm font-medium text-gray-900">{product.name}</p>
                            <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{product.brand}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{product.category}</td>
                          <td className="px-4 py-3 text-right text-sm text-gray-700">{product.stock}</td>
                          <td className="px-4 py-3 text-right">
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={
                                groupPrices[product.id] !== undefined
                                  ? groupPrices[product.id]
                                  : product.price
                              }
                              onChange={(e) => updatePrice(product.id, e.target.value)}
                              className="w-24 rounded-md border border-gray-300 px-2 py-1 text-right text-sm text-gray-900 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />
                          </td>
                        </tr>
                      ))
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
