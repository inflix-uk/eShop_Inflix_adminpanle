import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { X, Clock, MessageSquare, Calendar } from "lucide-react";

// Day configuration
const DAYS_OF_WEEK = [
  { value: 1, label: "Mon", fullLabel: "Monday" },
  { value: 2, label: "Tue", fullLabel: "Tuesday" },
  { value: 3, label: "Wed", fullLabel: "Wednesday" },
  { value: 4, label: "Thu", fullLabel: "Thursday" },
  { value: 5, label: "Fri", fullLabel: "Friday" },
  { value: 6, label: "Sat", fullLabel: "Saturday" },
  { value: 0, label: "Sun", fullLabel: "Sunday" },
];

export default function AutoReplyModal({
  isOpen,
  onClose,
  settings,
  onSave,
  isSaving,
}) {
  const [formData, setFormData] = useState({
    isEnabled: false,
    businessDays: [1, 2, 3, 4, 5], // Monday to Friday
    startTime: "09:00",
    endTime: "18:00",
    message:
      "Thank you for your message. Our team is currently away but we will get back to you as soon as possible during our business hours (9 AM - 6 PM UK time, Monday to Friday).",
  });

  // Update form when settings change
  useEffect(() => {
    if (settings) {
      setFormData({
        isEnabled: settings.isEnabled || false,
        businessDays: settings.businessDays || [1, 2, 3, 4, 5],
        startTime: settings.startTime || "09:00",
        endTime: settings.endTime || "18:00",
        message:
          settings.message ||
          "Thank you for your message. Our team is currently away but we will get back to you as soon as possible during our business hours (9 AM - 6 PM UK time, Monday to Friday).",
      });
    }
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleToggle = () => {
    setFormData((prev) => ({ ...prev, isEnabled: !prev.isEnabled }));
  };

  const handleDayToggle = (dayValue) => {
    setFormData((prev) => {
      const currentDays = prev.businessDays || [];
      const isSelected = currentDays.includes(dayValue);

      if (isSelected) {
        // Remove day
        return {
          ...prev,
          businessDays: currentDays.filter((d) => d !== dayValue),
        };
      } else {
        // Add day
        return {
          ...prev,
          businessDays: [...currentDays, dayValue].sort((a, b) => a - b),
        };
      }
    });
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
      <div className="relative w-full max-w-4xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-blue-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Auto-Reply Settings
              </h2>
              <p className="text-sm text-white/80">UK London Time</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Body - Two Column Layout */}
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row">
          {/* Left Half - Settings */}
          <div className="flex-1 p-6 space-y-6 border-b md:border-b-0 md:border-r border-slate-200">
            {/* Enable/Disable Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.isEnabled ? "bg-blue-100" : "bg-white"}`}>
                  <Clock className={`w-5 h-5 ${formData.isEnabled ? "text-blue-600" : "text-slate-400"}`} />
                </div>
                <div>
                  <p className="font-medium text-slate-800">Auto-Reply</p>
                  <p className={`text-sm ${formData.isEnabled ? "text-blue-600" : "text-red-500"}`}>
                    {formData.isEnabled ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleToggle}
                className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                  formData.isEnabled ? "bg-blue-600" : "bg-red-500"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${
                    formData.isEnabled ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Business Days Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-700">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Business Days</span>
              </div>
              <p className="text-sm text-slate-500">
                Select the days your business is <strong>open</strong>. Auto-reply will be sent on unselected days.
              </p>

              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = formData.businessDays?.includes(day.value);
                  return (
                    <button
                      key={day.value}
                      type="button"
                      onClick={() => handleDayToggle(day.value)}
                      title={day.fullLabel}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-sm"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {day.label}
                    </button>
                  );
                })}
              </div>

              {formData.businessDays?.length === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                  No days selected - Auto-reply will be active every day!
                </p>
              )}
            </div>

            {/* Time Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-slate-700">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Business Hours</span>
              </div>
              <p className="text-sm text-slate-500">
                Set your business hours. Auto-reply will be sent <strong>outside</strong> these hours on business days (UK London timezone).
              </p>

              <div className="grid grid-cols-2 gap-4">
                {/* Start Time */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Opens At
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        startTime: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                {/* End Time */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Closes At
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Time Info */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Example:</strong> Mon-Fri, 09:00-18:00 = Auto-reply active on weekends, and before 9 AM / after 6 PM on weekdays.
                </p>
              </div>
            </div>
          </div>

          {/* Right Half - Message */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-center gap-2 text-slate-700 mb-4">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              <span className="font-medium">Auto-Reply Message</span>
            </div>

            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, message: e.target.value }))
              }
              className="flex-1 w-full min-h-[200px] px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Enter your auto-reply message..."
              required
            />

            <p className="text-xs text-slate-500 mt-3">
              This message will be sent automatically to visitors during the specified time window.
            </p>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
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
          </div>
        </form>
      </div>
    </div>
  );
}

AutoReplyModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  settings: PropTypes.shape({
    isEnabled: PropTypes.bool,
    businessDays: PropTypes.arrayOf(PropTypes.number),
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    message: PropTypes.string,
  }),
  onSave: PropTypes.func.isRequired,
  isSaving: PropTypes.bool,
};

AutoReplyModal.defaultProps = {
  settings: null,
  isSaving: false,
};
