import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const getHeaders = () => ({
  'x-user-role': 'admin',
  'Content-Type': 'application/json',
});

const getUploadHeaders = () => ({
  'x-user-role': 'admin',
});

// ============================================================================
// BOOKING SETTINGS
// ============================================================================

export const getBookingSettings = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}booking/settings`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching booking settings:', error);
    toast.error('Failed to load booking settings');
    return null;
  }
};

export const updateBookingSettings = async (settings) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}booking/settings`, settings, {
      headers: getHeaders(),
    });
    if (response.data.status === 200) {
      toast.success('Booking settings updated successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error updating booking settings:', error);
    toast.error(error.response?.data?.error || 'Failed to update settings');
    return null;
  }
};

// ============================================================================
// BOOKING PAGE SEO
// ============================================================================

export const getBookingSeo = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}booking/settings/seo`, {
      headers: getHeaders(),
    });
    if (response.data?.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching booking SEO:', error);
    toast.error('Failed to load booking SEO');
    return null;
  }
};

export const patchBookingSeo = async ({ metaTitle, metaDescription, jsonLd }) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}booking/settings/seo`,
      { metaTitle, metaDescription, jsonLd },
      { headers: getHeaders() }
    );
    if (response.data?.success) {
      toast.success('Booking SEO saved');
      return response.data.data;
    }
    toast.error(response.data?.message || 'Failed to save booking SEO');
    return null;
  } catch (error) {
    console.error('Error saving booking SEO:', error);
    toast.error(error.response?.data?.message || 'Failed to save booking SEO');
    return null;
  }
};

// ============================================================================
// BOOKING PAGE CONTENT
// ============================================================================

export const getBookingPageContent = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}booking/settings/content`, {
      headers: getHeaders(),
    });
    if (response.data?.success) {
      return response.data.data;
    }
    return null;
  } catch (error) {
    console.error('Error fetching booking page content:', error);
    toast.error('Failed to load booking page content');
    return null;
  }
};

export const patchBookingPageContent = async (content) => {
  try {
    const response = await axios.patch(
      `${API_BASE_URL}booking/settings/content`,
      { content },
      { headers: getHeaders() }
    );
    if (response.data?.success) {
      toast.success('Booking page content saved');
      return response.data.data;
    }
    toast.error(response.data?.message || 'Failed to save content');
    return null;
  } catch (error) {
    console.error('Error saving booking page content:', error);
    toast.error(error.response?.data?.message || 'Failed to save content');
    return null;
  }
};

// ============================================================================
// BOOKING PACKAGES
// ============================================================================

export const getPackages = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}get/booking/packages/admin`, {
      headers: getHeaders(),
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching packages:', error);
    toast.error('Failed to load packages');
    return null;
  }
};

export const getPackageById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}get/booking/package/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching package:', error);
    toast.error('Failed to load package');
    return null;
  }
};

export const uploadPackageImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await axios.post(`${API_BASE_URL}booking/upload-package-image`, formData, {
      headers: getUploadHeaders(),
    });

    const imageUrl =
      response.data.imageUrl ||
      response.data.imagePath ||
      response.data.data?.url ||
      null;

    if (!imageUrl) {
      toast.error('Upload succeeded but no image URL was returned');
      return null;
    }

    return imageUrl;
  } catch (error) {
    console.error('Error uploading package image:', error);
    toast.error(error.response?.data?.message || 'Failed to upload image');
    return null;
  }
};

export const createPackage = async (packageData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}create/booking/package`, packageData, {
      headers: getHeaders(),
    });
    if (response.data.status === 201) {
      toast.success('Package created successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error creating package:', error);
    toast.error(error.response?.data?.error || 'Failed to create package');
    return null;
  }
};

export const updatePackage = async (id, packageData) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}update/booking/package/${id}`, packageData, {
      headers: getHeaders(),
    });
    if (response.data.status === 200) {
      toast.success('Package updated successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error updating package:', error);
    toast.error(error.response?.data?.error || 'Failed to update package');
    return null;
  }
};

export const deletePackage = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}delete/booking/package/${id}`, {
      headers: getHeaders(),
    });
    if (response.data.status === 200) {
      toast.success('Package deleted successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error deleting package:', error);
    toast.error(error.response?.data?.error || 'Failed to delete package');
    return null;
  }
};

export const reorderPackages = async (orderedIds) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}reorder/booking/packages`, {
      orderedIds,
    }, {
      headers: getHeaders(),
    });
    if (response.data.status === 200) {
      toast.success('Package order updated');
    }
    return response.data;
  } catch (error) {
    console.error('Error reordering packages:', error);
    toast.error(error.response?.data?.error || 'Failed to reorder packages');
    return null;
  }
};

// ============================================================================
// AVAILABILITY
// ============================================================================

export const getAvailability = async (type) => {
  try {
    const response = await axios.get(`${API_BASE_URL}get/booking/availability`, {
      headers: getHeaders(),
      params: { type },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching availability:', error);
    toast.error('Failed to load availability');
    return null;
  }
};

export const createAvailability = async (availabilityData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}create/booking/availability`, availabilityData, {
      headers: getHeaders(),
    });
    if (response.data.status === 201) {
      toast.success('Availability created successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error creating availability:', error);
    toast.error(error.response?.data?.error || 'Failed to create availability');
    return null;
  }
};

export const updateAvailability = async (id, availabilityData) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}update/booking/availability/${id}`, availabilityData, {
      headers: getHeaders(),
    });
    if (response.data.status === 200) {
      toast.success('Availability updated successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error updating availability:', error);
    toast.error(error.response?.data?.error || 'Failed to update availability');
    return null;
  }
};

export const deleteAvailability = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}delete/booking/availability/${id}`, {
      headers: getHeaders(),
    });
    if (response.data.status === 200) {
      toast.success('Availability deleted successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error deleting availability:', error);
    toast.error(error.response?.data?.error || 'Failed to delete availability');
    return null;
  }
};

// ============================================================================
// BLOCKED DATES
// ============================================================================

export const getBlockedDates = async (type) => {
  try {
    const response = await axios.get(`${API_BASE_URL}get/booking/blocked-dates`, {
      headers: getHeaders(),
      params: { type },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching blocked dates:', error);
    toast.error('Failed to load blocked dates');
    return null;
  }
};

export const createBlockedDate = async (blockedDateData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}create/booking/blocked-date`, blockedDateData, {
      headers: getHeaders(),
    });
    if (response.data.status === 201) {
      toast.success('Blocked date created successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error creating blocked date:', error);
    toast.error(error.response?.data?.error || 'Failed to create blocked date');
    return null;
  }
};

export const deleteBlockedDate = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}delete/booking/blocked-date/${id}`, {
      headers: getHeaders(),
    });
    if (response.data.status === 200) {
      toast.success('Blocked date deleted successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error deleting blocked date:', error);
    toast.error(error.response?.data?.error || 'Failed to delete blocked date');
    return null;
  }
};

// ============================================================================
// BOOKINGS
// ============================================================================

export const getBookings = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}get/booking/admin`, {
      headers: getHeaders(),
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    toast.error('Failed to load bookings');
    return null;
  }
};

export const getBookingById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}get/booking/admin/${id}`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching booking:', error);
    toast.error('Failed to load booking details');
    return null;
  }
};

export const createAdminBooking = async (bookingData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}create/booking/admin`, bookingData, {
      headers: getHeaders(),
    });
    if (response.data.status === 201) {
      const count = Array.isArray(response.data.bookings) ? response.data.bookings.length : 1;
      toast.success(count > 1 ? `${count} bookings created successfully` : 'Booking created successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error creating booking:', error);
    toast.error(error.response?.data?.error || 'Failed to create booking');
    return null;
  }
};

export const updateBooking = async (id, bookingData) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}update/booking/${id}`, bookingData, {
      headers: getHeaders(),
    });
    if (response.data.status === 200) {
      toast.success('Booking updated successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error updating booking:', error);
    toast.error(error.response?.data?.error || 'Failed to update booking');
    return null;
  }
};

export const updateBookingStatus = async (id, status, cancelReason) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}status/booking/${id}`, {
      status,
      cancelReason,
    }, { headers: getHeaders() });
    if (response.data.status === 200) {
      toast.success('Booking status updated successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error updating booking status:', error);
    toast.error(error.response?.data?.error || 'Failed to update status');
    return null;
  }
};

export const cancelBooking = async (id, cancelReason) => {
  try {
    const response = await axios.post(`${API_BASE_URL}cancel/booking/${id}`, {
      cancelReason,
    }, { headers: getHeaders() });
    if (response.data.status === 200) {
      toast.success('Booking cancelled successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    toast.error(error.response?.data?.error || 'Failed to cancel booking');
    return null;
  }
};

export const deleteBooking = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}delete/booking/${id}`, {
      headers: getHeaders(),
    });
    if (response.data.status === 200) {
      toast.success('Booking deleted successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error deleting booking:', error);
    toast.error(error.response?.data?.error || 'Failed to delete booking');
    return null;
  }
};

export const restoreBooking = async (id) => {
  try {
    const response = await axios.post(`${API_BASE_URL}restore/booking/${id}`, {}, {
      headers: getHeaders(),
    });
    if (response.data.status === 200) {
      toast.success('Booking restored successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error restoring booking:', error);
    toast.error(error.response?.data?.error || 'Failed to restore booking');
    return null;
  }
};

export const rescheduleBooking = async (id, newDate, newStartTime, rescheduleReason) => {
  try {
    const response = await axios.post(`${API_BASE_URL}reschedule/booking/${id}`, {
      newDate,
      newStartTime,
      rescheduleReason,
    }, { headers: getHeaders() });
    if (response.data.status === 200) {
      toast.success('Booking rescheduled successfully');
    }
    return response.data;
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    toast.error(error.response?.data?.error || 'Failed to reschedule booking');
    return null;
  }
};

export const getAvailableSlots = async (packageId, date, excludeBookingId) => {
  try {
    const params = { packageId, date };
    if (excludeBookingId) params.excludeBookingId = excludeBookingId;
    const response = await axios.get(`${API_BASE_URL}get/booking/admin/slots`, {
      headers: getHeaders(),
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching slots:', error);
    toast.error('Failed to load available slots');
    return null;
  }
};

// ============================================================================
// STRIPE PRODUCT CATALOG
// Packages are mirrored into Stripe as Product + Price on every save. These
// endpoints re-push them manually (e.g. after adding Stripe keys).
// ============================================================================

export const syncPackagesToStripe = async (packageId = null) => {
  try {
    const url = packageId
      ? `${API_BASE_URL}sync/booking/package/${packageId}/stripe`
      : `${API_BASE_URL}sync/booking/packages/stripe`;
    const response = await axios.post(url, {}, { headers: getHeaders() });
    if (response.data.status === 200) {
      toast.success(response.data.message || 'Synced to Stripe');
      return response.data;
    }
    toast.error(response.data.error || 'Failed to sync to Stripe');
    return null;
  } catch (error) {
    console.error('Error syncing packages to Stripe:', error);
    toast.error(error.response?.data?.error || 'Failed to sync to Stripe');
    return null;
  }
};
