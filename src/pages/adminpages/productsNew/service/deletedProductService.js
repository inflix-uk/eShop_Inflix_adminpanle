/**
 * Deleted Product Service
 * Handles business logic and data transformation for deleted products
 * Note: API calls are handled by ProductApi class
 */

class DeletedProductService {
  /**
   * Toggle featured status for a product in the products array
   * @param {Array} products - Array of products
   * @param {number} index - Index of the product to update
   * @returns {Array} - Updated products array
   */
  toggleFeaturedStatus(products, index) {
    if (!products || !Array.isArray(products) || index < 0 || index >= products.length) {
      return products;
    }

    const updatedProducts = [...products];
    updatedProducts[index].is_featured = !updatedProducts[index].is_featured;
    return updatedProducts;
  }

  /**
   * Toggle publish status for a product in the products array
   * @param {Array} products - Array of products
   * @param {number} index - Index of the product to update
   * @returns {Array} - Updated products array
   */
  togglePublishStatus(products, index) {
    if (!products || !Array.isArray(products) || index < 0 || index >= products.length) {
      return products;
    }

    const updatedProducts = [...products];
    updatedProducts[index].status = !updatedProducts[index].status;
    return updatedProducts;
  }

  /**
   * Get product by index from products array
   * @param {Array} products - Array of products
   * @param {number} index - Index of the product
   * @returns {Object|null} - Product object or null if not found
   */
  getProductByIndex(products, index) {
    if (!products || !Array.isArray(products) || index < 0 || index >= products.length) {
      return null;
    }
    return products[index];
  }

  /**
   * Get product ID by index from products array
   * @param {Array} products - Array of products
   * @param {number} index - Index of the product
   * @returns {string|null} - Product ID or null if not found
   */
  getProductIdByIndex(products, index) {
    const product = this.getProductByIndex(products, index);
    return product ? product._id : null;
  }

  /**
   * Filter products by search query
   * @param {Array} products - Array of products
   * @param {string} query - Search query
   * @returns {Array} - Filtered products
   */
  filterProducts(products, query) {
    if (!products || !Array.isArray(products) || !query || query.trim() === '') {
      return products;
    }

    const searchQuery = query.toLowerCase().trim();

    return products.filter(product => {
      const nameMatch = product.name?.toLowerCase().includes(searchQuery);
      const conditionMatch = product.condition?.toLowerCase().includes(searchQuery);
      const categoryMatch = product.category?.toLowerCase().includes(searchQuery);

      // Check if search query is a number and compare with total variants count
      const variantMatch = !isNaN(searchQuery) && product.variantValues?.length === parseInt(searchQuery);

      return nameMatch || conditionMatch || categoryMatch || variantMatch;
    });
  }

  /**
   * Get paginated products
   * @param {Array} products - Array of products
   * @param {number} currentPage - Current page number
   * @param {number} itemsPerPage - Items per page
   * @returns {Array} - Paginated products
   */
  getPaginatedProducts(products, currentPage, itemsPerPage) {
    if (!products || !Array.isArray(products)) {
      return [];
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    return products.slice(startIndex, endIndex);
  }

  /**
   * Calculate total pages
   * @param {number} totalItems - Total number of items
   * @param {number} itemsPerPage - Items per page
   * @returns {number} - Total pages
   */
  calculateTotalPages(totalItems, itemsPerPage) {
    if (!totalItems || totalItems <= 0 || !itemsPerPage || itemsPerPage <= 0) {
      return 0;
    }
    return Math.ceil(totalItems / itemsPerPage);
  }

  /**
   * Check if page is valid
   * @param {number} page - Page number to check
   * @param {number} totalPages - Total number of pages
   * @returns {boolean} - True if valid, false otherwise
   */
  isValidPage(page, totalPages) {
    return page > 0 && page <= totalPages;
  }

  /**
   * Slugify product name for URL
   * @param {string} text - Text to slugify
   * @returns {string} - Slugified text
   */
  slugify(text) {
    if (!text || typeof text !== 'string') {
      return '';
    }

    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')                // Replace spaces with -
      .replace(/[^\w().(){}\[\]–-]+/g, '') // Allow word characters, hyphens, brackets, dots, and en dashes
      .replace(/--+/g, '-')                // Replace multiple - with single -
      .replace(/^-+/, '')                  // Trim - from start of text
      .replace(/-+$/, '');                 // Trim - from end of text
  }

  /**
   * Get total variants count for a product
   * @param {Object} product - Product object
   * @returns {number} - Total variants count
   */
  getVariantsCount(product) {
    if (!product || !product.variantValues || !Array.isArray(product.variantValues)) {
      return 0;
    }
    return product.variantValues.length;
  }

  /**
   * Format product image URL
   * @param {string} baseURL - Base URL from auth context
   * @param {string} imagePath - Image path from product
   * @returns {string} - Full image URL
   */
  formatImageUrl(baseURL, imagePath) {
    if (!imagePath) return '';
    return `${baseURL}${imagePath}`;
  }

  /**
   * Check if products array is empty
   * @param {Array} products - Array of products
   * @returns {boolean} - True if empty, false otherwise
   */
  isProductsEmpty(products) {
    return !products || !Array.isArray(products) || products.length === 0;
  }

  /**
   * Get total count of products
   * @param {Array} products - Array of products
   * @returns {number} - Total count
   */
  getProductsCount(products) {
    return products && Array.isArray(products) ? products.length : 0;
  }

  /**
   * Validate if product can be restored
   * @param {Object} product - Product object
   * @returns {Object} - Validation result { isValid: boolean, message: string }
   */
  validateForRestore(product) {
    if (!product) {
      return { isValid: false, message: 'Product not found' };
    }

    if (!product._id) {
      return { isValid: false, message: 'Product ID is missing' };
    }

    return { isValid: true, message: 'Product can be restored' };
  }

  /**
   * Validate if product can be permanently deleted
   * @param {string} productId - Product ID
   * @returns {Object} - Validation result { isValid: boolean, message: string }
   */
  validateForPermanentDelete(productId) {
    if (!productId || productId.trim() === '') {
      return { isValid: false, message: 'Product ID is required' };
    }

    return { isValid: true, message: 'Product can be permanently deleted' };
  }

  /**
   * Get products statistics
   * @param {Array} products - Array of products
   * @returns {Object} - Statistics object
   */
  getProductsStatistics(products) {
    if (!products || !Array.isArray(products)) {
      return {
        total: 0,
        featured: 0,
        published: 0,
        unpublished: 0,
        totalVariants: 0
      };
    }

    const stats = {
      total: products.length,
      featured: 0,
      published: 0,
      unpublished: 0,
      totalVariants: 0
    };

    products.forEach(product => {
      if (product.is_featured) {
        stats.featured++;
      }

      if (product.status) {
        stats.published++;
      } else {
        stats.unpublished++;
      }

      stats.totalVariants += this.getVariantsCount(product);
    });

    return stats;
  }

  /**
   * Sort products by different criteria
   * @param {Array} products - Array of products
   * @param {string} sortBy - Sort criteria (name, date, category, condition)
   * @param {string} order - Sort order (asc, desc)
   * @returns {Array} - Sorted products
   */
  sortProducts(products, sortBy = 'date', order = 'desc') {
    if (!products || !Array.isArray(products)) {
      return products;
    }

    const sortedProducts = [...products];

    sortedProducts.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
          break;
        case 'condition':
          comparison = (a.condition || '').localeCompare(b.condition || '');
          break;
        case 'date':
        default:
          comparison = new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
          break;
      }

      return order === 'asc' ? comparison : -comparison;
    });

    return sortedProducts;
  }
}

export default DeletedProductService;
