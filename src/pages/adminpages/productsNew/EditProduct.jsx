import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Tab } from "@headlessui/react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import LoadingBar from "react-top-loading-bar";
import { toast } from "react-toastify";
import ProductDescription from "../../../components/EditProductComponents/ProductDescription";
import ProductVariantDescription from "../../../components/EditProductComponents/ProductVariantDescription";
import ProductSingleType from "../../../components/EditProductComponents/ProductSingleType";
import ProductImages from "../../../components/EditProductComponents/ProductImages";
import ProductTypeDetail from "../../../components/EditProductComponents/ProductTypeDetail";
import ProductSingleMetaTags from "../../../components/EditProductComponents/ProductSingleMetaTags";
import ProductSimOptions from "../../../components/EditProductComponents/ProductSimOptions";
import ProductComesWithSelector from "../../../components/EditProductComponents/ProductComesWithSelector";
import ProductTopSectionSelector from "../../../components/EditProductComponents/ProductTopSectionSelector";
import ProductBatteryPack from "../../../components/EditProductComponents/ProductBatteryPack";
import ProductSwitches from "../../../components/EditProductComponents/ProductSwitches";
import ProductSpecifications from "../../../components/EditProductComponents/ProductSpecifications";
import ProductLowStock from "../../../components/EditProductComponents/ProductLowStock";
import ProductEditForm from "../../../components/EditProductComponents/ProductEditForm";
import ProductVariantImages from "../../../components/EditProductComponents/ProductVariantImages";
import ProductVariants from "../../../components/EditProductComponents/ProductVariants";
import GeneratedVariants from "../../../components/EditProductComponents/GeneratedVariants";
import ProductReviews from "../../../components/EditProductComponents/ProductReviews";
import ProductFAQ from "../../../components/EditProductComponents/ProductFAQ";
import ProductRelatedProducts from "../../../components/EditProductComponents/ProductRelatedProducts";
import { Helmet } from "react-helmet-async";
import EditProductService from "./service/editProductService";
import ProductApi from "./api/productApi";
import { compressProductImages } from "../../../utils/imageCompression";

// Tab definitions with slugs for URL
const TABS = [
  { name: "Basic Information", slug: "basic-information" },
  { name: "Pricing & Inventory", slug: "pricing-inventory" },
  { name: "Images & Media", slug: "images-media" },
  { name: "Product Details", slug: "product-details" },
  { name: "Settings", slug: "settings" },
  { name: "SEO & Meta", slug: "seo-meta" },
  { name: "Reviews", slug: "reviews" },
  { name: "FAQs", slug: "faqs" },
  { name: "Related Products", slug: "related-products" },
];

export default function EditProduct() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedPage, setSelectedPage] = useState("products");
  const [isUpdating, setIsUpdating] = useState(false);

  // Get initial tab index from URL or default to 0
  const getInitialTabIndex = useCallback(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const index = TABS.findIndex((tab) => tab.slug === tabParam);
      return index >= 0 ? index : 0;
    }
    return 0;
  }, [searchParams]);

  const [selectedTabIndex, setSelectedTabIndex] = useState(getInitialTabIndex);

  // Handle tab change - update URL
  const handleTabChange = (index) => {
    setSelectedTabIndex(index);
    setSearchParams({ tab: TABS[index].slug }, { replace: true });
  };

  // Sync tab index when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      const index = TABS.findIndex((tab) => tab.slug === tabParam);
      if (index >= 0 && index !== selectedTabIndex) {
        setSelectedTabIndex(index);
      }
    }
  }, [searchParams, selectedTabIndex]);

  // Initialize API and Service with useMemo to prevent recreation on every render
  const productApi = useMemo(() => new ProductApi(), []);
  const editProductService = useMemo(() => new EditProductService(), []);

  const simOptions = [
    { id: "Single Sim", title: "Single Sim" },
    {
      id: "Dual Sim (Physical Dual Sim)",
      title: "Dual Sim (Physical Dual Sim)",
    },
    {
      id: "Dual Sim (Physical Sim + eSIM)",
      title: "Dual Sim (Physical Sim + eSIM)",
    },
    { id: "Dual eSim", title: "Dual eSim" },
    { id: "Wifi Only", title: "Wifi Only" },
    { id: "Wifi + Cellular", title: "Wifi + Cellular" },
  ];

  const handleSimOptionChange = (simOption) => {
    // setSimOption(simOption);
    setProduct({
      ...product,
      sim_options: simOption,
    });

    console.log(simOption);
  };
  const [progress, setProgress] = useState(0);

  const [modal, setModal] = useState({});

  const summaryEditor = useRef(null);
  const descriptionEditor = useRef(null);

  const [productUrl, setProductUrl] = useState("");

  // images
  const [ProductThumbnailImage, setProductThumbnailImage] = useState(null);
  const [productGalleryImages, setProductGalleryImages] = useState([]);

  // metaInfo
  const [productMetaImage, setproductMetaImage] = useState(null);

  const [variantNames, setVariantNames] = useState([]);

  const ProductTypes = [
    { id: "single", title: "Single Product" },
    { id: "variant", title: "Variant Product" },
  ];
  const [product, setProduct] = useState({});
  function getProduct() {
    setProgress(50);
    console.log("=== FETCHING PRODUCT ===");
    console.log("Product ID:", id);

    productApi
      .getProduct(id)
      .then((response) => {
        console.log("Response status:", response.data.status);
        console.log("Response message:", response.data.message);

        if (response.data.status === 201) {
          console.log(response.data.product);
          console.log("========== DEBUG: Product Loaded ==========");
          console.log("comesWithItems:", response.data.product.comesWithItems);
          console.log("topsection:", response.data.product.topsection);
          console.log("============================================");

          // Deduplicate variantValues by name before setting state
          const productData = response.data.product;
          if (productData.variantValues && Array.isArray(productData.variantValues)) {
            const seenNames = new Set();
            const uniqueVariants = productData.variantValues.filter(variant => {
              if (seenNames.has(variant.name)) {
                console.log(`[EditProduct] Removing duplicate variant: "${variant.name}"`);
                return false;
              }
              seenNames.add(variant.name);
              return true;
            });
            if (uniqueVariants.length !== productData.variantValues.length) {
              console.log(`[EditProduct] Removed ${productData.variantValues.length - uniqueVariants.length} duplicate variants from loaded product`);
            }
            productData.variantValues = uniqueVariants;
          }

          setProduct(productData);
          console.log("Variant Desc", response.data.product);

          // Use service to map variant names
          const variantsArr = editProductService.mapVariantNamesFromResponse(
            response.data.product.variantNames
          );
          setVariants(variantsArr);
          setVariantNames(variantsArr);
          setProgress(100);
        } else {
          console.error("Failed to get product:", response.data);
          toast.error(response.data.message || "Failed to get product");
          setProgress(100);
        }
      })
      .catch((error) => {
        console.error("Error fetching product data:", error);
        toast.error("Error fetching product: " + (error.message || "Unknown error"));
        setProgress(100);
      });
  }

  useEffect(() => {
    // Fetch the product data based on selectedProduct._id
    getProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // console.log('Variant Names', variantNames)
  // Conditions

  const [conditions, setConditions] = useState([]);
  const [selectedConditions, setSelectedConditions] = useState(null);

  useEffect(() => {
    getCondition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const defaultCondition = product?.condition?.split(",").map((con) => ({
      label: con,
      value: con,
    }));
    setSelectedConditions(defaultCondition ? defaultCondition[0] : null);
  }, [product?.condition]);

  const handleConditionChange = (selectedOption) => {
    setSelectedConditions(selectedOption);

    // Update the product condition
    setProduct((prevProduct) => ({
      ...prevProduct,
      condition: selectedOption ? selectedOption.value : "",
    }));
  };

  async function getCondition() {
    setProgress(50);
    try {
      // Use VariantAttribute system to fetch conditions
      const attributesResponse = await productApi.getVariantAttributes();
      if (attributesResponse.data.status === 200) {
        const conditionAttribute = attributesResponse.data.variantAttributes.find(
          (attr) => attr.slug === "condition"
        );

        if (conditionAttribute) {
          const valuesResponse = await productApi.getVariantAttributeValues(conditionAttribute._id);
          if (valuesResponse.data.status === 200) {
            const conditionValues = valuesResponse.data.values || [];
            const filteredConditions = conditionValues
              .filter((cond) => cond.isActive !== false)
              .map((cond) => ({
                label: cond.name,
                value: cond.name,
              }));
            setConditions(filteredConditions);
          }
        }
        setProgress(100);
      } else {
        toast.error("Failed to fetch conditions");
        setProgress(100);
      }
    } catch (error) {
      console.error("Error fetching conditions:", error);
      toast.error("Error fetching conditions");
      setProgress(100);
    }
  }

  // tags
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState(null);

  useEffect(() => {
    getTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const defaulttags = product?.tags?.split(",").map((tag) => ({
      label: tag,
      value: tag,
    }));
    setSelectedTags(defaulttags);
  }, [product?.tags]);

  const handleTagsChange = (selectedOption) => {
    setSelectedTags(selectedOption);
  };
  function getTags() {
    setProgress(50);
    productApi
      .getTags()
      .then((response) => {
        if (response.data.status === 201) {
          const filteredTags = response.data.productTags.filter(
            (tag) => tag.isPublished
          );
          setTags(
            filteredTags.map((tags) => ({
              label: tags.name,
              value: tags.name,
            }))
          );
          setProgress(100);
        } else {
          toast.error(response.data.message);
          setProgress(100);
        }
      })
      .catch((error) => {
        console.error("Error fetching tags:", error);
        toast.error("Failed to fetch tags");
        setProgress(100);
      });
  }

  // Brands
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    getBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function getBrands() {
    try {
      const attributesResponse = await productApi.getVariantAttributes();
      if (attributesResponse.data.status === 200) {
        const brandAttribute = attributesResponse.data.variantAttributes.find(
          (attr) => attr.slug === "brands"
        );

        if (brandAttribute) {
          const valuesResponse = await productApi.getVariantAttributeValues(brandAttribute._id);
          if (valuesResponse.data.status === 200) {
            const brandValues = valuesResponse.data.values || [];
            const filteredBrands = brandValues
              .filter((brand) => brand.isActive !== false)
              .map((brand) => ({
                name: brand.name,
              }));
            setBrands(filteredBrands);
          }
        }
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  }

  // Save Product
  const saveProduct = async () => {
    if (!product || !product._id) {
      toast.error("Product ID is missing. Cannot update the product.");
      return;
    }

    setIsUpdating(true);

    console.log(
      "\n╔════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║  [FRONTEND] SAVE PRODUCT - BEFORE SENDING TO BACKEND      ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝"
    );
    console.log("📦 Product Type:", product.productType?.type);

    if (product.productType?.type === "variant") {
      console.log("📊 Variant Values Status Check:");
      product.variantValues?.forEach((variant, index) => {
        const statusIcon = variant.status !== false ? "✅" : "❌";
        const statusValue =
          variant.status !== undefined ? variant.status : "undefined";
        console.log(`   [${index}] ${variant.name}`);
        console.log(`       Status: ${statusIcon} ${statusValue}`);
        console.log(
          `       Price: ${variant.Price}, Quantity: ${variant.Quantity}`
        );
      });
    }
    console.log(
      "═══════════════════════════════════════════════════════════\n"
    );

    setProgress(30);

    // Compress images before sending to reduce payload size
    // Vercel has 4.5MB limit, so we need aggressive compression for many images
    console.log("🗜️ Compressing images...");
    let compressedProduct;
    try {
      compressedProduct = await compressProductImages(product, {
        maxWidth: 800,      // Reduced from 1200
        maxHeight: 800,     // Reduced from 1200
        quality: 0.6,       // Reduced from 0.7
        maxSizeMB: 0.15,    // Target ~150KB per image (reduced from 0.3)
      });
      console.log("✅ Images compressed successfully");
    } catch (error) {
      console.error("⚠️ Image compression failed, using original images:", error);
      compressedProduct = product;
    }

    setProgress(50);

    // Prepare form data using the service
    const formData = editProductService.prepareFormData(
      compressedProduct,
      productUrl,
      variantNames
    );

    console.log(
      "\n╔════════════════════════════════════════════════════════════╗"
    );
    console.log(
      "║  [FRONTEND] FORMDATA PREPARED - SENDING TO BACKEND        ║"
    );
    console.log(
      "╚════════════════════════════════════════════════════════════╝"
    );

    // Check if variantValues is in FormData
    if (formData.has("variantValues")) {
      console.log("✅ variantValues found in FormData");
      try {
        const variantValuesFromForm = JSON.parse(formData.get("variantValues"));
        console.log("📊 Variant Values in FormData:");
        Object.keys(variantValuesFromForm).forEach((key) => {
          const variant = variantValuesFromForm[key];
          const statusIcon = variant.status !== false ? "✅" : "❌";
          console.log(
            `   ${key}: Status = ${statusIcon} ${
              variant.status !== undefined ? variant.status : "undefined"
            }`
          );
        });
      } catch (e) {
        console.log("⚠️ Could not parse variantValues from FormData");
      }
    } else {
      console.log("❌ variantValues NOT found in FormData");
    }
    console.log(
      "═══════════════════════════════════════════════════════════\n"
    );

    // Calculate and log estimated payload size
    let estimatedSize = 0;
    let fileCount = 0;
    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        estimatedSize += value.size;
        fileCount++;
        console.log(`📁 ${key}: ${(value.size / 1024).toFixed(1)}KB`);
      } else {
        estimatedSize += new Blob([value]).size;
      }
    }
    console.log(`📊 Total files: ${fileCount}`);
    console.log(`📊 Estimated payload size: ${(estimatedSize / 1024 / 1024).toFixed(2)}MB`);
    if (estimatedSize > 4.5 * 1024 * 1024) {
      console.warn("⚠️ Payload exceeds Vercel's 4.5MB limit! Request may fail.");
    }

    // Submit the form using the service
    productApi
      .updateProduct(id, formData)
      .then((response) => {
        if (response.data.status === 201) {
          console.log(
            "\n╔════════════════════════════════════════════════════════════╗"
          );
          console.log(
            "║  [FRONTEND] RESPONSE FROM BACKEND - SUCCESS               ║"
          );
          console.log(
            "╚════════════════════════════════════════════════════════════╝"
          );
          console.log("✅ Product updated successfully!");
          console.log("📦 Response:", response.data);
          console.log(
            "═══════════════════════════════════════════════════════════\n"
          );

          toast.success(response.data.message);
          setProgress(100);
          setIsUpdating(false);

          // Reload product data to show latest changes
          getProduct();
        } else {
          toast.error(response.data.message);
          setProgress(100);
          setIsUpdating(false);
        }
      })
      .catch((error) => {
        console.error(
          "\n╔════════════════════════════════════════════════════════════╗"
        );
        console.error(
          "║  [FRONTEND] ERROR FROM BACKEND                            ║"
        );
        console.error(
          "╚════════════════════════════════════════════════════════════╝"
        );
        console.error("❌ Error updating product:", error);
        console.error(
          "═══════════════════════════════════════════════════════════\n"
        );
        toast.error("Failed to update product");
        setProgress(100);
        setIsUpdating(false);
      });
  };
  // Specifications
  const saveSpecs = () => {
    const data = product.product_Specifications.map((spec, index) => {
      const specData = {
        key: document.getElementById(`specKey${index}`).value,
        value: document.getElementById(`specValue${index}`).value,
      };
      return specData;
    });
    setProduct((prevProduct) => ({
      ...prevProduct,
      product_Specifications: data,
    }));

    // console.log(data)
    // console.log(product)
    toast.success("Specifications Saved ✔");
  };

  const addNewSpec = () => {
    const newSpec = {
      key: "",
      value: "",
    };
    setProduct((prevProduct) => ({
      ...prevProduct,
      product_Specifications: [...prevProduct.product_Specifications, newSpec],
    }));
  };

  const removeSpec = (index) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      product_Specifications: prevProduct.product_Specifications.filter(
        (_, i) => i !== index
      ),
    }));
  };

  // Product Variants
  const [variants, setVariants] = useState([]);
  const saveVariants = () => {
    console.log("Variant Data:", variants);

    // Transform variants to the format expected by the service
    // Handle both old format (name as string) and new format (selectedAttributeSlug)
    const variantData = variants.map((variant) => {
      const attrSlug = variant.selectedAttributeSlug || variant.name;
      const attrName = variant.selectedAttributeName || variant.name;
      const attrId = variant.selectedAttributeId || variant.attributeId;

      // Transform options - handle both old format (string[]) and new format (object[])
      const transformedOptions = (variant.options || []).map((opt) => {
        if (typeof opt === 'string') {
          return {
            value: opt,
            name: opt,
            slug: opt.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          };
        }
        return {
          value: opt.name || opt.value,
          name: opt.name || opt.value,
          slug: opt.slug || (opt.name || opt.value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_'),
          colorCode: opt.colorCode || null,
          models: opt.models || [],
        };
      });

      return {
        name: attrSlug,
        selectedAttributeSlug: attrSlug,
        selectedAttributeName: attrName,
        selectedAttributeId: attrId,
        attributeId: attrId,
        attributeSlug: attrSlug,
        hasModels: variant.hasModels || false,
        options: transformedOptions,
      };
    });

    console.log("Transformed Variant Data", variantData);

    // Use service to process variant changes
    const { updatedVariants, updatedVariantDesc } =
      editProductService.processVariantChanges(variants, product, variantData);

    // Update product with new variants and descriptions
    setProduct((prevProduct) => ({
      ...prevProduct,
      variantValues: updatedVariants,
      variantDescription: [updatedVariantDesc],
    }));

    // Update variant names using service - now with full attribute info
    const updatedVariantNames = variantData.map((variant) => {
      const existingVariant = product.variantNames?.find(
        (v) => v.name === variant.name || v.attributeSlug === variant.attributeSlug
      );
      return {
        _id: existingVariant?._id || null,
        name: variant.name,
        attributeId: variant.attributeId,
        attributeSlug: variant.attributeSlug,
        hasModels: variant.hasModels,
        options: variant.options.map((opt) => ({
          value: opt.value || opt.name,
          slug: opt.slug,
          colorCode: opt.colorCode || null,
          models: opt.models || [],
        })),
      };
    });

    console.log("Updated Variant Names:", updatedVariantNames);

    setVariantNames(updatedVariantNames);

    toast.success("Variants Saved ");
  };

  const handleProductThumbnailImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Use service to validate image
      const validation = editProductService.validateImage(file);

      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      setProductThumbnailImage(URL.createObjectURL(file));
      setProduct({
        ...product,
        thumbnail_image: file,
      });
    }
  };

  const handleProductGalleryImages = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      // Use service to validate images
      const validation = editProductService.validateImages(files);

      if (!validation.isValid) {
        toast.error(validation.error);
        // Reset input so user can try again
        event.target.value = '';
        return;
      }

      // Append new images to existing gallery images
      const existingImages = product.Gallery_Images || [];
      const updatedGalleryImages = [...existingImages, ...validation.validFiles];

      setProductGalleryImages(updatedGalleryImages);

      setProduct({
        ...product,
        Gallery_Images: updatedGalleryImages,
      });

      // Show success message with count
      toast.success(`${validation.validFiles.length} image${validation.validFiles.length > 1 ? 's' : ''} added to gallery`);
    }
    // Reset input to allow selecting the same files again
    event.target.value = '';
    console.log(product);
  };

  const [selectedAttr, setSelectedAttr] = useState(null);

  // Auto-select attribute that has images
  useEffect(() => {
    console.log('=== DEBUG Auto-select useEffect ===');
    console.log('product?.varImgGroup?.length:', product?.varImgGroup?.length);
    console.log('variantNames?.length:', variantNames?.length);
    console.log('selectedAttr:', selectedAttr);

    if (product?.varImgGroup?.length > 0 && variantNames?.length > 0 && !selectedAttr) {
      let foundAttr = null;

      // Find which attribute has images saved
      for (const attr of variantNames) {
        console.log('Checking attr:', attr.name, 'options:', attr.options);
        const hasImages = attr.options?.some(opt => {
          const slug = opt.slug || opt.value?.toLowerCase().replace(/[^a-z0-9]+/g, '_');
          const found = product.varImgGroup.some(group => group.name === slug && group.varImg?.length > 0);
          console.log('  Option slug:', slug, 'hasImages:', found);
          return found;
        });
        if (hasImages) {
          foundAttr = attr.name;
          break;
        }
      }

      console.log('Setting selectedAttr to:', foundAttr || variantNames[0]?.name);
      // Set the attribute with images, or first one as fallback
      setSelectedAttr(foundAttr || variantNames[0]?.name);
    }
  }, [product?.varImgGroup, variantNames, selectedAttr]);

  // Function to handle image change
  const handleVariantImageChange = (option, files) => {
    // Use service to validate images
    const validation = editProductService.validateImages(files);

    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }

    const selectedImages = validation.validFiles;

    // Use service to process variant images
    const updatedProduct = editProductService.processVariantImages(
      product,
      option,
      selectedImages,
      "add"
    );
    setProduct(updatedProduct);
  };

  // // Function to handle image delete
  const handleVariantImageDelete = (option, imgIndex) => {
    // Use service to process variant image deletion
    const updatedProduct = editProductService.processVariantImages(
      product,
      option,
      imgIndex,
      "delete"
    );
    setProduct(updatedProduct);
  };

  const getImagesForOption = (option) => {
    console.log('=== DEBUG getImagesForOption ===');
    console.log('Looking for option:', option);
    console.log('product.varImgGroup:', product?.varImgGroup);
    const result = editProductService.getImagesForOption(product, option);
    console.log('Result:', result);
    return result;
  };

  useEffect(() => {
    if (
      product &&
      Array.isArray(product.variantValues) &&
      product.varImgGroup
    ) {
      // Use service to sync variant images with groups
      const updatedVariantValues =
        editProductService.syncVariantImagesWithGroup(
          product.variantValues,
          product.varImgGroup
        );

      // Only update the state if there's a change to avoid unnecessary re-renders
      if (
        JSON.stringify(updatedVariantValues) !==
        JSON.stringify(product.variantValues)
      ) {
        setProduct((prevProduct) => ({
          ...prevProduct,
          variantValues: updatedVariantValues,
        }));
      }
    }
    // productService is stable and doesn't need to be in dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.varImgGroup, product?.variantValues]);

  const [selectedVariantDescAttr, setSelectedVariantDescAttr] = useState(null);

  // Auto-select attribute that has descriptions
  useEffect(() => {
    if (product?.variantDescription?.length > 0 && variantNames?.length > 0 && !selectedVariantDescAttr) {
      const descGroup = product.variantDescription[0];
      let foundAttr = null;

      // Find which attribute has non-empty descriptions
      for (const attr of variantNames) {
        const attrDescs = descGroup?.[attr.name];
        if (attrDescs) {
          const hasContent = Object.values(attrDescs).some(desc => {
            if (Array.isArray(desc)) return desc.some(d => d && d.trim() !== '');
            return desc && desc.trim() !== '';
          });
          if (hasContent) {
            foundAttr = attr.name;
            break;
          }
        }
      }

      // Set the attribute with descriptions, or first one as fallback
      setSelectedVariantDescAttr(foundAttr || variantNames[0]?.name);
    }
  }, [product?.variantDescription, variantNames, selectedVariantDescAttr]);

  const handleVariantDescChange = (option, index, description) => {
    // Use service to update variant description
    const updatedProduct = editProductService.updateVariantDescription(
      product,
      selectedVariantDescAttr,
      option,
      index,
      description
    );

    setProduct(updatedProduct);
  };

  const handleAddVariantDesc = (option) => {
    const updatedProduct = editProductService.addVariantDescription(
      product,
      selectedVariantDescAttr,
      option
    );
    setProduct(updatedProduct);
  };

  const handleRemoveVariantDesc = (option, index) => {
    const updatedProduct = editProductService.removeVariantDescription(
      product,
      selectedVariantDescAttr,
      option,
      index
    );
    setProduct(updatedProduct);
  };

  const toggleDropdown = (postId) => {
    setModal((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  useEffect(() => {
    // Fetch all dropdown data once on component mount
    // Note: Variant options are now fetched dynamically in ProductVariants component
    getTags();
    getCondition();
    // These functions should only run once on mount, not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  return (
    <>
      <Helmet>
        <title>Edit Product</title>
      </Helmet>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <Side
        selectedPage={selectedPage}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        closeSidebar={closeSidebar}
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
        />
        <main className="py-5">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="my-10">
              <Tab.Group selectedIndex={selectedTabIndex} onChange={handleTabChange}>
                <Tab.List className="flex space-x-1 rounded-xl bg-primary/20 p-1 overflow-x-auto">
                  <Tab
                    className={({ selected }) =>
                      `w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap
                      ${
                        selected
                          ? "bg-white text-primary shadow"
                          : "text-gray-700 hover:bg-white/[0.12] hover:text-primary"
                      }`
                    }
                  >
                    📝 Basic Information
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap
                      ${
                        selected
                          ? "bg-white text-primary shadow"
                          : "text-gray-700 hover:bg-white/[0.12] hover:text-primary"
                      }`
                    }
                  >
                    💰 Pricing & Inventory
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap
                      ${
                        selected
                          ? "bg-white text-primary shadow"
                          : "text-gray-700 hover:bg-white/[0.12] hover:text-primary"
                      }`
                    }
                  >
                    🖼️ Images & Media
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap
                      ${
                        selected
                          ? "bg-white text-primary shadow"
                          : "text-gray-700 hover:bg-white/[0.12] hover:text-primary"
                      }`
                    }
                  >
                    📋 Product Details
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap
                      ${
                        selected
                          ? "bg-white text-primary shadow"
                          : "text-gray-700 hover:bg-white/[0.12] hover:text-primary"
                      }`
                    }
                  >
                    ⚙️ Settings
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap
                      ${
                        selected
                          ? "bg-white text-primary shadow"
                          : "text-gray-700 hover:bg-white/[0.12] hover:text-primary"
                      }`
                    }
                  >
                    🔍 SEO & Meta
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap
                      ${
                        selected
                          ? "bg-white text-primary shadow"
                          : "text-gray-700 hover:bg-white/[0.12] hover:text-primary"
                      }`
                    }
                  >
                    ⭐ Reviews
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap
                      ${
                        selected
                          ? "bg-white text-primary shadow"
                          : "text-gray-700 hover:bg-white/[0.12] hover:text-primary"
                      }`
                    }
                  >
                    ❓ FAQs
                  </Tab>
                  <Tab
                    className={({ selected }) =>
                      `w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap
                      ${
                        selected
                          ? "bg-white text-primary shadow"
                          : "text-gray-700 hover:bg-white/[0.12] hover:text-primary"
                      }`
                    }
                  >
                    🔗 Related Products
                  </Tab>
                </Tab.List>

                <Tab.Panels className="mt-6">
                  {/* Tab 1: Basic Information */}
                  <Tab.Panel className="space-y-5">
                    <div className="flex flex-col gap-y-5">
                      {/* form */}
                      <ProductEditForm
                        product={product}
                        setProduct={setProduct}
                        productUrl={productUrl}
                        setProductUrl={setProductUrl}
                        conditions={conditions}
                        selectedConditions={selectedConditions}
                        handleConditionChange={handleConditionChange}
                        tags={tags}
                        selectedTags={selectedTags}
                        handleTagsChange={handleTagsChange}
                        productApi={productApi}
                        brands={brands}
                      />
                      {/* Product Description */}
                      <ProductDescription
                        product={product}
                        setProduct={setProduct}
                        summaryEditor={summaryEditor}
                        descriptionEditor={descriptionEditor}
                      />
                    </div>
                  </Tab.Panel>

                  {/* Tab 2: Pricing & Inventory */}
                  <Tab.Panel className="space-y-5">
                    <div className="flex flex-col gap-y-5">
                      {/* Product Type Selector */}
                      <ProductTypeDetail
                        ProductTypes={ProductTypes}
                        product={product}
                        setProduct={setProduct}
                      />
                      {product?.productType?.type === "variant" ? (
                        <>
                          {/* Variant Definition */}
                          <ProductVariants
                            variants={variants}
                            setVariants={setVariants}
                            saveVariants={saveVariants}
                            existingVariantNames={product?.variantNames || []}
                          />
                          {/* Generated Variants Table */}
                          <GeneratedVariants
                            product={product}
                            setProduct={setProduct}
                            modal={modal}
                            toggleDropdown={toggleDropdown}
                          />
                        </>
                      ) : (
                        /* Single Product Pricing */
                        <ProductSingleType
                          product={product}
                          setProduct={setProduct}
                        />
                      )}
                    </div>
                  </Tab.Panel>

                  {/* Tab 3: Images & Media */}
                  <Tab.Panel className="space-y-5">
                    <div className="flex flex-col gap-y-5">
                      {/* Product Images */}
                      <ProductImages
                        product={product}
                        setProduct={setProduct}
                        ProductThumbnailImage={ProductThumbnailImage}
                        setProductThumbnailImage={setProductThumbnailImage}
                        handleProductThumbnailImage={
                          handleProductThumbnailImage
                        }
                        handleProductGalleryImages={handleProductGalleryImages}
                        setProductGalleryImages={setProductGalleryImages}
                        productGalleryImages={productGalleryImages}
                      />
                      {/* Variant Images & Description - Side by Side */}
                      {product?.productType?.type === "variant" && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          <ProductVariantImages
                            product={product}
                            setProduct={setProduct}
                            handleVariantImageDelete={handleVariantImageDelete}
                            selectedAttr={selectedAttr}
                            setSelectedAttr={setSelectedAttr}
                            getImagesForOption={getImagesForOption}
                            variantNames={variantNames}
                            handleVariantImageChange={handleVariantImageChange}
                          />
                          <ProductVariantDescription
                            product={product}
                            selectedVariantDescAttr={selectedVariantDescAttr}
                            setSelectedVariantDescAttr={
                              setSelectedVariantDescAttr
                            }
                            handleVariantDescChange={handleVariantDescChange}
                            handleAddVariantDesc={handleAddVariantDesc}
                            handleRemoveVariantDesc={handleRemoveVariantDesc}
                            variantNames={variantNames}
                          />
                        </div>
                      )}
                    </div>
                  </Tab.Panel>

                  {/* Tab 4: Product Details */}
                  <Tab.Panel className="space-y-5">
                    <div className="flex flex-col gap-y-5">
                      {/* Specifications */}
                      <ProductSpecifications
                        product={product}
                        setProduct={setProduct}
                        addNewSpec={addNewSpec}
                        removeSpec={removeSpec}
                        saveSpecs={saveSpecs}
                      />
                    </div>
                  </Tab.Panel>

                  {/* Tab 5: Settings */}
                  <Tab.Panel className="space-y-4">
                    {/* Main Settings Grid - 2 Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Left Column - Product Toggles, Low Stock & Battery */}
                      <div className="space-y-4">
                        {/* Product Switches */}
                        <ProductSwitches
                          product={product}
                          setProduct={setProduct}
                        />
                        {/* Low Stock Alert */}
                        <ProductLowStock
                          product={product}
                          setProduct={setProduct}
                        />
                        {/* Battery Pack */}
                        <ProductBatteryPack
                          product={product}
                          setProduct={setProduct}
                        />
                      </div>

                      {/* Right Column - Selectors */}
                      <div className="space-y-4">
                        {/* Comes With */}
                        <ProductComesWithSelector
                          product={product}
                          setProduct={setProduct}
                        />
                        {/* Top Section */}
                        <ProductTopSectionSelector
                          product={product}
                          setProduct={setProduct}
                        />
                        {/* Select Options */}
                        <ProductSimOptions
                          setProduct={setProduct}
                          product={product}
                        />
                      </div>
                    </div>
                  </Tab.Panel>

                  {/* Tab 6: SEO & Meta (For All Products) */}
                  <Tab.Panel className="space-y-5">
                    <div className="flex flex-col gap-y-5">
                      <ProductSingleMetaTags
                        product={product}
                        setProduct={setProduct}
                        productMetaImage={productMetaImage}
                        setproductMetaImage={setproductMetaImage}
                      />
                    </div>
                  </Tab.Panel>

                  {/* Tab 7: Reviews */}
                  <Tab.Panel className="space-y-5">
                    <ProductReviews productId={id} />
                  </Tab.Panel>

                  {/* Tab 8: FAQs */}
                  <Tab.Panel className="space-y-5">
                    <ProductFAQ productId={id} />
                  </Tab.Panel>

                  {/* Tab 9: Related Products */}
                  <Tab.Panel className="space-y-5">
                    <ProductRelatedProducts productId={id} />
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>

            <div className="mt-6 flex items-center justify-center sticky bottom-0 right-0 z-10 bg-white p-2 border-2 border-gray-200 rounded-md">
              <button
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={() => {
                  saveProduct();
                }}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
