import { useEffect, useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import LoadingBar from 'react-top-loading-bar';
import Side from '../nav/Side';
import Top from '../nav/Top';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import returnOrdersService from './service/returnOrdersService';
import { FaTimes, FaBoxOpen } from 'react-icons/fa';
// Import components
import {
    CustomerInfo,
    OrderDetails,
    StatusBadge,
    ProductsTable,
    NotesSection,
    ImagesSection,
} from './components/returnRequestDetails';

export default function EditReturnRequests() {
    const { id } = useParams();
    const [progress, setProgress] = useState(0);
    const [errState, setErrState] = useState(false);
    const [requestData, setRequestData] = useState(null);
    const [selectedPage, setSelectedPage] = useState("return-requests");
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    // Status Editing States
    const [editingStatus, setEditingStatus] = useState({});
    const [selectedStatuses, setSelectedStatuses] = useState({});

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    const getReturnRequest = useCallback(async () => {
        setProgress(10);
        try {
            const result = await returnOrdersService.getReturnRequestById(id);
            setProgress(50);
            if (result.success && result.status === 200) {
                setRequestData(result.returnRequest);
                setErrState(false);
            } else {
                setErrState(true);
            }
            setProgress(100);
        } catch (error) {
            console.error('Error fetching return request:', error);
            setErrState(true);
            setProgress(100);
        }
    }, [id]);

    useEffect(() => {
        getReturnRequest();
    }, [getReturnRequest]);

    const statusLabels = {
        pending: "Pending",
        accepted: "Accepted",
        rejected: "Rejected",
    };

    const statusColors = {
        Pending: "bg-yellow-500",
        Accepted: "bg-blue-600",
        Rejected: "bg-red-600",
    };

    const handleStatusChange = (orderId, event) => {
        const newValue = event.target.value;
        setSelectedStatuses((prevState) => ({
            ...prevState,
            [orderId]: newValue,
        }));
    };

    const capitalizeStatus = (status) => {
        return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
    };

    const handleSaveStatus = async (orderId) => {
        try {
            const updatedStatus = capitalizeStatus(selectedStatuses[orderId]);
            const result = await returnOrdersService.updateReturnRequestStatus(orderId, updatedStatus);
            console.log('Order status updated:', result);

            if (result.success && result.status === 200) {
                toast.success("Order status updated successfully.");
                setRequestData((prevData) => ({
                    ...prevData,
                    status: updatedStatus,
                }));
                setEditingStatus((prevState) => ({
                    ...prevState,
                    [orderId]: false,
                }));
            } else {
                console.error('Failed to update order status:', result.error);
                toast.error(result.error || "Failed to update order status.");
            }
        } catch (error) {
            console.error('An error occurred while updating order status:', error);
            toast.error("An error occurred while updating the order status.");
        }
    };

    // State to manage modal visibility and current image index
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const imageFiles = requestData?.files || [];

    // Utility function to correctly form image URLs
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

    const getImageUrl = (path) => {
        if (!path) return '/assets/images/fallback.jpg';
        if (path.startsWith('http')) return path;
        return `${BACKEND_URL}${path}`;
    };

    // Open modal and set the current image index
    const openModal = useCallback((index) => {
        console.log('Opening modal for image index:', index); // Debugging
        setCurrentImageIndex(index);
        setIsImageModalOpen(true);
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }, []);

    // Close modal
    const closeModal = useCallback(() => {
        setIsImageModalOpen(false);
        document.body.style.overflow = 'auto'; // Restore scrolling
    }, []);

    // Navigate to the previous image
    const prevImage = useCallback(() => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? imageFiles.length - 1 : prevIndex - 1
        );
    }, [imageFiles.length]);

    // Navigate to the next image
    const nextImage = useCallback(() => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === imageFiles.length - 1 ? 0 : prevIndex + 1
        );
    }, [imageFiles.length]);

    // Handle keyboard events for accessibility
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isImageModalOpen) return;
            if (e.key === 'Escape') {
                closeModal();
            } else if (e.key === 'ArrowLeft') {
                prevImage();
            } else if (e.key === 'ArrowRight') {
                nextImage();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isImageModalOpen, closeModal, prevImage, nextImage]);

    console.log(requestData);

    return (
        <>
            <Helmet>
                <title>Return Request Details</title>
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
            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <main className="py-5">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {errState ? (
                            <div className="mt-8 p-4 bg-red-100 text-red-800 rounded-md flex items-center">
                                <FaTimes className="mr-2" />
                                <strong>Error:</strong> Unable to fetch the return request data.
                            </div>
                        ) : (
                            <div className="mt-8">
                                {requestData ? (
                                    <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-300">
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold">Return Request Details</h2>
                                            {/* Status Badge with Edit Option */}
                                            <StatusBadge
                                                requestId={requestData._id}
                                                currentStatus={requestData.status}
                                                isEditing={editingStatus[requestData._id] || false}
                                                selectedStatus={selectedStatuses[requestData._id]}
                                                statusLabels={statusLabels}
                                                statusColors={statusColors}
                                                onEdit={(id, status) => {
                                                    setEditingStatus((prev) => ({ ...prev, [id]: true }));
                                                    setSelectedStatuses((prev) => ({ ...prev, [id]: status }));
                                                }}
                                                onCancel={(id) => setEditingStatus((prev) => ({ ...prev, [id]: false }))}
                                                onSave={handleSaveStatus}
                                                onChange={handleStatusChange}
                                            />
                                        </div>

                                        {/* Customer Information & Order Details */}
                                        <section className="mb-2 flex flex-col sm:flex-row justify-between items-center shadow-md rounded-lg ">
                                            <CustomerInfo customer={requestData.userId} />
                                            <OrderDetails
                                                order={requestData.orderId}
                                                requestOrderNumber={requestData.requestOrderNumber}
                                                status={requestData.status}
                                                statusLabels={statusLabels}
                                                createdAt={requestData.createdAt}
                                                updatedAt={requestData.updatedAt}
                                            />
                                        </section>

                                        {/* Ordered Products */}
                                        <ProductsTable
                                            products={requestData.orderId.cart}
                                            getImageUrl={getImageUrl}
                                            onImageClick={openModal}
                                        />

                                        {/* Notes */}
                                        <NotesSection notes={requestData.notes} />

                                        {/* Attached Images */}
                                        <ImagesSection
                                            images={imageFiles}
                                            getImageUrl={getImageUrl}
                                            isModalOpen={isImageModalOpen}
                                            currentImageIndex={currentImageIndex}
                                            onImageClick={openModal}
                                            onCloseModal={closeModal}
                                            onPrevImage={prevImage}
                                            onNextImage={nextImage}
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-8 p-4 bg-blue-100 text-blue-800 rounded-md flex items-center">
                                        <FaBoxOpen className="mr-2 inline" />
                                        Loading return request details...
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
