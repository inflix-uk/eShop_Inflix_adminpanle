import { useRef } from "react";
import PropTypes from "prop-types";

const OrderInfo = ({
  orderDetail,
  updatedOrderDetails,
  isEditing,
  onInputChange,
  onShippingChange,
  formatDate,
  formatTime,
  onShippingUpdateClick,
}) => {
  const serialNumberRef = useRef(null);
  const notesRef = useRef(null);

  const handleTrackingNumberKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      notesRef.current?.focus();
    }
  };

  return (
    <div className="p-4 bg-transparent border rounded-lg">
      <h2 className="text-xl font-semibold ">Order Info</h2>
      <p>
        <span className="font-semibold">Order Date:</span>{" "}
        {formatDate(orderDetail.createdAt)}
      </p>
      <p>
        <span className="font-semibold">Order Time:</span>{" "}
        {formatTime(orderDetail.createdAt)}
      </p>

      <p>
        <span className="font-semibold">Payment:</span>{" "}
        {orderDetail?.paymentDetails?.cardDetails?.brand
          || orderDetail?.paymentDetails?.cardDetails?.payment_type
          || orderDetail?.paymentDetails?.paymentType
          || (orderDetail?.paymentDetails?.status === "succeeded" ? "Paid" : "Failed")}
      </p>

      <p>
        <span className="font-semibold">Coupon Code:</span>{" "}
        {orderDetail.coupon && orderDetail.coupon.map((itm) => itm.code)}
      </p>

      <div className="flex items-center justify-between my-4">
        <h2 className="text-xl font-semibold">Shipping Details</h2>
        {!isEditing && (
          <button
            onClick={onShippingUpdateClick}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Update Shipping
          </button>
        )}
      </div>
      <div className="border border-gray-300 rounded-lg p-4 w-full shadow-md">
        <div>
          <div className="">
            <span className="font-semibold mb-1">Status:</span>
            {isEditing ? (
              <select
                name="status"
                value={updatedOrderDetails.status}
                onChange={onInputChange}
                className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              >
                <option value="Pending">Pending</option>
                <option value="Shipped">Shipped</option>
                <option value="Approved">Approved</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Refunded">Refunded</option>
              </select>
            ) : (
              <p className="text-gray-900">{orderDetail.status}</p>
            )}
          </div>
        </div>
        <div className="">
          <h3 className="text-sm font-semibold mb-1 text-gray-700">
            Shipping Provider
          </h3>
          {isEditing ? (
            <select
              name="provider"
              value={updatedOrderDetails.shippingDetails.provider}
              onChange={onShippingChange}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            >
              <option value="Royal Mail">Royal Mail</option>
              <option value="DPD">DPD</option>
              <option value="FedEx">FedEx</option>
              <option value="UPS">UPS</option>
            </select>
          ) : (
            <p className="text-base text-gray-900">
              {orderDetail.shippingDetails.provider}
            </p>
          )}
        </div>
        <div>
          <h3 className="text-sm font-semibold mb-1 text-gray-700">
            Tracking Number
          </h3>
          {isEditing ? (
            <input
              type="text"
              name="trackingNumber"
              value={updatedOrderDetails.shippingDetails.trackingNumber}
              onChange={onShippingChange}
              onKeyDown={handleTrackingNumberKeyDown}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          ) : (
            <p className="text-base text-gray-900">
              {orderDetail.shippingDetails.trackingNumber}
            </p>
          )}
        </div>
        <div className="flex flex-col ">
          <label htmlFor="note" className="font-semibold mb-1">
            Note:
          </label>
          {isEditing ? (
            <textarea
              ref={notesRef}
              id="notes"
              name="notes"
              value={updatedOrderDetails.shippingDetails.notes || ""}
              onChange={onShippingChange}
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              rows={4}
              placeholder="Add any notes here..."
            />
          ) : (
            <p className="text-gray-900">
              {orderDetail.shippingDetails.notes || "No notes available"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

OrderInfo.propTypes = {
  orderDetail: PropTypes.shape({
    createdAt: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    paymentDetails: PropTypes.shape({
      cardDetails: PropTypes.shape({
        brand: PropTypes.string,
      }),
    }),
    coupon: PropTypes.arrayOf(
      PropTypes.shape({
        code: PropTypes.string,
      })
    ),
    shippingDetails: PropTypes.shape({
      provider: PropTypes.string,
      trackingNumber: PropTypes.string,
    }).isRequired,
  }).isRequired,
  updatedOrderDetails: PropTypes.shape({
    status: PropTypes.string.isRequired,
    shippingDetails: PropTypes.shape({
      provider: PropTypes.string,
      trackingNumber: PropTypes.string,
    }).isRequired,
  }).isRequired,
  isEditing: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onShippingChange: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  formatTime: PropTypes.func.isRequired,
  onShippingUpdateClick: PropTypes.func,
};

export default OrderInfo;
