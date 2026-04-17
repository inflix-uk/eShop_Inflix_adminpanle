import PropTypes from 'prop-types';

const ProductModal = ({ isOpen, onClose, order }) => {
    if (!isOpen || !order) return null;

    const products = order.productNames?.length > 0 
        ? order.productNames 
        : order.requestOrder?.orderId?.cart?.map(item => item.productName) || [];

    return (
        <div
            id="default-modal"
            tabIndex="-1"
            aria-hidden="true"
            className="fixed inset-0 z-40 flex justify-center items-center bg-black bg-opacity-50 overflow-y-auto"
        >
            <div className="relative p-4 w-full max-w-4xl max-h-full">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-200">
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
                        <h3 className="text-lg font-semibold text-gray-900">Products Details</h3>
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
                    <div className="p-6">
                        <table className="table-auto w-full">
                            <thead>
                                <tr className="border-b border-gray-300">
                                    <th className="px-4 py-2 text-left">Product Name</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((productName, index) => (
                                    <tr key={index} className="border-b border-gray-300">
                                        <td className="px-4 py-2 text-left">
                                            <div className="font-medium text-gray-900">
                                                {productName}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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

ProductModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    order: PropTypes.shape({
        _id: PropTypes.string,
        productNames: PropTypes.arrayOf(PropTypes.string),
        requestOrder: PropTypes.shape({
            orderId: PropTypes.shape({
                cart: PropTypes.arrayOf(PropTypes.shape({
                    productName: PropTypes.string
                }))
            })
        })
    })
};

export default ProductModal;