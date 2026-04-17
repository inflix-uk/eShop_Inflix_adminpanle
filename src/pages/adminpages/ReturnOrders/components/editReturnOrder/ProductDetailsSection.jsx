import PropTypes from "prop-types";
import { CircleStackIcon, QrCodeIcon } from "@heroicons/react/24/solid";

/**
 * Product Details Section Component
 * Displays and allows editing of serial numbers
 */
const ProductDetailsSection = ({ formData, isEditMode, onInputChange }) => {
  const fields = [
    {
      label: "Original Serial Number",
      key: "originalSerialNumber",
      icon: <QrCodeIcon className="h-4 w-4 text-primary" />,
    },
    {
      label: "Replacement Serial Number",
      key: "replacementSerialNumber",
      icon: <QrCodeIcon className="h-4 w-4 text-primary" />,
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-3 border border-gray-200">
      <h2 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
        <CircleStackIcon className="h-4 w-4 text-primary" />
        Product Details
      </h2>
      <div className="space-y-3">
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

ProductDetailsSection.propTypes = {
  formData: PropTypes.shape({
    originalSerialNumber: PropTypes.string,
    replacementSerialNumber: PropTypes.string,
  }).isRequired,
  isEditMode: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
};

export default ProductDetailsSection;
