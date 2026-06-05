import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Tab } from "@headlessui/react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import LoadingBar from "react-top-loading-bar";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";

// Components
import ProductForm from "../../../components/NewProductComponents/ProductForm";
import ProductDescription from "../../../components/NewProductComponents/ProductDescription";
import ProductVariant from "../../../components/NewProductComponents/ProductVariant";
import GeneratedVariantsofProduct from "../../../components/NewProductComponents/GeneratedVariantsofProduct";
import ProductImages from "../../../components/NewProductComponents/ProductImages";
import ProductVariantImages from "../../../components/NewProductComponents/ProductVariantImages";
import ProductVariantDescription from "../../../components/NewProductComponents/ProductVariantDescription";
import ProductSpecs from "../../../components/NewProductComponents/ProductSpecs";
import Switches from "../../../components/NewProductComponents/Switches";
import ProductComesWithSelector from "../../../components/EditProductComponents/ProductComesWithSelector";
import ProductBattery from "../../../components/NewProductComponents/ProductBattery";
import SimOptionsandLowStockQuantity from "../../../components/NewProductComponents/SimOptionsandLowStockQuantity";
import SingleProduct from "../../../components/NewProductComponents/SingleProduct";

// Services
import NewProductService from "./service/newProductService";
import ProductApi from "./api/productApi";

export default function NewProduct() {
  const navigate = useNavigate();
  const [selectedPage, setSelectedPage] = useState("new-product");
  const [progress, setProgress] = useState(0);

  // Initialize API and Service
  const productApi = useMemo(() => new ProductApi(), []);
  const newProductService = useMemo(() => new NewProductService(), []);

  // Refs
  const summaryEditor = useRef(null);
  const descriptionEditor = useRef(null);

  // Basic State
  const [modal, setModal] = useState({});
  const [ProductType, setProductType] = useState("variantProduct");

  // Form State
  const [productName, setProductName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [productSubCategory, setProductSubCategory] = useState({});
  const [productTag, setProductTag] = useState("");
  const [productCondition, setProductCondition] = useState("");
  const [productBrand, setProductBrand] = useState("");

  // Product Description
  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");

  // Single Product State
  const [productCost, setProductCost] = useState("");
  const [productSalePrice, setProductSalePrice] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productQty, setProductQty] = useState("");
  const [productSKU, setProductSKU] = useState("");
  const [productEIN, setProductEIN] = useState("");
  const [productMPN, setProductMPN] = useState("");

  // Images State
  const [ProductThumbnailImage, setProductThumbnailImage] = useState(null);
  const [productGalleryImages, setProductGalleryImages] = useState([]);

  // Meta State (Single Product)
  const [productMetaTitle, setproductMetaTitle] = useState("");
  const [productMetaDescription, setproductMetaDescription] = useState("");
  const [productMetaKeywords, setproductMetaKeywords] = useState("");
  const [productMetaSchema, setproductMetaSchema] = useState("");
  const [productMetaImage, setproductMetaImage] = useState(null);

  // Variant State
  const [variants, setVariants] = useState([]);
  const [generatedVariants, setGeneratedVariants] = useState([]);
  const [variantValues, setVariantValues] = useState({});
  const [variantNames, setVariantNames] = useState({});
  const [attributes, setAttributes] = useState([]);
  const [variantDescAttr, setVariantDescAttr] = useState([]);
  const [selectedAttr, setSelectedAttr] = useState(null);
  const [selectedVariantDescAttr, setSelectedVariantDescAttr] = useState(null);
  const [variantImages, setVariantImages] = useState({});
  const [variantDesc, setVariantDesc] = useState({});

  // Switches State
  const [authentic, setAuthentic] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [refundable, setRefundable] = useState(false);
  const [warranty, setWarranty] = useState(false);
  const [replacementWarranty, setReplacementWarranty] = useState(false);
  const [warrantyDuration, setWarrantyDuration] = useState("");
  const [warrantyType, setWarrantyType] = useState("Days");
  const [refundDuration, setrefundDuration] = useState("");
  const [refundType, setrefundType] = useState("Days");
  const [perksAndBenefits, setPerksAndBenefits] = useState(false);

  // Comes With State - array of slugs from VariantAttribute system
  const [comesWithItems, setComesWithItems] = useState([]);
  // Wrapper product object for ProductComesWithSelector
  const comesWithProduct = { comesWithItems };
  const setComesWithProduct = (updatedProduct) => {
    setComesWithItems(updatedProduct.comesWithItems || []);
  };

  // Battery State
  const [battery, setBattery] = useState(false);
  const [batteryPrice, setBatteryPrice] = useState("");

  // SIM Options & Low Stock
  const [simOption, setSimOption] = useState(null);
  const [lowStockQty, setLowStockQty] = useState(1);

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

  const handleOptionChange = (simOption) => {
    setSimOption(simOption);
  };

  // Specifications State
  const [specs, setSpecs] = useState([]);
  const [specifications, setSpecifications] = useState([]);

  // Dropdown Data State
  const [categories, setCategories] = useState([]);
  const [tags, settags] = useState([]);
  const [condition, setCondition] = useState([]);
  const [brands, setBrands] = useState([]);

  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const toggleDropdown = (postId) => {
    setModal((prevState) => ({
      ...prevState,
      [postId]: !prevState[postId],
    }));
  };

  // Fetch Dropdown Data
  async function getCategories() {
    setProgress(50);
    try {
      const response = await productApi.getCategories();
      if (response.data.status === 201) {
        const filteredCategories = response.data.productCategories.filter(
          (category) => category.isPublish
        );
        setCategories(filteredCategories);
        if (filteredCategories.length > 0) {
          setProductCategory(filteredCategories[0].name);
        }
        setProgress(100);
      } else {
        toast.error(response.data.message);
        setProgress(100);
      }
    } catch (error) {
      toast.error("Failed to fetch categories");
      setProgress(100);
    }
  }

  async function getCondition() {
    setProgress(50);
    try {
      // First get all variant attributes to find the condition attribute
      const attributesResponse = await productApi.getVariantAttributes();
      if (attributesResponse.data.status === 200) {
        const conditionAttribute = attributesResponse.data.variantAttributes.find(
          (attr) => attr.slug === "condition"
        );

        if (conditionAttribute) {
          // Fetch the values for the condition attribute
          const valuesResponse = await productApi.getVariantAttributeValues(conditionAttribute._id);
          if (valuesResponse.data.status === 200) {
            const conditionValues = valuesResponse.data.values || [];
            // Filter only active conditions and map to expected format
            const filteredConditions = conditionValues
              .filter((cond) => cond.isActive !== false)
              .map((cond) => ({
                name: cond.name,
                slug: cond.slug,
                isPublish: cond.isActive !== false
              }));
            setCondition(filteredConditions);
          }
        }
        setProgress(100);
      } else {
        toast.error("Failed to fetch conditions");
        setProgress(100);
      }
    } catch (error) {
      console.error("Error fetching conditions:", error);
      toast.error("Failed to fetch conditions");
      setProgress(100);
    }
  }

  async function getTags() {
    setProgress(50);
    try {
      const response = await productApi.getTags();
      if (response.data.status === 201) {
        const filteredTags = response.data.productTags.filter(
          (tag) => tag.isPublished
        );
        settags(filteredTags);
        if (filteredTags.length > 0) {
          setProductTag(filteredTags[0].name);
        }
        setProgress(100);
      } else {
        toast.error(response.data.message);
        setProgress(100);
      }
    } catch (error) {
      toast.error("Failed to fetch tags");
      setProgress(100);
    }
  }

  async function getBrands() {
    setProgress(50);
    try {
      // First get all variant attributes to find the brands attribute
      const attributesResponse = await productApi.getVariantAttributes();
      if (attributesResponse.data.status === 200) {
        const brandsAttribute = attributesResponse.data.variantAttributes.find(
          (attr) => attr.slug === "brands"
        );

        if (brandsAttribute) {
          // Fetch the values for the brands attribute
          const valuesResponse = await productApi.getVariantAttributeValues(brandsAttribute._id);
          if (valuesResponse.data.status === 200) {
            const brandValues = valuesResponse.data.values || [];
            // Filter only active brands and map to expected format
            const filteredBrands = brandValues
              .filter((brand) => brand.isActive !== false)
              .map((brand) => ({
                name: brand.name,
                slug: brand.slug,
                isPublish: brand.isActive !== false
              }));
            setBrands(filteredBrands);
          }
        }
        setProgress(100);
      } else {
        toast.error("Failed to fetch brands");
        setProgress(100);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Failed to fetch brands");
      setProgress(100);
    }
  }

  useEffect(() => {
    getTags();
    getCondition();
    getCategories();
    getBrands();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Image Handlers
  const handleProductThumbnailImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validation = newProductService.validateImage(file);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }
      setProductThumbnailImage(file);
    }
  };

  const handleProductGalleryImages = (event) => {
    const files = event.target.files;
    if (files) {
      const validation = newProductService.validateImages(files);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }
      setProductGalleryImages((prevImages) => [
        ...prevImages,
        ...validation.validFiles,
      ]);
    }
  };

  const handleDeleteImage = (index) => {
    const updatedImages = [...productGalleryImages];
    updatedImages.splice(index, 1);
    setProductGalleryImages(updatedImages);
  };

  const handleProductMetaImage = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validation = newProductService.validateImage(file);
      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }
      setproductMetaImage(file);
    }
  };

  // Variant Handlers
  const handleVariantImageChange = (option, files) => {
    setVariantImages((prevImages) => {
      const currentImages = prevImages[option] || [];
      const updatedImages = [...currentImages, ...Array.from(files)];
      return {
        ...prevImages,
        [option]: updatedImages,
      };
    });

    setVariantValues((prevValues) => {
      const updatedValues = { ...prevValues };
      generatedVariants.forEach((variant) => {
        if (variant.includes(option)) {
          const currentFiles = prevValues[variant]?.logo || [];
          const updatedFiles = [...currentFiles, ...Array.from(files)];
          updateVariantValue(variant, "logo", updatedFiles);
        }
      });
      return updatedValues;
    });
  };

  const handleVariantImageDelete = (option, index) => {
    setVariantImages((prevImages) => {
      const updatedImages = { ...prevImages };
      updatedImages[option] = updatedImages[option].filter(
        (_, imgIndex) => imgIndex !== index
      );
      return updatedImages;
    });

    setVariantValues((prevValues) => {
      const updatedValues = { ...prevValues };
      generatedVariants.forEach((variant) => {
        if (variant.includes(option)) {
          updatedValues[variant].logo = updatedValues[variant].logo.filter(
            (_, imgIndex) => imgIndex !== index
          );
        }
      });
      return updatedValues;
    });
  };

  const updateVariantValue = (variant, field, value) => {
    setVariantValues((prevState) => ({
      ...prevState,
      [variant]: {
        ...prevState[variant],
        [field]: value,
      },
    }));
  };

  const saveData = () => {
    const data = newProductService.processVariantData(variants);
    setAttributes(data);
    setVariantDescAttr(data);

    const generatedVariants = newProductService.generateVariants(data);
    setGeneratedVariants(generatedVariants);
    setVariantNames(data);

    toast.success("Variants Saved ✔");
  };

  // Specifications Handlers
  const saveSpecs = () => {
    const data = specs.map((spec) => ({
      key: document.getElementById(`specKey${spec.id}`).value,
      value: document.getElementById(`specValue${spec.id}`).value,
    }));
    setSpecifications(data);
    toast.success("Specifications Saved ✔");
  };

  const addNewSpec = () => {
    const newSpecId = specs.length > 0 ? specs[specs.length - 1].id + 1 : 0;
    const newSpec = {
      id: newSpecId,
      name: `spec ${newSpecId + 1}`,
    };
    setSpecs((prevSpecs) => [...prevSpecs, newSpec]);
  };

  const removeSpec = (specId) => {
    setSpecs((prevSpecs) => prevSpecs.filter((spec) => spec.id !== specId));
  };

  // Save Product
  const saveProduct = async (isDraft = false) => {
    console.log("========== PRODUCT CREATION STARTED ==========");
    console.log("isDraft:", isDraft);

    if (!productName || !productUrl) {
      console.error("Validation failed: Missing product name or URL");
      toast.error("Please fill in product name and URL");
      return;
    }

    if (!isDraft && !productBrand?.trim()) {
      toast.error("Please select a brand before publishing. You can save as draft without a brand.");
      return;
    }

    setProgress(50);

    try {
      const productData = {
        visibility: !isDraft, // true for publish, false for draft
        productName,
        productUrl,
        productCategory,
        productSubCategory,
        productTag,
        productCondition,
        productBrand,
        simOption,
        featured,
        authentic,
        lowStockQty,
        comesWithItems,
        battery,
        batteryPrice,
        ProductThumbnailImage,
        productGalleryImages,
        warranty,
        replacementWarranty,
        warrantyDuration,
        warrantyType,
        refundable,
        refundDuration,
        refundType,
        perksAndBenefits,
        ProductType,
        productCost,
        productSalePrice,
        productPrice,
        productQty,
        productSKU,
        productEIN,
        productMPN,
        specifications,
        summary,
        description,
        variantValues,
        variantNames,
        variantImages,
        attributes,
        variantDesc,
        productMetaTitle,
        productMetaDescription,
        productMetaKeywords,
        productMetaSchema,
        productMetaImage,
      };

      console.log("---------- PRODUCT DATA ----------");
      console.log("Basic Info:", {
        productName,
        productUrl,
        productCategory,
        productSubCategory,
        productCondition,
        productBrand,
        productTag,
      });
      console.log("Product Type:", ProductType);
      console.log("Variants Data:", {
        variantsCount: Object.keys(variantValues).length,
        variantValues,
        variantNames,
        attributes,
      });
      console.log("Generated Variants:", generatedVariants);
      console.log("Variant Images:", variantImages);
      console.log("Images:", {
        thumbnail: ProductThumbnailImage ? ProductThumbnailImage.name : null,
        galleryCount: productGalleryImages.length,
      });
      console.log("----------------------------------");

      console.log("Preparing FormData...");
      const formData = newProductService.prepareFormData(productData);

      // Log FormData contents
      console.log("---------- FORM DATA CONTENTS ----------");
      for (let [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`${key}: [File] ${value.name} (${value.size} bytes)`);
        } else if (typeof value === 'string' && value.length > 100) {
          console.log(`${key}: ${value.substring(0, 100)}... (${value.length} chars)`);
        } else {
          console.log(`${key}:`, value);
        }
      }
      console.log("----------------------------------------");

      console.log("Sending request to backend...");
      const response = await productApi.createProduct(formData);
      console.log("---------- BACKEND RESPONSE ----------");
      console.log("Status:", response.data.status);
      console.log("Message:", response.data.message);
      console.log("Product:", response.data.product);
      console.log("--------------------------------------");

      if (response.data.status === 201) {
        console.log("========== PRODUCT CREATED SUCCESSFULLY ==========");
        console.log("Product ID:", response.data.product?._id);
        toast.success(response.data.message);
        setProgress(100);

        // Get the created product ID from response
        const createdProductId =
          response.data.product?._id || response.data.productId;

        setTimeout(() => {
          if (isDraft && createdProductId) {
            // Navigate to edit mode if saved as draft
            navigate(`/admin/edit-product/${createdProductId}`);
          } else {
            // Navigate to all products if published
            navigate("/admin/all-products");
          }
        }, 2000);
      } else {
        console.error("========== PRODUCT CREATION FAILED ==========");
        console.error("Error Message:", response.data.message);
        console.error("Full Response:", response.data);
        toast.error(response.data.message);
        setProgress(100);
      }
    } catch (error) {
      console.error("========== PRODUCT CREATION ERROR ==========");
      console.error("Error:", error);
      console.error("Error Message:", error.message);
      console.error("Error Response:", error.response?.data);
      toast.error("Failed to create product");
      setProgress(100);
    }
  };

  return (
    <>
      <Helmet>
        <title>New Product</title>
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
              {/* Info Banner - Save as Draft Required */}
              <div className="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      Complete Basic Information & Pricing first
                    </p>
                    <p className="text-sm text-amber-600">
                      Fill in the product details and pricing, then click "Save & Continue Editing" to unlock all other tabs (Images, Settings, SEO, etc.)
                    </p>
                  </div>
                </div>
              </div>

              <Tab.Group>
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
                    disabled
                    className="w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap text-gray-400 cursor-not-allowed opacity-50"
                  >
                    🔒 Images & Media
                  </Tab>
                  <Tab
                    disabled
                    className="w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap text-gray-400 cursor-not-allowed opacity-50"
                  >
                    🔒 Product Details
                  </Tab>
                  <Tab
                    disabled
                    className="w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap text-gray-400 cursor-not-allowed opacity-50"
                  >
                    🔒 Settings
                  </Tab>
                  <Tab
                    disabled
                    className="w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap text-gray-400 cursor-not-allowed opacity-50"
                  >
                    🔒 SEO & Meta
                  </Tab>
                  <Tab
                    disabled
                    className="w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap text-gray-400 cursor-not-allowed opacity-50"
                  >
                    🔒 Reviews
                  </Tab>
                  <Tab
                    disabled
                    className="w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap text-gray-400 cursor-not-allowed opacity-50"
                  >
                    🔒 FAQs
                  </Tab>
                  <Tab
                    disabled
                    className="w-full rounded-lg py-2.5 px-2 text-sm font-medium leading-5 whitespace-nowrap text-gray-400 cursor-not-allowed opacity-50"
                  >
                    🔒 Related Products
                  </Tab>
                </Tab.List>

                <Tab.Panels className="mt-6" unmount={false}>
                  {/* Tab 1: Basic Information */}
                  <Tab.Panel className="space-y-5" unmount={false}>
                    <div className="flex flex-col gap-y-5">
                      <ProductForm
                        productName={productName}
                        setProductName={setProductName}
                        productUrl={productUrl}
                        setProductUrl={setProductUrl}
                        setProductCategory={setProductCategory}
                        setProductSubCategory={setProductSubCategory}
                        setProductCondition={setProductCondition}
                        setProductBrand={setProductBrand}
                        setProductTag={setProductTag}
                        tags={tags}
                        categories={categories}
                        condition={condition}
                        brands={brands}
                        productSubCategory={productSubCategory}
                      />
                      <ProductDescription
                        summary={summary}
                        summaryEditor={summaryEditor}
                        setSummary={setSummary}
                        description={description}
                        descriptionEditor={descriptionEditor}
                        setDescription={setDescription}
                      />
                    </div>
                  </Tab.Panel>

                  {/* Tab 2: Pricing & Inventory */}
                  <Tab.Panel className="space-y-5" unmount={false}>
                    {/* Product Type Toggle */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Type</h3>
                      <div className="flex items-center gap-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="productType"
                            value="singleProduct"
                            checked={ProductType === "singleProduct"}
                            onChange={(e) => setProductType(e.target.value)}
                            className="sr-only peer"
                          />
                          <div className={`px-6 py-3 rounded-lg border-2 transition-all ${
                            ProductType === "singleProduct"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                          }`}>
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                              </svg>
                              <span className="font-medium">Single Product</span>
                            </div>
                            <p className="text-xs mt-1 opacity-70">One product with fixed pricing</p>
                          </div>
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="productType"
                            value="variantProduct"
                            checked={ProductType === "variantProduct"}
                            onChange={(e) => setProductType(e.target.value)}
                            className="sr-only peer"
                          />
                          <div className={`px-6 py-3 rounded-lg border-2 transition-all ${
                            ProductType === "variantProduct"
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-gray-300 bg-white text-gray-600 hover:border-gray-400"
                          }`}>
                            <div className="flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3" />
                              </svg>
                              <span className="font-medium">Variant Product</span>
                            </div>
                            <p className="text-xs mt-1 opacity-70">Multiple variants with different options</p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Conditional Content Based on Product Type */}
                    {ProductType === "singleProduct" ? (
                      <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Pricing & Inventory</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {/* Cost */}
                          <div>
                            <label htmlFor="productCost" className="block text-sm font-medium text-gray-700 mb-2">
                              Cost
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                              <input
                                type="number"
                                id="productCost"
                                value={productCost}
                                onChange={(e) => setProductCost(e.target.value)}
                                className="block w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          {/* Price */}
                          <div>
                            <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700 mb-2">
                              Price
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                              <input
                                type="number"
                                id="productPrice"
                                value={productPrice}
                                onChange={(e) => setProductPrice(e.target.value)}
                                className="block w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          {/* Sale Price */}
                          <div>
                            <label htmlFor="productSalePrice" className="block text-sm font-medium text-gray-700 mb-2">
                              Sale Price
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">£</span>
                              <input
                                type="number"
                                id="productSalePrice"
                                value={productSalePrice}
                                onChange={(e) => setProductSalePrice(e.target.value)}
                                className="block w-full pl-8 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          {/* Quantity */}
                          <div>
                            <label htmlFor="productQty" className="block text-sm font-medium text-gray-700 mb-2">
                              Quantity
                            </label>
                            <input
                              type="number"
                              id="productQty"
                              value={productQty}
                              onChange={(e) => setProductQty(e.target.value)}
                              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                              placeholder="0"
                            />
                          </div>

                          {/* SKU */}
                          <div>
                            <label htmlFor="productSKU" className="block text-sm font-medium text-gray-700 mb-2">
                              SKU
                            </label>
                            <input
                              type="text"
                              id="productSKU"
                              value={productSKU}
                              onChange={(e) => setProductSKU(e.target.value)}
                              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                              placeholder="Enter SKU"
                            />
                          </div>

                          {/* EAN */}
                          <div>
                            <label htmlFor="productEIN" className="block text-sm font-medium text-gray-700 mb-2">
                              EAN
                            </label>
                            <input
                              type="text"
                              id="productEIN"
                              value={productEIN}
                              onChange={(e) => setProductEIN(e.target.value)}
                              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                              placeholder="Enter EAN"
                            />
                          </div>

                          {/* MPN */}
                          <div>
                            <label htmlFor="productMPN" className="block text-sm font-medium text-gray-700 mb-2">
                              MPN
                            </label>
                            <input
                              type="text"
                              id="productMPN"
                              value={productMPN}
                              onChange={(e) => setProductMPN(e.target.value)}
                              className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                              placeholder="Enter MPN"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-y-5">
                        <ProductVariant
                          variants={variants}
                          saveData={saveData}
                          setVariants={setVariants}
                        />
                        <GeneratedVariantsofProduct
                          generatedVariants={generatedVariants}
                          variantValues={variantValues}
                          updateVariantValue={updateVariantValue}
                          toggleDropdown={toggleDropdown}
                          modal={modal}
                          variantAttributes={variants}
                        />
                      </div>
                    )}
                  </Tab.Panel>

                  {/* Tab 3: Images & Media */}
                  <Tab.Panel className="space-y-5" unmount={false}>
                    <div className="flex flex-col gap-y-5">
                      <ProductImages
                        ProductThumbnailImage={ProductThumbnailImage}
                        setProductThumbnailImage={setProductThumbnailImage}
                        handleProductThumbnailImage={
                          handleProductThumbnailImage
                        }
                        productGalleryImages={productGalleryImages}
                        handleProductGalleryImages={handleProductGalleryImages}
                        handleDeleteImage={handleDeleteImage}
                      />
                      <ProductVariantImages
                        attributes={attributes}
                        selectedAttr={selectedAttr}
                        setSelectedAttr={setSelectedAttr}
                        handleVariantImageChange={handleVariantImageChange}
                        handleVariantImageDelete={handleVariantImageDelete}
                        variantImages={variantImages}
                      />
                      <ProductVariantDescription
                        variantDesc={variantDesc}
                        selectedVariantDescAttr={selectedVariantDescAttr}
                        setSelectedVariantDescAttr={
                          setSelectedVariantDescAttr
                        }
                        variantDescAttr={variantDescAttr}
                        setVariantDesc={setVariantDesc}
                      />
                    </div>
                  </Tab.Panel>

                  {/* Tab 4: Product Details */}
                  <Tab.Panel className="space-y-5" unmount={false}>
                    <div className="flex flex-col gap-y-5">
                      <ProductSpecs
                        specs={specs}
                        setSpecs={setSpecs}
                        addNewSpec={addNewSpec}
                        removeSpec={removeSpec}
                        saveSpecs={saveSpecs}
                      />
                    </div>
                  </Tab.Panel>

                  {/* Tab 5: Settings */}
                  <Tab.Panel className="space-y-5" unmount={false}>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                      <Switches
                        featured={featured}
                        setFeatured={setFeatured}
                        authentic={authentic}
                        setAuthentic={setAuthentic}
                        refundable={refundable}
                        setRefundable={setRefundable}
                        warranty={warranty}
                        setWarranty={setWarranty}
                        replacementWarranty={replacementWarranty}
                        setReplacementWarranty={setReplacementWarranty}
                        warrantyDuration={warrantyDuration}
                        setWarrantyDuration={setWarrantyDuration}
                        warrantyType={warrantyType}
                        setWarrantyType={setWarrantyType}
                        refundDuration={refundDuration}
                        setrefundDuration={setrefundDuration}
                        refundType={refundType}
                        setrefundType={setrefundType}
                        perksAndBenefits={perksAndBenefits}
                        setPerksAndBenefits={setPerksAndBenefits}
                      />
                      <SimOptionsandLowStockQuantity
                        setSimOption={setSimOption}
                        simOption={simOption}
                        simOptions={simOptions}
                        setLowStockQty={setLowStockQty}
                        lowStockQty={lowStockQty}
                        handleOptionChange={handleOptionChange}
                      />
                      <ProductComesWithSelector
                        product={comesWithProduct}
                        setProduct={setComesWithProduct}
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                      <ProductBattery
                        battery={battery}
                        setBattery={setBattery}
                        batteryPrice={batteryPrice}
                        setBatteryPrice={setBatteryPrice}
                      />
                    </div>
                  </Tab.Panel>

                  {/* Tab 6: SEO & Meta (For All Products) */}
                  <Tab.Panel className="space-y-5" unmount={false}>
                    <div className="flex flex-col gap-y-5">
                      <SingleProduct
                        productMetaTitle={productMetaTitle}
                        setproductMetaTitle={setproductMetaTitle}
                        productMetaDescription={productMetaDescription}
                        setproductMetaDescription={setproductMetaDescription}
                        productMetaImage={productMetaImage}
                        setproductMetaImage={setproductMetaImage}
                        handleProductMetaImage={handleProductMetaImage}
                        productMetaKeywords={productMetaKeywords}
                        setproductMetaKeywords={setproductMetaKeywords}
                        productMetaSchema={productMetaSchema}
                        setproductMetaSchema={setproductMetaSchema}
                      />
                    </div>
                  </Tab.Panel>

                  {/* Tab 7: Reviews */}
                  <Tab.Panel className="space-y-5" unmount={false}>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-12 h-12 text-gray-400"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Reviews Available After Save
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                          You can add and manage product reviews after the product is created.
                          Please save the product first using "Save as Draft" or "Publish" button,
                          then edit the product to access the Reviews tab.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                            />
                          </svg>
                          <span>Save the product to enable reviews management</span>
                        </div>
                      </div>
                    </div>
                  </Tab.Panel>

                  {/* Tab 8: FAQs */}
                  <Tab.Panel className="space-y-5" unmount={false}>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-12 h-12 text-gray-400"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          FAQs Available After Save
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                          You can add and manage product FAQs after the product is created.
                          Please save the product first using "Save as Draft" or "Publish" button,
                          then edit the product to access the FAQs tab.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                            />
                          </svg>
                          <span>Save the product to enable FAQs management</span>
                        </div>
                      </div>
                    </div>
                  </Tab.Panel>

                  {/* Tab 9: Related Products */}
                  <Tab.Panel className="space-y-5" unmount={false}>
                    <div className="bg-white rounded-lg shadow-md p-6">
                      <div className="text-center py-16">
                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-12 h-12 text-gray-400"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
                            />
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                          Related Products Available After Save
                        </h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                          You can add and manage related products after the product is created.
                          Please save the product first using "Save as Draft" or "Publish" button,
                          then edit the product to access the Related Products tab.
                        </p>
                        <div className="flex items-center justify-center gap-2 text-sm text-primary">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                            />
                          </svg>
                          <span>Save the product to enable Related Products management</span>
                        </div>
                      </div>
                    </div>
                  </Tab.Panel>
                </Tab.Panels>
              </Tab.Group>
            </div>

            {/* Sticky Action Buttons */}
            <div className="mt-6 flex items-center justify-center gap-x-6 sticky bottom-0 right-0 z-10 bg-white p-2 border-2 border-gray-200 rounded-md">
              <button
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary flex items-center gap-2"
                type="button"
                onClick={() => saveProduct(true)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Save & Continue Editing
              </button>
              <button
                className="rounded-md bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-500 shadow-sm cursor-not-allowed opacity-60"
                type="button"
                disabled
                title="Save as draft first to complete all product details before publishing"
              >
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Publish (Complete all tabs first)
                </span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
