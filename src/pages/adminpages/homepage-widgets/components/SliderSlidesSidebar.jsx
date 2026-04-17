import PropTypes from "prop-types";
import { getSlideDisplaySrc } from "../service/homepageSliderWidgetService";

export default function SliderSlidesSidebar({
  slides,
  selectedId = null,
  onSelectId,
  onAdd,
  disableAdd = false,
}) {
  return (
    <div className="flex flex-col rounded-lg border border-gray-200 bg-gray-50/80">
      <div className="border-b border-gray-200 px-3 py-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500">Slides</h3>
      </div>
      <ul className="max-h-[min(360px,50vh)] flex-1 space-y-1 overflow-y-auto p-2">
        {slides.map((slide, index) => {
          const thumb = getSlideDisplaySrc(slide);
          const active = slide.id === selectedId;
          return (
            <li key={slide.id}>
              <button
                type="button"
                onClick={() => onSelectId(slide.id)}
                className={`flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left transition ${
                  active
                    ? "border-primary bg-white shadow-sm ring-1 ring-primary/20"
                    : "border-transparent bg-white/60 hover:border-gray-200 hover:bg-white"
                }`}
              >
                <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded bg-gray-200">
                  {thumb ? (
                    <img src={thumb} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[10px] text-gray-400">
                      {index + 1}
                    </span>
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-gray-900">
                    {slide.heading?.trim() || `Slide ${index + 1}`}
                  </span>
                  <span className="block truncate text-[10px] text-gray-500">
                    {slide.description?.trim() || "No description"}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-gray-200 p-2">
        <button
          type="button"
          onClick={onAdd}
          disabled={disableAdd}
          className="w-full rounded-md border border-dashed border-gray-300 bg-white py-2 text-xs font-medium text-gray-600 transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add slide
        </button>
      </div>
    </div>
  );
}

SliderSlidesSidebar.propTypes = {
  slides: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      heading: PropTypes.string,
      description: PropTypes.string,
      imageUrl: PropTypes.string,
      imagePreview: PropTypes.string,
    })
  ).isRequired,
  selectedId: PropTypes.string,
  onSelectId: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  disableAdd: PropTypes.bool,
};
