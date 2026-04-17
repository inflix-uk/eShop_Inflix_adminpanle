import PropTypes from 'prop-types';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * AssignToOrderPanel Component
 * Displays user's orders and allows admin to assign general chat messages to an order
 */
const AssignToOrderPanel = ({
  selectedUser,
  orders,
  isLoading = false,
  onSelectOrder,
  onCancel
}) => {
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

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-h-0 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Assign General Chat to Order</h2>
            <p className="text-sm text-gray-600 mt-1">
              Move all general chat messages with{' '}
              <span className="font-medium capitalize">{selectedUser?.name || 'User'}</span>{' '}
              to a specific order
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
        {/* Orders List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-16 w-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Found</h3>
            <p className="text-sm text-gray-500">
              This user doesn&apos;t have any orders to assign messages to.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Select an order to assign general chat messages ({orders.length} orders available)
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
                      <span className="text-xs text-blue-600 font-medium group-hover:text-blue-700 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                        Assign to this order
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

AssignToOrderPanel.propTypes = {
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
  isLoading: PropTypes.bool,
  onSelectOrder: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default AssignToOrderPanel;
