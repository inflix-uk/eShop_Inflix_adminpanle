import PropTypes from "prop-types";
import { Calendar, Save } from "lucide-react";

export default function PublishSettings({
  publishStatus,
  setPublishStatus,
  publishDate,
  setPublishDate,
  isSubmitting,
  handleSubmit,
  isEditMode = false,
  submitButtonType = "submit",
  useDualActionButtons = false,
} = {}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Publish Settings</h3>

        <div className="space-y-4">
          {/* Status — single-button flow (edit / legacy) */}
          {!useDualActionButtons && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="flex flex-wrap justify-start gap-x-6 gap-y-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-primary"
                    name="status"
                    value="draft"
                    checked={publishStatus === "draft"}
                    onChange={() => setPublishStatus("draft")}
                  />
                  <span className="ml-2 text-sm text-gray-700">Draft</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    className="form-radio text-primary"
                    name="status"
                    value="published"
                    checked={publishStatus === "published"}
                    onChange={() => setPublishStatus("published")}
                  />
                  <span className="ml-2 text-sm text-gray-700">Published</span>
                </label>
              </div>
            </div>
          )}

          {/* Publish Date */}
          <div>
            <label htmlFor="publishDate" className="block text-sm font-medium text-gray-700 mb-1">
              Publish Date
            </label>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2 shrink-0" />
              <input
                type="date"
                id="publishDate"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Actions at start (left) */}
          {useDualActionButtons ? (
            <div className="pt-2 space-y-3">
              {isSubmitting ? (
                <div className="flex justify-start items-center gap-2 text-sm text-gray-600" role="status" aria-live="polite">
                  <svg
                    className="h-4 w-4 shrink-0 animate-spin text-primary"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Please wait…</span>
                </div>
              ) : null}
              <div className="flex flex-wrap justify-start items-center gap-3">
                <button
                  type={submitButtonType}
                  disabled={isSubmitting}
                  onClick={(e) => handleSubmit(e, "draft")}
                  className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-800 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save as draft
                </button>
                <button
                  type={submitButtonType}
                  disabled={isSubmitting}
                  onClick={(e) => handleSubmit(e, "published")}
                  className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Publish
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 flex flex-wrap justify-start items-center gap-3">
              <button
                type={submitButtonType}
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditMode
                      ? publishStatus === "published"
                        ? "Update & Publish"
                        : "Update Post"
                      : publishStatus === "published"
                        ? "Publish Post"
                        : "Save as Draft"}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

PublishSettings.propTypes = {
  publishStatus: PropTypes.oneOf(["draft", "published", "scheduled"]).isRequired,
  setPublishStatus: PropTypes.func.isRequired,
  publishDate: PropTypes.string.isRequired,
  setPublishDate: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  isEditMode: PropTypes.bool,
  submitButtonType: PropTypes.oneOf(["submit", "button"]),
  useDualActionButtons: PropTypes.bool,
};
