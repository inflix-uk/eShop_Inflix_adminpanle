// EditBlogSection.jsx
// Extracted main blog edit form fields from EditBlog.jsx
import PropTypes from "prop-types";
import JoditEditor from "jodit-react";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../../../../context/Auth";

const EditBlogSection = ({
  blogName,
  setblogName,
  blogDesc,
  setblogDesc,
  blogContent,
  setblogContent,
  blogContent1,
  setblogContent1,
  selectedProducts,
  setSelectedProducts,
  editor,
  editor1,
  config,
  blogImage,
  setblogimage,
  handleBlogImage,
  blogImageAlt,
  setblogimagealt,
  blogThumbnailImage,
  setblogthumbnailimage,
  handleBlogThumbnailImage,
  blogThumbnailImageAlt,
  setblogthumnailimageAlt,
}) => (
  <>
    <div className="col-span-2">
      <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 ">
        Name <span className="text-red-600">*</span>
      </label>
      <input
        type="text"
        name="name"
        id="name"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5  dark:border-gray-500 dark:placeholder-gray-400  dark:focus:ring-primary dark:focus:border-primary"
        placeholder="Category name"
        value={blogName}
        onChange={(e) => setblogName(e.target.value)}
      />
      <p>
        Slug:{blogName
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9\s]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')}
      </p>
    </div>
    <div className="col-span-2 ">
      <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 ">
        Short Description
      </label>
      <textarea
        id="description"
        rows="4"
        className="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary  dark:border-gray-500 dark:placeholder-gray-400  dark:focus:ring-primary dark:focus:border-primary"
        placeholder="Write Category description here"
        value={blogDesc}
        onChange={(e) => setblogDesc(e.target.value)}
      ></textarea>
    </div>

    <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
      <div className="sm:col-span-3 sm:col-start-1">
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
          onBlur={newContent => setblogContent1(newContent)}
          onChange={newContent => setblogContent1(newContent)}
        />
      </div>
      <div className="sm:col-span-3">
        <ProductDropdown 
          selectedProducts={selectedProducts} 
          setSelectedProducts={setSelectedProducts} 
        />
      </div>
    </div>
    <div className="col-span-2 ">
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
        onBlur={newContent => setblogContent(newContent)}
        onChange={newContent => setblogContent(newContent)}
      />
    </div>

    <div className="col-span-2">
      <label htmlFor="blogContent" className="block text-sm font-medium leading-6 text-gray-900">
        Blog Image: <span className="text-red-600">*</span>
      </label>
      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25  ">
        <div className="text-center">
          {blogImage ? (
            <>
              <img
                src={blogImage instanceof Blob ? URL.createObjectURL(blogImage) : `${blogImage}`}
                alt="Thumbnail"
                className="h-12 rounded-md mx-auto cursor-pointer"
                onClick={() => setblogimage(null)}
              />
              <p className="text-xs text-red-600">Click image to delete</p>
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
          <div className="mt-2 flex text-sm leading-6 text-gray-600">
            <label htmlFor="blogImage" className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary">
              <span>Upload a file</span>
              <input
                id="blogImage"
                name="blogImage"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleBlogImage}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
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
            onChange={e => setblogimagealt(e.target.value)}
          />
        </div>
      </div>
    </div>
    <div className="col-span-2">
      <label htmlFor="blogThumbnail" className="block text-sm font-medium leading-6 text-gray-900">
        Blog Thumbnail Image: <span className="text-red-600">*</span>
      </label>
      <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25  ">
        <div className="text-center">
          {blogThumbnailImage ? (
            <>
              <img
                src={blogThumbnailImage instanceof Blob ? URL.createObjectURL(blogThumbnailImage) : `${blogThumbnailImage}`}
                alt="Thumbnail"
                className="h-12 rounded-md mx-auto cursor-pointer"
                onClick={() => setblogthumbnailimage(null)}
              />
              <p className="text-xs text-red-600">Click image to delete</p>
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
          <div className="mt-2 flex text-sm leading-6 text-gray-600">
            <label htmlFor="blogThumnailImage" className="relative cursor-pointer rounded-md bg-white font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary">
              <span>Upload a file</span>
              <input
                id="blogThumnailImage"
                name="blogThumnailImage"
                type="file"
                className="sr-only"
                accept="image/*"
                onChange={handleBlogThumbnailImage}
              />
            </label>
          </div>
        </div>
      </div>
    </div>
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
            onChange={e => setblogthumnailimageAlt(e.target.value)}
          />
        </div>
      </div>
    </div>
  </>
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
        Select Product
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
            {isDropdownOpen && searchTerm && (
              <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <li 
                      key={product._id} 
                      className="relative cursor-pointer select-none py-2 pl-3 pr-9 text-gray-900 hover:bg-gray-100"
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
      {selectedProductsData.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Selected Products:</p>
          {selectedProductsData.map(product => (
            <div key={product._id} className="mb-3 p-4 border border-gray-200 rounded-md">
              <div className="flex items-start space-x-4">
                {product.thumbnail_image && (
                  <div className="flex-shrink-0">
                    <img 
                      src={`${auth.ip}${product.thumbnail_image.path}`} 
                      alt={product.name}
                      className="h-20 w-20 object-cover rounded-md border border-gray-200"
                    />
                  </div>
                )}
                <div className="flex-grow">
                  <h4 className="text-sm font-medium text-gray-900">{product.name}</h4>
                  <div className="mt-1 flex items-center">
                    <p className="text-sm text-gray-500 mr-2">
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
                        <p className="text-sm font-medium text-primary">£{product.minSalePrice}</p>
                        {product.minPrice && (
                          <p className="text-xs text-gray-500 line-through ml-2">£{product.minPrice}</p>
                        )}
                      </>
                    ) : (
                      product.minPrice && (
                        <p className="text-sm font-medium text-primary">£{product.minPrice}</p>
                      )
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(product._id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

ProductDropdown.propTypes = {
  selectedProducts: PropTypes.arrayOf(PropTypes.string),
  setSelectedProducts: PropTypes.func.isRequired,
};

EditBlogSection.propTypes = {
  blogName: PropTypes.string.isRequired,
  setblogName: PropTypes.func.isRequired,
  blogDesc: PropTypes.string.isRequired,
  setblogDesc: PropTypes.func.isRequired,
  blogContent: PropTypes.string.isRequired,
  setblogContent: PropTypes.func.isRequired,
  blogContent1: PropTypes.string,
  setblogContent1: PropTypes.func.isRequired,
  selectedProducts: PropTypes.arrayOf(PropTypes.string),
  setSelectedProducts: PropTypes.func.isRequired,
  editor: PropTypes.object.isRequired,
  editor1: PropTypes.object.isRequired,
  config: PropTypes.object.isRequired,
  blogImage: PropTypes.any,
  setblogimage: PropTypes.func.isRequired,
  handleBlogImage: PropTypes.func.isRequired,
  blogImageAlt: PropTypes.string.isRequired,
  setblogimagealt: PropTypes.func.isRequired,
  blogThumbnailImage: PropTypes.any,
  setblogthumbnailimage: PropTypes.func.isRequired,
  handleBlogThumbnailImage: PropTypes.func.isRequired,
  blogThumbnailImageAlt: PropTypes.string.isRequired,
  setblogthumnailimageAlt: PropTypes.func.isRequired,
};

export default EditBlogSection;
