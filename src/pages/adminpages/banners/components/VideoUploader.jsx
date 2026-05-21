import { useRef } from "react";
import PropTypes from "prop-types";
import { FiX, FiUpload, FiVideo } from "react-icons/fi";

const VideoUploader = ({
  label,
  helperText = null,
  value,
  onChange,
  error,
  required = false,
  maxSizeMB = 50,
}) => {
  const fileInputRef = useRef(null);
  const previewUrl =
    typeof value === "string" && value.length > 0 ? value : null;

  const handleFileSelect = (file) => {
    if (!file) return;
    const allowed = /\.(mp4|webm|ogg)$/i;
    if (!allowed.test(file.name) && !file.type.startsWith("video/")) {
      alert("Please select a video file (.mp4, .webm, or .ogg)");
      return;
    }
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSizeMB}MB`);
      return;
    }
    onChange(file);
  };

  const handleRemove = () => {
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {helperText ? (
        <p className="text-xs text-gray-500 mb-2">{helperText}</p>
      ) : null}

      {previewUrl ? (
        <div className="relative rounded-lg border border-gray-300 bg-black overflow-hidden">
          <video
            src={previewUrl}
            className="w-full max-h-48 object-contain"
            muted
            loop
            autoPlay
            playsInline
            controls
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 rounded-full bg-red-500 p-1.5 text-white shadow hover:bg-red-600"
            title="Remove video"
          >
            <FiX size={16} />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-8 transition-colors hover:border-primary hover:bg-gray-50 ${
            error ? "border-red-300 bg-red-50" : "border-gray-300"
          }`}
        >
          <FiVideo className="mb-2 h-10 w-10 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">Click to upload video</p>
          <p className="mt-1 text-xs text-gray-500">
            MP4, WebM, or OGG — max {maxSizeMB}MB
          </p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/ogg,.mp4,.webm,.ogg"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelect(file);
          e.target.value = "";
        }}
      />

      {!previewUrl ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <FiUpload size={14} />
          Choose file
        </button>
      ) : null}

      {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
    </div>
  );
};

VideoUploader.propTypes = {
  label: PropTypes.string.isRequired,
  helperText: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func.isRequired,
  error: PropTypes.string,
  required: PropTypes.bool,
  maxSizeMB: PropTypes.number,
};

export default VideoUploader;
