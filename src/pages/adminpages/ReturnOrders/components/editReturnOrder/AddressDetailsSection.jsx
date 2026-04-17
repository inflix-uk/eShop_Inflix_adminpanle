import PropTypes from "prop-types";
import {
  HomeIcon,
  BuildingOfficeIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";

/**
 * Address Details Section Component
 * Displays and allows editing of address information
 */
const AddressDetailsSection = ({ formData, isEditMode, onInputChange }) => {
  const fields = [
    {
      label: "Address",
      key: "address",
      icon: <HomeIcon className="h-4 w-4 text-primary" />,
    },
    {
      label: "City",
      key: "city",
      icon: <BuildingOfficeIcon className="h-4 w-4 text-primary" />,
    },
    {
      label: "Postal Code",
      key: "postalCode",
      icon: <MapPinIcon className="h-4 w-4 text-primary" />,
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-3 border border-gray-200 w-full">
      <h2 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2">
        <HomeIcon className="h-4 w-4 text-primary" />
        Address Details
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

AddressDetailsSection.propTypes = {
  formData: PropTypes.shape({
    address: PropTypes.string,
    city: PropTypes.string,
    postalCode: PropTypes.string,
  }).isRequired,
  isEditMode: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
};

export default AddressDetailsSection;
