import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { FiX } from 'react-icons/fi';
import ImageUploader from '../../banners/components/ImageUploader';
import { deletePromotionalImage } from '../service/promotionalSectionsService';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  const baseUrl = BACKEND_URL?.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
  let path = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  if (!path.startsWith('/uploads/')) {
    if (path.startsWith('/promotional-sections/')) {
      path = `/uploads${path}`;
    } else if (!path.startsWith('/uploads/')) {
      path = `/uploads${path}`;
    }
  }
  return `${baseUrl}${path}`;
};

const BuyNowPayLaterModal = ({ isOpen, onClose, onSave, data = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    heading: '',
    paragraph: '',
    backgroundImage: null,
    backgroundImagePreview: null,
    paymentImages: [null, null, null],
    paymentImagePreviews: [null, null, null],
  });

  const [errors, setErrors] = useState({});

  // Initialize form data ONCE on mount (modal only mounts when open)
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    if (data) {
      setFormData({
        heading: data.heading || '',
        paragraph: data.paragraph || '',
        backgroundImage: null,
        backgroundImagePreview: data.backgroundImage ? getImageUrl(data.backgroundImage) : null,
        paymentImages: [null, null, null],
        paymentImagePreviews: data.paymentImages && Array.isArray(data.paymentImages)
          ? data.paymentImages.map(img => img ? getImageUrl(img) : null)
          : [null, null, null],
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBackgroundImageChange = async (file) => {
    if (file === null && data?.backgroundImage) {
      // Delete from server when cross is pressed
      const success = await deletePromotionalImage('buy-now-pay-later', 'backgroundImage');
      if (success) {
        setFormData((prev) => ({
          ...prev,
          backgroundImage: null,
          backgroundImagePreview: null,
        }));
      }
    } else {
      const newPreview = file ? URL.createObjectURL(file) : null;
      setFormData((prev) => ({
        ...prev,
        backgroundImage: file,
        backgroundImagePreview: newPreview,
      }));
    }

    if (errors.backgroundImage) {
      setErrors((prev) => ({ ...prev, backgroundImage: '' }));
    }
  };

  const handlePaymentImageChange = async (index, file) => {
    if (file === null && data?.paymentImages?.[index]) {
      // Delete from server when cross is pressed (payment images are optional)
      const success = await deletePromotionalImage('buy-now-pay-later', 'paymentImage', index);
      if (success) {
        setFormData((prev) => {
          const newPaymentImages = [...prev.paymentImages];
          const newPaymentImagePreviews = [...prev.paymentImagePreviews];
          newPaymentImages[index] = null;
          newPaymentImagePreviews[index] = null;
          return {
            ...prev,
            paymentImages: newPaymentImages,
            paymentImagePreviews: newPaymentImagePreviews,
          };
        });
      }
    } else {
      setFormData((prev) => {
        const newPaymentImages = [...prev.paymentImages];
        const newPaymentImagePreviews = [...prev.paymentImagePreviews];
        newPaymentImages[index] = file;
        newPaymentImagePreviews[index] = file ? URL.createObjectURL(file) : null;
        return {
          ...prev,
          paymentImages: newPaymentImages,
          paymentImagePreviews: newPaymentImagePreviews,
        };
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.heading.trim()) {
      newErrors.heading = 'Heading is required';
    }
    if (!formData.paragraph.trim()) {
      newErrors.paragraph = 'Paragraph is required';
    }
    if (!data && !formData.backgroundImage && !formData.backgroundImagePreview) {
      newErrors.backgroundImage = 'Background image is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      heading: '',
      paragraph: '',
      backgroundImage: null,
      backgroundImagePreview: null,
      paymentImages: [null, null, null],
      paymentImagePreviews: [null, null, null],
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Top banner (full width)</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This is the first wide strip in the homepage promo stack (above the two cards).
                </p>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="shrink-0 text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Heading */}
              <div>
                <label htmlFor="heading" className="block text-sm font-medium text-gray-700">
                  Heading *
                </label>
                <input
                  type="text"
                  name="heading"
                  id="heading"
                  value={formData.heading}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                    errors.heading ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g. Pay in instalments with Klarna"
                />
                {errors.heading && (
                  <p className="mt-1 text-sm text-red-600">{errors.heading}</p>
                )}
              </div>

              {/* Paragraph */}
              <div>
                <label htmlFor="paragraph" className="block text-sm font-medium text-gray-700">
                  Paragraph *
                </label>
                <textarea
                  name="paragraph"
                  id="paragraph"
                  value={formData.paragraph}
                  onChange={handleChange}
                  rows={3}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                    errors.paragraph ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="18+ T&C apply. Please Spend responsibly"
                />
                {errors.paragraph && (
                  <p className="mt-1 text-sm text-red-600">{errors.paragraph}</p>
                )}
              </div>

              {/* Background Image */}
              <div>
                <ImageUploader
                  label="Background Image *"
                  value={formData.backgroundImagePreview}
                  onChange={handleBackgroundImageChange}
                  error={errors.backgroundImage}
                  required={!data}
                  accept="image/*"
                  maxSizeMB={2}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Recommended size: 1216 × 160 pixels
                </p>
                {errors.backgroundImage && (
                  <p className="mt-1 text-sm text-red-600">{errors.backgroundImage}</p>
                )}
              </div>

              {/* Optional logos under banner text (left → right on the live page) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logos under the banner text (optional)
                </label>
                <p className="mb-3 text-xs text-gray-500">
                  Shown in one row beneath the heading and paragraph: left slot, then middle, then
                  right. Leave a slot empty if you do not need it.
                </p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  {[
                    "Logo under banner — left (1 of 3)",
                    "Logo under banner — middle (2 of 3)",
                    "Logo under banner — right (3 of 3)",
                  ].map((label, index) => (
                    <div key={index}>
                      <ImageUploader
                        label={label}
                        value={formData.paymentImagePreviews[index]}
                        onChange={(file) => handlePaymentImageChange(index, file)}
                        accept="image/*"
                        maxSizeMB={1}
                      />
                      <p className="mt-1 text-xs text-gray-500">Suggested size: 96 × 40 px</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

BuyNowPayLaterModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  data: PropTypes.object,
  isSubmitting: PropTypes.bool,
};

export default BuyNowPayLaterModal;
