/** URL/API key for products with no brand assigned */
export const UNASSIGNED_BRAND_KEY = '__unassigned__';

/** Display label for the unassigned brand bucket */
export const UNASSIGNED_BRAND_LABEL = 'Unassigned brand';

export function isUnassignedBrandKey(value) {
  return value === UNASSIGNED_BRAND_KEY;
}

export function isProductMissingBrand(product) {
  const brand = product?.brand;
  return brand == null || String(brand).trim() === '';
}

export function getBrandDisplayName(brandKey) {
  return isUnassignedBrandKey(brandKey) ? UNASSIGNED_BRAND_LABEL : brandKey;
}
