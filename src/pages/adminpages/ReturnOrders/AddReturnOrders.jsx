import { useState, useEffect } from "react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { useAuth } from "../../../context/Auth";
import LoadingBar from "react-top-loading-bar";
import axios from "axios";
import { toast } from "react-toastify";
import { Helmet } from "react-helmet-async";
import CreatableSelect from "react-select/creatable";
import imageCompression from "browser-image-compression";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";

// Components
import { OptionManagementModal } from "./components/editReturnOrder";

// Services
import { getReturnOrderOptionsGrouped, createReturnOrderOption } from "./service";

// Utils
const generateRandomPassword = (length) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset[randomIndex];
    }
    return password;
};

export default function AddReturnOrders() {
    const auth = useAuth();
    const [progress, setProgress] = useState(0);
    const [selectedPage, setSelectedPage] = useState("return-orders");

    const [formData, setFormData] = useState({
        customerName: "",
        phoneNumber: "",
        email: "",
        address: "",
        city: "",
        postalCode: "",
        orderNumber: "",
        originalTrackingNumber: "",
        returnTrackingNumber: "",
        originalSerialNumber: "",
        replacementSerialNumber: "",
        reason: "",
        notes: "",
    });

    const [selectedAccount, setSelectedAccount] = useState(null);
    const [selectedPlatform, setSelectedPlatform] = useState(null);
    const [selectedCustomerAsks, setSelectedCustomerAsks] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [productNames, setProductNames] = useState([""]); // Initialize with one empty input

    // Dynamic dropdown options state
    const [accountOptions, setAccountOptions] = useState([]);
    const [platformOptions, setPlatformOptions] = useState([]);
    const [statusOptions, setStatusOptions] = useState([]);
    const [customerAsksOptions, setCustomerAsksOptions] = useState([]);
    const [isLoadingOptions, setIsLoadingOptions] = useState(true);
    const [isCreating, setIsCreating] = useState({
        account: false,
        platform: false,
        status: false,
        customerAsks: false
    });

    // Modal state for option management
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: '',
        type: '',
        options: [],
        setOptions: null
    });

    const [uploadedImages, setUploadedImages] = useState([]);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [previewImage, setPreviewImage] = useState(null); // For fullscreen preview

    // Fetch dropdown options on mount
    useEffect(() => {
        fetchDropdownOptions();
    }, []);

    const fetchDropdownOptions = async () => {
        setIsLoadingOptions(true);
        const result = await getReturnOrderOptionsGrouped();

        if (result.success && result.options) {
            const { account, platform, status, customerAsks } = result.options;
            setAccountOptions(formatOptions(account));
            setPlatformOptions(formatOptions(platform));
            setStatusOptions(formatOptions(status));
            setCustomerAsksOptions(formatOptions(customerAsks));
        }
        setIsLoadingOptions(false);
    };

    // Format options for react-select
    const formatOptions = (options) => {
        return options?.map(opt => ({
            value: opt.name.toLowerCase().replace(/\s+/g, ''),
            label: opt.name,
            _id: opt._id
        })) || [];
    };

    // Handle creating new option
    const handleCreateOption = async (inputValue, type, setOptions, onChange) => {
        setIsCreating(prev => ({ ...prev, [type]: true }));

        const result = await createReturnOrderOption(inputValue, type);

        if (result.success && result.option) {
            const newOption = {
                value: result.option.name.toLowerCase().replace(/\s+/g, ''),
                label: result.option.name,
                _id: result.option._id
            };

            setOptions(prev => [...prev, newOption]);
            onChange(newOption);
            toast.success(`"${inputValue}" added successfully`);
        } else {
            toast.error(result.error || 'Failed to create option');
        }

        setIsCreating(prev => ({ ...prev, [type]: false }));
    };

    // Custom styles for dropdowns
    const selectStyles = {
        control: (provided) => ({
            ...provided,
            borderRadius: "6px",
            textTransform: "capitalize",
        }),
        singleValue: (provided) => ({
            ...provided,
            textTransform: "capitalize",
        }),
        option: (provided) => ({
            ...provided,
            textTransform: "capitalize",
        }),
    };

    // Open management modal
    const openManageModal = (title, type, options, setOptions) => {
        setModalConfig({
            isOpen: true,
            title,
            type,
            options,
            setOptions
        });
    };

    // Close management modal
    const closeManageModal = () => {
        setModalConfig(prev => ({ ...prev, isOpen: false }));
    };

    // Handle options update from modal
    const handleOptionsUpdate = (updatedOptions) => {
        if (modalConfig.setOptions) {
            modalConfig.setOptions(updatedOptions);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleProductNameChange = (index, value) => {
        const updatedProductNames = [...productNames];
        updatedProductNames[index] = value;
        setProductNames(updatedProductNames);
    };

    const handleAddProductName = () => {
        setProductNames([...productNames, ""]);
    };

    const handleRemoveProductName = (index) => {
        const updatedProductNames = productNames.filter((_, i) => i !== index);
        setProductNames(updatedProductNames);
    };

    const handleImageUpload = async (e) => {
        const Imagefiles = Array.from(e.target.files);
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
        const compressedImages = [];

        for (const file of Imagefiles) {
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

    const handleFileUpload = (e) => {
        const documentFiles = Array.from(e.target.files);
        const pdfFiles = documentFiles.filter((file) => file.type === "application/pdf");
        setUploadedFiles((prev) => [...prev, ...pdfFiles]);
    };

    const removeImage = (index) => {
        setUploadedImages((prev) => prev.filter((_, i) => i !== index));
    };

    const removeFile = (index) => {
        setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const randomPassword = generateRandomPassword(8);

        // Determine if user registration is required
        const shouldRegisterUser = formData.customerName && formData.email && formData.phoneNumber;

        // Split customerName if it exists
        const nameParts = formData.customerName ? formData.customerName.trim().split(" ") : ["", ""];
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || "";

        // Regex patterns for validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const nameRegex = /^[a-zA-Z]+(?: [a-zA-Z]+)?$/;
        const phoneRegex = /^(?:0|\+?44)(?:\d\s?){9,10}$/;

        // Initialize validation
        let validationErrors = {};
        let valid = true;

        if (shouldRegisterUser) {
            if (!emailRegex.test(formData.email)) {
                validationErrors.email = "Enter a valid email address";
                valid = false;
            }

            if (!firstName || !nameRegex.test(firstName)) {
                validationErrors.firstName = "Enter a valid first name (letters only)";
                valid = false;
            }

            if (!lastName || !nameRegex.test(lastName)) {
                validationErrors.lastName = "Enter a valid last name (letters only)";
                valid = false;
            }

            if (!phoneRegex.test(formData.phoneNumber)) {
                validationErrors.phoneNumber = "Enter a valid UK phone number";
                valid = false;
            }
        }

        if (!valid) {
            Object.entries(validationErrors).forEach(([, message]) => {
                toast.error(message);
            });
            return;
        }

        try {
            if (shouldRegisterUser) {
                const userPayload = {
                    firstName: firstName || "Guest",
                    lastName: lastName || "User",
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    adminregisterUser: true,
                    password: randomPassword,
                };

                setProgress(30);
                const registerResponse = await axios.post(
                    `${auth.ip}registerUser/fromAdmin`,
                    userPayload,
                    { headers: { "Content-Type": "application/json" } }
                );

                if (registerResponse.data.status === 201 && registerResponse.data.user) {
                    toast.success("User registered successfully!");
                    const newUserId = registerResponse.data.user._id;
                    await handleReturnOrderSubmission(newUserId);
                } else if (
                    registerResponse.data.status === 409 &&
                    registerResponse.data.user
                ) {
                    const existingUserId = registerResponse.data.user._id;
                    toast.info("User is already present on the website!");
                    await handleReturnOrderSubmission(existingUserId);
                } else {
                    toast.error(
                        registerResponse.data.message || "Failed to register user."
                    );
                    setProgress(0);
                }
            } else {
                // Submit return order without user registration
                await handleReturnOrderSubmission(null);
            }
        } catch (error) {
            console.error("Error submitting form:", error);

            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to submit form. Please try again.");
            }
            setProgress(0);
        }
    };

    const handleReturnOrderSubmission = async (userId) => {
        try {
            const returnOrderPayload = {
                ...(userId && { userId }),
                customerName: formData.customerName || "",
                phoneNumber: formData.phoneNumber || "",
                email: formData.email || "",
                address: formData.address || "",
                city: formData.city || "",
                postalCode: formData.postalCode || "",
                orderNumber: formData.orderNumber || "",
                originalTrackingNumber: formData.originalTrackingNumber || "",
                returnTrackingNumber: formData.returnTrackingNumber || "",
                originalSerialNumber: formData.originalSerialNumber || "",
                replacementSerialNumber: formData.replacementSerialNumber || "",
                reason: formData.reason || "",
                notes: formData.notes || "",
                account: selectedAccount?.label || "",
                platform: selectedPlatform?.label || "",
                customerAsks: selectedCustomerAsks?.label || "",
                status: selectedStatus?.label || "",
                productNames: productNames.map(name => name || ""),
            };

            const formDataToSend = new FormData();
            formDataToSend.append("data", JSON.stringify(returnOrderPayload));

            if (uploadedImages.length > 0) {
                uploadedImages.forEach((image) => {
                    formDataToSend.append("orderImages", image, image.name);
                });
            }

            if (uploadedFiles.length > 0) {
                uploadedFiles.forEach((file) => {
                    formDataToSend.append("orderDocuments", file, file.name);
                });
            }

            setProgress(60);

            const returnResponse = await axios.post(
                `${auth.ip}return/order`,
                formDataToSend,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );

            if (returnResponse.data.status === 201) {
                toast.success("Return order added successfully!");
                setProgress(100);
                // Reset form
                setFormData({
                    customerName: "",
                    phoneNumber: "",
                    email: "",
                    address: "",
                    city: "",
                    postalCode: "",
                    orderNumber: "",
                    originalTrackingNumber: "",
                    returnTrackingNumber: "",
                    originalSerialNumber: "",
                    replacementSerialNumber: "",
                    reason: "",
                    notes: "",
                });
                setSelectedAccount(null);
                setSelectedPlatform(null);
                setSelectedCustomerAsks(null);
                setSelectedStatus(null);
                setProductNames([""]);
                setUploadedImages([]);
                setUploadedFiles([]);
            } else {
                toast.error(
                    returnResponse.data.message || "Failed to add return order."
                );
                setProgress(0);
            }
        } catch (error) {
            console.error("Error submitting return order:", error);

            if (error.response && error.response.data && error.response.data.message) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Failed to submit return order. Please try again.");
            }
            setProgress(0);
        }
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
            <Helmet>
                <title>Add Return Order</title>
            </Helmet>
            <LoadingBar
                color="#2563EB"
                progress={progress}
                onLoaderFinished={() => setProgress(0)}
            />
            <Side selectedPage={selectedPage} setSelectedPage={setSelectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <main className="py-5">
                    <div className="px-4 sm:px-6 lg:px-8">
                        <div>
                            <div className="mt-8">
                                <div className="">
                                    <div className="flex justify-start items-start mb-3">
                                        <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Add New Return Order</h1>
                                    </div>
                                    <div className="relative shadow-lg rounded-lg px-4 py-2">

                                        <form onSubmit={handleSubmit} className="space-y-6">
                                            {/* Customer Details */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Customer Name */}
                                                <div>
                                                    <label htmlFor="customerName" className="block text-sm font-medium leading-6 text-gray-900">
                                                        Customer Name
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="customerName"
                                                        id="customerName"
                                                        value={formData.customerName}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                        placeholder="Enter customer name"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="phoneNumber" className="block text-sm font-medium leading-6 text-gray-900">Phone Number</label>
                                                    <input
                                                        type="text"
                                                        name="phoneNumber"
                                                        id="phoneNumber"
                                                        value={formData.phoneNumber}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        name="email"
                                                        id="email"
                                                        value={formData.email}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="address" className="block text-sm font-medium leading-6 text-gray-900">Address</label>
                                                    <input
                                                        type="text"
                                                        name="address"
                                                        id="address"
                                                        value={formData.address}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="city" className="block text-sm font-medium leading-6 text-gray-900">City</label>
                                                    <input
                                                        type="text"
                                                        name="city"
                                                        id="city"
                                                        value={formData.city}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="postalCode" className="block text-sm font-medium leading-6 text-gray-900">Postal Code</label>
                                                    <input
                                                        type="text"
                                                        name="postalCode"
                                                        id="postalCode"
                                                        value={formData.postalCode}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="originalTrackingNumber" className="block text-sm font-medium leading-6 text-gray-900">Original Tracking Number</label>
                                                    <input
                                                        type="text"
                                                        name="originalTrackingNumber"
                                                        id="originalTrackingNumber"
                                                        value={formData.originalTrackingNumber}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="returnTrackingNumber" className="block text-sm font-medium leading-6 text-gray-900">Return Tracking Number</label>
                                                    <input
                                                        type="text"
                                                        name="returnTrackingNumber"
                                                        id="returnTrackingNumber"
                                                        value={formData.returnTrackingNumber}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="orderNumber" className="block text-sm font-medium leading-6 text-gray-900">
                                                        Order Number
                                                    </label>
                                                    <input
                                                        type="text"
                                                        name="orderNumber"
                                                        id="orderNumber"
                                                        value={formData.orderNumber}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                        placeholder="Enter order number"
                                                    />
                                                </div>
                                            </div>

                                            {/* Product Names */}
                                            <div>
                                                <label className="block text-sm font-medium leading-6 text-gray-900">Product Names</label>
                                                {productNames.map((name, index) => (
                                                    <div key={index} className="flex items-center gap-4 mt-2">
                                                        <input
                                                            type="text"
                                                            value={name}
                                                            onChange={(e) => handleProductNameChange(index, e.target.value)}
                                                            className="block w-full rounded-md border-gray-300 shadow-sm"
                                                            placeholder={`Product Name ${index + 1}`}
                                                        />
                                                        {index === 0 ? (
                                                            <button
                                                                type="button"
                                                                onClick={handleAddProductName}
                                                                className="px-1 py-1 bg-primary text-white rounded-md shadow"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                                                </svg>
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => handleRemoveProductName(index)}
                                                                className="px-1 py-1 bg-red-600 text-white rounded-md shadow"
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Dropdowns */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label htmlFor="originalSerialNumber" className="block text-sm font-medium leading-6 text-gray-900">Original Serial Number</label>
                                                    <input
                                                        type="text"
                                                        name="originalSerialNumber"
                                                        id="originalSerialNumber"
                                                        value={formData.originalSerialNumber}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                    />
                                                </div>

                                                <div>
                                                    <label htmlFor="replacementSerialNumber" className="block text-sm font-medium leading-6 text-gray-900">Replacement Serial Number</label>
                                                    <input
                                                        type="text"
                                                        name="replacementSerialNumber"
                                                        id="replacementSerialNumber"
                                                        value={formData.replacementSerialNumber}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="block text-sm font-medium leading-6 text-gray-900">Account</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => openManageModal('Account', 'account', accountOptions, setAccountOptions)}
                                                            className="p-1 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                                                            title="Manage Account Options"
                                                        >
                                                            <Cog6ToothIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <CreatableSelect
                                                        isClearable
                                                        isLoading={isLoadingOptions || isCreating.account}
                                                        options={accountOptions}
                                                        value={selectedAccount}
                                                        onChange={setSelectedAccount}
                                                        onCreateOption={(inputValue) =>
                                                            handleCreateOption(inputValue, 'account', setAccountOptions, setSelectedAccount)
                                                        }
                                                        styles={selectStyles}
                                                        className="mt-1"
                                                        placeholder="Select or create..."
                                                        formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                                                    />
                                                </div>

                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="block text-sm font-medium leading-6 text-gray-900">Platform</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => openManageModal('Platform', 'platform', platformOptions, setPlatformOptions)}
                                                            className="p-1 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                                                            title="Manage Platform Options"
                                                        >
                                                            <Cog6ToothIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <CreatableSelect
                                                        isClearable
                                                        isLoading={isLoadingOptions || isCreating.platform}
                                                        options={platformOptions}
                                                        value={selectedPlatform}
                                                        onChange={setSelectedPlatform}
                                                        onCreateOption={(inputValue) =>
                                                            handleCreateOption(inputValue, 'platform', setPlatformOptions, setSelectedPlatform)
                                                        }
                                                        styles={selectStyles}
                                                        className="mt-1"
                                                        placeholder="Select or create..."
                                                        formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="block text-sm font-medium leading-6 text-gray-900">Status</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => openManageModal('Status', 'status', statusOptions, setStatusOptions)}
                                                            className="p-1 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                                                            title="Manage Status Options"
                                                        >
                                                            <Cog6ToothIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <CreatableSelect
                                                        isClearable
                                                        isLoading={isLoadingOptions || isCreating.status}
                                                        options={statusOptions}
                                                        value={selectedStatus}
                                                        onChange={setSelectedStatus}
                                                        onCreateOption={(inputValue) =>
                                                            handleCreateOption(inputValue, 'status', setStatusOptions, setSelectedStatus)
                                                        }
                                                        styles={selectStyles}
                                                        className="mt-1"
                                                        placeholder="Select or create..."
                                                        formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                                                    />
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <label className="block text-sm font-medium leading-6 text-gray-900">Customer Asks</label>
                                                        <button
                                                            type="button"
                                                            onClick={() => openManageModal('Customer Asks', 'customerAsks', customerAsksOptions, setCustomerAsksOptions)}
                                                            className="p-1 text-gray-500 hover:text-primary hover:bg-gray-100 rounded-md transition-colors"
                                                            title="Manage Customer Asks Options"
                                                        >
                                                            <Cog6ToothIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <CreatableSelect
                                                        isClearable
                                                        isLoading={isLoadingOptions || isCreating.customerAsks}
                                                        options={customerAsksOptions}
                                                        value={selectedCustomerAsks}
                                                        onChange={setSelectedCustomerAsks}
                                                        onCreateOption={(inputValue) =>
                                                            handleCreateOption(inputValue, 'customerAsks', setCustomerAsksOptions, setSelectedCustomerAsks)
                                                        }
                                                        styles={selectStyles}
                                                        className="mt-1"
                                                        placeholder="Select or create..."
                                                        formatCreateLabel={(inputValue) => `Add "${inputValue}"`}
                                                    />
                                                </div>
                                            </div>

                                            {/* Image Upload Section */}
                                            <div>
                                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                                    Upload Images
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".jpeg, .jpg, .png, .webp"
                                                    multiple
                                                    onChange={handleImageUpload}
                                                    className="mt-2 block w-full text-gray-900 border rounded-md"
                                                />
                                                <div className="mt-4 flex flex-wrap gap-4">
                                                    {uploadedImages.map((image, index) => (
                                                        <div
                                                            key={index}
                                                            className="relative w-24 h-24 cursor-pointer"
                                                            onClick={() => setPreviewImage(URL.createObjectURL(image))}
                                                        >
                                                            <img
                                                                src={URL.createObjectURL(image)}
                                                                alt="Uploaded Preview"
                                                                className="w-full h-full object-cover rounded-md"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    removeImage(index);
                                                                }}
                                                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                                                            >
                                                                &times;
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* File Upload Section */}
                                            <div>
                                                <label className="block text-sm font-medium leading-6 text-gray-900">
                                                    Upload PDF Files
                                                </label>
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    multiple
                                                    onChange={handleFileUpload}
                                                    className="mt-2 block w-full text-gray-900 border rounded-md"
                                                />
                                                <ul className="mt-4 space-y-2">
                                                    {uploadedFiles.map((file, index) => (
                                                        <li key={index} className="flex items-center justify-between">
                                                            <a
                                                                href={URL.createObjectURL(file)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-blue-500 hover:underline"
                                                            >
                                                                {file.name}
                                                            </a>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeFile(index)}
                                                                className="text-red-500 hover:underline"
                                                            >
                                                                Remove
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            {/* Image Preview Modal */}
                                            {previewImage && (
                                                <div
                                                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                                                    onClick={() => setPreviewImage(null)}
                                                >
                                                    <img
                                                        src={previewImage}
                                                        alt="Preview"
                                                        className="max-w-full max-h-full rounded-md"
                                                    />
                                                </div>
                                            )}

                                            {/* Reason and Notes */}
                                            <div className="grid grid-cols-1 gap-6">
                                                <div>
                                                    <label htmlFor="reason" className="block text-sm font-medium leading-6 text-gray-900">Reason</label>
                                                    <textarea
                                                        name="reason"
                                                        id="reason"
                                                        rows="4"
                                                        value={formData.reason}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                    ></textarea>
                                                </div>
                                                <div>
                                                    <label htmlFor="notes" className="block text-sm font-medium leading-6 text-gray-900">Notes</label>
                                                    <textarea
                                                        name="notes"
                                                        id="notes"
                                                        rows="4"
                                                        value={formData.notes}
                                                        onChange={handleInputChange}
                                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                                    ></textarea>
                                                </div>
                                            </div>

                                            {/* Submit Button */}
                                            <div className="flex justify-end">
                                                <button
                                                    type="submit"
                                                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700"
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Option Management Modal */}
            <OptionManagementModal
                isOpen={modalConfig.isOpen}
                onClose={closeManageModal}
                title={modalConfig.title}
                type={modalConfig.type}
                options={modalConfig.options}
                onOptionsUpdate={handleOptionsUpdate}
            />
        </>
    )
}
