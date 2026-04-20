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

const TinyPhoneBannerModal = ({ isOpen, onClose, onSave, data = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    heading: '',
    paragraph: '',
    buttonName: '',
    buttonLink: '',
    backgroundImage: null,
    backgroundImagePreview: null,
    centerImage: null,
    centerImagePreview: null,
    rightImage: null,
    rightImagePreview: null,
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
        buttonName: data.buttonName || '',
        buttonLink: data.buttonLink || '',
        backgroundImage: null,
        backgroundImagePreview: data.backgroundImage ? getImageUrl(data.backgroundImage) : null,
        centerImage: null,
        centerImagePreview: data.centerImage ? getImageUrl(data.centerImage) : null,
        rightImage: null,
        rightImagePreview: data.rightImage ? getImageUrl(data.rightImage) : null,
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

  const handleImageChange = async (imageType, file) => {
    if (file === null && data?.[imageType]) {
      // Delete from server when cross is pressed
      const success = await deletePromotionalImage('tiny-phone-banner', imageType);
      if (success) {
        setFormData((prev) => ({
          ...prev,
          [imageType]: null,
          [`${imageType}Preview`]: null,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [imageType]: file,
        [`${imageType}Preview`]: file ? URL.createObjectURL(file) : null,
      }));
    }
    if (errors[imageType]) {
      setErrors((prev) => ({ ...prev, [imageType]: '' }));
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
    if (!formData.buttonName.trim()) {
      newErrors.buttonName = 'Button name is required';
    }
    if (!formData.buttonLink.trim()) {
      newErrors.buttonLink = 'Button link is required';
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
      buttonName: '',
      buttonLink: '',
      backgroundImage: null,
      backgroundImagePreview: null,
      centerImage: null,
      centerImagePreview: null,
      rightImage: null,
      rightImagePreview: null,
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
                <h3 className="text-lg font-medium text-gray-900">Bottom strip (full width)</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Last band in the promo stack: headline, text, button, and images across the page.
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
                  placeholder="Buy World's Smallest Phone"
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
                <input
                  type="text"
                  name="paragraph"
                  id="paragraph"
                  value={formData.paragraph}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                    errors.paragraph ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Zanco Tiny T1"
                />
                {errors.paragraph && (
                  <p className="mt-1 text-sm text-red-600">{errors.paragraph}</p>
                )}
              </div>

              {/* Button Name */}
              <div>
                <label htmlFor="buttonName" className="block text-sm font-medium text-gray-700">
                  Button Name *
                </label>
                <input
                  type="text"
                  name="buttonName"
                  id="buttonName"
                  value={formData.buttonName}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                    errors.buttonName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="SHOP NOW"
                />
                {errors.buttonName && (
                  <p className="mt-1 text-sm text-red-600">{errors.buttonName}</p>
                )}
              </div>

              {/* Button Link */}
              <div>
                <label htmlFor="buttonLink" className="block text-sm font-medium text-gray-700">
                  Button Link *
                </label>
                <input
                  type="text"
                  name="buttonLink"
                  id="buttonLink"
                  value={formData.buttonLink}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                    errors.buttonLink ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="https://tinyphones.uk/"
                />
                {errors.buttonLink && (
                  <p className="mt-1 text-sm text-red-600">{errors.buttonLink}</p>
                )}
              </div>

              {/* Background Image */}
              <div>
                <ImageUploader
                  label="Background Image *"
                  value={formData.backgroundImagePreview}
                  onChange={(file) => handleImageChange('backgroundImage', file)}
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

              {/* Center Image */}
              <div>
                <ImageUploader
                  label="Center Image"
                  value={formData.centerImagePreview}
                  onChange={(file) => handleImageChange('centerImage', file)}
                  accept="image/*"
                  maxSizeMB={1}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Recommended size: 389 × 80 pixels
                </p>
              </div>

              {/* Right Image */}
              <div>
                <ImageUploader
                  label="Right Image"
                  value={formData.rightImagePreview}
                  onChange={(file) => handleImageChange('rightImage', file)}
                  accept="image/*"
                  maxSizeMB={1}
                />
                <p className="mt-1 text-sm text-gray-500">
                  Recommended size: 137 × 112 pixels
                </p>
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

TinyPhoneBannerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  data: PropTypes.object,
  isSubmitting: PropTypes.bool,
};

export default TinyPhoneBannerModal;
