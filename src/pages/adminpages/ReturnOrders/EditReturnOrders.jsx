import { useEffect, useState } from "react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { useAuth } from "../../../context/Auth";
import LoadingBar from "react-top-loading-bar";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import imageCompression from "browser-image-compression";

// Import components
import {
  CustomerDetailsSection,
  AddressDetailsSection,
  OrderDetailsSection,
  ProductDetailsSection,
  ProductNamesSection,
  DropdownsSection,
  OrderImagesSection,
  OrderDocumentsSection,
  AdditionalDetailsSection,
  ImagePreviewModal,
} from "./components/editReturnOrder";

// Import services
import { getReturnOrderById, updateReturnOrder } from "./service";

export default function EditReturnOrders() {
  const { id } = useParams();
  const auth = useAuth();
  const [progress, setProgress] = useState(0);
  const [selectedPage, setSelectedPage] = useState("return-orders");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    phoneNumber: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    originalTrackingNumber: "",
    returnTrackingNumber: "",
    orderNumber: "",
    rma: "",
    originalSerialNumber: "",
    replacementSerialNumber: "",
    notes: "",
    reason: "",
  });

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);
  const [selectedCustomerAsks, setSelectedCustomerAsks] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [productNames, setProductNames] = useState([""]);
  const [orderImages, setOrderImages] = useState([]);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [orderDocuments, setOrderDocuments] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setProgress(30);
      const result = await getReturnOrderById(id);

      if (result.success) {
        const data = result.returnOrder;
        const requestOrder = data.requestOrder;
        const user = requestOrder?.userId;
        const order = requestOrder?.orderId;
        const shippingDetails = order?.shippingDetails;

        const fullName =
          user?.firstname && user?.lastname
            ? `${user.firstname} ${user.lastname}`
            : user?.firstname || user?.lastname || "";

        setFormData({
          customerName:
            data.customerName ||
            fullName ||
            shippingDetails?.firstName + " " + shippingDetails?.lastName ||
            "",
          phoneNumber:
            data.phoneNumber ||
            user?.phoneNumber ||
            shippingDetails?.phoneNumber ||
            "",
          email:
            data.email || user?.email || order?.contactDetails?.email || "",
          address:
            data.address ||
            user?.address?.address ||
            shippingDetails?.address ||
            "",
          city: data.city || user?.address?.city || shippingDetails?.city || "",
          postalCode:
            data.postalCode ||
            user?.address?.postalCode ||
            shippingDetails?.postalCode ||
            "",
          orderNumber: data.orderNumber || order?.orderNumber || "",
          originalTrackingNumber:
            data.originalTrackingNumber ||
            shippingDetails?.trackingNumber ||
            "",
          returnTrackingNumber: data.returnTrackingNumber || "",
          rma: data.rma || "",
          originalSerialNumber: data.originalSerialNumber || "",
          replacementSerialNumber: data.replacementSerialNumber || "",
          notes: data.notes || requestOrder?.notes || "",
          reason: data.reason || requestOrder?.reason || "",
        });

        const productNamesFromCart =
          order?.cart?.map((item) => item.productName).filter(Boolean) || [];
        setProductNames(
          data.productNames ||
            (productNamesFromCart.length > 0 ? productNamesFromCart : [""])
        );

        setSelectedAccount(
          data.account ? { value: data.account, label: data.account } : null
        );
        setSelectedPlatform(
          data.platform ? { value: data.platform, label: data.platform } : null
        );
        setSelectedCustomerAsks(
          data.customerAsks
            ? { value: data.customerAsks, label: data.customerAsks }
            : null
        );
        setSelectedStatus(
          data.status ? { value: data.status, label: data.status } : null
        );
        setOrderImages(data.orderImages || requestOrder?.files || []);
        setOrderDocuments(data.orderDocuments || []);
        setIsLoading(false);
        setProgress(100);
      } else {
        toast.error(result.error || "Failed to fetch return order data.");
        setProgress(0);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    const compressedImages = [];

    for (const file of files) {
      if (allowedTypes.includes(file.type)) {
        try {
          const options = {
            maxSizeMB: 0.5,
            maxWidthOrHeight: 1024,
            useWebWorker: true,
          };
          const compressedFile = await imageCompression(file, options);
          compressedImages.push(compressedFile);
        } catch (error) {
          console.error("Image compression error:", error);
        }
      } else {
        toast.error(`${file.name} is not an allowed image type.`);
      }
    }

    setUploadedImages((prev) => [...prev, ...compressedImages]);
  };

  const removeImage = (index, isUploaded) => {
    if (isUploaded) {
      setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    } else {
      setOrderImages((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const pdfFiles = files.filter((file) => file.type === "application/pdf");
    setUploadedFiles((prev) => [...prev, ...pdfFiles]);
  };

  const removeFile = (index, isUploaded) => {
    if (isUploaded) {
      setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    } else {
      setOrderDocuments((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const payload = {
      ...formData,
      account: selectedAccount?.label,
      platform: selectedPlatform?.label,
      customerAsks: selectedCustomerAsks?.label,
      status: selectedStatus?.label,
      productNames: productNames,
    };

    const formDataToSend = new FormData();
    formDataToSend.append("data", JSON.stringify(payload));

    orderImages.forEach((image) => {
      formDataToSend.append("orderImages", image.path);
    });

    uploadedImages.forEach((image) => {
      formDataToSend.append("orderImages", image);
    });

    orderDocuments.forEach((file) => {
      formDataToSend.append("orderDocuments", file.path);
    });

    uploadedFiles.forEach((file) => {
      formDataToSend.append("orderDocuments", file);
    });

    const result = await updateReturnOrder(id, formDataToSend);

    if (result.success) {
      toast.success(result.message || "Return order updated successfully!");
      setIsEditMode(false);
    } else {
      toast.error(
        result.error || "Failed to update return order. Please try again."
      );
    }

    setIsSaving(false);
  };

  const handleProductNameChange = (index, value) => {
    const updatedProductNames = [...productNames];
    updatedProductNames[index] = value;
    setProductNames(updatedProductNames);
  };

  const handleAddProductName = () => {
    setProductNames((prev) => [...prev, ""]);
  };

  const handleRemoveProductName = (index) => {
    setProductNames((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <Helmet>
        <title>{isEditMode ? "Edit" : "View"} Return Order</title>
      </Helmet>
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />
      <Side
        selectedPage={selectedPage}
        setSelectedPage={setSelectedPage}
        isSidebarOpen={isSidebarOpen}
        closeSidebar={closeSidebar}
      />
      <div className={`lg:pl-72 ${isSidebarOpen ? "pl-0" : ""}`}>
        <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />

        <main className="py-4">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="mt-4">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl mb-4">
                {isEditMode ? "Edit Return Order" : "View Return Order"}
              </h1>

              {isLoading ? (
                <div className="flex justify-center items-center">
                  <div className="loader" />
                  <p className="ml-4 text-xs">Loading order details...</p>
                </div>
              ) : (
                <div className="relative shadow-lg rounded-lg px-4 py-3 bg-white border border-gray-100">
                  <form onSubmit={handleUpdate} className="space-y-4">
                    {/* Header with RMA and Edit Button */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center">
                        <p className="text-sm font-semibold text-gray-800">
                          Return Order No:{" "}
                        </p>
                        <h2 className="text-sm font-semibold text-gray-800 uppercase ps-2">
                          {formData.rma}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditMode((prev) => !prev)}
                        className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        {isEditMode ? "Cancel" : "Edit"}
                      </button>
                    </div>

                    {/* 3-Column Layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Column 1: Customer Details + Address Details */}
                      <div className="lg:col-span-1 space-y-4 min-w-0">
                        <CustomerDetailsSection
                          formData={formData}
                          isEditMode={isEditMode}
                          onInputChange={handleInputChange}
                        />
                        <AddressDetailsSection
                          formData={formData}
                          isEditMode={isEditMode}
                          onInputChange={handleInputChange}
                        />
                      </div>

                      {/* Column 2: Order Details + Product Details + Product Names + Dropdowns */}
                      <div className="lg:col-span-1 space-y-4 min-w-0">
                        <OrderDetailsSection
                          formData={formData}
                          isEditMode={isEditMode}
                          onInputChange={handleInputChange}
                        />
                        <ProductDetailsSection
                          formData={formData}
                          isEditMode={isEditMode}
                          onInputChange={handleInputChange}
                        />
                        <div className="space-y-4 bg-white shadow rounded-lg p-3 border border-gray-200 w-full">
                          <ProductNamesSection
                            productNames={productNames}
                            isEditMode={isEditMode}
                            onProductNameChange={handleProductNameChange}
                            onAddProductName={handleAddProductName}
                            onRemoveProductName={handleRemoveProductName}
                          />
                          <DropdownsSection
                            selectedAccount={selectedAccount}
                            selectedPlatform={selectedPlatform}
                            selectedStatus={selectedStatus}
                            selectedCustomerAsks={selectedCustomerAsks}
                            isEditMode={isEditMode}
                            onAccountChange={setSelectedAccount}
                            onPlatformChange={setSelectedPlatform}
                            onStatusChange={setSelectedStatus}
                            onCustomerAsksChange={setSelectedCustomerAsks}
                          />
                        </div>
                      </div>

                      {/* Column 3: Additional Details + Order Images + Order Documents */}
                      <div className="lg:col-span-1 space-y-4 min-w-0">
                        <AdditionalDetailsSection
                          formData={formData}
                          isEditMode={isEditMode}
                          isSaving={isSaving}
                          onInputChange={handleInputChange}
                        />
                        <OrderImagesSection
                          orderImages={orderImages}
                          uploadedImages={uploadedImages}
                          isEditMode={isEditMode}
                          baseUrl={auth.ip}
                          onImageUpload={handleImageUpload}
                          onRemoveImage={removeImage}
                          onImageClick={setPreviewImage}
                        />
                        <OrderDocumentsSection
                          orderDocuments={orderDocuments}
                          uploadedFiles={uploadedFiles}
                          isEditMode={isEditMode}
                          baseUrl={auth.ip}
                          onFileUpload={handleFileUpload}
                          onRemoveFile={removeFile}
                        />
                      </div>
                    </div>

                    {/* Image Preview Modal */}
                    <ImagePreviewModal
                      previewImage={previewImage}
                      baseUrl={auth.ip}
                      onClose={() => setPreviewImage(null)}
                    />
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
