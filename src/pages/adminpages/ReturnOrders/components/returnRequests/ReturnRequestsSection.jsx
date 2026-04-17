import PropTypes from 'prop-types';
import ReturnRequestsStats from './ReturnRequestsStats';
import ReturnRequestsTable from './ReturnRequestsTable';

/**
 * Return Requests Section Component
 * Main component that combines stats and table for return requests
 */
const ReturnRequestsSection = ({
  returnRequests,
  returnRequestsStats,
  returnRequestsExpanded,
  setReturnRequestsExpanded,
  formatDate,
  onDeleteRequest,
  onStatusChange
}) => {
  return (
    <div className="mb-8">
      <div
        className="flex justify-between items-center mb-3 cursor-pointer bg-gray-100 p-4 rounded-lg hover:bg-gray-200"
        onClick={() => setReturnRequestsExpanded(!returnRequestsExpanded)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Return Requests
          </h2>
          <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {returnRequests.length}
          </span>
        </div>
        <svg
          className={`w-6 h-6 transition-transform ${
            returnRequestsExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>

      {returnRequestsExpanded && (
        <>
          <ReturnRequestsStats stats={returnRequestsStats} />
          <ReturnRequestsTable
            returnRequests={returnRequests}
            formatDate={formatDate}
            onDelete={onDeleteRequest}
            onStatusChange={onStatusChange}
          />
        </>
      )}
    </div>
  );
};

ReturnRequestsSection.propTypes = {
  returnRequests: PropTypes.array.isRequired,
  returnRequestsStats: PropTypes.shape({
    totalRequestOrders: PropTypes.number,
    TotalPendingRequestOrders: PropTypes.number,
    TotalAcceptedRequestOrders: PropTypes.number,
    TotalRejectedRequestOrders: PropTypes.number
  }).isRequired,
  returnRequestsExpanded: PropTypes.bool.isRequired,
  setReturnRequestsExpanded: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
  onDeleteRequest: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired
};

export default ReturnRequestsSection;
