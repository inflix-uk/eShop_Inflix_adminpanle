/**
 * Footer Page Service
 * Handles all footer page-related operations including CRUD operations
 */

export const API_BASE_URL = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

/**
 * Generates a URL-friendly slug from a title
 * @param {string} title - The title to convert to a slug
 * @returns {string} - The generated slug
 */
export const generateSlugFromTitle = (title) => {
  if (!title) return '';
  
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-')     // Replace spaces with hyphens
    .replace(/-+/g, '-')      // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
};

/**
 * Helper function to handle API errors
 * @param {Response} response - Fetch API response
 * @returns {Promise} - Promise that resolves with JSON or rejects with error
 */
async function handleResponse(response) {
  const data = await response.json();
  
  if (!response.ok) {
    const error = (data && data.message) || response.statusText;
    return Promise.reject(error);
  }
  
  return data;
}

/**
 * Creates a new footer page with file uploads
 * @param {Object} pageData - The page data
 * @returns {Promise<Object>} - The created page
 */
export const createFooterPage = async (pageData) => {
  try {
    // Create a FormData instance for file uploads
    const formData = new FormData();
    
    // Handle banner image file
    if (pageData.bannerImage && pageData.bannerImage instanceof File) {
      formData.append('bannerImage', pageData.bannerImage);
      delete pageData.bannerImage;
    }
    
    // Handle block image files
    const blockImageCount = parseInt(pageData.blockImageCount || '0', 10);
    console.log(`Processing ${blockImageCount} block images for upload`);
    
    // Extract and append block image files to formData
    for (let i = 0; i < blockImageCount; i++) {
      const imageKey = `blockImages_${i}`;
      const imageFile = pageData[imageKey];
      
      if (imageFile && imageFile instanceof File) {
        console.log(`Appending block image ${i}:`, imageFile.name, imageFile.size);
        formData.append(imageKey, imageFile);
      }
      
      // Remove from pageData but keep the path information
      if (pageData[imageKey]) {
        delete pageData[imageKey];
      }
    }
    
    // Add all other page data as JSON string
    formData.append('pageData', JSON.stringify(pageData));
    
    console.log('Sending page data with files to API');
    
    const response = await fetch(`${API_BASE_URL}/footer-pages/pages`, {
      method: 'POST',
      body: formData
    });
    
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error creating footer page:', error);
    throw error;
  }
};

/**
 * Updates an existing footer page with file uploads
 * @param {string} id - The ID of the page to update
 * @param {Object} pageData - The updated page data
 * @returns {Promise<Object>} - The updated page
 */
export const updateFooterPage = async (id, pageData) => {
  try {
    // Create a FormData instance for file uploads
    const formData = new FormData();
    
    // Handle banner image file
    if (pageData.bannerImage && pageData.bannerImage instanceof File) {
      formData.append('bannerImage', pageData.bannerImage);
      delete pageData.bannerImage;
    }
    
    // Handle block image files
    const blockImageCount = parseInt(pageData.blockImageCount || '0', 10);
    console.log(`Processing ${blockImageCount} block images for upload in update`);
    
    // Extract and append block image files to formData
    for (let i = 0; i < blockImageCount; i++) {
      const imageKey = `blockImages_${i}`;
      const imageFile = pageData[imageKey];
      
      if (imageFile && imageFile instanceof File) {
        console.log(`Appending block image ${i} for update:`, imageFile.name, imageFile.size);
        formData.append(imageKey, imageFile);
      }
      
      // Remove from pageData but keep the path information
      if (pageData[imageKey]) {
        delete pageData[imageKey];
      }
    }
    
    // Add all other page data as JSON string
    formData.append('pageData', JSON.stringify(pageData));
    
    console.log('Sending updated page data with files to API');
    
    const response = await fetch(`${API_BASE_URL}/footer-pages/pages/${id}`, {
      method: 'PUT',
      body: formData
    });
    
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error updating footer page:', error);
    throw error;
  }
};

/**
 * Gets a footer page by ID
 * @param {string} id - The ID of the page to get
 * @returns {Promise<Object>} - The page
 */
export const getFooterPageById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/footer-pages/pages/${id}`);
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error getting footer page:', error);
    throw error;
  }
};

/**
 * Gets a footer page by slug
 * @param {string} slug - The slug of the page to get
 * @returns {Promise<Object>} - The page
 */
export const getFooterPageBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_BASE_URL}/footer-pages/pagesBySlug/${slug}`);
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error getting footer page:', error);
    throw error;
  }
};

/**
 * Gets all footer pages
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - Array of pages
 */
export const getAllFooterPages = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const url = `${API_BASE_URL}/footer-pages/get/all/pages${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error getting footer pages:', error);
    throw error;
  }
};

/**
 * Deletes a footer page
 * @param {string} id - The ID of the page to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export const deleteFooterPage = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/footer-pages/pages/${id}`, {
      method: 'DELETE'
    });
    
    const data = await handleResponse(response);
    return data.success;
  } catch (error) {
    console.error('Error deleting footer page:', error);
    throw error;
  }
};
