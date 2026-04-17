import {  useState, useEffect } from "react";
import { Link,  } from "react-router-dom";
import Side from "../nav/Side";
import Top from "../nav/Top";
import axios from "axios";
import LoadingBar from "react-top-loading-bar";
import { useAuth } from "../../../context/Auth";
import { toast } from "react-toastify";
import { ClipboardDocumentIcon } from "@heroicons/react/24/outline"; // Cli
import { Helmet } from "react-helmet-async";

export default function AllProducts() {
  const auth = useAuth();
  const [selectedPage, setSelectedPage] = useState("products");
  const [progress, setProgress] = useState(0);
  const [products, setProducts] = useState([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default rows per page
  const [exportAllLoading, setExportAllLoading] = useState(false); // Loading state for Export All button
  const [exportLoading, setExportLoading] = useState(false); // Loading state for Export button
  const [accessoriesLoading, setAccessoriesLoading] = useState(false); // Loading state for Accessories button

  const filteredProducts = products.filter(product => {
    const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const conditionMatch = product.condition.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = product.category.toLowerCase().includes(searchQuery.toLowerCase());

    // Check if search query is a number and compare with total variants count
    const variantMatch = !isNaN(searchQuery) && product.variantValues.length === parseInt(searchQuery);

    // Return true if any match is found
    return nameMatch || conditionMatch || categoryMatch || variantMatch;
  })
  // Pagination logic
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  // Handle rows per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value));
    setCurrentPage(1); // Reset to first page when rows per page changes
  };
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to the first page when search query changes
  };

  function getProducts(showSuccessMessage) {
    setProgress(50);

    let allProducts = []; // Array to store all retrieved products
    let skipCount = 0; // Tracks the number of products already retrieved
    const batchSize = 100; // Number of products per batch

    const fetchBatch = () => {
      axios
        .get(`${auth.ip}get/all/product/adminpage?batchSize=${batchSize}&skip=${skipCount}`)
        .then((response) => {
          if (response.data.status === 201) {
            const { products, totalProductsCount } = response.data;

            // Append newly retrieved products
            allProducts = [...allProducts, ...products];
            setProducts(allProducts); // Update the state with the combined products
            console.log('Batch Products:', products);

            // Update skipCount for the next batch
            skipCount += products.length;

            // If all products are retrieved, stop fetching
            if (allProducts.length >= totalProductsCount) {
              console.log('All products retrieved:', allProducts);
              setProgress(100);
            } else {
              // Fetch the next batch after a delay
              setTimeout(fetchBatch, 1000); // 3-second delay before fetching the next batch
            }
          } else {
            toast.error(response.data.message);
          }
        })
        .catch((error) => {
          console.error('Error fetching products:', error);
          toast.error("An error occurred while fetching products.");
        });
    };

    // Start fetching batches
    fetchBatch();
  }

  useEffect(() => {
    getProducts(true); // Fetch products and show success message
  }, []);


  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [filePath, setFilePath] = useState(""); // State for storing file path
  const handleOpenModal = (productId) => {
    setSelectedProductId(productId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };
  const correctFilePath = (path) => {
    if (!path) return "";

    // Replace Windows backslashes with forward slashes
    let correctedPath = path.replace(/\\/g, "/");

    // Remove extra parts if needed, modify based on your file structure
    // e.g., if you only need part of the path starting from "uploads"
    if (correctedPath.includes("/uploads/")) {
      correctedPath = correctedPath.split("/uploads/")[1];
    }

    
    return `${API_BASE_URL}uploads/${correctedPath}`;
  };
  const categoryMapping = {
    "Mobile-Phones": "/ Electronics / Communications / Telephony / Mobile Phones / Unlocked Mobile Phones",
    "iPads-and-Tablets": "/ Electronics / Computers / Tablet Computers",
    "Laptops-and-Macbooks": "/ Electronics / Computers / Laptops",
    "Game-Consoles": "/ Electronics / Video Game Consoles",
    "Accessories": "/ Electronics / Communications / Telephony / Mobile Phone Accessories",
  };

  // Generate random SKU when product/variant doesn't have one
  const generateRandomSKU = (productName, variantName = '') => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
    const namePrefix = productName ? productName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X') : 'PRD';
    const variantPrefix = variantName ? variantName.substring(0, 2).toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
    return `ZEX-${namePrefix}${variantPrefix}-${timestamp}-${randomPart}`;
  };
  function getGoogleProductCategory(productCategory) {
    for (let key in categoryMapping) {
      if (productCategory.includes(key)) {
        return categoryMapping[key];
      }
    }
    return ""; // Return an empty string or a default category if no match is found
  }

  const handleExportClick = () => {
    if (exportLoading) return; // Prevent multiple clicks

    // After fetching products, send data to the backend
    if (products.length > 0) {
      setExportLoading(true); // Start loading
      console.log("Products:", products);
      const csvData = products.flatMap(product => {
        // Exclude products in 'Accessories' category
        if (product.category.includes("Accessories") || product.category.includes("PAYG-SIM-Card")) {
          return []; // Return an empty array to exclude this product
        }
        const conditions = [
          "Excellent",
          "Fair",
          "Good",
          "Brand New",
          "Refurbished",
          "Used",
        ];
        const googleProductCategory = getGoogleProductCategory(product.category);

        if (product.productType?.type === 'single') {
          // Check product stock for single-type products
          if (!product.variantValues[0].Quantity || product.variantValues[0].Quantity <= 0) {
            return []; // Skip out of stock variants
          }
          const productNameSlug = product.producturl;
          const condition = product.condition === 'Brand New' ? 'New' : product.condition;

          return [{
            id: product.variantValues[0].SKU || generateRandomSKU(product.name),
            title: `${product.name}`,
            description: product.Product_summary || '',
            availability: 'in_stock',
            link: `${import.meta.env.VITE_BACKEND_URL}products/${productNameSlug}`,
            image_link: `${import.meta.env.VITE_BACKEND_URL}${product.thumbnail_image.path}`,
            additional_image_link: product.Gallery_Images.map(img => `${import.meta.env.VITE_BACKEND_URL}${img.path}`).join(", "),
            price: `${product.variantValues[0].Price} GBP`,
            sale_price: product.variantValues[0].salePrice ? `${product.variantValues[0].salePrice} GBP` : null,
            identifier_exists: product.variantValues[0].EIN ? 'yes' : 'no',
            gtin: product.variantValues[0].EIN ? product.variantValues[0].EIN : '',
            mpn: product.variantValues[0].MPN || "",
            brand: product.brand || '',
            condition: condition || 'N/A',
            custom_label_0: product.condition === 'refurbished' || product.condition === 'Refurbished' ? '' : '',
            color: 'N/A',
            capacity: 'N/A',
            shipping: product.shipping_cost || '0.00 GBP',
            tax: product.tax_rate || '0%',
            mobile_link: `${import.meta.env.VITE_BACKEND_URL}products/${productNameSlug}?mobile=true`,
            google_product_category: googleProductCategory
          }];
        } else {
          // Handle variant-based products
          return product.variantValues.flatMap(variant => {
            // Exclude out of stock variants
            if (!variant.Quantity || variant.Quantity <= 0) {
              return []; // Skip out of stock variants
            }
            const productNameSlug = product.producturl;
            const variantName = variant.name || '';
            const nameParts = variantName.split('-');
            const variantCondition = (nameParts.find(part => conditions.includes(part)) || 'Unknown').replace(/\s+/g, '-'); // Replace spaces with hyphens
            const storage = (nameParts.find(part => /\d+(GB|TB)/i.test(part)) || 'Unknown').replace(/\s+/g, '-'); // Replace spaces with hyphens
            const colorParts = nameParts.filter(part => part !== variantCondition && part !== storage && !conditions.includes(part));
            const colorName = colorParts.join('-').split(' (')[0].trim().replace(/\s+/g, '-'); // Replace spaces with hyphens
            const fullProductNameSlug = `${productNameSlug}-${storage}-${colorName}-${variantCondition}`.toLowerCase();
            const firstImageLink = variant.variantImages.length > 0
              ? `${import.meta.env.VITE_BACKEND_URL}${variant.variantImages[0].path}`
              : '';
            const condition = product.condition === 'Brand New' ? 'New' : product.condition;
            return {
              id: variant.SKU || generateRandomSKU(product.name, variantName),
              title: `${product.name}  - ${colorName} - ${storage}`,
              description: product.Product_summary || '',
              availability: 'in_stock',
              link: `${import.meta.env.VITE_BACKEND_URL}products/${fullProductNameSlug}`,
              image_link: firstImageLink,
              additional_image_link: variant.variantImages.map(img => `${import.meta.env.VITE_BACKEND_URL}${img.path}`).join(", "),
              price: `${variant.Price} GBP`,
              sale_price: variant.salePrice ? `${variant.salePrice} GBP` : null,
              identifier_exists: variant.EIN ? 'yes' : 'no',
              gtin: variant.EIN ? variant.EIN : '',
              mpn: variant.MPN || "",
              brand: product.brand || '',
              condition: condition || 'N/A',
              custom_label_0: product.condition === 'refurbished' || product.condition === 'Refurbished' ? variantCondition : '',
              color: colorName || 'N/A',
              capacity: storage || 'N/A',
              shipping: product.shipping_cost || '0.00 GBP',
              tax: product.tax_rate || '0%',
              mobile_link: `${import.meta.env.VITE_BACKEND_URL}products/${fullProductNameSlug}?mobile=true`,
              google_product_category: googleProductCategory
            };
          });
        }
      });


      console.log('CSV Data:',csvData);

      // POST the prepared data to the /upload/csv route
      axios.post(`${auth.ip}upload/csv`, csvData, {
        headers: {
          'Content-Type': 'application/json',  // Ensure the content type is set correctly
        }
      })
        .then(response => {
          setExportLoading(false); // Stop loading
          if (response.status === 200) {
            console.log(response);
            const correctedFilePath = correctFilePath(response.data.filePath); // Correct file path
            setFilePath(correctedFilePath); // Save corrected file path to state
            toast.success(response.data.message);
          } else {
            toast.error(`Failed to send data to the backend. Status code: ${response.status}`);
          }
        })
        .catch(error => {
          setExportLoading(false); // Stop loading on error
          console.error('Error sending data to backend:', error);
          toast.error('An error occurred while sending data to the backend.');
        });
    }

  };
  const handleAccessoriesClick = () => {
    if (accessoriesLoading) return; // Prevent multiple clicks

    // After fetching products, send data to the backend
    if (products.length > 0) {
      setAccessoriesLoading(true); // Start loading
      const csvData = products.flatMap(product => {
        // Exclude products in 'Accessories' category
        // if (product.category.includes("Accessories") || product.category.includes("PAYG SIM Card")) {
        //   return []; // Return an empty array to exclude this product
        // }
        const googleProductCategory = getGoogleProductCategory(product.category);

        if (product.productType?.type === 'single') {
          // Check product stock for single-type products
          if (!product.variantValues[0].Quantity || product.variantValues[0].Quantity <= 0) {
            return []; // Skip out of stock variants
          }
          const productNameSlug = product.producturl;
          const condition = product.condition === 'Brand New' ? 'New' : product.condition;
          return [{
            id: product.variantValues[0].SKU || generateRandomSKU(product.name),
            title: `${product.name}`,
            description: product.Product_summary || '',
            availability: 'in_stock',
            link: `${import.meta.env.VITE_BACKEND_URL}products/${productNameSlug}`,
            image_link: `${import.meta.env.VITE_BACKEND_URL}${product.thumbnail_image.path}`,
            additional_image_link: product.Gallery_Images.map(img => `${import.meta.env.VITE_BACKEND_URL}${img.path}`).join(", "),
            price: `${product.variantValues[0].Price} GBP`,
            sale_price: product.variantValues[0].salePrice ? `${product.variantValues[0].salePrice} GBP` : null,
            identifier_exists: product.variantValues[0].EIN ? 'yes' : 'no',
            gtin: product.variantValues[0].EIN ? product.variantValues[0].EIN : '',
            mpn: product.variantValues[0].MPN || "",
            brand: product.brand || '',
            condition: condition || 'N/A',
            custom_label_0: product.condition === 'refurbished' || product.condition === 'Refurbished' ? '' : '',
            color: 'N/A',
            capacity: 'N/A',
            shipping: product.shipping_cost || '0.00 GBP',
            tax: product.tax_rate || '0%',
            mobile_link: `${import.meta.env.VITE_BACKEND_URL}products/${productNameSlug}?mobile=true`,
            google_product_category: googleProductCategory
          }];
        } else {
          // Handle variant-based products
          return product.variantValues.flatMap(variant => {
            // Exclude out of stock variants
            if (!variant.Quantity || variant.Quantity <= 0) {
              return []; // Skip out of stock variants
            }
            const productNameSlug = product.producturl;
            const variantName = variant.name || '';
            const nameParts = variantName.split('-');
            const variantCondition = nameParts[0] || 'Unknown';
            const storage = nameParts.find(part => /\d+(GB|TB)/i.test(part)) || 'Unknown';
            const colorParts = nameParts.filter(part => part !== variantCondition && part !== storage);
            const colorName = colorParts.join('-').split(' (')[0].trim();
            const fullProductNameSlug = `${productNameSlug}-${storage}-${colorName}-${variantCondition}`.toLowerCase();
            const firstImageLink = variant.variantImages.length > 0
              ? `${import.meta.env.VITE_BACKEND_URL}${variant.variantImages[0].path}`
              : '';
            const condition = product.condition === 'Brand New' ? 'New' : product.condition;
            return {
              id: variant.SKU || generateRandomSKU(product.name, variantName),
              title: `${product.name}  - ${colorName} - ${storage}`,
              description: product.Product_summary || '',
              availability: 'in_stock',
              link: `${import.meta.env.VITE_BACKEND_URL}products/${fullProductNameSlug}`,
              image_link: firstImageLink,
              additional_image_link: variant.variantImages.map(img => `${import.meta.env.VITE_BACKEND_URL}${img.path}`).join(", "),
              price: `${variant.Price} GBP`,
              sale_price: variant.salePrice ? `${variant.salePrice} GBP` : null,
              identifier_exists: variant.EIN ? 'yes' : 'no',
              gtin: variant.EIN ? variant.EIN : '',
              mpn: variant.MPN || "",
              brand: product.brand || '',
              condition: condition || 'N/A',
              custom_label_0: product.condition === 'refurbished' || product.condition === 'Refurbished' ? variantCondition : '',
              color: colorName || 'N/A',
              capacity: storage || 'N/A',
              shipping: product.shipping_cost || '0.00 GBP',
              tax: product.tax_rate || '0%',
              mobile_link: `${import.meta.env.VITE_BACKEND_URL}products/${fullProductNameSlug}?mobile=true`,
              google_product_category: googleProductCategory
            };
          });
        }
      });


      console.log(csvData);

      // POST the prepared data to the /upload/csv route
      axios.post(`${auth.ip}upload/csv/with/accessories`, csvData, {
        headers: {
          'Content-Type': 'application/json',  // Ensure the content type is set correctly
        }
      })
        .then(response => {
          setAccessoriesLoading(false); // Stop loading
          if (response.status === 200) {
            console.log(response);
            const correctedFilePath = correctFilePath(response.data.filePath); // Correct file path
            setFilePath(correctedFilePath); // Save corrected file path to state
            toast.success(response.data.message);
          } else {
            toast.error(`Failed to send data to the backend. Status code: ${response.status}`);
          }
        })
        .catch(error => {
          setAccessoriesLoading(false); // Stop loading on error
          console.error('Error sending data to backend:', error);
          toast.error('An error occurred while sending data to the backend.');
        });
    }

  };

  // Export ALL products (both in-stock and out-of-stock) with dynamic availability
  const handleExportAllProducts = () => {
    if (exportAllLoading) return; // Prevent multiple clicks

    if (products.length > 0) {
      setExportAllLoading(true); // Start loading
      console.log("Exporting ALL Products:", products);
      const csvData = products.flatMap(product => {
        // Exclude Accessories and PAYG-SIM-Card categories
        if (product.category.includes("Accessories") || product.category.includes("PAYG-SIM-Card")) {
          return [];
        }
        const conditions = [
          "Excellent",
          "Fair",
          "Good",
          "Brand New",
          "Refurbished",
          "Used",
        ];
        const googleProductCategory = getGoogleProductCategory(product.category);

        if (product.productType?.type === 'single') {
          const productNameSlug = product.producturl;
          const condition = product.condition === 'Brand New' ? 'New' : product.condition;
          // Dynamic availability based on quantity
          const quantity = product.variantValues[0]?.Quantity || 0;
          const availability = quantity > 0 ? 'in_stock' : 'out_of_stock';

          return [{
            id: product.variantValues[0].SKU || generateRandomSKU(product.name),
            title: `${product.name}`,
            description: product.Product_summary || '',
            availability: availability,
            link: `${import.meta.env.VITE_BACKEND_URL}products/${productNameSlug}`,
            image_link: `${import.meta.env.VITE_BACKEND_URL}${product.thumbnail_image.path}`,
            additional_image_link: product.Gallery_Images.map(img => `${import.meta.env.VITE_BACKEND_URL}${img.path}`).join(", "),
            price: `${product.variantValues[0].Price} GBP`,
            sale_price: product.variantValues[0].salePrice ? `${product.variantValues[0].salePrice} GBP` : null,
            identifier_exists: product.variantValues[0].EIN ? 'yes' : 'no',
            gtin: product.variantValues[0].EIN ? product.variantValues[0].EIN : '',
            mpn: product.variantValues[0].MPN || "",
            brand: product.brand || '',
            condition: condition || 'N/A',
            custom_label_0: product.condition === 'refurbished' || product.condition === 'Refurbished' ? '' : '',
            color: 'N/A',
            capacity: 'N/A',
            shipping: product.shipping_cost || '0.00 GBP',
            tax: product.tax_rate || '0%',
            mobile_link: `${import.meta.env.VITE_BACKEND_URL}products/${productNameSlug}?mobile=true`,
            google_product_category: googleProductCategory
          }];
        } else {
          // Handle variant-based products - include ALL variants
          return product.variantValues.flatMap(variant => {
            const productNameSlug = product.producturl;
            const variantName = variant.name || '';
            const nameParts = variantName.split('-');
            const variantCondition = (nameParts.find(part => conditions.includes(part)) || 'Unknown').replace(/\s+/g, '-');
            const storage = (nameParts.find(part => /\d+(GB|TB)/i.test(part)) || 'Unknown').replace(/\s+/g, '-');
            const colorParts = nameParts.filter(part => part !== variantCondition && part !== storage && !conditions.includes(part));
            const colorName = colorParts.join('-').split(' (')[0].trim().replace(/\s+/g, '-');
            const fullProductNameSlug = `${productNameSlug}-${storage}-${colorName}-${variantCondition}`.toLowerCase();
            const firstImageLink = variant.variantImages.length > 0
              ? `${import.meta.env.VITE_BACKEND_URL}${variant.variantImages[0].path}`
              : '';
            const condition = product.condition === 'Brand New' ? 'New' : product.condition;
            // Dynamic availability based on quantity
            const quantity = variant.Quantity || 0;
            const availability = quantity > 0 ? 'in_stock' : 'out_of_stock';

            return {
              id: variant.SKU || generateRandomSKU(product.name, variantName),
              title: `${product.name}  - ${colorName} - ${storage}`,
              description: product.Product_summary || '',
              availability: availability,
              link: `${import.meta.env.VITE_BACKEND_URL}products/${fullProductNameSlug}`,
              image_link: firstImageLink,
              additional_image_link: variant.variantImages.map(img => `${import.meta.env.VITE_BACKEND_URL}${img.path}`).join(", "),
              price: `${variant.Price} GBP`,
              sale_price: variant.salePrice ? `${variant.salePrice} GBP` : null,
              identifier_exists: variant.EIN ? 'yes' : 'no',
              gtin: variant.EIN ? variant.EIN : '',
              mpn: variant.MPN || "",
              brand: product.brand || '',
              condition: condition || 'N/A',
              custom_label_0: product.condition === 'refurbished' || product.condition === 'Refurbished' ? variantCondition : '',
              color: colorName || 'N/A',
              capacity: storage || 'N/A',
              shipping: product.shipping_cost || '0.00 GBP',
              tax: product.tax_rate || '0%',
              mobile_link: `${import.meta.env.VITE_BACKEND_URL}products/${fullProductNameSlug}?mobile=true`,
              google_product_category: googleProductCategory
            };
          });
        }
      });

      console.log('CSV Data (All Products):', csvData);

      // POST the prepared data to the /upload/csv/all-products route
      axios.post(`${auth.ip}upload/csv/all-products`, csvData, {
        headers: {
          'Content-Type': 'application/json',
        }
      })
        .then(response => {
          setExportAllLoading(false); // Stop loading
          if (response.status === 200) {
            console.log(response);
            const correctedFilePath = correctFilePath(response.data.filePath);
            setFilePath(correctedFilePath);
            toast.success(response.data.message);
          } else {
            toast.error(`Failed to send data to the backend. Status code: ${response.status}`);
          }
        })
        .catch(error => {
          setExportAllLoading(false); // Stop loading on error
          console.error('Error sending data to backend:', error);
          toast.error('An error occurred while sending data to the backend.');
        });
    }
  };

  const handleCopyClick = () => {
    navigator.clipboard.writeText(filePath);
    toast.success("File path copied to clipboard!");
  };
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  return (
    <>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <Helmet>
        <title>All Products</title>
      </Helmet>
      <Side selectedPage={selectedPage} setSelectedPage={setSelectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
        <main className="py-5">
          <div className="px-4 sm:px-6 lg:px-8 ">
            <div className="my-10">
              <div className="mt-8 flow-root overflow-hidden">
                <div className="">
                  <div className="block py-2">
                    <div className="flex justify-start items-start mb-3">
                      <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">All Products</h1>
                    </div>
                    <div className="relative shadow-lg rounded-lg border border-gray-200">
                      <div className="flex flex-col sm:flex-row justify-between items-center w-full border-b border-gray-200 px-2 py-2">
                        <div className="p-0 sm:p-3 bg-white sm:rounded-lg sm:rounded-b-none w-full">
                          <label htmlFor="table-search" className="sr-only">Search</label>
                          <div className="relative mt-1 w-full">
                            <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                              </svg>
                            </div>
                            <input
                              type="text"
                              id="table-search"
                              className="block pt-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-full sm:w-80 bg-gray-50 focus:ring-primary focus:border-primary"
                              placeholder="Search for Products"
                              value={searchQuery}
                              onChange={handleSearchChange} // Update searchQuery state
                            />
                          </div>
                        </div>
                        <div className="p-4 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                          <div className="flex items-center gap-4 w-full max-w-2xl">
                            {/* Input field with clipboard button */}
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={filePath}
                                placeholder="File path will appear here after export"
                                readOnly
                                className="border border-gray-300 rounded-lg px-4 py-2 w-full ring-primary ring-2 focus:ring-primary focus:ring-2 outline-none"
                              />
                              <button
                                onClick={handleCopyClick}
                                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
                                title="Copy to clipboard"
                              >
                                <ClipboardDocumentIcon className="h-5 w-5" />
                              </button>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3">
                              <button
                                className={`px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 whitespace-nowrap ${exportLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                onClick={handleExportClick}
                                disabled={exportLoading}
                              >
                                {exportLoading ? (
                                  <>
                                    <svg className="animate-spin size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span>Exporting...</span>
                                  </>
                                ) : (
                                  <>
                                    <span>Export</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                    </svg>
                                  </>
                                )}
                              </button>

                              <button
                                className={`px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 whitespace-nowrap ${exportAllLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                onClick={handleExportAllProducts}
                                disabled={exportAllLoading}
                              >
                                {exportAllLoading ? (
                                  <>
                                    <svg className="animate-spin size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="hidden sm:inline">Exporting...</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="hidden sm:inline">Export All</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                                    </svg>
                                  </>
                                )}
                              </button>

                              <button
                                className={`px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 whitespace-nowrap ${accessoriesLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                                onClick={handleAccessoriesClick}
                                disabled={accessoriesLoading}
                              >
                                {accessoriesLoading ? (
                                  <>
                                    <svg className="animate-spin size-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="hidden sm:inline">Exporting...</span>
                                  </>
                                ) : (
                                  <>
                                    <span className="hidden sm:inline">Accessories</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 0 0 2.25-2.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v2.25A2.25 2.25 0 0 0 6 10.5Zm0 9.75h2.25A2.25 2.25 0 0 0 10.5 18v-2.25a2.25 2.25 0 0 0-2.25-2.25H6a2.25 2.25 0 0 0-2.25 2.25V18A2.25 2.25 0 0 0 6 20.25Zm9.75-9.75H18a2.25 2.25 0 0 0 2.25-2.25V6A2.25 2.25 0 0 0 18 3.75h-2.25A2.25 2.25 0 0 0 13.5 6v2.25a2.25 2.25 0 0 0 2.25 2.25Z" />
                                    </svg>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          <p className="text-base font-bold whitespace-nowrap">Total Products: {filteredProducts.length}</p>
                        </div>
                      </div>
                      <div className="overflow-x-auto scrollbar-thin scrollbar-webkit">
                        <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                          <thead className="text-xs text-black uppercase border-b border-gray-200">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-5 max-w-60 font-semibold"
                              >
                                Name
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-5 max-w-60 font-semibold"
                              >
                                Category
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-5 max-w-60 font-semibold"
                              >
                                Variants
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-5 max-w-60 font-semibold"
                              >
                                Condition
                              </th>
                            </tr>
                          </thead>
                          <tbody className="text-left bg-white">
                            {paginatedProducts.map((product) => {
                              const productNameSlug = product.producturl;
                          
                              return (
                                <tr key={product._id} className="border-b border-gray-200">
                                  <td className="whitespace-nowrap text-wrap px-6 py-3 max-w-80 text-sm w-ful">
                                    <div className="flex items-center gap-2.5">
                                      <div className="h-11 w-11 flex-shrink-0 flex justify-center">
                                        <Link to={`https://zextons.co.uk/products/${productNameSlug}`}>
                                          <img
                                            className="h-11  rounded-lg"
                                            src={`${auth.ip}${product.thumbnail_image?.path}`}
                                          // alt="productThumbnailImage"
                                          />
                                        </Link>
                                      </div>
                                      <div>
                                        <p className="text-base line-clamp-2">{product.name}</p>
                                        {/* <p className="text-base line-clamp-1">{product.producturl}</p> */}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="whitespace-pre-wrap px-6 py-3 max-w-60 text-sm text-gray-500 ">
                                    <p className="line-clamp-3">
                                      {product.category}
                                    </p>
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-3 max-w-60 text-sm text-gray-500">

                                    <div className=" text-gray-500 flex gap-2 items-center">
                                      <div>

                                        <b className="font-medium">Total Variants:</b> {" "}
                                        {product.variantValues.length}
                                      </div>
                                      <svg
                                        className="text-blue-600 cursor-pointer size-6"
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        onClick={() => handleOpenModal(product._id)}
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                        />
                                      </svg>
                                      {isModalOpen && selectedProductId === product._id && (
                                        <div
                                          id="default-modal"
                                          tabIndex="-1"
                                          aria-hidden="true"
                                          className="fixed inset-0 z-40 flex justify-center items-center bg-black bg-opacity-50"
                                        >
                                          <div className="relative p-4 w-full max-w-lg">
                                            <div className="relative bg-white rounded-lg shadow dark:bg-gray-200 max-h-full">
                                              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
                                                <h3 className="text-lg font-semibold text-gray-900">Product Details</h3>
                                                <button
                                                  type="button"
                                                  className="text-gray-400 bg-transparent hover:bg-blue-200 hover:text-blue-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-primary dark:hover:text-white"
                                                  onClick={handleCloseModal}
                                                >
                                                  <svg
                                                    className="w-3 h-3"
                                                    aria-hidden="true"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 14 14"
                                                  >
                                                    <path
                                                      stroke="currentColor"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                      strokeWidth="2"
                                                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                                                    />
                                                  </svg>
                                                  <span className="sr-only">Close modal</span>
                                                </button>
                                              </div>
                                              <div className="overflow-auto max-h-[calc(100vh-150px)] scrollbar-thin scrollbar-webkit" style={{ height: 'auto' }}>
                                                <div className="p-6">
                                                  <table className="table-auto w-full">
                                                    <thead>
                                                      <tr className="border-b border-gray-300">
                                                        <th className="px-4 py-2 text-left">Product</th>
                                                        <th className="px-4 py-2 text-center">Quantity</th>
                                                      </tr>
                                                    </thead>
                                                    <tbody>
                                                      {product.variantValues.map((variant, index) => (
                                                        <tr key={index} className="border-b border-gray-300">
                                                          <td className="py-2">
                                                            <b className="font-medium">{variant.name} :</b>
                                                          </td>
                                                          <td className="flex justify-center items-center py-2">
                                                            {variant.Quantity}
                                                            {variant.Quantity <= product.low_stock_quantity_alert && (
                                                              <span className="inline-flex items-center rounded-md bg-red-50 px-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-primary/20">
                                                                Low
                                                              </span>
                                                            )}
                                                          </td>
                                                        </tr>
                                                      ))}
                                                    </tbody>
                                                  </table>
                                                </div>
                                              </div>
                                              <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b">
                                                <button
                                                  type="button"
                                                  className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                                  onClick={handleCloseModal}
                                                >
                                                  Close
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>

                                      )}
                                    </div>
                                  
                                  </td>
                                  <td className="whitespace-nowrap px-6 py-3 max-w-60 text-sm text-gray-500">
                                    {product.condition}
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div className="px-4 py-2 border border-t-0 border-gray-200">
                        <div className="flex flex-row justify-between w-full">
                          <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-blue-600 rounded-lg text-white font-medium"
                          >
                            Previous
                          </button>
                          <span className="hidden sm:flex items-center text-sm font-bold">
                            Page {currentPage} of {totalPages}
                          </span>
                          <div className="flex items-center gap-3">
                            <div className="hidden sm:flex items-center">
                              <label htmlFor="itemsPerPage" className="mr-2 font-semibold hidden sm:flex">Rows per Page:</label>
                              <select
                                id="itemsPerPage"
                                className="border border-gray-300 rounded-lg"
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                              >
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                                <option value="100">100</option>
                              </select>
                            </div>
                            <button
                              onClick={() => handlePageChange(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="px-4 py-2 bg-blue-600 rounded-lg text-white font-medium "
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
