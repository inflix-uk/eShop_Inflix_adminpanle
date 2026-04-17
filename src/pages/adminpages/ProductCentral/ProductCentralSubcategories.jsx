import { useState } from "react";
import { Link } from "react-router-dom";
import Side from "../nav/Side";
import Top from "../nav/Top";
import LoadingBar from "react-top-loading-bar";
import ProductSubCategory from "../../../components/ProductCentralComponents/ProductSubCategory";
import { Helmet } from "react-helmet-async";

export default function ProductCentralSubcategories() {
  const [selectedPage, setSelectedPage] = useState("product-central-main");
  const [progress, setProgress] = useState(0);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <Helmet>
        <title>Subcategories - Product Central</title>
      </Helmet>
      <Side selectedPage={selectedPage} setSelectedPage={setSelectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="py-6 bg-gray-50/50 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            {/* Breadcrumb */}
            <nav className="flex mb-4" aria-label="Breadcrumb">
              <ol className="inline-flex items-center space-x-1 md:space-x-3">
                <li className="inline-flex items-center">
                  <Link to="/admin/product-central" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Product Central
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-blue-600 md:ml-2">Subcategories</span>
                  </div>
                </li>
              </ol>
            </nav>

            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Subcategories</h1>
                <p className="mt-1 text-sm text-gray-500">Manage product subcategories</p>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <ProductSubCategory />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
