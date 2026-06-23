/**
 * Permission Groups Configuration
 * Defines all available permissions organized by system and category
 */

export const PERMISSION_GROUPS = {
    store: [
        {
            name: 'Dashboard',
            permissions: [
                { id: 'view_dashboard', name: 'View Dashboard', description: 'Access to view dashboard statistics' },
                { id: 'export_dashboard', name: 'Export Dashboard Data', description: 'Can export dashboard analytics' }
            ]
        },
        {
            name: 'Blogs',
            permissions: [
                { id: 'view_blogs', name: 'View Blogs', description: 'Can view blog posts' },
                { id: 'manage_blogs', name: 'Manage Blogs', description: 'Can create/edit/delete blog posts' }
            ]
        },
        {
            name: 'Media',
            permissions: [
                { id: 'view_media', name: 'View Media', description: 'Can view media files' },
                { id: 'manage_media', name: 'Manage Media', description: 'Can upload/edit/delete media files' }
            ]
        },
        {
            name: 'Products',
            permissions: [
                { id: 'view_products', name: 'View Products', description: 'Can view product listings' },
                { id: 'manage_products', name: 'Manage Products', description: 'Can add/edit/delete products' }
            ]
        },
        {
            name: 'Product Central',
            permissions: [
                { id: 'view_product_central', name: 'View Product Central', description: 'Can view product central' },
                { id: 'manage_product_central', name: 'Manage Product Central', description: 'Can manage product central settings' }
            ]
        },
        {
            name: 'Coupons',
            permissions: [
                { id: 'view_coupons', name: 'View Coupons', description: 'Can view coupons' },
                { id: 'manage_coupons', name: 'Manage Coupons', description: 'Can create/edit/delete coupons' }
            ]
        },
        {
            name: 'Orders',
            permissions: [
                { id: 'view_orders', name: 'View Orders', description: 'Can view customer orders' },
                { id: 'manage_orders', name: 'Process Orders', description: 'Can process and update orders' }
            ]
        },
        {
            name: 'Returns',
            permissions: [
                { id: 'view_returns', name: 'View Returns', description: 'Can view return orders' },
                { id: 'manage_returns', name: 'Manage Returns', description: 'Can process return orders' }
            ]
        },
        {
            name: 'Return Requests',
            permissions: [
                { id: 'view_return_requests', name: 'View Return Requests', description: 'Can view return requests' },
                { id: 'manage_return_requests', name: 'Process Return Requests', description: 'Can approve/reject return requests' }
            ]
        },
        {
            name: 'Messages',
            permissions: [
                { id: 'view_messages', name: 'View Messages', description: 'Can view order messages' },
                { id: 'manage_messages', name: 'Manage Messages', description: 'Can respond to order messages' }
            ]
        },
        {
            name: 'Reviews',
            permissions: [
                { id: 'view_reviews', name: 'View Reviews', description: 'Can view product reviews' },
                { id: 'manage_reviews', name: 'Manage Reviews', description: 'Can moderate product reviews' }
            ]
        },
        {
            name: 'Users',
            permissions: [
                { id: 'view_users', name: 'View Users', description: 'Can view user accounts' },
                { id: 'manage_users', name: 'Manage Users', description: 'Can manage user accounts' }
            ]
        },
        {
            name: 'Subscribers',
            permissions: [
                { id: 'view_subscribers', name: 'View Subscribers', description: 'Can view newsletter subscribers' },
                { id: 'manage_subscribers', name: 'Manage Subscribers', description: 'Can manage newsletter subscribers' }
            ]
        },
        {
            name: 'Deals & Discounts',
            permissions: [
                { id: 'view_deals', name: 'View Deals', description: 'Can view deals and discounts' },
                { id: 'manage_deals', name: 'Manage Deals', description: 'Can create/edit/delete deals' }
            ]
        }
    ],
    rolesandpermissions: [
        {
            name: 'Manage Roles',
            permissions: [
                { id: 'view_roles', name: 'View Roles', description: 'Access to view roles' },
                { id: 'manage_roles', name: 'Manage Roles', description: 'Access to manage roles' }
            ]
        },
        {
            name: 'Permissions',
            permissions: [
                { id: 'view_permissions', name: 'View Permissions', description: 'Can View Permissions' },
                { id: 'manage_permissions', name: 'Manage Permissions', description: 'Can manage permissions' }
            ]
        }
    ],
    staticMeta: [
        {
            name: 'Static Meta Pages',
            permissions: [
                { id: 'view_static_meta', name: 'View Static Meta', description: 'Can view static meta pages' },
                { id: 'manage_static_meta', name: 'Manage Static Meta', description: 'Can create/edit/delete static meta pages' }
            ]
        }
    ]
};

// Export individual sections for convenience
export const STORE_PERMISSIONS = PERMISSION_GROUPS.store;
export const ROLES_PERMISSIONS = PERMISSION_GROUPS.rolesandpermissions;
export const STATIC_META_PERMISSIONS = PERMISSION_GROUPS.staticMeta;

// Helper to get all permission IDs
export const getAllPermissionIds = () => {
    const ids = [];
    Object.values(PERMISSION_GROUPS).forEach(section => {
        section.forEach(group => {
            group.permissions.forEach(permission => {
                ids.push(permission.id);
            });
        });
    });
    return ids;
};

// Helper to get permission by ID
export const getPermissionById = (id) => {
    for (const section of Object.values(PERMISSION_GROUPS)) {
        for (const group of section) {
            const permission = group.permissions.find(p => p.id === id);
            if (permission) return permission;
        }
    }
    return null;
};
