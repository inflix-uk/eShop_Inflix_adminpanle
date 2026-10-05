import { Suspense, useEffect, useState } from "react";
// React.lazy, plus a reload when a page's chunk has gone after a deploy.
import lazy from "./utils/lazyWithReload";
import "../src/App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/Auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "./context/PrivateRoute";
import PermissionRoute from "./context/PermissionRoute";
import AdminTabFavicon from "./components/AdminTabFavicon.jsx";
import PageSkeleton, { AuthSkeleton } from "./pages/adminpages/shared/PageSkeleton";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() =>
  import("./pages/adminpages/profile/ForgotPassword")
);
// admin components   
const Profile = lazy(() => import("./pages/adminpages/profile/Profile"));
const Logs = lazy(() => import("./pages/adminpages/logs/Logs"));
const Orders = lazy(() => import("./pages/adminpages/orders/Orders"));
const Users = lazy(() => import("./pages/adminpages/users/Users"));
const PricingGroups = lazy(() =>
  import("./pages/adminpages/pricing-groups/PricingGroups")
);
const PricingGroupProducts = lazy(() =>
  import("./pages/adminpages/pricing-groups/PricingGroupProducts")
);
const PricingGroupCustomers = lazy(() =>
  import("./pages/adminpages/pricing-groups/PricingGroupCustomers")
);
const EditUser = lazy(() => import("./pages/adminpages/users/EditUser"));
const CustomersList = lazy(() =>
  import("./pages/adminpages/crm/CustomersList")
);
const Customer360 = lazy(() => import("./pages/adminpages/crm/Customer360"));
const AnalyticsOverview = lazy(() =>
  import("./pages/adminpages/analytics-dashboard/Overview")
);
const AdPerformanceReport = lazy(() =>
  import("./pages/adminpages/analytics-dashboard/AdPerformanceReport")
);
const CampaignAnalyticsReport = lazy(() =>
  import("./pages/adminpages/analytics-dashboard/CampaignAnalyticsReport")
);
const CampaignOrdersReport = lazy(() =>
  import("./pages/adminpages/analytics-dashboard/CampaignOrdersReport")
);
const ProductCentral = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductCentral")
);
const ProductCentralCategories = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductCentralCategories")
);
const ProductCentralNavbarHub = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductCentralNavbarHub")
);
const ProductCentralGoogleCategories = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductCentralGoogleCategories")
);
const ProductCentralSubcategories = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductCentralSubcategories")
);
const ProductCentralEditSubcategory = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductCentralEditSubcategory")
);
const ProductCentralTags = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductCentralTags")
);
const ProductCentralBrands = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductCentralBrands")
);
const ProductCentralCondition = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductCentralCondition")
);
const ProductCentralVariantCondition = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductCentralVariantCondition")
);
const ProductCentralVariantStorage = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductCentralVariantStorage")
);
const ProductCentralVariantColor = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductCentralVariantColor")
);
const ProductCentralCardDesign = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductCentralCardDesign")
);
const Coupons = lazy(() => import("./pages/adminpages/Coupons/Coupons"));
const Deals = lazy(() => import("./pages/adminpages/deals/Deals"));
const Banners = lazy(() => import("./pages/adminpages/banners/Banners"));
const BannerEditorPage = lazy(() =>
  import("./pages/adminpages/banners/BannerEditorPage")
);
const GoogleSearchConsole = lazy(() => import("./pages/adminpages/google-search-console/GoogleSearchConsole"));
const Logo = lazy(() => import("./pages/adminpages/logo/Logo"));
const SiteWideColor = lazy(() =>
  import("./pages/adminpages/site-wide-color/SiteWideColor")
);
const HomepageFeatures = lazy(() => import("./pages/adminpages/homepage-features/HomepageFeatures"));
const HomepageWidgets = lazy(() => import("./pages/adminpages/homepage-widgets/HomepageWidgets"));
const DealsModalSettings = lazy(() =>
  import("./pages/adminpages/homepage-deals-modal/DealsModalSettings")
);
const AnnouncementBannerSettings = lazy(() =>
  import("./pages/adminpages/homepage-announcement-banner/AnnouncementBannerSettings")
);
const CategoryCards = lazy(() => import("./pages/adminpages/category-cards/CategoryCards"));
const PromotionalSections = lazy(() => import("./pages/adminpages/promotional-sections/PromotionalSections"));
const Dash2 = lazy(() => import("./pages/adminpages/dashboard/Dash2"));
const Subscribers = lazy(() =>
  import("./pages/adminpages/subscribers/Subscribers")
);
const ProductVariants = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductVariants")
);
const ProductCentralVariantAttributes = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductCentralVariantAttributes")
);
const ProductCentralProductOptions = lazy(() =>
  import("./pages/adminpages/ProductCentral/ProductCentralProductOptions")
);
const EditBlog = lazy(() => import("./pages/adminpages/blogs/EditBlog"));
const DeletedOrders = lazy(() =>
  import("./pages/adminpages/orders/DeletedOrders")
);
const AddCategory = lazy(() =>
  import(
    "./components/ProductCentralComponents/ProductCategoriesComponents/AddCategory"
  )
);
const EditCategory = lazy(() =>
  import(
    "./components/ProductCentralComponents/ProductCategoriesComponents/EditCategory"
  )
);
const CategoryDisplayProducts = lazy(() =>
  import("./pages/adminpages/ProductCentral/CategoryDisplayProducts")
);
const DeletedProducts = lazy(() =>
  import("./pages/adminpages/productsNew/DeletedProducts")
);
const Media = lazy(() => import("./pages/adminpages/media/Media"));
const AllBlogs = lazy(() => import("./pages/adminpages/blog-new/page"));
const NewBlog = lazy(() => import("./pages/adminpages/blog-new/createblog/page"));
const BlogPreview = lazy(() => import("./pages/adminpages/blog-new/preview/[slug]/page"));
const EditBlogNew = lazy(() => import("./pages/adminpages/blog-new/editblog/page"));
const BlogCategories = lazy(() =>
  import("./pages/adminpages/blogs/BlogCategories")
);
const ResetPass = lazy(() => import("./pages/adminpages/profile/ResetPass"));
const AllProducts = lazy(() =>
  import("./pages/adminpages/products/AllProducts")
);
const NewProducts = lazy(() =>
  import("./pages/adminpages/productsNew/NewProducts")
);
const NewProduct = lazy(() =>
  import("./pages/adminpages/productsNew/CreateProduct")
);
const DraftProducts = lazy(() =>
  import("./pages/adminpages/productsNew/DraftProducts")
);
const EditProduct = lazy(() =>
  import("./pages/adminpages/productsNew/EditProduct")
);
const ProductPreview = lazy(() =>
  import("./pages/adminpages/productsNew/ProductPreview")
);
const OrderDetails = lazy(() =>
  import("./pages/adminpages/orders/OrderDetails")
);
const Reviews = lazy(() => import("./pages/adminpages/reviews/Reviews"));
const ReviewDetail = lazy(() =>
  import("./pages/adminpages/reviews/ReviewDetail")
);
const SuperadminLogin = lazy(() =>
  import("./pages/superadmin/SuperadminLogin")
);
const SuperadminDashboard = lazy(() =>
  import("./pages/superadmin/SuperadminDashboard")
);
import { HelmetProvider } from "react-helmet-async";
import RouteErrorBoundary from "./components/common/RouteErrorBoundary";
import ReturnRequest from "./pages/adminpages/requests/ReturnRequest";
import EditReturnRequests from "./pages/adminpages/ReturnOrders/EditReturnRequests";
import DraftsBlogs from "./pages/adminpages/blogs/DraftsBlogs";
const ReturnOrders = lazy(() =>
  import("./pages/adminpages/ReturnOrders/ReturnOrders")
);
const AddReturnOrders = lazy(() =>
  import("./pages/adminpages/ReturnOrders/AddReturnOrders")
);
const EditReturnOrders = lazy(() =>
  import("./pages/adminpages/ReturnOrders/EditReturnOrders")
);
const OrderMessages = lazy(() =>
  import("./pages/adminpages/messages/OrderMessages")
);
const VisitorMessages = lazy(() =>
  import("./pages/adminpages/visitorMessages/VisitorMessages")
);
const ReturnOrderDetail = lazy(() =>
  import("./pages/adminpages/ReturnOrders/ReturnOrderDetail")
);
const PDFLabelsPage = lazy(() =>
  import("./pages/adminpages/PDFLabels/PDFLabelsPage")
);
const StaticMetaPages = lazy(() =>
  import("./pages/adminpages/static-meta/StaticMetaPages")
);
const FooterPages = lazy(() =>
  import("./pages/adminpages/footer-pages/page")
);
const CreateFooterPage = lazy(() =>
  import("./pages/adminpages/footer-pages/create/page")
);
const EditFooterPage = lazy(() =>
  import("./pages/adminpages/footer-pages/edit/[id]/page")
);
const FooterPagePreview = lazy(() =>
  import("./pages/adminpages/footer-pages/preview/[slug]/page")
);
const PagesCategories = lazy(() =>
  import("./pages/adminpages/pages-categories/page")
);
const FooterSettings = lazy(() =>
  import("./pages/adminpages/footer-settings/FooterSettings")
);
const Author = lazy(() => import("./pages/adminpages/author/Author"));
// Settings Pages
const StripeSettings = lazy(() =>
  import("./pages/adminpages/settings/stripe/page")
);
const BookingManagement = lazy(() =>
  import("./pages/adminpages/settings/booking/page")
);
const ShippingSettings = lazy(() =>
  import("./pages/adminpages/settings/shipping/page")
);
const HomepageDataSettings = lazy(() =>
  import("./pages/adminpages/settings/homepage-data/page")
);
const TrustpilotSettings = lazy(() =>
  import("./pages/adminpages/settings/trustpilot/page")
);
const ScriptsSettings = lazy(() =>
  import("./pages/adminpages/settings/scripts/page")
);
const EmailTemplatesSettings = lazy(() =>
  import("./pages/adminpages/settings/email-templates/page")
);
const SmtpSettings = lazy(() =>
  import("./pages/adminpages/settings/smtp/page")
);
const SiteWideSchemaSettings = lazy(() =>
  import("./pages/adminpages/settings/site-wide-schema/page")
);
const RobotsSettings = lazy(() =>
  import("./pages/adminpages/settings/robots/page")
);
const DashboardSettings = lazy(() =>
  import("./pages/adminpages/settings/dashboard/page")
);
// Roles and Permissions
import ManageRoles from "./pages/adminpages/roles/ManageRoles";
import RoleUsers from "./pages/adminpages/roles/RoleUsers";
import PermissionsExample from "./pages/adminpages/roles/PermissionsManagement";
// Landing Page
const LandingPage = lazy(() => import("./pages/adminpages/landingpage/LandingPage"));

// Component to log user permissions
function PermissionLogger() {
  const auth = useAuth();

  useEffect(() => {
    if (auth.user) {
      console.log("=".repeat(60));
      console.log("🔐 LOGGED IN USER INFORMATION");
      console.log("=".repeat(60));
      console.log("📧 Email:", auth.user.email);
      console.log("👤 Name:", auth.user.firstname, auth.user.lastname);
      console.log("🎭 Role (Simple):", auth.user.role);
      console.log("🔑 User Type (Custom Role):", auth.user.userType || "N/A");
      console.log("🆔 Role ID:", auth.user.roleId || "N/A");
      console.log("\n📋 PERMISSIONS:");
      console.log("-".repeat(60));

      if (auth.user.permissions) {
        // Log permissions
        if (auth.user.permissions.store) {
          console.log("\n🛒 Permissions:");
          Object.entries(auth.user.permissions.store).forEach(([key, value]) => {
            const icon = value ? "✅" : "❌";
            console.log(`  ${icon} ${key}: ${value}`);
          });
        }

        // Log all permissions as JSON for easy copy
        console.log("\n📄 Full Permissions Object:");
        console.log(JSON.stringify(auth.user.permissions, null, 2));
      } else {
        console.log("⚠️ No permissions found for this user");
      }

      console.log("=".repeat(60));
    }
  }, [auth.user]);

  return null; // This component doesn't render anything
}

function SuperadminRoute({ children }) {
  const auth = useAuth();

  if (!auth?.user) {
    return <Navigate to="/admin/superadmin" replace />;
  }

  if (auth.user.role !== "superadmin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AdminRouteAccessGuard({ children, routePath }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  useEffect(() => {
    let mounted = true;
    const normalizeRoutePath = (value) =>
      String(value || "").trim().replace(/^\/+|\/+$/g, "").toLowerCase();

    const checkRouteAccess = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}superadmin/controls/public`);
        const payload = await response.json();
        const disabledAdminRoutes = Array.isArray(payload?.data?.disabledAdminRoutes)
          ? payload.data.disabledAdminRoutes.map(normalizeRoutePath)
          : [];

        if (mounted) {
          setIsBlocked(disabledAdminRoutes.includes(normalizeRoutePath(routePath)));
        }
      } catch (error) {
        if (mounted) {
          setIsBlocked(false);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkRouteAccess();
    return () => {
      mounted = false;
    };
  }, [routePath]);

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isBlocked) {
    return (
      <Navigate
        to="/admin/profile"
        state={{ error: "This module is disabled by superadmin." }}
        replace
      />
    );
  }

  return children;
}

function App() {
  return (
    <>
      <HelmetProvider>
        <AuthProvider>
          <PermissionLogger />
          <AdminTabFavicon />
          <Routes>
            <Route
              path="/resetpassword/:token"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<AuthSkeleton />}>
                    <ResetPass />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />

            {/* Pages */}
            <Route
              path="/"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<AuthSkeleton />}>
                    <Login />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/admin/superadmin"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<AuthSkeleton />}>
                    <SuperadminLogin />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/admin/superadmin/dashboard"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<PageSkeleton />}>
                    <SuperadminRoute>
                      <SuperadminDashboard />
                    </SuperadminRoute>
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            {/* Admin Pages */}
            <Route
              path="/admin/forgot-password"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<AuthSkeleton />}>
                    <ForgotPassword />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/admin/landing"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<PageSkeleton />}>
                    <PrivateRoute>
                      <LandingPage />
                    </PrivateRoute>
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/admin/static-meta"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<PageSkeleton />}>
                    <StaticMetaPages />
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_dashboard">
                        <Dash2 />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/logs"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PrivateRoute>
                        <Logs />
                      </PrivateRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_orders">
                        <AdminRouteAccessGuard routePath="/admin/orders">
                          <Orders />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/delete-orders"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_orders">
                        <DeletedOrders />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/orderdetails/:id"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<PageSkeleton />}>
                    <PermissionRoute permission="store.view_orders">
                      <OrderDetails />
                    </PermissionRoute>
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/admin/media"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_media">
                        <Media />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/users"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_users">
                        <Users />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/users/edit/:userId"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_users">
                        <EditUser />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/crm/customers"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="zextons.view_users">
                        <CustomersList />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/crm/customers/:userId"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="zextons.view_users">
                        <Customer360 />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/analytics/overview"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_dashboard">
                        <AnalyticsOverview />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/analytics/ad-performance"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_dashboard">
                        <AdPerformanceReport />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/analytics/campaign-analytics"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_dashboard">
                        <CampaignAnalyticsReport />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/analytics/campaign-orders"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_dashboard">
                        <CampaignOrdersReport />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/pricing-groups"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_users">
                        <PricingGroups />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/pricing-groups/:groupId"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_users">
                        <PricingGroupProducts />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/pricing-groups/:groupId/customers"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_users">
                        <PricingGroupCustomers />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/subscribers"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_subscribers">
                        <Subscribers />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/reviews/"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_reviews">
                        <Reviews />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/reviewdetail/:id"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_reviews">
                        <ReviewDetail />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/all-blogs"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_blogs">
                        <AllBlogs />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/new-blog"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_blogs">
                        <NewBlog />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/draft-blogs"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_blogs">
                        <DraftsBlogs />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/edit-blog/:id"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_blogs">
                        <EditBlog />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/blog-categories"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_blogs">
                        <BlogCategories />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/blog/preview/:slug"
              element={
                <RouteErrorBoundary>
                  <Suspense fallback={<PageSkeleton />}>
                    <PermissionRoute permission="store.view_blogs">
                      <BlogPreview />
                    </PermissionRoute>
                  </Suspense>
                </RouteErrorBoundary>
              }
            />
            <Route
              path="/admin/blog/editblog"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_blogs">
                        <EditBlogNew />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/footer-pages"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_blogs">
                        <FooterPages />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/footer-pages/create"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_blogs">
                        <CreateFooterPage />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/footer-pages/edit/:id"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_blogs">
                        <EditFooterPage />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/footer-pages/preview/:slug"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_blogs">
                        <FooterPagePreview />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/pages-categories"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_blogs">
                        <PagesCategories />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/footer-settings"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_blogs">
                        <FooterSettings />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/author"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_blogs">
                        <Author />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />

            <Route
              path="/admin/all-products"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_products">
                        <AdminRouteAccessGuard routePath="/admin/all-products">
                          <AllProducts />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/new-products"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_products">
                        <AdminRouteAccessGuard routePath="/admin/new-products">
                          <NewProducts />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/deleted-products"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_products">
                        <AdminRouteAccessGuard routePath="/admin/deleted-products">
                          <DeletedProducts />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />

            <Route
              path="/admin/edit-product/:id"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_products">
                        <AdminRouteAccessGuard routePath="/admin/edit-product/:id">
                          <EditProduct />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/preview-product/:slug"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_products">
                        <AdminRouteAccessGuard routePath="/admin/preview-product/:slug">
                          <ProductPreview />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />

            <Route
              path="/admin/new-product"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_products">
                        <AdminRouteAccessGuard routePath="/admin/new-product">
                          <NewProduct />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/draft-products"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_products">
                        <AdminRouteAccessGuard routePath="/admin/draft-products">
                          <DraftProducts />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central">
                          <ProductCentral />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/categories"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/categories">
                          <ProductCentralCategories />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/navbar"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/navbar">
                          <ProductCentralNavbarHub />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/google-categories"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <ProductCentralGoogleCategories />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/homepage-nav-links"
              element={
                <Navigate
                  to="/admin/product-central/navbar?tab=links"
                  replace
                />
              }
            />
            <Route
              path="/admin/product-central/navbar-order"
              element={
                <Navigate
                  to="/admin/product-central/navbar?tab=order"
                  replace
                />
              }
            />
            <Route
              path="/admin/product-central/subcategories"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/subcategories">
                          <ProductCentralSubcategories />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/edit-subcategory/:categoryId/:subIndex"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/edit-subcategory/:categoryId/:subIndex">
                          <ProductCentralEditSubcategory />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/tags"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/tags">
                          <ProductCentralTags />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/brands"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/brands">
                          <ProductCentralBrands />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/condition"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/condition">
                          <ProductCentralCondition />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/variant-condition"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/variant-condition">
                          <ProductCentralVariantCondition />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/variant-storage"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/variant-storage">
                          <ProductCentralVariantStorage />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/variant-color"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/variant-color">
                          <ProductCentralVariantColor />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/card-design"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/card-design">
                          <ProductCentralCardDesign />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/add-new-category"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/add-new-category">
                          <AddCategory />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/edit-category/:id"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/edit-category/:id">
                          <EditCategory />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/category-display-products/:categoryId"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/category-display-products/:categoryId">
                          <CategoryDisplayProducts />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-variants"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-variants">
                          <ProductVariants />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-variants/:id"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-variants/:id">
                          <ProductVariants />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/variant-attributes"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/variant-attributes">
                          <ProductCentralVariantAttributes />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-options"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-options">
                          <ProductCentralProductOptions />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_coupons">
                        <AdminRouteAccessGuard routePath="/admin/coupons">
                          <Coupons />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/deals"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_deals">
                        <AdminRouteAccessGuard routePath="/admin/deals">
                          <Deals />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
              <Route
                path="/admin/banners"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute permission="store.view_blogs">
                          <Banners />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/banners/create"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute permission="store.view_blogs">
                          <BannerEditorPage />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/banners/edit/:id"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute permission="store.view_blogs">
                          <BannerEditorPage />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/google-search-console"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <GoogleSearchConsole />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/logo"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <Logo />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/site-wide-color"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <SiteWideColor />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/homepage-features"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <HomepageFeatures />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/widgets"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <HomepageWidgets />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/deals-modal"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <DealsModalSettings />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/announcement-banner"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <AnnouncementBannerSettings />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/category-cards"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <CategoryCards />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/promotional-sections"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <PromotionalSections />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              {/* Settings Pages */}
              <Route
                path="/admin/settings/stripe"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <AdminRouteAccessGuard routePath="/admin/settings/stripe">
                            <StripeSettings />
                          </AdminRouteAccessGuard>
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/booking"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <AdminRouteAccessGuard routePath="/admin/settings/booking">
                            <BookingManagement />
                          </AdminRouteAccessGuard>
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/shipping"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <AdminRouteAccessGuard routePath="/admin/settings/shipping">
                            <ShippingSettings />
                          </AdminRouteAccessGuard>
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/homepage-data"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <HomepageDataSettings />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/homepage-seo"
                element={
                  <RouteErrorBoundary>
                    <PermissionRoute>
                      <Navigate
                        to="/admin/settings/homepage-data?tab=seo"
                        replace
                      />
                    </PermissionRoute>
                  </RouteErrorBoundary>
                }
              />
              <Route
                path="/admin/settings/trustpilot"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <TrustpilotSettings />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/scripts"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <ScriptsSettings />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/email-templates"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <EmailTemplatesSettings />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/smtp"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <SmtpSettings />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/contact-widget"
                element={<Navigate to="/admin/settings/widgets" replace />}
              />
              <Route
                path="/admin/settings/site-wide-schema"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <SiteWideSchemaSettings />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/dashboard"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <DashboardSettings />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/robots"
                element={
                  <>
                    <RouteErrorBoundary>
                      <Suspense fallback={<PageSkeleton />}>
                        <PermissionRoute>
                          <RobotsSettings />
                        </PermissionRoute>
                      </Suspense>
                    </RouteErrorBoundary>
                  </>
                }
              />
            <Route
              path="/admin/return-orders"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_returns">
                        <AdminRouteAccessGuard routePath="/admin/return-orders">
                          <ReturnOrders />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/add-return-orders"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_returns">
                        <AddReturnOrders />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/edit-return-orders/:id"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_returns">
                        <EditReturnOrders />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/return-order-detail/:id"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_returns">
                        <ReturnOrderDetail />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/order-messages"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_messages">
                        <OrderMessages />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/visitor-messages"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PrivateRoute>
                        <VisitorMessages />
                      </PrivateRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/return-requests"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_return_requests">
                        <ReturnRequest />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/pdf-labels"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PrivateRoute>
                        <PDFLabelsPage />
                      </PrivateRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/edit-return-request/:id"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PermissionRoute permission="store.view_return_requests">
                        <EditReturnRequests />
                      </PermissionRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            {/* Roles and Permissions */}
            <Route
              path="/admin/roles"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PrivateRoute>
                        <ManageRoles />
                      </PrivateRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/roles/:roleId/users"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PrivateRoute>
                        <RoleUsers />
                      </PrivateRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/permissions"
              element={
                <>
                  <RouteErrorBoundary>
                    <Suspense fallback={<PageSkeleton />}>
                      <PrivateRoute>
                        <PermissionsExample />
                      </PrivateRoute>
                    </Suspense>
                  </RouteErrorBoundary>
                </>
              }
            />
          </Routes>
        </AuthProvider>
      </HelmetProvider>
      <ToastContainer position="top-right" theme="light" />
    </>
  );
}

export default App;
