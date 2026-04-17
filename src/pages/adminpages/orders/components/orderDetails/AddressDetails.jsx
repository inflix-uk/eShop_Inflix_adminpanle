import PropTypes from "prop-types";

const AddressDetails = ({
  updatedOrderDetails,
  isEditing,
  onShippingChange,
}) => {
  return (
    <div className="px-5 bg-gradient-to-br from-white to-gray-50 transition-shadow duration-200">
      <div className="flex items-center gap-2 pb-3 border-b border-gray-200">
        <div className="p-2 bg-orange-100 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-orange-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Address Details</h2>
      </div>

      {isEditing ? (
        <div className="space-y-1">
          <div className="flex flex-col">
            <label
              htmlFor="address"
              className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
            >
              Address
            </label>
            <textarea
              id="address"
              name="address"
              value={updatedOrderDetails.shippingDetails.address}
              onChange={onShippingChange}
              className="block w-full rounded-lg border-2 border-gray-300 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all resize-none"
              rows={2}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label
                htmlFor="apartment"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >
                Apartment
              </label>
              <input
                id="apartment"
                type="text"
                name="apartment"
                value={updatedOrderDetails.shippingDetails.apartment}
                onChange={onShippingChange}
                className="block w-full rounded-lg border-2 border-gray-300 py-2.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="city"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >
                City
              </label>
              <input
                id="city"
                type="text"
                name="city"
                value={updatedOrderDetails.shippingDetails.city}
                onChange={onShippingChange}
                className="block w-full rounded-lg border-2 border-gray-300 py-2.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="county"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >
                County
              </label>
              <input
                id="county"
                type="text"
                name="county"
                value={updatedOrderDetails.shippingDetails.county}
                onChange={onShippingChange}
                className="block w-full rounded-lg border-2 border-gray-300 py-2.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="country"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >
                Country
              </label>
              <input
                id="country"
                type="text"
                name="country"
                value={updatedOrderDetails.shippingDetails.country}
                onChange={onShippingChange}
                className="block w-full rounded-lg border-2 border-gray-300 py-2.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
              />
            </div>

            <div className="flex flex-col w-full col-span-2">
              <label
                htmlFor="postalCode"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5"
              >
                Postal Code
              </label>
              <input
                id="postalCode"
                type="text"
                name="postalCode"
                value={updatedOrderDetails.shippingDetails.postalCode}
                onChange={onShippingChange}
                className="block w-full rounded-lg border-2 border-gray-300 py-2.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="">
          <textarea
            id="completeAddress"
            name="completeAddress"
            value={[
              updatedOrderDetails.shippingDetails.address || "",
              updatedOrderDetails.shippingDetails.apartment || "",
              updatedOrderDetails.shippingDetails.city || "",
              updatedOrderDetails.shippingDetails.county || "",
              updatedOrderDetails.shippingDetails.postalCode || "",
              updatedOrderDetails.shippingDetails.country || "",
            ]
              .filter(Boolean)
              .join(",\n")}
            readOnly
            className="block w-full rounded-lg border-0 lg:px-0  text-gray-900 bg-transparent sm:text-sm font-medium resize-none"
            rows={8}
          />
        </div>
      )}
    </div>
  );
};

AddressDetails.propTypes = {
  updatedOrderDetails: PropTypes.shape({
    shippingDetails: PropTypes.shape({
      address: PropTypes.string,
      apartment: PropTypes.string,
      city: PropTypes.string,
      county: PropTypes.string,
      country: PropTypes.string,
      postalCode: PropTypes.string,
    }).isRequired,
  }).isRequired,
  isEditing: PropTypes.bool.isRequired,
  onShippingChange: PropTypes.func.isRequired,
};

export default AddressDetails;
