import PropTypes from "prop-types";

const OrderTableHeader = ({ isAllSelected = false, onSelectAll = () => {}, hasOrders = false }) => {
  return (
    <thead className="text-xs text-black font-uppercase border-b border-gray-200 text-center">
      <tr>
        <th scope="col" className="px-4 py-5 font-semibold w-12">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={onSelectAll}
            disabled={!hasOrders}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          />
        </th>
        <th scope="col" className="px-6 py-5 font-semibold">
          Order Info
        </th>
        <th scope="col" className="px-6 py-5 font-semibold">
          Customer Info
        </th>
        <th scope="col" className="px-6 py-5 font-semibold">
          Order Details
        </th>
        <th scope="col" className="px-6 py-5 font-semibold">
          Coupon
        </th>
        <th scope="col" className="px-6 py-5 font-semibold">
          Order Status
        </th>
        <th scope="col" className="px-6 py-5 font-semibold">
          Actions
        </th>
      </tr>
    </thead>
  );
};

OrderTableHeader.propTypes = {
  isAllSelected: PropTypes.bool,
  onSelectAll: PropTypes.func,
  hasOrders: PropTypes.bool,
};

export default OrderTableHeader;
