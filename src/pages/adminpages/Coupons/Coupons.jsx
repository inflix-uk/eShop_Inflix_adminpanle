import { useEffect, useState, useCallback } from "react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import LoadingBar from "react-top-loading-bar";
import axios from "axios";
import { useAuth } from "../../../context/Auth";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import { CouponTable, CouponModal, SearchBar, Pagination, CouponDetailsPage } from "./components";
import { TableSkeleton } from "../shared/Skeletons";

export default function Coupons() {
  const [selectedPage, setSelectedPage] = useState("coupons");
  const [progress, setProgress] = useState(0);

  // modal for add/edit (kept)
  const [isOpen, setIsOpen] = useState(false);

  // full-page details (new)
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const auth = useAuth();
  const [isEdit, setisEdit] = useState(false);
  const [couponID, setCouponID] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponType, setCouponType] = useState("flat");
  const [couponUsage, setCouponUsage] = useState("");
  const [allowMultiple, setAllowMultiple] = useState("true");
  const [expiryDate, setExpiryDate] = useState("");
  const [discount, setDiscount] = useState("");
  const [upToValue, setUpToValue] = useState("");

  const [coupons, setCoupons] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [minOrderValue, setMinOrderValue] = useState("");

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setisEdit(true);
      setCouponID(coupon._id);
      setCouponCode(coupon.code || "");
      setAllowMultiple(
        coupon.allowMultiple === true || coupon.allowMultiple === "true"
          ? "true"
          : "false"
      );
      setCouponType(coupon.discount_type || "flat");
      setCouponUsage(coupon.usage ?? "");
      setExpiryDate(
        coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split("T")[0] : ""
      );
      setDiscount(coupon.discount ?? "");
      setUpToValue(coupon.upto ?? "");
      setMinOrderValue(coupon.minOrderValue ?? "");
    } else {
      setisEdit(false);
      setCouponID("");
      setCouponCode("");
      setCouponType("flat");
      setAllowMultiple("true");
      setCouponUsage("");
      setExpiryDate("");
      setDiscount("");
      setUpToValue("");
      setMinOrderValue("");
    }
    setIsOpen(true);
  };

  const handleCloseModal = () => {
    setIsOpen(false);
    setCouponID("");
    setCouponCode("");
    setCouponType("flat");
    setAllowMultiple("true");
    setCouponUsage("");
    setExpiryDate("");
    setDiscount("");
    setUpToValue("");
    setMinOrderValue("");
  };

  // NEW: open details as a full page
  const handleOpenDetails = (coupon) => {
    setSelectedCoupon(coupon);
  };

  const handleBackFromDetails = () => {
    setSelectedCoupon(null);
  };

  const handleDelete = (id) => {
    setProgress(50);
    axios
      .delete(`${auth.ip}delete/coupon/${id}`)
      .then((response) => {
        if (response.status === 200 || response.status === 201) {
          toast.success("Coupon deleted successfully.");
          getCoupons();
        } else {
          toast.error("Failed to delete the coupon");
        }
      })
      .catch((error) => {
        toast.error("An error occurred while deleting the coupon");
        console.error("Error:", error);
      })
      .finally(() => {
        setProgress(100);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setProgress(0);

    if (!couponCode) {
      toast.error("Enter a coupon code");
      setProgress(100);
      return;
    }

    const numericDiscount = Number(discount);
    const numericUpto = upToValue !== "" ? Number(upToValue) : undefined;

    if (couponType === "percentage") {
      if (Number.isNaN(numericDiscount) || numericDiscount < 0 || numericDiscount > 100) {
        toast.error("Percentage must be between 0 and 100");
        setProgress(100);
        return;
      }
      if (numericUpto == null || Number.isNaN(numericUpto)) {
        toast.error("Please specify the up to value");
        setProgress(100);
        return;
      }
    }

    const formData = {
      code: couponCode,
      type: couponType, // backend expects 'type'
      allowMultiple: allowMultiple === "true",
      usage: couponUsage,
      expiryDate: expiryDate || undefined,
      discount: numericDiscount,
      upto: couponType === "percentage" ? numericUpto : undefined,
      minOrderValue: minOrderValue !== "" ? Number(minOrderValue) : undefined,
    };

    if (isEdit) {
      axios
        .patch(`${auth.ip}update/coupon/${couponID}`, formData)
        .then((response) => {
          if (response.data.status === 201) {
            toast.success(response.data.message);
            setProgress(100);
            getCoupons();
            handleCloseModal();
          } else {
            toast.error(response.data.message || "Update failed");
            setProgress(100);
          }
        })
        .catch((error) => {
          toast.error("An error occurred while updating the coupon");
          console.error("Error:", error);
          setProgress(100);
        });
    } else {
      axios
        .post(`${auth.ip}create/coupon`, formData)
        .then((response) => {
          if (response.data.status === 201) {
            toast.success(response.data.message);
            setProgress(100);
            getCoupons();
            handleCloseModal();
          } else {
            toast.error(response.data.message || "Creation failed");
            setProgress(100);
          }
        })
        .catch((error) => {
          toast.error("An error occurred while creating the coupon");
          console.error("Error:", error);
          setProgress(100);
        });
    }
  };

  const getCoupons = useCallback(() => {
    setProgress(50);
    axios
      .get(`${auth.ip}get/all/coupons`)
      .then((response) => {
        if (response.data.status === 201) {
          const list = response.data.coupon || [];
          setCoupons(list);
          setTotalPages(Math.ceil(list.length / itemsPerPage));
          setProgress(100);
        } else {
          toast.error("Failed to load coupons");
          setProgress(100);
        }
      })
      .catch((error) => {
        toast.error("An error occurred while loading coupons");
        console.error("Error:", error);
        setProgress(100);
      });
  }, [auth.ip, itemsPerPage]);

  useEffect(() => {
    getCoupons();
  }, [getCoupons]);

  // Filter coupons based on search query and table columns
  const filteredCoupons = coupons.filter((coupon) => {
    const q = searchQuery.toLowerCase();

    const codeMatch = coupon.code?.toLowerCase().includes(q);
    const typeMatch = coupon.discount_type?.toLowerCase().includes(q);
    const usageMatch = coupon.usage
      ? coupon.usage.toString().toLowerCase().includes(q)
      : false;
    const dateStr = coupon.expiryDate
      ? new Date(coupon.expiryDate).toLocaleDateString()
      : "";
    const dateMatch = dateStr.includes(searchQuery);
    const discountMatch = coupon.discount?.toString().includes(searchQuery);

    return codeMatch || typeMatch || usageMatch || dateMatch || discountMatch;
  });

  useEffect(() => {
    setTotalPages(Math.ceil(filteredCoupons.length / itemsPerPage));
  }, [filteredCoupons, itemsPerPage]);

  const paginatedCoupons = filteredCoupons.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <Helmet>
        <title>{selectedCoupon ? `Coupon: ${selectedCoupon.code}` : "Coupons"}</title>
      </Helmet>

      <Side
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />

      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="p-5">
          {!selectedCoupon ? (
            <>
              <div className="flex justify-between items-center mb-3">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                  All Coupons
                </h1>
                <button
                  onClick={() => handleOpenModal()}
                  className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                >
                  Add Coupon
                </button>
              </div>

              <div className="relative shadow-lg rounded-lg border border-gray-200">
                <SearchBar
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  totalCoupons={filteredCoupons.length}
                />

                {progress > 0 && progress < 100 ? (
                  <TableSkeleton rows={8} columns={8} />
                ) : (
                  <CouponTable
                    coupons={paginatedCoupons}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                    onViewDetails={handleOpenDetails} // opens full page
                  />
                )}

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  itemsPerPage={itemsPerPage}
                  handlePageChange={handlePageChange}
                  handleItemsPerPageChange={handleItemsPerPageChange}
                />
              </div>

              <CouponModal
                isOpen={isOpen}
                handleCloseModal={handleCloseModal}
                isEdit={isEdit}
                couponCode={couponCode}
                setCouponCode={setCouponCode}
                couponType={couponType}
                setCouponType={setCouponType}
                allowMultiple={allowMultiple}
                setAllowMultiple={setAllowMultiple}
                couponUsage={couponUsage}
                setCouponUsage={setCouponUsage}
                expiryDate={expiryDate}
                setExpiryDate={setExpiryDate}
                discount={discount}
                setDiscount={setDiscount}
                upToValue={upToValue}
                setUpToValue={setUpToValue}
                minOrderValue={minOrderValue}
                setMinOrderValue={setMinOrderValue}
                handleSubmit={handleSubmit}
              />
            </>
          ) : (
            <CouponDetailsPage
              coupon={selectedCoupon}
              onBack={handleBackFromDetails}
            />
          )}
        </main>
      </div>
    </>
  );
}
