import PropTypes from 'prop-types';
import {
  ShoppingBagIcon,
  TagIcon,
  HashtagIcon,
  CalculatorIcon,
  CurrencyPoundIcon,
} from '@heroicons/react/24/solid';

/**
 * Products Table Component
 * Displays ordered products in a return request
 */
const ProductsTable = ({ products, getImageUrl, onImageClick }) => {
  if (!products || products.length === 0) {
    return <p className="text-gray-700">No products found.</p>;
  }

  return (
    <section className="mb-6 shadow-md p-4">
      <h3 className="text-2xl font-bold mb-5 flex items-center text-gray-800">
        Ordered Products
      </h3>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100 w-full">
              <th className="px-4 py-2 text-left">
                <div className="flex items-center">
                  <ShoppingBagIcon className="text-primary w-5 h-5 mr-2" />
                  Product Name
                </div>
              </th>
              <th className="px-4 py-2 text-left">
                <div className="flex items-center">
                  <TagIcon className="text-primary w-5 h-5 mr-2" />
                  Variant Details
                </div>
              </th>
              <th className="px-4 py-2 text-left">
                <div className="flex items-center">
                  <CurrencyPoundIcon className="text-primary w-5 h-5 mr-2" />
                  Price
                </div>
              </th>
              <th className="px-4 py-2 text-left">
                <div className="flex items-center">
                  <HashtagIcon className="text-primary w-5 h-5 mr-2" />
                  Quantity
                </div>
              </th>
              <th className="px-4 py-2 text-left">
                <div className="flex items-center">
                  <CalculatorIcon className="text-primary w-5 h-5 mr-2" />
                  Total
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((item, index) => {
              const nameParts = item.name ? item.name.split('-') : ['N/A', 'N/A', 'N/A'];

              return (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <div className='flex items-center space-x-4'>
                      <img
                        src={getImageUrl(item?.metaImage?.path)}
                        alt={item.productName || 'Product'}
                        className="w-16 h-16 object-cover rounded-md cursor-pointer"
                        onClick={() => onImageClick(index)}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/images/fallback.jpg';
                        }}
                      />
                      <span>{item.productName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <div className="text-sm text-gray-500">
                      <strong>Condition:</strong> {nameParts[0]}
                    </div>
                    <div className="text-sm text-gray-500">
                      <strong>Color:</strong> {nameParts[1]}
                    </div>
                    <div className="text-sm text-gray-500">
                      <strong>Storage:</strong> {nameParts[2]}
                    </div>
                  </td>
                  <td className="px-4 py-2">£{item.salePrice?.toFixed(2) || '0.00'}</td>
                  <td className="px-4 py-2">{item.qty || 0}</td>
                  <td className="px-4 py-2">
                    £{((item.salePrice || 0) * (item.qty || 0)).toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};

ProductsTable.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      productName: PropTypes.string,
      salePrice: PropTypes.number,
      qty: PropTypes.number,
      metaImage: PropTypes.shape({
        path: PropTypes.string,
      }),
    })
  ).isRequired,
  getImageUrl: PropTypes.func.isRequired,
  onImageClick: PropTypes.func.isRequired,
};

export default ProductsTable;
