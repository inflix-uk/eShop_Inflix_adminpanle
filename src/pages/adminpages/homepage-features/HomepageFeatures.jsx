import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../nav/Side";
import Top from "../nav/Top";
import {
  getAllHomepageFeatures,
  createHomepageFeature,
  updateHomepageFeature,
  deleteHomepageFeature,
  toggleHomepageFeatureStatus,
  reorderHomepageFeatures,
} from "./service/homepageFeaturesService";
import {
  FeatureModal,
  FeaturesTable,
  DeleteConfirmationModal,
} from "./components";

export default function HomepageFeatures() {
  const [selectedPage, setSelectedPage] = useState("homepage-features");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [deleteFeatureId, setDeleteFeatureId] = useState(null);
  const [deleteFeatureName, setDeleteFeatureName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = async () => {
    setLoading(true);
    setProgress(30);
    try {
      const data = await getAllHomepageFeatures();
      setFeatures(data);
    } catch (error) {
      console.error("Error loading features:", error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  const handleOpenModal = (feature = null) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedFeature(null);
    setIsModalOpen(false);
  };

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setProgress(50);

    try {
      const featureData = {
        title: formData.title.trim(),
        subtitle: formData.subtitle.trim(),
        isActive: formData.isActive,
        iconWidth: parseInt(formData.iconWidth, 10) || 25,
        iconHeight: parseInt(formData.iconHeight, 10) || 25,
      };

      // Handle image file for upload or existing URL for update
      if (formData.iconImage instanceof File) {
        featureData.iconImage = formData.iconImage;
      } else if (formData.iconImagePreview && selectedFeature) {
        // Keep existing image if no new file uploaded
        featureData.iconImage = formData.iconImagePreview;
      }

      let result;
      if (selectedFeature) {
        result = await updateHomepageFeature(selectedFeature._id, featureData);
      } else {
        result = await createHomepageFeature(featureData);
      }

      if (result) {
        handleCloseModal();
        await loadFeatures();
      }
    } catch (error) {
      console.error("Error submitting feature:", error);
    } finally {
      setIsSubmitting(false);
      setProgress(100);
    }
  };

  const handleDelete = (id, name) => {
    setDeleteFeatureId(id);
    setDeleteFeatureName(name);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteFeatureId) {
      setProgress(50);
      const result = await deleteHomepageFeature(deleteFeatureId);
      if (result) {
        setIsDeleteModalOpen(false);
        setDeleteFeatureId(null);
        setDeleteFeatureName("");
        await loadFeatures();
      }
      setProgress(100);
    }
  };

  const handleToggleStatus = async (id, isActive) => {
    setProgress(50);
    const result = await toggleHomepageFeatureStatus(id, isActive);
    if (result) {
      await loadFeatures();
    }
    setProgress(100);
  };

  const handleReorder = async (featureIds) => {
    setProgress(50);
    const result = await reorderHomepageFeatures(featureIds);
    if (result) {
      await loadFeatures();
    }
    setProgress(100);
  };

  return (
    <>
      <Helmet>
        <title>Homepage Features - Admin</title>
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
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Homepage Features
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage the features section displayed on your homepage
                </p>
              </div>
              <button
                onClick={() => handleOpenModal()}
                className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-md flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create New Feature
              </button>
            </div>

            {/* Features Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <FeaturesTable
                features={features}
                loading={loading}
                onEdit={handleOpenModal}
                onDelete={handleDelete}
                onToggleStatus={handleToggleStatus}
                onReorder={handleReorder}
              />
            </div>

            {/* Info Card */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-sm font-semibold text-blue-900 mb-2">
                About Homepage Features:
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-blue-800">
                <li>Features are displayed in a horizontal row on the homepage</li>
                <li>Only active features are shown on the website</li>
                <li>Drag and drop rows to reorder features</li>
                <li>Icon images should be 25x25 pixels for best results</li>
                <li>Use PNG or SVG with transparent background for icons</li>
              </ul>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <FeatureModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSubmit}
        feature={selectedFeature}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteFeatureId(null);
          setDeleteFeatureName("");
        }}
        onConfirm={handleConfirmDelete}
        itemName={deleteFeatureName}
      />
    </>
  );
}
