import PropTypes from 'prop-types';
import { FiArrowLeft } from 'react-icons/fi';
import { IoMdMail, IoMdCheckmarkCircle, IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TagSelector from './TagSelector';
import { getConversationTags, toggleLastMessageReadStatus } from '../../service/messagesService';
import { getOrderDetails } from '../../service/chatWindowService';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * ChatHeader Component
 * Displays the header of the chat window with user info and order details
 */
const ChatHeader = ({
  selectedUser,
  messages = [],
  onBack,
  showBackButton = false,
  orderNumber = null,
  userId = null,
  conversationId = null,
  orderId = null,
  onSendEmail = null,
  onReadStatusToggle = null
}) => {
  const [orderInfo, setOrderInfo] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [tags, setTags] = useState([]);
  const [isOrderExpanded, setIsOrderExpanded] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isTogglingReadStatus, setIsTogglingReadStatus] = useState(false);
  const [lastMessageReadStatus, setLastMessageReadStatus] = useState(true);

  const handleSendEmail = async () => {
    if (isSendingEmail || !onSendEmail || !userId) return;

    setIsSendingEmail(true);
    try {
      await onSendEmail(userId);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleToggleReadStatus = async () => {
    if (isTogglingReadStatus || !userId) return;

    setIsTogglingReadStatus(true);
    try {
      const result = await toggleLastMessageReadStatus(userId, orderId);
      if (result.success) {
        setLastMessageReadStatus(result.readStatus);
        // Notify parent component to refresh data - await to ensure UI updates
        if (onReadStatusToggle) {
          await onReadStatusToggle(result.readStatus);
        }
      }
    } catch (error) {
      console.error('Error toggling read status:', error);
    } finally {
      setIsTogglingReadStatus(false);
    }
  };

  // Track the last message's read status from customer messages
  useEffect(() => {
    if (messages && messages.length > 0) {
      const adminId = '66cdf5f6dec61c826428d298';
      // Find the last message from customer (not from admin)
      const customerMessages = messages.filter(msg => msg.sender !== adminId);
      if (customerMessages.length > 0) {
        const lastCustomerMessage = customerMessages[customerMessages.length - 1];
        setLastMessageReadStatus(lastCustomerMessage.readStatus ?? true);
      }
    }
  }, [messages]);

  useEffect(() => {
    // If orderNumber is provided directly (from selected conversation), use it
    if (orderNumber) {
      setOrderInfo({
        orderNumber: orderNumber,
        isOrderConversation: true
      });
      return;
    }

    // Otherwise, extract unique order IDs from messages (fallback)
    const orderIds = messages
      .filter((msg) => msg.orderId)
      .map((msg) => msg.orderId);

    const uniqueOrderIds = [...new Set(orderIds)];

    if (uniqueOrderIds.length > 0) {
      setOrderInfo({
        count: uniqueOrderIds.length,
        orderIds: uniqueOrderIds,
        hasGeneral: messages.some((msg) => !msg.orderId),
        isOrderConversation: false
      });
    } else {
      setOrderInfo(null);
    }
  }, [messages, orderNumber]);

  // Fetch order details when orderId changes
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (orderId && orderId !== 'general') {
        const result = await getOrderDetails(orderId);
        if (result.success && result.order) {
          setOrderDetails(result.order);
        }
      } else {
        setOrderDetails(null);
      }
    };
    fetchOrderDetails();
  }, [orderId]);

  useEffect(() => {
    // Fetch tags for this conversation
    const fetchTags = async () => {
      if (userId && conversationId) {
        const result = await getConversationTags(userId, conversationId);
        if (result.success) {
          setTags(result.tags);
        }
      }
    };
    fetchTags();
  }, [userId, conversationId]);

  const handleTagsUpdate = (updatedTags) => {
    setTags(updatedTags);
  };

  const formatCurrency = (amount) => {
    return `£${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-blue-100 text-blue-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-blue-100 text-blue-800',
      'cancelled': 'bg-red-100 text-red-800',
      'refunded': 'bg-gray-100 text-gray-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  // Extract order data - handle both cart structures (array or object with cartItems)
  const cartItems = Array.isArray(orderDetails?.cart)
    ? orderDetails.cart
    : (orderDetails?.cart?.cartItems || []);
  const shippingDetails = orderDetails?.shippingDetails || {};
  const contactDetails = orderDetails?.contactDetails || {};
  const paymentDetails = orderDetails?.paymentDetails || {};

  return (
    <div className="border-b border-gray-300 bg-gradient-to-r from-gray-50 to-slate-50">
      {/* User Info Row */}
      <div className="p-2 sm:p-3 md:p-4">
        <div className="flex items-start">
          {showBackButton && (
            <button
              onClick={onBack}
              className="mr-2 sm:mr-3 mt-0.5 sm:mt-1 text-gray-600 focus:outline-none hover:text-gray-800 transition-colors"
              aria-label="Go back"
            >
              <FiArrowLeft size={20} className="sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 text-white rounded-full flex items-center justify-center text-base sm:text-lg font-bold capitalize shadow-md">
              {selectedUser?.name?.charAt(0) || '?'}
            </div>
          </div>

          {/* User Details */}
          <div className="ml-2 sm:ml-3 md:ml-4 flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
                {/* Toggle Read/Unread Button */}
                <button
                  onClick={handleToggleReadStatus}
                  disabled={isTogglingReadStatus}
                  className={`p-1 sm:p-1.5 rounded-full transition-colors flex-shrink-0 ${
                    isTogglingReadStatus
                      ? 'text-gray-400 cursor-not-allowed'
                      : lastMessageReadStatus
                        ? 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                  aria-label={lastMessageReadStatus ? 'Mark as unread' : 'Mark as read'}
                  title={lastMessageReadStatus ? 'Mark last message as unread' : 'Mark last message as read'}
                >
                  {isTogglingReadStatus ? (
                    <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : lastMessageReadStatus ? (
                    <IoMdCheckmarkCircle size={18} className="sm:w-5 sm:h-5" />
                  ) : (
                    <IoMdCheckmarkCircleOutline size={18} className="sm:w-5 sm:h-5" />
                  )}
                </button>
                {/* Send Email Button */}
                {onSendEmail && (
                  <button
                    onClick={handleSendEmail}
                    disabled={isSendingEmail}
                    className={`p-1 sm:p-1.5 rounded-full transition-colors flex-shrink-0 ${
                      isSendingEmail
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-blue-500 hover:text-blue-700 hover:bg-blue-50'
                    }`}
                    aria-label="Send email notification"
                    title="Send email notification to user"
                  >
                    {isSendingEmail ? (
                      <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <IoMdMail size={18} className="sm:w-5 sm:h-5" />
                    )}
                  </button>
                )}
                <h2 className="text-sm sm:text-base md:text-lg font-bold text-gray-900 capitalize truncate">
                  {selectedUser?.name || 'Selected User'}
                </h2>
              </div>
              {/* Order Badge */}
              {orderInfo && orderInfo.isOrderConversation && (
                <span className="ml-1 sm:ml-2 px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-100 text-blue-700 text-xs sm:text-sm font-semibold rounded-full flex-shrink-0">
                  <span className="hidden sm:inline">Order #</span>#{orderInfo.orderNumber}
                </span>
              )}
            </div>

            {/* Contact Details Row */}
            <div className="flex flex-wrap items-center gap-x-2 sm:gap-x-4 gap-y-1 mt-1">
              {/* Email */}
              {selectedUser?.email && (
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="truncate max-w-[120px] sm:max-w-[200px]">{selectedUser.email}</span>
                </div>
              )}

              {/* Phone */}
              {selectedUser?.phoneNumber && (
                <div className="flex items-center text-xs sm:text-sm text-gray-600">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>{selectedUser.phoneNumber}</span>
                </div>
              )}

              {/* General Chat Indicator */}
              {orderInfo && !orderInfo.isOrderConversation && (
                <div className="flex items-center text-xs sm:text-sm text-gray-500">
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-0.5 sm:mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>
                    {orderInfo.count === 1 ? '1 order' : `${orderInfo.count} orders`}
                    {orderInfo.hasGeneral && ' + general chat'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Section */}
      {orderDetails && orderId && orderId !== 'general' && (
        <div className="border-t border-gray-200 bg-blue-50/50">
          {/* Order Summary Header - Clickable */}
          <div
            className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 flex items-center justify-between cursor-pointer hover:bg-blue-100/50 transition-colors"
            onClick={() => setIsOrderExpanded(!isOrderExpanded)}
          >
            <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
              <div className="bg-blue-600 text-white p-1 sm:p-1.5 rounded-lg flex-shrink-0">
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1.5 sm:space-x-2 flex-wrap">
                  <span className="font-semibold text-gray-900 text-xs sm:text-sm truncate">Order #{orderDetails.orderNumber}</span>
                  <span className={`px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-medium rounded-full flex-shrink-0 ${getStatusColor(orderDetails.status)}`}>
                    {orderDetails.status}
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">
                  {formatDate(orderDetails.createdAt)} • {cartItems.length} item{cartItems.length !== 1 ? 's' : ''} • {formatCurrency(orderDetails.totalOrderValue)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 ml-2">
              <Link
                to={`/admin/orderdetails/${orderId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="hidden sm:inline">Open</span>
                <span className="sm:hidden">→</span>
              </Link>
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transform transition-transform flex-shrink-0 ${isOrderExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>

          {/* Expanded Order Details */}
          {isOrderExpanded && (
            <div className="px-2 sm:px-3 md:px-4 pb-2 sm:pb-3 space-y-2 sm:space-y-3 border-t border-gray-200 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              {/* Products */}
              <div className="pt-2 sm:pt-3">
                <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-1.5 sm:mb-2">Products ({cartItems.length})</p>
                <div className="space-y-1.5 sm:space-y-2 max-h-40 overflow-y-auto">
                  {cartItems.map((item, index) => {
                    // Handle different image structures
                    const imageUrl = item.productImage
                      || item.metaImage?.path
                      || (item.variantImages?.[0]?.path);
                    const imageSrc = imageUrl?.startsWith('http')
                      ? imageUrl
                      : `${BACKEND_URL}${imageUrl}`;

                    // Get price (salePrice or Price or productPrice)
                    const price = item.salePrice || item.Price || item.productPrice || 0;

                    // Get quantity
                    const quantity = item.qty || item.productQuantity || 1;

                    // Get variant info from name field or individual fields
                    const variantInfo = item.name || [item.selectedColor, item.selectedStorage, item.selectedCondition].filter(Boolean).join(' • ');

                    return (
                      <div key={index} className="flex items-center bg-white rounded-lg p-1.5 sm:p-2 border border-gray-200">
                        <img
                          src={imageSrc}
                          alt={item.productName}
                          className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded mr-1.5 sm:mr-2 flex-shrink-0"
                          onError={(e) => { e.target.src = '/placeholder-product.png'; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                          {variantInfo && (
                            <p className="text-[10px] sm:text-xs text-gray-500 truncate">{variantInfo}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0 ml-1">
                          <p className="text-xs sm:text-sm font-semibold">{formatCurrency(price)}</p>
                          <p className="text-[10px] sm:text-xs text-gray-500">x{quantity}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer & Shipping Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {/* Customer */}
                <div className="bg-white rounded-lg p-1.5 sm:p-2 border border-gray-200">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-1">Customer</p>
                  <p className="text-xs sm:text-sm text-gray-900 truncate">
                    {shippingDetails.firstName} {shippingDetails.lastName}
                  </p>
                  {contactDetails.email && (
                    <p className="text-[10px] sm:text-xs text-gray-600 truncate">{contactDetails.email}</p>
                  )}
                  {shippingDetails.phoneNumber && (
                    <p className="text-[10px] sm:text-xs text-gray-600">{shippingDetails.phoneNumber}</p>
                  )}
                </div>

                {/* Shipping */}
                <div className="bg-white rounded-lg p-1.5 sm:p-2 border border-gray-200">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-1">Shipping Address</p>
                  <p className="text-xs sm:text-sm text-gray-900 truncate">{shippingDetails.address || 'N/A'}</p>
                  <p className="text-[10px] sm:text-xs text-gray-600 truncate">
                    {[shippingDetails.city, shippingDetails.postalCode || shippingDetails.postcode].filter(Boolean).join(', ')}
                  </p>
                  {shippingDetails.country && (
                    <p className="text-[10px] sm:text-xs text-gray-600">{shippingDetails.country}</p>
                  )}
                </div>
              </div>
              {/* Tracking Number & Note Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {/* Tracking Number */}
                <div className="bg-white rounded-lg p-1.5 sm:p-2 border border-gray-200">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-1">Tracking Number</p>
                  {shippingDetails.trackingNumber ? (
                    <p className="text-xs sm:text-sm text-gray-900 font-mono break-all">{shippingDetails.trackingNumber}</p>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-400 italic">Not available</p>
                  )}
                </div>

                {/* Note */}
                <div className="bg-white rounded-lg p-1.5 sm:p-2 border border-gray-200">
                  <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase mb-1">Note</p>
                  {shippingDetails.notes ? (
                    <p className="text-xs sm:text-sm text-gray-900 line-clamp-2" title={shippingDetails.notes}>{shippingDetails.notes}</p>
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-400 italic">No note</p>
                  )}
                </div>
              </div>
              {/* Payment Summary */}
              <div className="bg-white rounded-lg p-1.5 sm:p-2 border border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-[10px] sm:text-xs font-semibold text-gray-500 uppercase">Payment</p>
                    <p className="text-xs sm:text-sm text-gray-900">{paymentDetails.paymentMethod || paymentDetails.method || 'Card Payment'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] sm:text-xs text-gray-500">Total</p>
                    <p className="text-base sm:text-lg font-bold text-gray-900">{formatCurrency(orderDetails.totalOrderValue)}</p>
                  </div>
                </div>
              </div>


            </div>
          )}
        </div>
      )}

      {/* Tags Row */}
      {userId && conversationId && (
        <div className="px-2 sm:px-3 md:px-4 py-2 sm:py-3 border-t border-gray-200">
          <TagSelector
            userId={userId}
            conversationId={conversationId}
            orderId={orderId}
            currentTags={tags}
            onTagsUpdate={handleTagsUpdate}
          />
        </div>
      )}
    </div>
  );
};

ChatHeader.propTypes = {
  selectedUser: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string
  }),
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string,
      orderId: PropTypes.string,
      sender: PropTypes.string,
      readStatus: PropTypes.bool
    })
  ),
  onBack: PropTypes.func,
  showBackButton: PropTypes.bool,
  orderNumber: PropTypes.string,
  userId: PropTypes.string,
  conversationId: PropTypes.string,
  orderId: PropTypes.string,
  onSendEmail: PropTypes.func,
  onReadStatusToggle: PropTypes.func
};

export default ChatHeader;
