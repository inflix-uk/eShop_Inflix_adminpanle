import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const OrderCard = ({
  order,
  formatDate,
  calculateDiscountedPrice,
  handleOpenModal,
  handleDelete,
  handleOpenReturnModal,
  handleOpenStatusModal,
  handleOpenShipModal,
  handleOpenMessageModal,
  unreadCount = 0,
}) => {
  const formattedDate = formatDate(order.createdAt);

  // Handle both array and object coupon formats
  const coupon = Array.isArray(order.coupon) ? order.coupon[0] : order.coupon;
  const hasCoupon = !!coupon?.code;

  const getStatusStyle = (status) => {
    const statusStyles = {
      Pending: "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200",
      Shipped: "bg-blue-50 text-blue-800 ring-1 ring-blue-200",
      Approved: "bg-blue-50 text-blue-800 ring-1 ring-blue-200",
      Delivered: "bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200",
      Failed: "bg-red-50 text-red-800 ring-1 ring-red-200",
      Deleted: "bg-red-50 text-red-900 ring-1 ring-red-200",
      Refunded: "bg-purple-50 text-purple-800 ring-1 ring-purple-200",
      Cancelled: "bg-orange-50 text-orange-800 ring-1 ring-orange-200",
    };
    return (
      statusStyles[status] || "bg-gray-50 text-gray-800 ring-1 ring-gray-200"
    );
  };

  const orderValue = order.totalOrderValue
    ? order.totalOrderValue.toFixed(2)
    : calculateDiscountedPrice(order.cartTotal || 0, coupon);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200/50 p-6 hover:shadow-xl ease-in-out hover:scale-105 transition-all duration-500 hover:border-blue-300">
      {/* Header: Order Number and Status */}
      <div className="flex justify-between items-start mb-5">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-gray-900">
            {order.orderNumber}
          </h2>
        </div>
        <span
          className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer hover:opacity-90 transition-all ${getStatusStyle(
            order.status
          )}`}
          onClick={() => handleOpenStatusModal(order._id)}
        >
          {order.status}
        </span>
      </div>

      {/* Customer Information */}
      <div className="mb-5 pb-5 border-b border-gray-200">
        <div className="font-bold text-gray-900 mb-1.5 text-base">
          {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}
        </div>
        <div className="text-sm text-gray-600 mb-2">
          {order?.contactDetails?.email}
        </div>
        <div className="text-xs text-gray-500">{formattedDate}</div>
      </div>

      {/* Order Summary */}
      <div className="mb-5 space-y-3.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Items
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {order.cartItemsCount || 0}
            </span>
            <svg
              className="text-blue-600 cursor-pointer size-5 hover:opacity-80 transition-opacity"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              onClick={() => handleOpenModal(order._id)}
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
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Coupon
          </span>
          <span
            className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold ${
              hasCoupon
                ? "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200"
                : "bg-blue-50 text-blue-800 ring-1 ring-blue-200"
            }`}
          >
            {hasCoupon ? coupon.code : "No Coupon"}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Ship
          </span>
          <button
            onClick={() => handleOpenShipModal(order._id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-xs transition-colors shadow-md hover:shadow-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"
              />
            </svg>
            Ship
          </button>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-medium">
            Value
          </span>
          <span
            className={`inline-flex items-center rounded-lg px-3 py-1 text-xs font-semibold ${
              hasCoupon
                ? "bg-yellow-50 text-yellow-800 ring-1 ring-yellow-200"
                : "bg-blue-50 text-blue-800 ring-1 ring-blue-200"
            }`}
          >
            £{orderValue}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 pt-5 border-t border-gray-200">
        <button
          onClick={() => handleOpenModal(order._id)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white px-4 py-2.5 rounded-lg font-semibold hover:from-blue-400 hover:to-blue-600 transition-all duration-400 text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          View
        </button>
        <Link
          to={`/admin/orderdetails/${order._id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-md"
          title="Edit"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </Link>
        <button
          onClick={() => handleOpenMessageModal(order)}
          className="relative p-2.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200 hover:shadow-md"
          title="Send Message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
            />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
        <button
          onClick={() => handleDelete(order._id)}
          className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md"
          title="Delete"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
            />
          </svg>
        </button>
        <button
          onClick={() => handleOpenReturnModal(order._id, order)}
          className="p-2.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:shadow-md"
          title="Return"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

OrderCard.propTypes = {
  order: PropTypes.object.isRequired,
  formatDate: PropTypes.func.isRequired,
  calculateDiscountedPrice: PropTypes.func.isRequired,
  handleOpenModal: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleOpenReturnModal: PropTypes.func.isRequired,
  handleOpenStatusModal: PropTypes.func.isRequired,
  handleOpenShipModal: PropTypes.func.isRequired,
  handleOpenMessageModal: PropTypes.func.isRequired,
  unreadCount: PropTypes.number,
};

export default OrderCard;
