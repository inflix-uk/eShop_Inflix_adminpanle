import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import Side from "../nav/Side";
import Top from "../nav/Top";
import ProductTab from "./ProductTab";
import LoadingBar from "react-top-loading-bar";
import { useAuth } from "../../../context/Auth";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import ProductApi from "./api/productApi";
import DeletedProductService from "./service/deletedProductService";
import DeletedProductCard from "./Components/allProducts/DeletedProductCard";
import {
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ArchiveBoxXMarkIcon,
  ArrowUturnLeftIcon,
  CubeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

export default function DeletedProducts() {
  const auth = useAuth();

  // Initialize API and Service with useMemo to prevent recreation on every render
  const productApi = useMemo(() => new ProductApi(), []);
  const deletedProductService = useMemo(() => new DeletedProductService(), []);

  const [selectedPage, setSelectedPage] = useState("deleted-products");
  const [selectedTab, setSelectedTab] = useState("deleted-products");
  const [progress, setProgress] = useState(0);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);

  // Variant modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Helper to get image URL
  const getImageUrl = useCallback(
    (image) => {
      if (!image) return "";
      if (image.url) return image.url;
      if (image.path && auth?.ip) {
        const baseUrl = auth.ip.endsWith("/") ? auth.ip.slice(0, -1) : auth.ip;
        const imagePath = image.path.startsWith("/")
          ? image.path
          : `/${image.path}`;
        return `${baseUrl}${imagePath}`;
      }
      return "";
    },
    [auth?.ip]
  );

  // Use service for filtering products
  const filteredProducts = useMemo(
    () => deletedProductService.filterProducts(products, searchQuery),
    [products, searchQuery, deletedProductService]
  );

  // Use service for pagination
  const totalPages = useMemo(
    () =>
      deletedProductService.calculateTotalPages(
        filteredProducts.length,
        itemsPerPage
      ),
    [filteredProducts.length, itemsPerPage, deletedProductService]
  );

  const paginatedProducts = useMemo(
    () =>
      deletedProductService.getPaginatedProducts(
        filteredProducts,
        currentPage,
        itemsPerPage
      ),
    [filteredProducts, currentPage, itemsPerPage, deletedProductService]
  );

  // Handle rows per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = useCallback(
    (newPage) => {
      if (deletedProductService.isValidPage(newPage, totalPages)) {
        setCurrentPage(newPage);
      }
    },
    [totalPages, deletedProductService]
  );

  // Handle search input change
  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  }, []);

  // Fetch deleted products
  const getDeletedProducts = useCallback(async () => {
    setLoading(true);
    setProgress(50);
    try {
      const response = await productApi.getDeletedProducts();

      if (response.data.status === 201) {
        setProducts(response.data.deletedProducts);
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

  const handleFeaturedChange = useCallback(
    async (index) => {
      const actualIndex = products.findIndex(
        (p) => p._id === paginatedProducts[index]._id
      );
      const updatedProducts = deletedProductService.toggleFeaturedStatus(
        products,
        actualIndex
      );
      setProducts(updatedProducts);

      const productId = paginatedProducts[index]._id;
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
          getDeletedProducts();
        }
      } catch (error) {
        toast.error("An error occurred while updating the product.");
        console.error(error);
        getDeletedProducts();
      } finally {
        setProgress(100);
      }
    },
    [products, paginatedProducts, productApi, deletedProductService, getDeletedProducts]
  );

  const handleStatusChange = useCallback(
    async (index) => {
      const actualIndex = products.findIndex(
        (p) => p._id === paginatedProducts[index]._id
      );
      const updatedProducts = deletedProductService.togglePublishStatus(
        products,
        actualIndex
      );
      setProducts(updatedProducts);

      const productId = paginatedProducts[index]._id;
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
          getDeletedProducts();
        }
      } catch (error) {
        toast.error("An error occurred while updating the product status.");
        console.error(error);
        getDeletedProducts();
      } finally {
        setProgress(100);
      }
    },
    [products, paginatedProducts, productApi, deletedProductService, getDeletedProducts]
  );

  const handleDuplicate = useCallback(
    async (id) => {
      setProgress(50);
      try {
        const response = await productApi.duplicateProduct(id);

        if (response.data.status === 201) {
          getDeletedProducts();
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
    },
    [productApi, getDeletedProducts]
  );

  const handleRestore = useCallback(
    async (id) => {
      setProgress(50);
      try {
        const response = await productApi.restoreProduct(id);

        if (response.data.status === 201) {
          getDeletedProducts();
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error("An error occurred while restoring the product.");
        console.error(error);
      } finally {
        setProgress(100);
      }
    },
    [productApi, getDeletedProducts]
  );

  const handleDelete = useCallback(
    async (id) => {
      setProgress(50);
      try {
        const response = await productApi.permanentDeleteProduct(id);

        if (response.data.status === 201) {
          getDeletedProducts();
          toast.success(response.data.message);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error(
          "An error occurred while permanently deleting the product."
        );
        console.error(error);
      } finally {
        setProgress(100);
        setShowDeleteModal(false);
        setSelectedProductId(null);
      }
    },
    [productApi, getDeletedProducts]
  );

  useEffect(() => {
    getDeletedProducts();
  }, [getDeletedProducts]);

  const handleOpenModal = (productId) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

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
        <title>Deleted Products</title>
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

            {/* Header with Stats */}
            <div className="my-6">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-100 rounded-xl">
                      <ArchiveBoxXMarkIcon className="h-8 w-8 text-red-600" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        Deleted Products
                      </h1>
                      <p className="text-sm text-gray-600 mt-1">
                        {products.length} product{products.length !== 1 ? "s" : ""} in trash
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/60 px-4 py-2 rounded-lg">
                    <svg
                      className="h-5 w-5 text-amber-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <span>Products here can be restored or permanently deleted</span>
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
                  placeholder="Search deleted products by name, category..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                />
              </div>
              <button
                onClick={getDeletedProducts}
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
                      Loading deleted products...
                    </p>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-gray-200">
                  <ArchiveBoxXMarkIcon className="h-16 w-16 text-gray-300 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {searchQuery ? "No matching products found" : "Trash is empty"}
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {searchQuery
                      ? "Try adjusting your search query"
                      : "Deleted products will appear here"}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Clear Search
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
                        {paginatedProducts.length}
                      </span>{" "}
                      of{" "}
                      <span className="font-semibold text-gray-900">
                        {filteredProducts.length}
                      </span>{" "}
                      deleted product{filteredProducts.length !== 1 ? "s" : ""}
                    </p>
                  </div>

                  {/* Mobile Card View */}
                  <div className="block md:hidden p-4 space-y-4">
                    {paginatedProducts.map((product, index) => (
                      <DeletedProductCard
                        key={product._id}
                        product={product}
                        index={index}
                        auth={auth}
                        onFeaturedChange={handleFeaturedChange}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                        onDuplicate={handleDuplicate}
                        onRestore={handleRestore}
                        onViewVariants={handleOpenModal}
                        isModalOpen={isModalOpen}
                        selectedProductId={selectedProductId}
                        onCloseModal={handleCloseModal}
                        onOpenDeleteModal={(id) => {
                          setSelectedProductId(id);
                          setShowDeleteModal(true);
                        }}
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
                            Condition
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedProducts.map((product, index) => (
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
                                        e.target.src =
                                          "https://via.placeholder.com/56?text=No+Image";
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
                                    {product.producturl}
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
                              <button
                                onClick={() => handleOpenModal(product._id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                              >
                                <EyeIcon className="h-4 w-4" />
                                {product.variantValues?.length || 0} variants
                              </button>
                            </td>

                            {/* Condition */}
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                {product.condition || "N/A"}
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleRestore(product._id)}
                                  className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Restore"
                                >
                                  <ArrowUturnLeftIcon className="h-5 w-5" />
                                </button>
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
                                  onClick={() => {
                                    setSelectedProductId(product._id);
                                    setShowDeleteModal(true);
                                  }}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete Permanently"
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

                  {/* Pagination */}
                  <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Rows per page:</span>
                        <select
                          value={itemsPerPage}
                          onChange={handleItemsPerPageChange}
                          className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                        >
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">
                          Page {currentPage} of {totalPages || 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronLeftIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <ChevronRightIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Variant Modal */}
      {isModalOpen && selectedProductId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Variant Details
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="max-h-[60vh] overflow-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Variant
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                      Quantity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedProducts
                    .find((p) => p._id === selectedProductId)
                    ?.variantValues?.map((variant, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-6 py-3 font-medium text-gray-900">
                          {variant.name}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <span className="inline-flex items-center gap-1">
                            {variant.Quantity}
                            {variant.Quantity <=
                              (paginatedProducts.find(
                                (p) => p._id === selectedProductId
                              )?.low_stock_quantity_alert || 0) && (
                              <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                                Low
                              </span>
                            )}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCloseModal}
                className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <TrashIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Permanently
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to permanently delete this product? This will
              remove all data associated with this product and it cannot be
              recovered.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedProductId(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedProductId)}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
