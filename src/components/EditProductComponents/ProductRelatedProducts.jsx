import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/Auth";

export default function ProductRelatedProducts({ productId }) {
  const auth = useAuth();
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Debounce timer ref
  const debounceTimerRef = useRef(null);

  // Fetch related products for this product
  const fetchRelatedProducts = async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${auth.ip}get/product/related/${productId}`
      );
      if (response.data.status === 201 || response.data.status === 200) {
        setRelatedProducts(response.data.relatedProducts || []);
      } else {
        setRelatedProducts([]);
      }
    } catch (error) {
      console.error("Error fetching related products:", error);
      setRelatedProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatedProducts();
  }, [productId]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Search function
  const performSearch = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await axios.get(
        `${auth.ip}get/all/product/adminpage/v2?searchname=${encodeURIComponent(query)}`
      );
      if (response.data.status === 201 || response.data.status === 200) {
        // Filter out current product and already added related products
        const existingIds = relatedProducts.map((p) => p.relatedProductId || p._id);
        const filtered = (response.data.products || []).filter(
          (p) => p._id !== productId && !existingIds.includes(p._id)
        );
        setSearchResults(filtered);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error("Error searching products:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [productId, relatedProducts, auth.ip]);

  // Debounced search function
  const searchProducts = useCallback((query) => {
    // Clear any existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      performSearch(query);
    }, 500);
  }, [performSearch]);

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    searchProducts(query);
  };

  // Add related product
  const handleAddRelatedProduct = async (product) => {
    try {
      const response = await axios.post(`${auth.ip}post/product/related`, {
        productId: productId,
        relatedProductId: product._id,
        relatedProductName: product.name,
        relatedProductImage: product.thumbnail_image?.path || product.Gallery_Images?.[0]?.path || "",
        relatedProductBrand: product.brand || "",
        relatedProductCondition: product.condition || "",
      });

      if (response.status === 201 || response.status === 200) {
        toast.success("Related product added successfully!");
        fetchRelatedProducts();
        setSearchQuery("");
        setSearchResults([]);
        setShowSearchResults(false);
      } else {
        toast.error("Failed to add related product.");
      }
    } catch (error) {
      console.error("Error adding related product:", error);
      toast.error("An error occurred while adding the related product.");
    }
  };

  // Remove related product
  const handleRemoveRelatedProduct = async (relatedId) => {
    if (window.confirm("Are you sure you want to remove this related product?")) {
      try {
        const response = await axios.delete(
          `${auth.ip}delete/product/related/${relatedId}`
        );
        if (response.status === 200) {
          toast.success("Related product removed successfully!");
          fetchRelatedProducts();
        } else {
          toast.error(response.data.message || "Failed to remove the related product.");
        }
      } catch (error) {
        console.error("Error removing related product:", error);
        toast.error("An error occurred while removing the related product.");
      }
    }
  };

  // Move related product up/down
  const moveRelatedProduct = async (index, direction) => {
    const newRelatedProducts = [...relatedProducts];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newRelatedProducts.length) return;

    // Swap
    [newRelatedProducts[index], newRelatedProducts[targetIndex]] = [
      newRelatedProducts[targetIndex],
      newRelatedProducts[index],
    ];
    setRelatedProducts(newRelatedProducts);

    // Update order in backend
    try {
      await axios.post(`${auth.ip}reorder/product/related`, {
        productId: productId,
        relatedOrder: newRelatedProducts.map((rp, idx) => ({
          id: rp._id,
          order: idx,
        })),
      });
    } catch (error) {
      console.error("Error reordering related products:", error);
      // Revert on error
      fetchRelatedProducts();
    }
  };

  // Get product image URL
  const getProductImage = (product) => {
    if (product.relatedProductImage) {
      return `${auth.ip}${product.relatedProductImage}`;
    }
    if (product.thumbnail_image?.path) {
      return `${auth.ip}${product.thumbnail_image.path}`;
    }
    if (product.Gallery_Images?.[0]?.path) {
      return `${auth.ip}${product.Gallery_Images[0].path}`;
    }
    return null;
  };

  const totalRelatedProducts = relatedProducts.length;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Related Products</h2>
          <p className="text-sm text-gray-500 mt-1">
            Add products that are related to this product
          </p>
        </div>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalRelatedProducts}</div>
          <div className="text-sm text-gray-500">Related Products</div>
        </div>
      </div>

      {/* Search Box */}
      <div className="relative mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search & Add Related Products
        </label>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search products by name (min 3 characters)..."
            className="w-full border border-gray-300 rounded-lg p-3 pl-10 focus:ring-primary focus:border-primary"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          {isSearching && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
            </div>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && searchResults.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {searchResults.map((product) => (
              <div
                key={product._id}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleAddRelatedProduct(product)}
              >
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {product.thumbnail_image?.path ? (
                    <img
                      src={`${auth.ip}${product.thumbnail_image.path}`}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6 text-gray-400"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {product.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {product.brand && (
                      <span className="text-xs text-gray-500">{product.brand}</span>
                    )}
                    {product.condition && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        {product.condition}
                      </span>
                    )}
                  </div>
                </div>
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.5v15m7.5-7.5h-15"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {showSearchResults && searchQuery.length >= 3 && searchResults.length === 0 && !isSearching && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-center text-gray-500">
            No products found matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Related Products List */}
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading related products...</p>
        </div>
      ) : relatedProducts.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-12 h-12 mx-auto text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
            />
          </svg>
          <p className="mt-2 text-gray-500">No related products added yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            Use the search box above to find and add related products.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {relatedProducts.map((rp, index) => (
            <div
              key={rp._id || index}
              className="flex items-center gap-4 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              {/* Product Image */}
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                {getProductImage(rp) ? (
                  <img
                    src={getProductImage(rp)}
                    alt={rp.relatedProductName || rp.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-8 h-8 text-gray-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                      />
                    </svg>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-primary font-semibold">#{index + 1}</span>
                </div>
                <h4 className="font-medium text-gray-900 truncate">
                  {rp.relatedProductName || rp.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  {(rp.relatedProductBrand || rp.brand) && (
                    <span className="text-xs text-gray-500">
                      {rp.relatedProductBrand || rp.brand}
                    </span>
                  )}
                  {(rp.relatedProductCondition || rp.condition) && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {rp.relatedProductCondition || rp.condition}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Move Up */}
                <button
                  onClick={() => moveRelatedProduct(index, "up")}
                  disabled={index === 0}
                  className={`p-1 rounded ${
                    index === 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                  title="Move Up"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m4.5 15.75 7.5-7.5 7.5 7.5"
                    />
                  </svg>
                </button>
                {/* Move Down */}
                <button
                  onClick={() => moveRelatedProduct(index, "down")}
                  disabled={index === relatedProducts.length - 1}
                  className={`p-1 rounded ${
                    index === relatedProducts.length - 1
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }`}
                  title="Move Down"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m19.5 8.25-7.5 7.5-7.5-7.5"
                    />
                  </svg>
                </button>
                {/* Delete */}
                <button
                  onClick={() => handleRemoveRelatedProduct(rp._id)}
                  className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                  title="Remove"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
