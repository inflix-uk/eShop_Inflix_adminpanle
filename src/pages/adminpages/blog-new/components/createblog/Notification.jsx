import { FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";

import PropTypes from "prop-types";

export default function Notification({ notification, closeNotification }) {
  if (!notification.show) return null;
  
  return (
    <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
      notification.type === "success" ? "bg-blue-50 text-blue-700" : "bg-red-50 text-red-700"
    }`}>
      <div className="flex items-center">
        {notification.type === "success" ? (
          <FaCheckCircle className="h-5 w-5 mr-2" />
        ) : (
          <FaExclamationCircle className="h-5 w-5 mr-2" />
        )}
        <span>{notification.message}</span>
      </div>
      <button 
        onClick={closeNotification}
        className="text-gray-500 hover:text-gray-700"
      >
        <FaTimes className="h-4 w-4" />
      </button>
    </div>
  );
}

Notification.propTypes = {
  notification: PropTypes.shape({
    show: PropTypes.bool.isRequired,
    message: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["success", "error"]).isRequired,
  }).isRequired,
  closeNotification: PropTypes.func.isRequired,
};
