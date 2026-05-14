import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import { useNavigate } from "react-router-dom";
import Side from "../nav/Side";
import Top from "../nav/Top";
import {
  fetchAllBanners,
  deleteBanner,
  toggleBannerStatus,
  reorderBanners,
} from "./service/bannersService";
import {
  BannersTable,
  DeleteConfirmationModal,
  HeroSocialSettingsCard,
} from "./components";
import BannerPreviewModal from "./components/BannerPreviewModal";

export default function Banners() {
  const [selectedPage, setSelectedPage] = useState("banners");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data state
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fetch banners on component mount
  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    setLoading(true);
    setProgress(30);
    try {
      const bannersData = await fetchAllBanners();
      setBanners(bannersData);
    } catch (error) {
      console.error("Error loading banners:", error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  // Filter banners based on search query
  const filteredBanners = banners.filter(
    (banner) =>
      banner.altText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      banner.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle delete
  const handleDelete = async (id) => {
    setProgress(50);
    try {
      const result = await deleteBanner(id);
      if (result) {
        setIsDeleteModalOpen(false);
        await loadBanners();
      }
    } catch (error) {
      console.error("Error deleting banner:", error);
    } finally {
      setProgress(100);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id) => {
    setProgress(30);
    try {
      const result = await toggleBannerStatus(id);
      if (result) {
        await loadBanners();
      }
    } catch (error) {
      console.error("Error toggling banner status:", error);
    } finally {
      setProgress(100);
    }
  };

  // Handle reorder
  const handleReorder = async (reorderData) => {
    setProgress(30);
    try {
      const result = await reorderBanners(reorderData);
      if (result) {
        await loadBanners();
      }
    } catch (error) {
      console.error("Error reordering banners:", error);
    } finally {
      setProgress(100);
    }
  };

  return (
    <>
      <Helmet>
        <title>Banners - Admin</title>
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
            <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Banners</h1>
                <p className="mt-2 text-gray-600">
                  Manage hero banners for the frontend carousel
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex gap-3">
                <button
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Preview Banner
                </button>
                <button
                  onClick={() => navigate("/admin/banners/create")}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Create New Banner
                </button>
              </div>
            </div>

            <HeroSocialSettingsCard />

            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search banners by alt text or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Banners Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <BannersTable
                banners={filteredBanners}
                loading={loading}
                onEdit={(banner) => navigate(`/admin/banners/edit/${banner._id}`)}
                onDelete={(id) => {
                  setSelectedBanner(banners.find((b) => b._id === id));
                  setIsDeleteModalOpen(true);
                }}
                onToggleStatus={handleToggleStatus}
                onReorder={handleReorder}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedBanner(null);
        }}
        onConfirm={() => handleDelete(selectedBanner?._id)}
        bannerAltText={selectedBanner?.altText}
      />

      {/* Preview Modal */}
      <BannerPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        banners={banners}
      />
    </>
  );
}
