import { useState, useEffect, useCallback } from 'react';
import { 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon, 
  EyeIcon 
} from '@heroicons/react/24/outline';
import Spinner from '../../../components/Spinner';
import EditLabelModal from './components/EditLabelModal';

import UploadSection from './components/UploadSection';
import Top from "../nav/Top.jsx";
import Side from "../nav/Side.jsx";
import { Helmet } from 'react-helmet-async';
import pdfLabelService, { 
  createInitialLabelState, 
  handleApiError, 
  showSuccessToast, 
  showWarningToast 
} from './service/PdfLabelService';

const PDFLabelsPage = () => {
  
  // Initialize state using the service helper function
  const initialState = createInitialLabelState();
  const [labels, setLabels] = useState(initialState.labels);
  const [loading, setLoading] = useState(initialState.loading);
  const [selectedFiles, setSelectedFiles] = useState(initialState.selectedFiles);
  const [uploadProgress, setUploadProgress] = useState(initialState.uploadProgress);
  const [search, setSearch] = useState(initialState.search);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'used', 'unused'
  const [orderNumberFilter, setOrderNumberFilter] = useState('');
  const [pagination, setPagination] = useState(initialState.pagination);
  const [editModalOpen, setEditModalOpen] = useState(initialState.editModalOpen);
  const [currentLabel, setCurrentLabel] = useState(initialState.currentLabel);
  
  // Sidebar state
  const [selectedPage] = useState("pdf-labels"); // Only destructure the value since we don't need the setter
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  
  const fetchLabels = useCallback(async () => {
    try {
      setLoading(true);
      const response = await pdfLabelService.getLabels(
        pagination.page,
        pagination.limit,
        search,
        statusFilter === 'used' ? true : statusFilter === 'unused' ? false : null,
        orderNumberFilter
      );

      setLabels(response.data);
      setPagination(prev => ({
        ...prev,
        total: response.pagination.total,
        pages: response.pagination.pages
      }));
    } catch (error) {
      handleApiError(error, "Failed to fetch labels");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, orderNumberFilter, pagination.page, pagination.limit]);
  
  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);
  
  const handleFileChange = (e) => {
    const result = pdfLabelService.handleFileSelection(e.target.files);
    
    if (result.invalidFiles.length > 0) {
      showWarningToast("Only PDF files are allowed. Non-PDF files were removed.");
    }
    
    setSelectedFiles(result.selectedFiles);
  };
  
  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      showWarningToast("Please select at least one PDF file to upload");
      return;
    }
    
    try {
      setLoading(true);
      setUploadProgress(0);
      
      const response = await pdfLabelService.uploadLabels(
        selectedFiles,
        (progress) => setUploadProgress(progress)
      );
      
      showSuccessToast(response.message || "Labels uploaded successfully");
      
      // Reset form and refresh label list
      setSelectedFiles([]);
      setUploadProgress(0);
      fetchLabels();
    } catch (error) {
      handleApiError(error, "Failed to upload labels");
    } finally {
      setLoading(false);
    }
  };
  
  const handleEditClick = (label) => {
    setCurrentLabel(label);
    setEditModalOpen(true);
  };
  
  const handleEditSubmit = async (labelData) => {
    try {
      setLoading(true);
      await pdfLabelService.updateLabel(labelData._id, labelData.fileName);
      
      showSuccessToast("Label updated successfully");
      
      setEditModalOpen(false);
      fetchLabels();
    } catch (error) {
      handleApiError(error, "Failed to update label");
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this label?')) {
      try {
        setLoading(true);
        await pdfLabelService.deleteLabel(id);
        
        showSuccessToast("Label deleted successfully");
        
        fetchLabels();
      } catch (error) {
        handleApiError(error, "Failed to delete label");
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleViewClick = (id) => {
    window.open(pdfLabelService.getViewUrl(id), '_blank');
  };
  
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    // Reset to first page when searching
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleLimitChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setPagination(prev => ({
      ...prev,
      limit: newLimit,
      page: 1 // Reset to first page when changing items per page
    }));
  };
  
  // Use the formatting functions directly from the service
  const { formatDate, formatFileSize } = pdfLabelService;
  
  return (
    <>
      <Helmet>
        <title>PDF Labels Management</title>
      </Helmet>
      <Side selectedPage={selectedPage} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} closeSidebar={closeSidebar} />
      <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="py-5 px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-6">PDF Labels Management</h1>
      
      {/* Upload Section */}
      <UploadSection
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        uploadProgress={uploadProgress}
        loading={loading}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
      />
      
      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div className="mb-4 md:mb-0 flex-1 md:mr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by file name..."
                  value={search}
                  onChange={handleSearchChange}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Filter by order number..."
                  value={orderNumberFilter}
                  onChange={(e) => {
                    setOrderNumberFilter(e.target.value);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <label className="text-sm text-gray-700 whitespace-nowrap mr-2">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when changing status
                }}
                className="border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Labels</option>
                <option value="used">Used</option>
                <option value="unused">Unused</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="text-sm text-gray-700 whitespace-nowrap mr-2">Show:</label>
              <select
                value={pagination.limit}
                onChange={handleLimitChange}
                className="border rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Labels Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded By</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading && !labels.length ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center">
                    <Spinner />
                  </td>
                </tr>
              ) : labels.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                    No labels found
                  </td>
                </tr>
              ) : (
                labels.map((label) => (
                  <tr key={label._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate">
                      {label.fileName}
                      {/* {label.used && (
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Used
                        </span>
                      )} */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {label.returnOrder ? (
                        <div className="flex flex-col gap-1">
                          <a
                            href={`/admin/edit-return-orders/${label.returnOrder._id}`}
                            className="text-blue-600 hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {label.returnOrder.rma || label.returnOrder.orderNumber || 'Return Order'}
                          </a>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800 w-fit">
                            Return
                          </span>
                        </div>
                      ) : label.order ? (
                        <a
                          href={`/admin/orderdetails/${label.order._id}`}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {label.order.orderNumber}
                        </a>
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatFileSize(label.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(label.uploadDate || label.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {label.uploadedBy?.name || 'Admin'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      <button
                        onClick={() => handleViewClick(label._id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View PDF"
                      >
                        <EyeIcon className="w-5 h-5 inline" />
                      </button>
                      <button
                        onClick={() => handleEditClick(label)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <PencilIcon className="w-5 h-5 inline" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(label._id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="w-5 h-5 inline" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className={`px-3 py-1 border rounded ${pagination.page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                >
                  Previous
                </button>
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                    // Show first 2 pages, current page and one before/after, and last 2 pages
                    let pageNum;
                    if (pagination.pages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.page <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.page >= pagination.pages - 2) {
                      pageNum = pagination.pages - 4 + i;
                    } else {
                      pageNum = pagination.page - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 flex items-center justify-center rounded ${
                          pagination.page === pageNum
                            ? 'bg-primary text-white'
                            : 'border hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.pages}
                  className={`px-3 py-1 border rounded ${
                    pagination.page === pagination.pages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Edit Modal */}
      <EditLabelModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        label={currentLabel}
      />
        </main>
      </div>
    </>
  );
};

export default PDFLabelsPage;
