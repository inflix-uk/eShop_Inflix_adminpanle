/**
 * ProtectedRoute Component
 * Wraps routes with authentication and permission checking
 */

import { useEffect, useState } from "react";
import PropTypes from 'prop-types';   
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./Auth";
import { hasAnyPermission } from "../utils/permissions";

const ProtectedRoute = ({ children, requiredPermissions = [], requireAll = false }) => {
  const auth = useAuth();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user is authenticated
    if (!auth.user) {
      setLoading(false);
    } else {
      // If authenticated, finish loading
      setLoading(false);
    }
  }, [auth.user]);

  if (loading) {
    // If authentication check is still loading, show loading spinner
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!auth.user) {
    // Clear stored data and redirect to login
    auth.logout();
    return <Navigate to="/" state={{ path: location.pathname }} />;
  }

  // Check permissions if required
  if (requiredPermissions.length > 0) {
    const hasAccess = requireAll
      ? requiredPermissions.every(permission => hasAnyPermission(auth.user, [permission]))
      : hasAnyPermission(auth.user, requiredPermissions);

    if (!hasAccess) {
      // User doesn't have required permissions
      return <Navigate to="/admin/access-denied" state={{ from: location.pathname }} />;
    }
  }

  // If authenticated and has permissions, render the children components
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  requiredPermissions: PropTypes.arrayOf(PropTypes.string),
  requireAll: PropTypes.bool
};

export default ProtectedRoute;
