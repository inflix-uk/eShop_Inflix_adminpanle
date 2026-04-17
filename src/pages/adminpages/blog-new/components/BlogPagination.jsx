import React from 'react';

const BlogPagination = ({ filteredCount, totalCount }) => {
  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{filteredCount}</span> of <span className="font-medium">{totalCount}</span> blog posts
      </div>
      <div className="flex space-x-2">
        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50" disabled>
          Previous
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-blue-50 text-blue-600 font-medium">
          1
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50" disabled>
          Next
        </button>
      </div>
    </div>
  );
};

export default BlogPagination;
