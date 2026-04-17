/**
 * New Product Service
 * Handles all business logic for creating new products
 */
class NewProductService {
  /**
   * Validate single image file
   * @param {File} file - The image file to validate
   * @returns {Object} - { isValid: boolean, error: string }
   */
  validateImage(file) {
    if (!file) {
      return { isValid: false, error: "No file selected" };
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return { isValid: false, error: "Please select a JPEG, PNG, or WebP file." };
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { isValid: false, error: "File size exceeds 5MB limit." };
    }

    return { isValid: true };
  }

  /**
   * Validate multiple image files
   * @param {FileList} files - The image files to validate
   * @returns {Object} - { isValid: boolean, error: string, validFiles: Array }
   */
  validateImages(files) {
    if (!files || files.length === 0) {
      return { isValid: false, error: "No files selected", validFiles: [] };
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB
    const validFiles = [];
    const invalidFiles = [];

    Array.from(files).forEach((file) => {
      if (!validTypes.includes(file.type)) {
        invalidFiles.push({ file, reason: "Invalid file type" });
      } else if (file.size > maxSize) {
        invalidFiles.push({ file, reason: "File too large" });
      } else {
        validFiles.push(file);
      }
    });

    if (invalidFiles.length > 0) {
      return {
        isValid: false,
        error: `${invalidFiles.length} file(s) invalid (wrong type or >5MB)`,
        validFiles,
      };
    }

    return { isValid: true, validFiles };
  }

  /**
   * Generate variant combinations from variant data
   * @param {Array} variantsData - Array of variant options
   * @returns {Array} - Array of generated variant names
   */
  generateVariants(variantsData) {
    const generatedVariants = [];

    const generateVariantNames = (prefix, options) => {
      if (options.length === 0) {
        generatedVariants.push(prefix);
      } else {
        const currentOption = options[0];
        const remainingOptions = options.slice(1);

        currentOption.options.forEach((option) => {
          let optionValue = option.option;
          if (currentOption.name === "color" && option.colorcode) {
            optionValue = `${option.option}`;
          }

          const newPrefix = prefix ? `${prefix}-${optionValue}` : `${optionValue}`;
          generateVariantNames(newPrefix, remainingOptions);
        });
      }
    };

    generateVariantNames("", variantsData);
    return generatedVariants;
  }

  /**
   * Process variant data from form
   * @param {Array} variants - Array of variant objects
   * @returns {Array} - Processed variant data
   */
  processVariantData(variants) {
    return variants.map((variant) => {
      return {
        name: variant.selectedVariantOption,
        options: variant.options.map((option) => {
          if (variant.selectedVariantOption === "color") {
            return {
              option: `${option.name} (${option.colorcode})`,
            };
          } else {
            return {
              option: option.name,
            };
          }
        }),
      };
    });
  }

  /**
   * Build structured variant description
   * @param {Array} attributes - Variant attributes
   * @param {Object} variantDesc - Variant descriptions
   * @returns {Object} - Structured variant description
   */
  buildVariantDescription(attributes, variantDesc) {
    return attributes.reduce((acc, attribute) => {
      acc[attribute.name] = attribute.options.reduce((optionsAcc, option) => {
        optionsAcc[option.option] = variantDesc[option.option] || "";
        return optionsAcc;
      }, {});
      return acc;
    }, {});
  }

  /**
   * Prepare FormData for product creation
   * @param {Object} productData - All product data from state
   * @returns {FormData} - Prepared FormData object
   */
  prepareFormData(productData) {
    const formData = new FormData();

    // Basic product details
    formData.append("status", productData.visibility);
    formData.append("name", productData.productName);
    formData.append("producturl", productData.productUrl);
    formData.append("category", productData.productCategory);
    formData.append("subcategory", JSON.stringify(productData.productSubCategory));
    formData.append("tags", productData.productTag);
    formData.append("brand", productData.productBrand);
    formData.append("condition", productData.productCondition);
    formData.append("sim_option", productData.simOption);
    formData.append("is_featured", productData.featured);
    formData.append("is_authenticated", productData.authentic);
    formData.append("low_stock_quantity_alert", productData.lowStockQty);

    // Comes with accessories
    formData.append(
      "comes_with",
      JSON.stringify({
        powerAdapter: productData.powerAdapter,
        powerCable: productData.powerCable,
        protectionBundle: productData.protectionBundle,
        treePlanted: productData.treePlanted,
        hdmi: productData.hdmi,
        powerCableNewIncluded: productData.powerCableNewIncluded,
        onexcontroller: productData.onexcontroller,
        twoxcontroller: productData.twoxcontroller,
        freeSim: productData.freeSim,
        onexScreenProtector: productData.onexScreenProtector,
        onexBackCover: productData.onexBackCover,
      })
    );

    // Battery
    formData.append(
      "battery",
      JSON.stringify({
        status: productData.battery,
        batteryPrice: productData.batteryPrice,
      })
    );

    // Images
    if (productData.ProductThumbnailImage) {
      formData.append("thumbnail_image", productData.ProductThumbnailImage);
    }

    productData.productGalleryImages.forEach((image) => {
      formData.append("Gallery_Images", image);
    });

    // Warranty
    if (productData.warranty) {
      formData.append(
        "has_warranty",
        JSON.stringify({
          has_warranty: productData.warranty,
          has_replacement_warranty: productData.replacementWarranty,
          warranty_duration: productData.warrantyDuration,
          warranty_type: productData.warrantyType,
        })
      );
    }

    // Refundable
    if (productData.refundable) {
      formData.append(
        "is_refundable",
        JSON.stringify({
          is_refundable: productData.refundable,
          refund_duration: productData.refundDuration,
          refund_type: productData.refundType,
        })
      );
    }

    // Product type (single or variant)
    if (productData.ProductType === "singleProduct") {
      formData.append(
        "productType",
        JSON.stringify({
          type: "single",
          productCost: productData.productCost,
          productSalePrice: productData.productSalePrice,
          productPrice: productData.productPrice,
          productQty: productData.productQty,
          productSKU: productData.productSKU,
          productEIN: productData.productEIN,
          productMPN: productData.productMPN,
        })
      );
    } else {
      formData.append("productType", JSON.stringify({ type: "variant" }));
    }

    // Specifications
    formData.append("specifications", JSON.stringify(productData.specifications));

    // Product summary and description
    formData.append("Product_summary", productData.summary);
    formData.append("Product_description", productData.description);

    // Variant-specific data
    if (productData.ProductType === "variantProduct") {
      // Strip variant values (remove files)
      const strippedVariantValues = {};
      Object.entries(productData.variantValues).forEach(([variantKey, variantData]) => {
        strippedVariantValues[variantKey] = { ...variantData };
        delete strippedVariantValues[variantKey].metaImage;
        delete strippedVariantValues[variantKey].logo;
      });

      formData.append("variantValues", JSON.stringify(strippedVariantValues));
      formData.append("variantNames", JSON.stringify(productData.variantNames));

      // Variant meta images
      Object.entries(productData.variantValues).forEach(([variantKey, variantData]) => {
        if (variantData.metaImage) {
          formData.append(`variantMetaImage[${variantKey}]`, variantData.metaImage);
        }

        if (Array.isArray(variantData.logo)) {
          variantData.logo.forEach((logo) => {
            formData.append(`variantImages[${variantKey}]`, logo);
          });
        }
      });

      // Variant images by option
      Object.keys(productData.variantImages).forEach((key) => {
        productData.variantImages[key].forEach((file) => {
          formData.append(`varImg[${key}]`, file);
        });
      });

      // Variant descriptions
      const structuredVariantDesc = this.buildVariantDescription(
        productData.attributes,
        productData.variantDesc
      );
      formData.append("variantDesc", JSON.stringify(structuredVariantDesc));
    }

    // SEO and Meta for single products
    if (productData.ProductType === "singleProduct") {
      formData.append(
        "Seo_Meta",
        JSON.stringify({
          metaTitle: productData.productMetaTitle,
          metaDescription: productData.productMetaDescription,
          metaKeywords: productData.productMetaKeywords,
          metaSchemas: productData.productMetaSchema,
        })
      );

      if (productData.productMetaImage) {
        formData.append("metaImage", productData.productMetaImage);
      }
    }

    return formData;
  }

  /**
   * Format dropdown data for react-select
   * @param {Array} items - Array of items with name property
   * @param {string} filterKey - Key to check for published status (optional)
   * @returns {Array} - Formatted options array
   */
  formatDropdownOptions(items, filterKey = "isPublish") {
    if (!Array.isArray(items)) return [];

    return items
      .filter((item) => item[filterKey] === true || item[filterKey] === undefined)
      .map((item) => ({
        label: item.name,
        value: item.name,
      }));
  }

  /**
   * Get variant options based on variant name
   * @param {string} variantName - The variant name (condition, color, storage)
   * @param {Array} productsCondition - Array of conditions
   * @param {Array} productColor - Array of colors
   * @param {Array} productStorage - Array of storage options
   * @returns {Array} - Options array
   */
  getVariantOptions(variantName, productsCondition, productColor, productStorage) {
    switch (variantName) {
      case "condition":
        return productsCondition;
      case "color":
        return productColor;
      case "storage":
        return productStorage;
      default:
        return [];
    }
  }
}

export default NewProductService;
