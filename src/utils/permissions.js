/**
 * Permission Utilities
 * Helper functions for checking user permissions
 */

/**
 * Check if user has a specific permission
 * @param {Object} user - User object from auth context
 * @param {string} permissionId - Permission ID to check
 * @returns {boolean} True if user has the permission
 */
export const hasPermission = (user, permissionId) => {
    if (!user || !user.permissions) {
        return false;
    }

    // Administrator role has all permissions
    if (user.role?.name?.toLowerCase() === 'administrator') {
        return true;
    }

    // Check in all permission categories
    const { zextons, rolesandPermissions, staticMeta } = user.permissions;

    return (
        zextons?.[permissionId] === true ||
        rolesandPermissions?.[permissionId] === true ||
        staticMeta?.[permissionId] === true
    );
};

/**
 * Check if user has any of the specified permissions
 * @param {Object} user - User object from auth context
 * @param {Array<string>} permissionIds - Array of permission IDs
 * @returns {boolean} True if user has at least one permission
 */
export const hasAnyPermission = (user, permissionIds) => {
    if (!permissionIds || permissionIds.length === 0) {
        return true; // No permissions required
    }

    return permissionIds.some(permissionId => hasPermission(user, permissionId));
};

/**
 * Check if user has all of the specified permissions
 * @param {Object} user - User object from auth context
 * @param {Array<string>} permissionIds - Array of permission IDs
 * @returns {boolean} True if user has all permissions
 */
export const hasAllPermissions = (user, permissionIds) => {
    if (!permissionIds || permissionIds.length === 0) {
        return true; // No permissions required
    }

    return permissionIds.every(permissionId => hasPermission(user, permissionId));
};

/**
 * Get all permissions for a user
 * @param {Object} user - User object from auth context
 * @returns {Array<string>} Array of permission IDs the user has
 */
export const getUserPermissions = (user) => {
    if (!user || !user.permissions) {
        return [];
    }

    const permissions = [];
    const { zextons, rolesandPermissions, staticMeta } = user.permissions;

    // Collect all true permissions
    [zextons, rolesandPermissions, staticMeta].forEach(category => {
        if (category) {
            Object.entries(category).forEach(([key, value]) => {
                if (value === true) {
                    permissions.push(key);
                }
            });
        }
    });

    return permissions;
};

/**
 * Check if user is administrator
 * @param {Object} user - User object from auth context
 * @returns {boolean} True if user is administrator
 */
export const isAdministrator = (user) => {
    return user?.role?.name?.toLowerCase() === 'administrator';
};
