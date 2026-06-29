import axios from "axios";

/**
 * Product API
 * Handles all API calls related to products
 */

// Backend URL from environment variable
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

class ProductApi {
  /**
   * Fetch product details by ID
   * @param {string} productId - The product ID
   * @returns {Promise} - Axios response
   */
  async getProduct(productId) {
    return axios.get(`${BACKEND_URL}get/product/${productId}`);
  }

  /**
   * Fetch product details by slug (producturl)
   * @param {string} slug - The product slug/URL
   * @returns {Promise} - Axios response
   */
  async getProductBySlug(slug) {
    return axios.get(`${BACKEND_URL}get/product/slug/${slug}`);
  }

  /**
   * Fetch all brands
   * @returns {Promise} - Axios response
   */
  async getBrands() {
    return axios.get(`${BACKEND_URL}get/product/brand`);
  }

  /**
   * Fetch variant attribute values by attribute ID
   * @param {string} attributeId - The variant attribute ID
   * @returns {Promise} - Axios response
   */
  async getVariantAttributeValues(attributeId) {
    return axios.get(`${BACKEND_URL}get/variant-attribute/${attributeId}/values`);
  }

  /**
   * Fetch all variant attributes, or a specific one by slug
   * @param {string} slug - Optional slug to fetch specific attribute with values
   * @returns {Promise} - Axios response
   */
  async getVariantAttributes(slug = null) {
    const url = slug
      ? `${BACKEND_URL}get/variant-attributes?slug=${encodeURIComponent(slug)}`
      : `${BACKEND_URL}get/variant-attributes`;
    return axios.get(url);
  }

  /**
   * Fetch brands with product counts for admin panel
   * @returns {Promise} - Axios response with brands and their product counts
   */
  async getBrandsWithProductCount() {
    return axios.get(`${BACKEND_URL}get/brands-with-product-count`);
  }

  /**
   * Fetch all conditions
   * @returns {Promise} - Axios response
   */
  async getConditions() {
    return axios.get(`${BACKEND_URL}get/product/condition`);
  }

  /**
   * Fetch all tags
   * @returns {Promise} - Axios response
   */
  async getTags() {
    return axios.get(`${BACKEND_URL}get/product/tag`);
  }

  /**
   * Fetch all variant conditions
   * @returns {Promise} - Axios response
   */
  async getVariantConditions() {
    return axios.get(`${BACKEND_URL}get/product/variantcondition`);
  }

  /**
   * Fetch all storage options
   * @returns {Promise} - Axios response
   */
  async getStorage() {
    return axios.get(`${BACKEND_URL}get/product/storage`);
  }

  /**
   * Fetch all color options
   * @returns {Promise} - Axios response
   */
  async getColors() {
    return axios.get(`${BACKEND_URL}get/product/color`);
  }

  /**
   * Update product
   * @param {string} productId - The product ID
   * @param {FormData} formData - The form data containing product details
   * @returns {Promise} - Axios response
   */
  async updateProduct(productId, formData) {
    return axios.patch(`${BACKEND_URL}update/product/${productId}`, formData);
  }

  /**
   * Create a new product
   * @param {FormData} formData - The form data containing product details
   * @returns {Promise} - Axios response
   */
  async createProduct(formData) {
    return axios.post(`${BACKEND_URL}create/product`, formData);
  }

  /**
   * Delete a product
   * @param {string} productId - The product ID
   * @returns {Promise} - Axios response
   */
  async deleteProduct(productId) {
    return axios.delete(`${BACKEND_URL}delete/product/${productId}`);
  }

  /**
   * Duplicate a product
   * @param {string} productId - The product ID
   * @returns {Promise} - Axios response
   */
  async duplicateProduct(productId) {
    return axios.post(`${BACKEND_URL}duplicate/product/${productId}`);
  }

  /**
   * Update product status
   * @param {string} productId - The product ID
   * @param {boolean} status - The new status
   * @returns {Promise} - Axios response
   */
  async updateProductStatus(productId, status) {
    return axios.patch(`${BACKEND_URL}status/product/${productId}`, { status });
  }

  /**
   * Update product featured status
   * @param {string} productId - The product ID
   * @param {boolean} is_featured - The new featured status
   * @returns {Promise} - Axios response
   */
  async updateProductFeatured(productId, is_featured) {
    return axios.patch(`${BACKEND_URL}feature/product/${productId}`, { is_featured });
  }

  /**
   * Fetch all products
   * @param {number} batchSize - Number of products per batch
   * @param {number} skip - Number of products to skip
   * @returns {Promise} - Axios response
   */
  async getAllProducts(batchSize = 100, skip = 0) {
    return axios.get(`${BACKEND_URL}get/all/newProduct/adminpage?batchSize=${batchSize}&skip=${skip}`);
  }

  /**
   * Fetch all products with optional brand filtering
   * @param {number} batchSize - Number of products per batch
   * @param {number} skip - Number of products to skip
   * @param {string|null} brandName - Brand name, or UNASSIGNED_BRAND_KEY (`__unassigned__`) for brand-less products
   * @returns {Promise} - Axios response
   */
  async getAllProductsWithBrand(batchSize = 50, skip = 0, brandName = null) {
    let queryParams = `batchSize=${batchSize}&skip=${skip}`;
    if (brandName) {
      queryParams += `&brand=${encodeURIComponent(brandName)}`;
    }
    return axios.get(`${BACKEND_URL}get/all/newProduct/adminpage?${queryParams}`);
  }

  /**
   * Fetch variant values by product ID
   * @param {string} productId - The product ID
   * @returns {Promise} - Axios response
   */
  async getVariantValuesByProductId(productId) {
    return axios.get(`${BACKEND_URL}get/newProduct/variantValues/${productId}`);
  }

  /**
   * Fetch all categories
   * @returns {Promise} - Axios response
   */
  async getCategories() {
    return axios.get(`${BACKEND_URL}get/product/category`);
  }

  /**
   * Search products within a category (homepage / block picker).
   * @param {string} category - Category name (matches Product.category regex)
   * @param {{ searchname?: string, page?: number, limit?: number }} opts
   */
  async searchProductsByCategory(category, opts = {}) {
    const { searchname = '', page = 1, limit = 80 } = opts;
    const params = new URLSearchParams({
      category: String(category),
      page: String(page),
      limit: String(limit),
    });
    if (searchname && String(searchname).trim()) {
      params.set('searchname', String(searchname).trim());
    }
    return axios.get(`${BACKEND_URL}get/products/by/category/search?${params.toString()}`);
  }

  /** Newest in-stock products (homepage aggregate; blog slider uses first 6 client-side). */
  async getLatestProductsHomepage() {
    return axios.get(`${BACKEND_URL}get/latest/products/homepage`);
  }

  /** Active featured-flag products for blog/homepage pickers. */
  async getFeaturedProductsHomepage() {
    return axios.get(`${BACKEND_URL}get/Featureproducts/Homepage`);
  }

  /**
   * Fetch all draft/deactive products
   * @returns {Promise} - Axios response
   */
  async getDraftProducts() {
    return axios.get(`${BACKEND_URL}get/deactive/product`);
  }

  /**
   * Fetch all deleted products
   * @returns {Promise} - Axios response
   */
  async getDeletedProducts() {
    return axios.get(`${BACKEND_URL}get/deleted/product`);
  }

  /**
   * Restore a deleted product
   * @param {string} productId - The product ID
   * @returns {Promise} - Axios response
   */
  async restoreProduct(productId) {
    return axios.delete(`${BACKEND_URL}restore/delete/product/${productId}`);
  }

  /**
   * Permanently delete a product
   * @param {string} productId - The product ID
   * @returns {Promise} - Axios response
   */
  async permanentDeleteProduct(productId) {
    return axios.delete(`${BACKEND_URL}permanent/delete/product/${productId}`);
  }

  /**
   * Delete a specific image from a product (thumbnail or gallery)
   * @param {string} productId - The product ID
   * @param {string} imageType - 'thumbnail' or 'gallery'
   * @param {number} imageIndex - Index of gallery image (for gallery type)
   * @param {string} imagePath - Path of image (optional fallback)
   * @returns {Promise} - Axios response
   */
  async deleteProductImage(productId, imageType, imageIndex = null, imagePath = null) {
    return axios.patch(`${BACKEND_URL}delete/product/image/${productId}`, {
      imageType,
      imageIndex,
      imagePath
    });
  }

  /**
   * Delete a variant image from a product
   * @param {string} productId - The product ID
   * @param {string} optionSlug - The variant option slug (e.g., 'red', 'blue')
   * @param {number} imageIndex - Index of the image to delete
   * @returns {Promise} - Axios response
   */
  async deleteVariantImage(productId, optionSlug, imageIndex) {
    return axios.patch(`${BACKEND_URL}delete/product/variant-image/${productId}`, {
      optionSlug,
      imageIndex
    });
  }
}

export default ProductApi;
