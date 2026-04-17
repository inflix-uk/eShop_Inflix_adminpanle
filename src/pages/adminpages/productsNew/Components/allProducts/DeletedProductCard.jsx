import PropTypes from "prop-types";
import { Link } from "react-router-dom";

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

const DeletedProductCard = ({
  product,
  index,
  auth,
  onFeaturedChange,
  onStatusChange,
  onDelete,
  onDuplicate,
  onRestore,
  onViewVariants,
  isModalOpen,
  selectedProductId,
  onCloseModal,
  onOpenDeleteModal,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      {/* Product Image and Name */}
      <div className="flex items-start gap-3 mb-4">
        <div className="h-20 w-20 flex-shrink-0 flex justify-center">
          <img
            className="h-20 w-20 object-cover rounded-lg"
            src={getThumbUrl(product.thumbnail_image, auth.ip)}
            alt="Product thumbnail"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-gray-900 line-clamp-2">
            {product.name}
          </p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
            {product.producturl}
          </p>
        </div>
      </div>

      {/* Product Details Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div>
          <span className="text-gray-500">Category:</span>
          <div className="font-medium text-gray-900 mt-1 line-clamp-2">
            {product.category}
          </div>
        </div>

        <div>
          <span className="text-gray-500">Condition:</span>
          <div className="font-medium text-gray-900 mt-1">
            {product.condition}
          </div>
        </div>

        <div>
          <span className="text-gray-500">Variants:</span>
          <div className="flex items-center gap-2 mt-1">
            <span className="font-medium text-gray-900">
              {product.variantValues?.length || 0}
            </span>
            <svg
              className="text-blue-600 cursor-pointer size-5 hover:opacity-80 transition-opacity"
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
        </div>
      </div>

      {/* Toggles */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Featured:</span>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={product.is_featured}
              onChange={() => onFeaturedChange(index)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
          </label>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-500">Published:</span>
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={product.status}
              onChange={() => onStatusChange(index)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary" />
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Link
          to={`/admin/edit-product/${product._id}`}
          className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-4 sm:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
          Edit
        </Link>
        <button
          onClick={() => onRestore(product._id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-blue-600 rounded-md hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4 sm:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          Restore
        </button>
        <button
          onClick={() => onOpenDeleteModal(product._id)}
          className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-red-600 rounded-md hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4 sm:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
          Delete
        </button>
        <button
          onClick={() => onDuplicate(product._id)}
          className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-xs sm:text-sm font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-4 sm:size-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.856a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.659a18.047 18.047 0 0 1-1.5-.07m3 6.376v-3.659a18.047 18.047 0 0 0-1.5-.07M12 10.5h.008v.008H12V10.5Zm3 0h.008v.008H15V10.5Z"
            />
          </svg>
          Duplicate
        </button>
      </div>

      {/* Variant Modal */}
      {isModalOpen && selectedProductId === product._id && (
        <div
          id="default-modal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed inset-0 z-40 flex justify-center items-center bg-black bg-opacity-50"
        >
          <div className="relative p-4 w-full max-w-lg">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-200 max-h-full">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
                <h3 className="text-lg font-semibold text-gray-900">
                  Product Details
                </h3>
                <button
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-blue-200 hover:text-blue-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
                  onClick={onCloseModal}
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
              <div
                className="overflow-auto max-h-[calc(100vh-150px)] scrollbar-thin scrollbar-webkit"
                style={{ height: "auto" }}
              >
                <div className="p-6">
                  <table className="table-auto w-full">
                    <thead>
                      <tr className="border-b border-gray-300">
                        <th className="px-4 py-2 text-left">Product</th>
                        <th className="px-4 py-2 text-center">Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {product.variantValues?.map((variant, idx) => (
                        <tr key={idx} className="border-b border-gray-300">
                          <td className="py-2">
                            <b className="font-medium">{variant.name} :</b>
                          </td>
                          <td className="flex justify-center items-center py-2">
                            {variant.Quantity}
                            {variant.Quantity <=
                              product.low_stock_quantity_alert && (
                              <span className="inline-flex items-center rounded-md bg-red-50 px-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-primary/20">
                                Low
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b">
                <button
                  type="button"
                  className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  onClick={onCloseModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DeletedProductCard.propTypes = {
  product: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    condition: PropTypes.string.isRequired,
    is_featured: PropTypes.bool.isRequired,
    status: PropTypes.bool.isRequired,
    variantValues: PropTypes.array,
    producturl: PropTypes.string,
    low_stock_quantity_alert: PropTypes.number,
    thumbnail_image: PropTypes.shape({
      path: PropTypes.string,
    }),
  }).isRequired,
  index: PropTypes.number.isRequired,
  auth: PropTypes.shape({
    ip: PropTypes.string.isRequired,
  }).isRequired,
  onFeaturedChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onRestore: PropTypes.func.isRequired,
  onViewVariants: PropTypes.func.isRequired,
  isModalOpen: PropTypes.bool.isRequired,
  selectedProductId: PropTypes.string,
  onCloseModal: PropTypes.func.isRequired,
  onOpenDeleteModal: PropTypes.func.isRequired,
};

export default DeletedProductCard;
