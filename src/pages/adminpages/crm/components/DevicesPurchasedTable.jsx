import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(value).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const DevicesPurchasedTable = ({ devices = [] }) => (
  <div className="overflow-x-auto rounded-lg border border-gray-200">
    <table className="w-full text-sm text-left text-gray-600">
      <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase text-gray-700">
        <tr>
          <th className="px-4 py-3 font-bold">Product</th>
          <th className="px-4 py-3 font-bold">Variant</th>
          <th className="px-4 py-3 font-bold">SKU</th>
          <th className="px-4 py-3 font-bold">Qty</th>
          <th className="px-4 py-3 font-bold">Price</th>
          <th className="px-4 py-3 font-bold">Order</th>
          <th className="px-4 py-3 font-bold">Date</th>
        </tr>
      </thead>
      <tbody>
        {devices.length === 0 ? (
          <tr>
            <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
              No purchased devices found.
            </td>
          </tr>
        ) : (
          devices.map((item, index) => (
            <tr key={`${item.orderId}-${item.productId}-${index}`} className="border-b bg-white hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-900">{item.productName || '—'}</td>
              <td className="px-4 py-3">{item.variantName || '—'}</td>
              <td className="px-4 py-3">{item.sku || '—'}</td>
              <td className="px-4 py-3">{item.qty ?? 1}</td>
              <td className="px-4 py-3">
                {item.price != null ? `£${Number(item.price).toFixed(2)}` : '—'}
              </td>
              <td className="px-4 py-3">
                <Link
                  to={`/admin/orderdetails/${item.orderId}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {item.orderNumber || 'View'}
                </Link>
              </td>
              <td className="px-4 py-3">{formatDate(item.orderDate)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

DevicesPurchasedTable.propTypes = {
  devices: PropTypes.arrayOf(PropTypes.object),
};

export default DevicesPurchasedTable;
