import { React, useEffect, useState } from "react";
import Side from "../nav/Side";
import Top from "../nav/Top";
import { useAuth } from "../../../context/Auth";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import classNames from 'classnames';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Helmet } from "react-helmet-async";
const ReviewDetail = () => {
    const [selectedPage, setSelectedPage] = useState("media");
    const [customerReviews, setCustomerReviews] = useState();
    const auth = useAuth();
    const { id } = useParams();
    const getProductReviews = () => {
        axios.get(`${auth.ip}get/all/product/reviews/${id}`).then((response) => {
            if (response.data.status === 201) {
                console.log('Reviews Data', response.data.product.reviewDetails)
                const reviews = response.data.product.reviewDetails;

                // Calculate total reviews and average rating
                const total = reviews.length;
                const average = (
                    reviews.reduce((acc, review) => acc + review.rating, 0) / total
                ).toFixed(1);

                // Count reviews by rating
                const countByStars = reviews.reduce((acc, review) => {
                    acc[review.rating] = (acc[review.rating] || 0) + 1;
                    return acc;
                }, {});

                setCustomerReviews(reviews);
                // setAverageRating(average);
                // setTotalReviews(total);
                // setReviewsCount(countByStars);

            } else {
                toast.error(response.data.message);
            }
        });
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [updatedStatus, setUpdatedStatus] = useState("");
    const [comment, setComment] = useState("");
    const [rating, setRating] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRating, setNewRating] = useState("");
    const [reviewText, setReviewText] = useState("");
    const [newEmail, setNewEmail] = useState(auth.user.email);
    const [newUsername, setNewUsername] = useState(
        `${auth.user.firstname} ${auth.user.lastname}`
    );
    const [editUsername, setEditUsername] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [createdTime, setCreatedTime] = useState(new Date());
    const [editCreatedTime, setEditCreatedTime] = useState(new Date());


    const openModal = (reviewId) => {
        const review = customerReviews.find(r => r._id === reviewId);
        setEditUsername(review.name);
        setEditEmail(review.email);
        setSelectedReview(review);
        setUpdatedStatus(review.status);
        setComment(review.comment);
        setRating(review.rating);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedReview(null);
    };

    const handleStatusChange = (event) => {
        setUpdatedStatus(event.target.value);
    };

    const handleCommentChange = (event) => {
        setComment(event.target.value);
    };

    const handleRatingChange = (event) => {
        setRating(event.target.value);
    };
    const handleSubmit = async () => {
        try {
            const response = await axios.patch(
                `${auth.ip}update/product/review/${selectedReview._id}`,
                {
                    name: editUsername,
                    email: editEmail,
                    // name: selectedReview.name,
                    // email: selectedReview.email,
                    comment: comment,
                    rating: rating,
                    status: updatedStatus,
                    DateTime: editCreatedTime,
                }
            );

            if (response.status === 200) {
                toast.success("Review updated successfully!");

                // Update the local state
                setCustomerReviews((prevReviews) =>
                    prevReviews.map((review) =>
                        review._id === selectedReview._id
                            ? {
                                ...review,
                                name: editUsername,
                                email: editEmail,
                                comment,
                                rating,
                                status: updatedStatus,
                                DateTime: editCreatedTime,
                            }
                            : review
                    )
                );

                closeModal(); // Close the modal after updating the state
            } else {
                toast.error("Failed to update the review.");
            }
        } catch (error) {
            console.error("Error updating review:", error);
            toast.error("An error occurred while updating the review.");
        }
    };


    useEffect(() => {
        getProductReviews();
    }, [])
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };
    const handleDelete = async (reviewId) => {
        if (window.confirm("Are you sure you want to delete this review?")) {
            try {
                const response = await axios.delete(`${auth.ip}delete/product/review/${reviewId}`);
                if (response.status === 200) {
                    toast.success("Review deleted successfully!");
                    // Refresh reviews list after deletion
                    getProductReviews();
                } else {
                    toast.error(response.data.message || "Failed to delete the review.");
                }
            } catch (error) {
                console.error("Error deleting review:", error);
                toast.error("An error occurred while deleting the review.");
            }
        }
    };
    const handleAddReview = async () => {
        const data = {
            fullName: newUsername,
            userEmail: newEmail,
            rating: newRating,
            review: reviewText,
            productId: id,
            status: updatedStatus,
            DateTime: createdTime,
        };
        console.log(data);
        try {
            const response = await axios.post(`${auth.ip}post/product/reviews`, {
                reviewDetails: data,
            });
            if (response.status === 201) {
                toast.success("Review added successfully!");
                getProductReviews();
                setIsAddModalOpen(false);
            } else {
                toast.error("Failed to add the review.");
            }
        } catch (error) {
            console.error("Error adding review:", error);
            toast.error("An error occurred while adding the review.");
        }
    };


    return (
        <>
            <Helmet>
                <title>Review Detail</title>
            </Helmet>
            <Side selectedPage={selectedPage} setSelectedPage={setSelectedPage} isSidebarOpen={isSidebarOpen} closeSidebar={closeSidebar} />
            <div className={`lg:pl-72 ${isSidebarOpen ? 'pl-0' : ''}`}>
                <Top toggleSidebar={toggleSidebar} isSidebarOpen={isSidebarOpen} />
                <main className="py-10">
                    <div className="px-4 sm:px-6 lg:px-8">
                        {/* Add Review Button */}
                        <div className="flex justify-end mb-4">
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                onClick={() => setIsAddModalOpen(true)}
                            >
                                Add Review
                            </button>
                        </div>

                        <div class="relative overflow-x-auto shadow-lg sm:rounded-lg border border-gray-300">

                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs uppercase text-gray-400">
                                    <tr className="border-b border-gray-300">
                                        <th scope="col" className="px-6 py-5 max-w-60">User Details</th>
                                        <th scope="col" className="px-6 py-5 max-w-60">Rating</th>
                                        <th scope="col" className="px-6 py-5 max-w-60" colSpan={2}>Review</th>
                                        <th scope="col" className="px-6 py-5 max-w-60">Status</th>
                                        <th scope="col" className="px-6 py-5 max-w-60">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {customerReviews && customerReviews.map((review, index) => (
                                        <tr className="bg-white border-b hover:bg-gray-300 cursor-pointer hover:text-gray-700" key={index}>
                                            <td scope="row" className="px-6 py-4 max-w-60">
                                                <div className="text-gray-900 font-semibold">{review.name}</div>
                                                <div className="text-gray-500">{review.email}</div>
                                                <div className="text-gray-400">
                                                    {review.DateTime ? new Intl.DateTimeFormat('en-GB', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                        second: '2-digit',
                                                    }).format(new Date(review.DateTime)) : "Invalid Date"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 max-w-60">{review.rating}</td>
                                            <td className="px-6 py-4 max-w-[400px]" colSpan={2}>
                                                {review.comment}
                                            </td>

                                            <td className="px-6 py-4 max-w-60">
                                                <span
                                                    className={classNames(
                                                        "text-xs font-medium me-2 px-2.5 py-0.5 rounded",
                                                        {
                                                            "bg-blue-100 text-blue-500": review.status === "Approved",
                                                            "bg-red-100 text-red-500": review.status === "Rejected",
                                                            "bg-blue-100 text-blue-500": review.status === "Pending",
                                                        }
                                                    )}
                                                >
                                                    {review.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 max-w-60">
                                                {/* Edit Icon */}
                                                <div className="flex items-center space-x-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"  data-modal-target="default-modal"
                                                        data-modal-toggle="default-modal"
                                                        onClick={() => openModal(review._id)}
                                                        className="cursor-pointer text-blue-600 hover:text-blue-700 mx-2 size-5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 7.125L16.862 4.487M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                                    </svg>
                                                    {/* Delete Icon */}

                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-red-600" onClick={() => handleDelete(review._id)}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {isModalOpen && selectedReview && (
                                <div
                                    id="default-modal"
                                    tabIndex="-1"
                                    aria-hidden="true"
                                    className="fixed top-0 right-0 left-0 z-50 flex justify-center items-center w-full h-full overflow-y-auto overflow-x-hidden bg-black bg-opacity-50"
                                >
                                    <div className="relative p-4 w-full max-w-2xl max-h-full">
                                        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                                            <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                    Review Details
                                                </h3>
                                                <button
                                                    type="button"
                                                    className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
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
                                            <form className="max-w-xl mx-auto grid grid-cols-2 gap-4">
                                                <div className="mb-5">
                                                    <label
                                                        htmlFor="username"
                                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                    >
                                                        Username
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="username"
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                        value={editUsername}
                                                        onChange={(e) => setEditUsername(e.target.value)} // Update state on change
                                                    />
                                                </div>

                                                <div className="mb-5">
                                                    <label
                                                        htmlFor="email"
                                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                    >
                                                        Email
                                                    </label>
                                                    <input
                                                        type="email"
                                                        id="email"
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                                        value={editEmail}
                                                        onChange={(e) => setEditEmail(e.target.value)} // Update state on change
                                                    />
                                                </div>

                                                <div className="mb-5 col-span-2 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label htmlFor="rating" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Rating</label>
                                                        <input type="number" id="rating" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" value={rating} onChange={handleRatingChange} min="1" max="5" required />
                                                    </div>
                                                    <div>
                                                        <label htmlFor="editCreatedTime" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Published Date Time</label>
                                                        <DatePicker selected={editCreatedTime} onChange={(date) => setEditCreatedTime(date)} showTimeSelect dateFormat="Pp" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5" />
                                                    </div>
                                                </div>


                                                <div className="mb-5 col-span-2">
                                                    <label
                                                        htmlFor="comment"
                                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                    >
                                                        Comment
                                                    </label>
                                                    <textarea
                                                        id="comment"
                                                        rows="4"
                                                        cols="50"
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        value={comment}
                                                        onChange={handleCommentChange}
                                                        required

                                                    />
                                                </div>

                                                <div className="mb-5 col-span-2">
                                                    <label
                                                        htmlFor="status"
                                                        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                                                    >
                                                        Status
                                                    </label>
                                                    <select
                                                        id="status"
                                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                                        value={updatedStatus}
                                                        onChange={handleStatusChange}
                                                    >
                                                        <option value="Approved">Approved</option>
                                                        <option value="Rejected">Rejected</option>
                                                        <option value="Pending">Pending</option>
                                                    </select>
                                                </div>
                                            </form>
                                            <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                                                <button
                                                    type="button"
                                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                                    onClick={handleSubmit}
                                                >
                                                    Submit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                                                    onClick={closeModal}
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {/* Add Review Modal */}
                            {isAddModalOpen && (
                                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                    <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
                                        <div className="flex justify-between items-center border-b pb-4">
                                            <h3 className="text-xl font-semibold">Add Review</h3>
                                            <button
                                                className="text-gray-400 hover:bg-gray-200 rounded-full p-2"
                                                onClick={() => setIsAddModalOpen(false)}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    className="w-5 h-5"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 18L18 6M6 6l12 12"
                                                    />
                                                </svg>
                                            </button>
                                        </div>
                                        <form className="max-w-xl mx-auto grid grid-cols-2 gap-4 pt-4">
                                            <div>
                                                <label
                                                    htmlFor="email"
                                                    className="block text-sm font-medium text-gray-900 mb-2"
                                                >
                                                    Email
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    value={newEmail}
                                                    onChange={(e) => setNewEmail(e.target.value)}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                                                />
                                            </div>
                                            <div>
                                                <label
                                                    htmlFor="username"
                                                    className="block text-sm font-medium text-gray-900 mb-2"
                                                >
                                                    Username
                                                </label>
                                                <input
                                                    type="text"
                                                    id="username"
                                                    value={newUsername}
                                                    onChange={(e) => setNewUsername(e.target.value)}
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                                                />
                                            </div>
                                            <div className="mb-5 col-span-2 grid grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="rating" className="block text-sm font-medium text-gray-900 mb-2">Rating</label>
                                                    <input type="number" id="rating" value={newRating} onChange={(e) => setNewRating(e.target.value)} placeholder="Rating (1-5)" min="1" max="5" required className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5" />
                                                </div>
                                                <div>
                                                    <label htmlFor="createdTime" className="block text-sm font-medium text-gray-900 mb-2">Published Date Time</label>
                                                    <DatePicker selected={createdTime} onChange={(date) => setCreatedTime(date)} showTimeSelect dateFormat="Pp" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5" />
                                                </div>
                                            </div>

                                            <div className="col-span-2">
                                                <label
                                                    htmlFor="comment"
                                                    className="block text-sm font-medium text-gray-900 mb-2"
                                                >
                                                    Comment
                                                </label>
                                                <textarea
                                                    id="comment"
                                                    value={reviewText}
                                                    rows="4"
                                                    cols="50"
                                                    onChange={(e) => setReviewText(e.target.value)}
                                                    placeholder="Write your review here"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                                                    required
                                                />
                                            </div>
                                            <div className="col-span-2">
                                                <label
                                                    htmlFor="status"
                                                    className="block text-sm font-medium text-gray-900 mb-2"
                                                >
                                                    Status
                                                </label>
                                                <select
                                                    id="status"
                                                    className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg block w-full p-2.5"
                                                    value={updatedStatus}
                                                    onChange={(e) => setUpdatedStatus(e.target.value)}
                                                >
                                                    <option value="Approved">Approved</option>
                                                    <option value="Rejected">Rejected</option>
                                                    <option value="Pending">Pending</option>
                                                </select>
                                            </div>
                                        </form>
                                        <div className="flex justify-end items-center border-t pt-4 mt-4">
                                            <button
                                                onClick={() => setIsAddModalOpen(false)}
                                                className="py-2 px-4 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg mr-4"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleAddReview}
                                                className="py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                            >
                                                Submit
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                    </div>
                </main>
            </div>
        </>
    )
}

export default ReviewDetail