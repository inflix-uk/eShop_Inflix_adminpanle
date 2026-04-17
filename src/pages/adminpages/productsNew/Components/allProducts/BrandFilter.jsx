import PropTypes from 'prop-types';

const BrandFilter = ({ 
  brands, 
  selectedBrand, 
  onBrandSelect, 
  isLoading 
}) => {
  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter by Brand:</h3>
        
        {isLoading ? (
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-sm text-gray-500">Loading brands...</span>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onBrandSelect(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedBrand === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Brands ({brands.reduce((total, brand) => total + (brand.productCount || 0), 0)})
            </button>
            
            {brands.map((brand) => (
              <button
                key={brand._id}
                onClick={() => onBrandSelect(brand.name)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedBrand === brand.name
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {brand.name} ({brand.productCount || 0})
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

BrandFilter.propTypes = {
  brands: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    productCount: PropTypes.number
  })).isRequired,
  selectedBrand: PropTypes.string,
  onBrandSelect: PropTypes.func.isRequired,
  isLoading: PropTypes.bool
};

export default BrandFilter;