import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import Side from "../nav/Side";
import Top from "../nav/Top";
import {
  fetchAllDeals,
  createDeal,
  updateDeal,
  expireDeal,
  unexpireDeal,
  deleteDeal,
} from "./service/dealsService";
import {
  DealsTable,
  DealsModal,
  SearchBar,
  Pagination,
  DeleteConfirmationModal,
} from "./components";
import { TableSkeleton } from "../shared/Skeletons";

export default function Deals() {
  const [selectedPage, setSelectedPage] = useState("deals");
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Data state
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isUnexpireModalOpen, setIsUnexpireModalOpen] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [isEdit, setIsEdit] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    desc: "",
    type: "Deal",
    startDate: "",
    hasExpiry: "yes", // Radio button: 'yes' or 'no'
    expiryDate: "",
    link: "",
    couponCode: "",
    buttonText: "",
    emoji: "",
    isPublish: false,
  });

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fetch deals on component mount
  useEffect(() => {
    console.log("Deals component mounted, calling loadDeals...");
    loadDeals();
  }, []);

  const loadDeals = async () => {
    console.log("loadDeals function called");
    setLoading(true);
    setProgress(30);
    try {
      console.log("About to call fetchAllDeals API...");
      const dealsData = await fetchAllDeals();
      console.log("Received deals data:", dealsData);
      setDeals(dealsData);
    } catch (error) {
      console.error("Error loading deals:", error);
    } finally {
      setLoading(false);
      setProgress(100);
    }
  };

  // Filter deals based on search query
  const filteredDeals = deals.filter(
    (deal) =>
      deal.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.desc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deal.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredDeals.length / itemsPerPage);
  const indexOfFirstDeal = (currentPage - 1) * itemsPerPage;
  const indexOfLastDeal = currentPage * itemsPerPage;
  const currentDeals = filteredDeals.slice(indexOfFirstDeal, indexOfLastDeal);

  // Handle modal operations
  const handleOpenModal = (deal = null) => {
    if (deal) {
      setIsEdit(true);
      setSelectedDeal(deal);
      // Determine if deal has expiry based on expiryDate presence or expiry text
      const hasExpiryValue = deal.expiryDate
        ? "yes"
        : deal.expiry === "No Expiry"
        ? "no"
        : "yes";
      setFormData({
        title: deal.title || "",
        desc: deal.desc || "",
        type: deal.type || "Deal",
        startDate: deal.startDate
          ? new Date(deal.startDate).toISOString().split("T")[0]
          : "",
        hasExpiry: hasExpiryValue,
        expiryDate: deal.expiryDate
          ? new Date(deal.expiryDate).toISOString().split("T")[0]
          : "",
        link: deal.link || "",
        couponCode: deal.couponCode || "",
        buttonText: deal.buttonText || "",
        emoji: deal.emoji || "",
        isPublish: deal.isPublish || false,
      });
    } else {
      setIsEdit(false);
      setSelectedDeal(null);
      setFormData({
        title: "",
        desc: "",
        type: "Deal",
        startDate: "",
        hasExpiry: "yes",
        expiryDate: "",
        link: "",
        couponCode: "",
        buttonText: "",
        emoji: "",
        isPublish: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDeal(null);
    setIsEdit(false);
    setFormData({
      title: "",
      desc: "",
      type: "Deal",
      startDate: "",
      hasExpiry: "yes",
      expiryDate: "",
      link: "",
      couponCode: "",
      buttonText: "",
      emoji: "",
      isPublish: false,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProgress(50);

    try {
      // Prepare deal data - send link for Deal, couponCode for Coupon
      const dealData = {
        title: formData.title,
        desc: formData.desc,
        type: formData.type,
        startDate: formData.startDate || undefined,
        // Handle expiry: if no expiry, send "No Expiry" text, otherwise send expiryDate
        ...(formData.hasExpiry === "no"
          ? { expiry: "No Expiry" }
          : { expiryDate: formData.expiryDate || undefined }),
        buttonText: formData.buttonText || undefined,
        emoji: formData.emoji || undefined,
        isPublish: Boolean(formData.isPublish),
        // Send appropriate field based on type
        ...(formData.type === "Deal"
          ? { link: formData.link }
          : { couponCode: formData.couponCode }),
      };

      let result;
      if (isEdit) {
        result = await updateDeal(selectedDeal._id, dealData);
      } else {
        result = await createDeal(dealData);
      }

      if (result) {
        await loadDeals(); // Reload deals
        handleCloseModal();
      }
    } catch (error) {
      console.error("Error saving deal:", error);
    } finally {
      setProgress(100);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedDeal) return;

    setProgress(50);
    try {
      const result = await deleteDeal(selectedDeal._id);
      if (result) {
        await loadDeals(); // Reload deals
        setIsDeleteModalOpen(false);
        setSelectedDeal(null);
      }
    } catch (error) {
      console.error("Error deleting deal:", error);
    } finally {
      setProgress(100);
    }
  };

  // Handle expire
  const handleExpire = async (deal) => {
    setProgress(50);
    try {
      const result = await expireDeal(deal._id);
      if (result) {
        await loadDeals(); // Reload deals
      }
    } catch (error) {
      console.error("Error expiring deal:", error);
    } finally {
      setProgress(100);
    }
  };

  // Handle unexpire
  const handleUnexpire = async () => {
    if (!selectedDeal) return;

    setProgress(50);
    try {
      const result = await unexpireDeal(selectedDeal._id);
      if (result) {
        await loadDeals(); // Reload deals
        setIsUnexpireModalOpen(false);
        setSelectedDeal(null);
      }
    } catch (error) {
      console.error("Error unexpiring deal:", error);
    } finally {
      setProgress(100);
    }
  };

  // Handle search
  const handleSearch = (query) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <>
      <Helmet>
        <title>Deals & Discounts - Admin</title>
      </Helmet>

      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

      <Side
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
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

        <main className="py-5">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Deals & Discounts
                  </h1>
                  <p className="mt-2 text-sm text-gray-600">
                    Manage promotional deals and discount coupons
                  </p>
                </div>
                <div className="mt-4 sm:mt-0">
                  <button
                    onClick={() => handleOpenModal()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    <svg
                      className="-ml-1 mr-2 h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add New Deal
                  </button>
                </div>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="mb-6">
              <SearchBar
                searchQuery={searchQuery}
                onSearchChange={handleSearch}
                placeholder="Search deals by title, description, or type..."
              />
            </div>

            {/* Deals Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {loading ? (
                <TableSkeleton rows={8} columns={7} />
              ) : (
              <DealsTable
                deals={currentDeals}
                loading={loading}
                onEdit={handleOpenModal}
                onDelete={(deal) => {
                  setSelectedDeal(deal);
                  setIsDeleteModalOpen(true);
                }}
                onExpire={handleExpire}
                onUnexpire={(deal) => {
                  setSelectedDeal(deal);
                  setIsUnexpireModalOpen(true);
                }}
              />
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      <DealsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        formData={formData}
        setFormData={setFormData}
        isEdit={isEdit}
        loading={progress > 0}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedDeal(null);
        }}
        onConfirm={handleDelete}
        title="Delete Deal"
        message={`Are you sure you want to delete "${selectedDeal?.title}"? This action cannot be undone.`}
        loading={progress > 0}
      />

      <DeleteConfirmationModal
        isOpen={isUnexpireModalOpen}
        onClose={() => {
          setIsUnexpireModalOpen(false);
          setSelectedDeal(null);
        }}
        onConfirm={handleUnexpire}
        title="Reactivate Deal"
        message={`Are you sure you want to reactivate "${selectedDeal?.title}"? This will mark it as active again.`}
        loading={progress > 0}
        confirmButtonText="Reactivate"
        confirmButtonColor="green"
      />
    </>
  );
}
