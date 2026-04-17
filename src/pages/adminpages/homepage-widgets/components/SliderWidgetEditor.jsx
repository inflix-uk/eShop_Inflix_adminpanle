import { useState, useCallback, useEffect } from "react";
import LoadingBar from "react-top-loading-bar";
import { useHomepageSliderWidget } from "../hooks/useHomepageSliderWidget";
import {
  fetchHomepageSliderWidget,
  saveHomepageSliderWidget,
  createEmptySlide,
} from "../service/homepageSliderWidgetService";
import SliderSlidesSidebar from "./SliderSlidesSidebar";
import SliderSlideFormPanel from "./SliderSlideFormPanel";
import SliderWidgetPreview from "./SliderWidgetPreview";

const MAX_SLIDES = 20;

function formatSavedAt(iso) {
  if (!iso) return null;
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return null;
  }
}

export default function SliderWidgetEditor() {
  const {
    slides,
    replaceSlides,
    updateSlideField,
    setSlideImageFile,
    clearSlideImage,
    setSlideImageUrl,
    addSlide,
    removeSlide,
  } = useHomepageSliderWidget();

  const [selectedId, setSelectedId] = useState(null);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setProgress(25);
      const data = await fetchHomepageSliderWidget();
      if (cancelled) return;
      setProgress(100);
      if (!data) {
        const one = createEmptySlide();
        replaceSlides([one]);
        setSelectedId(one.id);
        setPreviewIndex(0);
        setLoading(false);
        return;
      }
      if (data.slides?.length) {
        replaceSlides(data.slides);
        setSelectedId(data.slides[0].id);
        setPreviewIndex(0);
      } else {
        const one = createEmptySlide();
        replaceSlides([one]);
        setSelectedId(one.id);
        setPreviewIndex(0);
      }
      if (data.updatedAt) setLastSavedAt(data.updatedAt);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [replaceSlides]);

  useEffect(() => {
    if (!slides.length) return;
    if (!selectedId || !slides.some((s) => s.id === selectedId)) {
      setSelectedId(slides[0].id);
      setPreviewIndex(0);
    }
  }, [slides, selectedId]);

  const activeSlide = slides.find((s) => s.id === selectedId);
  const activeIndex = Math.max(
    0,
    slides.findIndex((s) => s.id === selectedId)
  );

  const setActiveSlideByIndex = useCallback(
    (i) => {
      if (i < 0 || i >= slides.length) return;
      setPreviewIndex(i);
      setSelectedId(slides[i].id);
    },
    [slides]
  );

  const onHeadingChange = useCallback(
    (id, value) => updateSlideField(id, "heading", value),
    [updateSlideField]
  );

  const onDescriptionChange = useCallback(
    (id, value) => updateSlideField(id, "description", value),
    [updateSlideField]
  );

  const syncPreviewAfterRemove = useCallback((nextLength, removedIndex) => {
    setPreviewIndex((idx) => {
      if (nextLength === 0) return 0;
      if (removedIndex < idx) return idx - 1;
      if (removedIndex === idx) return Math.min(idx, nextLength - 1);
      return Math.min(idx, nextLength - 1);
    });
  }, []);

  const handleRemove = useCallback(
    (id) => {
      const removedIndex = slides.findIndex((s) => s.id === id);
      const nextLength = slides.length <= 1 ? slides.length : slides.length - 1;
      removeSlide(id);
      syncPreviewAfterRemove(nextLength, removedIndex);
      if (id === selectedId && nextLength > 0) {
        const remaining = slides.filter((s) => s.id !== id);
        setSelectedId(remaining[0]?.id ?? null);
      }
    },
    [slides, removeSlide, selectedId, syncPreviewAfterRemove]
  );

  const handleSave = async () => {
    setSaving(true);
    setProgress(40);
    const result = await saveHomepageSliderWidget(slides);
    setProgress(100);
    if (result) {
      replaceSlides(result.slides);
      if (result.updatedAt) setLastSavedAt(result.updatedAt);
      const still = result.slides.find((s) => s.id === selectedId);
      if (!still && result.slides[0]) setSelectedId(result.slides[0].id);
    }
    setSaving(false);
  };

  const handleAddSlide = () => {
    if (slides.length >= MAX_SLIDES) return;
    const id = addSlide();
    setSelectedId(id);
    setPreviewIndex(slides.length);
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-gray-200 bg-white text-sm text-gray-500">
        Loading slider…
      </div>
    );
  }

  const savedLabel = formatSavedAt(lastSavedAt);

  return (
    <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <LoadingBar
        color="#2563EB"
        progress={progress}
        onLoaderFinished={() => setProgress(0)}
      />

      <div className="flex flex-col gap-3 border-b border-gray-100 bg-gray-50/90 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <h2 className="text-base font-bold text-gray-900">Image slider</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          {savedLabel && (
            <span className="text-[10px] text-gray-500">Saved {savedLabel}</span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-secondary disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save slider"}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="w-full shrink-0 lg:w-52">
            <SliderSlidesSidebar
              slides={slides}
              selectedId={selectedId}
              onSelectId={(id) => {
                setSelectedId(id);
                const i = slides.findIndex((s) => s.id === id);
                if (i >= 0) setPreviewIndex(i);
              }}
              onAdd={handleAddSlide}
              disableAdd={slides.length >= MAX_SLIDES}
            />
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            <SliderWidgetPreview
              slides={slides}
              activeIndex={previewIndex}
              onSelectIndex={setActiveSlideByIndex}
              compact
            />

            <SliderSlideFormPanel
              slide={activeSlide}
              index={activeIndex}
              onHeadingChange={onHeadingChange}
              onDescriptionChange={onDescriptionChange}
              onImageFileChange={setSlideImageFile}
              onClearImage={clearSlideImage}
              onImageUrlChange={setSlideImageUrl}
              onRemove={handleRemove}
              disableRemove={slides.length <= 1}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
