import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Side from "../nav/Side";
import Top from "../nav/Top";
import LoadingBar from "react-top-loading-bar";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../../context/Auth";
import axios from "axios";
import { toast } from "react-toastify";

export default function CategoryDisplayProducts() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const [selectedPage, setSelectedPage] = useState("product-central-main");
  const [progress, setProgress] = useState(0);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Category info
  const [category, setCategory] = useState(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(true);

  // Product search states
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [searchedProducts, setSearchedProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const itemsPerPageOptions = [20, 50, 100];

  // Loading states
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);

  // Fetch category info
  useEffect(() => {
    if (categoryId) {
      fetchCategoryInfo();
    }
  }, [categoryId]);

  const fetchCategoryInfo = async () => {
    setIsLoadingCategory(true);
    setProgress(30);
    try {
      const response = await axios.get(`${auth.ip}get/product/category`);
      if (response.data.status === 201) {
        const foundCategory = response.data.productCategories.find(
          cat => cat._id === categoryId
        );
        if (foundCategory) {
          setCategory(foundCategory);
          // Load existing display products
          loadExistingDisplayProducts(foundCategory._id);
          // Load products for this category
          searchProductsByCategory('', 1, foundCategory.name);
        } else {
          toast.error('Category not found');
          navigate('/admin/product-central/categories');
        }
      }
    } catch (error) {
      console.error('Error fetching category:', error);
      toast.error('Failed to load category');
    } finally {
      setIsLoadingCategory(false);
      setProgress(100);
    }
  };

  // Load existing display products
  const loadExistingDisplayProducts = async (catId) => {
    setIsLoadingExisting(true);
    try {
      const response = await axios.get(`${auth.ip}category/display-products/${catId}`);
      if (response.data.status === 200 && response.data.data.products) {
        setSelectedProducts(response.data.data.products);
      }
    } catch (error) {
      console.error('Error loading existing display products:', error);
    } finally {
      setIsLoadingExisting(false);
    }
  };

  // Search products by category with pagination
  const searchProductsByCategory = async (searchTerm, page = 1, categoryName = null) => {
    const catName = categoryName || category?.name;
    if (!catName) return;

    setIsSearching(true);
    try {
      const response = await axios.get(`${auth.ip}get/products/by/category/search`, {
        params: {
          category: catName,
          searchname: searchTerm || '',
          page: page,
          limit: itemsPerPage
        }
      });

      if (response.data.status === 200) {
        setSearchedProducts(response.data.products || []);
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.currentPage);
          setTotalPages(response.data.pagination.totalPages);
          setTotalCount(response.data.pagination.totalCount);
        }
      } else {
        setSearchedProducts([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      toast.error('Failed to search products');
      setSearchedProducts([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search input change with debounce
  const handleProductSearchChange = (e) => {
    const value = e.target.value;
    setProductSearchQuery(value);
    setCurrentPage(1);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchProductsByCategory(value, 1);
    }, 300);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      searchProductsByCategory(productSearchQuery, newPage);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    searchProductsByCategoryWithLimit(productSearchQuery, 1, newLimit);
  };

  // Search with custom limit
  const searchProductsByCategoryWithLimit = async (searchTerm, page, limit) => {
    if (!category?.name) return;

    setIsSearching(true);
    try {
      const response = await axios.get(`${auth.ip}get/products/by/category/search`, {
        params: {
          category: category.name,
          searchname: searchTerm || '',
          page: page,
          limit: limit
        }
      });

      if (response.data.status === 200) {
        setSearchedProducts(response.data.products || []);
        if (response.data.pagination) {
          setCurrentPage(response.data.pagination.currentPage);
          setTotalPages(response.data.pagination.totalPages);
          setTotalCount(response.data.pagination.totalCount);
        }
      } else {
        setSearchedProducts([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error searching products:', error);
      setSearchedProducts([]);
      setTotalCount(0);
      setTotalPages(1);
    } finally {
      setIsSearching(false);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  // Toggle product selection
  const toggleProductSelection = (product) => {
    setSelectedProducts(prev => {
      const isAlreadySelected = prev.some(p => p._id === product._id);
      if (isAlreadySelected) {
        return prev.filter(p => p._id !== product._id);
      } else {
        return [...prev, product];
      }
    });
  };

  // Handle save selected products
  const handleSaveSelectedProducts = async () => {
    if (selectedProducts.length === 0) {
      toast.warning('Please select at least one product');
      return;
    }

    setIsSaving(true);
    setProgress(50);
    try {
      const response = await axios.post(`${auth.ip}category/display-products`, {
        categoryId: category._id,
        categoryName: category.name,
        products: selectedProducts
      });

      if (response.data.status === 200 || response.data.status === 201) {
        toast.success(`${selectedProducts.length} product(s) saved for display`);
        setProgress(100);
      } else {
        toast.error(response.data.message || 'Failed to save display products');
        setProgress(100);
      }
    } catch (error) {
      console.error('Error saving display products:', error);
      toast.error('Failed to save display products');
      setProgress(100);
    } finally {
      setIsSaving(false);
    }
  };

  // Get stock status style
  const getStockStatusStyle = (stockStatus) => {
    switch (stockStatus) {
      case 'in_stock':
        return 'bg-blue-100 text-blue-700';
      case 'partial_stock':
        return 'bg-yellow-100 text-yellow-700';
      case 'out_of_stock':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Get stock status label
  const getStockStatusLabel = (stockStatus) => {
    switch (stockStatus) {
      case 'in_stock':
        return 'In Stock';
      case 'partial_stock':
        return 'Partial Stock';
      case 'out_of_stock':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  };

  return (
    <>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <Helmet>
        <title>{category?.name ? `Display Products - ${category.name}` : 'Display Products'}</title>
      </Helmet>
      <Side selectedPage={selectedPage} setSelectedPage={setSelectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="py-6 bg-gray-50/50 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link to="/admin/product-central" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-emerald-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Product Central
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <Link to="/admin/product-central/categories" className="ml-1 text-sm font-medium text-gray-500 hover:text-emerald-600 md:ml-2">
                      Categories
                    </Link>
                  </div>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-emerald-600 md:ml-2">
                      {isLoadingCategory ? 'Loading...' : category?.name || 'Display Products'}
                    </span>
                  </div>
                </li>
              </ol>
            </nav>

            {/* Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Add Products to Display
                  </h1>
                  <p className="mt-1 text-sm text-gray-500">
                    {isLoadingCategory ? 'Loading category...' : `Select products to display for "${category?.name}"`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/admin/product-central/categories"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Categories
                </Link>
                <button
                  onClick={handleSaveSelectedProducts}
                  disabled={selectedProducts.length === 0 || isSaving}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Save {selectedProducts.length > 0 ? `(${selectedProducts.length})` : ''} Products
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-gray-200">
              {/* Search and Stats Bar */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  {/* Search Input */}
                  <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={handleProductSearchChange}
                      className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary"
                      placeholder={`Search products in ${category?.name || 'category'}...`}
                    />
                    {isSearching && (
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-500">
                      Total: <span className="font-medium text-gray-900">{totalCount}</span> products
                    </span>
                    <span className="text-gray-500">
                      Page <span className="font-medium text-gray-900">{currentPage}</span> of <span className="font-medium text-gray-900">{totalPages}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-gray-500">Show:</label>
                      <select
                        value={itemsPerPage}
                        onChange={handleItemsPerPageChange}
                        disabled={isSearching}
                        className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-primary focus:border-primary bg-white"
                      >
                        {itemsPerPageOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Selected count */}
                {selectedProducts.length > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {selectedProducts.length} product(s) selected
                    </span>
                    <button
                      onClick={() => setSelectedProducts([])}
                      className="text-sm text-red-600 hover:text-red-700 font-medium"
                    >
                      Clear selection
                    </button>
                  </div>
                )}
              </div>

              {/* Products Grid */}
              <div className="p-4">
                {isLoadingCategory || isLoadingExisting ? (
                  <div className="text-center py-12">
                    <svg className="animate-spin h-10 w-10 text-primary mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500">Loading products...</p>
                  </div>
                ) : searchedProducts.length === 0 && !isSearching ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-lg font-medium">No products found</p>
                    <p className="text-sm">No products available in this category</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchedProducts.map((product) => {
                      const isSelected = selectedProducts.some(p => p._id === product._id);
                      return (
                        <div
                          key={product._id}
                          onClick={() => toggleProductSelection(product)}
                          className={`cursor-pointer border rounded-xl p-4 transition-all duration-200 ${
                            isSelected
                              ? 'border-primary bg-blue-50 ring-2 ring-primary shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <div className="flex-shrink-0 mt-1">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                isSelected ? 'bg-primary border-primary' : 'border-gray-300'
                              }`}>
                                {isSelected && (
                                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                            </div>

                            {/* Product Image */}
                            <div className="flex-shrink-0">
                              {product.thumbnail_image?.url || product.thumbnail_image?.path ? (
                                <img
                                  src={product.thumbnail_image.url || `${auth.ip}${product.thumbnail_image.path}`}
                                  alt={product.name}
                                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                                />
                              ) : (
                                <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-gray-900 truncate mb-1">
                                {product.name}
                              </h4>

                              <div className="space-y-1 text-xs text-gray-500">
                                {product.brand && (
                                  <p><span className="font-medium">Brand:</span> {product.brand}</p>
                                )}
                                {product.condition && (
                                  <p><span className="font-medium">Condition:</span> {product.condition}</p>
                                )}
                              </div>

                              {/* Price */}
                              <div className="mt-2">
                                {(product.minSalePrice || product.minPrice) && (
                                  <span className="text-base font-bold text-primary">
                                    £{product.minSalePrice || product.minPrice}
                                  </span>
                                )}
                                {product.minPrice && product.minSalePrice && product.minPrice !== product.minSalePrice && (
                                  <span className="ml-2 text-xs text-gray-400 line-through">
                                    £{product.minPrice}
                                  </span>
                                )}
                              </div>

                              {/* Stock Information */}
                              {product.stock && (
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getStockStatusStyle(product.stock.stockStatus)}`}>
                                    {getStockStatusLabel(product.stock.stockStatus)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {product.stock.totalStock} units | {product.stock.variantsInStock}/{product.stock.totalVariants} variants
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-center">
                  <nav className="flex items-center gap-1">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isSearching}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === 1 || isSearching
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Page Numbers */}
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        disabled={page === '...' || isSearching}
                        className={`px-3 py-2 text-sm font-medium rounded-lg min-w-[40px] ${
                          page === currentPage
                            ? 'text-white bg-primary'
                            : page === '...'
                            ? 'text-gray-400 cursor-default'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Next Button */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isSearching}
                      className={`px-3 py-2 text-sm font-medium rounded-lg ${
                        currentPage === totalPages || isSearching
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
