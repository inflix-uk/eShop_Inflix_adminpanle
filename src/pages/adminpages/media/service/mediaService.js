import axios from 'axios';

/**
 * Media Service - Handles all API calls related to media files
 */

/**
 * Fetch all files from all directories
 * @param {string} backendUrl - The backend URL from auth context
 * @returns {Promise} - Response data containing directories with files
 */
export const getFiles = async (backendUrl) => {
  try {
    const response = await axios.get(`${backendUrl}get/files`);
    return {
      success: true,
      data: response.data,
      contents: response.data.contents || [],
      status: response.data.status
    };
  } catch (error) {
    console.error('Error fetching files:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to fetch files'
    };
  }
};

/**
 * Admin Media — S3 / DigitalOcean Spaces objects (same `contents` shape as Vercel Blob list).
 */
export const getSpacesFiles = async (backendUrl) => {
  try {
    const response = await axios.get(`${backendUrl}get/files/spaces`);
    return {
      success: true,
      data: response.data,
      contents: response.data.contents || [],
      status: response.data.status,
      spacesConfigured: Boolean(response.data.spacesConfigured)
    };
  } catch (error) {
    console.error('Error fetching Spaces files:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to fetch Spaces files',
      spacesConfigured: false
    };
  }
};

export const uploadFileSpaces = async (backendUrl, directory, files, altText = '') => {
  try {
    const formData = new FormData();
    formData.append('directory', directory);
    if (altText && altText.trim()) {
      formData.append('altText', altText.trim());
    }
    if (Array.isArray(files)) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    } else {
      formData.append('files', files);
    }

    const response = await axios.post(`${backendUrl}upload/file/spaces`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return {
      success: response.data.success || false,
      data: response.data,
      message: response.data.message,
      error: response.data.error
    };
  } catch (error) {
    console.error('Error uploading to Spaces:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to upload to Spaces'
    };
  }
};

export const updateFileSpaces = async (backendUrl, payload) => {
  try {
    const response = await axios.patch(`${backendUrl}update/file/spaces`, payload);
    return {
      success: response.data.success || false,
      data: response.data,
      message: response.data.message,
      error: response.data.error
    };
  } catch (error) {
    console.error('Error updating Spaces file:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to update Spaces file'
    };
  }
};

export const deleteSpacesFile = async (backendUrl, key) => {
  try {
    const response = await axios.delete(`${backendUrl}delete/file/spaces`, {
      data: { key }
    });
    return {
      success: response.data.success || false,
      data: response.data,
      message: response.data.message,
      error: response.data.error
    };
  } catch (error) {
    console.error('Error deleting Spaces file:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to delete Spaces file'
    };
  }
};

/**
 * Update file (filename, title, or altText)
 * @param {string} backendUrl - The backend URL from auth context
 * @param {Object} updateData - Object containing directory, oldFileName, newFileName, filePath, and optional title/altText
 * @returns {Promise} - Response data from the update operation
 */
export const updateFile = async (backendUrl, updateData) => {
  try {
    const response = await axios.patch(`${backendUrl}update/file`, updateData);
    return {
      success: response.data.success || false,
      data: response.data,
      message: response.data.message,
      error: response.data.error
    };
  } catch (error) {
    console.error('Error updating file:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to update file'
    };
  }
};

/**
 * Upload file(s) to a specific directory
 * @param {string} backendUrl - The backend URL from auth context
 * @param {string} directory - The directory name to upload to
 * @param {File|File[]} files - Single file or array of files to upload (filenames should have no spaces, use hyphens)
 * @param {string} altText - Alt text for the file(s)
 * @returns {Promise} - Response data from the upload operation
 * Note: Title is automatically generated from filename (filename becomes title, URL is generated from title)
 */
export const uploadFile = async (backendUrl, directory, files, altText = '') => {
  try {
    const formData = new FormData();
    
    // Append directory
    formData.append('directory', directory);
    
    // Append alt text if provided (only if it's not empty)
    if (altText && altText.trim()) {
      formData.append('altText', altText.trim());
    }
    
    // Handle single file or array of files
    // Title will be extracted from filename by backend (filename = title)
    if (Array.isArray(files)) {
      files.forEach((file, index) => {
        formData.append('files', file);
      });
    } else {
      formData.append('files', files);
    }
    
    const response = await axios.post(`${backendUrl}upload/file`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return {
      success: response.data.success || false,
      data: response.data,
      message: response.data.message,
      error: response.data.error
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to upload file'
    };
  }
};

/**
 * Delete file from a specific directory
 * @param {string} backendUrl - The backend URL from auth context
 * @param {string} directory - The directory name
 * @param {string} fileName - The name of the file to delete
 * @param {string} filePath - The path of the file to delete
 * @returns {Promise} - Response data from the delete operation
 */
export const deleteFile = async (backendUrl, directory, fileName, filePath) => {
  try {
    const response = await axios.delete(`${backendUrl}delete/file`, {
      data: {
        directory,
        fileName,
        filePath
      }
    });
    
    return {
      success: response.data.success || false,
      data: response.data,
      message: response.data.message,
      error: response.data.error
    };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: error.response?.data?.error || error.message || 'Failed to delete file'
    };
  }
};

// Default export containing all service methods
const mediaService = {
  getFiles,
  getSpacesFiles,
  updateFile,
  updateFileSpaces,
  uploadFile,
  uploadFileSpaces,
  deleteFile,
  deleteSpacesFile
};

export default mediaService;

