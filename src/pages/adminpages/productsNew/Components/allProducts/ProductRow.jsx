import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { getStorefrontProductUrl } from './utils';
import { isProductMissingBrand } from '../../constants/brandConstants';

function getThumbUrl(image, ip) {
  if (!image) return "";
  if (image.url) return image.url;
  if (image.path && ip) {
    const base = ip.endsWith("/") ? ip.slice(0, -1) : ip;
    const p = image.path.startsWith("/") ? image.path : `/${image.path}`;
    return `${base}${p}`;
  }
  return "";
}

const ProductRow = ({
  product,
  index,
  auth,
  onFeaturedChange,
  onStatusChange,
  onDelete,
  onDuplicate,
  onViewVariants,
}) => {
  const productNameSlug = product.producturl;
  const storefrontProductUrl = getStorefrontProductUrl(productNameSlug);

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors duration-200">
      <td className="px-4 lg:px-6 py-3 text-sm">
        <div className="flex items-center gap-2.5">
          <div className="h-11 w-11 flex-shrink-0 flex justify-center">
            <a
              href={storefrontProductUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex"
            >
              <img
                className="h-11 w-11 object-cover rounded-lg"
                src={getThumbUrl(product.thumbnail_image, auth.ip)}
                alt="Product thumbnail"
              />
            </a>
          </div>
          <div className="min-w-0 flex-1">
            <a
              href={storefrontProductUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm lg:text-base font-medium text-gray-900 hover:text-blue-600 line-clamp-2"
            >
              {product.name}
            </a>
            {isProductMissingBrand(product) && (
              <span className="mt-1 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                No brand
              </span>
            )}
          </div>
        </div>
      </td>
      
      <td className="px-4 lg:px-6 py-3 text-sm text-gray-500">
        <p className="line-clamp-2 lg:line-clamp-3">{product.category}</p>
      </td>
      
      <td className="px-4 lg:px-6 py-3 text-sm text-gray-500">
        <div className="text-gray-500 flex gap-2 items-center flex-wrap">
          <div className="text-xs lg:text-sm">
            <span className="font-medium hidden lg:inline">Total Variants: </span>
            <span className="font-medium lg:hidden">Variants: </span>
            {product.productType?.variantCount || 0}
          </div>
          <svg
            className="text-blue-600 cursor-pointer size-5 lg:size-6 hover:opacity-80 transition-opacity flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            onClick={() => onViewVariants(product._id)}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </div>
      </td>
      
      <td className="px-4 lg:px-6 py-3 text-sm text-gray-500">
        <span className="text-xs lg:text-sm">{product.condition}</span>
      </td>
      
      <td className="px-4 lg:px-6 py-3 text-sm text-gray-500">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={product.is_featured}
            onChange={() => onFeaturedChange(index)}
            className="sr-only peer"
          />
          <div className="relative w-10 h-5 lg:w-11 lg:h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 lg:after:h-5 lg:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
        </label>
      </td>
      
      <td className="px-4 lg:px-6 py-3 text-sm text-gray-500">
        <label className="inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={product.status}
            onChange={() => onStatusChange(index)}
            className="sr-only peer"
          />
          <div className="relative w-10 h-5 lg:w-11 lg:h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 lg:after:h-5 lg:after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
        </label>
      </td>
      
      <td className="px-4 lg:px-6 py-3 text-sm">
        <div className="flex flex-col gap-1 lg:gap-2">
          <div className="text-gray-500 hover:underline">
            <Link
              to={`/admin/edit-product/${product._id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs lg:text-sm text-primary hover:underline"
            >
              Edit
            </Link>
          </div>
          <div className="text-gray-500">
            <button
              onClick={() => onDelete(product._id)}
              className="text-xs lg:text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
          <div className="text-gray-500">
            <button
              onClick={() => onDuplicate(product._id)}
              className="text-xs lg:text-sm hover:underline"
            >
              Duplicate
            </button>
          </div>
          <div className="text-gray-500">
            <Link
              to={`/admin/preview/${product.producturl}`}
              className="text-xs lg:text-sm text-blue-600 hover:underline"
            >
              Preview
            </Link>
          </div>
        </div>
      </td>
    </tr>
  );
};

ProductRow.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    condition: PropTypes.string.isRequired,
    is_featured: PropTypes.bool.isRequired,
    status: PropTypes.bool.isRequired,
    variantValues: PropTypes.arrayOf(PropTypes.object), // Optional - only for single products
    productType: PropTypes.shape({
      type: PropTypes.string,
      variantCount: PropTypes.number
    }),
    thumbnail_image: PropTypes.shape({
      path: PropTypes.string
    }),
    producturl: PropTypes.string.isRequired
  }).isRequired,
  index: PropTypes.number.isRequired,
  auth: PropTypes.shape({
    ip: PropTypes.string.isRequired
  }).isRequired,
  onFeaturedChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onViewVariants: PropTypes.func.isRequired,
};

export default ProductRow;