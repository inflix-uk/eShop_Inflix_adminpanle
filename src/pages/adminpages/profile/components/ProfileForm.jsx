import React from "react";
import PropTypes from "prop-types";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  MapPinIcon,
} from "@heroicons/react/24/solid";

/**
 * ProfileForm Component
 * Displays and handles user profile form fields
 */
export default function ProfileForm({
  formData,
  dateofBirth,
  isEditMode,
  onInputChange,
  onDateChange,
}) {
  const inputClassName = (isEditMode) =>
    `mt-1 block w-full text-xs rounded-md border-blue-500 shadow-sm py-1.5 px-2 ${
      isEditMode
        ? "bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-500"
        : "bg-gray-50 border-gray-200"
    }`;

  const inputClassNameFullWidth = (isEditMode) =>
    `mt-1 md:mt-0 block w-full text-xs rounded-md border-blue-500 shadow-sm py-1.5 px-2 ${
      isEditMode
        ? "bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-500"
        : "bg-gray-50 border-gray-200"
    }`;

  const SectionCard = ({ title, icon, children }) => (
    <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden w-full">
      <div className="px-3 py-3 sm:px-4 flex items-center border-b border-gray-200">
        {icon && <div className="mr-2">{icon}</div>}
        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
      </div>
      <div className="px-3 py-3 sm:p-4">{children}</div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Personal Information Section */}
      <SectionCard
        title="Personal Information"
        icon={<UserIcon className="h-4 w-4 text-primary" />}
      >
        <div className="grid grid-cols-1 gap-3">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="text-xs font-medium text-gray-900 flex items-center gap-2 mb-1"
            >
              <EnvelopeIcon className="h-4 w-4 text-primary" />
              Email
            </label>
            {isEditMode ? (
              <input
                type="email"
                name="email"
                id="email"
                className={inputClassNameFullWidth(isEditMode)}
                value={formData.email}
                onChange={onInputChange}
                disabled={!isEditMode}
              />
            ) : (
              <p className="text-xs text-gray-700 mt-1">{formData.email}</p>
            )}
          </div>

          {/* First Name and Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="firstName"
                className="text-xs font-medium text-gray-900 mb-1 block"
              >
                First Name
              </label>
              {isEditMode ? (
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  className={inputClassName(isEditMode)}
                  value={formData.firstName}
                  onChange={onInputChange}
                  disabled={!isEditMode}
                />
              ) : (
                <p className="text-xs text-gray-700 mt-1">
                  {formData.firstName}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="text-xs font-medium text-gray-900 mb-1 block"
              >
                Last Name
              </label>
              {isEditMode ? (
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  className={inputClassName(isEditMode)}
                  value={formData.lastName}
                  onChange={onInputChange}
                  disabled={!isEditMode}
                />
              ) : (
                <p className="text-xs text-gray-700 mt-1">
                  {formData.lastName}
                </p>
              )}
            </div>
          </div>

          {/* Company Name */}
          <div>
            <label
              htmlFor="companyName"
              className="text-xs font-medium text-gray-900 flex items-center gap-2 mb-1"
            >
              <BuildingOfficeIcon className="h-4 w-4 text-primary" />
              Company Name
            </label>
            {isEditMode ? (
              <input
                type="text"
                name="companyName"
                id="companyName"
                className={inputClassName(isEditMode)}
                value={formData.companyName}
                onChange={onInputChange}
                disabled={!isEditMode}
              />
            ) : (
              <p className="text-xs text-gray-700 mt-1">
                {formData.companyName || "-"}
              </p>
            )}
          </div>

          {/* Phone and Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="phone"
                className="text-xs font-medium text-gray-900 flex items-center gap-2 mb-1"
              >
                <PhoneIcon className="h-4 w-4 text-primary" />
                Phone
              </label>
              {isEditMode ? (
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  className={inputClassName(isEditMode)}
                  value={formData.phone}
                  onChange={onInputChange}
                  disabled={!isEditMode}
                />
              ) : (
                <p className="text-xs text-gray-700 mt-1">{formData.phone}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="dob"
                className="text-xs font-medium text-gray-900 mb-1 block"
              >
                Date of Birth
              </label>
              {isEditMode ? (
                <input
                  type="date"
                  name="dob"
                  id="dob"
                  className={inputClassName(isEditMode)}
                  value={dateofBirth}
                  onChange={onDateChange}
                  disabled={!isEditMode}
                />
              ) : (
                <p className="text-xs text-gray-700 mt-1">
                  {dateofBirth || "-"}
                </p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Address Information Section */}
      <SectionCard
        title="Address Information"
        icon={<MapPinIcon className="h-4 w-4 text-primary" />}
      >
        <div className="grid grid-cols-1 gap-3">
          {/* Address */}
          <div>
            <label
              htmlFor="address"
              className="text-xs font-medium text-gray-900 mb-1 block"
            >
              Address
            </label>
            {isEditMode ? (
              <input
                type="text"
                name="address"
                id="address"
                className={inputClassName(isEditMode)}
                value={formData.address}
                onChange={onInputChange}
                disabled={!isEditMode}
              />
            ) : (
              <p className="text-xs text-gray-700 mt-1">
                {formData.address || "-"}
              </p>
            )}
          </div>

          {/* Apartment and County */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="apartment"
                className="text-xs font-medium text-gray-900 mb-1 block"
              >
                Apartment, Suite
              </label>
              {isEditMode ? (
                <input
                  type="text"
                  name="apartment"
                  id="apartment"
                  className={inputClassName(isEditMode)}
                  value={formData.apartment}
                  onChange={onInputChange}
                  disabled={!isEditMode}
                />
              ) : (
                <p className="text-xs text-gray-700 mt-1">
                  {formData.apartment || "-"}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="county"
                className="text-xs font-medium text-gray-900 mb-1 block"
              >
                County
              </label>
              {isEditMode ? (
                <input
                  type="text"
                  name="county"
                  id="county"
                  className={inputClassName(isEditMode)}
                  value={formData.county}
                  onChange={onInputChange}
                  disabled={!isEditMode}
                />
              ) : (
                <p className="text-xs text-gray-700 mt-1">
                  {formData.county || "-"}
                </p>
              )}
            </div>
          </div>

          {/* City, Country, and Postal Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="city"
                className="text-xs font-medium text-gray-900 mb-1 block"
              >
                City
              </label>
              {isEditMode ? (
                <input
                  type="text"
                  name="city"
                  id="city"
                  className={inputClassName(isEditMode)}
                  value={formData.city}
                  onChange={onInputChange}
                  disabled={!isEditMode}
                />
              ) : (
                <p className="text-xs text-gray-700 mt-1">
                  {formData.city || "-"}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="country"
                className="text-xs font-medium text-gray-900 mb-1 block"
              >
                Country
              </label>
              {isEditMode ? (
                <input
                  type="text"
                  name="country"
                  id="country"
                  className={inputClassName(isEditMode)}
                  value={formData.country}
                  onChange={onInputChange}
                  disabled={!isEditMode}
                />
              ) : (
                <p className="text-xs text-gray-700 mt-1">
                  {formData.country || "-"}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="postalCode"
                className="text-xs font-medium text-gray-900 mb-1 block"
              >
                Postal Code
              </label>
              {isEditMode ? (
                <input
                  type="text"
                  name="postalCode"
                  id="postalCode"
                  className={inputClassName(isEditMode)}
                  value={formData.postalCode}
                  onChange={onInputChange}
                  disabled={!isEditMode}
                />
              ) : (
                <p className="text-xs text-gray-700 mt-1">
                  {formData.postalCode || "-"}
                </p>
              )}
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

ProfileForm.propTypes = {
  formData: PropTypes.shape({
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    companyName: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    apartment: PropTypes.string,
    city: PropTypes.string,
    country: PropTypes.string,
    county: PropTypes.string,
    postalCode: PropTypes.string,
  }).isRequired,
  dateofBirth: PropTypes.string.isRequired,
  isEditMode: PropTypes.bool.isRequired,
  onInputChange: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired,
};
