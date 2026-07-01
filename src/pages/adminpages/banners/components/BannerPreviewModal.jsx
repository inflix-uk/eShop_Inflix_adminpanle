import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) {
    console.warn('[BannerPreviewModal] Empty image path provided');
    return '/placeholder.svg';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // If it's a data URL, return as is
  if (imagePath.startsWith('data:')) {
    return imagePath;
  }
  
  if (!BACKEND_URL) {
    console.error('[BannerPreviewModal] VITE_BACKEND_URL is not defined');
    return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  }
  
  // Handle path construction
  // If path already starts with /uploads/, use it directly
  // If path starts with /banners/, /footer/, etc., prepend /uploads
  // Otherwise, prepend /uploads/ to the path
  let finalPath = '';
  if (imagePath.startsWith('/uploads/')) {
    finalPath = imagePath;
  } else if (imagePath.startsWith('/banners/') || imagePath.startsWith('/footer/') || imagePath.startsWith('/blog/')) {
    // Path starts with /banners/, /footer/, etc., prepend /uploads
    finalPath = `/uploads${imagePath}`;
  } else if (imagePath.startsWith('/')) {
    // Path starts with / but not /uploads/, prepend /uploads
    finalPath = `/uploads${imagePath}`;
  } else {
    // Path doesn't start with /, prepend /uploads/
    finalPath = `/uploads/${imagePath}`;
  }
  
  const baseUrl = BACKEND_URL.endsWith('/') ? BACKEND_URL.slice(0, -1) : BACKEND_URL;
  const fullUrl = `${baseUrl}${finalPath}`;
  
  console.log('[BannerPreviewModal] Image URL construction:', {
    original: imagePath,
    finalPath,
    baseUrl,
    fullUrl
  });
  
  return fullUrl;
};

function resolveBannerTextAlign(content) {
  const a = content?.textAlign;
  if (a === "center" || a === "right") return a;
  return "left";
}

function resolveTextPosition(content) {
  const p = content?.textPosition;
  if (p === "left" || p === "center") return p;
  return "right";
}

function desktopTextBlockPositionClass(pos) {
  const top = "top-[14%] md:top-[18%]";
  if (pos === "left") {
    return `${top} left-3 md:left-8 lg:left-14 right-auto max-w-[min(32rem,calc(50vw-1rem))]`;
  }
  if (pos === "center") {
    return `${top} left-1/2 -translate-x-1/2 right-auto w-[min(42rem,92vw)] px-3 md:px-4`;
  }
  return `${top} right-3 md:right-8 lg:right-14 left-auto max-w-[min(32rem,calc(50vw-1rem))]`;
}

function flexItemsForTextAlign(align) {
  if (align === "center") return "items-center";
  if (align === "right") return "items-end";
  return "items-start";
}

function textAlignTailwind(align) {
  if (align === "center") return "text-center";
  if (align === "right") return "text-right";
  return "text-left";
}

function paragraphAlignClass(align) {
  if (align === "center") return "mx-auto";
  if (align === "right") return "ml-auto mr-0";
  return "";
}

function warrantyOuterClass(align) {
  if (align === "center") return "flex flex-col items-center";
  if (align === "right") return "flex flex-col items-end";
  return "";
}

function warrantyRowClass(align) {
  const base = "flex items-center gap-2 lg:font-semibold";
  if (align === "center") return `${base} justify-center`;
  if (align === "right") return `${base} justify-end`;
  return base;
}

function mobileStackClass(pos) {
  if (pos === "left") return "items-start";
  if (pos === "right") return "items-end";
  return "items-center";
}

const BannerPreviewModal = ({ isOpen, onClose, banners }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoplayInterval = 5000;
  const autoplayRef = useRef(null);

  // Filter only active banners
  const activeBanners = banners.filter(banner => banner.isActive !== false);
  
  // Debug log
  useEffect(() => {
    if (isOpen && activeBanners.length > 0) {
      console.log('[BannerPreviewModal] Active banners:', activeBanners);
      console.log('[BannerPreviewModal] BACKEND_URL:', BACKEND_URL);
      activeBanners.forEach((banner, index) => {
        const largeUrl = banner.imageLarge ? getImageUrl(banner.imageLarge) : 'N/A';
        const smallUrl = banner.imageSmall ? getImageUrl(banner.imageSmall) : 'N/A';
        console.log(`[BannerPreviewModal] Banner ${index + 1}:`, {
          id: banner._id,
          imageLarge: banner.imageLarge,
          imageSmall: banner.imageSmall,
          imageLargeUrl: largeUrl,
          imageSmallUrl: smallUrl,
        });
      });
    }
  }, [isOpen, activeBanners.length]);

  useEffect(() => {
    if (isOpen && activeBanners.length > 0) {
      // Start autoplay
      autoplayRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
      }, autoplayInterval);

      return () => {
        if (autoplayRef.current) {
          clearInterval(autoplayRef.current);
        }
      };
    }
  }, [isOpen, activeBanners.length]);

  // Reset to first slide when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentSlide(0);
    }
  }, [isOpen]);

  if (!isOpen || activeBanners.length === 0) return null;

  const handlePrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % activeBanners.length);
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  // Get button link for a banner
  const getButtonLink = (banner) => {
    if (banner.type === "simple") {
      return banner.buttonLink || "#";
    } else {
      return banner.content?.buynow || "#";
    }
  };

  // Get button text for a banner
  const getButtonText = (banner) => {
    if (banner.type === "simple") {
      return banner.buttonText || "SHOP NOW";
    } else {
      return banner.buttonText || "SHOP NOW";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-90"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className="relative w-full h-full flex flex-col">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-2"
          aria-label="Close preview"
        >
          <FiX size={24} />
        </button>

        {/* Carousel container */}
        <div className="relative flex-1 overflow-hidden">
          {activeBanners.map((banner, index) => {
            const textAlign = resolveBannerTextAlign(banner.content);
            const textPos = resolveTextPosition(banner.content);
            const previewWidth = banner.imageLargeWidthPx || 1200;
            const previewHeight = banner.imageLargeHeightPx || 417;
            return (
            <div
              key={banner._id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="relative w-full">
                {/* Responsive banner image */}
                <picture>
                  <source 
                    srcSet={getImageUrl(banner.imageLarge)} 
                    media="(min-width: 640px)" 
                  />
                  <source 
                    srcSet={getImageUrl(banner.imageSmall)} 
                    media="(max-width: 639px)" 
                  />
                  <img
                    src={getImageUrl(banner.imageLarge || banner.imageSmall)}
                    alt={banner.altText || "Banner"}
                    className="w-full h-auto object-cover min-h-[420px] sm:min-h-[300px] md:min-h-[400px]"
                    width={previewWidth}
                    height={previewHeight}
                    onError={(e) => {
                      e.target.src = '/placeholder.svg';
                    }}
                  />
                </picture>

                {/* Social Media - Fixed at top right */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 text-white hidden sm:block z-40">
                  <div className="text-xs sm:text-sm font-medium mb-1">
                    Follow Us Now
                  </div>
                  <div className="flex gap-1 sm:gap-2">
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-full p-1"
                      aria-label="Visit Facebook Page"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5"
                      >
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </a>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-full p-1"
                      aria-label="Follow on Twitter"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5"
                      >
                        <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                      </svg>
                    </a>
                    <a
                      href="https://www.youtube.com/channel/UCb5pBW9HkmUo7CjszeJwqqQ"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-full p-1"
                      aria-label="Visit YouTube Channel"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5"
                      >
                        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                        <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                      </svg>
                    </a>
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white rounded-full p-1"
                      aria-label="Follow on Instagram"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-5 h-5"
                      >
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                  </div>
                </div>

                {banner.type === "full" && (
                  <>
                    <div className="absolute inset-0 hidden sm:block pointer-events-none z-[1]">
                      {banner.extraImage && (
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[min(520px,42vw)] flex justify-center">
                          <img
                            className={`hidden sm:block -rotate-12 ${
                              index === currentSlide ? "animate-slideUp" : "opacity-0"
                            }`}
                            src={getImageUrl(banner.extraImage)}
                            alt={`${banner.altText} device`}
                            width={600}
                            height={600}
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 hidden sm:block z-[2] pointer-events-none">
                      {banner.content && (
                        <div
                          className={`absolute ${desktopTextBlockPositionClass(
                            textPos
                          )} pointer-events-auto`}
                        >
                          <div
                            className={`flex flex-col w-full ${flexItemsForTextAlign(
                              textAlign
                            )} ${textAlignTailwind(textAlign)} ${
                              index === currentSlide ? "animate-fadeIn" : "opacity-0"
                            }`}
                          >
                            {banner.content.title && (
                              <div
                                className="text-2xl sm:text-3xl lg:text-3xl font-bold tracking-wider text-white"
                                style={{
                                  fontSize: banner.content.titleSize || "24px",
                                  color: banner.content.titleColor || "#FFFFFF",
                                }}
                              >
                                {banner.content.title}
                              </div>
                            )}
                            {banner.content.subtitle && (
                              <div
                                className="text-xl sm:text-2xl lg:text-5xl xl:text-6xl font-extrabold leading-none tracking-wide text-primary"
                                style={{
                                  fontSize: banner.content.subtitleSize || "32px",
                                  color: banner.content.subtitleColor || "#FFFFFF",
                                }}
                              >
                                {banner.content.subtitle}
                              </div>
                            )}
                            {banner.content.paragraph && (
                              <p
                                className={`text-white text-sm sm:text-base mt-2 lg:text-2xl max-w-[90%] lg:max-w-[85%] ${paragraphAlignClass(
                                  textAlign
                                )}`}
                                style={{
                                  fontSize: banner.content.paragraphSize || "18px",
                                  color: banner.content.paragraphColor || "#FFFFFF",
                                }}
                              >
                                {banner.content.paragraph}
                              </p>
                            )}
                            {banner.content.price && (
                              <p
                                className="text-red-500 text-xl sm:text-2xl lg:text-3xl font-bold mt-2"
                                style={{
                                  fontSize: banner.content.priceSize || "20px",
                                  color: banner.content.priceColor || "#FF0000",
                                }}
                              >
                                {banner.content.price}
                              </p>
                            )}
                            {banner.content.warranty &&
                              banner.content.warranty.length > 0 && (
                                <div
                                  className={`mt-2 lg:mt-4 text-base lg:text-2xl text-white ${warrantyOuterClass(
                                    textAlign
                                  )}`}
                                >
                                  {banner.content.warranty.map((item, i) => (
                                    <div key={i} className={warrantyRowClass(textAlign)}>
                                      <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full bg-white shrink-0"></div>
                                      <span>{item}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            <a
                              href={getButtonLink(banner)}
                              className="mt-5 bg-white text-black text-sm lg:text-base font-bold py-1.5 lg:py-2 px-4 lg:px-6 rounded-lg flex items-center gap-2 w-fit"
                            >
                              {getButtonText(banner)}
                              <span className="flex items-center justify-center w-4 lg:w-5 h-4 lg:h-5 bg-black text-white rounded-lg">
                                →
                              </span>
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {banner.type === "simple" && (
                  <div className="absolute inset-0 hidden sm:flex">
                    <div className="w-3/12 md:w-2/12 lg:w-2/12 relative flex items-end pb-6 pl-6 z-[5]">
                      <a
                        href={getButtonLink(banner)}
                        className="bg-white text-black text-sm lg:text-base font-bold py-1.5 lg:py-2 px-4 lg:px-6 rounded-lg flex items-center gap-2"
                      >
                        {getButtonText(banner)}
                        <span className="flex items-center justify-center w-4 lg:w-5 h-4 lg:h-5 bg-black text-white rounded-lg">
                          →
                        </span>
                      </a>
                    </div>
                    <div className="md:w-4/12 lg:w-4/12 relative -rotate-12">
                      {banner.extraImage && (
                        <img
                          className={`absolute -bottom-5 transform -translate-y-1/4 hidden sm:block ${
                            index === currentSlide ? "animate-slideUp" : "opacity-0"
                          }`}
                          src={getImageUrl(banner.extraImage)}
                          alt={`${banner.altText} device`}
                          width={600}
                          height={600}
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      )}
                    </div>
                    <div className="w-6/12 lg:w-6/12" aria-hidden />
                  </div>
                )}

                {banner.type === "full" && (
                <div
                  className={`sm:hidden absolute inset-0 flex flex-col p-4 ${mobileStackClass(
                    textPos
                  )} ${textAlignTailwind(textAlign)}`}
                >
                  {banner.extraImage && (
                    <div
                      className={`w-full max-w-[150px] mt-4 ${
                        textPos === "center"
                          ? "mx-auto"
                          : textPos === "right"
                            ? "ml-auto"
                            : "mr-auto"
                      } ${index === currentSlide ? "animate-slideUp" : "opacity-0"}`}
                    >
                      <img
                        src={getImageUrl(banner.extraImage)}
                        alt={`${banner.altText} device`}
                        width={520}
                        height={520}
                        className="object-contain w-full h-auto"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  {banner.content && (
                    <div
                      className={`mt-4 flex flex-col w-full ${flexItemsForTextAlign(
                        textAlign
                      )} ${textAlignTailwind(textAlign)} ${
                        index === currentSlide ? "animate-fadeIn" : "opacity-0"
                      }`}
                    >
                      {banner.content.title && (
                        <h2
                          className="text-sm font-bold mb-1 text-shadow"
                          style={{
                            fontSize: banner.content.titleSize || "24px",
                            color: banner.content.titleColor || "#FFFFFF",
                          }}
                        >
                          {banner.content.title}
                        </h2>
                      )}
                      {banner.content.subtitle && (
                        <h3
                          className="text-xl font-bold mb-1 text-shadow"
                          style={{
                            fontSize: banner.content.subtitleSize || "32px",
                            color: banner.content.subtitleColor || "#FFFFFF",
                          }}
                        >
                          {banner.content.subtitle}
                        </h3>
                      )}
                      {banner.content.paragraph && (
                        <p
                          className={`text-[10px] mb-1 text-shadow max-w-[250px] ${paragraphAlignClass(
                            textAlign
                          )}`}
                          style={{
                            fontSize: banner.content.paragraphSize || "18px",
                            color: banner.content.paragraphColor || "#FFFFFF",
                          }}
                        >
                          {banner.content.paragraph}
                        </p>
                      )}
                      {banner.content.price && (
                        <p
                          className="text-lg font-bold mb-1 text-shadow"
                          style={{
                            fontSize: banner.content.priceSize || "20px",
                            color: banner.content.priceColor || "#FF0000",
                          }}
                        >
                          {banner.content.price}
                        </p>
                      )}
                      {banner.content.warranty && banner.content.warranty.length > 0 && (
                        <div
                          className={`text-[10px] text-shadow mb-2 ${warrantyOuterClass(
                            textAlign
                          )}`}
                        >
                          {banner.content.warranty.map((item, i) => (
                            <div key={i} className={`mb-0.5 ${warrantyRowClass(textAlign)}`}>
                              <span className="opacity-90">•</span>
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <a
                        href={getButtonLink(banner)}
                        className="mt-2 bg-white text-black text-xs font-bold py-1 px-3 rounded-full flex items-center gap-1 w-fit"
                      >
                        {getButtonText(banner)}
                        <span className="flex items-center justify-center w-3 h-3 bg-black text-white rounded-full text-[8px]">
                          →
                        </span>
                      </a>
                    </div>
                  )}
                </div>
                )}

                {banner.type === "simple" && (
                  <div className="sm:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[5]">
                    <a
                      href={getButtonLink(banner)}
                      className={`${
                        index === currentSlide ? "animate-fadeIn" : "opacity-0"
                      } bg-white text-black text-xs font-bold py-1 px-3 rounded-full flex items-center gap-1 mx-auto w-fit`}
                    >
                      {getButtonText(banner)}
                      <span className="flex items-center justify-center w-3 h-3 bg-black text-white rounded-full text-[8px]">
                        →
                      </span>
                    </a>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>

        {/* Navigation arrows */}
        {activeBanners.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-40 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3"
              aria-label="Previous banner"
            >
              <FiChevronLeft size={24} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-40 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 rounded-full p-3"
              aria-label="Next banner"
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}

        {/* Pagination dots */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3 z-40">
            {activeBanners.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleDotClick(index)}
                className="w-4 h-4 flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-white"
                aria-label={`Go to slide ${index + 1}`}
              >
                <span
                  className={`block w-2.5 h-2.5 md:w-3 md:h-3 rounded-full shadow-md ${
                    index === currentSlide ? "bg-white" : "bg-white bg-opacity-50"
                  }`}
                />
              </button>
            ))}
          </div>
        )}

        {/* Add CSS animations */}
        <style>{`
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          .animate-slideUp {
            animation: slideUp 0.8s ease forwards;
          }
          .animate-fadeIn {
            animation: fadeIn 0.8s ease forwards;
          }
          .text-shadow {
            text-shadow: 0 1px 3px rgba(0,0,0,0.8);
          }
        `}</style>
      </div>
    </div>
  );
};

BannerPreviewModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  banners: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      type: PropTypes.oneOf(["simple", "full"]).isRequired,
      imageLarge: PropTypes.string,
      imageSmall: PropTypes.string,
      altText: PropTypes.string,
      buttonText: PropTypes.string,
      buttonLink: PropTypes.string,
      extraImage: PropTypes.string,
      isActive: PropTypes.bool,
      content: PropTypes.shape({
        title: PropTypes.string,
        subtitle: PropTypes.string,
        paragraph: PropTypes.string,
        price: PropTypes.string,
        buynow: PropTypes.string,
        sellnow: PropTypes.string,
        warranty: PropTypes.arrayOf(PropTypes.string),
        titleColor: PropTypes.string,
        subtitleColor: PropTypes.string,
        paragraphColor: PropTypes.string,
        priceColor: PropTypes.string,
        titleSize: PropTypes.string,
        subtitleSize: PropTypes.string,
        paragraphSize: PropTypes.string,
        priceSize: PropTypes.string,
      }),
    })
  ).isRequired,
};

export default BannerPreviewModal;
