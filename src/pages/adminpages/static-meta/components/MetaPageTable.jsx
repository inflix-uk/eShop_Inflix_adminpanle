// React is used implicitly for JSX transformation
import PropTypes from 'prop-types';

/**
 * Table component for displaying static meta pages
 */
const MetaPageTable = ({ 
  loading = false, 
  // Support both naming conventions
  paginatedPages = null, 
  pages = [], 
  handleEditClick = null,
  onEdit = null, 
  togglePublishStatus = null,
  onTogglePublish = null, 
  setSelectedPage = null, 
  setIsDeleteModalOpen = null,
  onDelete = null
}) => {
  // Use provided props or fallbacks
  const displayPages = paginatedPages || pages || [];
  const handleEdit = handleEditClick || onEdit;
  const handleTogglePublish = togglePublishStatus || onTogglePublish;
  
  // Handle delete action based on available props
  const handleDelete = (page) => {
    if (onDelete) {
      onDelete(page);
    } else if (setSelectedPage && setIsDeleteModalOpen) {
      setSelectedPage(page);
      setIsDeleteModalOpen(true);
    }
  };
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Page Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Path
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title Tag
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : displayPages.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No pages found. Create your first page to get started.
                </td>
              </tr>
            ) : (
              displayPages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {page.pageName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <code className="bg-gray-100 px-2 py-1 rounded">{page.path}</code>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {page.titleTag}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      onClick={() => handleTogglePublish(page.id)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                        page.isPublished 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {page.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(page)}
                        className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                        title="Edit meta information"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M17.414 2.586a2 2 0 010 2.828l-8.95 8.95a1 1 0 01-.464.263l-3.536.884a.5.5 0 01-.607-.607l.884-3.536a1 1 0 01.263-.464l8.95-8.95a2 2 0 012.828 0z" />
                          <path d="M15 7l-2-2" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(page)}
                        className="text-red-600 hover:text-red-900 inline-flex items-center"
                        title="Delete page"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MetaPageTable;

MetaPageTable.propTypes = {
  loading: PropTypes.bool,
  // Support both naming conventions
  paginatedPages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      pageName: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      titleTag: PropTypes.string,
      isPublished: PropTypes.bool.isRequired,
    })
  ),
  pages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      pageName: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      titleTag: PropTypes.string,
      isPublished: PropTypes.bool.isRequired,
    })
  ),
  // Support both naming conventions for handlers
  handleEditClick: PropTypes.func,
  onEdit: PropTypes.func,
  togglePublishStatus: PropTypes.func,
  onTogglePublish: PropTypes.func,
  setSelectedPage: PropTypes.func,
  setIsDeleteModalOpen: PropTypes.func,
  onDelete: PropTypes.func
};
