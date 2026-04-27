import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import ordersService from '../../service/ordersService';
import { getOrderLineItemImageUrl } from '../../utils/orderItemImageUrl';

const STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Shipped', label: 'Shipped' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Refunded', label: 'Refunded' },
  { value: 'Failed', label: 'Failed' },
];

const PROVIDER_OPTIONS = [
  { value: 'Royal Mail', label: 'Royal Mail' },
  { value: 'DPD', label: 'DPD' },
  { value: 'FedEx', label: 'FedEx' },
  { value: 'UPS', label: 'UPS' },
  { value: 'Evri', label: 'Evri' },
  { value: 'DHL', label: 'DHL' },
  { value: 'Other', label: 'Other' },
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ShippingUpdateModal = ({
  isOpen,
  onClose,
  onSubmit,
  currentStatus,
  currentProvider,
  currentTrackingNumber,
  currentNotes,
  orderTotal,
  isLoading,
  orderDetails,
  isLoadingOrderDetails,
}) => {
  const [status, setStatus] = useState('Shipped');
  const [provider, setProvider] = useState(currentProvider || 'Royal Mail');
  const [trackingNumber, setTrackingNumber] = useState(currentTrackingNumber || '');
  const [notes, setNotes] = useState(currentNotes || '');
  const [refundType, setRefundType] = useState('full');
  const [refundAmount, setRefundAmount] = useState('');
  const [errors, setErrors] = useState({});
  const notesRef = useRef(null);

  // Cart details state
  const [cartDetails, setCartDetails] = useState([]);
  const [isLoadingCart, setIsLoadingCart] = useState(false);

  const handleTrackingNumberKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      notesRef.current?.focus();
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Default status to "Shipped"
      setStatus('Shipped');
      setProvider(currentProvider || 'Royal Mail');
      setTrackingNumber(currentTrackingNumber || '');
      setNotes(currentNotes || '');
      setRefundType('full');
      setRefundAmount('');
      setErrors({});
      setCartDetails([]);
    }
  }, [isOpen, currentProvider, currentTrackingNumber, currentNotes]);

  // Fetch complete cart details when order details are available
  useEffect(() => {
    const fetchCartDetails = async () => {
      if (isOpen && orderDetails?._id) {
        setIsLoadingCart(true);
        try {
          const response = await ordersService.getOrderCart(orderDetails._id);
          if (response.success && response.cart) {
            setCartDetails(response.cart);
          }
        } catch (error) {
          console.error('Error fetching cart details:', error);
        } finally {
          setIsLoadingCart(false);
        }
      }
    };

    fetchCartDetails();
  }, [isOpen, orderDetails?._id]);

  const isFormComplete = () => {
    // Tracking number is required only when status is Shipped
    if (status === 'Shipped') {
      if (!trackingNumber || trackingNumber.trim() === '') {
        return false;
      }
    }

    if (status === 'Refunded') {
      if (refundType === 'partial') {
        const amount = parseFloat(refundAmount);
        if (!refundAmount || isNaN(amount) || amount <= 0 || amount > orderTotal) {
          return false;
        }
      }
    }
    return true;
  };

  const validateForm = () => {
    const newErrors = {};

    // Tracking number is required only when status is Shipped
    if (status === 'Shipped') {
      if (!trackingNumber || trackingNumber.trim() === '') {
        newErrors.trackingNumber = 'Tracking number is required';
      }
    }

    if (status === 'Refunded') {
      if (refundType === 'partial') {
        if (!refundAmount || parseFloat(refundAmount) <= 0) {
          newErrors.refundAmount = 'Refund amount must be greater than 0';
        } else if (parseFloat(refundAmount) > orderTotal) {
          newErrors.refundAmount = `Refund amount cannot exceed order total (£${orderTotal})`;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      const updateData = {
        status,
      };

      // Only include shipping details when status is Shipped
      if (status === 'Shipped') {
        updateData.shippingDetails = {
          provider,
          trackingNumber,
          notes,
        };
      }

      if (status === 'Refunded') {
        updateData.refund = {
          refundType,
          refundAmount: refundType === 'full' ? orderTotal : parseFloat(refundAmount),
        };
      }

      onSubmit(updateData);
    }
  };

  const handleClose = () => {
    setStatus('Shipped');
    setProvider(currentProvider || 'Royal Mail');
    setTrackingNumber(currentTrackingNumber || '');
    setNotes(currentNotes || '');
    setRefundType('full');
    setRefundAmount('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50 overflow-y-auto"
      onClick={handleClose}
    >
      <div
        className="relative p-4 w-full max-w-3xl max-h-full"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-white rounded-lg shadow">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
            <h3 className="text-lg font-semibold text-gray-900">
              Update Order Status
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-blue-200 hover:text-blue-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
              onClick={handleClose}
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

          {/* Modal Body */}
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Loading State */}
              {isLoadingOrderDetails && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span className="ml-2 text-gray-600">Loading order details...</span>
                </div>
              )}

              {/* Order Info Header */}
              {orderDetails && !isLoadingOrderDetails && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-md font-semibold text-gray-900">Order #{orderDetails.orderNumber}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(orderDetails.createdAt).toLocaleDateString('en-GB', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  {/* Customer Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Customer</p>
                      <p className="text-sm font-medium text-gray-900">
                        {orderDetails.shippingDetails?.firstName} {orderDetails.shippingDetails?.lastName}
                      </p>
                      <p className="text-xs text-gray-600">{orderDetails.contactDetails?.email}</p>
                      <p className="text-xs text-gray-600">{orderDetails.contactDetails?.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Shipping Address</p>
                      <p className="text-sm text-gray-700">
                        {orderDetails.shippingDetails?.address}
                        {orderDetails.shippingDetails?.apartment && `, ${orderDetails.shippingDetails.apartment}`}
                      </p>
                      <p className="text-sm text-gray-700">
                        {orderDetails.shippingDetails?.city}, {orderDetails.shippingDetails?.postalCode}
                      </p>
                      <p className="text-sm text-gray-700">{orderDetails.shippingDetails?.country}</p>
                    </div>
                  </div>

                  {/* Cart Items - Using detailed cart API */}
                  <div>
                    <p className="text-xs text-gray-500 mb-2">
                      Cart Items ({cartDetails.length > 0 ? cartDetails.length : orderDetails.cart?.length || 0})
                    </p>
                    {isLoadingCart ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        <span className="ml-2 text-xs text-gray-500">Loading cart details...</span>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {(cartDetails.length > 0 ? cartDetails : orderDetails.cart || []).map((item, index) => {
                          const lineImageUrl = getOrderLineItemImageUrl(item, BACKEND_URL);
                          return (
                          <div
                            key={item._id || index}
                            className={`p-3 rounded-lg border shadow-sm ${
                              item.isTradeIn
                                ? 'bg-orange-50 border-orange-200'
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            {/* Trade-In Badge */}
                            {item.isTradeIn && (
                              <div className="flex items-center gap-1 mb-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                  </svg>
                                  Trade-In
                                </span>
                              </div>
                            )}

                            <div className="flex items-start gap-3">
                              {/* Product Image */}
                              {lineImageUrl ? (
                                <img
                                  src={lineImageUrl}
                                  alt={item.productName}
                                  className={`w-16 h-16 object-cover rounded-md border ${
                                    item.isTradeIn ? 'border-orange-200' : 'border-gray-100'
                                  }`}
                                />
                              ) : item.isTradeIn ? (
                                <div className="w-16 h-16 bg-orange-100 rounded-md border border-orange-200 flex items-center justify-center">
                                  <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              ) : null}

                              <div className="flex-1 min-w-0">
                                {/* Product Name */}
                                <p className="text-sm font-semibold text-gray-900 mb-1">{item.productName}</p>

                                {/* Variant Name */}
                                {item.name && (
                                  <p className="text-xs text-gray-600 mb-2">{item.name}</p>
                                )}

                                {/* Trade-In Specific Details */}
                                {item.isTradeIn && item.tradeInData && (
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs mb-2">
                                    {item.tradeInData.categoryName && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-500">Category:</span>
                                        <span className="font-medium text-gray-700">{item.tradeInData.categoryName}</span>
                                      </div>
                                    )}
                                    {item.tradeInData.storage && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-500">Storage:</span>
                                        <span className="font-medium text-gray-700">{item.tradeInData.storage}</span>
                                      </div>
                                    )}
                                    {item.tradeInData.condition && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-500">Condition:</span>
                                        <span className="font-medium text-gray-700">{item.tradeInData.condition}</span>
                                      </div>
                                    )}
                                    {item.tradeInData.network && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-500">Network:</span>
                                        <span className="font-medium text-gray-700">{item.tradeInData.network}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Regular Product Details Grid */}
                                {!item.isTradeIn && (
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    {item.SKU && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-500">SKU:</span>
                                        <span className="font-medium text-gray-700">{item.SKU}</span>
                                      </div>
                                    )}
                                    {item.EIN && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-500">EIN:</span>
                                        <span className="font-medium text-gray-700">{item.EIN}</span>
                                      </div>
                                    )}
                                    <div className="flex items-center gap-1">
                                      <span className="text-gray-500">Qty:</span>
                                      <span className="font-medium text-gray-700">{item.qty}</span>
                                    </div>
                                    {item.selectedSim && (
                                      <div className="flex items-center gap-1">
                                        <span className="text-gray-500">SIM:</span>
                                        <span className="font-medium text-gray-700">{item.selectedSim}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Price Section */}
                              <div className="text-right flex-shrink-0">
                                {item.isTradeIn ? (
                                  <>
                                    <p className="text-sm font-bold text-orange-600">-£{item.salePrice?.toFixed(2)}</p>
                                    <p className="text-xs text-orange-500">Trade-In Value</p>
                                  </>
                                ) : (
                                  <>
                                    <p className="text-sm font-bold text-primary">£{item.salePrice?.toFixed(2)}</p>
                                    {item.Price && item.Price !== item.salePrice && (
                                      <p className="text-xs text-gray-400 line-through">£{item.Price?.toFixed(2)}</p>
                                    )}
                                    {item.qty > 1 && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        Total: £{(item.salePrice * item.qty).toFixed(2)}
                                      </p>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Order Total - Only regular products, ignoring trade-in */}
                  <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Order Total</span>
                    <span className="text-lg font-bold text-primary">
                      £{(() => {
                        const cartItems = cartDetails.length > 0 ? cartDetails : orderDetails.cart || [];
                        const regularItems = cartItems.filter(item => !item.isTradeIn);
                        const total = regularItems.reduce((sum, item) => sum + (item.salePrice * item.qty), 0);
                        return total.toFixed(2);
                      })()}
                    </span>
                  </div>

                  {/* Return Status Tags - Only show if return request initiated */}
                  {orderDetails.returnRequestInitiated && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-500 mb-2">Return Status</p>
                      <div className="flex flex-wrap gap-3">
                        {/* Return Request Status */}
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div>
                            <span className="text-xs font-medium text-gray-700">Return Request</span>
                            <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-yellow-100 text-yellow-800">
                              Pending
                            </span>
                          </div>
                          {orderDetails.returnRequestId && (
                            <a
                              href={`/admin/edit-return-request/${orderDetails.returnRequestId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-yellow-600 hover:text-yellow-800 hover:underline"
                            >
                              View
                            </a>
                          )}
                        </div>

                        {/* Return Order Status */}
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            orderDetails.returnOrderId ? 'bg-blue-500' : 'bg-gray-300 animate-pulse'
                          }`}></div>
                          <div>
                            <span className="text-xs font-medium text-gray-700">Return Order</span>
                            {orderDetails.returnOrderId ? (
                              <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800">
                                Converted
                              </span>
                            ) : (
                              <span className="ml-2 text-xs text-gray-400">Awaiting...</span>
                            )}
                          </div>
                          {orderDetails.returnOrderId && (
                            <a
                              href={`/admin/edit-return-orders/${orderDetails.returnOrderId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[10px] text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              View
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Dropdown */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-900 mb-2">
                  Order Status <span className="text-red-600">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Refund Fields - Only show when Refunded is selected */}
              {status === 'Refunded' && (
                <div className="border border-orange-200 bg-orange-50 rounded-lg p-4">
                  <h4 className="text-md font-semibold text-orange-800 mb-4">Refund Details</h4>

                  {/* Refund Type */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-900 mb-3">
                      Refund Type <span className="text-red-600">*</span>
                    </label>
                    <div className="flex gap-6">
                      <div className="flex items-center">
                        <input
                          id="refund-full"
                          type="radio"
                          name="refundType"
                          value="full"
                          checked={refundType === 'full'}
                          onChange={(e) => setRefundType(e.target.value)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="refund-full" className="ml-2 text-sm font-medium text-gray-900">
                          Full Refund (£{orderTotal?.toFixed(2) || '0.00'})
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="refund-partial"
                          type="radio"
                          name="refundType"
                          value="partial"
                          checked={refundType === 'partial'}
                          onChange={(e) => setRefundType(e.target.value)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                        />
                        <label htmlFor="refund-partial" className="ml-2 text-sm font-medium text-gray-900">
                          Partial Refund
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Refund Amount (only for partial) */}
                  {refundType === 'partial' && (
                    <div>
                      <label htmlFor="refundAmount" className="block text-sm font-medium text-gray-900 mb-2">
                        Refund Amount <span className="text-red-600">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          £
                        </span>
                        <input
                          type="number"
                          id="refundAmount"
                          step="0.01"
                          min="0.01"
                          max={orderTotal}
                          value={refundAmount}
                          onChange={(e) => setRefundAmount(e.target.value)}
                          className={`block w-full pl-8 rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ${
                            errors.refundAmount ? 'ring-red-500' : 'ring-gray-300'
                          } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                          placeholder="0.00"
                        />
                      </div>
                      {errors.refundAmount && (
                        <p className="mt-1 text-sm text-red-600">{errors.refundAmount}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        Maximum refund amount: £{orderTotal?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Shipping Fields - Only show when Shipped is selected */}
              {status === 'Shipped' && (
                <>
                  {/* Shipping Provider */}
                  <div>
                    <label htmlFor="provider" className="block text-sm font-medium text-gray-900 mb-2">
                      Shipping Provider
                    </label>
                    <select
                      id="provider"
                      name="provider"
                      value={provider}
                      onChange={(e) => setProvider(e.target.value)}
                      className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    >
                      {PROVIDER_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tracking Number */}
                  <div>
                    <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-900 mb-2">
                      Tracking Number <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      id="trackingNumber"
                      name="trackingNumber"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      onKeyDown={handleTrackingNumberKeyDown}
                      className={`block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ${
                        errors.trackingNumber ? 'ring-red-500' : 'ring-gray-300'
                      } placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6`}
                      placeholder="Enter tracking number"
                    />
                    {errors.trackingNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.trackingNumber}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-medium text-gray-900 mb-2">
                      Notes
                    </label>
                    <textarea
                      ref={notesRef}
                      id="notes"
                      name="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      className="block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      placeholder="Add any notes here..."
                    />
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 md:p-5 border-t border-gray-200 rounded-b">
              <button
                type="button"
                onClick={handleClose}
                disabled={isLoading}
                className="text-gray-700 bg-gray-200 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!isFormComplete() || isLoading}
                className={`text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center focus:ring-4 focus:outline-none flex items-center gap-2 ${
                  isFormComplete() && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 cursor-pointer'
                    : 'bg-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Updating...
                  </>
                ) : (
                  'Update Status'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

ShippingUpdateModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  currentStatus: PropTypes.string,
  currentProvider: PropTypes.string,
  currentTrackingNumber: PropTypes.string,
  currentNotes: PropTypes.string,
  orderTotal: PropTypes.number,
  isLoading: PropTypes.bool,
  orderDetails: PropTypes.object,
  isLoadingOrderDetails: PropTypes.bool,
};

export default ShippingUpdateModal;
