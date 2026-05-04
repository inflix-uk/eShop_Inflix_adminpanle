import { React, useState, useEffect, useRef } from "react";
import LoadingBar from "react-top-loading-bar";
import axios from "axios";
import { useAuth } from "../../context/Auth";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
export default function ProductCategories() {
  const auth = useAuth();
  const toastShownRef = useRef(false);
  const [errState, setErrState] = useState();
  const [progress, setProgress] = useState(0);

  const [isEdit, setisEdit] = useState(false);

  const [categories, setCategories] = useState([]);

  // Add Product to Display Modal States
  const [addProductModal, setAddProductModal] = useState(false);
  const [selectedCategoryForProducts, setSelectedCategoryForProducts] = useState(null);
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

  // Loading state for saving
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  useEffect(() => {
    getCategories();
  }, []);

  const [inputFields, setInputFields] = useState([{ id: 1, value: null }]);

  const handleAddField = () => {
    const newField = { id: Date.now(), value: '' };
    setInputFields([...inputFields, newField]);
  };

  const handleRemoveField = (id) => {
    const newInputFields = inputFields.filter((field) => field.id !== id);
    const selectedCategory = categories.find((cat) => cat._id === selectedCategoryId);
    const subCategories = selectedCategory.subCategory || [];
    const newSubCategories = subCategories.filter((subCategory, index) => index !== id - 1);
    selectedCategory.subCategory = newSubCategories;
    setInputFields(newInputFields);
  };
  const handleInputChange = (id, value) => {
    // Process the value: remove trailing spaces and replace internal spaces with hyphens
    const processedValue = value.trimEnd().replace(/\s+/g, '-');

    const newInputFields = inputFields.map((field) =>
      field.id === id ? { ...field, value: processedValue } : field
    );

    const selectedCategory = categories.find((cat) => cat._id === selectedCategoryId);
    const subCategories = selectedCategory.subCategory || [];
    const fieldIndex = inputFields.findIndex(field => field.id === id);

    if (fieldIndex !== -1) {
      subCategories[fieldIndex] = processedValue;
      selectedCategory.subCategory = subCategories;
    }

    setInputFields(newInputFields);
  };
  const [subCategoryModal, setSubCategoryModal] = useState(false)
  const closeSubCategoryModal = () => {
    setSubCategoryModal(false);
  };
  const [selectedCategoryId, setSelectedCategoryId] = useState(false)
  const handleOpenModal = (categoryId) => {
    const selectedCategory = categories.find((cat) => cat._id === categoryId);
    const subCategories = selectedCategory.subCategory || [];

    const newInputFields = subCategories.map((subCategory, index) => ({
      id: index + 1,
      value: subCategory,
    }));
    if (newInputFields.length === 0) {
      newInputFields.push({ id: 1, value: '' });
    }
    setInputFields(newInputFields);
    setSelectedCategoryId(categoryId);
    setSubCategoryModal(true);
    setisEdit(false);
  };
  const handleDelete = (id) => {
    setProgress(50);
    axios
      .delete(`${auth.ip}delete/product/category/${id}`)
      .then((response) => {
        if (response.data.status === 201) {
          // toast.success(response.data.message);
          setErrState(false);
          getCategories();
          setProgress(100);
        } else {
          setErrState(true);
          setProgress(100);
        }
      });
  };

  const handleFeaturedChange = (index) => {
    const updatedCategories = [...categories];
    updatedCategories[index].isFeatured = !updatedCategories[index].isFeatured;
    setCategories(updatedCategories);
    setProgress(50);
    axios
      .patch(
        `${auth.ip}feature/product/category/${categories[index]._id}`,
        {
          isFeatured: updatedCategories[index].isFeatured,
        }
      )
      .then((response) => {
        if (response.data.status === 201) {
          toast.success(response.data.message);
          setErrState(false);
          getCategories();
          setProgress(100);
        } else {
          toast.error(response.data.message);
          setErrState(true);
          setProgress(100);
        }
      });
  };

  const handleStatusChange = (index) => {
    const updatedCategories = [...categories];
    updatedCategories[index].isPublish = !updatedCategories[index].isPublish;
    setCategories(updatedCategories);
    setProgress(50);
    axios
      .patch(
        `${auth.ip}status/product/category/${categories[index]._id}`,
        { isPublish: updatedCategories[index].isPublish }
      )
      .then((response) => {
        if (response.data.status === 201) {
          toast.success(response.data.message);
          setErrState(false);
          getCategories();
          setProgress(100);
        } else {
          toast.error(response.data.message);
          setErrState(true);
          setProgress(100);
        }
      });
  };

  function addSubCategories(categoryId) {
    const subCategoriesData = inputFields.map((field) => (
      field.value));
    axios.post(`${auth.ip}product/subcategory`, {
      categoryId,
      subCategories: subCategoriesData,
    }).then((response) => {

      if (response.data.status === 201) {
        if (!toastShownRef.current) {
          toastShownRef.current = true;
        }
        setErrState(false);
        setProgress(100);
        // Reset inputFields and close the modal
        setInputFields([]);
        setSubCategoryModal(false);
      } else {
        toast.error(response.data.message);
        setErrState(true);
        setProgress(100);
      }
    });
  }
  function getCategories() {
    setProgress(50);
    setIsLoadingCategories(true);
    axios.get(`${auth.ip}get/product/category`).then((response) => {
      console.log('Product Categories', response.data.productCategories);
      if (response.data.status === 201) {
        if (!toastShownRef.current) {
          // toast.success(response.data.message);
          toastShownRef.current = true;
        }
        setErrState(false);
        setCategories(response.data.productCategories);
        console.log(response.data.productCategories);
        setProgress(100);
      } else {
        toast.error(response.data.message);
        setErrState(true);
        setProgress(100);
      }
    }).finally(() => {
      setIsLoadingCategories(false);
    });
  }

  // Open Add Product to Display Modal
  const handleOpenAddProductModal = async (category) => {
    setSelectedCategoryForProducts(category);
    setAddProductModal(true);
    setProductSearchQuery('');
    setSearchedProducts([]);
    setSelectedProducts([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalCount(0);

    // Load existing display products for this category
    setIsLoadingExisting(true);
    try {
      const response = await axios.get(`${auth.ip}category/display-products/${category._id}`);
      if (response.data.status === 200 && response.data.data.products) {
        setSelectedProducts(response.data.data.products);
      }
    } catch (error) {
      console.error('Error loading existing display products:', error);
    } finally {
      setIsLoadingExisting(false);
    }
  };

  // Close Add Product to Display Modal
  const handleCloseAddProductModal = () => {
    setAddProductModal(false);
    setSelectedCategoryForProducts(null);
    setProductSearchQuery('');
    setSearchedProducts([]);
    setSelectedProducts([]);
    setCurrentPage(1);
    setTotalPages(1);
    setTotalCount(0);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  // Search products by category with pagination
  const searchProductsByCategory = async (searchTerm, page = 1) => {
    if (!selectedCategoryForProducts) return;

    setIsSearching(true);
    try {
      const response = await axios.get(`${auth.ip}get/products/by/category/search`, {
        params: {
          category: selectedCategoryForProducts.name,
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
    setCurrentPage(1); // Reset to first page on new search

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search
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

  // Search with custom limit (used when changing items per page)
  const searchProductsByCategoryWithLimit = async (searchTerm, page, limit) => {
    if (!selectedCategoryForProducts) return;

    setIsSearching(true);
    try {
      const response = await axios.get(`${auth.ip}get/products/by/category/search`, {
        params: {
          category: selectedCategoryForProducts.name,
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
      toast.error('Failed to search products');
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

  // Load products when modal opens
  useEffect(() => {
    if (addProductModal && selectedCategoryForProducts) {
      searchProductsByCategory('', 1);
    }
  }, [addProductModal, selectedCategoryForProducts]);

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
    try {
      const response = await axios.post(`${auth.ip}category/display-products`, {
        categoryId: selectedCategoryForProducts._id,
        categoryName: selectedCategoryForProducts.name,
        products: selectedProducts
      });

      if (response.data.status === 200 || response.data.status === 201) {
        toast.success(`${selectedProducts.length} product(s) saved for display`);
        handleCloseAddProductModal();
        getCategories(); // Refresh categories to update display products count
      } else {
        toast.error(response.data.message || 'Failed to save display products');
      }
    } catch (error) {
      console.error('Error saving display products:', error);
      toast.error('Failed to save display products');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      {/* <Toast err={err} errState={errState} /> */}

      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          {/* <h2 className="text-lg font-bold  text-gray-900">Categories</h2> */}
        </div>
      </div>
      <div className="flow-root">
        <div className="">
          <div className="py-2">
            <div className="overflow-x-auto scrollbar-thin scrollbar-webkit shadow rounded-md border border-gray-200">
              <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-black uppercase border-b border-gray-200">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-4 max-w-60 font-bold"
                    >
                      Name
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 max-w-60 font-bold"
                    >
                      Icon
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 max-w-60 font-bold"
                    >
                      Banner
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 max-w-60 font-bold"
                    >
                      Featured
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 max-w-60 font-bold"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 max-w-60 font-bold text-center"
                    >
                      Display Products
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-4 w-full flex justify-end items-center font-bold gap-3"
                    >
                      <Link
                        to={'/admin/product-central/add-new-category'}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors duration-150 shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Category
                      </Link>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {isLoadingCategories ? (
                    <tr>
                      <td colSpan="7" className="py-12">
                        <div className="flex flex-col items-center justify-center">
                          <svg className="animate-spin h-10 w-10 text-emerald-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-gray-500 text-sm font-medium">Loading categories...</p>
                        </div>
                      </td>
                    </tr>
                  ) : categories.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-12">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <svg className="w-12 h-12 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-sm font-medium">No categories found</p>
                        </div>
                      </td>
                    </tr>
                  ) : categories.map((product, index) => (
                    <tr key={index}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                        {product.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {product.Logo && (
                          <img
                            className="h-10 rounded-md"
                            src={product.Logo.url || `${auth.ip}${product.Logo.path}`}
                            alt="logo"
                          />
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {product.bannerImage && (
                          <img
                            className="h-10 rounded-md"
                            src={product.bannerImage.url || `${auth.ip}${product.bannerImage.path}`}
                            alt="banner"
                          />
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            value=""
                            checked={product.isFeatured}
                            onChange={() => handleFeaturedChange(index)}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                        </label>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <label className="inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={product.isPublish}
                            onChange={() => handleStatusChange(index)}
                            className="sr-only peer"
                          />
                          <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
                        </label>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-center">
                        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.displayProductsCount > 0
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {product.displayProductsCount || 0}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <div className="flex justify-center items-center w-full gap-4">
                          <Link
                            to={`/admin/product-central/category-display-products/${product._id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-100 px-3 py-2 text-sm font-medium text-indigo-700 hover:bg-indigo-200 transition-colors duration-150 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add to Display
                          </Link>
                          <button
                            onClick={() => handleOpenModal(product._id)}
                            type="button"
                            className="inline-flex items-center gap-1.5 rounded-lg bg-teal-100 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-200 transition-colors duration-150 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                            </svg>
                            Add Sub-Category
                          </button>
                          <Link
                            to={`/admin/product-central/edit-category/${product._id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-100 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-200 transition-colors duration-150 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit
                          </Link>
                          <button
                            onClick={() => {
                              handleDelete(product._id);
                              console.log(product._id);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-200 transition-colors duration-150 shadow-sm"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      {subCategoryModal && (
        <div className="fixed inset-0 z-40 flex justify-center items-center bg-black bg-opacity-50 overflow-y-auto ">
          <div
            id="crud-modal"
            className="relative p-4 w-full max-w-lg max-h-full"
          >
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-200">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Sub Category for {categories.find((cat) => cat._id === selectedCategoryId).name}
                </h3>
                <button
                  onClick={() => {
                  setSubCategoryModal(false);
                  }}
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-blue-200 hover:text-blue-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
                  data-modal-toggle="crud-modal"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    ></path>
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="overflow-auto  max-h-[calc(100vh-150px)] scrollbar-thin scrollbar-webkit" style={{ height: 'auto' }}>
                <form className="p-4 md:p-5" >
                  <div className="grid gap-2 mb-4">
                    {inputFields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-12 gap-2 mb-2">
                        <div className="col-span-11">
                          <input
                            type="text"
                            name={`name-${field.id}`}
                            id={`name-${field.id}`}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5 dark:border-gray-500 dark:placeholder-gray-400 dark:focus:ring-primary dark:focus:border-primary"
                            placeholder="Add Sub-Category"
                            value={field.value}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                          />
                        </div>
                        <div className="col-span-1 flex items-center">
                          {index === 0 ? (
                            <h1 className="text-3xl cursor-pointer hover:text-primary" onClick={handleAddField}>+</h1>
                          ) : (
                            <h1 className="text-3xl cursor-pointer hover:text-red-600" onClick={() => handleRemoveField(field.id)}>-</h1>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="text-white inline-flex items-center bg-primary hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary dark:hover:bg-primary dark:focus:ring-blue-800"
                    onClick={(e) => {
                      e.preventDefault();
                      addSubCategories(selectedCategoryId);
                    }}
                  >
                    Submit
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Product to Display Modal */}
      {addProductModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 overflow-y-auto">
          <div className="relative p-4 w-full max-w-4xl max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add Product to Display - {selectedCategoryForProducts?.name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1">
                    <p className="text-sm text-gray-500">
                      Total Products: {totalCount} | Page {currentPage} of {totalPages}
                    </p>
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-500">Show:</label>
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
                <button
                  onClick={handleCloseAddProductModal}
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-4 border-b">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 20"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={productSearchQuery}
                    onChange={handleProductSearchChange}
                    className="block w-full p-3 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-primary focus:border-primary"
                    placeholder={`Search products in ${selectedCategoryForProducts?.name}...`}
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
                {selectedProducts.length > 0 && (
                  <div className="mt-2 text-sm text-primary font-medium">
                    {selectedProducts.length} product(s) selected
                  </div>
                )}
              </div>

              {/* Products List */}
              <div className="overflow-auto max-h-[calc(100vh-350px)] scrollbar-thin scrollbar-webkit p-4">
                {isLoadingExisting && (
                  <div className="text-center py-8">
                    <svg className="animate-spin h-8 w-8 text-primary mx-auto mb-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-500">Loading existing products...</p>
                  </div>
                )}
                {!isLoadingExisting && searchedProducts.length === 0 && !isSearching ? (
                  <div className="text-center py-8 text-gray-500">
                    No products found in this category
                  </div>
                ) : !isLoadingExisting && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {searchedProducts.map((product) => {
                      const isSelected = selectedProducts.some(p => p._id === product._id);
                      return (
                        <div
                          key={product._id}
                          onClick={() => toggleProductSelection(product)}
                          className={`cursor-pointer border rounded-lg p-3 transition-all duration-200 ${
                            isSelected
                              ? 'border-primary bg-blue-50 ring-2 ring-primary'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Checkbox */}
                            <div className="flex-shrink-0 mt-1">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
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
                            {product.thumbnail_image && (
                              <img
                                src={product.thumbnail_image.url || `${auth.ip}${product.thumbnail_image.path}`}
                                alt={product.name}
                                className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                              />
                            )}

                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {product.name}
                              </h4>
                              <div className="mt-1 space-y-0.5">
                                {product.category && (
                                  <p className="text-xs text-gray-500">
                                    <span className="font-medium">Category:</span> {product.category}
                                  </p>
                                )}
                                {product.subCategory && (
                                  <p className="text-xs text-gray-500 truncate">
                                    <span className="font-medium">SubCategory:</span> {product.subCategory}
                                  </p>
                                )}
                                {product.brand && (
                                  <p className="text-xs text-gray-500">
                                    <span className="font-medium">Brand:</span> {product.brand}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                {product.condition && (
                                  <span className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                                    {product.condition}
                                  </span>
                                )}
                                {(product.minSalePrice || product.minPrice) && (
                                  <span className="text-sm font-semibold text-primary">
                                    £{product.minSalePrice || product.minPrice}
                                  </span>
                                )}
                              </div>
                              {/* Stock Information */}
                              {product.stock && (
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${
                                    product.stock.stockStatus === 'in_stock'
                                      ? 'bg-blue-100 text-blue-700'
                                      : product.stock.stockStatus === 'partial_stock'
                                      ? 'bg-yellow-100 text-yellow-700'
                                      : 'bg-red-100 text-red-700'
                                  }`}>
                                    {product.stock.stockStatus === 'in_stock'
                                      ? 'In Stock'
                                      : product.stock.stockStatus === 'partial_stock'
                                      ? 'Partial Stock'
                                      : 'Out of Stock'}
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

              {/* Modal Footer with Pagination */}
              <div className="flex justify-between items-center p-4 border-t">
                <button
                  onClick={handleCloseAddProductModal}
                  type="button"
                  className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-gray-200 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10"
                >
                  Cancel
                </button>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <nav className="flex items-center gap-1">
                    {/* Previous Button */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isSearching}
                      className={`px-2 py-1.5 text-sm font-medium rounded-lg ${
                        currentPage === 1 || isSearching
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>

                    {/* Page Numbers */}
                    {getPageNumbers().map((page, index) => (
                      <button
                        key={index}
                        onClick={() => typeof page === 'number' && handlePageChange(page)}
                        disabled={page === '...' || isSearching}
                        className={`px-2.5 py-1.5 text-sm font-medium rounded-lg min-w-[36px] ${
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
                      className={`px-2 py-1.5 text-sm font-medium rounded-lg ${
                        currentPage === totalPages || isSearching
                          ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                )}

                <button
                  onClick={handleSaveSelectedProducts}
                  type="button"
                  className="text-white bg-primary hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={selectedProducts.length === 0 || isSaving}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    `Save ${selectedProducts.length > 0 ? `(${selectedProducts.length})` : ''} Products to Display`
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
