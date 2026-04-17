import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { FiX } from 'react-icons/fi';
import ImageUploader from '../../banners/components/ImageUploader';
import { deleteCategoryCardImage } from '../service/categoryCardsService';

/** Empty ok. Prefer hex (#RGB / #RGBA / #RRGGBB / #RRGGBBAA, optional #). Legacy rgba() still validates so old rows can save. */
function isValidOverlayValue(raw) {
  const t = String(raw ?? '').trim();
  if (!t) return true;
  if (/^rgba?\(/i.test(t)) {
    return /^rgba?\([\d\s,.%]+\)$/i.test(t);
  }
  let s = t;
  if (/^(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/i.test(s)) {
    s = `#${s}`;
  }
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/i.test(s);
}

function normalizeOverlayValue(raw) {
  const t = String(raw ?? '').trim();
  if (!t) return '';
  if (/^rgba?\(/i.test(t)) return t;
  let s = t;
  if (/^(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{4}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/i.test(s)) {
    s = `#${s}`;
  }
  return s.toLowerCase();
}

const CategoryCardModal = ({ isOpen, onClose, onSave, card = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    categoryName: '',
    categoryNameColor: '#000000',
    itemCountColor: '#6B7280',
    overlayColor: '',
    shopNowLink: '',
    itemCount: 0,
    backgroundImage: null,
    backgroundImagePreview: null,
    categoryImage: null,
    categoryImagePreview: null,
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (card) {
      setFormData({
        categoryName: card.categoryName || '',
        categoryNameColor: card.categoryNameColor || '#000000',
        itemCountColor: card.itemCountColor || '#6B7280',
        overlayColor: card.overlayColor || '',
        shopNowLink: card.shopNowLink || '',
        itemCount: card.itemCount || 0,
        backgroundImage: null,
        backgroundImagePreview: card.backgroundImage || null,
        categoryImage: null,
        categoryImagePreview: card.categoryImage || null,
        isActive: card.isActive !== undefined ? card.isActive : true,
      });
    } else {
      setFormData({
        categoryName: '',
        categoryNameColor: '#000000',
        itemCountColor: '#6B7280',
        overlayColor: '',
        shopNowLink: '',
        itemCount: 0,
        backgroundImage: null,
        backgroundImagePreview: null,
        categoryImage: null,
        categoryImagePreview: null,
        isActive: true,
      });
    }
    setErrors({});
  }, [card, isOpen]);

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

  const handleBackgroundImageChange = async (file) => {
    if (file === null && card?.backgroundImage) {
      const success = await deleteCategoryCardImage(card._id, 'backgroundImage');
      if (success) {
        setFormData((prev) => ({
          ...prev,
          backgroundImage: null,
          backgroundImagePreview: null,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        backgroundImage: file,
        backgroundImagePreview: file ? URL.createObjectURL(file) : null,
      }));
    }
    if (errors.backgroundImage) {
      setErrors((prev) => ({ ...prev, backgroundImage: '' }));
    }
  };

  const handleCategoryImageChange = async (file) => {
    if (file === null && card?.categoryImage) {
      // Delete from server when cross is pressed
      const success = await deleteCategoryCardImage(card._id, 'categoryImage');
      if (success) {
        setFormData((prev) => ({
          ...prev,
          categoryImage: null,
          categoryImagePreview: null,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        categoryImage: file,
        categoryImagePreview: file ? URL.createObjectURL(file) : prev.categoryImagePreview,
      }));
    }
    if (errors.categoryImage) {
      setErrors((prev) => ({ ...prev, categoryImage: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.categoryName.trim()) {
      newErrors.categoryName = 'Category name is required';
    }

    if (!formData.shopNowLink.trim()) {
      newErrors.shopNowLink = 'Shop Now link is required';
    }

    const ov = formData.overlayColor?.trim() ?? '';
    if (ov && !isValidOverlayValue(ov)) {
      newErrors.overlayColor =
        'Use hex: #RGB, #RGBA, #RRGGBB, or #RRGGBBAA (optional #), or leave empty';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave({
        ...formData,
        overlayColor: normalizeOverlayValue(formData.overlayColor),
      });
    }
  };

  const handleClose = () => {
    setFormData({
      categoryName: '',
      categoryNameColor: '#000000',
      itemCountColor: '#6B7280',
      overlayColor: '',
      shopNowLink: '',
      itemCount: 0,
      backgroundImage: null,
      backgroundImagePreview: null,
      categoryImage: null,
      categoryImagePreview: null,
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

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {card ? 'Edit Category Card' : 'Create New Category Card'}
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
              {/* Row 1: Category Name & Shop Now Link */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    name="categoryName"
                    id="categoryName"
                    value={formData.categoryName}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                      errors.categoryName ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Mobile-Phones"
                  />
                  {errors.categoryName && (
                    <p className="mt-1 text-sm text-red-600">{errors.categoryName}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="shopNowLink" className="block text-sm font-medium text-gray-700">
                    Shop Now Button Link *
                  </label>
                  <input
                    type="text"
                    name="shopNowLink"
                    id="shopNowLink"
                    value={formData.shopNowLink}
                    onChange={handleChange}
                    className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
                      errors.shopNowLink ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="e.g., /categories/Mobile-Phones"
                  />
                  {errors.shopNowLink && (
                    <p className="mt-1 text-sm text-red-600">{errors.shopNowLink}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Colors, Item Count, Active */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="categoryNameColor" className="block text-sm font-medium text-gray-700">
                    Category title color
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      name="categoryNameColor"
                      id="categoryNameColor"
                      value={/^#[0-9A-Fa-f]{6}$/i.test(formData.categoryNameColor) ? formData.categoryNameColor : '#000000'}
                      onChange={handleChange}
                      className="h-9 w-12 cursor-pointer border border-gray-300 rounded-md p-1"
                    />
                    <input
                      type="text"
                      value={formData.categoryNameColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, categoryNameColor: e.target.value }))}
                      className="block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-xs"
                      placeholder="#000000"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="itemCountColor" className="block text-sm font-medium text-gray-700">
                    Item count color
                  </label>
                  <div className="mt-1 flex items-center gap-2">
                    <input
                      type="color"
                      name="itemCountColor"
                      id="itemCountColor"
                      value={/^#[0-9A-Fa-f]{6}$/i.test(formData.itemCountColor) ? formData.itemCountColor : '#6B7280'}
                      onChange={handleChange}
                      className="h-9 w-12 cursor-pointer border border-gray-300 rounded-md p-1"
                    />
                    <input
                      type="text"
                      value={formData.itemCountColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, itemCountColor: e.target.value }))}
                      className="block w-24 border border-gray-300 rounded-md shadow-sm py-2 px-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary text-xs"
                      placeholder="#6B7280"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="itemCount" className="block text-sm font-medium text-gray-700">
                    Item Count
                  </label>
                  <input
                    type="number"
                    name="itemCount"
                    id="itemCount"
                    value={formData.itemCount}
                    onChange={handleChange}
                    min="0"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-end pb-2">
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
                      Active
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label htmlFor="overlayColor" className="block text-sm font-medium text-gray-700">
                  Background overlay (optional)
                </label>
                <input
                  type="text"
                  name="overlayColor"
                  id="overlayColor"
                  value={formData.overlayColor}
                  onChange={handleChange}
                  className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 sm:text-sm ${
                    errors.overlayColor ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="#000000 or #00000080"
                  inputMode="text"
                  autoComplete="off"
                />
                {errors.overlayColor && (
                  <p className="mt-1 text-sm text-red-600">{errors.overlayColor}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Hex only on top of the background image (if any). Examples: #RGB, #RGBA, #RRGGBB, #RRGGBBAA. Leave empty for no overlay.
                </p>
              </div>

              {/* Row 3: Images side by side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <ImageUploader
                    label="Background Image (Optional)"
                    value={formData.backgroundImagePreview}
                    onChange={handleBackgroundImageChange}
                    error={errors.backgroundImage}
                    required={false}
                    accept="image/*"
                    maxSizeMB={2}
                  />
                  <p className="mt-1 text-xs text-gray-500">313 × 413 px</p>
                  {errors.backgroundImage && (
                    <p className="mt-1 text-sm text-red-600">{errors.backgroundImage}</p>
                  )}
                </div>
                <div>
                  <ImageUploader
                    label="Category Image (Optional)"
                    value={formData.categoryImagePreview}
                    onChange={handleCategoryImageChange}
                    error={errors.categoryImage}
                    required={false}
                    accept="image/*"
                    maxSizeMB={2}
                  />
                  <p className="mt-1 text-xs text-gray-500">240 × 224 px</p>
                  {errors.categoryImage && (
                    <p className="mt-1 text-sm text-red-600">{errors.categoryImage}</p>
                  )}
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
                  {isSubmitting ? 'Saving...' : card ? 'Update Card' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

CategoryCardModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  card: PropTypes.object,
  isSubmitting: PropTypes.bool,
};

export default CategoryCardModal;
