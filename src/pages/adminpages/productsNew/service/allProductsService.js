/**
 * All Products Service
 * Handles business logic and data transformation for active/published products
 * Note: API calls are handled by ProductApi class
 */

class AllProductsService {
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
   * Toggle publish/status for a product in the products array
   * @param {Array} products - Array of products
   * @param {number} index - Index of the product to update
   * @returns {Array} - Updated products array
   */
  toggleStatus(products, index) {
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
      return products || [];
    }

    const searchQuery = query.toLowerCase().trim();

    return products.filter(product => {
      const nameMatch = product.name?.toLowerCase().includes(searchQuery);
      const categoryMatch = product.category?.toLowerCase().includes(searchQuery);
      const conditionMatch = product.condition?.toLowerCase().includes(searchQuery);
      const brandMatch = product.brand?.toLowerCase().includes(searchQuery);

      return nameMatch || categoryMatch || conditionMatch || brandMatch;
    });
  }

  /**
   * Paginate products
   * @param {Array} products - Array of products to paginate
   * @param {number} currentPage - Current page number (1-indexed)
   * @param {number} itemsPerPage - Number of items per page
   * @returns {Object} - { paginatedProducts: Array, totalPages: number }
   */
  paginateProducts(products, currentPage = 1, itemsPerPage = 10) {
    if (!products || !Array.isArray(products) || products.length === 0) {
      return { paginatedProducts: [], totalPages: 0 };
    }

    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);

    return { paginatedProducts, totalPages };
  }

  /**
   * Sort brands by product count
   * @param {Array} brands - Array of brands
   * @param {string} order - Sort order ('asc' or 'desc')
   * @returns {Array} - Sorted brands
   */
  sortBrandsByProductCount(brands, order = 'desc') {
    if (!brands || !Array.isArray(brands)) {
      return brands || [];
    }

    const sortedBrands = [...brands].sort((a, b) => {
      const countA = a.productCount || 0;
      const countB = b.productCount || 0;
      return order === 'desc' ? countB - countA : countA - countB;
    });

    return sortedBrands;
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
   * Get product by ID from products array
   * @param {Array} products - Array of products
   * @param {string} productId - Product ID to find
   * @returns {Object|null} - Product object or null if not found
   */
  getProductById(products, productId) {
    if (!products || !Array.isArray(products) || !productId) {
      return null;
    }
    return products.find(p => p._id === productId) || null;
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
        active: 0,
        inactive: 0,
        totalVariants: 0
      };
    }

    const stats = {
      total: products.length,
      featured: 0,
      active: 0,
      inactive: 0,
      totalVariants: 0
    };

    products.forEach(product => {
      if (product.is_featured) {
        stats.featured++;
      }

      if (product.status) {
        stats.active++;
      } else {
        stats.inactive++;
      }

      stats.totalVariants += this.getVariantsCount(product);
    });

    return stats;
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
   * Validate product data
   * @param {Object} product - Product object
   * @returns {Object} - Validation result { isValid: boolean, errors: Array }
   */
  validateProduct(product) {
    const errors = [];

    if (!product) {
      return { isValid: false, errors: ['Product data is missing'] };
    }

    if (!product.name || product.name.trim() === '') {
      errors.push('Product name is required');
    }

    if (!product.category || product.category.trim() === '') {
      errors.push('Product category is required');
    }

    if (!product.variantValues || product.variantValues.length === 0) {
      errors.push('At least one variant is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export default AllProductsService;
