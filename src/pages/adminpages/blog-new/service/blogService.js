/**
 * Blog Service
 * Handles all blog-related operations including CRUD operations and utility functions
 */

const rawBackendUrl = import.meta.env.VITE_BACKEND_URL;

/** No trailing slash — use `blogApiUrl()` for request paths so env may be with or without `/`. */
export const API_BASE_URL = rawBackendUrl
  ? String(rawBackendUrl).replace(/\/$/, "")
  : "";

function blogApiUrl(resourcePath) {
  const path = String(resourcePath).replace(/^\//, "");
  if (!API_BASE_URL) {
    throw new Error(
      "VITE_BACKEND_URL is missing. Add it to .env (e.g. http://localhost:4000/) and restart the Vite dev server."
    );
  }
  return `${API_BASE_URL}/${path}`;
}

/** HTTPS admin pages cannot call `http://` APIs (browser mixed-content block → Failed to fetch). */
function assertBrowserCanReachApi() {
  if (typeof window === "undefined") return;
  if (window.location.protocol === "https:" && API_BASE_URL.toLowerCase().startsWith("http://")) {
    throw new Error(
      "VITE_BACKEND_URL uses HTTP but this admin is on HTTPS. The browser blocks that (mixed content). Set VITE_BACKEND_URL to your HTTPS API base URL and rebuild the admin."
    );
  }
}

function mapBlogFetchFailure(url, error) {
  if (typeof error === "string") return error;
  const msg = error?.message != null ? String(error.message) : String(error);
  const blocked =
    error instanceof TypeError ||
    msg === "Failed to fetch" ||
    /failed to fetch|networkerror|load failed/i.test(msg);
  if (blocked) {
    return new Error(
      `Could not reach the blog API at ${url}. Production checklist: use HTTPS in VITE_BACKEND_URL when the admin is HTTPS; set backend ADMINPANEL_URL to this admin origin (https://…, no trailing slash); optional CORS_EXTRA_ORIGINS for aliases; confirm the API is up and allows large multipart uploads (images).`
    );
  }
  return error;
}

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
    console.error('[blog API]', response.status, response.statusText, data);
    const base = (data && data.message) || response.statusText;
    const detail = data && data.error ? `${base}: ${data.error}` : base;
    return Promise.reject(detail);
  }

  return data;
}

/**
 * Creates a new blog post with file uploads
 * @param {Object} blogData - The blog data
 * @returns {Promise<Object>} - The created blog post
 */
export const createBlogPost = async (blogData) => {
  assertBrowserCanReachApi();
  const url = blogApiUrl("newblog/blog/posts");
  try {
    // Create a FormData instance for file uploads
    const formData = new FormData();
    
    // Handle featured image file
    if (blogData.featuredImage && blogData.featuredImage instanceof File) {
      formData.append('featuredImage', blogData.featuredImage);
      // Remove from JSON data as we're sending it separately
      delete blogData.featuredImage;
    }
    
    // Handle banner image file
    if (blogData.bannerImage && blogData.bannerImage instanceof File) {
      formData.append('bannerImage', blogData.bannerImage);
      // Remove from JSON data as we're sending it separately
      delete blogData.bannerImage;
    }
    
    // Handle block image files
    const blockImageCount = parseInt(blogData.blockImageCount || '0', 10);
    console.log(`Processing ${blockImageCount} block images for upload`);
    
    // Extract and append block image files to formData
    for (let i = 0; i < blockImageCount; i++) {
      const imageKey = `blockImages_${i}`;
      const imageFile = blogData[imageKey];
      
      if (imageFile && imageFile instanceof File) {
        console.log(`Appending block image ${i}:`, imageFile.name, imageFile.size);
        formData.append(imageKey, imageFile);
      } else {
        console.warn(`Block image ${i} is not a valid File object:`, imageFile);
      }
      
      // Keep the path information in blogData but remove the file object
      if (blogData[imageKey]) {
        delete blogData[imageKey];
      }
    }
    
    // Add all other blog data as JSON string
    formData.append('blogData', JSON.stringify(blogData));
    
    console.log('Sending blog data with files to API');
    
    const response = await fetch(url, {
      method: 'POST',
      // Don't set Content-Type header, browser will set it with boundary for FormData
      body: formData
    });
    
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error creating blog post:', error);
    const mapped = mapBlogFetchFailure(url, error);
    throw mapped;
  }
};

/**
 * Updates an existing blog post with file uploads
 * @param {string} id - The ID of the blog post to update
 * @param {Object} blogData - The updated blog data
 * @returns {Promise<Object>} - The updated blog post
 */
export const updateBlogPost = async (id, blogData) => {
  assertBrowserCanReachApi();
  const url = blogApiUrl(`newblog/blog/posts/${id}`);
  try {
    // Create a FormData instance for file uploads
    const formData = new FormData();
    
    // Handle featured image file
    if (blogData.featuredImage && blogData.featuredImage instanceof File) {
      formData.append('featuredImage', blogData.featuredImage);
      // Remove from JSON data as we're sending it separately
      delete blogData.featuredImage;
    }
    
    // Handle banner image file
    if (blogData.bannerImage && blogData.bannerImage instanceof File) {
      formData.append('bannerImage', blogData.bannerImage);
      // Remove from JSON data as we're sending it separately
      delete blogData.bannerImage;
    }
    
    // Handle block image files
    const blockImageCount = parseInt(blogData.blockImageCount || '0', 10);
    console.log(`Processing ${blockImageCount} block images for upload in update`);
    
    // Extract and append block image files to formData
    for (let i = 0; i < blockImageCount; i++) {
      const imageKey = `blockImages_${i}`;
      const imageFile = blogData[imageKey];
      
      if (imageFile && imageFile instanceof File) {
        console.log(`Appending block image ${i} for update:`, imageFile.name, imageFile.size);
        formData.append(imageKey, imageFile);
      } else {
        console.warn(`Block image ${i} is not a valid File object:`, imageFile);
      }
      
      // Keep the path information in blogData but remove the file object
      if (blogData[imageKey]) {
        delete blogData[imageKey];
      }
    }
    
    // Add all other blog data as JSON string
    formData.append('blogData', JSON.stringify(blogData));
    
    console.log('Sending updated blog data with files to API');
    
    const response = await fetch(url, {
      method: 'PUT',
      // Don't set Content-Type header, browser will set it with boundary for FormData
      body: formData
    });
    
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error updating blog post:', error);
    throw mapBlogFetchFailure(url, error);
  }
};

/**
 * Gets a blog post by ID
 * @param {string} id - The ID of the blog post to get
 * @returns {Promise<Object>} - The blog post
 */
export const getBlogPostById = async (id) => {
  try {
    const response = await fetch(blogApiUrl(`newblog/blog/posts/${id}`));
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error getting blog post:', error);
    throw error;
  }
};

export const getBlogPostBySlug = async (slug) => {
  try {
    const response = await fetch(blogApiUrl(`newblog/blog/postsBySlug/${slug}`));
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error getting blog post:', error);
    throw error;
  }
};

export const getBlogPostBySlugWithoutCache = async (slug) => {
  try {
    const response = await fetch(
      blogApiUrl(`newblog/blog/postsBySlugWithoutCache/${slug}`)
    );
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error getting blog post:', error);
    throw error;
  }
};

/**
 * Gets all blog posts
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} - Array of blog posts
 */
export const getAllBlogPosts = async (filters = {}) => {
  try {
    // Build query string from filters
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });
    
    const queryString = queryParams.toString();
    const url = `${blogApiUrl("newblog/get/all/blog/posts")}${
      queryString ? `?${queryString}` : ""
    }`;
    
    const response = await fetch(url);
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error getting blog posts:', error);
    throw error;
  }
};



/**
 * Deletes a blog post
 * @param {string} id - The ID of the blog post to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export const deleteBlogPost = async (id) => {
  try {
    const response = await fetch(blogApiUrl(`newblog/blog/posts/${id}`), {
      method: 'DELETE'
    });
    
    const data = await handleResponse(response);
    return data.success;
  } catch (error) {
    console.error('Error deleting blog post:', error);
    throw error;
  }
};

/**
 * Gets all blog categories
 * @returns {Promise<Array>} - Array of categories
 */
export const getAllCategories = async () => {
  const url = blogApiUrl("get/blog/category/all");
  try {
    const response = await fetch(url);
    const data = await handleResponse(response);
    return data.categories ?? [];
  } catch (error) {
    console.error("Error getting categories:", error);
    const isNetwork =
      error instanceof TypeError ||
      (typeof error?.message === "string" &&
        error.message.toLowerCase().includes("fetch"));
    if (isNetwork) {
      throw new Error(
        `Cannot reach blog API (${url}). Start the backend on the port in VITE_BACKEND_URL, or fix .env and restart Vite.`
      );
    }
    throw error;
  }
};

/**
 * Gets all blog categories with post counts
 * @returns {Promise<Array>} - Array of categories with post counts
 */
export const getCategoryStats = async () => {
  try {
    const response = await fetch(blogApiUrl("newblog/blog/category-stats"));
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error getting category stats:', error);
    throw error;
  }
};

/**
 * Gets a category by ID
 * @param {string} id - The ID of the category to get
 * @returns {Promise<Object>} - The category
 */
export const getCategoryById = async (id) => {
  try {
    const response = await fetch(blogApiUrl(`newblog/blog/categories/${id}`));
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error getting category:', error);
    throw error;
  }
};

/**
 * Creates a new category
 * @param {Object} categoryData - The category data
 * @returns {Promise<Object>} - The created category
 */
export const createCategory = async (categoryData) => {
  try {
    const response = await fetch(blogApiUrl("newblog/blog/categories"), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryData)
    });
    
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

/**
 * Updates an existing category
 * @param {string} id - The ID of the category to update
 * @param {Object} categoryData - The updated category data
 * @returns {Promise<Object>} - The updated category
 */
export const updateCategory = async (id, categoryData) => {
  try {
    const response = await fetch(blogApiUrl(`newblog/blog/categories/${id}`), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(categoryData)
    });
    
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Deletes a category
 * @param {string} id - The ID of the category to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export const deleteCategory = async (id) => {
  try {
    const response = await fetch(blogApiUrl(`newblog/blog/categories/${id}`), {
      method: 'DELETE'
    });
    
    const data = await handleResponse(response);
    return data.success;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};
