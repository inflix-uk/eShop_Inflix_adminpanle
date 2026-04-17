import { useState } from 'react';
import PropTypes from 'prop-types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * AdminOrderSelectionPanel Component
 * Displays user's orders and return orders, allows admin to start a chat
 * either against a specific order/return order or as a general chat
 */
const AdminOrderSelectionPanel = ({
  selectedUser,
  orders,
  returnOrders = [],
  isLoading = false,
  isLoadingReturnOrders = false,
  onSelectOrder,
  onSelectReturnOrder,
  onStartGeneralChat,
  onCancel,
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'returnOrders'

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (onTabChange) {
      onTabChange(tab);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'shipped':
        return 'bg-blue-100 text-blue-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      case 'approved':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getProductImage = (order) => {
    const firstItem = order.cart?.[0];
    const baseUrl = BACKEND_URL?.replace(/\/$/, '') || '';

    if (firstItem?.productthumbnail?.path) {
      const path = firstItem.productthumbnail.path.startsWith('/')
        ? firstItem.productthumbnail.path
        : `/${firstItem.productthumbnail.path}`;
      return `${baseUrl}${path}`;
    }
    if (firstItem?.variantImages?.[0]?.path) {
      const path = firstItem.variantImages[0].path.startsWith('/')
        ? firstItem.variantImages[0].path
        : `/${firstItem.variantImages[0].path}`;
      return `${baseUrl}${path}`;
    }
    return null;
  };

  const currentIsLoading = activeTab === 'orders' ? isLoading : isLoadingReturnOrders;
  const currentList = activeTab === 'orders' ? orders : returnOrders;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Start New Chat</h2>
            <p className="text-sm text-gray-600 mt-1">
              with <span className="font-medium capitalize">{selectedUser?.name || 'User'}</span>
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Cancel"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {/* General Chat Option */}
        <div className="mb-6">
          <button
            onClick={onStartGeneralChat}
            disabled={currentIsLoading}
            className={`w-full bg-white border-2 border-dashed rounded-xl p-6 transition-all duration-200 group ${
              currentIsLoading
                ? 'border-gray-200 cursor-not-allowed opacity-60'
                : 'border-blue-300 hover:border-blue-500 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center justify-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 transition-colors ${
                currentIsLoading ? 'bg-gray-100' : 'bg-blue-100 group-hover:bg-blue-200'
              }`}>
                {currentIsLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-400"></div>
                ) : (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                )}
              </div>
              <div className="text-left">
                <h3 className={`text-lg font-semibold ${
                  currentIsLoading ? 'text-gray-400' : 'text-gray-900 group-hover:text-blue-700'
                }`}>
                  {currentIsLoading ? 'Loading...' : 'Start General Chat'}
                </h3>
                <p className="text-sm text-gray-500">
                  {currentIsLoading ? 'Please wait while we fetch data' : 'Chat not related to any specific order'}
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Divider with Toggle */}
        <div className="flex items-center mb-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500 font-medium">OR SELECT AN ORDER</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Tab Toggle for Orders / Return Orders */}
        <div className="mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleTabChange('orders')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'orders'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Orders ({orders.length})</span>
            </button>
            <button
              onClick={() => handleTabChange('returnOrders')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
                activeTab === 'returnOrders'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
              </svg>
              <span>Return Orders ({returnOrders.length})</span>
            </button>
          </div>
        </div>

        {/* Orders / Return Orders List */}
        {currentIsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : currentList.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {activeTab === 'orders' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
              )}
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab === 'orders' ? 'Orders' : 'Return Orders'} Found
            </h3>
            <p className="text-sm text-gray-500">
              This user doesn&apos;t have any {activeTab === 'orders' ? 'orders' : 'return orders'} yet.
              {activeTab === 'orders' ? ' Start a general chat instead.' : ' Try checking Orders tab.'}
            </p>
          </div>
        ) : activeTab === 'orders' ? (
          // Regular Orders List
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              User&apos;s orders ({orders.length})
            </p>
            {orders.map((order) => (
              <button
                key={order._id}
                onClick={() => onSelectOrder(order)}
                className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-500 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-start">
                  {/* Order Image */}
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 mr-4">
                    {getProductImage(order) ? (
                      <img
                        src={getProductImage(order)}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Order Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700">
                        Order #{order.orderNumber}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      {formatDate(order.createdAt)}
                    </p>

                    {/* Products preview */}
                    <div className="text-xs text-gray-600 mb-2">
                      {order.cart?.slice(0, 2).map((item, index) => (
                        <span key={item._id || index}>
                          {item.productName || item.name}
                          {index < Math.min(order.cart.length - 1, 1) ? ', ' : ''}
                        </span>
                      ))}
                      {order.cart?.length > 2 && (
                        <span className="text-gray-400"> +{order.cart.length - 2} more</span>
                      )}
                    </div>

                    {/* Order Total */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        Total: £{order.totalOrderValue?.toFixed(2)}
                      </span>
                      <span className="text-xs text-blue-600 font-medium group-hover:text-blue-700">
                        Chat about this order
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          // Return Orders List
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              User&apos;s return orders ({returnOrders.length})
            </p>
            {returnOrders.map((returnOrder) => (
              <button
                key={returnOrder._id}
                onClick={() => onSelectReturnOrder(returnOrder)}
                className="w-full bg-white border border-gray-200 rounded-xl p-4 hover:border-orange-500 hover:shadow-md transition-all duration-200 text-left group"
              >
                <div className="flex items-start">
                  {/* Return Order Icon */}
                  <div className="w-16 h-16 bg-orange-50 rounded-lg overflow-hidden flex-shrink-0 mr-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 14V5a2 2 0 00-2-2H6a2 2 0 00-2 2v16l4-2 4 2 4-2 4 2z" />
                    </svg>
                  </div>

                  {/* Return Order Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-semibold text-gray-900 group-hover:text-orange-700">
                          {returnOrder.rma || `Return #${returnOrder._id.slice(-6)}`}
                        </h4>
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                          Return Order
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(returnOrder.status)}`}>
                        {returnOrder.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-2">
                      {formatDate(returnOrder.createdAt)}
                    </p>

                    {/* Original Order Number */}
                    {returnOrder.originalOrderNumber && (
                      <p className="text-xs text-gray-600 mb-1">
                        Original Order: <span className="font-medium">{returnOrder.originalOrderNumber}</span>
                      </p>
                    )}

                    {/* Product Names */}
                    {returnOrder.productNames?.length > 0 && (
                      <div className="text-xs text-gray-600 mb-2">
                        {returnOrder.productNames.slice(0, 2).map((name, index) => (
                          <span key={index}>
                            {name}
                            {index < Math.min(returnOrder.productNames.length - 1, 1) ? ', ' : ''}
                          </span>
                        ))}
                        {returnOrder.productNames.length > 2 && (
                          <span className="text-gray-400"> +{returnOrder.productNames.length - 2} more</span>
                        )}
                      </div>
                    )}

                    {/* Reason */}
                    {returnOrder.reason && (
                      <p className="text-xs text-gray-500 mb-2 truncate">
                        Reason: {returnOrder.reason}
                      </p>
                    )}

                    {/* Action */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {returnOrder.customerName}
                      </span>
                      <span className="text-xs text-orange-600 font-medium group-hover:text-orange-700">
                        Chat about this return
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

AdminOrderSelectionPanel.propTypes = {
  selectedUser: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string
  }),
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      orderNumber: PropTypes.string,
      status: PropTypes.string,
      createdAt: PropTypes.string,
      totalOrderValue: PropTypes.number,
      cart: PropTypes.array
    })
  ).isRequired,
  returnOrders: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      rma: PropTypes.string,
      status: PropTypes.string,
      createdAt: PropTypes.string,
      originalOrderNumber: PropTypes.string,
      productNames: PropTypes.array,
      reason: PropTypes.string,
      customerName: PropTypes.string
    })
  ),
  isLoading: PropTypes.bool,
  isLoadingReturnOrders: PropTypes.bool,
  onSelectOrder: PropTypes.func.isRequired,
  onSelectReturnOrder: PropTypes.func.isRequired,
  onStartGeneralChat: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onTabChange: PropTypes.func
};

export default AdminOrderSelectionPanel;
