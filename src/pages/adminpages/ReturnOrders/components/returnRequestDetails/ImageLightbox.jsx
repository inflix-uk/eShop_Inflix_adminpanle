import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FaTimes, FaChevronLeft, FaChevronRight, FaExternalLinkAlt } from 'react-icons/fa';
import { PhotoIcon } from '@heroicons/react/24/outline';

/**
 * Full-size image viewer used on the return request page (product + customer attachments).
 * Esc closes, arrow keys move between images, clicking the backdrop closes.
 */
const ImageLightbox = ({ images, index, onClose, onIndexChange }) => {
  const isOpen = index != null && images && images.length > 0;
  const current = isOpen ? images[Math.min(index, images.length - 1)] : null;
  const [failedSrc, setFailedSrc] = useState(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && images.length > 1) {
        onIndexChange((index - 1 + images.length) % images.length);
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        onIndexChange((index + 1) % images.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, index, images, onClose, onIndexChange]);

  if (!isOpen || !current) return null;

  const hasMany = images.length > 1;
  const broken = !current.src || failedSrc === current.src;
  const go = (delta) => (e) => {
    e.stopPropagation();
    onIndexChange((index + delta + images.length) % images.length);
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={current.alt || 'Image preview'}
    >
      <div className="absolute top-4 right-4 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {!broken && (
          <a
            href={current.src}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
            title="Open original in a new tab"
          >
            <FaExternalLinkAlt size={12} /> Open original
          </a>
        )}
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg bg-white/10 p-2 text-white hover:bg-white/20"
          aria-label="Close"
        >
          <FaTimes size={18} />
        </button>
      </div>

      {hasMany && (
        <button
          type="button"
          onClick={go(-1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-lg bg-white/10 p-3 text-white hover:bg-white/20"
          aria-label="Previous image"
        >
          <FaChevronLeft size={20} />
        </button>
      )}

      <div className="flex max-h-full max-w-full flex-col items-center" onClick={(e) => e.stopPropagation()}>
        {broken ? (
          <div className="flex h-64 w-80 flex-col items-center justify-center rounded-lg bg-gray-100 text-gray-500">
            <PhotoIcon className="h-12 w-12" aria-hidden="true" />
            <p className="mt-2 text-sm">This image could not be loaded.</p>
          </div>
        ) : (
          <img
            key={current.src}
            src={current.src}
            alt={current.alt || ''}
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            onError={() => setFailedSrc(current.src)}
          />
        )}
        <p className="mt-3 text-center text-sm text-white/80">
          {current.alt}
          {hasMany ? ` (${index + 1} / ${images.length})` : ''}
        </p>
      </div>

      {hasMany && (
        <button
          type="button"
          onClick={go(1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-white/10 p-3 text-white hover:bg-white/20"
          aria-label="Next image"
        >
          <FaChevronRight size={20} />
        </button>
      )}
    </div>
  );
};

ImageLightbox.propTypes = {
  images: PropTypes.arrayOf(
    PropTypes.shape({
      src: PropTypes.string,
      alt: PropTypes.string,
    })
  ),
  index: PropTypes.number,
  onClose: PropTypes.func.isRequired,
  onIndexChange: PropTypes.func.isRequired,
};

export default ImageLightbox;
