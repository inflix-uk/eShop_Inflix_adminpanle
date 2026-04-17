
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaArrowsAltV, FaEye, FaEdit, FaTrashAlt } from 'react-icons/fa';
import StatusBadge from './StatusBadge';

const BlogTable = ({ 
  isLoading, 
  filteredAndSortedBlogs, 
  requestSort, 
  handleDeleteBlog,
  getFullImageUrl,
  formatDate
}) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blog Post
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('updatedAt')}
              >
                <div className="flex items-center">
                  <span>Last Updated</span>
                  <FaArrowsAltV size={14} className="ml-1" />
                </div>
              </th>
              <th 
                scope="col" 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                onClick={() => requestSort('views')}
              >
                <div className="flex items-center">
                  <span>Views</span>
                  <FaArrowsAltV size={14} className="ml-1" />
                </div>
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
            {isLoading ? (
              // Loading skeleton
              Array(5).fill(0).map((_, index) => (
                <tr key={`skeleton-${index}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gray-200 rounded"></div>
                      <div className="ml-4">
                        <div className="h-4 w-48 bg-gray-200 rounded"></div>
                        <div className="h-3 w-32 bg-gray-100 rounded mt-2"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 w-12 bg-gray-200 rounded"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="h-8 w-20 bg-gray-200 rounded ml-auto"></div>
                  </td>
                </tr>
              ))
            ) : filteredAndSortedBlogs.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                  No blog posts found matching your criteria
                </td>
              </tr>
            ) : (
              filteredAndSortedBlogs.map((blog) => (
                <tr key={blog._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                        {blog.featuredImage ? (
                          <img 
                            src={getFullImageUrl(blog.featuredImage)}
                            alt={blog.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <span className="text-xs">No img</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{blog.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {blog.excerpt || (blog.content ? (blog.content.length > 100 ? blog.content.substring(0, 100) + '...' : blog.content) : 'No excerpt')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {blog.categories && blog.categories.length > 0 ? 
                        blog.categories.map(cat => typeof cat === 'object' ? cat.name : cat).join(', ') : 
                        'Uncategorized'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{formatDate(blog.updatedAt)}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{(blog.views || 0).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={blog.publishStatus || blog.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <Link
                        to={`/admin/blog/preview/${blog.slug}`}
                        className="text-blue-600 hover:text-blue-900"
                        title="Preview"
                      >
                        <FaEye size={18} />
                      </Link>
                      <Link 
                        to={`/admin/blog/editblog?id=${blog._id}`}
                        className="text-amber-600 hover:text-amber-900"
                        title="Edit"
                      >
                        <FaEdit size={18} />
                      </Link>
                      <button 
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                        onClick={() => handleDeleteBlog(blog._id)}
                      >
                        <FaTrashAlt size={18} />
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

BlogTable.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  filteredAndSortedBlogs: PropTypes.array.isRequired,
  requestSort: PropTypes.func.isRequired,

  handleDeleteBlog: PropTypes.func.isRequired,
  getFullImageUrl: PropTypes.func.isRequired,
  formatDate: PropTypes.func.isRequired,
};

export default BlogTable;
