import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const OrderHistoryTable = ({ orders = [] }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200">
    <table className="w-full text-sm text-left text-gray-600">
      <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-700">
        <tr>
          <th className="px-4 py-3 font-bold">Order #</th>
          <th className="px-4 py-3 font-bold">Date</th>
          <th className="px-4 py-3 font-bold">Status</th>
          <th className="px-4 py-3 font-bold">Items</th>
          <th className="px-4 py-3 font-bold">Total</th>
          <th className="px-4 py-3 font-bold">Actions</th>
        </tr>
      </thead>
      <tbody>
        {orders.length === 0 ? (
          <tr>
            <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
              No orders found for this customer.
            </td>
          </tr>
        ) : (
          orders.map((order) => (
            <tr key={order._id} className="border-b bg-white hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{order.orderNumber || '—'}</td>
              <td className="px-4 py-3">{formatDate(order.createdAt)}</td>
              <td className="px-4 py-3">
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                  {order.status || '—'}
                </span>
              </td>
              <td className="px-4 py-3">{order.cartItemsCount ?? 0}</td>
              <td className="px-4 py-3 font-medium">
                {order.totalOrderValue != null ? `£${Number(order.totalOrderValue).toFixed(2)}` : '—'}
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/admin/orderdetails/${order._id}`}
                  className="font-semibold text-primary hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

OrderHistoryTable.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.object),
};

export default OrderHistoryTable;
