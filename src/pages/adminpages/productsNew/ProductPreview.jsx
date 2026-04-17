import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../context/Auth";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { Helmet } from "react-helmet-async";
import LoadingBar from "react-top-loading-bar";
import ProductApi from "./api/productApi";

export default function ProductPreview() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const auth = useAuth();
  const productApi = useMemo(() => new ProductApi(), []);

  // Core states
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Image gallery states
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [showStockNotification, setShowStockNotification] = useState(true);

  // Variant selection states (matching frontend flow)
  const [selectedOptions, setSelectedOptions] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [conditionPrices, setConditionPrices] = useState([]);

  // State to store variant info from URL
  const [urlVariantInfo, setUrlVariantInfo] = useState(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Known condition names to help extract base product URL from slug
  const CONDITIONS = ["brand_new", "brand-new", "excellent", "good", "fair", "poor"];

  // Extract base product URL and variant info from the full slug
  const extractBaseProductUrl = useCallback((fullSlug) => {
    if (!fullSlug) return { baseUrl: "", variantInfo: null };

    // Try to find a condition in the slug to determine where variant info starts
    for (const condition of CONDITIONS) {
      const conditionIndex = fullSlug.toLowerCase().indexOf(`-${condition}-`);
      if (conditionIndex !== -1) {
        const baseUrl = fullSlug.substring(0, conditionIndex);
        const variantPart = fullSlug.substring(conditionIndex + 1); // Remove leading hyphen

        // Parse variant info: condition-color-storage
        const parts = variantPart.split("-");
        if (parts.length >= 3) {
          // Handle multi-word conditions like "brand_new"
          let conditionParts = [];
          let colorIndex = -1;

          // Find where condition ends (conditions use underscores, not hyphens between words)
          for (let i = 0; i < parts.length; i++) {
            if (parts[i].includes("_") || CONDITIONS.some(c => c.replace(/_/g, "-").startsWith(parts.slice(0, i + 1).join("-")))) {
              conditionParts.push(parts[i]);
              if (CONDITIONS.includes(parts.slice(0, i + 1).join("_")) || CONDITIONS.includes(parts[i])) {
                colorIndex = i + 1;
                break;
              }
            } else {
              colorIndex = i;
              break;
            }
          }

          if (colorIndex === -1) colorIndex = 1;

          const parsedCondition = parts[0].replace(/_/g, " "); // "brand_new" -> "brand new"
          const parsedColor = parts[colorIndex] || "";
          const parsedStorage = parts[colorIndex + 1] || "";

          return {
            baseUrl,
            variantInfo: {
              condition: parsedCondition,
              color: parsedColor,
              storage: parsedStorage
            }
          };
        }
      }
    }

    // Also check if slug ends with a condition (at the end)
    for (const condition of CONDITIONS) {
      if (fullSlug.toLowerCase().endsWith(`-${condition}`)) {
        // Format might be: producturl-storage-color-condition
        const conditionIndex = fullSlug.toLowerCase().lastIndexOf(`-${condition}`);
        const beforeCondition = fullSlug.substring(0, conditionIndex);
        const lastHyphen = beforeCondition.lastIndexOf("-");
        if (lastHyphen !== -1) {
          const secondLastHyphen = beforeCondition.lastIndexOf("-", lastHyphen - 1);
          if (secondLastHyphen !== -1) {
            const baseUrl = beforeCondition.substring(0, secondLastHyphen);
            const storage = beforeCondition.substring(secondLastHyphen + 1, lastHyphen);
            const color = beforeCondition.substring(lastHyphen + 1);
            const parsedCondition = condition.replace(/_/g, " ");

            return {
              baseUrl,
              variantInfo: {
                condition: parsedCondition,
                color: color,
                storage: storage
              }
            };
          }
        }
      }
    }

    // No variant info found, return full slug as base URL
    return { baseUrl: fullSlug, variantInfo: null };
  }, []);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setProgress(30);
      try {
        if (!slug) {
          console.log("No slug provided");
          setLoading(false);
          return;
        }

        // Extract base product URL and variant info from the full slug
        const { baseUrl, variantInfo } = extractBaseProductUrl(slug);
        console.log("Parsed slug:", { baseUrl, variantInfo, originalSlug: slug });

        // Store variant info for later use
        if (variantInfo) {
          setUrlVariantInfo(variantInfo);
        }

        // First try with base URL, then fall back to full slug
        let response = await productApi.getProductBySlug(baseUrl);

        if (!response?.data?.product && baseUrl !== slug) {
          console.log("Trying with full slug...");
          response = await productApi.getProductBySlug(slug);
        }

        setProgress(70);
        console.log("Product API response:", response?.data);

        if (response?.data?.product) {
          const productData = response.data.product;
          setProduct(productData);

          // Also fetch variant values
          if (productData._id) {
            try {
              const variantResponse = await productApi.getVariantValuesByProductId(productData._id);
              if (variantResponse?.data?.status === 200 && variantResponse.data.variantValues) {
                setProduct(prev => ({
                  ...prev,
                  variantValues: variantResponse.data.variantValues
                }));
              }
            } catch (err) {
              console.error("Error fetching variants:", err);
            }
          }
        } else {
          console.log("No product data in response");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
        setProgress(100);
      }
    };

    if (slug && auth?.ip) {
      fetchProduct();
    } else if (!slug) {
      setLoading(false);
    }
  }, [slug, auth?.ip, productApi]);

  // Get variant names in correct order (condition → storage → color)
  const orderedVariantNames = useMemo(() => {
    if (!product?.variantNames || !Array.isArray(product.variantNames)) return [];
    const order = ["condition", "storage", "color"];
    return [...product.variantNames].filter(Boolean).sort((a, b) => {
      const aName = a?.name?.trim()?.toLowerCase() || "";
      const bName = b?.name?.trim()?.toLowerCase() || "";
      const aIndex = order.indexOf(aName);
      const bIndex = order.indexOf(bName);
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
      return 0;
    });
  }, [product?.variantNames]);

  // Process option value (normalize) - handles both string and object options
  const processOptionValue = useCallback((variantName, optionValue) => {
    if (!optionValue) return "";
    let value = optionValue;
    if (typeof optionValue === 'object') {
      value = optionValue.value || optionValue.slug || "";
    }
    if (typeof value !== 'string') return "";
    let processedValue = value.trim();
    if (variantName?.toLowerCase() === "color") {
      processedValue = processedValue.replace(/\s*\(#\w+\)/, "").trim();
    }
    return processedValue.toLowerCase();
  }, []);

  // Check if variant selection is disabled
  const isVariantDisabled = useCallback((variantName) => {
    if (!variantName) return true;
    const name = variantName.toLowerCase();
    if (name === "condition") return false;
    if (name === "storage") {
      const condition = selectedOptions["condition"];
      return !condition || (typeof condition === 'string' && condition.trim() === "");
    }
    if (name === "color") {
      const condition = selectedOptions["condition"];
      const storage = selectedOptions["storage"];
      return !condition || !storage ||
        (typeof condition === 'string' && condition.trim() === "") ||
        (typeof storage === 'string' && storage.trim() === "");
    }
    return false;
  }, [selectedOptions]);

  // Check if option is sold out
  const checkIfSoldOut = useCallback((variantCombination) => {
    return variantCombination && (variantCombination.Quantity === null || variantCombination.Quantity === 0);
  }, []);

  // Update selected variant when options change
  const updateSelectedVariant = useCallback((newOptions) => {
    if (!product?.variantValues || !newOptions) return;

    const selectedStorage = newOptions["storage"] || "";
    const selectedColor = newOptions["color"] || "";
    const selectedCondition = newOptions["condition"] || "";

    // Find matching variant using attributes array or name parsing
    const matchedVariant = product.variantValues.find((variant) => {
      if (!variant) return false;

      // Try matching using attributes array (new format) - only if attributes has data
      if (variant.attributes && Array.isArray(variant.attributes) && variant.attributes.length > 0) {
        const conditionAttr = variant.attributes.find(a => a.attributeSlug === "condition" || a.attributeName === "condition");
        const storageAttr = variant.attributes.find(a => a.attributeSlug === "storage" || a.attributeName === "storage");
        const colorAttr = variant.attributes.find(a => a.attributeSlug === "color" || a.attributeName === "color");

        const variantCondition = (conditionAttr?.value || conditionAttr?.valueSlug || "").toLowerCase().replace(/_/g, " ");
        const variantStorage = (storageAttr?.value || storageAttr?.valueSlug || "").toLowerCase();
        const variantColor = (colorAttr?.value || colorAttr?.valueSlug || "").toLowerCase();

        const conditionMatch = !selectedCondition || selectedCondition === "" ||
          variantCondition === selectedCondition ||
          variantCondition.replace(/\s+/g, "_") === selectedCondition ||
          variantCondition.replace(/\s+/g, " ") === selectedCondition.replace(/_/g, " ");
        const storageMatch = !selectedStorage || selectedStorage === "" || variantStorage === selectedStorage;
        const colorMatch = !selectedColor || selectedColor === "" || variantColor === selectedColor;

        return conditionMatch && storageMatch && colorMatch;
      }

      // Fallback to name parsing (when attributes is empty or doesn't exist)
      // Variant name format: condition-color-storage (e.g., brand_new-green-32gb)
      if (!variant.name) return false;
      const nameParts = variant.name.toLowerCase().split("-");
      if (nameParts.length < 3) return false;

      const variantCondition = nameParts[0].replace(/_/g, " "); // "brand_new" -> "brand new"
      const variantColor = nameParts[1];
      const variantStorage = nameParts[2];

      const conditionMatch = !selectedCondition || selectedCondition === "" ||
        variantCondition === selectedCondition ||
        variantCondition === selectedCondition.replace(/_/g, " ");
      const storageMatch = !selectedStorage || selectedStorage === "" || variantStorage === selectedStorage;
      const colorMatch = !selectedColor || selectedColor === "" || variantColor === selectedColor;

      return conditionMatch && storageMatch && colorMatch;
    });

    setSelectedVariant(matchedVariant || null);

    // Calculate condition prices if storage is selected
    if (selectedStorage && selectedStorage !== "") {
      const filteredVariants = (product.variantValues || []).filter((variant) => {
        if (!variant) return false;

        // Use attributes array for matching - only if attributes has data
        if (variant.attributes && Array.isArray(variant.attributes) && variant.attributes.length > 0) {
          const storageAttr = variant.attributes.find(a => a.attributeSlug === "storage" || a.attributeName === "storage");
          const colorAttr = variant.attributes.find(a => a.attributeSlug === "color" || a.attributeName === "color");

          const variantStorage = (storageAttr?.value || storageAttr?.valueSlug || "").toLowerCase();
          const variantColor = (colorAttr?.value || colorAttr?.valueSlug || "").toLowerCase();

          if (!selectedColor || selectedColor === "") {
            return variantStorage === selectedStorage;
          }
          return variantColor === selectedColor && variantStorage === selectedStorage;
        }

        // Fallback to name parsing (when attributes is empty)
        // Variant name format: condition-color-storage (e.g., brand_new-green-32gb)
        if (!variant.name) return false;
        const nameParts = variant.name.toLowerCase().split("-");
        if (nameParts.length < 3) return false;

        const variantColor = nameParts[1];
        const variantStorage = nameParts[2];

        if (!selectedColor || selectedColor === "") {
          return variantStorage === selectedStorage;
        }
        return variantColor === selectedColor && variantStorage === selectedStorage;
      });

      const prices = filteredVariants.map((variant) => {
        // Use attributes array for condition - only if attributes has data
        if (variant.attributes && Array.isArray(variant.attributes) && variant.attributes.length > 0) {
          const conditionAttr = variant.attributes.find(a => a.attributeSlug === "condition" || a.attributeName === "condition");
          const condition = conditionAttr?.value || conditionAttr?.valueSlug || null;
          return {
            conditionName: condition,
            price: variant.Price,
            salePrice: variant.salePrice,
          };
        }
        // Fallback - parse condition from variant name (format: condition-color-storage)
        if (!variant.name) return { conditionName: null, price: variant.Price, salePrice: variant.salePrice };
        const nameParts = variant.name.split("-");
        const condition = nameParts[0] || null;
        return {
          conditionName: condition,
          price: variant.Price,
          salePrice: variant.salePrice,
        };
      });

      // Deduplicate by condition if no color selected
      const uniquePrices = !selectedColor || selectedColor === ""
        ? prices.filter((item, index, self) =>
            index === self.findIndex((t) => t.conditionName === item.conditionName)
          )
        : prices;

      setConditionPrices(uniquePrices);
    } else {
      setConditionPrices([]);
    }
  }, [product?.variantValues]);

  // Update URL when variant options change - matching website behavior
  const updateProductUrl = useCallback((currentOptions) => {
    if (!product || !product.producturl) return;

    const storage = currentOptions["storage"] || "";
    const color = currentOptions["color"] || "";
    const condition = currentOptions["condition"] || "";

    // Check if ALL required variants are selected (storage, color, condition)
    const hasAllRequiredVariants =
      storage &&
      color &&
      condition &&
      storage.trim() !== "" &&
      color.trim() !== "" &&
      condition.trim() !== "";

    if (!hasAllRequiredVariants) {
      // If not all variants selected, use base URL
      const expectedUrl = `/admin/preview-product/${product.producturl}`;
      if (window.location.pathname !== expectedUrl) {
        window.history.replaceState({}, "", expectedUrl);
      }
      return;
    }

    // Construct the variant name slug - matching database variant name format (condition-color-storage)
    // Format each part: spaces become underscores within parts, parts joined by hyphens
    const formatPart = (part) => {
      if (!part) return "";
      return part
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_") // "brand new" -> "brand_new"
        .replace(/[^a-zA-Z0-9_]/g, ""); // Remove special chars except underscore
    };

    const variantName = [formatPart(condition), formatPart(color), formatPart(storage)]
      .filter(Boolean)
      .join("-"); // Join with hyphens: "brand_new-red-32gb"

    const expectedUrl = `/admin/preview-product/${product.producturl}-${variantName}`;

    if (window.location.pathname !== expectedUrl) {
      window.history.replaceState({}, "", expectedUrl);
    }
  }, [product]);

  // Handle option selection
  const handleOptionChange = useCallback((variantName, selectedOption) => {
    const processedOption = processOptionValue(variantName, selectedOption);
    const newOptions = { ...selectedOptions, [variantName.trim()]: processedOption };
    setSelectedOptions(newOptions);
    updateSelectedVariant(newOptions);
    setSelectedImageIndex(0);

    // Update URL after state changes
    setTimeout(() => {
      updateProductUrl(newOptions);
    }, 0);
  }, [selectedOptions, processOptionValue, updateSelectedVariant, updateProductUrl]);

  // Helper to get option value (handles both string and object options)
  const getOptionValue = useCallback((option) => {
    if (!option) return "";
    if (typeof option === 'string') return option.trim().toLowerCase();
    if (typeof option === 'object' && option.value) return option.value.trim().toLowerCase();
    if (typeof option === 'object' && option.slug) return option.slug.trim().toLowerCase();
    return "";
  }, []);

  // Auto-select options on load (from URL or first available)
  useEffect(() => {
    if (product && product.variantNames && product.variantValues?.length > 0) {
      const autoOptions = {};

      // If we have variant info from URL, use that
      if (urlVariantInfo) {
        console.log("Setting options from URL:", urlVariantInfo);

        if (urlVariantInfo.condition) {
          autoOptions["condition"] = urlVariantInfo.condition.toLowerCase();
        }
        if (urlVariantInfo.storage) {
          autoOptions["storage"] = urlVariantInfo.storage.toLowerCase();
        }
        if (urlVariantInfo.color) {
          autoOptions["color"] = urlVariantInfo.color.toLowerCase();
        }
      } else {
        // Auto-select first condition
        const conditionVariant = product.variantNames.find(v => v?.name?.trim().toLowerCase() === "condition");
        if (conditionVariant?.options?.length > 0 && conditionVariant.options[0]) {
          const firstOption = conditionVariant.options[0];
          const processedCondition = getOptionValue(firstOption);
          autoOptions["condition"] = processedCondition;
        }

        // Auto-select first storage
        const storageVariant = product.variantNames.find(v => v?.name?.trim().toLowerCase() === "storage");
        if (storageVariant?.options?.length > 0 && storageVariant.options[0]) {
          const firstOption = storageVariant.options[0];
          const processedStorage = getOptionValue(firstOption);
          autoOptions["storage"] = processedStorage;
        }
      }

      setSelectedOptions(autoOptions);

      // Update selected variant inline to avoid dependency issues
      if (Object.keys(autoOptions).length > 0) {
        const selectedStorage = autoOptions["storage"] || "";
        const selectedCondition = autoOptions["condition"] || "";
        const selectedColor = autoOptions["color"] || "";

        const matchedVariant = product.variantValues.find((variant) => {
          if (!variant) return false;

          // Try matching using attributes array first - only if attributes has data
          if (variant.attributes && Array.isArray(variant.attributes) && variant.attributes.length > 0) {
            const conditionAttr = variant.attributes.find(a => a.attributeSlug === "condition" || a.attributeName === "condition");
            const storageAttr = variant.attributes.find(a => a.attributeSlug === "storage" || a.attributeName === "storage");
            const colorAttr = variant.attributes.find(a => a.attributeSlug === "color" || a.attributeName === "color");

            const variantCondition = (conditionAttr?.value || conditionAttr?.valueSlug || "").toLowerCase().replace(/_/g, " ");
            const variantStorage = (storageAttr?.value || storageAttr?.valueSlug || "").toLowerCase();
            const variantColor = (colorAttr?.value || colorAttr?.valueSlug || "").toLowerCase();

            const conditionMatch = !selectedCondition || selectedCondition === "" ||
              variantCondition === selectedCondition ||
              variantCondition.replace(/\s+/g, "_") === selectedCondition ||
              variantCondition.replace(/\s+/g, " ") === selectedCondition.replace(/_/g, " ");
            const storageMatch = !selectedStorage || selectedStorage === "" || variantStorage === selectedStorage;
            const colorMatch = !selectedColor || selectedColor === "" || variantColor === selectedColor;

            return conditionMatch && storageMatch && colorMatch;
          }

          // Fallback to name parsing (when attributes is empty)
          // Variant name format: condition-color-storage (e.g., brand_new-green-32gb)
          if (!variant.name) return false;
          const nameParts = variant.name.toLowerCase().split("-");
          if (nameParts.length < 3) return false;

          const variantCondition = nameParts[0].replace(/_/g, " "); // "brand_new" -> "brand new"
          const variantColor = nameParts[1];
          const variantStorage = nameParts[2];

          const conditionMatch = !selectedCondition || selectedCondition === "" ||
            variantCondition === selectedCondition ||
            variantCondition === selectedCondition.replace(/_/g, " ");
          const storageMatch = !selectedStorage || selectedStorage === "" || variantStorage === selectedStorage;
          const colorMatch = !selectedColor || selectedColor === "" || variantColor === selectedColor;

          return conditionMatch && storageMatch && colorMatch;
        });

        setSelectedVariant(matchedVariant || null);

        // Also update condition prices if storage is selected
        if (autoOptions["storage"]) {
          const filteredVariants = (product.variantValues || []).filter((variant) => {
            if (!variant) return false;
            // Use attributes only if they have data
            if (variant.attributes && Array.isArray(variant.attributes) && variant.attributes.length > 0) {
              const storageAttr = variant.attributes.find(a => a.attributeSlug === "storage" || a.attributeName === "storage");
              const colorAttr = variant.attributes.find(a => a.attributeSlug === "color" || a.attributeName === "color");
              const variantStorage = (storageAttr?.value || storageAttr?.valueSlug || "").toLowerCase();
              const variantColor = (colorAttr?.value || colorAttr?.valueSlug || "").toLowerCase();
              if (!selectedColor || selectedColor === "") {
                return variantStorage === selectedStorage;
              }
              return variantColor === selectedColor && variantStorage === selectedStorage;
            }
            // Fallback to name parsing
            // Variant name format: condition-color-storage (e.g., brand_new-green-32gb)
            if (!variant.name) return false;
            const nameParts = variant.name.toLowerCase().split("-");
            if (nameParts.length < 3) return false;

            const variantColor = nameParts[1];
            const variantStorage = nameParts[2];
            if (!selectedColor || selectedColor === "") {
              return variantStorage === selectedStorage;
            }
            return variantColor === selectedColor && variantStorage === selectedStorage;
          });

          const prices = filteredVariants.map((variant) => {
            // Use attributes only if they have data
            if (variant.attributes && Array.isArray(variant.attributes) && variant.attributes.length > 0) {
              const conditionAttr = variant.attributes.find(a => a.attributeSlug === "condition" || a.attributeName === "condition");
              const condition = conditionAttr?.value || conditionAttr?.valueSlug || null;
              return { conditionName: condition, price: variant.Price, salePrice: variant.salePrice };
            }
            // Fallback - parse from variant name (format: condition-color-storage)
            if (!variant.name) return { conditionName: null, price: variant.Price, salePrice: variant.salePrice };
            const nameParts = variant.name.split("-");
            const condition = nameParts[0] || null;
            return { conditionName: condition, price: variant.Price, salePrice: variant.salePrice };
          });

          const uniquePrices = !selectedColor || selectedColor === ""
            ? prices.filter((item, index, self) => index === self.findIndex((t) => t.conditionName === item.conditionName))
            : prices;
          setConditionPrices(uniquePrices);
        }

        // Only update URL if NOT coming from URL variant info (to preserve the URL)
        if (!urlVariantInfo) {
          setTimeout(() => {
            if (product?.producturl) {
              const expectedUrl = `/admin/preview-product/${product.producturl}`;
              if (window.location.pathname !== expectedUrl) {
                window.history.replaceState({}, "", expectedUrl);
              }
            }
          }, 0);
        }
      }
    }
  }, [product, getOptionValue, urlVariantInfo]);

  // Update URL when selectedVariant and selectedOptions change
  useEffect(() => {
    if (product && selectedOptions && Object.keys(selectedOptions).length > 0) {
      updateProductUrl(selectedOptions);
    }
  }, [product, selectedVariant, selectedOptions, updateProductUrl]);

  // Helper to get image URL - prefers direct url field, falls back to auth.ip + path
  const getImageUrl = useCallback((image) => {
    if (!image) return "";
    // Prefer the direct url field (Vercel Blob URL)
    if (image.url) return image.url;
    // Fallback to constructing from auth.ip + path
    if (image.path && auth?.ip) {
      const baseUrl = auth.ip.endsWith("/") ? auth.ip.slice(0, -1) : auth.ip;
      const imagePath = image.path.startsWith("/") ? image.path : `/${image.path}`;
      return `${baseUrl}${imagePath}`;
    }
    return "";
  }, [auth?.ip]);

  // Get images based on selected variant
  const images = useMemo(() => {
    if (!product) return [];
    // First check if we have a selected variant with images
    if (selectedVariant?.variantImages && Array.isArray(selectedVariant.variantImages) && selectedVariant.variantImages.length > 0) {
      return selectedVariant.variantImages;
    }
    // Fallback to Gallery_Images
    if (Array.isArray(product.Gallery_Images) && product.Gallery_Images.length > 0) {
      return product.Gallery_Images;
    }
    // If no gallery images, try thumbnail as single image
    if (product.thumbnail_image?.path || product.thumbnail_image?.url) {
      return [product.thumbnail_image];
    }
    return [];
  }, [product, selectedVariant]);

  // Get display price
  const getDisplayPrice = useCallback(() => {
    if (selectedVariant) {
      return { price: selectedVariant.Price, salePrice: selectedVariant.salePrice };
    }
    if (product?.variantValues?.length > 0) {
      return { price: product.variantValues[0].Price, salePrice: product.variantValues[0].salePrice };
    }
    return { price: product?.Price, salePrice: product?.salePrice };
  }, [product, selectedVariant]);

  // Get stock quantity
  const getStockQuantity = useCallback(() => {
    if (selectedVariant) return selectedVariant.Quantity || 0;
    if (product?.variantValues?.length > 0) {
      return product.variantValues.reduce((sum, v) => sum + (v.Quantity || 0), 0);
    }
    return product?.Quantity || 0;
  }, [product, selectedVariant]);

  const { price, salePrice } = product ? getDisplayPrice() : { price: 0, salePrice: 0 };
  const stockQuantity = product ? getStockQuantity() : 0;
  const isOutOfStock = stockQuantity === 0;

  // Get stock notification content - matching website exactly
  const getStockNotificationContent = () => {
    if (stockQuantity === 0) {
      return {
        message: "Out of Stock",
        bgColor: "bg-red-500/90",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
      };
    }
    if (stockQuantity === 1) {
      return {
        message: "Last One - Hurry, before it's gone!",
        bgColor: "bg-red-500/90",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      };
    }
    if (stockQuantity === 2) {
      return {
        message: "Only 2 left - Going Fast!",
        bgColor: "bg-red-500/90",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      };
    }
    if (stockQuantity >= 3 && stockQuantity <= 5) {
      return {
        message: "Only a few left - Selling Fast!",
        bgColor: "bg-red-500/90",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      };
    }
    if (stockQuantity >= 6 && stockQuantity <= 9) {
      return {
        message: "Limited Stock - Fewer than 10 left!",
        bgColor: "bg-yellow-500/90",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
      };
    }
    if (stockQuantity === 10) {
      return {
        message: "10 units available - Order soon!",
        bgColor: "bg-blue-500/90",
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
      };
    }
    return {
      message: "In Stock - Ready to Ship!",
      bgColor: "bg-blue-500/90",
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
    };
  };

  const stockNotification = getStockNotificationContent();

  // Format variant name for display
  const formatAndCapitalizeWords = (string) => {
    if (!string) return "";
    return string
      .split(/[-\s]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const getSelectedVariantName = () => {
    if (selectedVariant && selectedOptions) {
      const storage = selectedOptions.storage ? selectedOptions.storage.toUpperCase() : "";
      const color = formatAndCapitalizeWords(selectedOptions.color || "");
      const condition = formatAndCapitalizeWords(selectedOptions.condition || "");
      return `${product?.name || ""} ${storage} ${color} ${condition}`.trim();
    }
    return product?.name || "";
  };

  // Navigation handlers
  const handlePrevImage = () => {
    if (Array.isArray(images) && images.length > 0) {
      setSelectedImageIndex(prev => prev === 0 ? images.length - 1 : prev - 1);
    }
  };

  const handleNextImage = () => {
    if (Array.isArray(images) && images.length > 0) {
      setSelectedImageIndex(prev => (prev + 1) % images.length);
    }
  };

  // Loading state
  if (loading) {
    return (
      <>
        <LoadingBar color="#2563EB" progress={progress} onLoaderFinished={() => setProgress(0)} />
        <div className="flex min-h-screen bg-gray-50">
          <Side selectedPage="new-products" isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} toggleSidebar={toggleSidebar} />
          <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""} flex-1`}>
            <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <main className="p-6">
              <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }

  // Not found state
  if (!product) {
    return (
      <>
        <div className="flex min-h-screen bg-gray-50">
          <Side selectedPage="new-products" isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} toggleSidebar={toggleSidebar} />
          <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""} flex-1`}>
            <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
            <main className="p-6">
              <div className="text-center py-12">
                <h2 className="text-xl font-semibold text-gray-900">Product not found</h2>
                <button onClick={() => navigate("/admin/new-products")} className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                  Back to Products
                </button>
              </div>
            </main>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Preview: {product.name} | Admin</title>
      </Helmet>
      <LoadingBar color="#2563EB" progress={progress} onLoaderFinished={() => setProgress(0)} />

      <div className="flex min-h-screen bg-gray-50">
        <Side selectedPage="new-products" isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} toggleSidebar={toggleSidebar} />

        <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""} flex-1`}>
          <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

          {/* Admin Preview Header */}
          <div className="bg-blue-50 border-b border-blue-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">Preview Mode</span>
                    {product.status ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">Published</span>
                    ) : (
                      <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">Draft</span>
                    )}
                    {product.is_featured && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">Featured</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/admin/edit-product/${product._id}`}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Edit Product
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Main Product Content - Exact Match to Website Layout */}
          <main className="mx-auto max-w-7xl sm:px-6 sm:pt-16 lg:px-8 pb-24">
            <div className="mx-auto max-w-2xl lg:max-w-none">
              {/* Product Grid - Two Columns */}
              <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-8">

                {/* LEFT: Image Gallery - Matching Website ImagePart Component */}
                <div className="flex flex-col-reverse xl:flex-row lg:sticky top-28">
                  {/* Thumbnail List */}
                  <div className="mx-auto mt-2 max-w-2xl md:w-fit w-full">
                    <div className="grid grid-cols-4 xl:grid-cols-1 md:gap-6 gap-2 mt-4 px-4 justify-end">
                      {images.filter(Boolean).map((image, index) => (
                        <button
                          key={image?.filename || image?.id || index}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`relative flex md:w-20 h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none focus:ring focus:ring-opacity-50 focus:ring-offset-4 ${
                            selectedImageIndex === index
                              ? "ring-blue-500 ring-2 ring-offset-2"
                              : ""
                          }`}
                        >
                          <span className="absolute inset-0 overflow-hidden rounded-md">
                            <img
                              src={getImageUrl(image)}
                              alt={`Thumbnail ${index + 1}`}
                              className="h-full w-full object-contain object-center"
                            />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Main Image */}
                  <div className="mx-auto relative w-full md:ms-3 flex justify-center">
                    <div className="w-72 md:w-96 lg:h-[34rem] h-[22rem] relative flex items-center justify-center">
                      {/* Stock Notification - Matching Website */}
                      {showStockNotification && stockNotification && (
                        <div className="absolute top-3 left-2 right-2 z-30 animate-slideDown">
                          <div className={`${stockNotification.bgColor} backdrop-blur-md rounded-xl shadow-2xl border border-white/20 px-4 py-3 flex items-center justify-between gap-3 transition-all duration-300 w-full`}>
                            <div className="flex items-center gap-3 flex-1">
                              <div className="text-white flex-shrink-0">
                                {stockNotification.icon}
                              </div>
                              <p className="text-white font-semibold text-sm md:text-base flex-1">
                                {stockNotification.message}
                              </p>
                            </div>
                            <button
                              onClick={() => setShowStockNotification(false)}
                              className="text-white/80 hover:text-white transition-colors flex-shrink-0 p-1 rounded-full hover:bg-white/20"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Main Image Display */}
                      <span className="absolute inset-0 overflow-hidden rounded-md">
                        {images.length > 0 && images[selectedImageIndex] ? (
                          <img
                            src={getImageUrl(images[selectedImageIndex])}
                            alt={product?.name || "Product"}
                            className={`h-full w-full object-contain object-center ${isOutOfStock ? "opacity-60" : ""}`}
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-24 h-24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                            </svg>
                          </div>
                        )}
                      </span>

                      {/* Out of Stock Overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <div className="bg-black bg-opacity-70 text-white px-6 py-3 rounded-lg transform -rotate-12">
                            <span className="text-xl font-bold">Out of Stock</span>
                          </div>
                        </div>
                      )}

                      {/* Navigation Buttons */}
                      <button
                        type="button"
                        onClick={handlePrevImage}
                        className="absolute -left-10 bg-gray-700 bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 z-10"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M15.25 6.35q.3.3.3.713t-.3.712l-4.2 4.225l4.2 4.2q.275.275.287.688t-.287.712q-.3.3-.713.3t-.712-.3L9.1 12.725q-.3-.3-.3-.713t.3-.712l4.725-4.725q.3-.3.713-.3t.712.3Z" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={handleNextImage}
                        className="absolute -right-10 bg-gray-700 bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 z-10"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M8.75 17.65q-.3-.3-.3-.713t.3-.712l4.2-4.225l-4.2-4.2q-.275-.275-.287-.688T8.75 6.35q.3-.3.713-.3t.712.3l4.725 4.725q.3.3.3.713t-.3.712L10.175 17.65q-.3.3-.713.3t-.712-.3Z" />
                        </svg>
                      </button>

                      {/* Zoom Button */}
                      <button
                        type="button"
                        onClick={() => setIsZoomed(true)}
                        className="absolute top-2 -right-10 bg-gray-700 bg-opacity-50 p-1 rounded-full text-white hover:bg-opacity-75 z-10"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M5.708 19H8.5q.213 0 .356.144t.144.357t-.144.356T8.5 20H4.808q-.343 0-.576-.232T4 19.192V15.5q0-.213.144-.356T4.501 15t.356.144T5 15.5v2.792l3.246-3.246q.14-.14.344-.15t.364.15t.16.354t-.16.354zm12.584 0l-3.246-3.246q-.14-.14-.15-.344t.15-.364t.354-.16t.354.16L19 18.292V15.5q0-.213.144-.356t.357-.144t.356.144t.143.356v3.692q0 .344-.232.576t-.576.232H15.5q-.213 0-.356-.144T15 19.499t.144-.356T15.5 19zM5 5.708V8.5q0 .213-.144.356T4.499 9t-.356-.144T4 8.5V4.808q0-.343.232-.576T4.808 4H8.5q.213 0 .356.144T9 4.501t-.144.356T8.5 5H5.708l3.246 3.246q.14.14.15.344t-.15.364t-.354.16t-.354-.16zm14 0l-3.246 3.246q-.14.14-.344.15t-.364-.15t-.16-.354t.16-.354L18.292 5H15.5q-.213 0-.356-.144T15 4.499t.144-.356T15.5 4h3.692q.344 0 .576.232t.232.576V8.5q0 .213-.144.356T19.499 9t-.356-.144T19 8.5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT: Product Info - Matching Website Layout */}
                <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0" data-product-details>
                  {/* Title and Price - ProductInfo Component */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="md:text-2xl sm:text-xl text-lg font-bold text-gray-900">
                        {getSelectedVariantName()}
                      </h1>
                      {/* Price Display */}
                      <div className="mt-3">
                        {salePrice && parseFloat(salePrice) > 0 ? (
                          <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-bold text-primary">
                              £{parseFloat(salePrice).toFixed(2)}
                            </p>
                            {price && parseFloat(price) > parseFloat(salePrice) && (
                              <p className="text-lg text-gray-500 line-through">
                                £{parseFloat(price).toFixed(2)}
                              </p>
                            )}
                          </div>
                        ) : price ? (
                          <p className="text-3xl font-bold text-gray-900">
                            £{parseFloat(price).toFixed(2)}
                          </p>
                        ) : (
                          <p className="text-lg text-gray-500">Price not set</p>
                        )}
                      </div>
                    </div>
                    {/* Rating Placeholder */}
                    <div className="flex flex-col mt-1">
                      <div className="flex items-center">
                        {[0, 1, 2, 3, 4].map((rating) => (
                          <svg key={rating} className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 whitespace-nowrap">5/5 (0 reviews)</p>
                    </div>
                  </div>

                  {/* Delivery Section - Matching Website */}
                  <div className="border-t border-gray-200 border-b mt-6">
                    <div className="flex sm:flex-row flex-col gap-5 justify-between py-5">
                      <div className="flex flex-col gap-5">
                        {/* Free Delivery */}
                        <div className="flex flex-row gap-3 items-center">
                          <div className="p-3 bg-blue-100 rounded-lg flex gap-2 items-center">
                            <svg width="22" height="16" viewBox="0 0 22 16" fill="none" className="w-5">
                              <path d="M17 14.5C17.83 14.5 18.5 13.83 18.5 13C18.5 12.17 17.83 11.5 17 11.5C16.17 11.5 15.5 12.17 15.5 13C15.5 13.83 16.17 14.5 17 14.5ZM18.5 5.5H16V8H20.46L18.5 5.5ZM5 14.5C5.83 14.5 6.5 13.83 6.5 13C6.5 12.17 5.83 11.5 5 11.5C4.17 11.5 3.5 12.17 3.5 13C3.5 13.83 4.17 14.5 5 14.5ZM19 4L22 8V13H20C20 14.66 18.66 16 17 16C15.34 16 14 14.66 14 13H8C8 14.66 6.66 16 5 16C3.34 16 2 14.66 2 13H0V2C0 0.89 0.89 0 2 0H16V4H19ZM2 2V11H2.76C3.31 10.39 4.11 10 5 10C5.89 10 6.69 10.39 7.24 11H14V2H2Z" fill="black" />
                            </svg>
                            <p className="text-sm font-bold leading-6 text-gray-900 text-start uppercase">
                              Free Next Day Delivery
                            </p>
                          </div>
                        </div>

                        {/* Warranty */}
                        {product?.has_warranty?.status && (
                          <div className="flex flex-row gap-3 items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                              <svg width="14" height="18" viewBox="0 0 14 18" fill="none" className="w-5">
                                <path d="M7 17.962C4.99067 17.3654 3.32167 16.1484 1.993 14.311C0.664333 12.4737 0 10.4034 0 8.10003V2.69203L7 0.0770264L14 2.69203V8.10003C14 10.4027 13.3357 12.4727 12.007 14.31C10.6783 16.1474 9.00933 17.364 7 17.962ZM7 16.901C8.73333 16.351 10.1667 15.251 11.3 13.601C12.4333 11.951 13 10.1177 13 8.10103V3.37503L7 1.14503L1 3.37503V8.10003C1 10.1167 1.56667 11.95 2.7 13.6C3.83333 15.25 5.26667 16.351 7 16.901Z" fill="black" />
                              </svg>
                            </div>
                            <div>
                              {product?.is_refundable?.status && (
                                <p className="text-sm font-medium leading-6 text-gray-900">
                                  Free {product.is_refundable.refund_duration} {product.is_refundable.refund_type} Return
                                </p>
                              )}
                              <p className="text-sm font-medium leading-6 text-gray-900">
                                {product.has_warranty.Warranty_duration} {product.has_warranty.Warranty_type} Warranty
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* SIM & Verified Badges */}
                      <div className="flex flex-col gap-5">
                        {product?.sim_options && product.sim_options !== "null" && (
                          <div className="flex flex-row gap-3 items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                <line x1="12" y1="18" x2="12" y2="18"></line>
                              </svg>
                            </div>
                            <span className="text-sm font-medium leading-6 text-gray-900">
                              {product.sim_options}
                            </span>
                          </div>
                        )}
                        {product?.is_authenticated && (
                          <div className="flex flex-row gap-3 items-center">
                            <div className="flex p-3 bg-blue-100 rounded-lg">
                              <svg width="14" height="18" viewBox="0 0 321 449" fill="none" className="w-5 h-5">
                                <path d="M64 0C28.7 0 0 28.7 0 64V416C0 433.7 14.3 448 32 448C49.7 448 64 433.7 64 416V288H159.3L261.8 434.4C271.9 448.9 291.9 452.4 306.4 442.3C320.9 432.2 324.4 412.2 314.3 397.7L230.1 277.5C282.8 256.1 320 204.4 320 144C320 64.5 255.5 0 176 0H64ZM176 224H64V64H176C220.2 64 256 99.8 256 144C256 188.2 220.2 224 176 224Z" fill="black" />
                              </svg>
                            </div>
                            <span className="text-sm font-medium leading-6 text-gray-900">
                              Verified Refurbished
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Variant Selection - Matching Website VariantFields Component */}
                  <div className={`mt-6 space-y-6 relative ${isZoomed ? "-z-10" : "z-0"}`}>
                    {orderedVariantNames.map((variant) => {
                      const variantName = variant?.name?.trim() || "";
                      if (!variantName) return null;
                      const variantNameLower = variantName.toLowerCase();
                      const isDisabled = isVariantDisabled(variantName);

                      return (
                        <fieldset key={variantName}>
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <legend className="text-sm font-semibold leading-6 text-gray-900 capitalize">
                                {variantNameLower === "color" ? "Select Color" :
                                 variantNameLower === "storage" ? "Select Storage" :
                                 variantNameLower === "condition" ? "Select Condition" :
                                 variantName}
                              </legend>
                              {isDisabled && (
                                <span className="text-xs text-gray-500 mt-1">
                                  {variantNameLower === "storage" ? "Select a condition first" :
                                   variantNameLower === "color" ? "Select condition and storage first" :
                                   "Please complete previous selections"}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className={`mt-2 grid gap-y-6 grid-cols-2 gap-x-4 ${isDisabled ? "opacity-50 pointer-events-none" : ""}`}>
                            {variant.options?.map((option, optionIndex) => {
                              if (!option) return null;
                              const optionValue = typeof option === 'string' ? option : (option.value || option.slug || "");
                              if (!optionValue) return null;
                              const optionName = processOptionValue(variantName, optionValue);

                              let optionCode = null;
                              if (variantNameLower === "color") {
                                if (typeof option === 'object' && option.colorCode) {
                                  optionCode = option.colorCode;
                                } else if (typeof optionValue === 'string' && optionValue.includes("(")) {
                                  const colorMatch = optionValue.match(/\((#\w+)\)/);
                                  if (colorMatch) optionCode = colorMatch[1].trim();
                                }
                              }

                              const isSelected = selectedOptions[variantName] === optionName;

                              // Check if sold out
                              let isOptionSoldOut = false;
                              if (!isDisabled && product?.variantValues) {
                                if (variantNameLower === "color") {
                                  const variantCombination = product.variantValues.find((v) => {
                                    // Use attributes only if they have data
                                    if (v?.attributes && Array.isArray(v.attributes) && v.attributes.length > 0) {
                                      const colorAttr = v.attributes.find(a => a.attributeSlug === "color" || a.attributeName === "color");
                                      const storageAttr = v.attributes.find(a => a.attributeSlug === "storage" || a.attributeName === "storage");
                                      const conditionAttr = v.attributes.find(a => a.attributeSlug === "condition" || a.attributeName === "condition");

                                      const variantColor = (colorAttr?.value || colorAttr?.valueSlug || "").toLowerCase();
                                      const variantStorage = (storageAttr?.value || storageAttr?.valueSlug || "").toLowerCase();
                                      const variantCondition = (conditionAttr?.value || conditionAttr?.valueSlug || "").toLowerCase().replace(/_/g, " ");

                                      return variantColor === optionName &&
                                             variantStorage === selectedOptions["storage"] &&
                                             (variantCondition === selectedOptions["condition"] ||
                                              variantCondition.replace(/\s+/g, "_") === selectedOptions["condition"]);
                                    }
                                    // Fallback to name parsing - for variant name format: condition-color-storage
                                    if (!v.name) return false;
                                    const nameParts = v.name.toLowerCase().split("-");
                                    if (nameParts.length >= 3) {
                                      const variantCondition = nameParts[0].replace(/_/g, " ");
                                      const variantColor = nameParts[1];
                                      const variantStorage = nameParts[2];
                                      return variantColor === optionName &&
                                             variantStorage === selectedOptions["storage"] &&
                                             (variantCondition === selectedOptions["condition"] ||
                                              variantCondition.replace(/\s+/g, "_") === selectedOptions["condition"]);
                                    }
                                    return false;
                                  });
                                  isOptionSoldOut = checkIfSoldOut(variantCombination);
                                }
                              }

                              // Get price for condition
                              // conditionName from variant is like "brand_new", optionName is like "brand new"
                              const conditionPrice = variantNameLower === "condition"
                                ? conditionPrices.find(cp => {
                                    const cpName = cp.conditionName?.toLowerCase().replace(/_/g, " ") || "";
                                    return cpName === optionName || cp.conditionName?.toLowerCase() === optionName.replace(/\s+/g, "_");
                                  })
                                : null;

                              return (
                                <button
                                  key={typeof option === 'object' ? (option._id || option.slug || optionIndex) : optionName}
                                  onClick={() => !isOptionSoldOut && handleOptionChange(variantName, optionValue)}
                                  disabled={isOptionSoldOut}
                                  className={`relative flex rounded-lg border px-4 py-3 shadow-sm focus:outline-none hover:bg-gray-50 capitalize ${
                                    isSelected
                                      ? "border-primary ring-1 ring-primary bg-[#e7f0ea]"
                                      : "border-gray-200"
                                  } ${
                                    isOptionSoldOut ? "opacity-90 cursor-not-allowed" : "cursor-pointer"
                                  }`}
                                >
                                  <span className={`flex justify-center w-full ${optionCode ? "flex-row gap-3 items-center" : "flex-col"}`}>
                                    <span className="block md:text-sm text-[11px] font-medium text-gray-900 text-center">
                                      {variantNameLower === "storage"
                                        ? optionName.toUpperCase()
                                        : optionName.replace(/-/g, " ")}
                                    </span>
                                    {optionCode && (
                                      <span
                                        className="inline-block w-4 h-4 rounded-full border border-black"
                                        style={{ backgroundColor: optionCode }}
                                      ></span>
                                    )}
                                    {/* Condition Price */}
                                    {conditionPrice && (
                                      <span className="text-sm text-gray-900 text-center">
                                        <div className="flex justify-center items-center gap-5">
                                          <s className="text-gray-700 font-medium">£{conditionPrice.price}</s>
                                          <span className="text-base font-medium">£{conditionPrice.salePrice}</span>
                                        </div>
                                      </span>
                                    )}
                                  </span>
                                  {/* Sold Out Banner */}
                                  {isOptionSoldOut && (
                                    <span
                                      className="absolute bottom-0 left-0 bg-red-600 text-white text-[10px] text-center font-normal px-3 pt-[1px] transform origin-bottom-left overflow-hidden"
                                      style={{
                                        transform: "translate(-22%, 125%) rotate(-45deg)",
                                        transformOrigin: "bottom left",
                                        width: "78px",
                                        whiteSpace: "nowrap",
                                      }}
                                    >
                                      Sold Out
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </fieldset>
                      );
                    })}
                  </div>

                  {/* Comes With Section - Matching Website ComesWith Component */}
                  {product.comes_With && Object.values(product.comes_With).some(v => v === true) && (
                    <div className="mt-6">
                      <h2 className="text-sm font-semibold leading-6 text-gray-900">Comes with</h2>
                      <div className="grid md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 grid-cols-2 justify-start gap-3 items-center mt-3">
                        {product.comes_With.powerAdapter && (
                          <div className="flex flex-row items-center gap-3 border p-2 rounded-lg bg-blue-50">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            <label className="text-xs font-medium leading-6 text-gray-900 lg:whitespace-nowrap">Power Adapter</label>
                          </div>
                        )}
                        {product.comes_With.powerCable && (
                          <div className="flex flex-row items-center gap-3 border p-2 rounded-lg bg-blue-50">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            <label className="text-xs font-medium leading-6 text-gray-900 lg:whitespace-nowrap">Charging Cable</label>
                          </div>
                        )}
                        {product.comes_With.protectionBundle && (
                          <div className="flex flex-row items-center gap-3 border p-2 rounded-lg bg-blue-50">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            <label className="text-xs font-medium leading-6 text-gray-900 lg:whitespace-nowrap">Protection Bundle</label>
                          </div>
                        )}
                        {product.comes_With.onexcontroller && (
                          <div className="flex flex-row items-center gap-3 border p-2 rounded-lg bg-blue-50">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                            <label className="text-xs font-medium leading-6 text-gray-900 lg:whitespace-nowrap">1x Controller</label>
                          </div>
                        )}
                        {product.comes_With.twoxcontroller && (
                          <div className="flex flex-row items-center gap-3 border p-2 rounded-lg bg-blue-50">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                            <label className="text-xs font-medium leading-6 text-gray-900 lg:whitespace-nowrap">2x Controller</label>
                          </div>
                        )}
                        {product.comes_With.hdmi && (
                          <div className="flex flex-row items-center gap-3 border p-2 rounded-lg bg-blue-50">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <label className="text-xs font-medium leading-6 text-gray-900 lg:whitespace-nowrap">HDMI Cable</label>
                          </div>
                        )}
                        {product.comes_With.powerCableNewIncluded && (
                          <div className="flex flex-row items-center gap-3 border p-2 rounded-lg bg-blue-50">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            <label className="text-xs font-medium leading-6 text-gray-900 lg:whitespace-nowrap">Power Cable</label>
                          </div>
                        )}
                        {product.comes_With.onexScreenProtector && (
                          <div className="flex flex-row items-center gap-3 border p-2 rounded-lg bg-blue-50">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            <label className="text-xs font-medium leading-6 text-gray-900 lg:whitespace-nowrap">Screen Protector</label>
                          </div>
                        )}
                        {product.comes_With.onexBackCover && (
                          <div className="flex flex-row items-center gap-3 border p-2 rounded-lg bg-blue-50">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                            <label className="text-xs font-medium leading-6 text-gray-900 lg:whitespace-nowrap">Back Cover</label>
                          </div>
                        )}
                        {product.comes_With.treePlanted && (
                          <div className="flex flex-row items-center gap-3 border p-2 rounded-lg bg-blue-50">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
                            <label className="text-xs font-medium leading-6 text-gray-900 lg:whitespace-nowrap">Tree Planted</label>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Add to Cart Button (Disabled in Preview) */}
                  <div className="mt-8">
                    <button
                      disabled
                      className="w-full bg-primary text-white py-4 px-8 rounded-lg font-semibold text-lg opacity-50 cursor-not-allowed"
                    >
                      Add to Cart (Preview Mode)
                    </button>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              {(product.Product_summary || product.Product_description) && (
                <div className="max-w-screen-xl mx-auto w-full px-4 mt-16">
                  <div className="bg-white rounded-lg shadow-xl border border-gray-200 px-4 sm:px-6 py-6">
                    {product.Product_summary && (
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Summary</h3>
                        <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.Product_summary }} />
                      </div>
                    )}
                    {product.Product_description && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Description</h3>
                        <div className="prose prose-sm max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: product.Product_description }} />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Admin Variants Table */}
              {product.variantValues && product.variantValues.length > 0 && (
                <div className="max-w-screen-xl mx-auto w-full px-4 mt-8">
                  <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">Admin</span>
                      All Variants ({product.variantValues.length})
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b">
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Variant</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Price</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Sale Price</th>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Stock</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {product.variantValues.map((variant, index) => (
                            <tr key={index} className={`hover:bg-gray-50 ${selectedVariant?._id === variant._id ? 'bg-blue-50' : ''}`}>
                              <td className="px-4 py-3 font-medium text-gray-900">{variant.name}</td>
                              <td className="px-4 py-3 text-gray-600">£{parseFloat(variant.Price || 0).toFixed(2)}</td>
                              <td className="px-4 py-3 text-primary font-medium">£{parseFloat(variant.salePrice || 0).toFixed(2)}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 text-xs font-medium rounded ${
                                  (variant.Quantity || 0) > 5 ? "bg-blue-100 text-blue-700" :
                                  (variant.Quantity || 0) > 0 ? "bg-yellow-100 text-yellow-700" :
                                  "bg-red-100 text-red-700"
                                }`}>
                                  {variant.Quantity || 0}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* Fixed Bottom Bar - Matching Website BuyNow Component */}
          <div className="fixed bottom-0 right-0 left-0 lg:left-72 shadow-2xl p-4 bg-white z-40 border-t border-gray-300">
            <div className="max-w-7xl mx-auto flex lg:flex-row flex-col md:justify-between justify-center items-center gap-3">
              {/* Delivery Info */}
              <div className="lg:flex hidden flex-row gap-3 items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <svg width="22" height="16" viewBox="0 0 22 16" fill="none" className="w-5">
                    <path d="M17 14.5C17.83 14.5 18.5 13.83 18.5 13C18.5 12.17 17.83 11.5 17 11.5C16.17 11.5 15.5 12.17 15.5 13C15.5 13.83 16.17 14.5 17 14.5ZM18.5 5.5H16V8H20.46L18.5 5.5ZM5 14.5C5.83 14.5 6.5 13.83 6.5 13C6.5 12.17 5.83 11.5 5 11.5C4.17 11.5 3.5 12.17 3.5 13C3.5 13.83 4.17 14.5 5 14.5ZM19 4L22 8V13H20C20 14.66 18.66 16 17 16C15.34 16 14 14.66 14 13H8C8 14.66 6.66 16 5 16C3.34 16 2 14.66 2 13H0V2C0 0.89 0.89 0 2 0H16V4H19ZM2 2V11H2.76C3.31 10.39 4.11 10 5 10C5.89 10 6.69 10.39 7.24 11H14V2H2Z" fill="black" />
                  </svg>
                </div>
                <p className="text-sm font-medium leading-6 text-gray-900">Free Next Day Delivery</p>
              </div>

              {/* Product Name */}
              <h2 className="md:text-lg lg:block hidden text-base font-bold text-gray-900 whitespace-pre-wrap truncate max-w-md">
                {getSelectedVariantName()}
              </h2>

              {/* Price and Button */}
              <div className="flex flex-row gap-4 items-center">
                <div className="flex flex-col items-end">
                  <div className="flex flex-row items-center gap-2">
                    {price && parseFloat(price) > parseFloat(salePrice || 0) && (
                      <s className="text-sm font-light text-gray-500">£{parseFloat(price).toFixed(2)} new</s>
                    )}
                    <p className="md:text-xl text-lg font-bold text-gray-900">
                      £{parseFloat(salePrice || price || 0).toFixed(2)}
                    </p>
                  </div>
                  {isOutOfStock && (
                    <p className="text-xs text-red-600 font-semibold">Out of stock</p>
                  )}
                </div>
                <button
                  disabled
                  className="bg-primary text-white py-2 px-6 rounded-md opacity-50 cursor-not-allowed text-sm font-medium"
                >
                  Preview Mode
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom Modal - Matching Website */}
      {isZoomed && images.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white top-[90px]">
          <span className="absolute inset-0 z-50">
            <img
              src={getImageUrl(images[selectedImageIndex])}
              alt={product?.name || "Product"}
              className="object-contain h-full w-full"
            />
          </span>
          <button
            onClick={handlePrevImage}
            className="absolute left-4 bg-gray-700 bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 z-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
              <path fill="currentColor" d="M15.25 6.35q.3.3.3.713t-.3.712l-4.2 4.225l4.2 4.2q.275.275.287.688t-.287.712q-.3.3-.713.3t-.712-.3L9.1 12.725q-.3-.3-.3-.713t.3-.712l4.725-4.725q.3-.3.713-.3t.712.3Z" />
            </svg>
          </button>
          <button
            onClick={handleNextImage}
            className="absolute right-4 bg-gray-700 bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-75 z-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="2em" height="2em" viewBox="0 0 24 24">
              <path fill="currentColor" d="M8.75 17.65q-.3-.3-.3-.713t.3-.712l4.2-4.225l-4.2-4.2q-.275-.275-.287-.688T8.75 6.35q.3-.3.713-.3t.712.3l4.725 4.725q.3.3.3.713t-.3.712L10.175 17.65q-.3.3-.713.3t-.712-.3Z" />
            </svg>
          </button>
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 text-white p-2 bg-gray-700 bg-opacity-50 rounded-full hover:bg-opacity-75 z-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
}
