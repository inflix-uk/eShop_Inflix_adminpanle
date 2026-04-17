import PropTypes from "prop-types";

const OrderStatusCell = ({ order, handleOpenStatusModal }) => {
  const getStatusStyle = (status) => {
    const statusStyles = {
      Pending: "bg-yellow-50 text-yellow-800 ring-yellow-200",
      Shipped: "bg-blue-50 text-blue-800 ring-blue-200",
      Approved: "bg-blue-50 text-blue-800 ring-blue-200",
      Delivered: "bg-indigo-50 text-indigo-800 ring-indigo-200",
      Failed: "bg-red-50 text-red-600 ring-red-200",
      Deleted: "bg-red-50 text-red-900 ring-red-200",
      Refunded: "bg-purple-50 text-purple-800 ring-purple-200",
      Cancelled: "bg-orange-50 text-orange-800 ring-orange-200",
    };
    return statusStyles[status] || "bg-gray-50 text-gray-800 ring-gray-200";
  };

  return (
    <span
        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset cursor-pointer hover:opacity-80 transition-opacity ${getStatusStyle(
          order.status
        )}`}
        onClick={() => handleOpenStatusModal(order._id)}
      >
        {order.status}
      </span>
  );
};

OrderStatusCell.propTypes = {
  order: PropTypes.object.isRequired,
  handleOpenStatusModal: PropTypes.func.isRequired,
};

export default OrderStatusCell;
