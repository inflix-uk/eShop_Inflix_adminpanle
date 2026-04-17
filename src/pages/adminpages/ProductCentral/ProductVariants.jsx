import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import LoadingBar from "react-top-loading-bar";
import Side from "../nav/Side";
import Top from "../nav/Top";
import ProductCentralTabs from "./ProductCentralTabs";
import { Helmet } from "react-helmet-async";
import { useAuth } from "../../../context/Auth";
import axios from "axios";

export default function ProductVariants() {
  const auth = useAuth();
  const [selectedPage, setSelectedPage] = useState("product-central-main");
  const [selectedTab, setSelectedTab] = useState("product-variants");
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const [stats, setStats] = useState({
    variantCondition: { total: 0 },
    variantStorage: { total: 0 },
    variantColor: { total: 0 }
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  // Fetch stats
  useEffect(() => {
    setProgress(30);
    setIsLoading(true);
    axios.get(`${auth.ip}get/product-variant/stats`)
      .then((response) => {
        if (response.data.status === 200) {
          setStats(response.data.stats);
        }
        setProgress(100);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching variant stats:', error);
        setProgress(100);
        setIsLoading(false);
      });
  }, [auth.ip]);

  const sections = [
    {
      id: "variant-condition",
      title: "Variant Condition",
      description: "Manage product variant conditions",
      path: "/admin/product-central/variant-condition",
      count: stats.variantCondition.total,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "variant-storage",
      title: "Variant Storage",
      description: "Manage product storage options",
      path: "/admin/product-central/variant-storage",
      count: stats.variantStorage.total,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
        </svg>
      ),
    },
    {
      id: "variant-color",
      title: "Variant Color",
      description: "Manage product color variants",
      path: "/admin/product-central/variant-color",
      count: stats.variantColor.total,
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>Product Variants</title>
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
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="py-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Product Variants</h1>
                  <p className="text-gray-500">Manage your product variant settings</p>
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
                  className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shadow-blue-200"
                >
                  {/* Gradient Header */}
                  <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-blue-100 text-blue-600 transition-transform duration-300 group-hover:scale-110">
                        {section.icon}
                      </div>
                      <div className="text-right">
                        <p className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
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

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-sm font-medium text-gray-600 group-hover:text-gray-800">
                        Manage {section.title}
                      </span>
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600 transition-all duration-300 group-hover:translate-x-1">
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
