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

const TradeInHistoryTable = ({ tradeIns = [] }) => (
  <div className="overflow-x-auto rounded-lg border border-orange-200">
    <table className="w-full text-sm text-left text-gray-600">
      <thead className="border-b border-orange-200 bg-orange-50 text-xs uppercase text-orange-900">
        <tr>
          <th className="px-4 py-3 font-bold">Device</th>
          <th className="px-4 py-3 font-bold">Brand</th>
          <th className="px-4 py-3 font-bold">Storage</th>
          <th className="px-4 py-3 font-bold">Condition</th>
          <th className="px-4 py-3 font-bold">Network</th>
          <th className="px-4 py-3 font-bold">Value</th>
          <th className="px-4 py-3 font-bold">Order</th>
          <th className="px-4 py-3 font-bold">Date</th>
        </tr>
      </thead>
      <tbody>
        {tradeIns.length === 0 ? (
          <tr>
            <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
              No trade-in history found.
            </td>
          </tr>
        ) : (
          tradeIns.map((item, index) => (
            <tr
              key={`${item.orderId}-trade-${index}`}
              className="border-b border-orange-100 bg-orange-50/40 hover:bg-orange-50"
            >
              <td className="px-4 py-3 font-medium text-gray-900">{item.productName || '—'}</td>
              <td className="px-4 py-3">{item.brandName || '—'}</td>
              <td className="px-4 py-3">{item.storageName || '—'}</td>
              <td className="px-4 py-3">{item.conditionName || '—'}</td>
              <td className="px-4 py-3">{item.network || '—'}</td>
              <td className="px-4 py-3 font-semibold text-orange-700">
                {item.tradeInValue != null ? `£${Number(item.tradeInValue).toFixed(2)}` : '—'}
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

TradeInHistoryTable.propTypes = {
  tradeIns: PropTypes.arrayOf(PropTypes.object),
};

export default TradeInHistoryTable;
