import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * @typedef {Object} Label
 * @property {string} _id
 * @property {string} fileName
 * @property {string} filePath
 * @property {number} fileSize
 * @property {string} [uploadDate]
 * @property {string} [createdAt]
 * @property {Object} [uploadedBy]
 * @property {string} uploadedBy.name
 * @property {string} uploadedBy._id
 * @property {boolean} isDeleted
 */

/**
 * @typedef {Object} PaginationData
 * @property {number} page
 * @property {number} limit
 * @property {number} total
 * @property {number} pages
 */

/**
 * @typedef {Object} LabelsResponse
 * @property {Label[]} data
 * @property {PaginationData} pagination
 * @property {string} [message]
 */

/**
 * @typedef {Object} ToastOptions
 * @property {string} title
 * @property {string} description
 * @property {'success' | 'error' | 'warning' | 'info'} status
 */

/**
 * @typedef {Object} LabelOperationResult
 * @property {boolean} success
 * @property {string} message
 * @property {*} [data]
 */

/**
 * @typedef {Object} LabelState
 * @property {Label[]} labels
 * @property {boolean} loading
 * @property {File[]} selectedFiles
 * @property {number} uploadProgress
 * @property {string} search
 * @property {PaginationData} pagination
 * @property {boolean} editModalOpen
 * @property {Label | null} currentLabel
 */

// Service class for PDF Label operations
class PdfLabelService {
  /**
   * Fetch labels with search, used filter, and pagination
   * @param {number} page
   * @param {number} limit
   * @param {string} [search]
   * @param {boolean | null} [used]
   * @param {string} [orderNumber]
   * @returns {Promise<{data: Label[], pagination: PaginationData}>}
   */
  async getLabels(page = 1, limit = 10, search, used, orderNumber) {
    try {
      const response = await axios.get(`${API_BASE_URL}get/labels`, {
        params: {
          page,
          limit,
          search: search || undefined,
          used: used !== null && used !== undefined ? used : undefined,
          orderNumber: orderNumber || undefined
        }
      });

      return {
        data: response.data.data || [],
        pagination: response.data.pagination || { page, limit, total: 0, pages: 0 }
      };
    } catch (error) {
      console.error('Error fetching labels:', error);
      throw error;
    }
  }

  /**
   * Upload PDF labels
   * @param {File[]} files
   * @param {function(number): void} [onProgressUpdate]
   * @returns {Promise<*>}
   */
  async uploadLabels(files, onProgressUpdate) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('labels', file);
    });
    
    try {
      const response = await axios.post(`${API_BASE_URL}upload/labels`, formData, {
        onUploadProgress: (progressEvent) => {
          if (onProgressUpdate && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgressUpdate(percentCompleted);
          }
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error uploading labels:', error);
      throw error;
    }
  }

  /**
   * Update label filename
   * @param {string} labelId
   * @param {string} fileName
   * @returns {Promise<*>}
   */
  async updateLabel(labelId, fileName) {
    try {
      const response = await axios.patch(`${API_BASE_URL}update/label/${labelId}`, {
        fileName
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating label:', error);
      throw error;
    }
  }

  /**
   * Delete a label
   * @param {string} labelId
   * @returns {Promise<*>}
   */
  async deleteLabel(labelId) {
    try {
      const response = await axios.delete(`${API_BASE_URL}delete/label/${labelId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting label:', error);
      throw error;
    }
  }

  /**
   * Get view URL for a label
   * @param {string} labelId
   * @returns {string}
   */
  getViewUrl(labelId) {
    return `${API_BASE_URL}view/label/${labelId}`;
  }

  /**
   * Format file size for display
   * @param {number} bytes
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  }

  /**
   * Format date for display
   * @param {string} dateString
   * @returns {string}
   */
  formatDate(dateString) {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
  
  /**
   * Validate files to ensure they are PDFs
   * @param {File[]} files
   * @returns {{valid: boolean, invalidFiles: string[]}}
   */
  validateFiles(files) {
    const invalidFiles = [];
    
    files.forEach(file => {
      if (file.type !== 'application/pdf') {
        invalidFiles.push(file.name);
      }
    });
    
    return {
      valid: invalidFiles.length === 0,
      invalidFiles
    };
  }
  
  /**
   * Handle file selection and validation
   * @param {FileList} files
   * @returns {{selectedFiles: File[], invalidFiles: string[]}}
   */
  handleFileSelection(files) {
    const fileArray = Array.from(files);
    const validation = this.validateFiles(fileArray);
    
    return {
      selectedFiles: validation.valid ? fileArray : fileArray.filter(file => file.type === 'application/pdf'),
      invalidFiles: validation.invalidFiles
    };
  }
  
  /**
   * Handle search with pagination reset
   * @param {string} search
   * @returns {{search: string, pagination: Partial<PaginationData>}}
   */
  handleSearch(search) {
    return {
      search,
      pagination: { page: 1 } // Reset to first page on search
    };
  }
  
  /**
   * Handle page change
   * @param {number} newPage
   * @returns {Partial<PaginationData>}
   */
  handlePageChange(newPage) {
    return { page: newPage };
  }

  /**
   * Handle items per page change
   * @param {number} newLimit
   * @returns {Partial<PaginationData>}
   */
  handleLimitChange(newLimit) {
    return {
      limit: newLimit,
      page: 1 // Reset to first page when changing limit
    };
  }
}

export default new PdfLabelService();

// Helper functions that can be used outside the service instance

/**
 * Create a toast notification
 * @param {ToastOptions} options
 * @param {string} options.title
 * @param {string} options.description
 * @param {'success' | 'error' | 'warning' | 'info'} options.status
 */
export const createToast = ({ title, description, status }) => {
  const statusClass = 
    status === 'error' ? 'bg-red-500' : 
    status === 'success' ? 'bg-blue-500' : 
    status === 'warning' ? 'bg-yellow-500' : 'bg-blue-500';
  
  const toastElement = document.createElement('div');
  toastElement.className = `fixed top-4 right-4 p-4 rounded shadow-lg ${statusClass} text-white z-50`;
  toastElement.innerHTML = `
    <div class="font-bold">${title}</div>
    <div>${description}</div>
  `;
  
  document.body.appendChild(toastElement);
  
  setTimeout(() => {
    toastElement.classList.add('opacity-0', 'transition-opacity');
    setTimeout(() => document.body.removeChild(toastElement), 300);
  }, 5000);
};

/**
 * Create initial state for the labels page
 * @returns {LabelState}
 */
export const createInitialLabelState = () => ({
  labels: [],
  loading: false,
  selectedFiles: [],
  uploadProgress: 0,
  search: '',
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  },
  editModalOpen: false,
  currentLabel: null
});

/**
 * Handle API errors with toast notification
 * @param {*} error
 * @param {string} errorMessage
 */
export const handleApiError = (error, errorMessage) => {
  console.error(`${errorMessage}:`, error);
  createToast({
    title: "Error",
    description: error.response?.data?.message || errorMessage,
    status: "error"
  });
};

/**
 * Show success toast
 * @param {string} message
 */
export const showSuccessToast = (message) => {
  createToast({
    title: "Success",
    description: message,
    status: "success"
  });
};

/**
 * Show warning toast
 * @param {string} message
 */
export const showWarningToast = (message) => {
  createToast({
    title: "Warning",
    description: message,
    status: "warning"
  });
};
