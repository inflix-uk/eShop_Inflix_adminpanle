import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../../../context/Auth";
import PropTypes from "prop-types";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
/**
 * A single link item in the sidebar.
 */
function SidebarLink({ to, icon, label, isActive, badge }) {
  return (
    <Link
      to={to}
      className={`${
        isActive
          ? "bg-gray-50 text-primary"
          : "text-gray-700 hover:text-primary hover:bg-gray-50"
      } group flex items-center w-full gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold`}
    >
      {/* Icon */}
      <span
        className={`h-5 w-5 shrink-0 my-auto ${
          isActive ? "text-primary" : "text-gray-400 group-hover:text-primary"
        }`}
      >
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {/* Badge for unread count */}
      {badge > 0 && (
        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
          {badge}
        </span>
      )}
    </Link>
  );
}

SidebarLink.propTypes = {
  to: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool.isRequired,
  badge: PropTypes.number,
};

/**
 * A section in the sidebar, which can expand/collapse.
 */
function SidebarSection({
  sectionTitle,
  icon,
  isOpen,
  onToggle,
  children, // typically the mapped <SidebarLink /> items
}) {
  return (
    <div className="relative">
      {/* Section Title / Toggle Button */}
      <button
        onClick={onToggle}
        className={`group flex items-center w-full p-2 text-sm font-semibold justify-between
          text-gray-700 hover:text-primary hover:bg-gray-50 rounded-md
        `}
      >
        <div className="flex gap-x-3">
          <span
            className={`h-5 w-5 shrink-0 my-auto text-gray-400 group-hover:text-primary`}
          >
            {icon}
          </span>
          {sectionTitle}
        </div>
        {/* Dropdown arrow rotation */}
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Collapsible Section Content */}
      {isOpen && <div className="pl-2 mt-2 space-y-2">{children}</div>}
    </div>
  );
}

SidebarSection.propTypes = {
  sectionTitle: PropTypes.string.isRequired,
  icon: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default function Side({
  selectedPage = "dashboard",
  isSidebarOpen,
  toggleSidebar = () => {},
  closeSidebar,
}) {
  const [isOpenOrders, setIsOpenOrders] = useState(false);
  const [isOpenProducts, setIsOpenProducts] = useState(false);
  const [isOpenContent, setIsOpenContent] = useState(false);
  const [isOpenRoles, setIsOpenRoles] = useState(false);
  const [isOpenHomePage, setIsOpenHomePage] = useState(false);
  const [isOpenSettings, setIsOpenSettings] = useState(false);
  const [isOpenCrm, setIsOpenCrm] = useState(false);
  const [isOpenAnalytics, setIsOpenAnalytics] = useState(false);

  const toggleSection = useCallback((setter, isCurrentlyOpen) => {
    setIsOpenOrders(false);
    setIsOpenProducts(false);
    setIsOpenContent(false);
    setIsOpenRoles(false);
    setIsOpenHomePage(false);
    setIsOpenSettings(false);
    setIsOpenCrm(false);
    setIsOpenAnalytics(false);
    if (!isCurrentlyOpen) setter(true);
  }, []);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [disabledAdminRoutes, setDisabledAdminRoutes] = useState([]);

  const auth = useAuth();
  const permissions = auth?.user?.permissions;
  console.log("permissions", permissions);
  /**
   * Helper function to check if a permission is satisfied.
   * Each sidebar item can define a function like:
   *    permissionCheck: (p) => p.store?.view_dashboard
   */
  const hasPermission = useCallback(
    (permissionCheck) => {
      if (typeof permissionCheck === "function") {
        return permissionCheck(permissions);
      }
      // If no permissionCheck function is provided, assume it's publicly visible
      return true;
    },
    [permissions]
  );

  const normalizeRoutePath = useCallback(
    (routePath) => String(routePath || "").trim().replace(/^\/+|\/+$/g, "").toLowerCase(),
    []
  );

  const isAdminRouteDisabled = useCallback(
    (routePath) => {
      const normalized = normalizeRoutePath(routePath);
      return disabledAdminRoutes.includes(normalized);
    },
    [disabledAdminRoutes, normalizeRoutePath]
  );

  // Fetch unread messages count
  const fetchUnreadCount = useCallback(async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}get/total/messages/count`
      );
      if (response.data.success) {
        setUnreadMessagesCount(response.data.unreadMessagesCount || 0);
      }
    } catch (error) {
      console.error("Error fetching unread messages count:", error);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    // Set up interval to refresh the count every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    // Listen for custom event to refresh count immediately (e.g., when read/unread is toggled)
    const handleRefreshUnreadCount = () => {
      fetchUnreadCount();
    };
    window.addEventListener(
      "sidebar-refresh-unread-count",
      handleRefreshUnreadCount
    );

    return () => {
      clearInterval(interval);
      window.removeEventListener(
        "sidebar-refresh-unread-count",
        handleRefreshUnreadCount
      );
    };
  }, [fetchUnreadCount]);

  useEffect(() => {
    let mounted = true;
    const fetchAdminControls = async () => {
      try {
        const response = await axios.get(
          `${BACKEND_URL}superadmin/controls/public`
        );
        const disabled = Array.isArray(response?.data?.data?.disabledAdminRoutes)
          ? response.data.data.disabledAdminRoutes
              .map((item) => normalizeRoutePath(item))
              .filter(Boolean)
          : [];
        if (mounted) {
          setDisabledAdminRoutes([...new Set(disabled)]);
        }
      } catch (error) {
        if (mounted) {
          setDisabledAdminRoutes([]);
        }
      }
    };

    fetchAdminControls();
    return () => {
      mounted = false;
    };
  }, [normalizeRoutePath]);

  const footerPagesList = [
    "footer-pages",
    "footer-pages-create",
    "footer-pages-edit",
    "footer-pages-preview",
  ];

  const navbarHubPages = [
    "storefront-navbar",
    "storefront-nav-links",
    "storefront-navbar-order",
  ];

  useEffect(() => {
    const ordersPages = ["orders", "return-orders", "coupons", "deals"];

    const productsPages = [
      "products",
      "new-products",
      "draft-products",
      "deleted-products",
      "new-product",
      "product-central-main",
    ];

    const contentPages = [
      "blogs",
      "media",
      "reviews",
      "author",
      "pages-categories",
      "storefront-navbar",
      ...footerPagesList,
    ];

    const rolesPages = [
      "manage-roles",
      "permissions",
      "users",
      "subscribers",
      "pricing-groups",
    ];

    const homePageList = [
      "banners",
      "homepage-features",
      "category-cards",
      "homepage-data-settings",
      "promotional-sections",
    ];

    const settingsPages = [
      "stripe-settings",
      "booking-management",
      "shipping-settings",
      "trustpilot-settings",
      "scripts-settings",
      "email-template-settings",
      "smtp-settings",
      "site-wide-schema-settings",
      "robots-settings",
      "widgets-settings",
      "announcement-banner-settings",
      "deals-modal-settings",
      "footer-settings",
      "google-search-console",
      "logo",
      "site-wide-color",
    ];

    // Close all sections first
    const crmPages = ["crm-customers"];
    const analyticsPages = [
      "analytics-overview",
      "ad-performance-report",
      "campaign-analytics",
    ];

    const closeAll = () => {
      setIsOpenOrders(false);
      setIsOpenProducts(false);
      setIsOpenContent(false);
      setIsOpenRoles(false);
      setIsOpenHomePage(false);
      setIsOpenSettings(false);
      setIsOpenCrm(false);
      setIsOpenAnalytics(false);
    };

    closeAll();

    if (ordersPages.includes(selectedPage)) {
      setIsOpenOrders(true);
    } else if (crmPages.includes(selectedPage)) {
      setIsOpenCrm(true);
    } else if (analyticsPages.includes(selectedPage)) {
      setIsOpenAnalytics(true);
    } else if (productsPages.includes(selectedPage)) {
      setIsOpenProducts(true);
    } else if (contentPages.includes(selectedPage)) {
      setIsOpenContent(true);
    } else if (rolesPages.includes(selectedPage)) {
      setIsOpenRoles(true);
    } else if (homePageList.includes(selectedPage)) {
      setIsOpenHomePage(true);
    } else if (settingsPages.includes(selectedPage)) {
      setIsOpenSettings(true);
    }
    // Dashboard, Messages, Visitor Messages, Profile are standalone links
  }, [selectedPage]);

  /**
   * Sidebar data structure organized by function.
   */
  const sideBarData = [
    // Orders & Sales Section
    {
      sectionTitle: "Orders & Sales",
      state: isOpenOrders,
      toggle: () => toggleSection(setIsOpenOrders, isOpenOrders),
      icon: (
        <svg
          className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-primary my-auto"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path
            d="M17 18C17.5304 18 18.0391 18.2107 18.4142 18.5858C18.7893 18.9609 19 19.4696 19 20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22C16.4696 22 15.9609 21.7893 15.5858 21.4142C15.2107 21.0391 15 20.5304 15 20C15 18.89 15.89 18 17 18ZM1 2H4.27L5.21 4H20C20.2652 4 20.5196 4.10536 20.7071 4.29289C20.8946 4.48043 21 4.73478 21 5C21 5.17 20.95 5.34 20.88 5.5L17.3 11.97C16.96 12.58 16.3 13 15.55 13H8.1L7.2 14.63L7.17 14.75C7.17 14.8163 7.19634 14.8799 7.24322 14.9268C7.29011 14.9737 7.3537 15 7.42 15H19V17H7C6.46957 17 5.96086 16.7893 5.58579 16.4142C5.21071 16.0391 5 15.5304 5 15C5 14.65 5.09 14.32 5.24 14.04L6.6 11.59L3 4H1V2ZM7 18C7.53043 18 8.03914 18.2107 8.41421 18.5858C8.78929 18.9609 9 19.4696 9 20C9 20.5304 8.78929 21.0391 8.41421 21.4142C8.03914 21.7893 7.53043 22 7 22C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20C5 18.89 5.89 18 7 18ZM16 11L18.78 6H6.14L8.5 11H16Z"
            fill="currentColor"
          />
        </svg>
      ),
      links: [
        {
          label: "Orders",
          to: "/admin/orders",
          selectedKey: "orders",
          permissionCheck: (p) => p?.store?.view_orders,
          icon: (
            <svg
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "orders"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path
                d="M17 18C17.5304 18 18.0391 18.2107 18.4142 18.5858C18.7893 18.9609 19 19.4696 19 20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22C16.4696 22 15.9609 21.7893 15.5858 21.4142C15.2107 21.0391 15 20.5304 15 20C15 18.89 15.89 18 17 18ZM1 2H4.27L5.21 4H20C20.2652 4 20.5196 4.10536 20.7071 4.29289C20.8946 4.48043 21 4.73478 21 5C21 5.17 20.95 5.34 20.88 5.5L17.3 11.97C16.96 12.58 16.3 13 15.55 13H8.1L7.2 14.63L7.17 14.75C7.17 14.8163 7.19634 14.8799 7.24322 14.9268C7.29011 14.9737 7.3537 15 7.42 15H19V17H7C6.46957 17 5.96086 16.7893 5.58579 16.4142C5.21071 16.0391 5 15.5304 5 15C5 14.65 5.09 14.32 5.24 14.04L6.6 11.59L3 4H1V2ZM7 18C7.53043 18 8.03914 18.2107 8.41421 18.5858C8.78929 18.9609 9 19.4696 9 20C9 20.5304 8.78929 21.0391 8.41421 21.4142C8.03914 21.7893 7.53043 22 7 22C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20C5 18.89 5.89 18 7 18ZM16 11L18.78 6H6.14L8.5 11H16Z"
                fill="currentColor"
              />
            </svg>
          ),
        },
        {
          label: "Returns",
          to: "/admin/return-orders",
          selectedKey: "return-orders",
          permissionCheck: (p) => p?.store?.view_returns,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "return-orders"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
              />
            </svg>
          ),
        },
        {
          label: "Coupons",
          to: "/admin/coupons",
          selectedKey: "coupons",
          permissionCheck: (p) => p?.store?.view_coupons,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "coupons"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.25 2.25 0 0 1 0 4.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.25 2.25 0 0 1 0-4.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
              />
            </svg>
          ),
        },
        {
          label: "Deals & Discounts",
          to: "/admin/deals",
          selectedKey: "deals",
          permissionCheck: (p) => p?.store?.view_deals,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "deals"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6h.008v.008H6V6Z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      sectionTitle: "CRM",
      state: isOpenCrm,
      toggle: () => toggleSection(setIsOpenCrm, isOpenCrm),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-primary my-auto"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
          />
        </svg>
      ),
      links: [
        {
          label: "Customers",
          to: "/admin/crm/customers",
          selectedKey: "crm-customers",
          permissionCheck: (p) => p?.zextons?.view_users,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "crm-customers"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      sectionTitle: "Analytics Dashboard",
      state: isOpenAnalytics,
      toggle: () => toggleSection(setIsOpenAnalytics, isOpenAnalytics),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-primary my-auto"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
          />
        </svg>
      ),
      links: [
        {
          label: "Overview",
          to: "/admin/analytics/overview",
          selectedKey: "analytics-overview",
          permissionCheck: (p) => p?.store?.view_dashboard,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "analytics-overview"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
              />
            </svg>
          ),
        },
        {
          label: "Ad performance report",
          to: "/admin/analytics/ad-performance",
          selectedKey: "ad-performance-report",
          permissionCheck: (p) => p?.store?.view_dashboard,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "ad-performance-report"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
              />
            </svg>
          ),
        },
        {
          label: "Campaign analytics",
          to: "/admin/analytics/campaign-analytics",
          selectedKey: "campaign-analytics",
          permissionCheck: (p) => p?.store?.view_dashboard,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "campaign-analytics"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
          ),
        },
      ],
    },
    // Products Section
    {
      sectionTitle: "Products",
      state: isOpenProducts,
      toggle: () => toggleSection(setIsOpenProducts, isOpenProducts),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-primary my-auto"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
          />
        </svg>
      ),
      links: [
        {
          label: "All Products",
          to: "/admin/new-products",
          selectedKey: "new-products",
          permissionCheck: (p) => p?.store?.view_products,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "new-products"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
          ),
        },
        {
          label: "Product Central",
          to: "/admin/product-central",
          selectedKey: "product-central-main",
          permissionCheck: (p) => p?.store?.view_product_central,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "product-central-main"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
              />
            </svg>
          ),
        },
        {
          label: "Export Products",
          to: "/admin/all-products",
          selectedKey: "products",
          permissionCheck: (p) => p?.store?.view_products,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "products"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
              />
            </svg>
          ),
        },
      ],
    },
    // Content Section
    {
      sectionTitle: "Content",
      state: isOpenContent,
      toggle: () => toggleSection(setIsOpenContent, isOpenContent),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5 shrink-0 text-gray-400 group-hover:text-primary my-auto"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      ),
      links: [
        {
          label: "Blogs",
          to: "/admin/all-blogs",
          selectedKey: "blogs",
          permissionCheck: (p) => p?.store?.view_blogs,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "blogs"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          ),
        },
        {
          label: "Media Library",
          to: "/admin/media",
          selectedKey: "media",
          permissionCheck: (p) => p?.store?.view_media,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "media"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
              />
            </svg>
          ),
        },
        {
          label: "Reviews",
          to: "/admin/reviews",
          selectedKey: "reviews",
          permissionCheck: (p) => p?.store?.view_reviews,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "reviews"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
              />
            </svg>
          ),
        },
        {
          label: "Author",
          to: "/admin/author",
          selectedKey: "author",
          permissionCheck: (p) => p?.store?.view_blogs,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "author"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
              />
            </svg>
          ),
        },
        {
          label: "Pages",
          to: "/admin/footer-pages",
          selectedKey: "footer-pages",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                footerPagesList.includes(selectedPage)
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
              />
            </svg>
          ),
        },
        /* Pages categories — hidden from sidebar
        {
          label: "Pages categories",
          to: "/admin/pages-categories",
          selectedKey: "pages-categories",
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "pages-categories"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"
              />
            </svg>
          ),
        },
        */
        {
          label: "Navbar",
          to: "/admin/product-central/navbar",
          selectedKey: "storefront-navbar",
          permissionCheck: (p) => p?.store?.view_product_central,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                navbarHubPages.includes(selectedPage)
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
              />
            </svg>
          ),
        },
      ],
    },
    {
      sectionTitle: "Users and Permissions",
      state: isOpenRoles,
      toggle: () => toggleSection(setIsOpenRoles, isOpenRoles),

      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`h-5 w-5 shrink-0 ${
            selectedPage === "roles"
              ? "text-primary"
              : "text-gray-400 group-hover:text-primary"
          } my-auto`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
          />
        </svg>
      ),
      links: [
        {
          label: "Manage Roles",
          to: "/admin/roles",
          selectedKey: "manage-roles",
          permissionCheck: (p) => p?.rolesandPermissions?.view_roles,
          // No specific permission check in your sample for roles,
          // but you can add: permissionCheck: (p) => p?.store?.manage_roles
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "manage-roles"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
              />
            </svg>
          ),
        },
        {
          label: "Permissions",
          to: "/admin/permissions",
          selectedKey: "permissions",
          permissionCheck: (p) => p?.rolesandPermissions?.view_permissions,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "permissions"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          ),
        },
        {
          label: "Users ",
          to: "/admin/users",
          selectedKey: "users",
          permissionCheck: (p) => p?.store?.view_users,
          icon: (
            <svg
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "users"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
              width="15"
              height="16"
              viewBox="0 0 15 16"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 7C6.83696 7 6.20107 6.73661 5.73223 6.26777C5.26339 5.79893 5 5.16304 5 4.5C5 3.83696 5.26339 3.20107 5.73223 2.73223C6.20107 2.26339 6.83696 2 7.5 2C8.16304 2 8.79893 2.26339 9.26777 2.73223C9.73661 3.20107 10 3.83696 10 4.5C10 5.16304 9.73661 5.79893 9.26777 6.26777C8.79893 6.73661 8.16304 7 7.5 7ZM7.5 3C6.67 3 6 3.67 6 4.5C6 5.33 6.67 6 7.5 6C8.33 6 9 5.33 9 4.5C9 3.67 8.33 3 7.5 3Z"
                fill="currentColor"
              />
              <path
                d="M13.5 11C13.22 11 13 10.78 13 10.5C13 10.22 13.22 10 13.5 10C13.78 10 14 9.78 14 9.5C14 8.83696 13.7366 8.20107 13.2678 7.73223C12.7989 7.26339 12.163 7 11.5 7H10.5C10.22 7 10 6.78 10 6.5C10 6.22 10.22 6 10.5 6C11.33 6 12 5.33 12 4.5C12 3.67 11.33 3 10.5 3C10.22 3 10 2.78 10 2.5C10 2.22 10.22 2 10.5 2C11.163 2 11.7989 2.26339 12.2678 2.73223C12.7366 3.20107 13 3.83696 13 4.5C13 5.12 12.78 5.68 12.4 6.12C13.89 6.52 15 7.88 15 9.5C15 10.33 14.33 11 13.5 11ZM1.5 11C0.67 11 0 10.33 0 9.5C0 7.88 1.1 6.52 2.6 6.12C2.23 5.68 2 5.12 2 4.5C2 3.83696 2.26339 3.20107 2.73223 2.73223C3.20107 2.26339 3.83696 2 4.5 2C4.78 2 5 2.22 5 2.5C5 2.78 4.78 3 4.5 3C3.67 3 3 3.67 3 4.5C3 5.33 3.67 6 4.5 6C4.78 6 5 6.22 5 6.5C5 6.78 4.78 7 4.5 7H3.5C2.83696 7 2.20107 7.26339 1.73223 7.73223C1.26339 8.20107 1 8.83696 1 9.5C1 9.78 1.22 10 1.5 10C1.78 10 2 10.22 2 10.5C2 10.78 1.78 11 1.5 11ZM10.5 14H4.5C3.67 14 3 13.33 3 12.5V11.5C3 9.57 4.57 8 6.5 8H8.5C10.43 8 12 9.57 12 11.5V12.5C12 13.33 11.33 14 10.5 14ZM6.5 9C5.83696 9 5.20107 9.26339 4.73223 9.73223C4.26339 10.2011 4 10.837 4 11.5V12.5C4 12.78 4.22 13 4.5 13H10.5C10.78 13 11 12.78 11 12.5V11.5C11 10.837 10.7366 10.2011 10.2678 9.73223C9.79893 9.26339 9.16304 9 8.5 9H6.5Z"
                fill="currentColor"
              />
            </svg>
          ),
        },
        {
          label: "Subscribers",
          to: "/admin/subscribers",
          selectedKey: "subscribers",
          permissionCheck: (p) => p?.store?.view_subscribers,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "subscribers"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
              />
            </svg>
          ),
        },
        {
          label: "Pricing Groups",
          to: "/admin/pricing-groups",
          selectedKey: "pricing-groups",
          permissionCheck: (p) => p?.store?.view_users,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "pricing-groups"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 7.5h18M3 12h18M3 16.5h18M6 6v12m6-12v12m6-12v12"
              />
            </svg>
          ),
        },
      ],
    },
    {
      sectionTitle: "Home Page",
      state: isOpenHomePage,
      toggle: () => toggleSection(setIsOpenHomePage, isOpenHomePage),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`h-5 w-5 shrink-0 ${
            selectedPage === "banners" || selectedPage === "homepage-features" || selectedPage === "category-cards" || selectedPage === "homepage-data-settings" || selectedPage === "promotional-sections"
              ? "text-primary"
              : "text-gray-400 group-hover:text-primary"
          } my-auto`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      ),
      links: [
        {
          label: "Banners",
          to: "/admin/banners",
          selectedKey: "banners",
          permissionCheck: (p) => p?.store?.view_banners || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "banners"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5z"
              />
            </svg>
          ),
        },
        {
          label: "Homepage Features",
          to: "/admin/homepage-features",
          selectedKey: "homepage-features",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "homepage-features"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              />
            </svg>
          ),
        },
        /* Category Cards — hidden from sidebar; routes still work if needed
        {
          label: "Category Cards",
          to: "/admin/category-cards",
          selectedKey: "category-cards",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "category-cards"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              />
            </svg>
          ),
        },
        */
        {
          label: "Homepage",
          to: "/admin/settings/homepage-data",
          selectedKey: "homepage-data-settings",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "homepage-data-settings"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
              />
            </svg>
          ),
        },
        /* Promotional Sections — hidden from sidebar; routes still work if needed
        {
          label: "Promotional Sections",
          to: "/admin/promotional-sections",
          selectedKey: "promotional-sections",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "promotional-sections"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
              />
            </svg>
          ),
        },
        */
      ],
    },
    {
      sectionTitle: "Settings",
      state: isOpenSettings,
      toggle: () => toggleSection(setIsOpenSettings, isOpenSettings),
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`h-5 w-5 shrink-0 ${
            selectedPage === "stripe-settings" || selectedPage === "shipping-settings" || selectedPage === "trustpilot-settings" || selectedPage === "scripts-settings" || selectedPage === "email-template-settings" || selectedPage === "smtp-settings" || selectedPage === "site-wide-schema-settings" || selectedPage === "robots-settings" || selectedPage === "widgets-settings" || selectedPage === "announcement-banner-settings" || selectedPage === "deals-modal-settings" || selectedPage === "footer-settings" || selectedPage === "logo" || selectedPage === "site-wide-color"
              ? "text-primary"
              : "text-gray-400 group-hover:text-primary"
          } my-auto`}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      links: [
        {
          label: "Stripe",
          to: "/admin/settings/stripe",
          selectedKey: "stripe-settings",
          permissionCheck: (p) => p?.store?.view_blogs || true, // Using generic admin permission
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "stripe-settings"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
              />
            </svg>
          ),
        },
        {
          label: "Booking",
          to: "/admin/settings/booking",
          selectedKey: "booking-management",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "booking-management"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z"
              />
            </svg>
          ),
        },
        {
          label: "Shipping",
          to: "/admin/settings/shipping",
          selectedKey: "shipping-settings",
          permissionCheck: (p) => p?.store?.view_blogs || true, // Using generic admin permission
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "shipping-settings"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
              />
            </svg>
          ),
        },
        {
          label: "Trustpilot",
          to: "/admin/settings/trustpilot",
          selectedKey: "trustpilot-settings",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "trustpilot-settings"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
              />
            </svg>
          ),
        },
        {
          label: "Scripts",
          to: "/admin/settings/scripts",
          selectedKey: "scripts-settings",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "scripts-settings"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
              />
            </svg>
          ),
        },
        {
          label: "Site-wide Schema",
          to: "/admin/settings/site-wide-schema",
          selectedKey: "site-wide-schema-settings",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "site-wide-schema-settings"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6h.008v.008H6V6z"
              />
            </svg>
          ),
        },
        {
          label: "Robots.txt",
          to: "/admin/settings/robots",
          selectedKey: "robots-settings",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "robots-settings"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 14.25v-8.625a2.625 2.625 0 0 0-2.625-2.625H7.125A2.625 2.625 0 0 0 4.5 5.625v12.75A2.625 2.625 0 0 0 7.125 21h9.75a2.625 2.625 0 0 0 2.625-2.625V14.25M8.25 7.5h7.5M8.25 11.25h7.5M8.25 15h4.5"
              />
            </svg>
          ),
        },
        {
          label: "Widgets",
          to: "/admin/settings/widgets",
          selectedKey: "widgets-settings",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "widgets-settings"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 12m4.179 2.25L12 17.25l5.571-3m0 0L21.75 12l-4.179-2.25m0 4.5L21.75 12m0 0h.008v.008H21.75V12zm0 0h.008v.008h-.008V12zm-6 0h.008v.008h-.008V12z"
              />
            </svg>
          ),
        },
        {
          label: "Announcement Banner",
          to: "/admin/settings/announcement-banner",
          selectedKey: "announcement-banner-settings",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "announcement-banner-settings"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.34 3.94c.08-.04.16-.09.25-.12.18-.08.37-.12.57-.12h2.68c.2 0 .39.04.57.12.09.03.17.08.25.12L21 9.5V19a2 2 0 01-2 2H5a2 2 0 01-2-2V9.5l6.34-5.56zM7.5 10.5v8h9v-8h-9z"
              />
            </svg>
          ),
        },
        {
          label: "Deals Modal",
          to: "/admin/settings/deals-modal",
          selectedKey: "deals-modal-settings",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "deals-modal-settings"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 6h.008v.008H6V6z"
              />
            </svg>
          ),
        },
        {
          label: "Email templates",
          to: "/admin/settings/email-templates",
          selectedKey: "email-template-settings",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "email-template-settings"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          ),
        },
        {
          label: "SMTP",
          to: "/admin/settings/smtp",
          selectedKey: "smtp-settings",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "smtp-settings"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          ),
        },
        {
          label: "Footer Settings",
          to: "/admin/footer-settings",
          selectedKey: "footer-settings",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "footer-settings"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          ),
        },
        /* Hidden: Google Search Console (was under Settings near Footer Settings). Restore by uncommenting.
        {
          label: "Google Search Console",
          to: "/admin/google-search-console",
          selectedKey: "google-search-console",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "google-search-console"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          ),
        },
        */
        {
          label: "Logo",
          to: "/admin/logo",
          selectedKey: "logo",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "logo"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          ),
        },
        {
          label: "Site-wide color",
          to: "/admin/site-wide-color",
          selectedKey: "site-wide-color",
          permissionCheck: (p) => p?.store?.view_blogs || true,
          icon: (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className={`h-5 w-5 shrink-0 ${
                selectedPage === "site-wide-color"
                  ? "text-primary"
                  : "text-gray-400 group-hover:text-primary"
              } my-auto`}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 4.125v13.125A3.75 3.75 0 0117.25 21H6.75z"
              />
            </svg>
          ),
        },
      ],
    },
  ];

  /**
   * Renders a collapsible group (section) and its links, filtering by permission checks.
   */
  const renderSidebarSections = () => {
    return sideBarData.map((section) => {
      // Filter links that the user has permission to access
      const accessibleLinks = section.links.filter(
        (link) =>
          hasPermission(link.permissionCheck) && !isAdminRouteDisabled(link.to)
      );

      // If no links are accessible, don't render the section at all
      if (accessibleLinks.length === 0) {
        return null;
      }

      return (
        <li key={section.sectionTitle}>
          <SidebarSection
            sectionTitle={section.sectionTitle}
            icon={section.icon}
            isOpen={section.state}
            onToggle={section.toggle}
          >
            {accessibleLinks.map((link) => {
              // Special handling for "New Products" - highlight for all product tab pages
              const productTabPages = [
                "new-products",
                "draft-products",
                "deleted-products",
                "new-product",
              ];
              const isActive =
                link.selectedKey === "new-products"
                  ? productTabPages.includes(selectedPage)
                  : link.selectedKey === "footer-pages"
                    ? footerPagesList.includes(selectedPage)
                    : link.selectedKey === "storefront-navbar"
                      ? navbarHubPages.includes(selectedPage)
                      : selectedPage === link.selectedKey;

              return (
                <SidebarLink
                  key={link.label}
                  to={link.to}
                  icon={link.icon}
                  label={link.label}
                  isActive={isActive}
                  badge={
                    link.selectedKey === "orders-messages"
                      ? unreadMessagesCount
                      : undefined
                  }
                />
              );
            })}
          </SidebarSection>
        </li>
      );
    });
  };

  /**
   * Mobile sidebar (overlay)
   */
  const mobileSidebar = (
    <div className="fixed inset-0 flex z-50 lg:hidden">
      {/* Background overlay */}
      <div
        className="fixed inset-0 bg-black opacity-50 z-50"
        onClick={toggleSidebar}
      ></div>

      {/* The sidebar drawer */}
      <div className="relative flex flex-col max-w-xs w-full bg-white z-50">
        <div className="flex-shrink-0 flex items-center justify-between px-4 py-2">
          <Link
            to="/admin/landing"
            className="flex items-center"
          >
            <img className="h-14 w-auto" src="/inflix_logo.png" alt="Logo" />
          </Link>
          <XMarkIcon onClick={closeSidebar} className="w-8 h-8 text-gray-700" />
        </div>

        <div className="mt-5 flex-1 h-0 overflow-y-auto">
          <nav className="px-2 space-y-1">
            <ul role="list" className="flex flex-1 flex-col -mx-2 space-y-1">
              {/* Dashboard - Top standalone link */}
              <li>
                <SidebarLink
                  to="/admin/dashboard"
                  icon={
                    <svg
                      className="h-5 w-5"
                      width="22"
                      height="25"
                      viewBox="0 0 22 25"
                      fill="currentColor"
                    >
                      <path
                        d="M1.52014 22.6919H7.13251V13.7459H14.1495V22.6919H19.7618V9.01062L10.641 2.11221L1.52014 9.01062V22.6919ZM0 24.212V8.25055L10.641 0.212036L21.282 8.25055V24.212H12.6293V15.266H8.65265V24.212H0Z"
                        fill="currentColor"
                      />
                    </svg>
                  }
                  label="Dashboard"
                  isActive={selectedPage === "dashboard"}
                />
              </li>
              {/* Messages Link */}
              <li>
                <SidebarLink
                  to="/admin/order-messages"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                      />
                    </svg>
                  }
                  label="Messages"
                  isActive={selectedPage === "order-messages"}
                  badge={unreadMessagesCount}
                />
              </li>
              {/* Visitor Messages Link */}
              <li>
                <SidebarLink
                  to="/admin/visitor-messages"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                      />
                    </svg>
                  }
                  label="Visitor Messages"
                  isActive={selectedPage === "visitor-messages"}
                />
              </li>
              {/* Collapsible Sections */}
              {renderSidebarSections()}
              {/* Profile - Bottom standalone link */}
              <li className="mt-auto pt-4 border-t border-gray-200">
                <SidebarLink
                  to="/admin/profile"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                      />
                    </svg>
                  }
                  label="Profile"
                  isActive={selectedPage === "profile"}
                />
              </li>
              {/* Logs - standalone link */}
              <li>
                <SidebarLink
                  to="/admin/logs"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="h-5 w-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"
                      />
                    </svg>
                  }
                  label="Logs"
                  isActive={selectedPage === "logs"}
                />
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  );

  /**
   * Desktop sidebar (always shown on large screens)
   */
  const desktopSidebar = (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-30 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Link
            to="/admin/landing"
            className="flex items-center"
          >
            <img className="h-28 w-auto" src="/inflix_logo.png" alt="Logo" />
          </Link>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col -mx-2 space-y-1">
            {/* Dashboard - Top standalone link */}
            <li>
              <SidebarLink
                to="/admin/dashboard"
                icon={
                  <svg
                    className="h-5 w-5"
                    width="22"
                    height="25"
                    viewBox="0 0 22 25"
                    fill="currentColor"
                  >
                    <path
                      d="M1.52014 22.6919H7.13251V13.7459H14.1495V22.6919H19.7618V9.01062L10.641 2.11221L1.52014 9.01062V22.6919ZM0 24.212V8.25055L10.641 0.212036L21.282 8.25055V24.212H12.6293V15.266H8.65265V24.212H0Z"
                      fill="currentColor"
                    />
                  </svg>
                }
                label="Dashboard"
                isActive={selectedPage === "dashboard"}
              />
            </li>
            {/* Messages Link */}
            <li>
              <SidebarLink
                to="/admin/order-messages"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
                    />
                  </svg>
                }
                label="Messages"
                isActive={selectedPage === "order-messages"}
                badge={unreadMessagesCount}
              />
            </li>
            {/* Visitor Messages Link */}
            <li>
              <SidebarLink
                to="/admin/visitor-messages"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                    />
                  </svg>
                }
                label="Visitor Messages"
                isActive={selectedPage === "visitor-messages"}
              />
            </li>
            {/* Collapsible Sections */}
            {renderSidebarSections()}
            {/* Profile - Bottom standalone link */}
            <li className="mt-auto pt-4 border-t border-gray-200">
              <SidebarLink
                to="/admin/profile"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                    />
                  </svg>
                }
                label="Profile"
                isActive={selectedPage === "profile"}
              />
            </li>
            {/* Logs - standalone link */}
            <li>
              <SidebarLink
                to="/admin/logs"
                icon={
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z"
                    />
                  </svg>
                }
                label="Logs"
                isActive={selectedPage === "logs"}
              />
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar Overlay (only visible when isSidebarOpen = true) */}
      {isSidebarOpen && mobileSidebar}

      {/* Desktop Sidebar */}
      {desktopSidebar}
    </>
  );
}

Side.propTypes = {
  selectedPage: PropTypes.string,
  isSidebarOpen: PropTypes.bool.isRequired,
  toggleSidebar: PropTypes.func,
  closeSidebar: PropTypes.func.isRequired,
};
