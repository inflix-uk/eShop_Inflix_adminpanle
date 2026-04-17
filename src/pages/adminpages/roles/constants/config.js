/**
 * Configuration Constants
 * Centralized configuration for the roles module
 */

// Backend API URL from environment variables
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Validate that BACKEND_URL is set
if (!BACKEND_URL) {
    console.error('VITE_BACKEND_URL is not set in environment variables');
}

// API Endpoints
export const API_ENDPOINTS = {
    // Roles
    GET_ALL_ROLES: 'get/all/roles',
    GET_ROLE_BY_ID: (roleId) => `get/role/${roleId}`,
    CREATE_ROLE: 'create/role',
    UPDATE_ROLE: (roleId) => `update/role/${roleId}`,
    DELETE_ROLE: (roleId) => `delete/role/${roleId}`,

    // Permissions
    IMPLEMENT_PERMISSIONS: 'implement/permission/on/role'
};

// Default settings
export const DEFAULTS = {
    ITEMS_PER_PAGE: 10,
    LOADING_TIMEOUT: 30000, // 30 seconds
};

export default {
    BACKEND_URL,
    API_ENDPOINTS,
    DEFAULTS
};
