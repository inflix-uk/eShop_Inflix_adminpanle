/**
 * Edit Product Service
 * Handles business logic and data transformation for editing products
 * Note: API calls have been moved to ProductApi class
 */

import { appendBlocksToFormData } from "../../blog-new/utils/appendBlocksToFormData";

// Constants
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

function appendProductDescriptionBlocksToFormData(formData, product) {
  appendBlocksToFormData(formData, product.Product_description_blocks, {
    jsonField: "Product_description_blocks",
    countField: "descriptionBlockImageCount",
    filePrefix: "descriptionBlockImages",
    imageFilenamePrefix: "product-desc-block",
  });
}

class EditProductService {
  constructor() {
    // Service class no longer needs baseURL - API calls are handled by ProductApi
  }

  /** Normalize attribute option slugs for consistent varImgGroup keys (excellent, black, 64gb). */
  normalizeVariantSlug(slug) {
    if (!slug) return "";
    return String(slug)
      .toLowerCase()
      .trim()
      .replace(/^variant\s+/, "")
      .replace(/_/g, "-")
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .replace(/-+/g, "-");
  }

  /** Merge duplicate varImgGroup rows and normalize group names after load/save. */
  normalizeVarImgGroup(varImgGroup) {
    if (!Array.isArray(varImgGroup)) return [];
    const merged = {};
    for (const group of varImgGroup) {
      const key = this.normalizeVariantSlug(group?.name);
      if (!key) continue;
      if (!merged[key]) {
        merged[key] = { name: key, varImg: [] };
      }
      for (const img of group.varImg || []) {
        const exists = merged[key].varImg.some(
          (existing) =>
            (existing?.url && img?.url && existing.url === img.url) ||
            (existing?.path && img?.path && existing.path === img.path)
        );
        if (!exists) merged[key].varImg.push(img);
      }
    }
    return Object.values(merged);
  }

  /**
   * Prepare form data for product update
   * @param {Object} product - The product object
   * @param {string} productUrl - The product URL
   * @param {Array} variantNames - The variant names array
   * @returns {FormData} - Prepared form data
   */
  prepareFormData(product, productUrl, variantNames) {
    const formData = new FormData();

    // Append standard fields
    formData.append("name", product.name);
    formData.append("producturl", productUrl);
    formData.append("category", product.category);
    formData.append("subcategory", product.subCategory);
    formData.append("mainCategory", product.mainCategory || "");
    formData.append("condition", product.condition);
    formData.append("brand", product.brand || "");
    formData.append("tags", product.tags || "");
    formData.append("sim_option", product.sim_options);
    formData.append("is_featured", product.is_featured);
    formData.append("seeAccessoriesWeDontNeed", product.seeAccessoriesWeDontNeed);
    formData.append("is_authenticated", product.is_authenticated);
    formData.append("low_stock_quantity_alert", product.low_stock_quantity_alert);
    formData.append("is_refundable", JSON.stringify(product.is_refundable));

    // Handle perks_and_benefits with image
    const perksData = product.perks_and_benefits || {};
    if (perksData.image instanceof File) {
      formData.append("perksImage", perksData.image);
      formData.append("perks_and_benefits", JSON.stringify({
        status: perksData.status || false,
        description: perksData.description || "",
        hasNewImage: true,
      }));
    } else {
      formData.append("perks_and_benefits", JSON.stringify({
        status: perksData.status || false,
        description: perksData.description || "",
        image: perksData.image || null,
      }));
    }

    // Handle topsection with images
    const topsectionData = (product.topsection || []).map((item, index) => {
      // If item has a File image, append it separately
      if (item.image instanceof File) {
        formData.append(`topsectionImage_${index}`, item.image);
        return {
          name: item.name,
          description: item.description,
          imageIndex: index,
        };
      }
      // If item has existing image URL
      if (item.image?.url) {
        return {
          name: item.name,
          description: item.description,
          image: item.image,
        };
      }
      return {
        name: item.name,
        description: item.description,
      };
    });
    formData.append("topsection", JSON.stringify(topsectionData));

    // comesWithItems - array of slugs from VariantAttribute system
    formData.append("comesWithItems", JSON.stringify(product.comesWithItems || []));

    // topSectionItems - array of slugs from VariantAttribute system
    formData.append("topSectionItems", JSON.stringify(product.topSectionItems || []));

    // selectOption - single slug from VariantAttribute system
    formData.append("selectOption", product.selectOption || "");

    formData.append("battery", JSON.stringify({
      status: product?.battery[0]?.status,
      batteryPrice: product?.battery[0]?.batteryPrice,
    }));

    formData.append("has_warranty", JSON.stringify(product.has_warranty));
    formData.append("specifications", JSON.stringify(product.product_Specifications));

    // Append product type
    formData.append("productType", JSON.stringify({
      "type": product.productType.type
    }));

    formData.append("Product_summary", product.Product_summary);
    formData.append("Product_description", product.Product_description);
    formData.append("status", product.status);
    formData.append("rating", product.rating);

    // Append thumbnail image handling
    if (product.thumbnail_image instanceof File) {
      formData.append("thumbnail_image", product.thumbnail_image);
    } else {
      formData.append("thumbnail_image", JSON.stringify(product.thumbnail_image));
    }

    // Handle single product type
    if (product.productType.type === "single") {
      const singleProductValues = {
        name: product.variantValues[0]?.name || "single",
        Cost: product.variantValues[0]?.Cost,
        Price: product.variantValues[0]?.Price,
        salePrice: product.variantValues[0]?.salePrice,
        Quantity: product.variantValues[0]?.Quantity,
        SKU: product.variantValues[0]?.SKU,
        EIN: product.variantValues[0]?.EIN,
        MPN: product.variantValues[0]?.MPN,
        attributes: Array.isArray(product.variantValues[0]?.attributes)
          ? product.variantValues[0].attributes
          : [],
      };

      formData.append("variantValues", JSON.stringify([singleProductValues]));

      // Append SEO metadata and meta image
      formData.append("Seo_Meta", JSON.stringify(product.Seo_Meta));
      if (product.meta_Image instanceof File) {
        formData.append("meta_Image", product.meta_Image);
      } else {
        formData.append("meta_Image", JSON.stringify(product.meta_Image));
      }
    }
    // Handle variant product type
    else if (product.productType.type === "variant") {
      const strippedVariantValues = {};
      product.variantValues.forEach((variant) => {
        // Extract name, metaImage, and variantImages to exclude them from otherData
        // eslint-disable-next-line no-unused-vars
        const { name, metaImage: _metaImage, variantImages: _variantImages, ...otherData } = variant;
        strippedVariantValues[name] = { ...otherData };
      });

      formData.append("variantValues", JSON.stringify(strippedVariantValues));
      formData.append("variantNames", JSON.stringify(variantNames));

      // Global deduplication: track ALL files sent to avoid any duplication
      const sentFileKeys = new Set();
      const getFileKey = (file) => `${file.name}_${file.size}_${file.lastModified}`;

      // Handle varImgGroup FIRST - this is the primary source for attribute-based images
      // Send new files only once per attribute value (e.g., per color, per condition, etc.)
      this.normalizeVarImgGroup(product.varImgGroup || []).forEach((group) => {
        const groupName = this.normalizeVariantSlug(group.name);
        (group.varImg || []).forEach((image) => {
          if (image instanceof File) {
            const fileKey = getFileKey(image);
            if (!sentFileKeys.has(fileKey)) {
              formData.append(`varImg[${groupName}]`, image);
              sentFileKeys.add(fileKey);
            }
          } else {
            formData.append(`varImg[${groupName}]`, JSON.stringify(image));
          }
        });
      });

      // Variant images are sent only via varImgGroup above (per attribute option slug).
      // Do not also send variantImages[full-variant-name] — backend would merge them into the wrong group.
      product.variantValues.forEach((variant) => {
        const variantName = variant.name;

        if (variant.metaImage) {
          if (variant.metaImage instanceof File) {
            const fileKey = getFileKey(variant.metaImage);
            if (!sentFileKeys.has(fileKey)) {
              formData.append(`variantMetaImage[${variantName}]`, variant.metaImage);
              sentFileKeys.add(fileKey);
            }
          } else {
            formData.append(`variantMetaImage[${variantName}]`, JSON.stringify(variant.metaImage));
          }
        }
      });

      // Append variant description
      formData.append('variantDesc', JSON.stringify(product?.variantDescription));

      // Append product-level SEO metadata and meta image for variant products
      formData.append("Seo_Meta", JSON.stringify(product.Seo_Meta));
      if (product.meta_Image instanceof File) {
        formData.append("meta_Image", product.meta_Image);
      } else {
        formData.append("meta_Image", JSON.stringify(product.meta_Image));
      }
    }

    // Handle gallery images
    product.Gallery_Images.forEach((image) => {
      if (image instanceof File) {
        formData.append("Gallery_Images", image);
      } else {
        formData.append("Gallery_Images", JSON.stringify(image));
      }
    });

    appendProductDescriptionBlocksToFormData(formData, product);

    return formData;
  }

  // ==================== DATA TRANSFORMATION UTILITIES ====================

  /**
   * Transform data arrays to label/value format for dropdowns
   * @param {Array} data - Array of items to transform
   * @param {string} type - Type of data (brands, conditions, tags, colors, storage)
   * @returns {Array} - Transformed array with label/value objects
   */
  transformToOptions(data, type) {
    if (!data || !Array.isArray(data)) return [];

    switch (type) {
      case 'brands':
      case 'conditions':
      case 'tags':
      case 'storage':
        return data.map(item => ({
          label: item.name,
          value: item.name
        }));

      case 'colors':
        return data.map(item => ({
          label: `${item.name} (${item.colorcode})`,
          value: `${item.name} (${item.colorcode})`
        }));

      default:
        return data;
    }
  }

  /**
   * Filter items that are published
   * @param {Array} items - Array of items to filter
   * @returns {Array} - Filtered array with only published items
   */
  filterPublishedItems(items) {
    if (!items || !Array.isArray(items)) return [];
    return items.filter(item => item.isPublish || item.isPublished);
  }

  /**
   * Map variant names from API response to the dynamic format
   * @param {Array} variantNames - Variant names from API
   * @returns {Array} - Mapped variant names array with dynamic attribute info
   */
  mapVariantNamesFromResponse(variantNames) {
    if (!variantNames || !Array.isArray(variantNames)) return [];

    console.log('[EditProductService] mapVariantNamesFromResponse - Processing', variantNames.length, 'variant attributes');

    return variantNames.map((variant, index) => {
      console.log(`[EditProductService] Attribute ${index + 1}: "${variant.name}" (slug: ${variant.attributeSlug})`);

      // Transform options to the new format with SEO-friendly slugs
      const rawOptions = (variant.options || []).map((opt, optIndex) => {
        // Handle both string options and object options
        if (typeof opt === 'string') {
          return {
            id: optIndex,
            name: opt,
            value: opt,
            slug: opt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-'),
            colorCode: null,
            models: [],
          };
        }
        // Convert existing underscore slugs to hyphen format
        const existingSlug = opt.slug || '';
        const seoSlug = existingSlug.includes('_')
          ? existingSlug.replace(/_/g, '-')
          : existingSlug || (opt.value || opt.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');
        return {
          id: optIndex,
          name: opt.value || opt.name || opt.option,
          value: opt.value || opt.name || opt.option,
          slug: seoSlug,
          colorCode: opt.colorCode || null,
          models: opt.models || [],
        };
      });

      // Deduplicate options by slug
      const seenSlugs = new Set();
      const uniqueOptions = rawOptions.filter(opt => {
        if (seenSlugs.has(opt.slug)) {
          console.log(`[EditProductService] Removing duplicate option with slug: "${opt.slug}" from attribute "${variant.name}"`);
          return false;
        }
        seenSlugs.add(opt.slug);
        return true;
      });

      // Re-index after deduplication
      uniqueOptions.forEach((opt, i) => { opt.id = i; });

      return {
        id: index,
        _id: variant._id,
        name: variant.name,
        // Support both old and new format
        selectedAttributeSlug: variant.attributeSlug || variant.name,
        selectedAttributeName: variant.attributeName || variant.name,
        selectedAttributeId: variant.attributeId || null,
        attributeSlug: variant.attributeSlug || variant.name,
        attributeId: variant.attributeId || null,
        hasModels: variant.hasModels || false,
        options: uniqueOptions,
      };
    });
  }

  /**
   * Get options for variant dropdowns
   * @deprecated This function is no longer used - variant options are now loaded dynamically from API
   * @param {string} variantName - Name of the variant attribute (any attribute slug)
   * @param {Array} attributeValues - Array of attribute values from VariantAttribute system
   * @returns {Array} - Options for the dropdown
   */
  getVariantOptions(variantName, attributeValues = []) {
    // Dynamic handling - no hardcoded attribute names
    // The attributeValues come from the VariantAttribute API
    return attributeValues.map(val => ({
      label: val.colorCode ? `${val.name} (${val.colorCode})` : val.name,
      value: val.name,
      slug: val.slug,
      colorCode: val.colorCode || null
    }));
  }

  // ==================== BUSINESS LOGIC FUNCTIONS ====================

  /**
   * Generate all variant combinations from variant data
   * Uses dynamic cartesian product to support any number of variant attributes
   * Supports both old format (name-based) and new format (selectedAttributeSlug-based)
   * @param {Array} variantsData - Array of variants with options
   * @param {Array} existingVariantValues - Existing variant values from product
   * @returns {Array} - Generated variant combinations
   */
  generateVariants(variantsData, existingVariantValues = []) {
    const generatedVariants = [];

    // Helper to generate SEO-friendly slug from string (hyphen format)
    const toSlug = (str) => {
      if (!str) return '';
      const result = String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-+/g, '-');
      console.log(`[EditProductService] toSlug: "${str}" => "${result}"`);
      return result;
    };

    // Helper to extract slug from option (handles both string and object formats)
    // Always normalizes to SEO-friendly format (underscores -> hyphens)
    const extractOptionSlug = (option) => {
      if (typeof option === 'string') return toSlug(option);
      if (typeof option === 'object' && option !== null) {
        // Always normalize slug to SEO format (convert underscores to hyphens)
        const rawSlug = option.slug || option.value || option.name || option.label || '';
        return toSlug(rawSlug);
      }
      return toSlug(String(option));
    };

    // Filter out variants without valid attribute selection
    const validVariantsData = variantsData.filter(v => {
      const attrSlug = v.selectedAttributeSlug || v.attributeSlug || v.name;
      return attrSlug && (v.options || []).length > 0;
    });

    // Extract slug arrays from each variant attribute dynamically
    // Deduplicate options within each attribute to prevent duplicate variants
    const optionArrays = validVariantsData.map(v => {
      const slugs = (v.options || []).map(opt => extractOptionSlug(opt));
      // Remove duplicate slugs
      const uniqueSlugs = [...new Set(slugs)];
      if (slugs.length !== uniqueSlugs.length) {
        console.log(`[EditProductService] Removed ${slugs.length - uniqueSlugs.length} duplicate options from attribute "${v.selectedAttributeSlug || v.name}"`);
      }
      return uniqueSlugs;
    });

    // Check if we have valid options
    if (optionArrays.length === 0 || optionArrays.some(arr => arr.length === 0)) {
      return generatedVariants;
    }

    // Generate cartesian product of all options
    const cartesian = (arrays) => {
      return arrays.reduce((acc, curr) => {
        const result = [];
        acc.forEach(a => {
          curr.forEach(b => {
            result.push([...a, b]);
          });
        });
        return result;
      }, [[]]);
    };

    const allCombinations = cartesian(optionArrays);
    console.log('[EditProductService] Generated combinations:', allCombinations.length);

    // Helper to normalize variant name (underscore -> hyphen)
    const normalizeVariantName = (name) => {
      if (!name) return '';
      return name.toLowerCase().replace(/_/g, '-');
    };

    // Convert each combination to a variant object
    allCombinations.forEach(combo => {
      const variantName = combo.join('-');
      const normalizedNewName = normalizeVariantName(variantName);
      console.log(`[EditProductService] Variant combo: [${combo.join(', ')}] => "${variantName}"`);

      // First, try exact match (with normalization)
      let existingVariant = (existingVariantValues || []).find(variant =>
        normalizeVariantName(variant.name) === normalizedNewName
      );
      let matchType = existingVariant ? 'exact' : 'none';

      // If no exact match, try to find a partial match (for when new attributes are added)
      // This handles cases like: old "brand_new-red-32gb" -> new "brand-new-red-32gb-intel-i3"
      if (!existingVariant) {
        // Check if new name STARTS WITH an existing variant name (attribute added at end)
        existingVariant = (existingVariantValues || []).find(variant =>
          normalizedNewName.startsWith(normalizeVariantName(variant.name) + '-')
        );
        if (existingVariant) matchType = 'prefix';

        // Also check if existing name STARTS WITH new name (attribute removed - less common)
        if (!existingVariant) {
          existingVariant = (existingVariantValues || []).find(variant =>
            normalizeVariantName(variant.name).startsWith(normalizedNewName + '-')
          );
          if (existingVariant) matchType = 'suffix';
        }

        // Also check for partial overlap (attributes reordered or middle attributes changed)
        if (!existingVariant) {
          const newParts = normalizedNewName.split('-');
          existingVariant = (existingVariantValues || []).find(variant => {
            const existingParts = normalizeVariantName(variant.name).split('-');
            // Count how many parts match
            let matchCount = 0;
            newParts.forEach(part => {
              if (existingParts.includes(part)) matchCount++;
            });
            // If most parts match (at least half), consider it a match
            return matchCount >= Math.ceil(Math.min(newParts.length, existingParts.length) / 2);
          });
          if (existingVariant) matchType = 'partial';
        }
      }

      if (existingVariant) {
        // Copy existing data but use the new name
        // Remove _id to avoid duplicate key issues when multiple new variants match same old variant
        // eslint-disable-next-line no-unused-vars
        const { _id, ...dataWithoutId } = existingVariant;
        generatedVariants.push({
          ...dataWithoutId,
          name: variantName,
          _tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        });
      } else {
        const defaultVariant = this.createDefaultVariantObject(variantName);
        defaultVariant._tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        generatedVariants.push(defaultVariant);
      }
    });

    // Final deduplication by variant name (normalized)
    const seenNames = new Set();
    const uniqueVariants = generatedVariants.filter(variant => {
      const normalizedName = normalizeVariantName(variant.name);
      if (seenNames.has(normalizedName)) {
        console.log(`[EditProductService] Removing duplicate variant: "${variant.name}" (normalized: "${normalizedName}")`);
        return false;
      }
      seenNames.add(normalizedName);
      return true;
    });

    if (generatedVariants.length !== uniqueVariants.length) {
      console.log(`[EditProductService] Removed ${generatedVariants.length - uniqueVariants.length} duplicate variants`);
    }

    return uniqueVariants;
  }

  /**
   * Create a default variant object with empty values
   * @param {string} name - Variant name
   * @returns {Object} - Default variant object
   */
  createDefaultVariantObject(name) {
    return {
      name,
      Cost: '',
      Price: '',
      salePrice: '',
      Quantity: '',
      SKU: '',
      EIN: '',
      MPN: '',
      variantImages: [],
      metaTitle: '',
      metaDescription: '',
      metaImage: null
    };
  }

  /**
   * Process variant changes and update variant descriptions
   * @param {Array} variants - Current variants from component (with selectedAttributeSlug format)
   * @param {Object} product - Product object
   * @param {Array} variantData - Transformed variant data
   * @returns {Object} - Object containing updated variants and variant descriptions
   */
  processVariantChanges(variants, product, variantData) {
    // generateVariants handles data preservation when attributes are added/changed
    const generatedVariants = this.generateVariants(variantData, product.variantValues);
    const updatedVariants = generatedVariants;

    // Transform variants to use attribute slug as key for descriptions
    // Handle both old format (name) and new format (selectedAttributeSlug)
    const transformedVariants = variants.map(v => ({
      ...v,
      name: v.selectedAttributeSlug || v.name,
      options: (v.options || []).map(opt => {
        if (typeof opt === 'string') return opt;
        return opt.slug || opt.name || opt.value;
      })
    }));

    // Update variant descriptions
    const updatedVariantDesc = this.updateVariantDescriptions(transformedVariants, product.variantDescription?.[0] || {});

    return {
      updatedVariants,
      updatedVariantDesc
    };
  }

  /**
   * Update variant descriptions based on current variants
   * @param {Array} variants - Current variants
   * @param {Object} currentDesc - Current variant descriptions
   * @returns {Object} - Updated variant descriptions
   */
  updateVariantDescriptions(variants, currentDesc) {
    const updatedVariantDesc = { ...currentDesc };

    // Remove entries for options that no longer exist
    Object.keys(updatedVariantDesc).forEach(variantName => {
      Object.keys(updatedVariantDesc[variantName]).forEach(option => {
        const variant = variants.find(v => v.name === variantName);
        if (variant && !variant.options.includes(option)) {
          delete updatedVariantDesc[variantName][option];
        }
      });
    });

    // Add any missing descriptions for new options (as arrays)
    variants.forEach(variant => {
      if (!updatedVariantDesc[variant.name]) {
        updatedVariantDesc[variant.name] = {};
      }
      variant.options.forEach(option => {
        if (!updatedVariantDesc[variant.name][option]) {
          updatedVariantDesc[variant.name][option] = [""];
        } else if (typeof updatedVariantDesc[variant.name][option] === "string") {
          // Migrate old string format to array format
          updatedVariantDesc[variant.name][option] = [updatedVariantDesc[variant.name][option]];
        }
      });
    });

    return updatedVariantDesc;
  }

  /**
   * Update variant names array
   * @param {Array} variantData - New variant data
   * @param {Array} productVariantNames - Current product variant names
   * @returns {Array} - Updated variant names
   */
  updateVariantNames(variantData, productVariantNames) {
    return variantData.map(variant => {
      const existingVariant = productVariantNames.find(v => v.name === variant.name);
      if (existingVariant) {
        return { ...existingVariant, options: variant.options };
      } else {
        return { ...variant, _id: null };
      }
    });
  }

  /**
   * Process specifications from product
   * @param {Array} specifications - Product specifications array
   * @returns {Array} - Processed specifications
   */
  processSpecifications(specifications) {
    if (!specifications || !Array.isArray(specifications)) return [];
    return specifications.map(spec => ({
      key: spec.key || '',
      value: spec.value || ''
    }));
  }

  // ==================== VALIDATION UTILITIES ====================

  /**
   * Validate a single image file
   * @param {File} file - Image file to validate
   * @returns {Object} - Validation result { isValid: boolean, error: string }
   */
  validateImage(file) {
    if (!file) {
      return { isValid: false, error: 'No file provided' };
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return {
        isValid: false,
        error: 'Please select a JPEG, PNG, or WEBP file.'
      };
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return {
        isValid: false,
        error: 'File size exceeds 10MB limit.'
      };
    }

    return { isValid: true, error: null };
  }

  /**
   * Validate multiple image files
   * @param {FileList|Array} files - Image files to validate
   * @returns {Object} - Validation result { isValid: boolean, error: string, validFiles: Array }
   */
  validateImages(files) {
    if (!files || files.length === 0) {
      return { isValid: false, error: 'No files provided', validFiles: [] };
    }

    const filesArray = Array.from(files);
    const validFiles = filesArray.filter(file =>
      ALLOWED_IMAGE_TYPES.includes(file.type)
    );

    if (validFiles.length === 0) {
      return {
        isValid: false,
        error: 'Please select JPEG, PNG, or WEBP files.',
        validFiles: []
      };
    }

    const imagesExceedingSize = validFiles.filter(file => file.size > MAX_IMAGE_SIZE);

    if (imagesExceedingSize.length > 0) {
      return {
        isValid: false,
        error: 'File size exceeds 10MB limit.',
        validFiles: []
      };
    }

    return { isValid: true, error: null, validFiles };
  }

  // ==================== HELPER FUNCTIONS ====================

  /**
   * Get images for a specific variant option
   * @param {Object} product - Product object
   * @param {string} option - Variant option slug (e.g., "red", "brand_new", "32gb")
   * @returns {Array} - Array of images for the option
   */
  getImagesForOption(product, option) {
    if (!product || !product.varImgGroup || !option) return [];

    const normalizedOption = this.normalizeVariantSlug(option);
    const variantGroup = product.varImgGroup.find(
      (group) => this.normalizeVariantSlug(group.name) === normalizedOption
    );
    return variantGroup?.varImg || [];
  }

  /**
   * Deep clone object preserving File and Blob objects
   * @param {*} obj - Object to clone
   * @returns {*} - Cloned object
   */
  deepCloneWithFiles(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof File || obj instanceof Blob) return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (Array.isArray(obj)) return obj.map(item => this.deepCloneWithFiles(item));

    const cloned = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = this.deepCloneWithFiles(obj[key]);
      }
    }
    return cloned;
  }

  /**
   * Process variant images - add or delete
   * @param {Object} product - Product object
   * @param {string} option - Variant option slug (e.g., "red", "brand_new", "32gb")
   * @param {Array|number} data - Images to add or index to delete
   * @param {string} action - 'add' or 'delete'
   * @returns {Object} - Updated product object
   */
  processVariantImages(product, option, data, action) {
    const updatedProduct = this.deepCloneWithFiles(product);
    const groupKey = this.normalizeVariantSlug(option);
    if (!groupKey) return updatedProduct;

    if (!Array.isArray(updatedProduct.varImgGroup)) {
      updatedProduct.varImgGroup = [];
    }

    const variantNameIncludesOption = (variantName) => {
      const parts = String(variantName || "").split("-");
      return parts.some((part) => this.normalizeVariantSlug(part) === groupKey);
    };

    if (action === "add") {
      const images = data;

      updatedProduct.variantValues.forEach((variant) => {
        if (variantNameIncludesOption(variant.name)) {
          variant.variantImages = [...(variant.variantImages || []), ...images];
        }
      });

      const variantGroup = updatedProduct.varImgGroup.find(
        (group) => this.normalizeVariantSlug(group.name) === groupKey
      );
      if (variantGroup) {
        variantGroup.name = groupKey;
        variantGroup.varImg = [...(variantGroup.varImg || []), ...images];
      } else {
        updatedProduct.varImgGroup.push({
          name: groupKey,
          varImg: images,
        });
      }
    } else if (action === "delete") {
      const imgIndex = data;

      const variantGroup = updatedProduct.varImgGroup.find(
        (group) => this.normalizeVariantSlug(group.name) === groupKey
      );
      if (variantGroup) {
        variantGroup.name = groupKey;
        variantGroup.varImg = (variantGroup.varImg || []).filter(
          (_, index) => index !== imgIndex
        );
      }

      updatedProduct.variantValues.forEach((variant) => {
        if (variantNameIncludesOption(variant.name)) {
          variant.variantImages = (variant.variantImages || []).filter(
            (_, index) => index !== imgIndex
          );
        }
      });
    }

    updatedProduct.varImgGroup = this.normalizeVarImgGroup(updatedProduct.varImgGroup);
    return updatedProduct;
  }

  /**
   * Sync variant images with image groups
   * Dynamically matches ANY attribute value from the variant name with image groups
   * No longer assumes a specific attribute position
   * @param {Array} variantValues - Variant values array
   * @param {Array} varImgGroup - Variant image groups
   * @returns {Array} - Updated variant values
   */
  syncVariantImagesWithGroup(variantValues, varImgGroup) {
    if (!variantValues || !Array.isArray(variantValues) || !varImgGroup) {
      return variantValues;
    }

    const normalizedGroups = this.normalizeVarImgGroup(varImgGroup);

    return variantValues.map((variant) => {
      const variantAttributes = String(variant.name || "").split("-");
      let matchedGroup = null;

      for (const attrValue of variantAttributes) {
        const key = this.normalizeVariantSlug(attrValue);
        matchedGroup = normalizedGroups.find(
          (group) => this.normalizeVariantSlug(group.name) === key && group.varImg?.length
        );
        if (matchedGroup) break;
      }

      return {
        ...variant,
        variantImages: matchedGroup ? matchedGroup.varImg : variant.variantImages || [],
      };
    });
  }

  /**
   * Update variant description for a specific option at a specific index
   * @param {Object} product - Product object
   * @param {string} selectedVariantDescAttr - Selected variant attribute slug (any dynamic attribute)
   * @param {string} option - Specific option name/slug
   * @param {number} index - Index of the description in the array
   * @param {string} description - Description text
   * @returns {Object} - Updated product object
   */
  updateVariantDescription(product, selectedVariantDescAttr, option, index, description) {
    const updatedProduct = this.deepCloneWithFiles(product);

    const variantDescGroup = updatedProduct.variantDescription.find(
      desc => desc[selectedVariantDescAttr]
    );

    if (variantDescGroup) {
      // Ensure the option exists and is an array
      if (!variantDescGroup[selectedVariantDescAttr][option]) {
        variantDescGroup[selectedVariantDescAttr][option] = [""];
      } else if (typeof variantDescGroup[selectedVariantDescAttr][option] === "string") {
        // Migrate old string format to array
        variantDescGroup[selectedVariantDescAttr][option] = [variantDescGroup[selectedVariantDescAttr][option]];
      }
      variantDescGroup[selectedVariantDescAttr][option][index] = description;
    } else {
      updatedProduct.variantDescription.push({
        [selectedVariantDescAttr]: { [option]: [description] }
      });
    }

    return updatedProduct;
  }

  /**
   * Add a new description to variant option
   * @param {Object} product - Product object
   * @param {string} selectedVariantDescAttr - Selected variant attribute
   * @param {string} option - Specific option name
   * @returns {Object} - Updated product object
   */
  addVariantDescription(product, selectedVariantDescAttr, option) {
    const updatedProduct = this.deepCloneWithFiles(product);

    const variantDescGroup = updatedProduct.variantDescription.find(
      desc => desc[selectedVariantDescAttr]
    );

    if (variantDescGroup) {
      if (!variantDescGroup[selectedVariantDescAttr][option]) {
        variantDescGroup[selectedVariantDescAttr][option] = [""];
      } else if (typeof variantDescGroup[selectedVariantDescAttr][option] === "string") {
        // Migrate old string format to array and add new empty entry
        variantDescGroup[selectedVariantDescAttr][option] = [variantDescGroup[selectedVariantDescAttr][option], ""];
      } else {
        variantDescGroup[selectedVariantDescAttr][option].push("");
      }
    } else {
      updatedProduct.variantDescription.push({
        [selectedVariantDescAttr]: { [option]: [""] }
      });
    }

    return updatedProduct;
  }

  /**
   * Remove a description from variant option at specific index
   * @param {Object} product - Product object
   * @param {string} selectedVariantDescAttr - Selected variant attribute
   * @param {string} option - Specific option name
   * @param {number} index - Index to remove
   * @returns {Object} - Updated product object
   */
  removeVariantDescription(product, selectedVariantDescAttr, option, index) {
    const updatedProduct = this.deepCloneWithFiles(product);

    const variantDescGroup = updatedProduct.variantDescription.find(
      desc => desc[selectedVariantDescAttr]
    );

    if (variantDescGroup && variantDescGroup[selectedVariantDescAttr][option]) {
      // Ensure it's an array
      if (typeof variantDescGroup[selectedVariantDescAttr][option] === "string") {
        variantDescGroup[selectedVariantDescAttr][option] = [variantDescGroup[selectedVariantDescAttr][option]];
      }

      // Only remove if there's more than one description
      if (variantDescGroup[selectedVariantDescAttr][option].length > 1) {
        variantDescGroup[selectedVariantDescAttr][option].splice(index, 1);
      }
    }

    return updatedProduct;
  }
}

export default EditProductService;
