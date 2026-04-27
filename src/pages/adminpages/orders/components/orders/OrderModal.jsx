import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ordersService from '../../service/ordersService';
import { getOrderLineItemImageUrl } from '../../utils/orderItemImageUrl';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const OrderModal = ({ isModalOpen, handleCloseModal, selectedOrderId, orders }) => {
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch cart data when modal opens
  useEffect(() => {
    const fetchCart = async () => {
      if (!isModalOpen || !selectedOrderId) return;

      setIsLoading(true);
      setError(null);

      const response = await ordersService.getOrderCart(selectedOrderId);

      if (response.success) {
        setCart(response.cart);
      } else {
        setError(response.error || 'Failed to load cart');
      }

      setIsLoading(false);
    };

    fetchCart();
  }, [isModalOpen, selectedOrderId]);

  // Clear cart when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setCart([]);
      setError(null);
    }
  }, [isModalOpen]);

  if (!isModalOpen || !selectedOrderId) return null;

  const order = orders.find((order) => order._id === selectedOrderId);
  if (!order) return null;

  return (
    <div
      id="default-modal"
      tabIndex="-1"
      aria-hidden="true"
      className="fixed inset-0 z-40 flex justify-center items-center bg-black bg-opacity-50 overflow-y-auto"
    >
      <div className="relative p-4 w-full max-w-6xl max-h-full">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-200">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
            <h3 className="text-lg font-semibold text-gray-900">
              Order Details - {order.orderNumber}
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-blue-200 hover:text-blue-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
              onClick={handleCloseModal}
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
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                <span className="ml-3 text-gray-600">Loading cart...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    ordersService.getOrderCart(selectedOrderId).then((res) => {
                      if (res.success) setCart(res.cart);
                      else setError(res.error);
                      setIsLoading(false);
                    });
                  }}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-blue-700"
                >
                  Retry
                </button>
              </div>
            ) : (
              <table className="table-auto w-full">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="px-4 py-2 text-left w-1/12">Image</th>
                    <th className="px-4 py-2 text-left w-5/12">Product</th>
                    <th className="px-4 py-2 text-center w-2/12">SKU</th>
                    <th className="px-4 py-2 text-center w-1/12">Qty</th>
                    <th className="px-4 py-2 text-right w-2/12">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map((item, index) => {
                    const isTradeIn = item.isTradeIn === true;
                    const tradeInCondition = item.tradeInData?.conditionName || '-';
                    const cleanVariantName = item.name?.replace(/\s*\(#[0-9a-fA-F]+\)/g, '') || '';
                    const imageUrl = getOrderLineItemImageUrl(item, BACKEND_URL);

                    return (
                      <tr key={index} className="border-b border-gray-300">
                        <td className="px-4 py-2">
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.productName}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                              No img
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900">
                                {item.productName || cleanVariantName}
                                {!isTradeIn && cleanVariantName && item.productName && (
                                  <span className="text-sm text-gray-600 font-normal ml-2">
                                    - {cleanVariantName}
                                  </span>
                                )}
                              </span>
                              {isTradeIn && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md">
                                  TRADE-IN
                                </span>
                              )}
                            </div>
                            {isTradeIn && item.tradeInData && (
                              <div className="mt-2 p-2 rounded-lg bg-blue-50 border-l-4 border-blue-500">
                                <div className="flex gap-6 text-xs">
                                  <div className="text-center">
                                    <p className="text-gray-500 uppercase font-semibold mb-1">Brand</p>
                                    <p className="font-bold text-gray-800">{item.tradeInData.brandName}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-gray-500 uppercase font-semibold mb-1">Storage</p>
                                    <p className="font-bold text-gray-800">{item.tradeInData.storageName}</p>
                                  </div>
                                  <div className="text-center">
                                    <p className="text-gray-500 uppercase font-semibold mb-1">Condition</p>
                                    <p className="font-bold text-blue-600">{tradeInCondition}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                            {item.selectedSim && (
                              <p className="text-xs text-gray-700 bg-gray-100 px-2 py-1 rounded inline-block">
                                With Free SIM: <span className="font-semibold">{item.selectedSim}</span>
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className="text-xs text-gray-600 font-mono">
                            {item.SKU || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <span className={`font-medium ${isTradeIn ? 'text-blue-600' : 'text-gray-700'}`}>
                            {item.qty}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className={`font-semibold ${isTradeIn ? 'text-blue-700' : 'text-gray-900'}`}>
                            £{(item.salePrice * item.qty).toFixed(2)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-400">
                    <td colSpan="4" className="px-4 py-3 text-right font-semibold text-gray-700">
                      Order Total:
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-lg text-primary">
                      £{order.totalOrderValue?.toFixed(2) || order.cartTotal?.toFixed(2) || '0.00'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

OrderModal.propTypes = {
  isModalOpen: PropTypes.bool.isRequired,
  handleCloseModal: PropTypes.func.isRequired,
  selectedOrderId: PropTypes.string,
  orders: PropTypes.array.isRequired,
};

export default OrderModal;
