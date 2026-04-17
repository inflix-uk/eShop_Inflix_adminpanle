/**
 * Edit Product Service
 * Handles business logic and data transformation for editing products
 * Note: API calls have been moved to ProductApi class
 */

// Constants
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB

class EditProductService {
  constructor() {
    // Service class no longer needs baseURL - API calls are handled by ProductApi
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
    formData.append("brand", product.brand);
    formData.append("condition", product.condition);
    formData.append("tags", product.tags);
    formData.append("sim_option", product.sim_options);
    formData.append("is_featured", product.is_featured);
    formData.append("seeAccessoriesWeDontNeed", product.seeAccessoriesWeDontNeed);
    formData.append("is_authenticated", product.is_authenticated);
    formData.append("low_stock_quantity_alert", product.low_stock_quantity_alert);
    formData.append("is_refundable", JSON.stringify(product.is_refundable));

    formData.append("comes_with", JSON.stringify({
      'powerAdapter': product?.comes_With?.powerAdapter,
      'powerCable': product?.comes_With?.powerCable,
      'protectionBundle': product?.comes_With?.protectionBundle,
      'treePlanted': product?.comes_With?.treePlanted,
      'hdmi': product?.comes_With?.hdmi,
      'powerCableNewIncluded': product?.comes_With?.powerCableNewIncluded,
      'onexcontroller': product?.comes_With?.onexcontroller,
      'twoxcontroller': product?.comes_With?.twoxcontroller,
      'freeSim': product?.comes_With?.freeSim,
      'onexScreenProtector': product?.comes_With?.onexScreenProtector,
      'onexBackCover': product?.comes_With?.onexBackCover,
    }));

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
        Cost: product.variantValues[0]?.Cost,
        Price: product.variantValues[0]?.Price,
        salePrice: product.variantValues[0]?.salePrice,
        Quantity: product.variantValues[0]?.Quantity,
        SKU: product.variantValues[0]?.SKU,
        EIN: product.variantValues[0]?.EIN,
        MPN: product.variantValues[0]?.MPN,
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

      // Handle images for variants
      product.variantValues.forEach((variant) => {
        const variantName = variant.name;
        if (variant.metaImage) {
          if (variant.metaImage instanceof File) {
            formData.append(`variantMetaImage[${variantName}]`, variant.metaImage);
          } else {
            formData.append(`variantMetaImage[${variantName}]`, JSON.stringify(variant.metaImage));
          }
        }
        if (Array.isArray(variant.variantImages)) {
          variant.variantImages.forEach((variantImage) => {
            if (variantImage instanceof File) {
              formData.append(`variantImages[${variantName}]`, variantImage);
            } else {
              formData.append(`variantImages[${variantName}]`, JSON.stringify(variantImage));
            }
          });
        }
      });

      // Handle varImgGroup
      product.varImgGroup.forEach((group) => {
        group.varImg.forEach((image) => {
          if (image instanceof File) {
            formData.append(`varImg[${group.name}]`, image);
          } else {
            formData.append(`varImg[${group.name}]`, JSON.stringify(image));
          }
        });
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
   * Map variant names from API response
   * @param {Array} variantNames - Variant names from API
   * @returns {Array} - Mapped variant names array
   */
  mapVariantNamesFromResponse(variantNames) {
    if (!variantNames || !Array.isArray(variantNames)) return [];

    return variantNames.map(variant => ({
      _id: variant._id,
      name: variant.name,
      options: variant.options
    }));
  }

  /**
   * Get options for variant dropdowns
   * @param {string} variantName - Name of the variant (condition, color, storage)
   * @param {Array} productsCondition - Array of conditions
   * @param {Array} productColor - Array of colors
   * @param {Array} productStorage - Array of storage options
   * @returns {Array} - Options for the dropdown
   */
  getVariantOptions(variantName, productsCondition, productColor, productStorage) {
    if (variantName === 'condition') {
      return productsCondition.map(con => ({ label: con.name, value: con.name }));
    } else if (variantName === 'color') {
      return productColor.map(col => ({
        label: `${col.name} (${col.colorcode})`,
        value: `${col.name} (${col.colorcode})`
      }));
    } else if (variantName === 'storage') {
      return productStorage.map(sto => ({ label: sto.name, value: sto.name }));
    }
    return [];
  }

  // ==================== BUSINESS LOGIC FUNCTIONS ====================

  /**
   * Generate all variant combinations from variant data
   * @param {Array} variantsData - Array of variants with options
   * @param {Array} existingVariantValues - Existing variant values from product
   * @returns {Array} - Generated variant combinations
   */
  generateVariants(variantsData, existingVariantValues = []) {
    const generatedVariants = [];

    const conditionOptions = variantsData.find(option => option.name === 'condition')?.options || [];
    const colorOptions = variantsData.find(option => option.name === 'color')?.options || [];
    const storageOptions = variantsData.find(option => option.name === 'storage')?.options || [];

    conditionOptions.forEach(condition => {
      colorOptions.forEach(color => {
        storageOptions.forEach(storage => {
          const variantName = `${condition}-${color}-${storage}`;
          const existingVariant = existingVariantValues.find(variant => variant.name === variantName);

          if (existingVariant) {
            generatedVariants.push(existingVariant);
          } else {
            generatedVariants.push(this.createDefaultVariantObject(variantName));
          }
        });
      });
    });

    return generatedVariants;
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
   * @param {Array} variants - Current variants from component
   * @param {Object} product - Product object
   * @param {Array} variantData - Transformed variant data
   * @returns {Object} - Object containing updated variants and variant descriptions
   */
  processVariantChanges(variants, product, variantData) {
    const generatedVariants = this.generateVariants(variantData, product.variantValues);
    const existingVariantNames = product.variantValues.map(variant => variant.name);

    // Find new and removed variants
    const newVariants = generatedVariants.filter(variant =>
      !existingVariantNames.includes(variant.name)
    );
    const removedVariants = product.variantValues.filter(variant =>
      !generatedVariants.find(generatedVariant => generatedVariant.name === variant.name)
    );

    // Create new variant objects
    const newVariantObjects = newVariants.map(variant =>
      this.createDefaultVariantObject(variant.name)
    );

    // Update product.variantValues
    const updatedVariants = product.variantValues
      .filter(variant => !removedVariants.find(removedVariant => removedVariant.name === variant.name))
      .concat(newVariantObjects);

    // Update variant descriptions
    const updatedVariantDesc = this.updateVariantDescriptions(variants, product.variantDescription[0] || {});

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

    // Add any missing descriptions for new options
    variants.forEach(variant => {
      if (!updatedVariantDesc[variant.name]) {
        updatedVariantDesc[variant.name] = {};
      }
      variant.options.forEach(option => {
        if (!updatedVariantDesc[variant.name][option]) {
          updatedVariantDesc[variant.name][option] = "";
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
   * @param {string} option - Variant option (e.g., color name)
   * @returns {Array} - Array of images for the option
   */
  getImagesForOption(product, option) {
    if (!product || !product.varImgGroup) return [];

    const variantGroup = product.varImgGroup.find(group => group.name === option);
    return variantGroup ? variantGroup.varImg : [];
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
   * @param {string} option - Variant option (e.g., color name)
   * @param {Array|number} data - Images to add or index to delete
   * @param {string} action - 'add' or 'delete'
   * @returns {Object} - Updated product object
   */
  processVariantImages(product, option, data, action) {
    const updatedProduct = this.deepCloneWithFiles(product);

    if (action === 'add') {
      const images = data;

      // Update variantValues
      updatedProduct.variantValues.forEach(variant => {
        if (variant.name.includes(option)) {
          variant.variantImages = [...variant.variantImages, ...images];
        }
      });

      // Update varImgGroup
      const variantGroup = updatedProduct.varImgGroup.find(group => group.name === option);
      if (variantGroup) {
        variantGroup.varImg = [...variantGroup.varImg, ...images];
      } else {
        updatedProduct.varImgGroup.push({
          name: option,
          varImg: images
        });
      }
    } else if (action === 'delete') {
      const imgIndex = data;

      // Update varImgGroup
      const variantGroup = updatedProduct.varImgGroup.find(group => group.name === option);
      if (variantGroup) {
        variantGroup.varImg = variantGroup.varImg.filter((_, index) => index !== imgIndex);
      }

      // Update variantValues
      updatedProduct.variantValues.forEach(variant => {
        if (variant.name.includes(option)) {
          variant.variantImages = variant.variantImages.filter((_, index) => index !== imgIndex);
        }
      });
    }

    return updatedProduct;
  }

  /**
   * Sync variant images with image groups
   * @param {Array} variantValues - Variant values array
   * @param {Array} varImgGroup - Variant image groups
   * @returns {Array} - Updated variant values
   */
  syncVariantImagesWithGroup(variantValues, varImgGroup) {
    if (!variantValues || !Array.isArray(variantValues) || !varImgGroup) {
      return variantValues;
    }

    return variantValues.map(variant => {
      const variantAttributes = variant.name.split('-');
      const color = variantAttributes[1]; // Assuming color is the second attribute

      // Find the corresponding images in varImgGroup by matching the color
      const matchedGroup = varImgGroup.find(group => group.name === color);

      return {
        ...variant,
        variantImages: matchedGroup ? matchedGroup.varImg : variant.variantImages
      };
    });
  }

  /**
   * Update variant description for a specific option
   * @param {Object} product - Product object
   * @param {string} selectedVariantDescAttr - Selected variant attribute (condition, color, storage)
   * @param {string} option - Specific option name
   * @param {string} description - Description text
   * @returns {Object} - Updated product object
   */
  updateVariantDescription(product, selectedVariantDescAttr, option, description) {
    const updatedProduct = this.deepCloneWithFiles(product);

    const variantDescGroup = updatedProduct.variantDescription.find(
      desc => desc[selectedVariantDescAttr]
    );

    if (variantDescGroup) {
      variantDescGroup[selectedVariantDescAttr][option] = description;
    } else {
      updatedProduct.variantDescription.push({
        [selectedVariantDescAttr]: { [option]: description }
      });
    }

    return updatedProduct;
  }
}

export default EditProductService;
