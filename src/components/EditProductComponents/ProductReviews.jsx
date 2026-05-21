import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from "../../context/Auth";
import classNames from "classnames";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function ProductReviews({ productId }) {
  const auth = useAuth();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRating, setEditRating] = useState("");
  const [editComment, setEditComment] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editCreatedTime, setEditCreatedTime] = useState(new Date());

  // Add Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRating, setNewRating] = useState("");
  const [newComment, setNewComment] = useState("");
  const [newStatus, setNewStatus] = useState("Approved");
  const [newCreatedTime, setNewCreatedTime] = useState(new Date());

  // Fetch reviews for this product
  const fetchReviews = async () => {
    if (!productId) return;
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${auth.ip}get/all/product/reviews/${productId}?includeAll=true`
      );
      if (response.data.status === 201) {
        setReviews(response.data.product.reviewDetails || []);
      } else {
        setReviews([]);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  // Set default values for add modal when auth changes
  useEffect(() => {
    if (auth.user) {
      setNewUsername(`${auth.user.firstname || ""} ${auth.user.lastname || ""}`.trim());
      setNewEmail(auth.user.email || "");
    }
  }, [auth.user]);

  // Open Edit Modal
  const openEditModal = (review) => {
    setSelectedReview(review);
    setEditUsername(review.name || "");
    setEditEmail(review.email || "");
    setEditRating(review.rating || "");
    setEditComment(review.comment || "");
    setEditStatus(review.status || "Pending");
    setEditCreatedTime(review.DateTime ? new Date(review.DateTime) : new Date());
    setIsEditModalOpen(true);
  };

  // Close Edit Modal
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedReview(null);
  };

  // Handle Edit Submit
  const handleEditSubmit = async () => {
    if (!selectedReview) return;
    try {
      const response = await axios.patch(
        `${auth.ip}update/product/review/${selectedReview._id}`,
        {
          name: editUsername,
          email: editEmail,
          comment: editComment,
          rating: editRating,
          status: editStatus,
          DateTime: editCreatedTime,
        }
      );

      if (response.status === 200) {
        toast.success("Review updated successfully!");
        setReviews((prevReviews) =>
          prevReviews.map((review) =>
            review._id === selectedReview._id
              ? {
                  ...review,
                  name: editUsername,
                  email: editEmail,
                  comment: editComment,
                  rating: editRating,
                  status: editStatus,
                  DateTime: editCreatedTime,
                }
              : review
          )
        );
        closeEditModal();
      } else {
        toast.error("Failed to update the review.");
      }
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("An error occurred while updating the review.");
    }
  };

  // Handle Delete
  const handleDelete = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        const response = await axios.delete(
          `${auth.ip}delete/product/review/${reviewId}`
        );
        if (response.status === 200) {
          toast.success("Review deleted successfully!");
          fetchReviews();
        } else {
          toast.error(response.data.message || "Failed to delete the review.");
        }
      } catch (error) {
        console.error("Error deleting review:", error);
        toast.error("An error occurred while deleting the review.");
      }
    }
  };

  // Open Add Modal
  const openAddModal = () => {
    setNewUsername(`${auth.user?.firstname || ""} ${auth.user?.lastname || ""}`.trim());
    setNewEmail(auth.user?.email || "");
    setNewRating("");
    setNewComment("");
    setNewStatus("Approved");
    setNewCreatedTime(new Date());
    setIsAddModalOpen(true);
  };

  // Close Add Modal
  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  // Handle Add Submit
  const handleAddSubmit = async () => {
    if (!newRating || !newComment) {
      toast.error("Please fill in rating and comment.");
      return;
    }

    try {
      const response = await axios.post(`${auth.ip}post/product/reviews`, {
        reviewDetails: {
          fullName: newUsername,
          userEmail: newEmail,
          rating: newRating,
          review: newComment,
          productId: productId,
          status: newStatus,
          DateTime: newCreatedTime,
        },
      });

      if (response.status === 201) {
        toast.success("Review added successfully!");
        fetchReviews();
        closeAddModal();
      } else {
        toast.error("Failed to add the review.");
      }
    } catch (error) {
      console.error("Error adding review:", error);
      toast.error("An error occurred while adding the review.");
    }
  };

  // Calculate stats
  const totalReviews = reviews.length;
  const approvedCount = reviews.filter((r) => r.status === "Approved").length;
  const pendingCount = reviews.filter((r) => r.status === "Pending").length;
  const rejectedCount = reviews.filter((r) => r.status === "Rejected").length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / totalReviews).toFixed(1)
      : "0.0";

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Product Reviews</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage reviews for this product
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
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
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          Add Review
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalReviews}</div>
          <div className="text-sm text-gray-500">Total Reviews</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{avgRating}</div>
          <div className="text-sm text-gray-500">Avg Rating</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{approvedCount}</div>
          <div className="text-sm text-gray-500">Approved</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{pendingCount}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="bg-red-50 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
          <div className="text-sm text-gray-500">Rejected</div>
        </div>
      </div>

      {/* Reviews Table */}
      {isLoading ? (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-500">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="w-12 h-12 mx-auto text-gray-400"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
            />
          </svg>
          <p className="mt-2 text-gray-500">No reviews yet for this product.</p>
          <button
            onClick={openAddModal}
            className="mt-4 text-primary hover:text-primary/80 font-medium"
          >
            Add the first review
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs uppercase bg-gray-50 text-gray-700">
              <tr>
                <th scope="col" className="px-6 py-4">
                  User Details
                </th>
                <th scope="col" className="px-6 py-4">
                  Rating
                </th>
                <th scope="col" className="px-6 py-4">
                  Review
                </th>
                <th scope="col" className="px-6 py-4">
                  Status
                </th>
                <th scope="col" className="px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((review, index) => (
                <tr
                  key={review._id || index}
                  className="bg-white border-b hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{review.name}</div>
                    <div className="text-gray-500 text-xs">{review.email}</div>
                    <div className="text-gray-400 text-xs mt-1">
                      {review.DateTime
                        ? new Intl.DateTimeFormat("en-GB", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          }).format(new Date(review.DateTime))
                        : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-yellow-500">
                        {review.rating}
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-4 h-4 text-yellow-400"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-xs">
                    <p className="truncate" title={review.comment}>
                      {review.comment}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={classNames(
                        "text-xs font-medium px-2.5 py-1 rounded-full",
                        {
                          "bg-blue-100 text-blue-600":
                            review.status === "Approved",
                          "bg-red-100 text-red-600": review.status === "Rejected",
                          "bg-blue-100 text-blue-600": review.status === "Pending",
                        }
                      )}
                    >
                      {review.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEditModal(review)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
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
                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(review._id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
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
                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Review Modal */}
      {isEditModalOpen && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Edit Review</h3>
              <button
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editRating}
                  onChange={(e) => setEditRating(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Published Date
                </label>
                <DatePicker
                  selected={editCreatedTime}
                  onChange={(date) => setEditCreatedTime(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment
                </label>
                <textarea
                  rows="4"
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Review Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-xl font-semibold text-gray-900">Add New Review</h3>
              <button
                onClick={closeAddModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (1-5) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={newRating}
                  onChange={(e) => setNewRating(e.target.value)}
                  placeholder="Enter rating 1-5"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Published Date
                </label>
                <DatePicker
                  selected={newCreatedTime}
                  onChange={(date) => setNewCreatedTime(date)}
                  showTimeSelect
                  dateFormat="Pp"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comment *
                </label>
                <textarea
                  rows="4"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write the review comment..."
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-primary focus:border-primary"
                >
                  <option value="Approved">Approved</option>
                  <option value="Pending">Pending</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <button
                onClick={closeAddModal}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
