import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import Side from "../nav/Side";
import Top from "../nav/Top";
import ProductTab from "./ProductTab";
import LoadingBar from "react-top-loading-bar";
import { useAuth } from "../../../context/Auth";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

// Import components
import {
  SearchBar,
  ProductTable,
  VariantModal,
  Pagination,
  BrandsView,
  ImportExportBar,
} from "./Components/allProducts";

// Import API and Service
import ProductApi from "./api/productApi";
import AllProductsService from "./service/allProductsService";
import {
  getBrandDisplayName,
  isUnassignedBrandKey,
  UNASSIGNED_BRAND_KEY,
} from "./constants/brandConstants";
import { TableSkeleton } from "../shared/Skeletons";

export default function NewProducts() {
  const auth = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize API and Service with useMemo to prevent recreation on every render
  const productApi = useMemo(() => new ProductApi(), []);
  const allProductsService = useMemo(() => new AllProductsService(), []);

  const [selectedPage, setSelectedPage] = useState("new-products");
  const [progress, setProgress] = useState(0);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductVariants, setSelectedProductVariants] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Brand filtering states - initialize from URL
  const [brands, setBrands] = useState([]);
  const brandFromUrl = searchParams.get("brand");
  const [selectedBrand, setSelectedBrand] = useState(brandFromUrl);
  const [brandsLoading, setBrandsLoading] = useState(true);
  const [unassignedProductCount, setUnassignedProductCount] = useState(0);
  const [viewMode, setViewMode] = useState(brandFromUrl ? "products" : "brands"); // 'brands' or 'products'

  // Filter and paginate products using service
  const filteredProducts = useMemo(
    () => allProductsService.filterProducts(products, searchQuery),
    [products, searchQuery, allProductsService]
  );

  const { paginatedProducts, totalPages } = useMemo(
    () =>
      allProductsService.paginateProducts(
        filteredProducts,
        currentPage,
        itemsPerPage
      ),
    [filteredProducts, currentPage, itemsPerPage, allProductsService]
  );

  // Event handlers
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Handle featured status change
  const handleFeaturedChange = async (index) => {
    // Get product ID using service
    const productId = allProductsService.getProductIdByIndex(products, index);
    if (!productId) {
      toast.error("Product not found");
      return;
    }

    // Toggle featured status using service
    const updatedProducts = allProductsService.toggleFeaturedStatus(
      products,
      index
    );
    setProducts(updatedProducts);

    setProgress(50);
    try {
      const response = await productApi.updateProductFeatured(
        productId,
        updatedProducts[index].is_featured
      );
      if (response.data.status === 201) {
        toast.success(response.data.message);
        getProducts(false, selectedBrand); // Refresh products
      } else {
        toast.error(response.data.message);
        // Revert on error
        const revertedProducts = allProductsService.toggleFeaturedStatus(
          updatedProducts,
          index
        );
        setProducts(revertedProducts);
      }
    } catch (error) {
      console.error("Error updating featured status:", error);
      toast.error("An error occurred while updating the product.");
      // Revert on error
      const revertedProducts = allProductsService.toggleFeaturedStatus(
        updatedProducts,
        index
      );
      setProducts(revertedProducts);
    } finally {
      setProgress(100);
    }
  };

  // Handle status change
  const handleStatusChange = async (index) => {
    // Get product ID using service
    const productId = allProductsService.getProductIdByIndex(products, index);
    if (!productId) {
      toast.error("Product not found");
      return;
    }

    // Toggle status using service
    const updatedProducts = allProductsService.toggleStatus(products, index);
    setProducts(updatedProducts);

    setProgress(50);
    try {
      const response = await productApi.updateProductStatus(
        productId,
        updatedProducts[index].status
      );
      if (response.data.status === 201) {
        toast.success(response.data.message);
        getProducts(false, selectedBrand); // Refresh products
      } else {
        toast.error(response.data.message);
        // Revert on error
        const revertedProducts = allProductsService.toggleStatus(
          updatedProducts,
          index
        );
        setProducts(revertedProducts);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("An error occurred while updating the product status.");
      // Revert on error
      const revertedProducts = allProductsService.toggleStatus(
        updatedProducts,
        index
      );
      setProducts(revertedProducts);
    } finally {
      setProgress(100);
    }
  };

  // Handle product duplication
  const handleDuplicate = async (id) => {
    setProgress(50);
    try {
      const response = await productApi.duplicateProduct(id);
      if (response.data.status === 201) {
        toast.success(response.data.message);
        getProducts(false, selectedBrand); // Refresh products
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error duplicating product:", error);
      toast.error("An error occurred while duplicating the product.");
    } finally {
      setProgress(100);
    }
  };

  // Handle product deletion
  const handleDelete = async (id) => {
    // Show confirmation dialog
    const confirmed = window.confirm("Are you sure you want to delete this product?");
    if (!confirmed) return;

    setProgress(50);
    try {
      const response = await productApi.deleteProduct(id);
      if (response.data.status === 201) {
        toast.success(response.data.message);
        getProducts(false, selectedBrand); // Refresh products
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("An error occurred while deleting the product.");
    } finally {
      setProgress(100);
    }
  };

  const handleOpenModal = async (productId) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
    setProgress(50);

    try {
      // Fetch variant values for the selected product
      const response = await productApi.getVariantValuesByProductId(productId);

      if (response.data.status === 200) {
        setSelectedProductVariants(response.data.variantValues);
      } else {
        toast.error("Failed to fetch variant details");
        setSelectedProductVariants([]);
      }
    } catch (error) {
      console.error("Error fetching variant values:", error);
      toast.error("An error occurred while fetching variant details");
      setSelectedProductVariants([]);
    } finally {
      setProgress(100);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
    setSelectedProductVariants(null);
  };

  // Brand fetching function - using dedicated API with product counts
  const getBrands = useCallback(async () => {
    setBrandsLoading(true);
    try {
      // Fetch brands with product counts (single optimized API call)
      const response = await productApi.getBrandsWithProductCount();

      if (response.data.status === 200) {
        setBrands(response.data.brands);
        setUnassignedProductCount(response.data.unassignedProductCount || 0);
        console.log(`Loaded ${response.data.totalBrands} brands with ${response.data.totalProducts} total products`);
      } else if (response.data.status === 404) {
        console.error("Brands attribute not found");
        toast.error("Brands not configured in system");
      } else {
        toast.error("Failed to fetch brands");
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("An error occurred while fetching brands");
    } finally {
      setBrandsLoading(false);
    }
  }, [productApi]);

  // Brand selection handler - updates URL
  const handleBrandSelect = (brandName) => {
    console.log("=== Brand Selected ===", brandName);
    setSelectedBrand(brandName);
    setCurrentPage(1);
    setSearchQuery(""); // Clear search when changing brand
    setViewMode("products");
    // Update URL with brand parameter
    setSearchParams({ brand: brandName });
    getProducts(false, brandName);
  };

  // Back to brands handler - clears URL
  const handleBackToBrands = () => {
    setSelectedBrand(null);
    setViewMode("brands");
    setProducts([]);
    setCurrentPage(1);
    setSearchQuery("");
    setSearchParams({});
    getBrands();
  };

  // Fetch products with batch processing
  const getProducts = useCallback(
    (showSuccessMessage = true, brandName = null) => {
      setProgress(50);

      let allProducts = [];
      let skipCount = 0;
      const batchSize = 50;

      const fetchBatch = async () => {
        try {
          const response = await productApi.getAllProductsWithBrand(
            batchSize,
            skipCount,
            brandName
          );

          if (response.data.status === 201) {
            const { products: batchProducts, totalProductsCount } =
              response.data;

            allProducts = [...allProducts, ...batchProducts];
            setProducts(allProducts);
            console.log("Batch Products:", batchProducts);

            skipCount += batchProducts.length;

            if (allProducts.length >= totalProductsCount) {
              console.log("All products retrieved:", allProducts);
              setProgress(100);
              if (showSuccessMessage) {
                // Optional success feedback
              }
            } else {
              setTimeout(fetchBatch, 1000);
            }
          } else {
            toast.error(response.data.message);
            setProgress(100);
          }
        } catch (error) {
          console.error("Error fetching products:", error);
          toast.error("An error occurred while fetching products.");
          setProgress(100);
        }
      };

      fetchBatch();
    },
    [productApi]
  );

  useEffect(() => {
    getBrands();
  }, [getBrands]);

  // Load products if brand is in URL on initial load (after brands are fetched)
  useEffect(() => {
    if (brandFromUrl && !brandsLoading) {
      console.log("=== Loading products for brand from URL ===", brandFromUrl);
      getProducts(false, brandFromUrl);
    }
  }, [brandFromUrl, brandsLoading, getProducts]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Get the selected product for the modal using service
  const selectedProduct = useMemo(() => {
    const product = allProductsService.getProductById(
      products,
      selectedProductId
    );
    if (product && selectedProductVariants) {
      // Merge fetched variant values with product data
      return {
        ...product,
        variantValues: selectedProductVariants,
      };
    }
    return product;
  }, [
    products,
    selectedProductId,
    selectedProductVariants,
    allProductsService,
  ]);

  return (
    <>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <Helmet>
        <title>New Products</title>
      </Helmet>
      <Side
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        toggleSidebar={toggleSidebar}
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />
        <main className="py-5">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Tab Navigation */}
            <div className="mb-1">
              <ProductTab selectedTab="all-products" />
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              {viewMode === "brands" ? (
                <BrandsView
                  brands={brands}
                  brandsLoading={brandsLoading}
                  unassignedProductCount={unassignedProductCount}
                  onBrandSelect={handleBrandSelect}
                  auth={auth}
                  // Bulk CSV controls sit inline with the Brands/Products stats
                  actions={
                    <ImportExportBar
                      compact
                      products={products}
                      onImported={() => getProducts(false, selectedBrand)}
                    />
                  }
                />
              ) : (
                // Products view - existing table layout
                <div className="flow-root overflow-hidden">
                  <div className="block py-2">
                    <div className="flex items-center justify-between mb-3 relative">
                      <button
                        onClick={handleBackToBrands}
                        className="flex items-center text-blue-600 hover:text-blue-700"
                      >
                        <svg
                          className="w-5 h-5 mr-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 19l-7-7 7-7"
                          />
                        </svg>
                        Back
                      </button>
                      <h1 className="text-xl font-bold tracking-tight text-gray-900 absolute left-1/2 transform -translate-x-1/2">
                        {selectedBrand
                          ? `${getBrandDisplayName(selectedBrand)} Products`
                          : "New Products"}
                      </h1>
                      <div className="flex items-center gap-3">
                        <ImportExportBar
                          compact
                          products={products}
                          onImported={() => getProducts(false, selectedBrand)}
                        />
                        {selectedBrand && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            isUnassignedBrandKey(selectedBrand)
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {filteredProducts.length} products
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="relative shadow-lg rounded-lg border border-gray-200 overflow-hidden">
                      <SearchBar
                        searchQuery={searchQuery}
                        onSearchChange={handleSearchChange}
                        totalProducts={filteredProducts.length}
                      />

                      {products.length === 0 ? (
                        <div className="p-4">
                          <TableSkeleton rows={8} columns={7} />
                        </div>
                      ) : (
                        <ProductTable
                          products={paginatedProducts}
                          auth={auth}
                          onFeaturedChange={handleFeaturedChange}
                          onStatusChange={handleStatusChange}
                          onDelete={handleDelete}
                          onDuplicate={handleDuplicate}
                          onViewVariants={handleOpenModal}
                        />
                      )}
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        itemsPerPage={itemsPerPage}
                        onPageChange={handlePageChange}
                        onItemsPerPageChange={handleItemsPerPageChange}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <VariantModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={selectedProduct}
      />
    </>
  );
}
