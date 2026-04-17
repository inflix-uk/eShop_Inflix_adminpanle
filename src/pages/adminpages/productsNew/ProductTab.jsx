import { Link, useNavigate } from "react-router-dom";
import PropTypes from 'prop-types';

/**
 * ProductTab - Tab Navigation Component for Products Section
 *
 * Provides navigation between different product management sections:
 * - Active Products: View all published products
 * - Draft Products: Manage unpublished/draft products
 * - Deleted Products: View and restore soft-deleted products
 * - Add New Product: Create new product form
 *
 * Features:
 * - Responsive design (dropdown on mobile, tabs on desktop)
 * - Active tab highlighting
 * - Icon indicators for each section
 * - Smooth transitions
 */
export default function ProductTab({ selectedTab }) {
  const navigate = useNavigate();

  const tabs = [
    {
      name: "Active Products",
      link: "/admin/new-products",
      current: selectedTab === "all-products",
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      description: "Live products",
    },
    {
      name: "Draft Products",
      link: "/admin/draft-products",
      current: selectedTab === "draft-products",
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      description: "Unpublished",
    },
    {
      name: "Deleted Products",
      link: "/admin/deleted-products",
      current: selectedTab === "deleted-products",
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      ),
      description: "Trash",
    },
    {
      name: "Add New Product",
      link: "/admin/new-product",
      current: selectedTab === "new-product",
      icon: (
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      description: "Create",
    },
  ];

  // Find the currently selected tab
  const currentTab = tabs.find((tab) => tab.current);

  const handleTabChange = (event) => {
    const selectedTab = tabs.find((tab) => tab.name === event.target.value);
    if (selectedTab) {
      navigate(selectedTab.link); // Programmatically navigate to the selected tab's link
    }
  };

  return (
    <div className="w-full">
      {/* Mobile Dropdown */}
      <div className="sm:hidden">
        <label htmlFor="tabs" className="block text-sm font-medium text-gray-700 mb-2">
          Navigate to
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
          value={currentTab ? currentTab.name : tabs[0].name}
          onChange={handleTabChange}
        >
          {tabs.map((tab) => (
            <option key={tab.name} value={tab.name}>
              {tab.name}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop Tabs - Modern Card Style */}
      <div className="hidden sm:block">
        <nav className="flex space-x-2 bg-gray-100 p-1 rounded-xl" aria-label="Tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.name}
              to={tab.link}
              className={`
                group relative flex-1 inline-flex flex-col items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ease-in-out
                ${
                  tab.current
                    ? "bg-white text-blue-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }
              `}
              aria-current={tab.current ? "page" : undefined}
            >
              {/* Active Indicator */}
              {tab.current && (
                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-b-lg" />
              )}

              {/* Icon and Text Container */}
              <div className="flex items-center space-x-2">
                <span
                  className={`
                    transition-all duration-300
                    ${tab.current ? 'text-blue-600 scale-110' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-105'}
                  `}
                >
                  {tab.icon}
                </span>
                <div className="text-left">
                  <span className={`block font-semibold ${tab.current ? 'text-blue-700' : 'text-gray-700'}`}>
                    {tab.name}
                  </span>
                  <span className={`block text-xs ${tab.current ? 'text-blue-500' : 'text-gray-500'}`}>
                    {tab.description}
                  </span>
                </div>
              </div>

              {/* Hover Effect */}
              {!tab.current && (
                <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-gray-100 to-gray-50 -z-10" />
              )}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

ProductTab.propTypes = {
  selectedTab: PropTypes.string.isRequired,
};
