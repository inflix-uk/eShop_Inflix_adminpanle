import { useState } from 'react';
import PropTypes from 'prop-types';
import { PhotoIcon } from '@heroicons/react/24/outline';

/**
 * <img> that fails over to a static placeholder exactly once.
 *
 * The old pattern (`onError={e => { e.target.onerror = null; e.target.src = fallback }}`)
 * looped forever: React's synthetic onError isn't the DOM `onerror` property, so nulling
 * it did nothing, and the fallback (`/assets/images/fallback.jpg`) doesn't exist in the
 * admin build — the SPA host answers it with index.html, which fails to decode, which
 * fires onError again, which re-assigns src… Each retry repaints the broken image, which
 * is the flicker seen on return-request product and attachment images.
 */
const StableImage = ({ src, alt, className, onClick, loading = 'lazy' }) => {
  // Remember which src failed (not a bare boolean) so a new src gets a fresh attempt
  // without needing an effect to reset state.
  const [failedSrc, setFailedSrc] = useState(null);

  if (!src || failedSrc === src) {
    return (
      <div
        className={`${className || ''} flex items-center justify-center bg-gray-100 text-gray-400`}
        onClick={onClick}
        role="img"
        aria-label={alt || 'Image unavailable'}
        title="Image unavailable"
      >
        <PhotoIcon className="w-1/2 h-1/2 max-w-[2.5rem] max-h-[2.5rem]" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onClick={onClick}
      loading={loading}
      decoding="async"
      onError={() => setFailedSrc(src)}
    />
  );
};

StableImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  loading: PropTypes.oneOf(['lazy', 'eager']),
};

export default StableImage;
