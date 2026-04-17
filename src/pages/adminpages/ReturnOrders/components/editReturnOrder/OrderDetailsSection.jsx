import PropTypes from "prop-types";
import {
  ShoppingBagIcon,
  DocumentTextIcon,
  TruckIcon,
} from "@heroicons/react/24/solid";

/**
 * Order Details Section Component
 * Displays and allows editing of order and tracking information
 */
const OrderDetailsSection = ({ formData, isEditMode, onInputChange }) => {
  const fields = [
    {
      label: "Order Number",
      key: "orderNumber",
      icon: <DocumentTextIcon className="h-4 w-4 text-primary" />,
    },
    {
      label: "Original Tracking Number",
      key: "originalTrackingNumber",
      icon: <TruckIcon className="h-4 w-4 text-primary" />,
    },
    {
      label: "Return Tracking Number",
      key: "returnTrackingNumber",
      icon: <TruckIcon className="h-4 w-4 text-primary" />,
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-3 border border-gray-200 w-full">
      <h2 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
        <ShoppingBagIcon className="h-4 w-4 text-primary" />
        Order Details
      </h2>
      <div className="grid grid-cols-1 gap-3">
        {fields.map(({ label, key, icon }) => (
          <div
            key={key}
            className={isEditMode ? "" : "flex items-center justify-between"}
          >
            <label className="text-xs font-medium text-gray-900 flex items-center gap-2">
              {icon}
              {label}
            </label>
            {isEditMode ? (
              <input
                type="text"
                name={key}
                value={formData[key]}
                onChange={onInputChange}
                className="mt-1 block w-full text-xs rounded-md border-blue-500 shadow-sm py-1.5 px-2"
              />
            ) : (
              <p className="text-xs text-gray-700">{formData[key]}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

OrderDetailsSection.propTypes = {
  formData: PropTypes.shape({
    orderNumber: PropTypes.string,
    originalTrackingNumber: PropTypes.string,
    returnTrackingNumber: PropTypes.string,
  }).isRequired,
  isEditMode: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
};

export default OrderDetailsSection;
