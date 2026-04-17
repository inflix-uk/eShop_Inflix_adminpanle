import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import LoadingBar from 'react-top-loading-bar';
import Side from '../nav/Side';
import Top from '../nav/Top';
import ProductTab from './ProductTab';

/**
 * Products - Parent Container Component
 *
 * This is the main container for all product-related pages.
 * It provides:
 * - Shared layout (Sidebar, Top navigation, Loading bar)
 * - Tab navigation for product sections
 * - Consistent styling and structure
 * - Outlet for nested routes
 */
export default function Products() {
  const location = useLocation();
  const [selectedPage, setSelectedPage] = useState('new-products');
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Determine which tab is active based on current route
  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/all-products')) return 'all-products';
    if (path.includes('/draft-products')) return 'draft-products';
    if (path.includes('/deleted-products')) return 'deleted-products';
    if (path.includes('/new-product')) return 'new-product';
    return 'all-products';
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const activeTab = getActiveTab();

  return (
    <>
      <Helmet>
        <title>Products Management - Admin</title>
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

      <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <main className="py-5">
          <div className="px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Products Management
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Manage your product catalog, inventory, and settings
              </p>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6">
              <ProductTab selectedTab={activeTab} />
            </div>

            {/* Content Area - Renders child routes */}
            <div className="bg-white rounded-lg shadow-sm">
              <Outlet context={{ setProgress }} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
