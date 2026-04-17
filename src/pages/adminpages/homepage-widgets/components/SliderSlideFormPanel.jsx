import PropTypes from "prop-types";
import ImageUploader from "../../banners/components/ImageUploader";
import { getSlideDisplaySrc } from "../service/homepageSliderWidgetService";

export default function SliderSlideFormPanel({
  slide,
  index,
  onHeadingChange,
  onDescriptionChange,
  onImageFileChange,
  onClearImage,
  onImageUrlChange,
  onRemove,
  disableRemove,
}) {
  if (!slide) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-6 text-center text-sm text-gray-500">
        Select a slide from the list.
      </div>
    );
  }

  const displaySrc = getSlideDisplaySrc(slide);

  const handleImageChange = (file) => {
    if (file === null) {
      onClearImage(slide.id);
    } else {
      onImageFileChange(slide.id, file);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-gray-900">Edit slide {index + 1}</h3>
        <button
          type="button"
          onClick={() => onRemove(slide.id)}
          disabled={disableRemove}
          className="shrink-0 rounded border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Remove
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:items-start">
        <div className="max-w-full sm:max-w-[220px]">
          <ImageUploader
            label="Image"
            value={displaySrc || undefined}
            onChange={handleImageChange}
            maxSizeMB={5}
          />
        </div>

        <div className="min-w-0 space-y-3">
          <div>
            <label
              htmlFor={`slide-url-${slide.id}`}
              className="mb-0.5 block text-xs font-medium text-gray-600"
            >
              Image URL (optional)
            </label>
            <input
              id={`slide-url-${slide.id}`}
              type="url"
              placeholder="https://…"
              value={slide.imageUrl}
              onChange={(e) => onImageUrlChange(slide.id, e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <p className="mt-0.5 text-[10px] text-gray-500">
              Overrides when no new file is uploaded. Clear URL to rely on upload only.
            </p>
          </div>

          <div>
            <label
              htmlFor={`slide-heading-${slide.id}`}
              className="mb-0.5 block text-xs font-medium text-gray-600"
            >
              Heading
            </label>
            <input
              id={`slide-heading-${slide.id}`}
              type="text"
              value={slide.heading}
              onChange={(e) => onHeadingChange(slide.id, e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Headline"
            />
          </div>

          <div>
            <label
              htmlFor={`slide-desc-${slide.id}`}
              className="mb-0.5 block text-xs font-medium text-gray-600"
            >
              Description
            </label>
            <textarea
              id={`slide-desc-${slide.id}`}
              rows={3}
              value={slide.description}
              onChange={(e) => onDescriptionChange(slide.id, e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-2.5 py-1.5 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Supporting text"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

SliderSlideFormPanel.propTypes = {
  slide: PropTypes.shape({
    id: PropTypes.string.isRequired,
    heading: PropTypes.string,
    description: PropTypes.string,
    imageUrl: PropTypes.string,
    imageFile: PropTypes.object,
    imagePreview: PropTypes.string,
  }),
  index: PropTypes.number.isRequired,
  onHeadingChange: PropTypes.func.isRequired,
  onDescriptionChange: PropTypes.func.isRequired,
  onImageFileChange: PropTypes.func.isRequired,
  onClearImage: PropTypes.func.isRequired,
  onImageUrlChange: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
  disableRemove: PropTypes.bool.isRequired,
};
