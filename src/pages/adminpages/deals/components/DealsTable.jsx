import { useState } from 'react';
import PropTypes from 'prop-types';

const DealsTable = ({ deals, loading, onEdit, onDelete, onExpire, onUnexpire }) => {
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  // Status chip component
  const StatusChip = ({ status, type }) => {
    const getStatusConfig = () => {
      if (type === 'publish') {
        return status 
          ? { text: 'Published', className: 'bg-blue-100 text-blue-800' }
          : { text: 'Draft', className: 'bg-gray-100 text-gray-800' };
      }
      if (type === 'expired') {
        return status 
          ? { text: 'Expired', className: 'bg-red-100 text-red-800' }
          : { text: 'Active', className: 'bg-blue-100 text-blue-800' };
      }
      return { text: 'Unknown', className: 'bg-gray-100 text-gray-800' };
    };

    const config = getStatusConfig();
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    );
  };

  // Type chip component
  const TypeChip = ({ type }) => {
    const getTypeConfig = () => {
      switch (type) {
        case 'Deal':
          return { text: 'Deal', className: 'bg-purple-100 text-purple-800' };
        case 'Coupon':
          return { text: 'Coupon', className: 'bg-orange-100 text-orange-800' };
        default:
          return { text: type || 'Unknown', className: 'bg-gray-100 text-gray-800' };
      }
    };

    const config = getTypeConfig();
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.text}
      </span>
    );
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format date as display text (e.g., "1 January 2024")
  const formatDateDisplay = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort deals
  const sortedDeals = [...deals].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'createdAt' || sortField === 'expiryDate') {
      aValue = new Date(aValue || 0);
      bValue = new Date(bValue || 0);
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading deals...
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No deals found</h3>
        <p className="mt-1 text-sm text-gray-500">Get started by creating a new deal.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('title')}
              >
                <div className="flex items-center space-x-1">
                  <span>Title</span>
                  {sortField === 'title' && (
                    <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('type')}
              >
                <div className="flex items-center space-x-1">
                  <span>Type</span>
                  {sortField === 'type' && (
                    <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('expiryDate')}
              >
                <div className="flex items-center space-x-1">
                  <span>Expiry</span>
                  {sortField === 'expiryDate' && (
                    <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  {sortField === 'createdAt' && (
                    <svg className={`w-4 h-4 ${sortDirection === 'asc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedDeals.map((deal) => (
              <tr key={deal._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {deal.emoji && (
                      <span className="text-lg mr-2">{deal.emoji}</span>
                    )}
                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                      {deal.title}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <TypeChip type={deal.type} />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs">
                    <div className="truncate">{deal.desc}</div>
                    {deal.type === 'Coupon' && deal.couponCode && (
                      <div className="mt-1 text-xs font-semibold text-blue-600">
                        Code: {deal.couponCode}
                      </div>
                    )}
                    {deal.type === 'Deal' && deal.link && (
                      <div className="mt-1 text-xs text-blue-600 truncate">
                        <a href={deal.link} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          {deal.link}
                        </a>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {deal.startDate && (
                    <div className="text-xs text-gray-400 mb-1">
                      Start: {formatDateDisplay(deal.startDate)}
                    </div>
                  )}
                  {deal.expiryDate ? (
                    <div className="text-sm">
                      Expires: {formatDateDisplay(deal.expiryDate)}
                    </div>
                  ) : deal.expiry === "No Expiry" ? (
                    <div className="text-sm text-gray-500 font-medium">No Expiry</div>
                  ) : (
                    <div className="text-sm text-gray-400">No expiry date</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    <StatusChip status={deal.isPublish} type="publish" />
                    <StatusChip status={deal.isExpired} type="expired" />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(deal.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(deal)}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors duration-200"
                      title="Edit deal"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {!deal.isExpired ? (
                      <button
                        onClick={() => onExpire(deal)}
                        className="text-orange-600 hover:text-orange-900 transition-colors duration-200"
                        title="Mark as expired"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => onUnexpire(deal)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="Reactivate deal"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                    <button
                      onClick={() => onDelete(deal)}
                      className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      title="Delete deal"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

DealsTable.propTypes = {
  deals: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onExpire: PropTypes.func.isRequired,
  onUnexpire: PropTypes.func.isRequired,
};

export default DealsTable;

