import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FiEdit, FiTrash2, FiEye, FiEyeOff, FiMenu } from 'react-icons/fi';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.svg';

  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a data URL, return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }

  // Ensure backend URL doesn't have trailing slash and path has leading slash
  const baseUrl = BACKEND_URL?.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
  const path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  // Construct full URL
  return `${baseUrl}${path}`;
};

const BannersTable = ({ banners, loading, onEdit, onDelete, onToggleStatus, onReorder }) => {
  // Sort banners by order for display
  const sortedBanners = [...banners].sort((a, b) => (a.order || 0) - (b.order || 0));

  // Status chip component
  const StatusChip = ({ isActive }) => {
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          isActive
            ? 'bg-blue-100 text-blue-800'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  // Type chip component
  const TypeChip = ({ type }) => {
    const getTypeConfig = () => {
      switch (type) {
        case 'simple':
          return { text: 'Simple', className: 'bg-blue-100 text-blue-800' };
        case 'full':
          return { text: 'Full Featured', className: 'bg-purple-100 text-purple-800' };
        default:
          return { text: type || 'Unknown', className: 'bg-gray-100 text-gray-800' };
      }
    };

    const config = getTypeConfig();

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}
      >
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
      day: 'numeric',
    });
  };

  // Handle drag end
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const reorderedBanners = Array.from(sortedBanners);
    const [movedItem] = reorderedBanners.splice(sourceIndex, 1);
    reorderedBanners.splice(destinationIndex, 0, movedItem);

    // Update order values
    const reorderData = reorderedBanners.map((banner, idx) => ({
      id: banner._id,
      order: idx + 1,
    }));
    onReorder(reorderData);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (sortedBanners.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No banners found. Create your first banner!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <DragDropContext onDragEnd={handleDragEnd}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">

              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preview
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alt Text
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <Droppable droppableId="banners">
            {(provided) => (
              <tbody
                className="bg-white divide-y divide-gray-200"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {sortedBanners.map((banner, index) => (
                  <Draggable key={banner._id} draggableId={banner._id} index={index}>
                    {(provided, snapshot) => (
                      <tr
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`hover:bg-gray-50 ${snapshot.isDragging ? 'bg-blue-50 shadow-lg' : ''}`}
                        style={{
                          ...provided.draggableProps.style,
                          display: snapshot.isDragging ? 'table' : undefined,
                          tableLayout: 'fixed',
                          width: '100%',
                        }}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div
                            {...provided.dragHandleProps}
                            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
                            title="Drag to reorder"
                          >
                            <FiMenu className="h-5 w-5" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex-shrink-0 h-16 w-24 bg-gray-100 rounded border border-gray-200 overflow-hidden">
                            {banner.imageLarge || banner.imageSmall ? (
                              <img
                                className="h-16 w-24 object-cover"
                                src={getImageUrl(banner.imageLarge || banner.imageSmall)}
                                alt={banner.altText || 'Banner preview'}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                  }
                                }}
                              />
                            ) : null}
                            <div
                              className="h-16 w-24 flex items-center justify-center text-gray-400 text-xs"
                              style={{ display: (!banner.imageLarge && !banner.imageSmall) ? 'flex' : 'none' }}
                            >
                              No Image
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <TypeChip type={banner.type} />
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {banner.altText || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusChip isActive={banner.isActive} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(banner.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => onToggleStatus(banner._id)}
                              className="text-gray-600 hover:text-primary transition-colors"
                              aria-label={banner.isActive ? 'Deactivate' : 'Activate'}
                              title={banner.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {banner.isActive ? (
                                <FiEye size={18} />
                              ) : (
                                <FiEyeOff size={18} />
                              )}
                            </button>
                            <button
                              onClick={() => onEdit(banner)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              aria-label="Edit"
                              title="Edit"
                            >
                              <FiEdit size={18} />
                            </button>
                            <button
                              onClick={() => onDelete(banner._id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              aria-label="Delete"
                              title="Delete"
                            >
                              <FiTrash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </tbody>
            )}
          </Droppable>
        </table>
      </DragDropContext>
    </div>
  );
};

BannersTable.propTypes = {
  banners: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onReorder: PropTypes.func.isRequired,
};

export default BannersTable;
