/**
 * Footer Settings Service
 * Handles all footer settings-related API operations
 */

import axios from 'axios';

/**
 * Get headers with admin role
 */
const getHeaders = (contentType = 'application/json') => ({
  'x-user-role': 'admin',
  'Content-Type': contentType
});

/**
 * Get current footer settings
 * @returns {Promise<Object>} Footer settings data
 */
export const getFooterSettings = async (backendUrl) => {
  try {
    const response = await axios.get(`${backendUrl}footer/settings`, {
      headers: getHeaders()
    });
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Footer settings fetched successfully'
    };
  } catch (error) {
    console.error('Error fetching footer settings:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to fetch footer settings'
    };
  }
};

/**
 * Create or update footer settings
 * @param {Object} settingsData - Footer settings data
 * @param {string} backendUrl - Backend URL
 * @returns {Promise<Object>} Response data
 */
export const saveFooterSettings = async (settingsData, backendUrl) => {
  try {
    const response = await axios.post(`${backendUrl}footer/settings`, settingsData, {
      headers: getHeaders()
    });
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Footer settings saved successfully'
    };
  } catch (error) {
    console.error('Error saving footer settings:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to save footer settings'
    };
  }
};

/**
 * Update a specific section of footer settings
 * @param {string} section - Section name (section1, section2, etc.)
 * @param {Object} sectionData - Section data
 * @param {string} backendUrl - Backend URL
 * @returns {Promise<Object>} Response data
 */
export const updateFooterSection = async (section, sectionData, backendUrl) => {
  try {
    const response = await axios.patch(`${backendUrl}footer/settings/${section}`, sectionData, {
      headers: getHeaders()
    });
    return {
      success: true,
      data: response.data.data || response.data,
      message: response.data.message || 'Footer section updated successfully'
    };
  } catch (error) {
    console.error('Error updating footer section:', error);
    return {
      success: false,
      data: null,
      message: error.response?.data?.message || error.message || 'Failed to update footer section'
    };
  }
};

/**
 * Upload image for footer (logo, social icons, payment logos)
 * @param {File} imageFile - Image file to upload
 * @param {string} type - Type of image (logo, social-icon, payment-logo)
 * @param {string} backendUrl - Backend URL
 * @returns {Promise<Object>} Response with image path
 */
export const uploadFooterImage = async (imageFile, type, backendUrl) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('type', type);
    formData.append('directory', 'footer');

    const response = await axios.post(`${backendUrl}footer/upload-image`, formData, {
      headers: {
        'x-user-role': 'admin',
        // Let axios set Content-Type with boundary automatically for FormData
      },
    });

    return {
      success: true,
      data: response.data.data || response.data,
      imagePath: response.data.imagePath || response.data.data?.path,
      message: response.data.message || 'Image uploaded successfully'
    };
  } catch (error) {
    console.error('Error uploading footer image:', error);
    return {
      success: false,
      imagePath: null,
      message: error.response?.data?.message || error.message || 'Failed to upload image'
    };
  }
};

/**
 * Get default footer settings structure
 * @returns {Object} Default footer settings
 */
export const getDefaultFooterSettings = () => {
  return {
    section1: {
      logo: {
        image: "",
        altText: "Store logo",
        link: "/"
      },
      description: "",
      socialMedia: []
    },
    section2: {
      title: "",
      links: []
    },
    sectionNewsletter: {
      isEnabled: false,
      heading: "",
      description: "",
      placeholder: "",
      buttonLabel: "",
      imageUrl: "",
    },
    bottomBar: {
      textBeforeCredit: "© {{year}} All Rights Reserved.",
      creditLabel: "",
      creditUrl: "",
    },
    sectionCustom: {
      isEnabled: false,
      title: "",
      placement: "after_useful_links",
      links: [],
    },
    section3: {
      title: "",
      links: []
    },
    section4: {
      title: "",
      links: []
    },
    section5: {
      title: "",
      text: "",
      ecologiLogo: "",
      ecologiLink: "",
      paymentMethods: {
        heading: "",
        logos: []
      }
    }
  };
};
