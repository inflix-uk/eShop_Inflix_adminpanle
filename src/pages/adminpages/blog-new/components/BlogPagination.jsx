import React from 'react';

const BlogPagination = ({
  filteredCount,
  totalCount,
  currentPage,
  totalPages,
  startIndex,
  endIndex,
  onPageChange,
}) => {
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between mt-6">
      <div className="text-sm text-gray-700">
        Showing <span className="font-medium">{startIndex}</span> to{' '}
        <span className="font-medium">{endIndex}</span> of{' '}
        <span className="font-medium">{filteredCount}</span> filtered blog posts
        {filteredCount !== totalCount ? (
          <>
            {' '}
            (total <span className="font-medium">{totalCount}</span>)
          </>
        ) : null}
      </div>
      <div className="flex space-x-2">
        <button
          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
          disabled={!canGoPrevious}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </button>
        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm bg-blue-50 text-blue-600 font-medium">
          {currentPage}
        </button>
        <button
          className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50"
          disabled={!canGoNext}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default BlogPagination;
