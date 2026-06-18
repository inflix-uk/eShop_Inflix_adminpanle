export const ADMIN_ROUTE_MODULES = [
  {
    id: "orders-and-sales",
    label: "Orders & Sales",
    description: "Controls Orders, Returns, Coupons, and Deals in admin panel.",
    routes: [
      "/admin/orders",
      "/admin/return-orders",
      "/admin/coupons",
      "/admin/deals",
    ],
  },
  {
    id: "products",
    label: "Products",
    description:
      "Controls product listing, product central, and related product management routes.",
    routes: [
      "/admin/all-products",
      "/admin/new-products",
      "/admin/deleted-products",
      "/admin/edit-product/:id",
      "/admin/preview-product/:slug",
      "/admin/new-product",
      "/admin/draft-products",
      "/admin/product-central",
      "/admin/product-central/categories",
      "/admin/product-central/navbar",
      "/admin/product-central/subcategories",
      "/admin/product-central/edit-subcategory/:categoryId/:subIndex",
      "/admin/product-central/tags",
      "/admin/product-central/brands",
      "/admin/product-central/condition",
      "/admin/product-central/variant-condition",
      "/admin/product-central/variant-storage",
      "/admin/product-central/variant-color",
      "/admin/product-central/card-design",
      "/admin/product-central/add-new-category",
      "/admin/product-central/edit-category/:id",
      "/admin/product-central/category-display-products/:categoryId",
      "/admin/product-variants",
      "/admin/product-variants/:id",
      "/admin/variant-attributes",
      "/admin/product-options",
    ],
  },
  {
    id: "billing-and-shipping-settings",
    label: "Billing & Shipping Settings",
    description: "Controls Stripe and Shipping settings pages in admin panel.",
    routes: ["/admin/settings/stripe", "/admin/settings/shipping"],
  },
  {
    id: "booking-management",
    label: "Booking Management",
    description: "Controls booking system settings, packages, availability, and appointments.",
    routes: ["/admin/settings/booking"],
  },
];

export const normalizeRoutePath = (value) =>
  String(value || "").trim().replace(/^\/+|\/+$/g, "").toLowerCase();
