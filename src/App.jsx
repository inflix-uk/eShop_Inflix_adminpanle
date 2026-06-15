import { lazy, Suspense, useEffect, useState } from "react";
import "../src/App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/Auth";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PrivateRoute from "./context/PrivateRoute";
import PermissionRoute from "./context/PermissionRoute";
import AdminTabFavicon from "./components/AdminTabFavicon.jsx";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() =>
  import("./pages/adminpages/profile/ForgotPassword")
);
// admin components
const Profile = lazy(() => import("./pages/adminpages/profile/Profile"));
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
import { ErrorBoundary } from "react-error-boundary";
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
        if (auth.user.permissions.zextons) {
          console.log("\n🛒 Permissions:");
          Object.entries(auth.user.permissions.zextons).forEach(([key, value]) => {
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
    return <div>Loading...</div>;
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
                <ErrorBoundary fallback={<div>Error</div>}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <ResetPass />
                  </Suspense>
                </ErrorBoundary>
              }
            />

            {/* Pages */}
            <Route
              path="/"
              element={
                <ErrorBoundary fallback={<div>Error</div>}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <Login />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/superadmin"
              element={
                <ErrorBoundary fallback={<div>Error</div>}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <SuperadminLogin />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/superadmin/dashboard"
              element={
                <ErrorBoundary fallback={<div>Error</div>}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <SuperadminRoute>
                      <SuperadminDashboard />
                    </SuperadminRoute>
                  </Suspense>
                </ErrorBoundary>
              }
            />
            {/* Admin Pages */}
            <Route
              path="/admin/forgot-password"
              element={
                <ErrorBoundary fallback={<div>Error</div>}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <ForgotPassword />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/landing"
              element={
                <ErrorBoundary fallback={<div>Error</div>}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <PrivateRoute>
                      <LandingPage />
                    </PrivateRoute>
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/static-meta"
              element={
                <ErrorBoundary fallback={<div>Error</div>}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <StaticMetaPages />
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_dashboard">
                        <Dash2 />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/profile"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PrivateRoute>
                        <Profile />
                      </PrivateRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_orders">
                        <AdminRouteAccessGuard routePath="/admin/orders">
                          <Orders />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/delete-orders"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_orders">
                        <DeletedOrders />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/orderdetails/:id"
              element={
                <ErrorBoundary fallback={<div>Error</div>}>
                  <Suspense fallback={<div>Loading...</div>}>
                    <PermissionRoute permission="zextons.view_orders">
                      <OrderDetails />
                    </PermissionRoute>
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/media"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_media">
                        <Media />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/users"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_users">
                        <Users />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/users/edit/:userId"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_users">
                        <EditUser />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/pricing-groups"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_users">
                        <PricingGroups />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/pricing-groups/:groupId"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_users">
                        <PricingGroupProducts />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/pricing-groups/:groupId/customers"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_users">
                        <PricingGroupCustomers />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/subscribers"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_subscribers">
                        <Subscribers />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/reviews/"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_reviews">
                        <Reviews />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/reviewdetail/:id"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_reviews">
                        <ReviewDetail />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/all-blogs"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_blogs">
                        <AllBlogs />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/new-blog"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_blogs">
                        <NewBlog />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/draft-blogs"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_blogs">
                        <DraftsBlogs />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/edit-blog/:id"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_blogs">
                        <EditBlog />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/blog-categories"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_blogs">
                        <BlogCategories />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/blog/preview/:slug"
              element={
                <ErrorBoundary fallback={<div>Error previewing blog</div>}>
                  <Suspense fallback={<div>Loading preview...</div>}>
                    <PermissionRoute permission="zextons.view_blogs">
                      <BlogPreview />
                    </PermissionRoute>
                  </Suspense>
                </ErrorBoundary>
              }
            />
            <Route
              path="/admin/blog/editblog"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error loading editor</div>}>
                    <Suspense fallback={<div>Loading editor...</div>}>
                      <PermissionRoute permission="zextons.view_blogs">
                        <EditBlogNew />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/footer-pages"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_blogs">
                        <FooterPages />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/footer-pages/create"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_blogs">
                        <CreateFooterPage />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/footer-pages/edit/:id"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error loading editor</div>}>
                    <Suspense fallback={<div>Loading editor...</div>}>
                      <PermissionRoute permission="zextons.view_blogs">
                        <EditFooterPage />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/footer-pages/preview/:slug"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error previewing page</div>}>
                    <Suspense fallback={<div>Loading preview...</div>}>
                      <PermissionRoute permission="zextons.view_blogs">
                        <FooterPagePreview />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/pages-categories"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_blogs">
                        <PagesCategories />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/footer-settings"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_blogs">
                        <FooterSettings />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/author"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_blogs">
                        <Author />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />

            <Route
              path="/admin/all-products"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_products">
                        <AdminRouteAccessGuard routePath="/admin/all-products">
                          <AllProducts />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/new-products"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_products">
                        <AdminRouteAccessGuard routePath="/admin/new-products">
                          <NewProducts />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/deleted-products"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_products">
                        <AdminRouteAccessGuard routePath="/admin/deleted-products">
                          <DeletedProducts />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />

            <Route
              path="/admin/edit-product/:id"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_products">
                        <AdminRouteAccessGuard routePath="/admin/edit-product/:id">
                          <EditProduct />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/preview-product/:slug"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_products">
                        <AdminRouteAccessGuard routePath="/admin/preview-product/:slug">
                          <ProductPreview />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />

            <Route
              path="/admin/new-product"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_products">
                        <AdminRouteAccessGuard routePath="/admin/new-product">
                          <NewProduct />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/draft-products"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_products">
                        <AdminRouteAccessGuard routePath="/admin/draft-products">
                          <DraftProducts />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central">
                          <ProductCentral />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/categories"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/categories">
                          <ProductCentralCategories />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/navbar"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/navbar">
                          <ProductCentralNavbarHub />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/google-categories"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <ProductCentralGoogleCategories />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
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
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/subcategories">
                          <ProductCentralSubcategories />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/edit-subcategory/:categoryId/:subIndex"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/edit-subcategory/:categoryId/:subIndex">
                          <ProductCentralEditSubcategory />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/tags"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/tags">
                          <ProductCentralTags />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/brands"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/brands">
                          <ProductCentralBrands />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/condition"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/condition">
                          <ProductCentralCondition />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/variant-condition"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/variant-condition">
                          <ProductCentralVariantCondition />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/variant-storage"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/variant-storage">
                          <ProductCentralVariantStorage />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/variant-color"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/variant-color">
                          <ProductCentralVariantColor />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/card-design"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/card-design">
                          <ProductCentralCardDesign />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/add-new-category"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/add-new-category">
                          <AddCategory />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/edit-category/:id"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/edit-category/:id">
                          <EditCategory />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-central/category-display-products/:categoryId"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-central/category-display-products/:categoryId">
                          <CategoryDisplayProducts />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-variants"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-variants">
                          <ProductVariants />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-variants/:id"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-variants/:id">
                          <ProductVariants />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/variant-attributes"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/variant-attributes">
                          <ProductCentralVariantAttributes />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/product-options"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_product_central">
                        <AdminRouteAccessGuard routePath="/admin/product-options">
                          <ProductCentralProductOptions />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/coupons"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_coupons">
                        <AdminRouteAccessGuard routePath="/admin/coupons">
                          <Coupons />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/deals"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_deals">
                        <AdminRouteAccessGuard routePath="/admin/deals">
                          <Deals />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
              <Route
                path="/admin/banners"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute permission="zextons.view_blogs">
                          <Banners />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/banners/create"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute permission="zextons.view_blogs">
                          <BannerEditorPage />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/banners/edit/:id"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute permission="zextons.view_blogs">
                          <BannerEditorPage />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/google-search-console"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <GoogleSearchConsole />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/logo"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <Logo />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/site-wide-color"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <SiteWideColor />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/homepage-features"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <HomepageFeatures />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/widgets"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <HomepageWidgets />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/deals-modal"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <DealsModalSettings />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/announcement-banner"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <AnnouncementBannerSettings />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/category-cards"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <CategoryCards />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/promotional-sections"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <PromotionalSections />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              {/* Settings Pages */}
              <Route
                path="/admin/settings/stripe"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <AdminRouteAccessGuard routePath="/admin/settings/stripe">
                            <StripeSettings />
                          </AdminRouteAccessGuard>
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/shipping"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <AdminRouteAccessGuard routePath="/admin/settings/shipping">
                            <ShippingSettings />
                          </AdminRouteAccessGuard>
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/homepage-data"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <HomepageDataSettings />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/homepage-seo"
                element={
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <PermissionRoute>
                      <Navigate
                        to="/admin/settings/homepage-data?tab=seo"
                        replace
                      />
                    </PermissionRoute>
                  </ErrorBoundary>
                }
              />
              <Route
                path="/admin/settings/trustpilot"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <TrustpilotSettings />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/scripts"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <ScriptsSettings />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/email-templates"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <EmailTemplatesSettings />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/smtp"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <SmtpSettings />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
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
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <SiteWideSchemaSettings />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
              <Route
                path="/admin/settings/robots"
                element={
                  <>
                    <ErrorBoundary fallback={<div>Error</div>}>
                      <Suspense fallback={<div>Loading...</div>}>
                        <PermissionRoute>
                          <RobotsSettings />
                        </PermissionRoute>
                      </Suspense>
                    </ErrorBoundary>
                  </>
                }
              />
            <Route
              path="/admin/return-orders"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_returns">
                        <AdminRouteAccessGuard routePath="/admin/return-orders">
                          <ReturnOrders />
                        </AdminRouteAccessGuard>
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/add-return-orders"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_returns">
                        <AddReturnOrders />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/edit-return-orders/:id"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_returns">
                        <EditReturnOrders />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/return-order-detail/:id"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_returns">
                        <ReturnOrderDetail />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/order-messages"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_messages">
                        <OrderMessages />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/visitor-messages"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PrivateRoute>
                        <VisitorMessages />
                      </PrivateRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/return-requests"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_return_requests">
                        <ReturnRequest />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/pdf-labels"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PrivateRoute>
                        <PDFLabelsPage />
                      </PrivateRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/edit-return-request/:id"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PermissionRoute permission="zextons.view_return_requests">
                        <EditReturnRequests />
                      </PermissionRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            {/* Roles and Permissions */}
            <Route
              path="/admin/roles"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PrivateRoute>
                        <ManageRoles />
                      </PrivateRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/roles/:roleId/users"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PrivateRoute>
                        <RoleUsers />
                      </PrivateRoute>
                    </Suspense>
                  </ErrorBoundary>
                </>
              }
            />
            <Route
              path="/admin/permissions"
              element={
                <>
                  <ErrorBoundary fallback={<div>Error</div>}>
                    <Suspense fallback={<div>Loading...</div>}>
                      <PrivateRoute>
                        <PermissionsExample />
                      </PrivateRoute>
                    </Suspense>
                  </ErrorBoundary>
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
