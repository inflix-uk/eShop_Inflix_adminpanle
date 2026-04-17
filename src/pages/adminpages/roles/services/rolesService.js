/**
 * Roles Service
 * Handles all API calls related to roles management
 */

import axios from 'axios';
import { BACKEND_URL, API_ENDPOINTS } from '../constants/config';

/**
 * Fetch all roles from the API
 * @returns {Promise<Object>} Response containing roles array
 */
export const getAllRoles = async () => {
    try {
        const response = await axios.get(`${BACKEND_URL}${API_ENDPOINTS.GET_ALL_ROLES}`);
        return {
            success: true,
            data: response.data.roles || [],
            message: 'Roles fetched successfully'
        };
    } catch (error) {
        return {
            success: false,
            data: [],
            message: error.response?.data?.message || error.message || 'Failed to fetch roles'
        };
    }
};

/**
 * Fetch a single role by ID
 * @param {string} roleId - Role ID
 * @returns {Promise<Object>} Response containing role data
 */
export const getRoleById = async (roleId) => {
    try {
        const response = await axios.get(`${BACKEND_URL}${API_ENDPOINTS.GET_ROLE_BY_ID(roleId)}`);
        return {
            success: true,
            data: response.data.role || {},
            message: 'Role fetched successfully'
        };
    } catch (error) {
        return {
            success: false,
            data: {},
            message: error.response?.data?.message || error.message || 'Failed to fetch role'
        };
    }
};

/**
 * Create a new role
 * @param {Object} roleData - Role data (name, description)
 * @returns {Promise<Object>} Response
 */
export const createRole = async (roleData) => {
    try {
        const response = await axios.post(`${BACKEND_URL}${API_ENDPOINTS.CREATE_ROLE}`, roleData);
        return {
            success: true,
            data: response.data,
            message: response.data.message || 'Role created successfully'
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || error.message || 'Failed to create role'
        };
    }
};

/**
 * Update an existing role
 * @param {string} roleId - Role ID
 * @param {Object} roleData - Updated role data
 * @returns {Promise<Object>} Response
 */
export const updateRole = async (roleId, roleData) => {
    try {
        const response = await axios.patch(`${BACKEND_URL}${API_ENDPOINTS.UPDATE_ROLE(roleId)}`, roleData);
        return {
            success: true,
            data: response.data,
            message: response.data.message || 'Role updated successfully'
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || error.message || 'Failed to update role'
        };
    }
};

/**
 * Delete a role
 * @param {string} roleId - Role ID
 * @returns {Promise<Object>} Response
 */
export const deleteRole = async (roleId) => {
    try {
        const response = await axios.delete(`${BACKEND_URL}${API_ENDPOINTS.DELETE_ROLE(roleId)}`);
        return {
            success: true,
            data: response.data,
            message: response.data.message || 'Role deleted successfully'
        };
    } catch (error) {
        return {
            success: false,
            data: null,
            message: error.response?.data?.message || error.message || 'Failed to delete role'
        };
    }
};

/**
 * Get users by role ID
 * @param {string} roleId - Role ID
 * @returns {Promise<Object>} Response containing users array
 */
export const getUsersByRole = async (roleId) => {
    try {
        const response = await axios.get(`${BACKEND_URL}get/users/by-role/${roleId}`);
        return {
            success: true,
            data: response.data.users || [],
            role: response.data.role,
            count: response.data.count,
            message: 'Users fetched successfully'
        };
    } catch (error) {
        return {
            success: false,
            data: [],
            role: null,
            count: 0,
            message: error.response?.data?.message || error.message || 'Failed to fetch users'
        };
    }
};
