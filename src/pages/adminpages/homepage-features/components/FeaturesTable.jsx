import PropTypes from 'prop-types';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { FiEdit, FiTrash2, FiEye, FiEyeOff, FiMenu } from 'react-icons/fi';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.svg';

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  if (imagePath.startsWith('data:')) {
    return imagePath;
  }

  const baseUrl = BACKEND_URL?.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
  let path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  // If path doesn't start with /uploads/, prepend it
  if (!path.startsWith('/uploads/')) {
    if (path.startsWith('/homepage-features/')) {
      path = `/uploads${path}`;
    } else if (!path.startsWith('/uploads/')) {
      path = `/uploads${path}`;
    }
  }

  return `${baseUrl}${path}`;
};

const FeaturesTable = ({ features, loading, onEdit, onDelete, onToggleStatus, onReorder }) => {
  // Sort features by order for display
  const sortedFeatures = [...features].sort((a, b) => a.order - b.order);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    const reorderedFeatures = Array.from(sortedFeatures);
    const [movedItem] = reorderedFeatures.splice(sourceIndex, 1);
    reorderedFeatures.splice(destinationIndex, 0, movedItem);

    const featureIds = reorderedFeatures.map((f) => f._id);
    onReorder(featureIds);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-gray-600">Loading features...</p>
      </div>
    );
  }

  if (features.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No homepage features found. Create your first feature!</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <DragDropContext onDragEnd={handleDragEnd}>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">

              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Icon
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Subtitle
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <Droppable droppableId="features">
            {(provided) => (
              <tbody
                className="bg-white divide-y divide-gray-200"
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {sortedFeatures.map((feature, index) => (
                  <Draggable key={feature._id} draggableId={feature._id} index={index}>
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
                          {feature.iconImage ? (
                            <img
                              className="h-6 w-6 object-contain"
                              src={getImageUrl(feature.iconImage)}
                              alt={feature.title}
                              onError={(e) => {
                                e.target.src = '/placeholder.svg';
                              }}
                            />
                          ) : (
                            <span className="text-gray-400 text-xs">No icon</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {feature.iconWidth || 25} × {feature.iconHeight || 25}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{feature.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-500">{feature.subtitle}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => onToggleStatus(feature._id, !feature.isActive)}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              feature.isActive
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {feature.isActive ? (
                              <>
                                <FiEye className="mr-1" />
                                Active
                              </>
                            ) : (
                              <>
                                <FiEyeOff className="mr-1" />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => onEdit(feature)}
                              className="text-primary hover:text-secondary"
                              title="Edit"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => onDelete(feature._id, feature.title)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <FiTrash2 />
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

FeaturesTable.propTypes = {
  features: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string.isRequired,
      iconImage: PropTypes.string,
      iconWidth: PropTypes.number,
      iconHeight: PropTypes.number,
      order: PropTypes.number.isRequired,
      isActive: PropTypes.bool.isRequired,
    })
  ).isRequired,
  loading: PropTypes.bool.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onToggleStatus: PropTypes.func.isRequired,
  onReorder: PropTypes.func.isRequired,
};

export default FeaturesTable;
