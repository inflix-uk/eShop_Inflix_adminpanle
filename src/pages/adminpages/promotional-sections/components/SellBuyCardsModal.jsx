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

const SellBuyCardsModal = ({ isOpen, onClose, onSave, data = null, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    sellCard: {
      heading: '',
      paragraph: '',
      buttonName: '',
      buttonLink: '',
      backgroundImage: null,
      backgroundImagePreview: null,
      productImage: null,
      productImagePreview: null,
    },
    buyCard: {
      heading: '',
      paragraph: '',
      buttonName: '',
      buttonLink: '',
      backgroundImage: null,
      backgroundImagePreview: null,
      productImage: null,
      productImagePreview: null,
    },
  });

  const [errors, setErrors] = useState({});

  // Initialize form data ONCE on mount (modal only mounts when open)
  const isInitialized = useRef(false);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    if (data) {
      setFormData({
        sellCard: {
          heading: data.sellCard?.heading || '',
          paragraph: data.sellCard?.paragraph || '',
          buttonName: data.sellCard?.buttonName || '',
          buttonLink: data.sellCard?.buttonLink || '',
          backgroundImage: null,
          backgroundImagePreview: data.sellCard?.backgroundImage ? getImageUrl(data.sellCard.backgroundImage) : null,
          productImage: null,
          productImagePreview: data.sellCard?.productImage ? getImageUrl(data.sellCard.productImage) : null,
        },
        buyCard: {
          heading: data.buyCard?.heading || '',
          paragraph: data.buyCard?.paragraph || '',
          buttonName: data.buyCard?.buttonName || '',
          buttonLink: data.buyCard?.buttonLink || '',
          backgroundImage: null,
          backgroundImagePreview: data.buyCard?.backgroundImage ? getImageUrl(data.buyCard.backgroundImage) : null,
          productImage: null,
          productImagePreview: data.buyCard?.productImage ? getImageUrl(data.buyCard.productImage) : null,
        },
      });
    }
  }, [data]);

  const handleChange = (cardType, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [cardType]: {
        ...prev[cardType],
        [field]: value,
      },
    }));
    const errorKey = `${cardType}.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const handleImageChange = async (cardType, imageType, file) => {
    // Map to API field names
    const getImageField = () => {
      if (cardType === 'sellCard') {
        return imageType === 'backgroundImage' ? 'sellBackgroundImage' : 'sellProductImage';
      } else {
        return imageType === 'backgroundImage' ? 'buyBackgroundImage' : 'buyProductImage';
      }
    };

    if (file === null && data?.[cardType]?.[imageType]) {
      // Delete from server when cross is pressed
      const imageField = getImageField();
      const success = await deletePromotionalImage('sell-buy-cards', imageField);
      if (success) {
        setFormData((prev) => ({
          ...prev,
          [cardType]: {
            ...prev[cardType],
            [imageType]: null,
            [`${imageType}Preview`]: null,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [cardType]: {
          ...prev[cardType],
          [imageType]: file,
          [`${imageType}Preview`]: file ? URL.createObjectURL(file) : null,
        },
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    ['sellCard', 'buyCard'].forEach((cardType) => {
      if (!formData[cardType].heading.trim()) {
        newErrors[`${cardType}.heading`] = 'Heading is required';
      }
      if (!formData[cardType].paragraph.trim()) {
        newErrors[`${cardType}.paragraph`] = 'Paragraph is required';
      }
      if (!formData[cardType].buttonName.trim()) {
        newErrors[`${cardType}.buttonName`] = 'Button name is required';
      }
      if (!formData[cardType].buttonLink.trim()) {
        newErrors[`${cardType}.buttonLink`] = 'Button link is required';
      }
      if (!data && !formData[cardType].backgroundImage && !formData[cardType].backgroundImagePreview) {
        newErrors[`${cardType}.backgroundImage`] = 'Background image is required';
      }
    });
    
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
      sellCard: {
        heading: '',
        paragraph: '',
        buttonName: '',
        buttonLink: '',
        backgroundImage: null,
        backgroundImagePreview: null,
        productImage: null,
        productImagePreview: null,
      },
      buyCard: {
        heading: '',
        paragraph: '',
        buttonName: '',
        buttonLink: '',
        backgroundImage: null,
        backgroundImagePreview: null,
        productImage: null,
        productImagePreview: null,
      },
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const renderCardForm = (cardType, cardLabel) => (
    <div className="border rounded-lg p-4 space-y-4">
      <h4 className="text-md font-semibold text-gray-900 mb-4">{cardLabel} Card</h4>
      
      {/* Heading */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Heading *
        </label>
        <input
          type="text"
          value={formData[cardType].heading}
          onChange={(e) => handleChange(cardType, 'heading', e.target.value)}
          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
            errors[`${cardType}.heading`] ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder={cardType === 'sellCard' ? 'Sell' : 'Buy'}
        />
        {errors[`${cardType}.heading`] && (
          <p className="mt-1 text-sm text-red-600">{errors[`${cardType}.heading`]}</p>
        )}
      </div>

      {/* Paragraph */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Paragraph *
        </label>
        <textarea
          value={formData[cardType].paragraph}
          onChange={(e) => handleChange(cardType, 'paragraph', e.target.value)}
          rows={2}
          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
            errors[`${cardType}.paragraph`] ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder={cardType === 'sellCard' ? 'Sell Your Old Devices For Cash.' : 'Approved Used refurbished phones.'}
        />
        {errors[`${cardType}.paragraph`] && (
          <p className="mt-1 text-sm text-red-600">{errors[`${cardType}.paragraph`]}</p>
        )}
      </div>

      {/* Button Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Button Name *
        </label>
        <input
          type="text"
          value={formData[cardType].buttonName}
          onChange={(e) => handleChange(cardType, 'buttonName', e.target.value)}
          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
            errors[`${cardType}.buttonName`] ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder={cardType === 'sellCard' ? 'Sell Now' : 'Shop Now'}
        />
        {errors[`${cardType}.buttonName`] && (
          <p className="mt-1 text-sm text-red-600">{errors[`${cardType}.buttonName`]}</p>
        )}
      </div>

      {/* Button Link */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Button Link *
        </label>
        <input
          type="text"
          value={formData[cardType].buttonLink}
          onChange={(e) => handleChange(cardType, 'buttonLink', e.target.value)}
          className={`mt-1 block w-full border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary sm:text-sm ${
            errors[`${cardType}.buttonLink`] ? 'border-red-300' : 'border-gray-300'
          }`}
          placeholder={cardType === 'sellCard' ? 'https://sell.zextons.co.uk/' : '/shopall'}
        />
        {errors[`${cardType}.buttonLink`] && (
          <p className="mt-1 text-sm text-red-600">{errors[`${cardType}.buttonLink`]}</p>
        )}
      </div>

      {/* Background Image */}
      <div>
        <ImageUploader
          label="Background Image *"
          value={formData[cardType].backgroundImagePreview}
          onChange={(file) => handleImageChange(cardType, 'backgroundImage', file)}
          error={errors[`${cardType}.backgroundImage`]}
          required={!data}
          accept="image/*"
          maxSizeMB={2}
        />
        <p className="mt-1 text-sm text-gray-500">
          Recommended size: 540 × 220 pixels
        </p>
        {errors[`${cardType}.backgroundImage`] && (
          <p className="mt-1 text-sm text-red-600">{errors[`${cardType}.backgroundImage`]}</p>
        )}
      </div>

      {/* Product Image */}
      <div>
        <ImageUploader
          label="Product Image"
          value={formData[cardType].productImagePreview}
          onChange={(file) => handleImageChange(cardType, 'productImage', file)}
          accept="image/*"
          maxSizeMB={2}
        />
        <p className="mt-1 text-sm text-gray-500">
          Product/phone image to display on the card
        </p>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full max-h-[90vh] overflow-y-auto">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Sell/Buy Cards
              </h3>
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <FiX className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {renderCardForm('sellCard', 'Sell')}
              {renderCardForm('buyCard', 'Buy')}

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
                  {isSubmitting ? 'Saving...' : 'Save Cards'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

SellBuyCardsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  data: PropTypes.object,
  isSubmitting: PropTypes.bool,
};

export default SellBuyCardsModal;
