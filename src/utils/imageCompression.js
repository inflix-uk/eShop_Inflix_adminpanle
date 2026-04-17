/**
 * Image Compression Utility
 * Compresses images before upload to reduce payload size
 */

/**
 * Compress an image file
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width (default: 1200)
 * @param {number} options.maxHeight - Maximum height (default: 1200)
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.8)
 * @param {number} options.maxSizeMB - Maximum file size in MB (default: 0.5)
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.6,
    maxSizeMB = 0.15,
  } = options;

  return new Promise((resolve, reject) => {
    // Skip compression for very small files (under 50KB)
    if (file.size <= 50 * 1024) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        // Calculate new dimensions while maintaining aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Preserve original format for PNGs (transparency) and WebPs;
        // fall back to JPEG for everything else.
        let outputType = "image/jpeg";
        if (file.type === "image/png") {
          outputType = "image/png";
        } else if (file.type === "image/webp") {
          outputType = "image/webp";
        }

        // PNG ignores the quality parameter; JPEG/WebP use it.
        const outputQuality =
          outputType === "image/png" ? undefined : quality;

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Canvas to Blob conversion failed"));
              return;
            }

            const compressedFile = new File([blob], file.name, {
              type: outputType,
              lastModified: Date.now(),
            });

            console.log(
              `Image compressed: ${(file.size / 1024).toFixed(1)}KB → ${(
                compressedFile.size / 1024
              ).toFixed(1)}KB (${outputType})`
            );

            resolve(compressedFile);
          },
          outputType,
          outputQuality
        );
      };

      img.onerror = () => reject(new Error("Failed to load image"));
    };

    reader.onerror = () => reject(new Error("Failed to read file"));
  });
};

/**
 * Compress multiple image files
 * @param {File[]} files - Array of image files to compress
 * @param {Object} options - Compression options (same as compressImage)
 * @returns {Promise<File[]>} - Array of compressed image files
 */
export const compressImages = async (files, options = {}) => {
  const compressedFiles = await Promise.all(
    files.map((file) => compressImage(file, options))
  );
  return compressedFiles;
};

/**
 * Compress all File objects in a product before preparing FormData
 * @param {Object} product - The product object
 * @param {Object} options - Compression options
 * @returns {Promise<Object>} - Product with compressed images
 */
export const compressProductImages = async (product, options = {}) => {
  const compressedProduct = { ...product };

  // Compress thumbnail
  if (product.thumbnail_image instanceof File) {
    compressedProduct.thumbnail_image = await compressImage(
      product.thumbnail_image,
      options
    );
  }

  // Compress gallery images
  if (Array.isArray(product.Gallery_Images)) {
    compressedProduct.Gallery_Images = await Promise.all(
      product.Gallery_Images.map((img) =>
        img instanceof File ? compressImage(img, options) : img
      )
    );
  }

  // Compress variant images
  if (Array.isArray(product.variantValues)) {
    compressedProduct.variantValues = await Promise.all(
      product.variantValues.map(async (variant) => {
        if (Array.isArray(variant.variantImages)) {
          const compressedVariantImages = await Promise.all(
            variant.variantImages.map((img) =>
              img instanceof File ? compressImage(img, options) : img
            )
          );
          return { ...variant, variantImages: compressedVariantImages };
        }
        return variant;
      })
    );
  }

  // Compress varImgGroup images
  if (Array.isArray(product.varImgGroup)) {
    compressedProduct.varImgGroup = await Promise.all(
      product.varImgGroup.map(async (group) => {
        if (Array.isArray(group.varImg)) {
          const compressedVarImg = await Promise.all(
            group.varImg.map((img) =>
              img instanceof File ? compressImage(img, options) : img
            )
          );
          return { ...group, varImg: compressedVarImg };
        }
        return group;
      })
    );
  }

  // Compress meta image
  if (product.meta_Image instanceof File) {
    compressedProduct.meta_Image = await compressImage(
      product.meta_Image,
      options
    );
  }

  return compressedProduct;
};

export default {
  compressImage,
  compressImages,
  compressProductImages,
};
