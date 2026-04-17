
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useAuth } from "../../../../../context/Auth";

const ReturnItemModal = ({
    isReturnModalOpen,
    setIsReturnModalOpen,
    selectedOrderData,
}) => {
    const auth = useAuth();
    const [step, setStep] = useState(1);
    const [selectedReason, setSelectedReason] = useState("");
    const [orderImages, setOrderImages] = useState([]);
    const [orderDetails, setOrderDetails] = useState("");
    const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
    const [returnStatus, setReturnStatus] = useState("Pending");
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const fileInputRef = useRef(null);

    useEffect(() => {
        return () => {
            orderImages.forEach((image) => URL.revokeObjectURL(image.id));
        };
    }, []);

    const handleImageClick = (index) => {
        setCurrentImageIndex(index);
        setIsImagePreviewOpen(true);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? orderImages.length - 1 : prevIndex - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === orderImages.length - 1 ? 0 : prevIndex + 1
        );
    };

    const closeImagePreview = () => {
        setIsImagePreviewOpen(false);
    };

    const handleImageUpload = (e) => {
        const files = e.target.files;
        if (files) {
            const remainingSlots = 10 - orderImages.length;
            const filesToUpload = Array.from(files).slice(0, remainingSlots);
            const uploadedImages = filesToUpload.map((file) => ({
                id: URL.createObjectURL(file),
                file,
            }));
            setOrderImages([...uploadedImages, ...orderImages]);
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleRemoveImage = (id) => {
        setOrderImages((prevImages) => {
            const updatedImages = prevImages.filter((image) => image.id !== id);
            const removedImage = prevImages.find((image) => image.id === id);
            if (removedImage) {
                URL.revokeObjectURL(removedImage.id);
            }
            return updatedImages;
        });
    };

    const closeModal = () => {
        setIsReturnModalOpen(false);
        setSelectedReason("");
        setOrderDetails("");
        orderImages.forEach((image) => URL.revokeObjectURL(image.id));
        setOrderImages([]);
        setStep(1);
        setIsImagePreviewOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        console.log('Creating form data...');
        formData.append("orderDetails", JSON.stringify(selectedOrderData));
        console.log('Added orderDetails:', selectedOrderData);
        formData.append("reason", selectedReason);
        console.log('Added reason:', selectedReason);
        formData.append("status", returnStatus);
        console.log('Added status:', returnStatus);
        formData.append("additionalDetails", orderDetails);
        console.log('Added additionalDetails:', orderDetails);
        orderImages.forEach((image) => {
            console.log('Adding image:', image.file);
            formData.append("images", image.file);
        });
        console.log('Form data created:', formData);
        formData.forEach((value, key) => {
            console.log(`Key: ${key}, Value: ${value}`);
        });
        // return;
        try {
            const response = await axios.post(`${auth.ip}return/ThisItem`, formData);
            console.log("Response:", response.data);

            if (response.status === 200 || response.data.status === 200) {
                toast.success(response.data.message || "Return processed successfully.");
                closeModal();
            } else {
                console.error("Failed to send return details", response.data);
                toast.error(response.data.message || "Failed to send return details");
            }
        } catch (error) {
            console.error("Error submitting return details:", error);
            const errorMessage = error.response?.data?.message || "Error submitting return details";
            toast.error(errorMessage);
        }
    };

    const handleNext = () => {
        if (selectedReason) {
            setStep(2);
        }
    };

    const handleBack = () => {
        setStep(1);
    };

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    return (
        <>
            {isReturnModalOpen && (
                <div className="fixed inset-0 z-50 flex justify-center items-center 
                 overflow-y-auto bg-black bg-opacity-50">
                    <form
                        onSubmit={handleSubmit}
                        className="relative bg-white p-2 md:p-4 rounded-lg w-full max-w-screen-md mx-auto border border-gray-300 "
                        style={{ maxHeight: "90vh", overflowY: "auto" }}
                    >
                        <div className="sticky top-0 z-10 bg-white flex items-center justify-between p-4 md:p-5 border-b rounded-t border-primary">
                            <h3 className="text-lg font-semibold text-gray-900">Order Details</h3>
                            <button
                                type="button"
                                className="text-gray-400 bg-transparent hover:bg-blue-200 hover:text-blue-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center"
                                onClick={closeModal}
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

                        <div className="p-4">
                            {step === 1 && (
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-gray-700 text-sm font-medium mb-3">
                                            Why are you returning this item?
                                        </p>
                                        <fieldset className="space-y-4">
                                            {[
                                                "Ordered by mistake",
                                                "Arrived damaged",
                                                "Don't like it",
                                                "Missing parts or pieces",
                                                "Changed my mind",
                                                "Item is defective",
                                                "Received wrong item",
                                                "Doesn't fit",
                                                "Found a better price",
                                                "Doesn't match description or photos",
                                            ].map((reason, index) => (
                                                <div key={index} className="flex items-center">
                                                    <input
                                                        id={`return-reason-${index}`}
                                                        name="return-reason"
                                                        type="radio"
                                                        value={reason}
                                                        checked={selectedReason === reason}
                                                        onChange={() => setSelectedReason(reason)}
                                                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    <label
                                                        htmlFor={`return-reason-${index}`}
                                                        className="ml-3 block text-gray-700 font-medium"
                                                    >
                                                        {reason}
                                                    </label>
                                                </div>
                                            ))}
                                        </fieldset>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            className={`bg-primary text-white py-2 px-6 rounded-md cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedReason ? "" : "opacity-50 cursor-not-allowed"}`}
                                            onClick={handleNext}
                                            disabled={!selectedReason}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-6">
                                    <div className="flex items-center mb-4">
                                        <svg
                                            className="w-6 h-6 text-blue-600 mr-2"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4"
                                            />
                                        </svg>
                                        <p className="text-gray-800 text-lg font-medium">
                                            Reason:
                                            <span className="font-semibold text-blue-700 pl-1">
                                                {selectedReason}
                                            </span>
                                        </p>
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="orderDetails"
                                            className="block text-gray-700 text-sm font-medium mb-2"
                                        >
                                            Additional Details
                                        </label>
                                        <textarea
                                            id="orderDetails"
                                            name="orderDetails"
                                            className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                            placeholder="Provide any additional information about your return..."
                                            value={orderDetails}
                                            onChange={(e) => setOrderDetails(e.target.value)}
                                            rows={6}
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-gray-800 font-medium">
                                            Add Photos:
                                        </label>
                                        <input
                                            type="file"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            ref={fileInputRef}
                                            className="hidden"
                                        />
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                            {orderImages.map((image, index) => (
                                                <div key={image.id} className="relative">
                                                    <img
                                                        src={image.id}
                                                        alt="uploaded preview"
                                                        className="w-full h-24 object-cover rounded-md border cursor-pointer"
                                                        onClick={() => handleImageClick(index)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveImage(image.id);
                                                        }}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="w-3 h-3"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="M6 18L18 6M6 6l12 12"
                                                            />
                                                        </svg>
                                                    </button>
                                                </div>
                                            ))}
                                            {orderImages.length < 10 && (
                                                <button
                                                    type="button"
                                                    onClick={triggerFileInput}
                                                    className="w-full h-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="w-6 h-6 text-gray-400"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="M12 4.5v15m7.5-7.5h-15"
                                                        />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex justify-between pt-4">
                                        <button
                                            type="button"
                                            className="bg-gray-500 text-white py-2 px-6 rounded-md hover:bg-gray-600"
                                            onClick={handleBack}
                                        >
                                            Back
                                        </button>
                                        <button
                                            type="submit"
                                            className="bg-primary text-white py-2 px-6 rounded-md hover:bg-blue-600"
                                        >
                                            Confirm Return
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {isImagePreviewOpen && orderImages.length > 0 && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-75">
                    <div className="relative max-w-4xl w-full mx-4">
                        <button
                            className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                            onClick={closeImagePreview}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                        <img
                            src={orderImages[currentImageIndex].id}
                            alt={`Preview ${currentImageIndex + 1}`}
                            className="max-h-[80vh] w-full object-contain"
                        />
                        {orderImages.length > 1 && (
                            <div className="absolute inset-y-1/2 w-full flex justify-between px-4 transform -translate-y-1/2">
                                <button
                                    className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                                    onClick={handlePrevImage}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 19l-7-7 7-7"
                                        />
                                    </svg>
                                </button>
                                <button
                                    className="bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-75"
                                    onClick={handleNextImage}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-6 w-6"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 5l7 7-7 7"
                                        />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}        </>
    );
};

export default ReturnItemModal;
