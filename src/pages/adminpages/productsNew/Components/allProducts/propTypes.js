import PropTypes from 'prop-types';

// Shared PropType definitions for consistency across components

export const ProductPropType = PropTypes.shape({
  _id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  condition: PropTypes.string.isRequired,
  is_featured: PropTypes.bool.isRequired,
  status: PropTypes.bool.isRequired,
  producturl: PropTypes.string.isRequired,
  brand: PropTypes.string,
  Product_summary: PropTypes.string,
  shipping_cost: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tax_rate: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  low_stock_quantity_alert: PropTypes.number,
  productType: PropTypes.shape({
    type: PropTypes.string
  }),
  thumbnail_image: PropTypes.shape({
    path: PropTypes.string
  }),
  Gallery_Images: PropTypes.arrayOf(PropTypes.shape({
    path: PropTypes.string
  })),
  variantValues: PropTypes.arrayOf(PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    SKU: PropTypes.string,
    Price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    salePrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    Quantity: PropTypes.number,
    EIN: PropTypes.string,
    MPN: PropTypes.string,
    variantImages: PropTypes.arrayOf(PropTypes.shape({
      path: PropTypes.string
    }))
  })).isRequired
});

export const AuthPropType = PropTypes.shape({
  ip: PropTypes.string.isRequired
});

export const VariantPropType = PropTypes.shape({
  _id: PropTypes.string,
  name: PropTypes.string,
  SKU: PropTypes.string,
  Price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  salePrice: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  Quantity: PropTypes.number,
  EIN: PropTypes.string,
  MPN: PropTypes.string,
  variantImages: PropTypes.arrayOf(PropTypes.shape({
    path: PropTypes.string
  }))
});

// Function PropTypes for event handlers
export const EventHandlerPropTypes = {
  onSearchChange: PropTypes.func.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onItemsPerPageChange: PropTypes.func.isRequired,
  onFeaturedChange: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onDuplicate: PropTypes.func.isRequired,
  onViewVariants: PropTypes.func.isRequired,
  onExportClick: PropTypes.func.isRequired,
  onAccessoriesClick: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

// State PropTypes
export const StatePropTypes = {
  searchQuery: PropTypes.string.isRequired,
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  itemsPerPage: PropTypes.number.isRequired,
  totalProducts: PropTypes.number.isRequired,
  filePath: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired
};