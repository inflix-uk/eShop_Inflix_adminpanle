import { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./Auth";

/**
 * PermissionRoute Component
 * Protects routes based on user authentication AND permissions
 *
 * @param {node} children - Child components to render if authorized
 * @param {string} permission - Required permission in format "section.permission" (e.g., "store.view_orders")
 */
export default function PermissionRoute({ children, permission }) {
  const auth = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login
  if (!auth.user) {
    return <Navigate to="/" state={{ path: location.pathname }} replace />;
  }

  // Check if permission is required
  if (permission) {
    const hasPermission = checkPermission(auth.user.permissions, permission);

    if (!hasPermission) {
      // User doesn't have required permission - redirect to profile page (no permission required)
      return (
        <Navigate
          to="/admin/profile"
          state={{
            error: "You don't have permission to access this page",
            path: location.pathname
          }}
          replace
        />
      );
    }
  }

  // If authenticated and has permission, render the children components
  return children;
}

/**
 * Check if user has the required permission
 * @param {object} permissions - User permissions object from auth context
 * @param {string} permission - Required permission in format "section.permission"
 * @returns {boolean} - True if user has permission, false otherwise
 */
function checkPermission(permissions, permission) {
  if (!permissions || !permission) return false;

  // Split permission into section and permission name
  // e.g., "store.view_orders" -> ["store", "view_orders"]
  const [section, permissionName] = permission.split('.');

  if (permissions?.[section]?.[permissionName] === true) return true;
  // Legacy DB rows may still use the old `store` permission namespace.
  if (section === 'store' && permissions?.store?.[permissionName] === true) return true;
  return false;
}

PermissionRoute.propTypes = {
  children: PropTypes.node.isRequired,
  permission: PropTypes.string // Optional - if not provided, only auth is checked
};
