import { useState, useEffect, useCallback, useMemo } from "react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import ProductTab from "./ProductTab";
import LoadingBar from "react-top-loading-bar";
import { useAuth } from "../../../context/Auth";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import ProductApi from "./api/productApi";
import DraftProductService from "./service/draftProductService";
import DraftProductCard from "./Components/allProducts/DraftProductCard";
import ProductPreviewModal from "./Components/preview/ProductPreviewModal";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowPathIcon,
  CubeIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const DraftProducts = () => {
  const auth = useAuth();

  // Initialize API and Service with useMemo to prevent recreation on every render
  const productApi = useMemo(() => new ProductApi(), []);
  const draftProductService = useMemo(() => new DraftProductService(), []);

  const [progress, setProgress] = useState(0);
  const [selectedTab, setSelectedTab] = useState("draft-products");
  const [selectedPage, setSelectedPage] = useState("draft-products");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, published, draft, featured

  // Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Helper to get image URL
  const getImageUrl = useCallback((image) => {
    if (!image) return "";
    if (image.url) return image.url;
    if (image.path && auth?.ip) {
      const baseUrl = auth.ip.endsWith("/") ? auth.ip.slice(0, -1) : auth.ip;
      const imagePath = image.path.startsWith("/") ? image.path : `/${image.path}`;
      return `${baseUrl}${imagePath}`;
    }
    return "";
  }, [auth?.ip]);

  // Filtered products based on search and filter
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.category?.toLowerCase().includes(query) ||
          p.producturl?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filterStatus === "published") {
      result = result.filter((p) => p.status === true);
    } else if (filterStatus === "draft") {
      result = result.filter((p) => p.status === false);
    } else if (filterStatus === "featured") {
      result = result.filter((p) => p.is_featured === true);
    }

    return result;
  }, [products, searchQuery, filterStatus]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: products.length,
      published: products.filter((p) => p.status === true).length,
      draft: products.filter((p) => p.status === false).length,
      featured: products.filter((p) => p.is_featured === true).length,
    };
  }, [products]);

  const handleFeaturedChange = async (index) => {
    const actualIndex = products.findIndex(
      (p) => p._id === filteredProducts[index]._id
    );
    const updatedProducts = draftProductService.toggleFeaturedStatus(
      products,
      actualIndex
    );
    setProducts(updatedProducts);

    const productId = filteredProducts[index]._id;
    if (!productId) {
      toast.error("Product not found");
      return;
    }

    setProgress(50);
    try {
      const response = await productApi.updateProductFeatured(
        productId,
        updatedProducts[actualIndex].is_featured
      );

      if (response.data.status === 201) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
        getProducts();
      }
    } catch (error) {
      toast.error("An error occurred while updating the product.");
      console.error(error);
      getProducts();
    } finally {
      setProgress(100);
    }
  };

  const handleStatusChange = async (index) => {
    const actualIndex = products.findIndex(
      (p) => p._id === filteredProducts[index]._id
    );
    const updatedProducts = draftProductService.togglePublishStatus(
      products,
      actualIndex
    );
    setProducts(updatedProducts);

    const productId = filteredProducts[index]._id;
    if (!productId) {
      toast.error("Product not found");
      return;
    }

    setProgress(50);
    try {
      const response = await productApi.updateProductStatus(
        productId,
        updatedProducts[actualIndex].status
      );

      if (response.data.status === 201) {
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
        getProducts();
      }
    } catch (error) {
      toast.error("An error occurred while updating the product status.");
      console.error(error);
      getProducts();
    } finally {
      setProgress(100);
    }
  };

  const handleDuplicate = async (id) => {
    setProgress(50);
    try {
      const response = await productApi.duplicateProduct(id);

      if (response.data.status === 201) {
        getProducts();
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred while duplicating the product.");
      console.error(error);
    } finally {
      setProgress(100);
    }
  };

  const handleDelete = async (id) => {
    setProgress(50);
    try {
      const response = await productApi.deleteProduct(id);

      if (response.data.status === 201) {
        getProducts();
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred while deleting the product.");
      console.error(error);
    } finally {
      setProgress(100);
      setDeleteConfirm(null);
    }
  };

  const handlePreview = async (productId) => {
    setPreviewLoading(true);
    setProgress(50);
    try {
      const response = await productApi.getProduct(productId);
      if (response.data.status === 201) {
        setPreviewProduct(response.data.product);
        setIsPreviewOpen(true);
      } else {
        toast.error("Failed to load product preview");
      }
    } catch (error) {
      console.error("Error loading preview:", error);
      toast.error("An error occurred while loading the preview.");
    } finally {
      setPreviewLoading(false);
      setProgress(100);
    }
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewProduct(null);
  };

  const getProducts = useCallback(async () => {
    setLoading(true);
    setProgress(50);
    try {
      const response = await productApi.getDraftProducts();

      if (response.data.status === 201) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("An error occurred while fetching products.");
      console.error(error);
    } finally {
      setProgress(100);
      setLoading(false);
    }
  }, [productApi]);

  useEffect(() => {
    getProducts();
  }, [getProducts]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <Helmet>
        <title>Draft Products</title>
      </Helmet>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <Side
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="py-5">
          <div className="px-4 sm:px-6 lg:px-8">
            <ProductTab
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 my-6">
              <div
                onClick={() => setFilterStatus("all")}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                  filterStatus === "all"
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CubeIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.total}
                    </p>
                    <p className="text-sm text-gray-500">Total Products</p>
                  </div>
                </div>
              </div>
              <div
                onClick={() => setFilterStatus("published")}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                  filterStatus === "published"
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CheckCircleIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.published}
                    </p>
                    <p className="text-sm text-gray-500">Published</p>
                  </div>
                </div>
              </div>
              <div
                onClick={() => setFilterStatus("draft")}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                  filterStatus === "draft"
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <XCircleIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.draft}
                    </p>
                    <p className="text-sm text-gray-500">Drafts</p>
                  </div>
                </div>
              </div>
              <div
                onClick={() => setFilterStatus("featured")}
                className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${
                  filterStatus === "featured"
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <StarIcon className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {stats.featured}
                    </p>
                    <p className="text-sm text-gray-500">Featured</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products by name, category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <button
                onClick={getProducts}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ArrowPathIcon className="h-5 w-5" />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>

            {/* Products Table/Cards */}
            <div className="mb-10">
              {loading ? (
                <div className="flex items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
                  <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    <p className="text-gray-500 font-medium">
                      Loading products...
                    </p>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
                  <CubeIcon className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    No products found
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {searchQuery || filterStatus !== "all"
                      ? "Try adjusting your search or filter"
                      : "Get started by adding your first product"}
                  </p>
                  {(searchQuery || filterStatus !== "all") && (
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setFilterStatus("all");
                      }}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  {/* Results count */}
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <p className="text-sm text-gray-600">
                      Showing{" "}
                      <span className="font-semibold text-gray-900">
                        {filteredProducts.length}
                      </span>{" "}
                      {filteredProducts.length === 1 ? "product" : "products"}
                      {filterStatus !== "all" && (
                        <span className="ml-1">
                          ({filterStatus})
                        </span>
                      )}
                    </p>
                  </div>

                  {/* Mobile Card View */}
                  <div className="block md:hidden p-4 space-y-4">
                    {filteredProducts.map((product, index) => (
                      <DraftProductCard
                        key={product._id}
                        product={product}
                        index={index}
                        auth={auth}
                        onFeaturedChange={handleFeaturedChange}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                        onPreview={handlePreview}
                      />
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Product
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Variants
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Featured
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredProducts.map((product, index) => (
                          <tr
                            key={product._id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            {/* Product Info */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                <div className="h-14 w-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                  {product.thumbnail_image ? (
                                    <img
                                      className="h-14 w-14 object-cover"
                                      src={getImageUrl(product.thumbnail_image)}
                                      alt={product.name}
                                      onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://via.placeholder.com/56?text=No+Image";
                                      }}
                                    />
                                  ) : (
                                    <div className="h-14 w-14 flex items-center justify-center">
                                      <CubeIcon className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium text-gray-900 truncate max-w-[200px]">
                                    {product.name}
                                  </p>
                                  <p className="text-sm text-gray-500 truncate max-w-[200px]">
                                    {product.condition || "No condition"}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* Category */}
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {product.category || "Uncategorized"}
                              </span>
                            </td>

                            {/* Variants */}
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                {product.variantValues?.length || 0} variants
                              </span>
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleStatusChange(index)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                                  product.status
                                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                    : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                                }`}
                              >
                                {product.status ? (
                                  <>
                                    <CheckCircleIcon className="h-4 w-4" />
                                    Published
                                  </>
                                ) : (
                                  <>
                                    <XCircleIcon className="h-4 w-4" />
                                    Draft
                                  </>
                                )}
                              </button>
                            </td>

                            {/* Featured */}
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => handleFeaturedChange(index)}
                                className={`p-2 rounded-lg transition-colors ${
                                  product.is_featured
                                    ? "bg-yellow-100 text-yellow-600 hover:bg-yellow-200"
                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                }`}
                                title={product.is_featured ? "Remove from featured" : "Add to featured"}
                              >
                                <StarIcon
                                  className={`h-5 w-5 ${
                                    product.is_featured ? "fill-yellow-500" : ""
                                  }`}
                                />
                              </button>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <Link
                                  to={`/admin/preview-product/${product.producturl || product._id}`}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Preview"
                                >
                                  <EyeIcon className="h-5 w-5" />
                                </Link>
                                <Link
                                  to={`/admin/edit-product/${product._id}`}
                                  className="p-2 text-gray-500 hover:text-primary hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <PencilSquareIcon className="h-5 w-5" />
                                </Link>
                                <button
                                  onClick={() => handleDuplicate(product._id)}
                                  className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                  title="Duplicate"
                                >
                                  <DocumentDuplicateIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(product._id)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Product
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? All data associated
              with this product will be permanently removed.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Preview Modal */}
      <ProductPreviewModal
        isOpen={isPreviewOpen}
        onClose={closePreview}
        product={previewProduct}
        backendUrl={auth.ip}
      />
    </>
  );
};

export default DraftProducts;
