import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import OrderStatusCell from "./OrderStatusCell";
import OrderActions from "./OrderActions";
import OrderDetailsCell from "./OrderDetailsCell";

const OrderRow = ({
  order,
  formatDate,
  calculateDiscountedPrice,
  handleOpenModal,
  handleDelete,
  handleOpenReturnModal,
  handleOpenStatusModal,
  handleOpenShipModal,
  handleOpenMessageModal,
  isSelected = false,
  onSelectOrder = () => {},
  unreadCount = 0,
}) => {
  // Format date and time separately
  const dateObj = new Date(order.createdAt);
  const formattedDate = dateObj.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  // Handle both array and object coupon formats
  const coupon = Array.isArray(order.coupon) ? order.coupon[0] : order.coupon;
  const hasCoupon = !!coupon?.code;

  return (
    <tr key={order._id} className={`border-b border-gray-200 hover:bg-gray-50 ${isSelected ? "bg-blue-50" : ""}`}>
      {/* Checkbox Column */}
      <td className="px-4 py-4 w-12">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelectOrder(order._id)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
        />
      </td>
      {/* Column 1: Order Info (Date, Time, Order Number) */}
      <td className="px-6 py-4">
        <div className="flex flex-col items-start gap-1.5">
          <Link
            to={`/admin/orderdetails/${order._id}`}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline"
          >
            {order.orderNumber}
          </Link>
          <div className="text-xs text-gray-500">{formattedDate}</div>
          <div className="text-xs text-gray-500">{formattedTime}</div>

          {/* Return Status - Show based on conversion state */}
          {order.returnRequestInitiated && (
            order.returnOrderId ? (
              // If converted, only show Return Order with checkmark icon
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[10px] text-blue-600 font-medium">Return Order</span>
              </div>
            ) : (
              // If not converted, show Return Request Pending and Return Order Awaiting
              <>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span className="text-[10px] text-gray-500">Return Request</span>
                  <span className="px-1 py-0.5 rounded text-[9px] font-medium bg-yellow-100 text-yellow-700">
                    Pending
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"></div>
                  <span className="text-[10px] text-gray-500">Return Order</span>
                  <span className="text-[10px] text-gray-400">Awaiting...</span>
                </div>
              </>
            )
          )}
        </div>
      </td>

      {/* Column 2: Customer Info (Name, Email, Phone) */}
      <td className="p-2">
        <div className="flex flex-col items-start gap-1">
          <div className="font-medium text-gray-900 text-sm">
            {order.shippingDetails?.firstName} {order.shippingDetails?.lastName}
          </div>
          <div className="text-xs text-gray-600">
            {order?.contactDetails?.email || "-"}
          </div>
          <div className="text-xs text-gray-600">
            {order?.contactDetails?.phoneNumber || "-"}
          </div>
        </div>
      </td>

      {/* Column 3: Order Details (Products with images, names, SKU, Qty, Total) */}
      <td className="p-2">
        <OrderDetailsCell orderId={order._id} />
      </td>

      {/* Column 4: Coupon */}
      <td className="p-2 text-center">
        <span
          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
            hasCoupon
              ? "bg-yellow-50 text-yellow-800 ring-yellow-200"
              : "bg-blue-50 text-primary ring-primary/20"
          }`}
        >
          {hasCoupon ? <span>{coupon.code}</span> : <span>No Coupon</span>}
        </span>
      </td>

      {/* Column 5: Order Status */}
      <td className="p-2 text-center">
        <OrderStatusCell
          order={order}
          handleOpenStatusModal={handleOpenStatusModal}
        />
      </td>

      {/* Column 6: Actions (Edit, Ship, Return, Delete) */}
      <td className="px-6 py-4 text-center">
        <OrderActions
          order={order}
          handleDelete={handleDelete}
          handleOpenReturnModal={handleOpenReturnModal}
          handleOpenShipModal={handleOpenShipModal}
          handleOpenMessageModal={handleOpenMessageModal}
          unreadCount={unreadCount}
        />
      </td>
    </tr>
  );
};

OrderRow.propTypes = {
  order: PropTypes.object.isRequired,
  formatDate: PropTypes.func.isRequired,
  calculateDiscountedPrice: PropTypes.func.isRequired,
  handleOpenModal: PropTypes.func.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleOpenReturnModal: PropTypes.func.isRequired,
  handleOpenStatusModal: PropTypes.func.isRequired,
  handleOpenShipModal: PropTypes.func.isRequired,
  handleOpenMessageModal: PropTypes.func.isRequired,
  isSelected: PropTypes.bool,
  onSelectOrder: PropTypes.func,
  unreadCount: PropTypes.number,
};

export default OrderRow;
