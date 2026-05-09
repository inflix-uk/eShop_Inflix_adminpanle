import { useEffect, useRef, useCallback, useState } from "react";
import PropTypes from "prop-types";
import { getSlideDisplaySrc } from "../service/homepageSliderWidgetService";

export default function SliderWidgetPreview({
  slides,
  activeIndex,
  onSelectIndex,
  compact = false,
}) {
  const scrollerRef = useRef(null);
  const [scrollIndex, setScrollIndex] = useState(0);

  const cardWidth = compact ? 140 : 200;
  const gap = compact ? 10 : 12;
  const step = cardWidth + gap;

  const safeIndex =
    slides.length === 0 ? 0 : Math.min(activeIndex, Math.max(0, slides.length - 1));

  useEffect(() => {
    if (activeIndex >= slides.length && slides.length > 0) {
      onSelectIndex(slides.length - 1);
    }
  }, [activeIndex, slides.length, onSelectIndex]);

  const scrollToIndex = useCallback(
    (i) => {
      const el = scrollerRef.current;
      const idx = Math.max(0, Math.min(i, Math.max(0, slides.length - 1)));
      onSelectIndex(idx);
      setScrollIndex(idx);
      if (el) {
        el.scrollTo({ left: idx * step, behavior: "smooth" });
      }
    },
    [onSelectIndex, slides.length, step]
  );

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || slides.length === 0) return;
    let timeoutId;
    const onScroll = () => {
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        const i = Math.round(el.scrollLeft / step);
        const idx = Math.max(0, Math.min(i, slides.length - 1));
        setScrollIndex(idx);
        onSelectIndex(idx);
      }, 100);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timeoutId);
      el.removeEventListener("scroll", onScroll);
    };
  }, [slides.length, step, onSelectIndex]);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el || slides.length === 0) return;
    el.scrollTo({ left: safeIndex * step, behavior: "auto" });
    setScrollIndex(safeIndex);
  }, [safeIndex, slides.length, step]);

  useEffect(() => {
    setScrollIndex((si) => {
      if (slides.length === 0) return 0;
      return Math.min(si, slides.length - 1);
    });
  }, [slides.length]);

  const goPrev = () => {
    if (!slides.length) return;
    scrollToIndex((scrollIndex - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    if (!slides.length) return;
    scrollToIndex((scrollIndex + 1) % slides.length);
  };

  const shell = compact
    ? "rounded-lg border border-gray-200 bg-gray-50 shadow-sm ring-1 ring-black/5"
    : "rounded-2xl border border-gray-200 bg-gray-50 shadow-lg ring-1 ring-black/5";

  return (
    <div className={shell}>
      <div
        className={`flex items-center justify-between border-b border-gray-200 bg-white/90 ${
          compact ? "px-2 py-1.5" : "px-3 py-2"
        }`}
      >
        <span className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
          {compact ? "Card preview" : "Storefront cards"}
        </span>
        <div className="flex items-center gap-1">
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={goPrev}
                className="rounded-full border border-gray-200 bg-white p-1 text-gray-700 hover:bg-gray-50"
                aria-label="Previous"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                type="button"
                onClick={goNext}
                className="rounded-full border border-gray-200 bg-white p-1 text-gray-700 hover:bg-gray-50"
                aria-label="Next"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
          <span className="text-[10px] text-gray-500 tabular-nums">
            {slides.length ? `${scrollIndex + 1} / ${slides.length}` : "—"}
          </span>
        </div>
      </div>

      <div className={`${compact ? "p-2" : "p-3"}`}>
        <div
          ref={scrollerRef}
          className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto pb-1 sm:gap-3 [scrollbar-width:thin]"
        >
          {slides.map((s, i) => {
            const src = getSlideDisplaySrc(s);
            const active = i === scrollIndex;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollToIndex(i)}
                className={`snap-start shrink-0 overflow-hidden rounded-lg border bg-white text-left shadow-sm transition-all hover:shadow ${
                  active ? "border-primary ring-2 ring-primary/30" : "border-gray-200"
                }`}
                style={{ width: cardWidth, minWidth: cardWidth }}
              >
                <div
                  className={`relative w-full bg-gray-100 ${compact ? "aspect-[5/4]" : "aspect-[4/3]"}`}
                >
                  {src ? (
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-contain"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[9px] text-gray-400">
                      Image
                    </div>
                  )}
                </div>
                <div className={`border-t border-gray-100 ${compact ? "p-1.5" : "p-2"}`}>
                  <p
                    className={`font-semibold text-gray-900 line-clamp-2 ${
                      compact ? "text-[10px] leading-tight" : "text-xs"
                    }`}
                  >
                    {s.heading?.trim() || "Heading"}
                  </p>
                  <p
                    className={`mt-0.5 text-gray-600 line-clamp-3 ${
                      compact ? "text-[9px] leading-snug" : "text-[10px] leading-snug"
                    }`}
                  >
                    {s.description?.trim() || "Description"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <div className={`flex justify-center gap-1 border-t border-gray-200 bg-white/80 ${compact ? "py-1.5" : "py-2"}`}>
          {slides.map((s, i) => (
            <button
              key={`dot-${s.id}`}
              type="button"
              onClick={() => scrollToIndex(i)}
              className={`rounded-full transition-all ${
                compact ? "h-1.5" : "h-2"
              } ${i === scrollIndex ? "w-5 bg-primary" : "w-1.5 bg-gray-300 hover:bg-gray-400"}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

SliderWidgetPreview.propTypes = {
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      heading: PropTypes.string,
      description: PropTypes.string,
      imageUrl: PropTypes.string,
      imagePreview: PropTypes.string,
    })
  ).isRequired,
  activeIndex: PropTypes.number.isRequired,
  onSelectIndex: PropTypes.func.isRequired,
  compact: PropTypes.bool,
};
