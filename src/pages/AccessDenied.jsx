/**
 * Access Denied Page
 * Shown when user doesn't have required permissions
 */

import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FaLock, FaArrowLeft } from "react-icons/fa";

const AccessDenied = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/admin/dashboard';

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoToDashboard = () => {
    navigate('/admin/dashboard');
  };

  return (
    <>
      <Helmet>
        <title>Access Denied - Admin</title>
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center">
          {/* Lock Icon */}
          <div className="flex justify-center mb-6">
            <div className="rounded-full bg-red-100 p-6">
              <FaLock className="h-12 w-12 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-2">
            You don&apos;t have permission to access this page.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            If you believe this is an error, please contact your administrator to request access.
          </p>

          {/* Attempted Path Info */}
          {from && from !== '/admin/dashboard' && (
            <div className="bg-gray-100 rounded-lg p-4 mb-8 text-left">
              <p className="text-xs font-semibold text-gray-700 mb-1">
                Attempted to access:
              </p>
              <p className="text-sm text-gray-600 font-mono break-all">
                {from}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoBack}
              className="w-full flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              Go Back
            </button>

            <button
              onClick={handleGoToDashboard}
              className="w-full flex items-center justify-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-primary hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Go to Dashboard
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 text-xs text-gray-500">
            <p>Need help? Contact your system administrator.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccessDenied;
