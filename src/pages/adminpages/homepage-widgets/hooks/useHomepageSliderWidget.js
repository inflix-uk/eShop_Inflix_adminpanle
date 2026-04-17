import { useState, useCallback, useEffect, useRef } from "react";
import { createEmptySlide } from "../service/homepageSliderWidgetService";

function revokeIfBlob(url) {
  if (url && String(url).startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
}

export function useHomepageSliderWidget() {
  const [slides, setSlides] = useState([]);
  const slidesRef = useRef(slides);
  slidesRef.current = slides;

  useEffect(() => {
    return () => {
      slidesRef.current.forEach((s) => revokeIfBlob(s.imagePreview));
    };
  }, []);

  const replaceSlides = useCallback((next) => {
    setSlides((prev) => {
      prev.forEach((s) => revokeIfBlob(s.imagePreview));
      return next.map((s) => ({
        ...s,
        imageFile: null,
        imagePreview: null,
      }));
    });
  }, []);

  const updateSlideField = useCallback((id, field, value) => {
    setSlides((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  }, []);

  const setSlideImageFile = useCallback((id, file) => {
    setSlides((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        revokeIfBlob(s.imagePreview);
        if (!file) {
          return { ...s, imageFile: null, imagePreview: null };
        }
        return {
          ...s,
          imageFile: file,
          imagePreview: URL.createObjectURL(file),
        };
      })
    );
  }, []);

  /** Remove preview/file and clear stored URL (user removed image in uploader). */
  const clearSlideImage = useCallback((id) => {
    setSlides((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        revokeIfBlob(s.imagePreview);
        return {
          ...s,
          imageFile: null,
          imagePreview: null,
          imageUrl: "",
        };
      })
    );
  }, []);

  const setSlideImageUrl = useCallback((id, url) => {
    setSlides((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        revokeIfBlob(s.imagePreview);
        return {
          ...s,
          imageUrl: url,
          imageFile: null,
          imagePreview: null,
        };
      })
    );
  }, []);

  const addSlide = useCallback(() => {
    const slide = createEmptySlide();
    setSlides((prev) => [...prev, slide]);
    return slide.id;
  }, []);

  const removeSlide = useCallback((id) => {
    setSlides((prev) => {
      if (prev.length <= 1) return prev;
      const slide = prev.find((s) => s.id === id);
      if (slide) revokeIfBlob(slide.imagePreview);
      return prev.filter((s) => s.id !== id);
    });
  }, []);

  return {
    slides,
    setSlides,
    replaceSlides,
    updateSlideField,
    setSlideImageFile,
    clearSlideImage,
    setSlideImageUrl,
    addSlide,
    removeSlide,
  };
}
