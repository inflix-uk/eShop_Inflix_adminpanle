import React from 'react';

const StatusBadge = ({ status }) => {
  let badgeClass = '';
  let statusText = status || 'Draft';
  
  switch (statusText.toLowerCase()) {
    case 'published':
      badgeClass = 'bg-blue-100 text-blue-800';
      break;
    case 'draft':
      badgeClass = 'bg-gray-100 text-gray-800';
      break;
    case 'scheduled':
      badgeClass = 'bg-blue-100 text-blue-800';
      break;
    case 'archived':
      badgeClass = 'bg-amber-100 text-amber-800';
      break;
    default:
      badgeClass = 'bg-gray-100 text-gray-800';
  }
  
  return (
    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}>
      {statusText}
    </span>
  );
};

export default StatusBadge;
