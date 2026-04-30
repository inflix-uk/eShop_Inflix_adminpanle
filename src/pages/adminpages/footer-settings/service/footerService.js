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
        image: "/assets/ZEXTONS-LOGO-WHITE1.png",
        altText: "Zextons Tech Store Logo",
        link: "/"
      },
      description: "",
      socialMedia: [
        {
          name: "Twitter",
          icon: "",
          link: "https://twitter.com/zextons_uk",
          isActive: true,
          order: 0
        },
        {
          name: "YouTube",
          icon: "",
          link: "https://www.youtube.com/channel/UCb5pBW9HkmUo7CjszeJwqqQ",
          isActive: true,
          order: 1
        },
        {
          name: "Instagram",
          icon: "",
          link: "https://www.instagram.com/zextons.co.uk/",
          isActive: true,
          order: 2
        },
        {
          name: "TikTok",
          icon: "",
          link: "https://www.tiktok.com/@zextons",
          isActive: true,
          order: 3
        },
        {
          name: "Facebook",
          icon: "",
          link: "https://www.facebook.com/zextonstechstore",
          isActive: true,
          order: 4
        },
        {
          name: "Pinterest",
          icon: "",
          link: "https://www.pinterest.co.uk/zextons",
          isActive: true,
          order: 5
        }
      ]
    },
    section2: {
      title: "Useful Links",
      links: [
        { text: "Read Our Blogs", link: "/blogs", isActive: true, order: 0 },
        { text: "Why Buying Refurbished iPhone is Good Idea?", link: "/why-buying-a-refurbished-iphone-is-a-good-idea", isActive: true, order: 1 },
        { text: "Sell My Mobile Phone", link: "https://sell.zextons.co.uk/", isActive: true, order: 2 },
        { text: "Buy Now Pay Later", link: "/buy-now-pay-later", isActive: true, order: 3 },
        { text: "Customer Reviews", link: "/customer-reviews", isActive: true, order: 4 },
        { text: "Bulk Recycling", link: "/recycle-mobile-phone", isActive: true, order: 5 },
        { text: "Trade-in", link: "/zexton-trade-in", isActive: true, order: 6 },
        { text: "Help Center", link: "https://zextons.tawk.help/", isActive: true, order: 7 },
        { text: "Sustainability", link: "/Sustainability", isActive: true, order: 8 },
        { text: "18 Months Warranty", link: "/18-months-warranty", isActive: true, order: 9 }
      ]
    },
    sectionNewsletter: {
      isEnabled: true,
      heading: "Stay in the loop",
      description: "Get deals and product news straight to your inbox.",
      placeholder: "Enter your email",
      buttonLabel: "Subscribe",
      imageUrl: "",
    },
    bottomBar: {
      textBeforeCredit:
        "ZEXTONS TECH STORE © {{year}} All Rights Reserved. Company Number: 10256988. Designed and Developed by ",
      creditLabel: "Inflix",
      creditUrl: "https://inflix.co.uk",
    },
    section3: {
      title: "Customer Care",
      links: [
        { text: "Terms & Conditions", link: "/terms-and-conditions", isActive: true, order: 0 },
        { text: "Trade-in Terms & Conditions", link: "/trade-in-terms-and-conditions", isActive: true, order: 1 },
        { text: "Privacy Policy", link: "/privacy-policy", isActive: true, order: 2 },
        { text: "Deals & Discounts", link: "/deals-and-discounts", isActive: true, order: 3 },
        { text: "Returns & Refund Policy", link: "/refund-and-return-policy", isActive: true, order: 4 },
        { text: "Shipping Policy", link: "/shipping-policy", isActive: true, order: 5 },
        { text: "FAQs", link: "/faqs", isActive: true, order: 6 },
        { text: "Contact Us", link: "/contact-us", isActive: true, order: 7 },
        { text: "About Us", link: "/about-zextons", isActive: true, order: 8 },
        { text: "Subscribe Our Newsletter", link: "/subscribe-newsletter", isActive: true, order: 9 }
      ]
    },
    section4: {
      title: "Hot Selling Gadgets",
      links: [
        { text: "Apple iPhone 16", link: "/products/apple-iphone-16-unlocked-brand-new-128gb-black-brand-new", isActive: true, order: 0 },
        { text: "Apple iPhone 16e", link: "/products/apple-iphone-16e-unlocked-brand-new-128gb-white-brand-new", isActive: true, order: 1 },
        { text: "Apple iPhone 15", link: "/products/apple-iphone-15-unlocked-refurbished-128gb-green-excellent", isActive: true, order: 2 },
        { text: "Apple iPad (2025)", link: "/products/apple-ipad-2025-11th-generation-brand-new-128gb-silver-brand-new", isActive: true, order: 3 },
        { text: "Apple iPad 9th Generation (2021)", link: "/products/apple-ipad-9th-generation-2021-cellular-refurbished-64gb-space-gray-excellent", isActive: true, order: 4 },
        { text: "Apple iPad 8th Generation (2020)", link: "/products/apple-ipad-8th-generation-2020-cellular-refurbished-32gb-silver-good", isActive: true, order: 5 },
        { text: "Google Pixel 8 Pro", link: "/products/google-pixel-8-pro-unlocked-refurbished-128gb-bay-excellent", isActive: true, order: 6 },
        { text: "Google Pixel 8", link: "/products/google-pixel-8-unlocked-refurbished-128gb-hazel-excellent", isActive: true, order: 7 },
        { text: "Google Pixel 7a", link: "/products/google-pixel-7a-unlocked-refurbished-128gb-sea-excellent", isActive: true, order: 8 },
        { text: "Samsung Galaxy S24", link: "/products/samsung-galaxy-s24-unlocked-refurbished-128gb-marble-gray-excellent", isActive: true, order: 9 },
        { text: "Samsung Galaxy S23 Ultra", link: "/products/samsung-galaxy-s23-ultra-unlocked-refurbished-256gb-green-excellent", isActive: true, order: 10 },
        { text: "Samsung Galaxy A55", link: "/products/samsung-galaxy-a55-unlocked-brand-new-128gb-navy-brand-new", isActive: true, order: 11 }
      ]
    },
    section5: {
      title: "Our Climate Impact",
      text: "We plant a tree with every order",
      ecologiLogo: "/assets/ecologinewlogo.png",
      ecologiLink: "",
      paymentMethods: {
        heading: "We accept the following payment methods:",
        logos: [
          { name: "Visa", image: "", isActive: true, order: 0 },
          { name: "Mastercard", image: "", isActive: true, order: 1 },
          { name: "American Express", image: "", isActive: true, order: 2 },
          { name: "PayPal", image: "", isActive: true, order: 3 },
          { name: "Apple Pay", image: "", isActive: true, order: 4 },
          { name: "Google Pay", image: "", isActive: true, order: 5 },
          { name: "Klarna", image: "", isActive: true, order: 6 },
          { name: "Zilch", image: "", isActive: true, order: 7 }
        ]
      }
    }
  };
};
