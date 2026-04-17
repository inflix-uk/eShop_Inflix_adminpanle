import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import StatusDropdown from "../shared/StatusDropdown";

const OrdersTable = ({
  orders,
  editingStatus,
  selectedStatuses,
  onStatusChange,
  onSaveStatus,
  onEdit,
  onCancel,
  onOpenModal,
  onDelete,
  onOpenMessageModal,
  onOpenLabelModal,
  formatDate,
}) => {
  return (
    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400 table-fixed">
      <thead className="text-xs text-gray-700 uppercase border-b-2 border-gray-300 text-center bg-gradient-to-r from-gray-50 to-gray-100">
        <tr>
          <th
            scope="col"
            className="px-3 py-3.5 w-40 font-bold text-center tracking-wide"
          >
            RMA
          </th>
          <th scope="col" className="px-3 py-3.5 w-40 font-bold tracking-wide">
            Order No
          </th>
          <th scope="col" className="px-3 py-3.5 w-48 font-bold tracking-wide">
            Customer Details
          </th>
          <th scope="col" className="px-3 py-3.5 w-28 font-bold tracking-wide">
            Date Added
          </th>
          <th scope="col" className="px-3 py-3.5 w-16 font-bold tracking-wide">
            Items
          </th>
          <th scope="col" className="px-3 py-3.5 w-24 font-bold tracking-wide">
            Account
          </th>
          <th scope="col" className="px-3 py-3.5 w-28 font-bold tracking-wide">
            Platform
          </th>
          <th scope="col" className="px-3 py-3.5 w-32 font-bold tracking-wide">
            Customer Asks
          </th>
          <th scope="col" className="px-3 py-3.5 w-28 font-bold tracking-wide">
            Status
          </th>
          <th scope="col" className="px-3 py-3.5 w-32 font-bold tracking-wide">
            Action
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {orders.map((order) => {
          const formattedDate = formatDate(order.createdAt);

          return (
            <tr
              key={order._id}
              className="border-b border-gray-200 hover:bg-blue-50/50 transition-colors duration-150"
            >
              <td className="px-3 py-3">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Link
                    to={`/admin/edit-return-orders/${order._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                  >
                    {order.rma}
                  </Link>
                  {order?.requestOrder?.requestOrderNumber && (
                    <span className="text-xs text-gray-400 font-medium">
                      ({order.requestOrder.requestOrderNumber})
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-3">
                <div
                  className="text-sm text-gray-700 truncate font-mono"
                  title={
                    order?.requestOrder?.orderId?.orderNumber ||
                    order.orderNumber
                  }
                >
                  {order?.requestOrder?.orderId?.orderNumber ||
                    order.orderNumber}
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="flex flex-col min-w-0 space-y-0.5">
                  <span
                    className="text-sm font-semibold text-gray-900 truncate"
                    title={
                      order?.requestOrder?.userId?.firstname ||
                      order?.requestOrder?.userId?.lastname
                        ? `${order.requestOrder.userId.firstname} ${order.requestOrder.userId.lastname}`
                        : order.customerName
                    }
                  >
                    {order?.requestOrder?.userId?.firstname ||
                    order?.requestOrder?.userId?.lastname
                      ? `${order.requestOrder.userId.firstname} ${order.requestOrder.userId.lastname}`
                      : order.customerName}
                  </span>
                  {order.email && (
                    <span
                      className="text-xs text-gray-500 truncate"
                      title={order.email}
                    >
                      {order.email}
                    </span>
                  )}
                </div>
              </td>
              <td className="px-3 py-3 text-sm text-gray-600 whitespace-nowrap">
                {formattedDate}
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center justify-center">
                  <button
                    onClick={() => onOpenModal(order._id)}
                    className="p-1.5 rounded-md hover:bg-blue-100 transition-colors group"
                    title="View Items"
                  >
                    <svg
                      className="text-blue-600 group-hover:text-blue-700 size-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
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
                  </button>
                </div>
              </td>
              <td className="px-3 py-3">
                <span
                  className="text-sm text-gray-700 truncate block font-medium"
                  title={order.account || "Store"}
                >
                  {order.account || "Store"}
                </span>
              </td>
              <td className="px-3 py-3">
                <span
                  className="text-sm text-gray-700 truncate block capitalize"
                  title={order.platform || "Website"}
                >
                  {order.platform || "Website"}
                </span>
              </td>
              <td className="px-3 py-3">
                <span
                  className="text-sm text-gray-600 truncate block"
                  title={
                    order?.requestOrder?.reason || order?.customerAsks || ""
                  }
                >
                  {order?.requestOrder?.reason || order?.customerAsks || "—"}
                </span>
              </td>
              <td className="px-3 py-3">
                <div className="flex justify-center">
                  <StatusDropdown
                    order={order}
                    isEditing={editingStatus[order._id]}
                    selectedStatus={selectedStatuses[order._id]}
                    onStatusChange={onStatusChange}
                    onSave={onSaveStatus}
                    onCancel={() => onCancel(order._id)}
                    onEdit={() => onEdit(order._id)}
                  />
                </div>
              </td>
              <td className="px-3 py-3">
                <div className="flex gap-2 items-center justify-center">
                  <button
                    onClick={() => onOpenMessageModal(order)}
                    className="p-1.5 rounded-md text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-150 flex-shrink-0"
                    title="Send Message"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => onOpenLabelModal(order._id)}
                    className="p-1.5 rounded-md text-purple-600 hover:bg-purple-100 hover:text-purple-700 transition-all duration-150 flex-shrink-0"
                    title="Apply Label"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 6h.008v.008H6V6Z"
                      />
                    </svg>
                  </button>
                  <Link
                    to={`/admin/edit-return-orders/${order._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-md text-blue-600 hover:bg-blue-100 hover:text-blue-700 transition-all duration-150 flex-shrink-0"
                    title="Edit Order"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 7.125L16.862 4.487M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                      />
                    </svg>
                  </Link>
                  <button
                    onClick={() => onDelete(order._id)}
                    className="p-1.5 rounded-md text-red-600 hover:bg-red-100 hover:text-red-700 transition-all duration-150 flex-shrink-0"
                    title="Delete Order"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="2"
                      stroke="currentColor"
                      className="size-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

OrdersTable.propTypes = {
  orders: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      rma: PropTypes.string.isRequired,
      orderNumber: PropTypes.string,
      customerName: PropTypes.string,
      email: PropTypes.string,
      createdAt: PropTypes.string.isRequired,
      account: PropTypes.string,
      platform: PropTypes.string,
      customerAsks: PropTypes.string,
      status: PropTypes.string.isRequired,
      requestOrder: PropTypes.shape({
        requestOrderNumber: PropTypes.string,
        orderId: PropTypes.shape({
          orderNumber: PropTypes.string,
        }),
        userId: PropTypes.shape({
          _id: PropTypes.string,
          firstname: PropTypes.string,
          lastname: PropTypes.string,
        }),
        reason: PropTypes.string,
      }),
    })
  ).isRequired,
  editingStatus: PropTypes.object.isRequired,
  selectedStatuses: PropTypes.object.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onSaveStatus: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  onOpenModal: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onOpenMessageModal: PropTypes.func.isRequired,
  onOpenLabelModal: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
};

export default OrdersTable;
