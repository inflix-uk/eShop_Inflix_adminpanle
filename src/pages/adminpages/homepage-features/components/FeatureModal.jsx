import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiX } from 'react-icons/fi';
import ImageUploader from '../../banners/components/ImageUploader';
import { deleteHomepageFeatureImage } from '../service/homepageFeaturesService';

const FeatureModal = ({ isOpen, onClose, onSave, feature = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    iconImage: null,
    iconImagePreview: null,
    iconWidth: 25,
    iconHeight: 25,
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (feature) {
      setFormData({
        title: feature.title || '',
        subtitle: feature.subtitle || '',
        iconImage: null,
        iconImagePreview: feature.iconImage || null,
        iconWidth: feature.iconWidth || 25,
        iconHeight: feature.iconHeight || 25,
        isActive: feature.isActive !== undefined ? feature.isActive : true,
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        iconImage: null,
        iconImagePreview: null,
        iconWidth: 25,
        iconHeight: 25,
        isActive: true,
      });
    }
    setErrors({});
  }, [feature, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = async (file) => {
    if (file === null && feature?.iconImage) {
      // Delete from server when cross is pressed
      const success = await deleteHomepageFeatureImage(feature._id);
      if (success) {
        setFormData((prev) => ({
          ...prev,
          iconImage: null,
          iconImagePreview: null,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        iconImage: file,
        iconImagePreview: file ? URL.createObjectURL(file) : prev.iconImagePreview,
      }));
    }
    if (errors.iconImage) {
      setErrors((prev) => ({ ...prev, iconImage: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.subtitle.trim()) {
      newErrors.subtitle = 'Subtitle is required';
    }

    if (!feature && !formData.iconImage && !formData.iconImagePreview) {
      newErrors.iconImage = 'Icon image is required';
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
      title: '',
      subtitle: '',
      iconImage: null,
      iconImagePreview: null,
      iconWidth: 25,
      iconHeight: 25,
      isActive: true,
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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {feature ? 'Edit Homepage Feature' : 'Create New Homepage Feature'}
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                    errors.title ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Fully Tested Devices"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Subtitle */}
              <div>
                <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700">
                  Subtitle *
                </label>
                <input
                  type="text"
                  name="subtitle"
                  id="subtitle"
                  value={formData.subtitle}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                    errors.subtitle ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Buy with confidence"
                />
                {errors.subtitle && (
                  <p className="mt-1 text-sm text-red-600">{errors.subtitle}</p>
                )}
              </div>

              {/* Icon Image */}
              <div>
                <ImageUploader
                  label="Icon Image *"
                  value={formData.iconImagePreview}
                  onChange={handleImageChange}
                  error={errors.iconImage}
                  required={!feature}
                  accept="image/*"
                  maxSizeMB={1}
                />
                {errors.iconImage && (
                  <p className="mt-1 text-sm text-red-600">{errors.iconImage}</p>
                )}
              </div>

              {/* Icon Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="iconWidth" className="block text-sm font-medium text-gray-700">
                    Icon Width (px)
                  </label>
                  <input
                    type="number"
                    name="iconWidth"
                    id="iconWidth"
                    value={formData.iconWidth}
                    onChange={handleChange}
                    min="1"
                    max="500"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="25"
                  />
                </div>
                <div>
                  <label htmlFor="iconHeight" className="block text-sm font-medium text-gray-700">
                    Icon Height (px)
                  </label>
                  <input
                    type="number"
                    name="iconHeight"
                    id="iconHeight"
                    value={formData.iconHeight}
                    onChange={handleChange}
                    min="1"
                    max="500"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="25"
                  />
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                  Active (show on homepage)
                </label>
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
                  {isSubmitting ? 'Saving...' : feature ? 'Update Feature' : 'Create Feature'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

FeatureModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  feature: PropTypes.object,
  isSubmitting: PropTypes.bool,
};

export default FeatureModal;
