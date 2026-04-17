import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../../nav/Side";
import Top from "../../nav/Top";
import {
  getShippingSettings,
  addShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  toggleShippingMethodStatus,
  updateFreeShipping,
} from "./service/shippingSettingsService";

export default function ShippingSettings() {
  const [selectedPage, setSelectedPage] = useState("shipping-settings");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data state
  const [methods, setMethods] = useState([]);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(0);
  const [freeShippingEnabled, setFreeShippingEnabled] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMethod, setEditingMethod] = useState(null);
  const [deletingMethod, setDeletingMethod] = useState(null);

  // Form state for add/edit modal
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    estimatedDays: "",
    isActive: true,
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fetch settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setProgress(30);
    try {
      const data = await getShippingSettings();
      if (data) {
        setMethods(data.methods || []);
        setFreeShippingThreshold(data.freeShippingThreshold || 0);
        setFreeShippingEnabled(data.freeShippingEnabled || false);
        setUpdatedAt(data.updatedAt || null);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      estimatedDays: "",
      isActive: true,
    });
  };

  const handleOpenAddModal = () => {
    resetForm();
    setEditingMethod(null);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (method) => {
    setFormData({
      name: method.name,
      description: method.description || "",
      price: method.price.toString(),
      estimatedDays: method.estimatedDays || "",
      isActive: method.isActive,
    });
    setEditingMethod(method);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingMethod(null);
    resetForm();
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmitMethod = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setProgress(50);

    try {
      const methodData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        estimatedDays: formData.estimatedDays,
        isActive: formData.isActive,
      };

      if (editingMethod) {
        await updateShippingMethod(editingMethod._id, methodData);
      } else {
        await addShippingMethod(methodData);
      }

      await loadSettings();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving method:", error);
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  const handleDeleteMethod = async () => {
    if (!deletingMethod) return;

    setIsSubmitting(true);
    setProgress(50);

    try {
      await deleteShippingMethod(deletingMethod._id);
      await loadSettings();
      setDeletingMethod(null);
    } catch (error) {
      console.error("Error deleting method:", error);
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  const handleToggleStatus = async (method) => {
    setProgress(50);
    try {
      await toggleShippingMethodStatus(method._id);
      await loadSettings();
    } catch (error) {
      console.error("Error toggling status:", error);
    } finally {
      setProgress(100);
    }
  };

  const handleUpdateFreeShipping = async () => {
    setIsSubmitting(true);
    setProgress(50);

    try {
      await updateFreeShipping({
        freeShippingThreshold,
        freeShippingEnabled,
      });
    } catch (error) {
      console.error("Error updating free shipping:", error);
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  return (
    <>
      <Helmet>
        <title>Shipping Settings - Admin</title>
      </Helmet>

      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

      <Side
        selectedPage={selectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
        toggleSidebar={toggleSidebar}
      />

      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Shipping Settings
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage shipping methods and pricing for your store
                </p>
              </div>
              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <svg
                  className="-ml-1 mr-2 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add Shipping Method
              </button>
            </div>

            {/* Shipping Methods Card */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Shipping Methods
                  </h2>
                  {updatedAt && (
                    <p className="text-sm text-gray-500 mt-1">
                      Last updated: {new Date(updatedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  {methods.length} method{methods.length !== 1 ? "s" : ""}
                </span>
              </div>

              {loading ? (
                <div className="px-6 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p className="mt-4 text-gray-600">Loading...</p>
                </div>
              ) : methods.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No shipping methods
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new shipping method.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {methods
                    .sort((a, b) => (a.order || 0) - (b.order || 0))
                    .map((method) => (
                      <div
                        key={method._id}
                        className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="text-sm font-medium text-gray-900">
                              {method.name}
                            </h3>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                method.isActive
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {method.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                          {method.description && (
                            <p className="mt-1 text-sm text-gray-500">
                              {method.description}
                            </p>
                          )}
                          <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                            <span className="font-medium text-gray-900">
                              £{method.price.toFixed(2)}
                            </span>
                            {method.estimatedDays && (
                              <span>{method.estimatedDays}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleToggleStatus(method)}
                            className={`p-2 rounded-md ${
                              method.isActive
                                ? "text-yellow-600 hover:bg-yellow-50"
                                : "text-blue-600 hover:bg-blue-50"
                            }`}
                            title={method.isActive ? "Deactivate" : "Activate"}
                          >
                            {method.isActive ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(method)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                            title="Edit"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeletingMethod(method)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                            title="Delete"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={1.5}
                              stroke="currentColor"
                              className="w-5 h-5"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

          </div>
        </main>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                {editingMethod ? "Edit Shipping Method" : "Add Shipping Method"}
              </h3>
            </div>
            <form onSubmit={handleSubmitMethod}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleFormChange}
                    placeholder="e.g., Standard Shipping"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <input
                    type="text"
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="e.g., Delivery within 5-7 business days"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Price (£) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="0.00"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="estimatedDays"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Estimated Delivery
                  </label>
                  <input
                    type="text"
                    id="estimatedDays"
                    name="estimatedDays"
                    value={formData.estimatedDays}
                    onChange={handleFormChange}
                    placeholder="e.g., 5-7 business days"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleFormChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Active (visible to customers)
                  </label>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingMethod
                    ? "Update"
                    : "Add Method"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingMethod && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-sm w-full">
            <div className="px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Delete Shipping Method
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Are you sure you want to delete "{deletingMethod.name}"? This
                action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setDeletingMethod(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMethod}
                disabled={isSubmitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isSubmitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
