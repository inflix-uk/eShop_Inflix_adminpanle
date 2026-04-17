import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrderDetails } from '../../service/chatWindowService';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * OrderDetailsCard Component
 * Displays full order information in the chat window
 */
const OrderDetailsCard = ({ orderId }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const result = await getOrderDetails(orderId);

        if (result.success && result.order) {
          setOrderDetails(result.order);
          setError(null);
        } else {
          setError(result.error || 'Failed to load order details');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError('Failed to load order details');
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-blue-50 border-b border-blue-200 p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-blue-200 rounded w-3/4"></div>
            <div className="h-3 bg-blue-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !orderDetails) {
    return null;
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return `£${parseFloat(amount || 0).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      'approved': 'bg-blue-100 text-blue-800 border-blue-300',
      'processing': 'bg-blue-100 text-blue-800 border-blue-300',
      'shipped': 'bg-purple-100 text-purple-800 border-purple-300',
      'delivered': 'bg-blue-100 text-blue-800 border-blue-300',
      'cancelled': 'bg-red-100 text-red-800 border-red-300',
      'refunded': 'bg-gray-100 text-gray-800 border-gray-300',
      'failed': 'bg-red-100 text-red-800 border-red-300'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  // Extract data from order
  const cart = orderDetails.cart || {};
  const cartItems = cart.cartItems || [];
  const shippingDetails = orderDetails.shippingDetails || {};
  const contactDetails = orderDetails.contactDetails || {};
  const paymentDetails = orderDetails.paymentDetails || {};

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
      {/* Header Row - Always visible */}
      <div
        className="p-4 cursor-pointer hover:bg-blue-100/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 text-white p-2 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Order #{orderDetails.orderNumber}
              </h3>
              <p className="text-xs text-gray-600">
                {formatDate(orderDetails.createdAt)} • {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} • {formatCurrency(orderDetails.totalOrderValue || cart.grandTotal)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(orderDetails.status)}`}>
              {orderDetails.status}
            </span>
            <Link
              to={`/admin/orderdetails/${orderId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
              title="View full order page"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Open</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </Link>
            <button className="text-gray-500 hover:text-gray-700 transition-colors">
              <svg className={`w-5 h-5 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-blue-200 bg-white/50">
          {/* Products Section */}
          <div className="pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Products ({cartItems.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {cartItems.map((item, index) => (
                <div key={index} className="flex items-center bg-white rounded-lg p-2 border border-gray-200">
                  <img
                    src={item.productImage?.startsWith('http') ? item.productImage : `${BACKEND_URL}${item.productImage}`}
                    alt={item.productName}
                    className="w-12 h-12 object-cover rounded-md mr-3"
                    onError={(e) => { e.target.src = '/placeholder-product.png'; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                    <div className="flex flex-wrap gap-1 text-xs text-gray-500">
                      {item.selectedColor && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{item.selectedColor}</span>}
                      {item.selectedStorage && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{item.selectedStorage}</span>}
                      {item.selectedCondition && <span className="bg-gray-100 px-1.5 py-0.5 rounded">{item.selectedCondition}</span>}
                    </div>
                  </div>
                  <div className="text-right ml-2">
                    <p className="text-sm font-semibold text-gray-900">{formatCurrency(item.productPrice)}</p>
                    <p className="text-xs text-gray-500">Qty: {item.productQuantity || 1}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer & Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Details */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Customer
              </h4>
              <div className="text-sm space-y-1">
                <p className="font-medium text-gray-900">
                  {contactDetails.firstName || shippingDetails.firstName} {contactDetails.lastName || shippingDetails.lastName}
                </p>
                {(contactDetails.email || shippingDetails.email) && (
                  <p className="text-gray-600 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    {contactDetails.email || shippingDetails.email}
                  </p>
                )}
                {(contactDetails.phone || shippingDetails.phone) && (
                  <p className="text-gray-600 flex items-center">
                    <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    {contactDetails.phone || shippingDetails.phone}
                  </p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Shipping Address
              </h4>
              <div className="text-sm text-gray-600 space-y-0.5">
                {shippingDetails.address && <p>{shippingDetails.address}</p>}
                {shippingDetails.address2 && <p>{shippingDetails.address2}</p>}
                <p>
                  {[shippingDetails.city, shippingDetails.state, shippingDetails.postcode].filter(Boolean).join(', ')}
                </p>
                {shippingDetails.country && <p>{shippingDetails.country}</p>}
              </div>
            </div>
          </div>

          {/* Payment & Order Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Payment Info */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment
              </h4>
              <div className="text-sm space-y-1">
                <p className="text-gray-600">
                  <span className="font-medium">Method:</span> {paymentDetails.paymentMethod || paymentDetails.method || 'N/A'}
                </p>
                {paymentDetails.transactionId && (
                  <p className="text-gray-600">
                    <span className="font-medium">Transaction:</span> {paymentDetails.transactionId}
                  </p>
                )}
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={paymentDetails.status === 'paid' || paymentDetails.status === 'succeeded' ? 'text-blue-600' : 'text-yellow-600'}>
                    {paymentDetails.status || 'Pending'}
                  </span>
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg p-3 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Summary
              </h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(cart.subTotal || cart.subtotal)}</span>
                </div>
                {cart.shippingCost > 0 && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping:</span>
                    <span>{formatCurrency(cart.shippingCost)}</span>
                  </div>
                )}
                {(cart.discount > 0 || orderDetails.coupon?.length > 0) && (
                  <div className="flex justify-between text-blue-600">
                    <span>Discount:</span>
                    <span>-{formatCurrency(cart.discount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold text-gray-900 pt-1 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{formatCurrency(orderDetails.totalOrderValue || cart.grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

OrderDetailsCard.propTypes = {
  orderId: PropTypes.string
};

export default OrderDetailsCard;
