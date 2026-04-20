import PropTypes from "prop-types";
import { useState, useRef } from "react";
import { toast } from "react-toastify";
import ProductApi from "../../pages/adminpages/productsNew/api/productApi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const productApi = new ProductApi();

export default function ProductImages({
  product,
  setProduct,
  ProductThumbnailImage,
  setProductThumbnailImage,
  handleProductThumbnailImage,
  handleProductGalleryImages,
  setProductGalleryImages,
}) {
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [deletingThumbnail, setDeletingThumbnail] = useState(false);
  const [expandedGalleryIndex, setExpandedGalleryIndex] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const dragCounter = useRef(0);

  const handleThumbnailMetaChange = (field, value) => {
    setProduct({
      ...product,
      thumbnail_image: {
        ...product.thumbnail_image,
        [field]: value
      }
    });
  };

  const handleGalleryMetaChange = (index, field, value) => {
    const updatedImages = [...product.Gallery_Images];
    updatedImages[index] = {
      ...updatedImages[index],
      [field]: value
    };
    setProduct({ ...product, Gallery_Images: updatedImages });
  };

  const handleDeleteThumbnail = async () => {
    if (!product._id) {
      setProductThumbnailImage(null);
      setProduct({ ...product, thumbnail_image: null });
      return;
    }

    setDeletingThumbnail(true);
    try {
      const response = await productApi.deleteProductImage(product._id, 'thumbnail');
      if (response.data.status === 200) {
        setProductThumbnailImage(null);
        setProduct({ ...product, thumbnail_image: null });
        toast.success('Thumbnail deleted successfully');
      } else {
        toast.error(response.data.message || 'Failed to delete thumbnail');
      }
    } catch (error) {
      console.error('Error deleting thumbnail:', error);
      toast.error('Failed to delete thumbnail');
    } finally {
      setDeletingThumbnail(false);
    }
  };

  const handleDeleteGalleryImage = async (index, image) => {
    if (!product._id) {
      const updatedImages = [...product.Gallery_Images];
      updatedImages.splice(index, 1);
      setProductGalleryImages(updatedImages);
      setProduct({ ...product, Gallery_Images: updatedImages });
      return;
    }

    setDeletingIndex(index);
    try {
      const response = await productApi.deleteProductImage(
        product._id,
        'gallery',
        index,
        image.path || image.url
      );
      if (response.data.status === 200) {
        const updatedImages = [...product.Gallery_Images];
        updatedImages.splice(index, 1);
        setProductGalleryImages(updatedImages);
        setProduct({ ...product, Gallery_Images: updatedImages });
        toast.success('Image deleted successfully');
        if (expandedGalleryIndex === index) setExpandedGalleryIndex(null);
      } else {
        toast.error(response.data.message || 'Failed to delete image');
      }
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      toast.error('Failed to delete image');
    } finally {
      setDeletingIndex(null);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
    // Add a slight delay to allow the drag image to be captured
    setTimeout(() => {
      e.target.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
    dragCounter.current = 0;
  };

  const handleDragEnter = (e, index) => {
    e.preventDefault();
    dragCounter.current++;
    if (index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverIndex(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    dragCounter.current = 0;
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updatedImages = [...product.Gallery_Images];
    const [draggedItem] = updatedImages.splice(draggedIndex, 1);
    updatedImages.splice(dropIndex, 0, draggedItem);

    setProductGalleryImages(updatedImages);
    setProduct({ ...product, Gallery_Images: updatedImages });
    
    // Update expanded index if needed
    if (expandedGalleryIndex !== null) {
      if (expandedGalleryIndex === draggedIndex) {
        setExpandedGalleryIndex(dropIndex);
      } else if (draggedIndex < expandedGalleryIndex && dropIndex >= expandedGalleryIndex) {
        setExpandedGalleryIndex(expandedGalleryIndex - 1);
      } else if (draggedIndex > expandedGalleryIndex && dropIndex <= expandedGalleryIndex) {
        setExpandedGalleryIndex(expandedGalleryIndex + 1);
      }
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
    toast.success('Image order updated');
  };

  const getImageSrc = (image) => {
    if (image.url) return image.url;
    if (image.path) return `${BACKEND_URL}${image.path}`;
    if (image instanceof File) return URL.createObjectURL(image);
    return '';
  };

  const hasThumbnail = ProductThumbnailImage || product?.thumbnail_image?.path || product?.thumbnail_image?.url;
  const galleryCount = product.Gallery_Images?.length || 0;

  return (
    <div className="ring-1 ring-gray-200 rounded-lg bg-white">
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-100 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-sm">Product Images</h2>
        <div className="flex gap-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${hasThumbnail ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
            Thumb {hasThumbnail ? '✓' : '○'}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded ${galleryCount > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
            Gallery: {galleryCount}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-4">
        {/* Thumbnail Section */}
        <div className="flex gap-3 items-start">
          <div className="flex-shrink-0">
            <p className="text-[10px] text-gray-500 mb-1.5">Thumbnail</p>
            <div className={`w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center ${hasThumbnail ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
              {hasThumbnail ? (
                <div className="relative group w-full h-full">
                  <img
                    src={
                      ProductThumbnailImage
                        ? ProductThumbnailImage
                        : product?.thumbnail_image?.url
                        ? product.thumbnail_image.url
                        : `${BACKEND_URL}${product?.thumbnail_image.path}`
                    }
                    alt={product?.thumbnail_image?.altText || "Thumbnail"}
                    className="w-full h-full object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                    <button
                      type="button"
                      onClick={handleDeleteThumbnail}
                      disabled={deletingThumbnail}
                      className="text-white text-[9px] bg-red-500 px-1.5 py-0.5 rounded hover:bg-red-600 disabled:opacity-50"
                    >{deletingThumbnail ? '...' : 'Remove'}</button>
                  </div>
                </div>
              ) : (
                <svg className="w-6 h-6 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <label className="block text-center mt-1 text-[9px] text-primary font-medium cursor-pointer hover:underline">
              {hasThumbnail ? "Change" : "Upload"}
              <input type="file" className="sr-only" accept="image/*" onChange={handleProductThumbnailImage} />
            </label>
          </div>
          
          {/* Thumbnail Alt Text & Description */}
          {hasThumbnail && (
            <div className="flex-1 space-y-1.5">
              <div>
                <label className="text-[9px] text-gray-500 block mb-0.5">Alt Text</label>
                <input
                  type="text"
                  value={product?.thumbnail_image?.altText || ''}
                  onChange={(e) => handleThumbnailMetaChange('altText', e.target.value)}
                  placeholder="Image alt text for SEO"
                  className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label className="text-[9px] text-gray-500 block mb-0.5">Description</label>
                <input
                  type="text"
                  value={product?.thumbnail_image?.description || ''}
                  onChange={(e) => handleThumbnailMetaChange('description', e.target.value)}
                  placeholder="Brief image description"
                  className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100"></div>

        {/* Gallery Section */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] text-gray-500">Gallery Images</p>
            {galleryCount > 1 && (
              <p className="text-[9px] text-blue-500 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Drag to reorder
              </p>
            )}
          </div>
          <div className={`min-h-[80px] rounded-lg border-2 border-dashed p-2 ${galleryCount > 0 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
            {galleryCount > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {product.Gallery_Images?.map((image, index) => (
                    <div 
                      key={`gallery-${index}-${image.filename || image.path || ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(e, index)}
                      onDragEnd={handleDragEnd}
                      onDragEnter={(e) => handleDragEnter(e, index)}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                      className={`relative group cursor-grab active:cursor-grabbing transition-all duration-200
                        ${expandedGalleryIndex === index ? 'ring-2 ring-primary rounded-md' : ''}
                        ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                        ${dragOverIndex === index && draggedIndex !== index ? 'ring-2 ring-blue-400 ring-offset-2 scale-105' : ''}
                      `}
                      onClick={() => setExpandedGalleryIndex(expandedGalleryIndex === index ? null : index)}
                    >
                      {/* Position Badge */}
                      <div className="absolute -top-1 -left-1 bg-gray-700 text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center z-10 font-medium">
                        {index + 1}
                      </div>
                      <img
                        src={getImageSrc(image)}
                        alt={image.altText || `Gallery image ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-md border border-gray-200 shadow-sm pointer-events-none"
                        draggable={false}
                      />
                      <button
                        type="button"
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50 z-10"
                        onClick={(e) => { e.stopPropagation(); handleDeleteGalleryImage(index, image); }}
                        disabled={deletingIndex === index}
                      >{deletingIndex === index ? (
                        <svg className="animate-spin h-2 w-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                        </svg>
                      ) : '×'}</button>
                      {/* Indicator if has alt/description */}
                      {(image.altText || image.description) && (
                        <div className="absolute bottom-0.5 right-0.5 bg-green-500 rounded-full w-2 h-2 z-10" title="Has SEO data"></div>
                      )}
                      {/* Drag handle indicator on hover */}
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center pointer-events-none">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
                        </svg>
                      </div>
                    </div>
                  ))}
                  {/* Add Multiple Images Button */}
                  <label className="w-16 h-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors group">
                    <svg className="w-4 h-4 text-gray-400 group-hover:text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-[7px] text-gray-400 group-hover:text-primary mt-0.5">Add More</span>
                    <input type="file" className="sr-only" multiple accept="image/*" onChange={handleProductGalleryImages} />
                  </label>
                </div>

                {/* Expanded Gallery Image Meta Fields */}
                {expandedGalleryIndex !== null && product.Gallery_Images?.[expandedGalleryIndex] && (
                  <div className="mt-2 p-2 bg-white rounded border border-gray-200">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-medium text-gray-700">Image {expandedGalleryIndex + 1} Details</span>
                      <button 
                        type="button"
                        onClick={() => setExpandedGalleryIndex(null)}
                        className="text-gray-400 hover:text-gray-600 text-xs"
                      >✕</button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] text-gray-500 block mb-0.5">Alt Text</label>
                        <input
                          type="text"
                          value={product.Gallery_Images[expandedGalleryIndex]?.altText || ''}
                          onChange={(e) => handleGalleryMetaChange(expandedGalleryIndex, 'altText', e.target.value)}
                          placeholder="Alt text for SEO"
                          className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-gray-500 block mb-0.5">Description</label>
                        <input
                          type="text"
                          value={product.Gallery_Images[expandedGalleryIndex]?.description || ''}
                          onChange={(e) => handleGalleryMetaChange(expandedGalleryIndex, 'description', e.target.value)}
                          placeholder="Image description"
                          className="w-full text-[11px] px-2 py-1 border border-gray-200 rounded focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <label className="h-full flex flex-col items-center justify-center py-4 cursor-pointer hover:bg-blue-50/50 transition-colors rounded-md">
                <svg className="w-8 h-8 text-gray-300 mb-2" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
                </svg>
                <span className="text-[11px] text-primary font-medium">+ Add Gallery Images</span>
                <span className="text-[9px] text-gray-400 mt-1">Select multiple images at once</span>
                <input type="file" className="sr-only" multiple accept="image/*" onChange={handleProductGalleryImages} />
              </label>
            )}
          </div>
          <p className="text-[9px] text-gray-400 mt-1">Select multiple images at once • Click image to edit details • Drag to reorder</p>
        </div>
      </div>
    </div>
  );
}

ProductImages.propTypes = {
  product: PropTypes.object.isRequired,
  setProduct: PropTypes.func.isRequired,
  ProductThumbnailImage: PropTypes.string,
  setProductThumbnailImage: PropTypes.func.isRequired,
  handleProductThumbnailImage: PropTypes.func.isRequired,
  handleProductGalleryImages: PropTypes.func.isRequired,
  setProductGalleryImages: PropTypes.func.isRequired,
};
