import PropTypes from 'prop-types';
import { FaUser, FaEnvelope, FaPhone, FaHome, FaMapMarkerAlt, FaFlag } from 'react-icons/fa';

/**
 * Customer Information Component
 * Displays customer details for a return request
 */
const CustomerInfo = ({ customer }) => {
  if (!customer) return null;

  return (
    <div className="bg-white p-6 w-full">
      <h3 className="text-2xl font-bold mb-5 flex items-center text-gray-800">
        Customer Information
      </h3>
      <div className='divide divide-y-2 divide-gray-600 h-1'></div>
      <div className="grid grid-cols-1 space-y-4 mt-4">
        {/* Personal Details */}
        <div className="space-y-4">
          <div className="flex items-center">
            <FaUser className="text-primary w-5 h-5 mr-3" />
            <p className="text-gray-700">
              <span className="font-semibold">Name:</span> {customer.firstname} {customer.lastname}
            </p>
          </div>
          <div className="flex items-center">
            <FaEnvelope className="text-primary w-5 h-5 mr-3" />
            <p className="text-gray-700">
              <span className="font-semibold">Email:</span> {customer.email}
            </p>
          </div>
          <div className="flex items-center">
            <FaPhone className="text-primary w-5 h-5 mr-3" />
            <p className="text-gray-700">
              <span className="font-semibold">Phone:</span> {customer.phoneNumber}
            </p>
          </div>
          <div className="flex items-center">
            <FaHome className="text-primary w-5 h-5 mr-3" />
            <p className="text-gray-700">
              <span className="font-semibold">Address:</span> {customer.address?.address}, {customer.address?.city}
            </p>
          </div>
          <div className="flex items-center">
            <FaMapMarkerAlt className="text-primary w-5 h-5 mr-3" />
            <p className="text-gray-700">
              <span className="font-semibold">Postal Code:</span> {customer.address?.postalCode}
            </p>
          </div>
          <div className="flex items-center">
            <FaFlag className="text-primary w-5 h-5 mr-3" />
            <p className="text-gray-700">
              <span className="font-semibold">Country:</span> {customer.address?.country || "N/A"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

CustomerInfo.propTypes = {
  customer: PropTypes.shape({
    firstname: PropTypes.string,
    lastname: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
    address: PropTypes.shape({
      address: PropTypes.string,
      city: PropTypes.string,
      postalCode: PropTypes.string,
      country: PropTypes.string
    })
  })
};

export default CustomerInfo;
