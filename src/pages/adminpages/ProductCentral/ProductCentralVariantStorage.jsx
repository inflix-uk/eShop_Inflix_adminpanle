import { useState } from "react";
import { Link } from "react-router-dom";
import Side from "../nav/Side";
import Top from "../nav/Top";
import LoadingBar from "react-top-loading-bar";
import ProductStorage from "../../../components/ProductCentralComponents/ProductStorage";
import { Helmet } from "react-helmet-async";

export default function ProductCentralVariantStorage() {
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
        <title>Variant Storage - Product Central</title>
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                    </svg>
                    Product Variants
                  </Link>
                </li>
                <li>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="ml-1 text-sm font-medium text-blue-600 md:ml-2">Variant Storage</span>
                  </div>
                </li>
              </ol>
            </nav>

            {/* Header */}
            <div className="mb-6 flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Variant Storage</h1>
                <p className="mt-1 text-sm text-gray-500">Manage product storage options</p>
              </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <ProductStorage />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
