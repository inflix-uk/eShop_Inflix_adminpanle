"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { API_BASE_URL } from "../../../service/blogService";
import { Grip, Trash2, ImageIcon } from 'lucide-react';

export default function ImageBlock({
  id,
  imageUrl = '',
  altText = '',
  heading = '',
  externalLink = '',
  width = '',
  height = '',
  onChange,
  onDelete,
  onMoveUp,
  onMoveDown,
  colWidth = 100
} = {}) {
  const fileInputRef = useRef(null);  
  const [displayUrl, setDisplayUrl] = useState(imageUrl);
  const [localWidth, setLocalWidth] = useState(width);
  const [localHeight, setLocalHeight] = useState(height);
  const [naturalSize, setNaturalSize] = useState({ width: '', height: '' });

  // Ref for the image element to get its natural size
  const imgRef = useRef(null);
  
  // Helper function to format image paths correctly
  const getImageSrc = useCallback((imagePath) => {
    if (!imagePath) return '';
    
    // Check if it's a full URL or data URL
    if (imagePath.startsWith('http://') || 
        imagePath.startsWith('https://') || 
        imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Check if it already has the /uploads prefix
    if (imagePath.startsWith('/uploads/')) {
      return imagePath;
    }
    
    // Check if it already has a leading slash
    if (imagePath.startsWith('/')) {
      return imagePath;
    }
    
    // Otherwise add the /uploads/ prefix
    return `/uploads/${imagePath}`;
  }, []);
  
  // Helper to get full image URL with backend URL if needed
  const getFullImageUrl = useCallback((imagePath) => {
    if (!imagePath) return '';
    
    // If it's a data URL (from FileReader), return it as is
    if (imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // If it's already a full URL, return it as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Otherwise, prepend the backend URL
    const baseUrl = `${API_BASE_URL}/uploads/` || '';
    let path = getImageSrc(imagePath);
    
    // Remove leading slash if present to avoid double slashes
    if (path.startsWith('/')) {
      path = path.substring(1);
    }
    
    return `${baseUrl}${path}`;
  }, [getImageSrc]);
  
  // Update display URL when imageUrl changes
  useEffect(() => {
    if (imageUrl) {
      setDisplayUrl(getFullImageUrl(imageUrl));
    }
  }, [imageUrl, getFullImageUrl]);

  // When the image loads, get its natural size
  const handleImageLoad = (e) => {
    const img = e.target;
    setNaturalSize({ width: img.naturalWidth, height: img.naturalHeight });
    // If width/height are not set, update them to match natural size
    if (!localWidth || !localHeight) {
      setLocalWidth(img.naturalWidth);
      setLocalHeight(img.naturalHeight);
      onChange(id, {
        url: imageUrl,
        alt: altText,
        heading: heading,
        externalLink: externalLink,
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    }
  };
  
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange(id, {
          url: event.target?.result,
          alt: altText,
          heading: heading,
          externalLink: externalLink,
          width: localWidth,
          height: localHeight
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleAltTextChange = (e) => {
    onChange(id, {
      url: imageUrl,
      alt: e.target.value,
      heading: heading,
      externalLink: externalLink,
      width: localWidth,
      height: localHeight
    });
  };
  
  // New handler for heading changes
  const handleHeadingChange = (e) => {
    onChange(id, {
      url: imageUrl,
      alt: altText,
      heading: e.target.value,
      externalLink: externalLink,
      width: localWidth,
      height: localHeight
    });
  };
  
  // New handler for external link changes
  const handleExternalLinkChange = (e) => {
    onChange(id, {
      url: imageUrl,
      alt: altText,
      heading: heading,
      externalLink: e.target.value,
      width: localWidth,
      height: localHeight
    });
  };

  // Handler for width change
  const handleWidthChange = (e) => {
    const newWidth = e.target.value;
    setLocalWidth(newWidth);
    onChange(id, {
      url: imageUrl,
      alt: altText,
      heading: heading,
      externalLink: externalLink,
      width: newWidth,
      height: localHeight
    });
  };

  // Handler for height change
  const handleHeightChange = (e) => {
    const newHeight = e.target.value;
    setLocalHeight(newHeight);
    onChange(id, {
      url: imageUrl,
      alt: altText,
      heading: heading,
      externalLink: externalLink,
      width: localWidth,
      height: newHeight
    });
  };
  
  return (
    <div 
      className="bg-white border border-gray-200 rounded-lg p-4 mb-4 hover:shadow-md transition-shadow"
      style={{ width: `${colWidth}%` }}
    >
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center">
          <Grip className="mr-2 text-gray-400 cursor-move" size={16} />
          <span className="text-sm font-medium text-gray-700">Image Block</span>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            type="button" 
            onClick={() => onMoveUp(id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <path d="m18 15-6-6-6 6"/>
            </svg>
          </button>
          <button 
            type="button" 
            onClick={() => onMoveDown(id)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <path d="m6 9 6 6 6-6"/>
            </svg>
          </button>
          <button 
            type="button" 
            onClick={() => onDelete(id)}
            className="p-1 text-red-500 hover:bg-red-50 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div>
        {imageUrl && displayUrl ? (
          <div className="space-y-3">
            <div className="relative w-full overflow-hidden rounded-md bg-gray-100">
              {displayUrl ? (
                externalLink ? (
                  <a href={externalLink} target="_blank" rel="noopener noreferrer">
                    <img 
                      ref={imgRef}
                      src={displayUrl}
                      alt={altText || "Blog image"}
                      className="w-full h-auto object-cover"
                      style={{ aspectRatio: '16/9', maxWidth: '100%' }}
                      onLoad={handleImageLoad}
                    />
                  </a>
                ) : (
                  <img 
                    ref={imgRef}
                    src={displayUrl}
                    alt={altText || "Blog image"}
                    className="w-full h-auto object-cover"
                    style={{ aspectRatio: '16/9', maxWidth: '100%' }}
                    onLoad={handleImageLoad}
                  />
                )
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
                aria-label="Replace image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </button>
            </div>
            
            {/* New Heading field */}
            <div>
              <label htmlFor={`heading-${id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Heading (Optional)
              </label>
              <input
                type="text"
                id={`heading-${id}`}
                value={heading}
                onChange={handleHeadingChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="Optional image heading"
              />
            </div>
            
            {/* External Link field */}
            <div>
              <label htmlFor={`external-link-${id}`} className="block text-sm font-medium text-gray-700 mb-1">
                External Link (Optional)
              </label>
              <input
                type="url"
                id={`external-link-${id}`}
                value={externalLink}
                onChange={handleExternalLinkChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label htmlFor={`alt-text-${id}`} className="block text-sm font-medium text-gray-700 mb-1">
                Alt Text (Optional)
              </label>
              <input
                type="text"
                id={`alt-text-${id}`}
                value={altText}
                onChange={handleAltTextChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                placeholder="Describe this image for accessibility"
              />
            </div>
            <div className="flex items-center space-x-4">
            <div className="w-1/2">
                <label htmlFor={`height-${id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  id={`height-${id}`}
                  value={localHeight}
                  onChange={handleHeightChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  placeholder={naturalSize.height ? `Current: ${naturalSize.height}` : "Height"}
                />
              </div>
              <div className="w-1/2 ">
                <label htmlFor={`width-${id}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  id={`width-${id}`}
                  value={localWidth}
                  onChange={handleWidthChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                  placeholder={naturalSize.width ? `Current: ${naturalSize.width}` : "Width"}
                />
              </div>

            </div>
            
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
          >
            <div className="flex flex-col items-center justify-center py-6">
              <ImageIcon className="h-10 w-10 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                Click to upload an image
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 10MB
              </p>
            </div>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
      </div>
    </div>
  );
}

ImageBlock.propTypes = {
  id: PropTypes.string.isRequired,
  imageUrl: PropTypes.string,
  altText: PropTypes.string,
  heading: PropTypes.string, 
  externalLink: PropTypes.string, 
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onMoveUp: PropTypes.func.isRequired,
  onMoveDown: PropTypes.func.isRequired,
  colWidth: PropTypes.number
};