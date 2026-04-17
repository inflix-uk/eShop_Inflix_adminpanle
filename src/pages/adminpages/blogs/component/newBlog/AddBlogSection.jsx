import PropTypes from "prop-types";
import JoditEditor from "jodit-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../../../../context/Auth";

const AddBlogSection = ({
  blogName,
  setblogName,
  blogdesc,
  setblogDesc,
  blogContent,
  setblogContent,
  blogContent1,
  setblogContent1,
  blogImage,
  setblogimage,
  blogImageAlt,
  setblogimagealt,
  blogThumbnailImage,
  setblogthumnailimage,
  blogThumbnailImageAlt,
  setblogthumnailimageAlt,
  config,
  editor,
  editor1,
  handleBlogImage,
  handleBlogThumnailImage,
  selectedProducts,
  setSelectedProducts,
}) => (
  <div className="border-b border-gray-900/10 pb-12">
    <h2 className="text-lg font-bold  text-gray-900">Add Blog</h2>
    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
      {/* Blog Name */}
      <div className="col-span-full">
        <label htmlFor="blogName" className="block text-sm font-medium leading-6 text-gray-900">
          Name <span className="text-red-600">*</span>
        </label>
        <div className="mt-2 w-full">
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary">
            <input
              type="text"
              name="blogName"
              id="blogName"
              autoComplete="blogName"
              className=" block flex-1 border-0 bg-transparent py-1.5 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder="Blog Name"
              value={blogName}
              onChange={(e) => setblogName(e.target.value)}
            />
          </div>
          <span className="text-primary font-medium ">
            https://zextons.co.uk/blog/
            {blogName
              .trim()
              .toLowerCase()
              .replace(/[^a-z0-9\s]/g, "")
              .replace(/\s+/g, "-")
              .replace(/-+/g, "-")}
          </span>
        </div>
      </div>

      {/* Short Description */}
      <div className="col-span-full">
        <label htmlFor="blogDesc" className="block text-sm font-medium leading-6 text-gray-900">
          Short Description <span className="text-red-600">*</span>
        </label>
        <div className="mt-2">
          <textarea
            id="blogDesc"
            name="blogDesc"
            rows="3"
            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
            value={blogdesc}
            onChange={(e) => setblogDesc(e.target.value)}
          />
        </div>
      </div>

      {/* Blog Content1 */}
      <div className="col-span-full">
        <label htmlFor="blogContent1" className="block text-sm font-medium leading-6 text-gray-900">
          Content1
        </label>
        <JoditEditor
          id="blogContent1"
          name="blogContent1"
          className="mt-2"
          config={config}
          ref={editor1}
          value={blogContent1}
          onBlur={(newContent) => setblogContent1(newContent)}
          onChange={(newContent) => setblogContent1(newContent)}
        />
      </div>

      {/* Product Selection */}
      <div className="col-span-full">
        <ProductDropdown 
          selectedProducts={selectedProducts} 
          setSelectedProducts={setSelectedProducts} 
        />
      </div>


      {/* Blog Content */}
      <div className="col-span-full">
        <label htmlFor="blogContent" className="block text-sm font-medium leading-6 text-gray-900">
          Content <span className="text-red-600">*</span>
        </label>
        <JoditEditor
          id="blogContent"
          name="blogContent"
          className="mt-2"
          config={config}
          ref={editor}
          value={blogContent}
          onBlur={(newContent) => setblogContent(newContent)}
          onChange={(newContent) => setblogContent(newContent)}
        />
      </div>


      {/* Blog Image */}
      <div className="col-span-full">
        <label htmlFor="cover-photo" className="block text-sm font-medium leading-6 text-gray-900">
          Blog Image
        </label>
        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
          <div className="text-center">
            {blogImage ? (
              <>
                <img
                  src={URL.createObjectURL(blogImage)}
                  alt="Thumbnail"
                  className="h-12 rounded-md mx-auto"
                  onClick={() => setblogimage(null)}
                />
                <p className="text-xs leading-5 text-red-600 cursor-pointer">
                  Click image to delete
                </p>
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
            <div className="mt-4 flex text-sm leading-6 text-gray-600">
              <label
                htmlFor="blogImage"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary"
              >
                <span>Upload a file</span>
                <input
                  id="blogImage"
                  name="blogImage"
                  type="file"
                  className="sr-only"
                  onChange={handleBlogImage}
                  accept="image/*"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Blog Image Alt */}
      <div className="col-span-full">
        <label htmlFor="blogImgalt" className="block text-sm font-medium leading-6 text-gray-900">
          Blog Image Alt
        </label>
        <div className="mt-2 w-full ">
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary">
            <input
              type="text"
              name="blogImgalt"
              id="blogImgalt"
              autoComplete="blogImgalt"
              className=" block flex-1 border-0 bg-transparent py-1.5 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder="Blog Image Alt"
              value={blogImageAlt}
              onChange={(e) => setblogimagealt(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Blog Thumbnail Image */}
      <div className="col-span-full">
        <label htmlFor="thumbnail-photo" className="block text-sm font-medium leading-6 text-gray-900">
          Blog Thumbnail Image
        </label>
        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
          <div className="text-center">
            {blogThumbnailImage ? (
              <>
                <img
                  src={URL.createObjectURL(blogThumbnailImage)}
                  alt="Thumbnail"
                  className="h-12 rounded-md mx-auto"
                  onClick={() => setblogthumnailimage(null)}
                />
                <p className="text-xs leading-5 text-red-600 cursor-pointer">
                  Click image to delete
                </p>
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
            <div className="mt-4 flex text-sm leading-6 text-gray-600">
              <label
                htmlFor="thumbnail-photo"
                className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary"
              >
                <span>Upload a file</span>
                <input
                  id="thumbnail-photo"
                  name="thumbnail-photo"
                  type="file"
                  className="sr-only"
                  onChange={handleBlogThumnailImage}
                  accept="image/*"
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs leading-5 text-gray-600">
              PNG, JPG, GIF up to 10MB
            </p>
          </div>
        </div>
      </div>

      {/* Blog Thumbnail Image Alt */}
      <div className="col-span-full">
        <label htmlFor="blogthumbnailImgalt" className="block text-sm font-medium leading-6 text-gray-900">
          Blog Thumbnail Image Alt
        </label>
        <div className="mt-2 w-full">
          <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary ">
            <input
              type="text"
              name="blogthumbnailImgalt"
              id="blogthumbnailImgalt"
              autoComplete="blogthumbnailImgalt"
              className=" block flex-1 border-0 bg-transparent py-1.5 pl-2 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
              placeholder="Blog Thumbnail Image Alt"
              value={blogThumbnailImageAlt}
              onChange={(e) => setblogthumnailimageAlt(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Product Dropdown Component
const ProductDropdown = ({ selectedProducts, setSelectedProducts }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const auth = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${auth.ip}get/all/product/for/blog`);
        if (response.data.status === 201) {
          setProducts(response.data.products);
        } else {
          setError("Failed to fetch products");
        }
      } catch (err) {
        setError("Error fetching products: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [auth.ip]);

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchTerm(""); // Clear search term when closing dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const selectedProductsData = selectedProducts && selectedProducts.length > 0 
    ? products.filter(p => selectedProducts.includes(p._id))
    : [];
  
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectProduct = (product) => {
    // Check if product is already selected
    if (selectedProducts.includes(product._id)) {
      // If already selected, remove it
      setSelectedProducts(selectedProducts.filter(id => id !== product._id));
    } else {
      // If not selected, add it
      setSelectedProducts([...selectedProducts, product._id]);
    }
    setSearchTerm(""); // Clear search term after selection
    setIsDropdownOpen(false);
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(id => id !== productId));
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsDropdownOpen(true);
  };

  return (
    <div>
      <label htmlFor="productSearch" className="block text-sm font-medium leading-6 text-gray-900">
        Select Products
      </label>
      <div className="mt-2 relative" ref={dropdownRef}>
        {loading ? (
          <p className="text-sm text-gray-500">Loading products...</p>
        ) : error ? (
          <p className="text-sm text-red-500">{error}</p>
        ) : (
          <>
            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary">
              <input
                type="text"
                id="productSearch"
                name="productSearch"
                className="block w-full rounded-md border-0 py-1.5 pl-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={() => setIsDropdownOpen(true)}
              />
            </div>
            {isDropdownOpen && (
              <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <li 
                      key={product._id} 
                      className={`relative cursor-pointer select-none py-2 pl-3 pr-9 hover:bg-gray-100 ${selectedProducts.includes(product._id) ? 'bg-gray-100' : 'text-gray-900'}`}
                      onClick={() => handleSelectProduct(product)}
                    >
                      <div className="flex items-center">
                        {product.thumbnail_image && (
                          <img 
                            src={`${auth.ip}${product.thumbnail_image.path}`} 
                            alt={product.name}
                            className="h-8 w-8 mr-3 object-cover rounded-md"
                          />
                        )}
                        <span className="block truncate">{product.name}</span>
                        {selectedProducts.includes(product._id) && (
                          <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-primary">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="relative cursor-default select-none py-2 pl-3 pr-9 text-gray-500">
                    No products found
                  </li>
                )}
              </ul>
            )}
          </>
        )}
      </div>
      
      {/* Selected Products Display */}
      {selectedProductsData.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Products ({selectedProductsData.length})</h4>
          <div className="space-y-3">
            {selectedProductsData.map(product => (
              <div key={product._id} className="p-3 border border-gray-200 rounded-md">
                <div className="flex items-start space-x-3">
                  {product.thumbnail_image && (
                    <div className="flex-shrink-0">
                      <img 
                        src={`${auth.ip}${product.thumbnail_image.path}`} 
                        alt={product.name}
                        className="h-16 w-16 object-cover rounded-md border border-gray-200"
                      />
                    </div>
                  )}
                  <div className="flex-grow">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveProduct(product._id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    <div className="mt-1 flex items-center">
                      <p className="text-xs text-gray-500 mr-2">
                        {product.condition}
                      </p>
                      {product.averageRating && (
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="text-xs text-gray-600 ml-1">{product.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-1 flex items-center">
                      {product.minSalePrice ? (
                        <>
                          <p className="text-xs font-medium text-primary">£{product.minSalePrice}</p>
                          {product.minPrice && (
                            <p className="text-xs text-gray-500 line-through ml-2">£{product.minPrice}</p>
                          )}
                        </>
                      ) : (
                        product.minPrice && (
                          <p className="text-xs font-medium text-primary">£{product.minPrice}</p>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

ProductDropdown.propTypes = {
  selectedProducts: PropTypes.array,
  setSelectedProducts: PropTypes.func.isRequired,
};

AddBlogSection.propTypes = {
  blogName: PropTypes.string,
  setblogName: PropTypes.func,
  blogdesc: PropTypes.string,
  setblogDesc: PropTypes.func,
  blogContent: PropTypes.string,
  setblogContent: PropTypes.func,
  blogContent1: PropTypes.string,
  setblogContent1: PropTypes.func,
  blogImage: PropTypes.object,
  setblogimage: PropTypes.func,
  blogImageAlt: PropTypes.string,
  setblogimagealt: PropTypes.func,
  blogThumbnailImage: PropTypes.object,
  setblogthumnailimage: PropTypes.func,
  blogThumbnailImageAlt: PropTypes.string,
  setblogthumnailimageAlt: PropTypes.func,
  config: PropTypes.object,
  editor: PropTypes.object,
  editor1: PropTypes.object,
  handleBlogImage: PropTypes.func,
  handleBlogThumnailImage: PropTypes.func,
  selectedProducts: PropTypes.array,
  setSelectedProducts: PropTypes.func,
};

export default AddBlogSection;
