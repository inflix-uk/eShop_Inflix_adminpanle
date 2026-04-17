import PropTypes from 'prop-types';
import { IoMdTrash } from 'react-icons/io';

/**
 * UserListItem Component
 * Displays a single user in the messages list
 */
const UserListItem = ({ user, isSelected = false, onSelect, onDelete }) => {
  return (
    <div
      className={`flex items-center p-2 sm:p-3 md:p-4 cursor-pointer hover:bg-gray-100 transition-colors ${
        isSelected ? 'bg-gray-200' : ''
      }`}
    >
      <div className="flex-1 flex items-center" onClick={onSelect}>
        <div className="flex-shrink-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 text-white rounded-full flex items-center justify-center capitalize text-sm sm:text-base">
            {user.name.charAt(0)}
          </div>
        </div>
        <div className="ml-2 sm:ml-3 md:ml-4 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm sm:text-base font-medium text-gray-800 capitalize truncate">
              {user.name}
            </h3>
            {user.unreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-medium px-1.5 sm:px-2.5 py-0.5 rounded-full flex-shrink-0">
                {user.unreadCount}
              </span>
            )}
          </div>
          {user.email && (
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          )}
          {user.phoneNumber && (
            <p className="text-xs text-gray-400 truncate">{user.phoneNumber}</p>
          )}
          {/* Tags */}
          {user.tags && user.tags.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap mt-1">
              {user.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag.name}
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium text-white"
                  style={{ backgroundColor: tag.color }}
                >
                  {tag.name}
                </span>
              ))}
              {user.tags.length > 3 && (
                <span className="text-[10px] text-gray-400">
                  +{user.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(user._id);
          }}
          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 sm:p-2 rounded-full transition-colors"
          aria-label="Delete all messages"
          title="Delete all messages"
        >
          <IoMdTrash size={18} className="sm:w-5 sm:h-5" />
        </button>
      </div>
    </div>
  );
};

UserListItem.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
    unreadCount: PropTypes.number,
    tags: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string.isRequired,
        color: PropTypes.string.isRequired
      })
    )
  }).isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default UserListItem;
