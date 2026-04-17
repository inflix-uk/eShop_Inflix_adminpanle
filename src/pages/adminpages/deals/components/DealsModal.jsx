import { useState } from "react";
import PropTypes from "prop-types";

const DealsModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  isEdit,
  loading,
}) => {
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // If type changes, clear the opposite field (link for Coupon, couponCode for Deal)
    if (name === "type") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(value === "Deal"
          ? { couponCode: "", link: prev.link } // Clear couponCode, keep link
          : { link: "", couponCode: prev.couponCode }), // Clear link, keep couponCode
      }));
    } else if (name === "hasExpiry") {
      // When expiry option changes, clear expiryDate and startDate if set to "no"
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(value === "no" ? { expiryDate: "", startDate: "" } : {}), // Clear both dates if no expiry
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.desc.trim()) {
      newErrors.desc = "Description is required";
    }

    if (!formData.type) {
      newErrors.type = "Type is required";
    }

    // Validate expiryDate is required only if hasExpiry is "yes"
    if (formData.hasExpiry === "yes" && !formData.expiryDate.trim()) {
      newErrors.expiryDate = "Expiry date is required";
    }

    // Validate link for Deal, couponCode for Coupon
    if (formData.type === "Deal") {
      if (!formData.link.trim()) {
        newErrors.link = "Link is required for deals";
      }
    } else if (formData.type === "Coupon") {
      if (!formData.couponCode.trim()) {
        newErrors.couponCode = "Coupon code is required for coupons";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {isEdit ? "Edit Deal" : "Create New Deal"}
                  </h3>

                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          errors.title ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Enter deal title"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label
                        htmlFor="desc"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Description *
                      </label>
                      <textarea
                        name="desc"
                        id="desc"
                        rows={3}
                        value={formData.desc}
                        onChange={handleChange}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          errors.desc ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Enter deal description"
                      />
                      {errors.desc && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.desc}
                        </p>
                      )}
                    </div>

                    {/* Type */}
                    <div>
                      <label
                        htmlFor="type"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Type *
                      </label>
                      <select
                        name="type"
                        id="type"
                        value={formData.type}
                        onChange={handleChange}
                        className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                          errors.type ? "border-red-300" : "border-gray-300"
                        }`}
                      >
                        <option value="Deal">Deal</option>
                        <option value="Coupon">Coupon</option>
                      </select>
                      {errors.type && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.type}
                        </p>
                      )}
                    </div>

                    {/* Has Expiry Radio Buttons */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Has Expiry? *
                      </label>
                      <div className="flex items-center space-x-6">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="hasExpiry"
                            value="yes"
                            checked={formData.hasExpiry === "yes"}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">
                            Yes
                          </span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="hasExpiry"
                            value="no"
                            checked={formData.hasExpiry === "no"}
                            onChange={handleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                          />
                          <span className="ml-2 text-sm text-gray-700">No</span>
                        </label>
                      </div>
                    </div>

                    {/* Start Date and Expiry Date - Only show if hasExpiry is "yes" */}
                    {formData.hasExpiry === "yes" && (
                      <>
                        {/* Start Date */}
                        <div>
                          <label
                            htmlFor="startDate"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Start Date
                          </label>
                          <input
                            type="date"
                            name="startDate"
                            id="startDate"
                            value={formData.startDate}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Optional: Set specific start date for automatic
                            activation
                          </p>
                        </div>

                        {/* Expiry Date */}
                        <div>
                          <label
                            htmlFor="expiryDate"
                            className="block text-sm font-medium text-gray-700"
                          >
                            Expiry Date *
                          </label>
                          <input
                            type="date"
                            name="expiryDate"
                            id="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleChange}
                            className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                              errors.expiryDate
                                ? "border-red-300"
                                : "border-gray-300"
                            }`}
                          />
                          {errors.expiryDate && (
                            <p className="mt-1 text-sm text-red-600">
                              {errors.expiryDate}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-gray-500">
                            Required: Set expiry date for automatic expiration
                          </p>
                        </div>
                      </>
                    )}

                    {/* Link (for Deal) or Coupon Code (for Coupon) */}
                    {formData.type === "Deal" ? (
                      <div>
                        <label
                          htmlFor="link"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Link *
                        </label>
                        <input
                          type="url"
                          name="link"
                          id="link"
                          value={formData.link}
                          onChange={handleChange}
                          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            errors.link ? "border-red-300" : "border-gray-300"
                          }`}
                          placeholder="https://example.com/deal"
                        />
                        {errors.link && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.link}
                          </p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label
                          htmlFor="couponCode"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Coupon Code *
                        </label>
                        <input
                          type="text"
                          name="couponCode"
                          id="couponCode"
                          value={formData.couponCode}
                          onChange={handleChange}
                          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm uppercase ${
                            errors.couponCode
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                          placeholder="SAVE20"
                          maxLength="50"
                        />
                        {errors.couponCode && (
                          <p className="mt-1 text-sm text-red-600">
                            {errors.couponCode}
                          </p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                          Enter the coupon code that customers will use
                        </p>
                      </div>
                    )}

                    {/* Button Text (for Deals) */}
                    {formData.type === "Deal" && (
                      <div>
                        <label
                          htmlFor="buttonText"
                          className="block text-sm font-medium text-gray-700"
                        >
                          Button Text
                        </label>
                        <input
                          type="text"
                          name="buttonText"
                          id="buttonText"
                          value={formData.buttonText}
                          onChange={handleChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Shop Now"
                          maxLength="50"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Optional: Custom text for the button (e.g., "Shop Now", "Claim Deal")
                        </p>
                      </div>
                    )}

                    {/* Emoji */}
                    <div>
                      <label
                        htmlFor="emoji"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Emoji
                      </label>
                      <input
                        type="text"
                        name="emoji"
                        id="emoji"
                        value={formData.emoji}
                        onChange={handleChange}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="🎉"
                        maxLength="2"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Optional: Add an emoji to make the deal more attractive
                      </p>
                    </div>

                    {/* Publish Status */}
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="isPublish"
                        id="isPublish"
                        checked={formData.isPublish}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label
                        htmlFor="isPublish"
                        className="ml-2 block text-sm text-gray-900"
                      >
                        Publish this deal
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isEdit ? "Updating..." : "Creating..."}
                  </div>
                ) : isEdit ? (
                  "Update Deal"
                ) : (
                  "Create Deal"
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

DealsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  formData: PropTypes.object.isRequired,
  setFormData: PropTypes.func.isRequired,
  isEdit: PropTypes.bool.isRequired,
  loading: PropTypes.bool.isRequired,
};

export default DealsModal;
