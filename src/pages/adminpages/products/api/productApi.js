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
   * Fetch all brands
   * @returns {Promise} - Axios response
   */
  async getBrands() {
    return axios.get(`${BACKEND_URL}get/product/brand`);
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
    return axios.get(`${BACKEND_URL}get/all/product/adminpage?batchSize=${batchSize}&skip=${skip}`);
  }

  /**
   * Fetch all categories
   * @returns {Promise} - Axios response
   */
  async getCategories() {
    return axios.get(`${BACKEND_URL}get/product/category`);
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
}

export default ProductApi;
