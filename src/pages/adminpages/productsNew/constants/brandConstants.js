/** URL/API key for products with no brand assigned */
export const UNASSIGNED_BRAND_KEY = '__unassigned__';

/** Display label for the unassigned brand bucket */
export const UNASSIGNED_BRAND_LABEL = 'Unassigned brand';

/** URL key for the every-product view (no brand filter) */
export const ALL_PRODUCTS_KEY = '__all__';

/** Display label for the every-product view */
export const ALL_PRODUCTS_LABEL = 'All';

export function isAllProductsKey(value) {
  return value === ALL_PRODUCTS_KEY;
}

export function isUnassignedBrandKey(value) {
  return value === UNASSIGNED_BRAND_KEY;
}

export function isProductMissingBrand(product) {
  const brand = product?.brand;
  return brand == null || String(brand).trim() === '';
}

export function getBrandDisplayName(brandKey) {
  if (isAllProductsKey(brandKey)) return ALL_PRODUCTS_LABEL;
  return isUnassignedBrandKey(brandKey) ? UNASSIGNED_BRAND_LABEL : brandKey;
}
