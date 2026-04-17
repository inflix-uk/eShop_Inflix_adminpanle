import PropTypes from "prop-types";
import { ShoppingBagIcon, PlusIcon } from "@heroicons/react/24/solid";

/**
 * Product Names Section Component
 * Displays and allows editing of product names list
 */
const ProductNamesSection = ({
  productNames,
  isEditMode,
  onProductNameChange,
  onAddProductName,
  onRemoveProductName,
}) => {
  return (
    <div>
      <div className="flex justify-between items-center w-full mb-2">
        <label className="text-xs font-medium text-gray-900 flex items-center gap-2">
          <ShoppingBagIcon className="h-3.5 w-3.5 text-primary" />
          Product Names
        </label>
        {isEditMode && (
          <button
            type="button"
            onClick={onAddProductName}
            className="px-1.5 py-1 text-xs bg-primary text-white rounded-md shadow flex items-center gap-1"
          >
            <PlusIcon className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="space-y-2">
        {isEditMode ? (
          <div className="space-y-2">
            {productNames.map((name, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => onProductNameChange(index, e.target.value)}
                  className="mt-1 block w-full text-xs rounded-md border-blue-500 shadow-sm py-1.5 px-2"
                  placeholder={`Product Name ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => onRemoveProductName(index)}
                  className="px-1.5 py-1 text-xs bg-red-600 text-white rounded-md shadow"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-3 w-3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {productNames.map((name, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-900">
                  Product {index + 1}:
                </span>
                <span className="text-xs text-gray-700">
                  {name || `Product Name ${index + 1}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

ProductNamesSection.propTypes = {
  productNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  isEditMode: PropTypes.bool.isRequired,
  onProductNameChange: PropTypes.func.isRequired,
  onAddProductName: PropTypes.func.isRequired,
  onRemoveProductName: PropTypes.func.isRequired,
};

export default ProductNamesSection;
