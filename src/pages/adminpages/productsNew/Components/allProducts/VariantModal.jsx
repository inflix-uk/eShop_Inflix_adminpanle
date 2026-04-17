import PropTypes from 'prop-types';

const VariantModal = ({ 
  isOpen, 
  onClose, 
  product 
}) => {
  if (!isOpen || !product) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-center items-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="relative p-4 w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-200 max-h-full">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
            <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-blue-200 hover:text-blue-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
              onClick={onClose}
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
          
          <div className="overflow-auto max-h-[calc(100vh-150px)] scrollbar-thin scrollbar-webkit">
            <div className="p-6">
              {!product.variantValues || product.variantValues.length === 0 ? (
                <div className="flex justify-center items-center py-8">
                  <p className="text-gray-500">Loading variant details...</p>
                </div>
              ) : (
                <table className="table-auto w-full">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-center">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.variantValues.map((variant, index) => (
                      <tr key={index} className="border-b border-gray-300">
                        <td className="py-2">
                          <b className="font-medium">{variant.name}:</b>
                        </td>
                        <td className="flex justify-center items-center py-2">
                          {variant.Quantity}
                          {variant.Quantity <= product.low_stock_quantity_alert && (
                            <span className="inline-flex items-center rounded-md bg-red-50 px-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-primary/20">
                              Low
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
          
          <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b">
            <button
              type="button"
              className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

VariantModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.shape({
    _id: PropTypes.string,
    variantValues: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      Quantity: PropTypes.number
    })),
    low_stock_quantity_alert: PropTypes.number
  })
};

export default VariantModal;