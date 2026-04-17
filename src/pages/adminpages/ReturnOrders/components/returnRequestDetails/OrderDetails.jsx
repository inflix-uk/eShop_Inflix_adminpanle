import PropTypes from 'prop-types';
import {
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  CurrencyPoundIcon,
  CalendarIcon,
  ClockIcon,
  QueueListIcon,
} from '@heroicons/react/24/solid';

/**
 * Order Details Component
 * Displays order information for a return request
 */
const OrderDetails = ({ order, requestOrderNumber, status, statusLabels, createdAt, updatedAt }) => {
  if (!order) return null;

  return (
    <div className='w-full'>
      <h3 className="text-2xl font-bold mb-5 flex items-center text-gray-800">
        Order Details
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="flex items-center">
          <DocumentTextIcon className="text-primary w-5 h-5 mr-3" />
          <p className="text-gray-700">
            <span className="font-semibold">Order Number:</span> {order.orderNumber}
          </p>
        </div>
        <div className="flex items-center">
          <ClipboardDocumentCheckIcon className="text-primary w-5 h-5 mr-3" />
          <p className="text-gray-700">
            <span className="font-semibold">Order Status:</span> {statusLabels[status?.toLowerCase()] || status}
          </p>
        </div>
        <div className="flex items-center">
          <CurrencyPoundIcon className="text-primary w-5 h-5 mr-3" />
          <p className="text-gray-700">
            <span className="font-semibold">Total Order Value:</span> £{order.totalOrderValue}
          </p>
        </div>
        <div className="flex items-center">
          <CalendarIcon className="text-primary w-5 h-5 mr-3" />
          <p className="text-gray-700">
            <span className="font-semibold">Created At:</span> {new Date(createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center">
          <ClockIcon className="text-primary w-5 h-5 mr-3" />
          <p className="text-gray-700">
            <span className="font-semibold">Last Updated:</span> {new Date(updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center">
          <QueueListIcon className="text-primary w-5 h-5 mr-3" />
          <p className="text-gray-700">
            <span className="font-semibold">Request Order Number:</span> {requestOrderNumber}
          </p>
        </div>
      </div>
    </div>
  );
};

OrderDetails.propTypes = {
  order: PropTypes.shape({
    orderNumber: PropTypes.string,
    totalOrderValue: PropTypes.number,
  }),
  requestOrderNumber: PropTypes.string,
  status: PropTypes.string,
  statusLabels: PropTypes.object,
  createdAt: PropTypes.string,
  updatedAt: PropTypes.string,
};

export default OrderDetails;
