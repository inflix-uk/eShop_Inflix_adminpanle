import { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useAuth } from "../../../../../context/Auth";
import {
  UNASSIGNED_BRAND_KEY,
  UNASSIGNED_BRAND_LABEL,
} from '../../constants/brandConstants';

const BrandsView = ({
  brands = [],
  brandsLoading = false,
  unassignedProductCount = 0,
  onBrandSelect,
}) => {
  const auth = useAuth();
    // Brand search and filter
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAndSortedBrands = useMemo(() => {
    let result = [...brands];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(brand =>
        brand.name.toLowerCase().includes(term) ||
        (brand.metaDescription && brand.metaDescription.toLowerCase().includes(term))
      );
    }

    return result;
  }, [brands, searchTerm]);

  return (
    <div className="mt-8">
      {/* Header Section with Search and Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 border border-blue-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-700 mb-3">
              Select a brand to explore and manage its products
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Products saved without a brand appear under{' '}
              <span className="font-semibold text-amber-700">{UNASSIGNED_BRAND_LABEL}</span>.
            </p>

            {/* Search */}
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Stats Section */}
          <div className="flex items-center gap-3 bg-white/60 px-3 py-2 rounded-lg border border-blue-100">
            <div className="text-center px-2">
              <div className="text-xl font-bold text-blue-600">{brands.length}</div>
              <div className="text-xs font-medium text-blue-700">Brands</div>
            </div>
            <div className="h-8 w-px bg-gray-300"></div>
            <div className="text-center px-2">
              <div className="text-xl font-bold text-emerald-600">
                {brands.reduce((total, brand) => total + (brand.productCount || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs font-medium text-emerald-700">Products</div>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {searchTerm && (
          <div className="mt-3 px-3 py-1.5 bg-blue-100/50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700">
              Found <span className="font-semibold">{filteredAndSortedBrands.length}</span>
              {filteredAndSortedBrands.length === 1 ? ' brand' : ' brands'}
              matching &quot;{searchTerm}&quot;
              {filteredAndSortedBrands.length !== brands.length && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="ml-2 text-blue-600 hover:text-blue-800 underline font-medium"
                >
                  Clear
                </button>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Loading State */}
      {brandsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 animate-pulse">
              <div className="h-48 bg-gray-100"></div>
              <div className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedBrands.length === 0 ? (
        // Empty State
        <div className="text-center py-16">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>
            </svg>
          </div>
          <h3 className="text-2xl font-semibold text-gray-900 mb-2">
            {searchTerm ? `No brands found for "${searchTerm}"` : 'No brands found'}
          </h3>
          <p className="text-gray-500 text-lg">
            {searchTerm 
              ? 'Try adjusting your search terms or clear the search to see all brands'
              : 'Please add some brands first to get started'
            }
          </p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Show All Brands
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {(unassignedProductCount > 0 ||
            (searchTerm && UNASSIGNED_BRAND_LABEL.toLowerCase().includes(searchTerm.toLowerCase()))) && (
            <div
              onClick={() => onBrandSelect(UNASSIGNED_BRAND_KEY)}
              className="group bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2 border-amber-200 hover:border-amber-300 relative"
            >
              <div className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full z-10">
                Needs brand
              </div>
              <div className="relative h-48 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
                <div className="text-center px-6">
                  <div className="w-16 h-16 mx-auto mb-3 bg-amber-100 rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-amber-700">Missing brand assignment</p>
                </div>
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md">
                  <span className="text-sm font-semibold text-gray-800">
                    {unassignedProductCount}{' '}
                    {unassignedProductCount === 1 ? 'product' : 'products'}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-700 transition-colors duration-300 mb-2">
                  {UNASSIGNED_BRAND_LABEL}
                </h3>
                <p className="text-gray-600 text-sm">
                  Open these products and assign a brand from Product Central.
                </p>
              </div>
            </div>
          )}

          {filteredAndSortedBrands.map((brand) => (
            <div
              key={brand._id}
              onClick={() => onBrandSelect(brand.name)}
              className="group bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer transform transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border border-gray-100 hover:border-blue-200 relative"
            >
              {/* Draft Badge */}
              {brand.isPublish === false && (
                <div className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-full z-10 flex items-center">
                  <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mr-1.5"></span>
                  Draft
                </div>
              )}

              {/* Featured Badge */}
              {brand.isFeatured && (
                <div className="absolute top-3 left-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full z-10 flex items-center shadow-md">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                  Featured
                </div>
              )}
              
              {/* Brand Logo Section */}
              <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 group-hover:from-blue-50 group-hover:to-indigo-50 flex items-center justify-center overflow-hidden transition-all duration-300">
                {brand.Logo?.path ? (
                  <>
                    <img
                      src={`${auth.ip}${brand.Logo.path}`}
                      alt={`${brand.name} logo`}
                      className="max-w-full max-h-full object-contain p-6 transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        console.log('Image failed to load:', `${auth.ip}${brand.Logo.path}`);
                        console.log('Brand:', brand.name, 'Path:', brand.Logo.path);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div 
                      className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      aria-hidden="true"
                    ></div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-2xl flex items-center justify-center">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm font-medium text-gray-400">No logo available</p>
                    </div>
                  </div>
                )}
                
                {/* Product Count Badge */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5 animate-pulse"></span>
                  <span className="text-sm font-semibold text-gray-800">
                    {brand.productCount || 0} {brand.productCount === 1 ? 'product' : 'products'}
                  </span>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Brand Info Section */}
              <div className="p-6">
                <div className="mb-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 mb-2">
                    {brand.name}
                  </h3>
                  {brand.metaDescription && (
                    <p className="text-gray-600 text-sm line-clamp-2 mb-3">
                      {brand.metaDescription}
                    </p>
                  )}
                </div>
                
                {/* Product Count Info */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 group-hover:from-blue-100 group-hover:to-indigo-100 transition-colors duration-300">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span className="text-sm font-semibold text-blue-700">
                      <span className="font-bold">{(brand.productCount || 0).toLocaleString()}</span>
                      <span className="text-blue-600 ml-1">
                        {brand.productCount === 1 ? 'product' : 'products'}
                      </span>
                    </span>
                  </div>

                  {/* Status Indicator */}
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    brand.isPublish 
                      ? 'text-blue-700 bg-blue-100' 
                      : 'text-gray-600 bg-gray-100'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      brand.isPublish ? 'bg-blue-500' : 'bg-gray-400'
                    }`}></span>
                    {brand.isPublish ? 'Live' : 'Draft'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Define Brand Logo PropTypes
const LogoPropTypes = PropTypes.shape({
  filename: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired
});

// Define Meta Image PropTypes
const MetaImagePropTypes = PropTypes.shape({
  filename: PropTypes.string.isRequired,
  path: PropTypes.string.isRequired
});

// Define Brand PropTypes
const BrandPropTypes = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  Logo: LogoPropTypes,
  metaImage: MetaImagePropTypes,
  metaTitle: PropTypes.string,
  metaDescription: PropTypes.string,
  isPublish: PropTypes.bool.isRequired,
  isFeatured: PropTypes.bool.isRequired,
  createdAt: PropTypes.string.isRequired,
  updatedAt: PropTypes.string.isRequired,
  __v: PropTypes.number,
  productCount: PropTypes.number
});

// Define Auth PropTypes
const AuthPropTypes = PropTypes.shape({
  ip: PropTypes.string,
  user: PropTypes.object,
  token: PropTypes.string,
  // Add other auth properties as needed
});

// Component PropTypes
BrandsView.propTypes = {
  /**
   * Array of brand objects containing brand information and product counts
   */
  brands: PropTypes.arrayOf(BrandPropTypes).isRequired,
  
  /**
   * Boolean indicating whether brands are currently being loaded
   */
  brandsLoading: PropTypes.bool.isRequired,
  
  /**
   * Number of products with no brand assigned
   */
  unassignedProductCount: PropTypes.number,

  /**
   * Callback function called when a brand is selected
   * @param {string} brandName - The name of the selected brand, or UNASSIGNED_BRAND_KEY
   */
  onBrandSelect: PropTypes.func.isRequired,

  /**
   * Authentication object containing user info and API base URL
   */
  auth: AuthPropTypes
};

BrandsView.defaultProps = {
  unassignedProductCount: 0,
  auth: undefined,
};

export default BrandsView;