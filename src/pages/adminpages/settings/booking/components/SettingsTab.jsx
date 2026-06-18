import { useState, useEffect } from 'react';
import { getBookingSettings, updateBookingSettings } from '../service/bookingService';

const TIMEZONES = [
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'America/New_York', label: 'America/New_York (EST/EDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (PST/PDT)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Asia/Karachi', label: 'Asia/Karachi (PKT)' },
];

export default function SettingsTab({ setProgress }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    isEnabled: false,
    slotIntervalMinutes: 30,
    holdDurationMinutes: 15,
    timezone: 'Europe/London',
    minAdvanceBookingHours: 1,
    maxAdvanceBookingDays: 30,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setProgress(30);
    const data = await getBookingSettings();
    if (data?.settings) {
      setSettings(data.settings);
    }
    setLoading(false);
    setProgress(100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProgress(50);
    await updateBookingSettings(settings);
    setSaving(false);
    setProgress(100);
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Enable/Disable Toggle */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Enable Booking</h3>
            <p className="text-sm text-gray-500">
              Allow customers to book appointments on your store
            </p>
          </div>
          <button
            type="button"
            onClick={() => handleChange('isEnabled', !settings.isEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.isEnabled ? 'bg-primary' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.isEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Slot Configuration */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Slot Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slot Interval (minutes)
            </label>
            <select
              value={settings.slotIntervalMinutes}
              onChange={(e) => handleChange('slotIntervalMinutes', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Time between each available slot start time
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hold Duration (minutes)
            </label>
            <select
              value={settings.holdDurationMinutes}
              onChange={(e) => handleChange('holdDurationMinutes', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
            >
              <option value={5}>5 minutes</option>
              <option value={10}>10 minutes</option>
              <option value={15}>15 minutes</option>
              <option value={20}>20 minutes</option>
              <option value={30}>30 minutes</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              How long a slot is held during checkout
            </p>
          </div>
        </div>
      </div>

      {/* Timezone & Advance Booking */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Booking Rules</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => handleChange('timezone', e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min. Advance Booking (hours)
            </label>
            <input
              type="number"
              min={0}
              value={settings.minAdvanceBookingHours}
              onChange={(e) => handleChange('minAdvanceBookingHours', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum hours before a slot can be booked
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max. Advance Booking (days)
            </label>
            <input
              type="number"
              min={1}
              value={settings.maxAdvanceBookingDays}
              onChange={(e) => handleChange('maxAdvanceBookingDays', Number(e.target.value))}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
            />
            <p className="mt-1 text-xs text-gray-500">
              Maximum days in advance a booking can be made
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  );
}
