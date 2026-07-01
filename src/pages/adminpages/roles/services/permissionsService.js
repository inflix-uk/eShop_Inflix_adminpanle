/**
 * Permissions Service
 * Handles all API calls related to permissions management
 */

import axios from 'axios';
import { BACKEND_URL, API_ENDPOINTS } from '../constants/config';

/**
 * Save/update permissions for a role
 * @param {Object} payload - Permissions payload
 * @param {string} payload.roleId - Role ID
 * @param {string} payload.roleName - Role name
 * @param {Object} payload.permissions - Permissions object
 * @returns {Promise<Object>} Response
 */
export const saveRolePermissions = async (payload) => {
    try {
        const response = await axios.post(`${BACKEND_URL}${API_ENDPOINTS.IMPLEMENT_PERMISSIONS}`, payload);
        return {
            success: true,
            data: response.data,
            message: response.data.message || 'Permissions updated successfully'
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || error.message || 'Failed to update permissions'
        };
    }
};

/**
 * Build permissions payload from role permissions state
 * @param {string} roleId - Role ID
 * @param {string} roleName - Role name
 * @param {Object} rolePermissions - Current permissions state
 * @param {Object} permissionGroups - Permission groups configuration
 * @returns {Object} Formatted payload for API
 */
export const buildPermissionsPayload = (roleId, roleName, rolePermissions, permissionGroups) => {
    const storePermissions = {};
    const rolesandPermissions = {};
    const staticMetaPermissions = {};

    const storeGroups = permissionGroups.store || permissionGroups.store || [];

    storeGroups.forEach(group => {
        group.permissions.forEach(permission => {
            if (rolePermissions[permission.id]) {
                storePermissions[permission.id] = true;
            }
        });
    });

    permissionGroups.rolesandpermissions.forEach(group => {
        group.permissions.forEach(permission => {
            rolesandPermissions[permission.id] = roleName.toLowerCase() === 'administrator';
        });
    });

    if (permissionGroups.staticMeta) {
        permissionGroups.staticMeta.forEach(group => {
            group.permissions.forEach(permission => {
                if (rolePermissions[permission.id]) {
                    staticMetaPermissions[permission.id] = true;
                }
            });
        });
    }

    return {
        roleId,
        roleName,
        permissions: {
            store: storePermissions,
            rolesandPermissions: rolesandPermissions,
            staticMeta: staticMetaPermissions
        }
    };
};

/**
 * Initialize permissions state from role data
 * @param {Object} roleData - Role data from API
 * @param {Object} permissionGroups - Permission groups configuration
 * @param {string} roleName - Role name
 * @returns {Object} Initialized permissions object
 */
export const initializePermissions = (roleData, permissionGroups, roleName) => {
    const initialPermissions = {};
    const storeGroups = permissionGroups.store || permissionGroups.store || [];

    storeGroups.forEach(group => {
        group.permissions.forEach(permission => {
            initialPermissions[permission.id] = false;
        });
    });

    permissionGroups.rolesandpermissions.forEach(group => {
        group.permissions.forEach(permission => {
            initialPermissions[permission.id] = roleName.toLowerCase() === 'administrator';
        });
    });

    if (permissionGroups.staticMeta) {
        permissionGroups.staticMeta.forEach(group => {
            group.permissions.forEach(permission => {
                initialPermissions[permission.id] = false;
            });
        });
    }

    const legacyStore = roleData.permissions?.store || roleData.permissions?.store || {};

    const rolePermissionsData = {
        ...initialPermissions,
        ...legacyStore,
        ...(roleData.permissions?.rolesandPermissions || {}),
        ...(roleData.permissions?.staticMeta || {})
    };

    if (roleName.toLowerCase() === 'administrator') {
        permissionGroups.rolesandpermissions.forEach(group => {
            group.permissions.forEach(permission => {
                rolePermissionsData[permission.id] = true;
            });
        });
    }

    return rolePermissionsData;
};

/**
 * Check if a permission is a roles/permissions permission
 * @param {string} permissionId - Permission ID to check
 * @param {Object} permissionGroups - Permission groups configuration
 * @returns {boolean} True if it's a roles permission
 */
export const isRolesPermission = (permissionId, permissionGroups) => {
    return permissionGroups.rolesandpermissions.some(group =>
        group.permissions.some(permission => permission.id === permissionId)
    );
};

/**
 * Check if a group contains roles permissions
 * @param {Array} groupPermissions - Array of group permissions
 * @param {Object} permissionGroups - Permission groups configuration
 * @returns {boolean} True if group contains roles permissions
 */
export const containsRolesPermission = (groupPermissions, permissionGroups) => {
    return groupPermissions.some(permission =>
        isRolesPermission(permission.id, permissionGroups)
    );
};
