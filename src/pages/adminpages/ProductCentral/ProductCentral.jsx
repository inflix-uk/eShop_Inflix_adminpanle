import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Side from "../nav/Side";
import Top from "../nav/Top";
import LoadingBar from "react-top-loading-bar";
import ProductCentralTabs from "./ProductCentralTabs";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../../context/Auth";
import axios from "axios";

export default function ProductCentral() {
  const auth = useAuth();
  const [selectedPage, setSelectedPage] = useState("product-central-main");
  const [selectedTab, setSelectedTab] = useState("product-central");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Stats state
  const [stats, setStats] = useState({
    categories: { total: 0, published: 0, unpublished: 0 },
    subcategories: { total: 0 },
    tags: { total: 0, published: 0, unpublished: 0 },
    conditions: { total: 0 },
    displayProducts: { total: 0, categories: 0 }
  });

  // Fetch stats
  useEffect(() => {
    setProgress(30);
    setIsLoading(true);
    axios.get(`${auth.ip}get/product-central/stats`)
      .then((response) => {
        if (response.data.status === 200) {
          const apiStats = response.data.stats || {};
          setStats(prevStats => ({
            categories: { ...prevStats.categories, ...apiStats.categories },
            subcategories: { ...prevStats.subcategories, ...apiStats.subcategories },
            tags: { ...prevStats.tags, ...apiStats.tags },
            conditions: { ...prevStats.conditions, ...apiStats.conditions },
            displayProducts: { ...prevStats.displayProducts, ...apiStats.displayProducts }
          }));
        }
        setProgress(100);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching stats:', error);
        setProgress(100);
        setIsLoading(false);
      });
  }, [auth.ip]);

  const sections = [
    {
      id: "categories",
      title: "Categories",
      description: "Manage product categories",
      path: "/admin/product-central/categories",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      count: stats.categories.total,
      subCount: { label: "Published", value: stats.categories.published },
      displayCount: { label: "Display Products", value: stats.displayProducts.total },
      bgGradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      shadowColor: "shadow-blue-200"
    },
    {
      id: "subcategories",
      title: "Subcategories",
      description: "Manage subcategories",
      path: "/admin/product-central/subcategories",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      count: stats.subcategories.total,
      subCount: null,
      bgGradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      shadowColor: "shadow-blue-200"
    },
    {
      id: "tags",
      title: "Tags",
      description: "Manage product tags",
      path: "/admin/product-central/tags",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
      count: stats.tags.total,
      subCount: { label: "Published", value: stats.tags.published },
      bgGradient: "from-blue-500 to-indigo-600",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      shadowColor: "shadow-blue-200"
    },
  ];

  return (
    <>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <Helmet>
        <title>Product Central</title>
      </Helmet>
      <Side selectedPage={selectedPage} setSelectedPage={setSelectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="py-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Product Central</h1>
                  <p className="text-gray-500">Manage your product catalog settings</p>
                </div>
              </div>
            </div>

            <ProductCentralTabs
              selectedTab={selectedTab}
              setSelectedTab={setSelectedTab}
            />

        

            {/* Section Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
              {sections.map((section) => (
                <Link
                  key={section.id}
                  to={section.path}
                  className={`group relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${section.shadowColor}`}
                >
                  {/* Gradient Header */}
                  <div className={`h-2 bg-gradient-to-r ${section.bgGradient}`}></div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${section.iconBg} ${section.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                        {section.icon}
                      </div>
                      <div className="text-right">
                        <p className={`text-4xl font-bold bg-gradient-to-r ${section.bgGradient} bg-clip-text text-transparent`}>
                          {isLoading ? (
                            <span className="inline-block w-12 h-10 bg-gray-200 rounded animate-pulse"></span>
                          ) : (
                            section.count
                          )}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Total Items</p>
                      </div>
                    </div>

                    <h3 className="text-xl font-semibold text-gray-800 mb-1 group-hover:text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">
                      {section.description}
                    </p>

                    {(section.subCount || section.displayCount) && (
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        {section.subCount && (
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${section.iconBg} ${section.iconColor}`}>
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {section.subCount.value} {section.subCount.label}
                          </span>
                        )}
                        {section.displayCount && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-600">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                            </svg>
                            {section.displayCount.value} {section.displayCount.label}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
                        Manage {section.title}
                      </span>
                      <div className={`p-2 rounded-full ${section.iconBg} ${section.iconColor} transition-all duration-300 group-hover:translate-x-1`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
