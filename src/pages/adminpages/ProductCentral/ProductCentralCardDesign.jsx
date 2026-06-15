import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Side from "../nav/Side";
import Top from "../nav/Top";
import LoadingBar from "react-top-loading-bar";
import ProductCentralTabs from "./ProductCentralTabs";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../../context/Auth";
import axios from "axios";

const CARD_DESIGNS = [
  {
    id: "classic",
    name: "Classic",
    description: "Traditional product card with condition badge, discount tag, and star ratings",
    features: ["Condition badge", "Discount percentage", "Star ratings", "Hover zoom effect"],
  },
  {
    id: "modern",
    name: "Modern",
    description: "Clean minimal design with large product image, uppercase title, and simple pricing",
    features: ["Minimal design", "Large image", "Uppercase title", "Clean price display"],
  },
];

export default function ProductCentralCardDesign() {
  const auth = useAuth();
  const [selectedPage, setSelectedPage] = useState("product-central-main");
  const [selectedTab, setSelectedTab] = useState("card-design");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeDesign, setActiveDesign] = useState("classic");
  const [savedDesign, setSavedDesign] = useState("classic");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const adminHeaders = {
    "x-user-role": "admin",
    "Content-Type": "application/json",
  };

  // Fetch current settings
  useEffect(() => {
    setProgress(30);
    setIsLoading(true);
    axios
      .get(`${auth.ip}product-card/settings`, { headers: adminHeaders })
      .then((response) => {
        if (response.data.success) {
          const design = response.data.data.activeDesign || "classic";
          setActiveDesign(design);
          setSavedDesign(design);
        }
        setProgress(100);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching product card settings:", error);
        setProgress(100);
        setIsLoading(false);
      });
  }, [auth.ip]);

  const handleSave = async () => {
    setIsSaving(true);
    setProgress(30);
    try {
      const response = await axios.put(
        `${auth.ip}product-card/settings`,
        { activeDesign },
        { headers: adminHeaders }
      );
      if (response.data.success) {
        setSavedDesign(activeDesign);
        alert("Product card design saved successfully!");
      }
    } catch (error) {
      console.error("Error saving product card settings:", error);
      alert("Failed to save product card design. Please try again.");
    } finally {
      setIsSaving(false);
      setProgress(100);
    }
  };

  const hasChanges = activeDesign !== savedDesign;

  return (
    <>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <Helmet>
        <title>Card Design - Product Central</title>
      </Helmet>
      <Side
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="py-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <Link
                    to="/admin/product-central"
                    className="text-gray-500 hover:text-primary text-sm"
                  >
                    Product Central
                  </Link>
                </li>
                <li>
                  <svg
                    className="h-4 w-4 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </li>
                <li className="text-gray-700 text-sm font-medium">Card Design</li>
              </ol>
            </nav>

            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <svg
                    className="w-8 h-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Product Card Design
                  </h1>
                  <p className="text-gray-500">
                    Choose how product cards appear on your storefront
                  </p>
                </div>
              </div>
            </div>

            <ProductCentralTabs
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />

            {/* Design Options */}
            <div className="mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse"
                    >
                      <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-6"></div>
                      <div className="h-48 bg-gray-200 rounded mb-4"></div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {CARD_DESIGNS.map((design) => (
                    <div
                      key={design.id}
                      onClick={() => !design.disabled && setActiveDesign(design.id)}
                      className={`relative bg-white rounded-2xl border-2 p-6 transition-all duration-200 ${
                        design.disabled
                          ? "opacity-60 cursor-not-allowed border-gray-200"
                          : activeDesign === design.id
                          ? "border-primary shadow-lg cursor-pointer"
                          : "border-gray-200 hover:border-gray-300 cursor-pointer"
                      }`}
                    >
                      {/* Selected indicator */}
                      {activeDesign === design.id && !design.disabled && (
                        <div className="absolute top-4 right-4">
                          <div className="bg-primary text-white rounded-full p-1">
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Coming soon badge */}
                      {design.disabled && (
                        <div className="absolute top-4 right-4">
                          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full">
                            Coming Soon
                          </span>
                        </div>
                      )}

                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {design.name}
                      </h3>
                      <p className="text-gray-500 text-sm mb-4">
                        {design.description}
                      </p>

                      {/* Preview placeholder */}
                      <div className="bg-gray-50 rounded-xl p-4 mb-4 min-h-[200px] flex items-center justify-center">
                        {design.id === "classic" ? (
                          <div className="w-full max-w-[200px]">
                            <div className="bg-white rounded-lg shadow-md p-3">
                              <div className="flex justify-between mb-2">
                                <span className="bg-gray-200 text-xs px-2 py-0.5 rounded">
                                  Excellent
                                </span>
                                <span className="bg-black text-white text-xs px-2 py-0.5 rounded">
                                  15% OFF
                                </span>
                              </div>
                              <div className="text-sm font-medium mb-2 line-clamp-2">
                                Sample Product Name
                              </div>
                              <div className="bg-gray-100 h-24 rounded mb-2 flex items-center justify-center overflow-hidden">
                                <img
                                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop"
                                  alt="Sample product"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="flex justify-between items-end">
                                <div>
                                  <div className="text-xs text-gray-400 line-through">
                                    £299
                                  </div>
                                  <div className="text-lg font-bold">£254</div>
                                </div>
                                <div className="flex text-yellow-400">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <svg
                                      key={i}
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full max-w-[160px]">
                            {/* Modern Card Preview */}
                            <div className="bg-white">
                              <div className="bg-gray-100 aspect-[3/4] rounded-sm flex items-center justify-center overflow-hidden">
                                <img
                                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=300&fit=crop"
                                  alt="Sample product"
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="mt-2 space-y-0.5">
                                <p className="text-[10px] text-gray-800 uppercase tracking-wide font-normal leading-tight">
                                  SAMPLE PRODUCT NAME HERE
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  £19.99
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Features */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                          Features
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {design.features.map((feature, idx) => (
                            <span
                              key={idx}
                              className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !hasChanges}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    hasChanges && !isSaving
                      ? "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/25"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {isSaving ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
