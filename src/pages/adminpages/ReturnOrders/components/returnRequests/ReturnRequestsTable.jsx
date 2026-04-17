import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

/**
 * Return Requests Table Component
 * Displays a table of return requests
 */
const ReturnRequestsTable = ({ returnRequests, formatDate, onDelete, onStatusChange }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-400';
      case 'Accepted':
        return 'bg-blue-600';
      case 'Rejected':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  const handleDelete = (requestId, requestNumber) => {
    if (window.confirm(`Are you sure you want to delete return request ${requestNumber}?`)) {
      onDelete(requestId);
    }
  };

  const handleAccept = (requestId, requestNumber) => {
    if (window.confirm(`Accept return request ${requestNumber}?`)) {
      onStatusChange(requestId, 'Accepted');
    }
  };

  const handleReject = (requestId, requestNumber) => {
    if (window.confirm(`Reject return request ${requestNumber}?`)) {
      onStatusChange(requestId, 'Rejected');
    }
  };

  return (
    <div className="relative shadow-lg rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-lg font-semibold mb-4">
        Recent Return Requests ({returnRequests.slice(0, 10).length})
      </p>
      <div className="overflow-x-auto scrollbar-thin scrollbar-webkit">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-black uppercase border-b border-gray-200 text-center">
            <tr>
              <th className="px-6 py-3 font-semibold">RIM</th>
              <th className="px-6 py-3 font-semibold">Order No</th>
              <th className="px-6 py-3 font-semibold">Customer</th>
              <th className="px-6 py-3 font-semibold">Date Requested</th>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white text-center">
            {returnRequests.slice(0, 10).map((request) => (
              <tr key={request._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-6 py-3">
                  <Link
                    to={`/admin/edit-return-request/${request._id}`}
                    className="text-black hover:underline font-medium"
                  >
                    {request.requestOrderNumber}
                  </Link>
                </td>
                <td className="px-6 py-3">{request.orderId?.orderNumber}</td>
                <td className="px-6 py-3">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {request.userId?.firstname} {request.userId?.lastname}
                    </span>
                    <span className="text-xs text-gray-500">
                      {request.userId?.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-3">{formatDate(request.createdAt)}</td>
                <td className="px-6 py-3">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-white ${getStatusColor(
                      request.status
                    )}`}
                  >
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      to={`/admin/edit-return-request/${request._id}`}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="View Details"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(request._id, request.requestOrderNumber)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    {/* Accept/Reject buttons - only show for Pending status */}
                    {request.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleAccept(request._id, request.requestOrderNumber)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium"
                          title="Accept"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(request._id, request.requestOrderNumber)}
                          className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs font-medium"
                          title="Reject"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {returnRequests.length > 10 && (
          <div className="mt-4 text-center">
            <Link
              to="/admin/return-requests"
              className="text-primary hover:underline font-medium"
            >
              View All Return Requests ({returnRequests.length})
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

ReturnRequestsTable.propTypes = {
  returnRequests: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      requestOrderNumber: PropTypes.string,
      orderId: PropTypes.shape({
        orderNumber: PropTypes.string
      }),
      userId: PropTypes.shape({
        firstname: PropTypes.string,
        lastname: PropTypes.string,
        email: PropTypes.string
      }),
      createdAt: PropTypes.string,
      status: PropTypes.string
    })
  ).isRequired,
  formatDate: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired
};

export default ReturnRequestsTable;
