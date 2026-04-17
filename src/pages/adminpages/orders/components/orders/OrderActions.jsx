import { Link } from "react-router-dom";
import PropTypes from "prop-types";

const OrderActions = ({
  order,
  handleDelete,
  handleOpenReturnModal,
  handleOpenShipModal,
  handleOpenMessageModal,
  unreadCount = 0,
}) => {
  return (
    <td className="whitespace-nowrap p-2 text-center text-sm font-medium">
      <div className="flex flex-col 2xl:grid xl:grid-cols-2 gap-1.5">
        {/* Edit Button - Soft Blue */}
        <Link
          to={`/admin/orderdetails/${order._id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 hover:border-blue-300 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          Edit
        </Link>

        {/* Ship Button - Soft Indigo */}
        <button
          onClick={() => handleOpenShipModal(order._id)}
          className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 hover:border-indigo-300 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          Ship
        </button>

        {/* Return Button - Soft Orange */}
        <button
          className="w-full bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 hover:border-orange-300 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          onClick={() => handleOpenReturnModal(order._id, order)}
        >
          Return
        </button>

        {/* Chat Button - Soft Purple with Unread Badge */}
        <button
          onClick={() => handleOpenMessageModal(order)}
          className="relative w-full bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 hover:border-purple-300 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          Chat
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Delete Button - Soft Red */}
        <button
          onClick={() => handleDelete(order._id)}
          className="col-span-1 xl:col-span-2 w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
        >
          Delete
        </button>
      </div>
    </td>
  );
};

OrderActions.propTypes = {
  order: PropTypes.object.isRequired,
  handleDelete: PropTypes.func.isRequired,
  handleOpenReturnModal: PropTypes.func.isRequired,
  handleOpenShipModal: PropTypes.func.isRequired,
  handleOpenMessageModal: PropTypes.func.isRequired,
  unreadCount: PropTypes.number,
};

export default OrderActions;
