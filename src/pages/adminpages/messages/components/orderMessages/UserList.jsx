import PropTypes from "prop-types";
import { FiUsers, FiMessageSquare } from "react-icons/fi";
import UserSearchInput from "./UserSearchInput";
import FilterButtons from "./FilterButtons";
import UserListItem from "./UserListItem";

/**
 * UserList Component
 * Displays the list of users with messages
 */
const UserList = ({
  users,
  selectedUserId,
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  onSelectUser,
  onDeleteAllMessages,
  viewMode = "users",
  onViewModeChange,
  totalUsers = 0,
  totalChats = 0,
}) => {
  return (
    <div className="w-full md:w-1/2 lg:w-[40%] xl:w-[30%] border-r border-gray-300 bg-white flex flex-col">
      <UserSearchInput value={searchTerm} onChange={onSearchChange} />

      {/* View Mode Toggle */}
      {onViewModeChange && (
        <div className="px-2 sm:px-3 py-1.5 sm:py-2 border-b border-gray-200">
          <div className="flex bg-gray-100 rounded-lg p-0.5 sm:p-1">
            <button
              onClick={() => onViewModeChange("users")}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                viewMode === "users"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiUsers size={12} className="sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Users ({totalUsers})</span>
              <span className="xs:hidden">({totalUsers})</span>
            </button>
            <button
              onClick={() => onViewModeChange("chats")}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-medium transition-all ${
                viewMode === "chats"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FiMessageSquare size={12} className="sm:w-3.5 sm:h-3.5" />
              <span className="hidden xs:inline">Chats ({totalChats})</span>
              <span className="xs:hidden">({totalChats})</span>
            </button>
          </div>
        </div>
      )}

      <FilterButtons
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {users.length > 0 ? (
          users.map((user) => (
            <UserListItem
              key={user._id}
              user={user}
              isSelected={user._id === selectedUserId}
              onSelect={() => onSelectUser(user._id)}
              onDelete={onDeleteAllMessages}
            />
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">No users found.</div>
        )}
      </div>
    </div>
  );
};

UserList.propTypes = {
  users: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      unreadCount: PropTypes.number,
    })
  ).isRequired,
  selectedUserId: PropTypes.string,
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  activeFilter: PropTypes.oneOf(["all", "read", "unread"]).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onSelectUser: PropTypes.func.isRequired,
  onDeleteAllMessages: PropTypes.func.isRequired,
  viewMode: PropTypes.oneOf(["users", "chats"]),
  onViewModeChange: PropTypes.func,
  totalUsers: PropTypes.number,
  totalChats: PropTypes.number,
};

export default UserList;
