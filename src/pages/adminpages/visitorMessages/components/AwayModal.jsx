import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Coffee, MessageSquare } from "lucide-react";

export default function AwayModal({
  isOpen,
  onClose,
  settings,
  onSave,
  isSaving,
}) {
  const [formData, setFormData] = useState({
    isAway: false,
    message:
      "Hi! We're currently away from our desk. We'll respond to your message as soon as we're back. Thank you for your patience!",
  });

  // Update form when settings change
  useEffect(() => {
    if (settings) {
      setFormData({
        isAway: settings.isAway || false,
        message:
          settings.message ||
          "Hi! We're currently away from our desk. We'll respond to your message as soon as we're back. Thank you for your patience!",
      });
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, isAway: !prev.isAway }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-amber-500">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Coffee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Away Mode</h2>
              <p className="text-sm text-white/80">Set your availability status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Enable/Disable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-100 rounded-xl">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  formData.isAway ? "bg-amber-100" : "bg-white"
                }`}
              >
                <Coffee
                  className={`w-5 h-5 ${
                    formData.isAway ? "text-amber-600" : "text-slate-400"
                  }`}
                />
              </div>
              <div>
                <p className="font-medium text-slate-800">Away Status</p>
                <p
                  className={`text-sm ${
                    formData.isAway ? "text-amber-600" : "text-blue-600"
                  }`}
                >
                  {formData.isAway ? "You are Away" : "You are Available"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleToggle}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                formData.isAway ? "bg-amber-500" : "bg-blue-500"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                  formData.isAway ? "translate-x-6" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Away Message */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-slate-700">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <span className="font-medium">Away Message</span>
            </div>
            <p className="text-sm text-slate-500">
              This message will be sent to visitors when you're away.
            </p>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              className="w-full min-h-[120px] px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
              placeholder="Enter your away message..."
              required
            />
          </div>

          {/* Info Box */}
          {formData.isAway && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                <strong>Note:</strong> When Away mode is ON, visitors will receive
                this message automatically when they send a new message.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

AwayModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    isAway: PropTypes.bool,
    message: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool,
};

AwayModal.defaultProps = {
  settings: null,
  isSaving: false,
};
