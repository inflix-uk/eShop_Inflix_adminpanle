/**
 * Draft Product Service
 * Handles business logic and data transformation for draft products
 * Note: API calls are handled by ProductApi class
 */

class DraftProductService {
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
      const categoryMatch = product.category?.toLowerCase().includes(searchQuery);
      const conditionMatch = product.condition?.toLowerCase().includes(searchQuery);
      const brandMatch = product.brand?.toLowerCase().includes(searchQuery);

      return nameMatch || categoryMatch || conditionMatch || brandMatch;
    });
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

  /**
   * Validate if product can be published
   * @param {Object} product - Product object
   * @returns {Object} - Validation result { isValid: boolean, message: string }
   */
  validateForPublish(product) {
    if (!product) {
      return { isValid: false, message: 'Product not found' };
    }

    // Check required fields
    if (!product.name || product.name.trim() === '') {
      return { isValid: false, message: 'Product name is required' };
    }

    if (!product.category || product.category.trim() === '') {
      return { isValid: false, message: 'Product category is required' };
    }

    if (!product.variantValues || product.variantValues.length === 0) {
      return { isValid: false, message: 'At least one variant is required' };
    }

    // Check if at least one variant has quantity
    const hasStock = product.variantValues.some(variant =>
      variant.Quantity && variant.Quantity > 0
    );

    if (!hasStock) {
      return { isValid: false, message: 'At least one variant must have stock' };
    }

    return { isValid: true, message: 'Product is ready to publish' };
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
        withStock: 0,
        withoutStock: 0,
        totalVariants: 0
      };
    }

    const stats = {
      total: products.length,
      featured: 0,
      withStock: 0,
      withoutStock: 0,
      totalVariants: 0
    };

    products.forEach(product => {
      if (product.is_featured) {
        stats.featured++;
      }

      const hasStock = product.variantValues?.some(variant =>
        variant.Quantity && variant.Quantity > 0
      );

      if (hasStock) {
        stats.withStock++;
      } else {
        stats.withoutStock++;
      }

      stats.totalVariants += this.getVariantsCount(product);
    });

    return stats;
  }
}

export default DraftProductService;
