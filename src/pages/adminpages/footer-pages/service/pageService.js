/**
 * Footer Page Service
 * Handles all footer page-related operations including CRUD operations
 */
import axios from 'axios';

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
 * @param {Object} response - Axios response
 * @returns {Object} - Response data
 */
function handleResponse(response) {
  return response.data;
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
    
    const response = await axios.post(`${API_BASE_URL}/footer-pages/pages`, formData);
    const data = handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error creating footer page:', error);
    throw error.response?.data?.message || error.message || error;
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
    
    // Server uses URL id param; strip client id so Mongoose update applies all fields (e.g. categorySlug)
    const payload = { ...pageData };
    delete payload.id;
    delete payload._id;

    // Add all other page data as JSON string
    formData.append('pageData', JSON.stringify(payload));
    
    console.log('Sending updated page data with files to API');
    
    const response = await axios.put(`${API_BASE_URL}/footer-pages/pages/${id}`, formData);
    const data = handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error updating footer page:', error);
    throw error.response?.data?.message || error.message || error;
  }
};

/**
 * Gets a footer page by ID
 * @param {string} id - The ID of the page to get
 * @returns {Promise<Object>} - The page
 */
export const getFooterPageById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/footer-pages/pages/${id}`);
    const data = handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error getting footer page:', error);
    throw error.response?.data?.message || error.message || error;
  }
};

/**
 * Gets a footer page by slug
 * @param {string} slug - The slug of the page to get
 * @returns {Promise<Object>} - The page
 */
export const getFooterPageBySlug = async (slug, parentSlug = null) => {
  try {
    const encoded = encodeURIComponent(slug);
    const params = {};
    if (parentSlug != null && String(parentSlug).trim()) {
      params.parentSlug = String(parentSlug).trim();
    }
    const response = await axios.get(
      `${API_BASE_URL}/footer-pages/pagesBySlug/${encoded}`,
      { params }
    );
    const data = handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error getting footer page:', error);
    throw error.response?.data?.message || error.message || error;
  }
};

/**
 * Gets all footer pages (aggregates every backend page — API defaults to limit=10 per request).
 * @param {Object} filters - Optional filters (publishStatus, search, etc.). Do not pass `page`/`limit` unless you use {@link getAllFooterPagesSinglePage}.
 * @returns {Promise<Array>} - Full array of pages
 */
export const getAllFooterPages = async (filters = {}) => {
  try {
    const { page: _ignorePage, limit: clientLimit, ...rest } = filters;
    const perPage = Math.min(Math.max(Number(clientLimit) || 100, 1), 250);

    const aggregated = [];
    let page = 1;
    let reportedTotal = null;

    while (true) {
      const params = { ...rest, page, limit: perPage };
      // Filter out empty values
      Object.keys(params).forEach((key) => {
        if (params[key] === undefined || params[key] === null || String(params[key]).trim() === '') {
          delete params[key];
        }
      });

      const response = await axios.get(`${API_BASE_URL}/footer-pages/get/all/pages`, { params });
      const data = handleResponse(response);
      const batch = Array.isArray(data.data) ? data.data : [];
      const total = data.pagination?.total;
      if (total != null && reportedTotal == null) {
        reportedTotal = Number(total);
      }

      aggregated.push(...batch);

      if (batch.length === 0) break;
      if (reportedTotal != null && aggregated.length >= reportedTotal) break;
      if (reportedTotal == null && batch.length < perPage) break;

      page += 1;
      if (page > 500) {
        console.warn('[getAllFooterPages] Stopped after 500 API pages; check backend pagination.');
        break;
      }
    }

    if (reportedTotal != null && aggregated.length !== reportedTotal) {
      console.warn('[getAllFooterPages] Count mismatch: received', aggregated.length, 'rows, API total was', reportedTotal);
    }

    return aggregated;
  } catch (error) {
    console.error('Error getting footer pages:', error);
    throw error.response?.data?.message || error.message || error;
  }
};

/**
 * Deletes a footer page
 * @param {string} id - The ID of the page to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export const deleteFooterPage = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/footer-pages/pages/${id}`);
    return response.data?.success ?? true;
  } catch (error) {
    console.error('Error deleting footer page:', error);
    throw error.response?.data?.message || error.message || error;
  }
};
