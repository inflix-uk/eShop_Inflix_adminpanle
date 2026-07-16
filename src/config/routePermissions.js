/**
 * Route Permissions Configuration
 * Maps each route to its required permissions
 */

export const ROUTE_PERMISSIONS = {
    // Dashboard - accessible to all authenticated users
    '/admin/dashboard': [],
    '/admin/analytics/overview': ['view_dashboard'],
    '/admin/analytics/ad-performance': ['view_dashboard'],
    '/admin/analytics/campaign-analytics': ['view_dashboard'],
    '/admin/analytics/campaign-orders': ['view_dashboard'],

    // Profile - accessible to all authenticated users
    '/admin/profile': [],

    // Orders
    '/admin/orders': ['view_orders'],
    '/admin/delete-orders': ['manage_orders'],
    '/admin/orderdetails/:id': ['view_orders'],

    // Products
    '/admin/all-products': ['view_products'],
    '/admin/new-products': ['view_products'],
    '/admin/deleted-products': ['manage_products'],
    '/admin/new-product': ['manage_products'],
    '/admin/edit-product/:id': ['manage_products'],
    '/admin/draft-products': ['view_products'],

    // Product Central
    '/admin/product-central': ['view_product_central'],
    '/admin/product-central/navbar': ['view_product_central'],
    '/admin/product-central/homepage-nav-links': ['view_product_central'],
    '/admin/product-central/navbar-order': ['view_product_central'],
    '/admin/product-central/card-design': ['view_product_central'],
    '/admin/product-central/add-new-category': ['manage_product_central'],
    '/admin/product-central/edit-category/:id': ['manage_product_central'],
    '/admin/product-variants': ['view_product_central'],
    '/admin/product-variants/:id': ['view_product_central'],

    // Media
    '/admin/media': ['view_media'],

    // Blogs
    '/admin/all-blogs': ['view_blogs'],
    '/admin/new-blog': ['manage_blogs'],
    '/admin/draft-blogs': ['view_blogs'],
    '/admin/edit-blog/:id': ['manage_blogs'],
    '/admin/blog-categories': ['manage_blogs'],
    '/admin/blog/preview/:slug': ['view_blogs'],
    '/admin/blog/editblog': ['manage_blogs'],
    '/admin/author': ['view_blogs'],

    // Coupons
    '/admin/coupons': ['view_coupons'],

    // Deals
    '/admin/deals': ['view_coupons'],

    // Banners
    '/admin/banners': ['view_banners'],

    // Google Search Console
    '/admin/google-search-console': ['view_blogs'],

    // Logo
    '/admin/logo': ['view_blogs'],

    // Site-wide color (UI only until API is wired)
    '/admin/site-wide-color': ['view_blogs'],

    // Site scripts (admin UI; API optional)
    '/admin/settings/scripts': ['view_blogs'],

    // Homepage Features
    '/admin/homepage-features': ['view_blogs'],

    // Homepage Widgets (UI placeholder; same gate as other homepage content)
    '/admin/homepage-widgets': ['view_blogs'],

    // Homepage Deals modal (Hot UK Deals popup CMS)
    '/admin/homepage-deals-modal': ['view_blogs'],

    // Category Cards
    '/admin/category-cards': ['view_blogs'],

    // Homepage content & SEO (block editor / meta)
    '/admin/settings/homepage-data': ['view_blogs'],
    '/admin/settings/homepage-seo': ['view_blogs'],

    // Promotional Sections
    '/admin/promotional-sections': ['view_blogs'],

    // Users
    '/admin/users': ['view_users'],
    '/admin/users/edit/:userId': ['manage_users'],

    // Subscribers
    '/admin/subscribers': ['view_subscribers'],

    // Reviews
    '/admin/reviews/': ['view_reviews'],
    '/admin/reviewdetail/:id': ['view_reviews'],

    // Return Orders
    '/admin/return-orders': ['view_returns'],
    '/admin/add-return-orders': ['manage_returns'],
    '/admin/edit-return-orders/:id': ['manage_returns'],
    '/admin/return-order-detail/:id': ['view_returns'],

    // Return Requests
    '/admin/return-requests': ['view_return_requests'],
    '/admin/edit-return-request/:id': ['manage_return_requests'],

    // Messages
    '/admin/order-messages': ['view_messages'],

    // PDF Labels
    '/admin/pdf-labels': ['view_pdf_labels'],

    // Static Meta
    '/admin/static-meta': [],

    // Roles and Permissions
    '/admin/roles': ['view_roles'],
    '/admin/permissions': ['view_permissions'],
};

/**
 * Get required permissions for a route
 * @param {string} path - Route path
 * @returns {Array<string>} Array of required permission IDs
 */
export const getRoutePermissions = (path) => {
    // Try exact match first
    if (ROUTE_PERMISSIONS[path]) {
        return ROUTE_PERMISSIONS[path];
    }

    // Try pattern matching for dynamic routes
    const matchedRoute = Object.keys(ROUTE_PERMISSIONS).find(route => {
        if (!route.includes(':')) return false;

        const routePattern = route.replace(/:[^/]+/g, '[^/]+');
        const regex = new RegExp(`^${routePattern}$`);
        return regex.test(path);
    });

    return matchedRoute ? ROUTE_PERMISSIONS[matchedRoute] : [];
};

export default ROUTE_PERMISSIONS;
