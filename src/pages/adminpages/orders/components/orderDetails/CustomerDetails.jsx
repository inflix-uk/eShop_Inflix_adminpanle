import PropTypes from "prop-types";
import { Link } from "react-router-dom";

const CustomerDetails = ({
  orderDetail,
  updatedOrderDetails,
  isEditing,
  onShippingChange,
  onContactChange,
}) => {
  return (
    <div className="px-5 transition-shadow duration-200">
      <div className="flex items-center gap-2 mb-5 py-3 border-b border-gray-200">
        <div className="p-2 bg-purple-100 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-purple-600"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM6 9a2 2 0 11-4 0 2 2 0 014 0zm12 0a2 2 0 11-4 0 2 2 0 014 0zm-6 0a2 2 0 11-4 0 2 2 0 014 0zM7 20a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 100-4 2 2 0 000 4zm6 0a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Customer Details</h2>
      </div>
      <div className="">
        <div className="flex flex-col">
          {isEditing && (
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide my-1.5">
              Email
            </label>
          )}
          <p className="text-gray-900 font-medium break-all">
            {`${orderDetail.contactDetails.email || ""}`}
          </p>
          {orderDetail.contactDetails?.userId && (
            <Link
              to={`/admin/crm/customers/${orderDetail.contactDetails.userId}`}
              className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
            >
              Open Customer 360
            </Link>
          )}
        </div>

        <div className="flex flex-col">
          {isEditing && (
            <label
              htmlFor="secondaryEmail"
              className="text-xs font-semibold text-gray-500 uppercase tracking-wide my-1.5"
            >
              Secondary Email
            </label>
          )}
          {isEditing ? (
            <input
              type="email"
              name="secondaryEmail"
              id="secondaryEmail"
              value={updatedOrderDetails.contactDetails?.secondaryEmail || ""}
              onChange={onContactChange}
              className="block w-full rounded-lg border-2 border-gray-300 py-2.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
              placeholder="secondary@email.com"
            />
          ) : (
            <p className="text-gray-900 font-medium">
              {orderDetail.contactDetails?.secondaryEmail ||
                "No secondary email"}
            </p>
          )}
        </div>
        {isEditing ? (
          <>
            <div className="flex flex-col">
              <label
                htmlFor="firstName"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide my-1.5"
              >
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                id="firstName"
                value={updatedOrderDetails.shippingDetails.firstName}
                onChange={onShippingChange}
                className="block w-full rounded-lg border-2 border-gray-300 py-2.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
              />
            </div>

            <div className="flex flex-col">
              <label
                htmlFor="lastName"
                className="text-xs font-semibold text-gray-500 uppercase tracking-wide my-1.5"
              >
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                id="lastName"
                value={updatedOrderDetails.shippingDetails.lastName}
                onChange={onShippingChange}
                className="block w-full rounded-lg border-2 border-gray-300 py-2.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col">
            {isEditing && (
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide my-1.5">
                Full Name
              </label>
            )}
            <p className="text-gray-900 font-medium">
              {`${orderDetail.shippingDetails.firstName || ""} ${
                orderDetail.shippingDetails.lastName || ""
              }`.trim()}
            </p>
          </div>
        )}

        <div className="flex flex-col">
          {isEditing && (
            <label
              htmlFor="phoneNumber"
              className="text-xs font-semibold text-gray-500 uppercase tracking-wide my-1.5"
            >
              Phone Number
            </label>
          )}
          {isEditing ? (
            <input
              type="text"
              name="phoneNumber"
              id="phoneNumber"
              value={updatedOrderDetails.shippingDetails.phoneNumber}
              onChange={onShippingChange}
              className="block w-full rounded-lg border-2 border-gray-300 py-2.5 px-3 text-gray-900 shadow-sm placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm font-medium transition-all"
            />
          ) : (
            <p className="text-gray-900 font-medium">
              {orderDetail.shippingDetails.phoneNumber}
            </p>
          )}
        </div>
      </div>

      {/* Note Section */}
      {/* <div className="flex flex-col mb-4">
                <label htmlFor="note" className="font-semibold mb-1">Note:</label>
                {isEditing ? (
                    <textarea
                        id="notes"
                        name="notes"
                        value={updatedOrderDetails.shippingDetails.notes || ''}
                        onChange={onShippingChange}
                        className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        rows={4}
                        placeholder="Add any notes here..."
                    />
                ) : (
                    <p className="text-gray-900">{orderDetail.shippingDetails.notes || 'No notes available'}</p>
                )}
            </div> */}
    </div>
  );
};

CustomerDetails.propTypes = {
  orderDetail: PropTypes.shape({
    contactDetails: PropTypes.shape({
      email: PropTypes.string,
      secondaryEmail: PropTypes.string,
      userId: PropTypes.string,
    }).isRequired,
    shippingDetails: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      phoneNumber: PropTypes.string,
      notes: PropTypes.string,
    }).isRequired,
  }).isRequired,
  updatedOrderDetails: PropTypes.shape({
    contactDetails: PropTypes.shape({
      email: PropTypes.string,
      secondaryEmail: PropTypes.string,
    }),
    shippingDetails: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      phoneNumber: PropTypes.string,
      notes: PropTypes.string,
    }).isRequired,
  }).isRequired,
  isEditing: PropTypes.bool.isRequired,
  onShippingChange: PropTypes.func.isRequired,
  onContactChange: PropTypes.func.isRequired,
};

export default CustomerDetails;
