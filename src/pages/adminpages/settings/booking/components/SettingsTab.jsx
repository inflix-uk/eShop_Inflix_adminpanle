import { useState, useEffect } from 'react';
import { getBookingSettings, updateBookingSettings } from '../service/bookingService';
import {
  UnitToggle,
  displayValueToHours,
  displayValueToMinutes,
  hoursToDisplayValue,
  minutesToDisplayValue,
  normalizeDurationUnit,
} from '../utils/durationDisplay';

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
    slotIntervalDisplayUnit: 'minutes',
    slotIntervalInput: 30,
    holdDurationMinutes: 15,
    holdDurationDisplayUnit: 'minutes',
    holdDurationInput: 15,
    timezone: 'Europe/London',
    minAdvanceBookingHours: 1,
    minAdvanceDisplayUnit: 'hours',
    minAdvanceInput: 1,
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
      const s = data.settings;
      const slotUnit = normalizeDurationUnit(s.slotIntervalDisplayUnit || 'minutes');
      const holdUnit = normalizeDurationUnit(s.holdDurationDisplayUnit || 'minutes');
      const advanceUnit = normalizeDurationUnit(s.minAdvanceDisplayUnit || 'hours');
      const slotMinutes = Number(s.slotIntervalMinutes) || 30;
      const holdMinutes = Number(s.holdDurationMinutes) || 15;
      const advanceHours = Number(s.minAdvanceBookingHours) ?? 1;

      setSettings({
        isEnabled: Boolean(s.isEnabled),
        slotIntervalMinutes: slotMinutes,
        slotIntervalDisplayUnit: slotUnit,
        slotIntervalInput: minutesToDisplayValue(slotMinutes, slotUnit),
        holdDurationMinutes: holdMinutes,
        holdDurationDisplayUnit: holdUnit,
        holdDurationInput: minutesToDisplayValue(holdMinutes, holdUnit),
        timezone: s.timezone || 'Europe/London',
        minAdvanceBookingHours: advanceHours,
        minAdvanceDisplayUnit: advanceUnit,
        minAdvanceInput: hoursToDisplayValue(advanceHours, advanceUnit),
        maxAdvanceBookingDays: Number(s.maxAdvanceBookingDays) || 30,
      });
    }
    setLoading(false);
    setProgress(100);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProgress(50);

    const slotMinutes = displayValueToMinutes(
      settings.slotIntervalInput,
      settings.slotIntervalDisplayUnit
    );
    const holdMinutes = displayValueToMinutes(
      settings.holdDurationInput,
      settings.holdDurationDisplayUnit
    );
    const advanceHours = displayValueToHours(
      settings.minAdvanceInput,
      settings.minAdvanceDisplayUnit
    );

    await updateBookingSettings({
      isEnabled: settings.isEnabled,
      slotIntervalMinutes: Math.max(1, slotMinutes || 30),
      slotIntervalDisplayUnit: settings.slotIntervalDisplayUnit,
      holdDurationMinutes: Math.max(1, holdMinutes || 15),
      holdDurationDisplayUnit: settings.holdDurationDisplayUnit,
      timezone: settings.timezone,
      minAdvanceBookingHours: Math.max(0, advanceHours),
      minAdvanceDisplayUnit: settings.minAdvanceDisplayUnit,
      maxAdvanceBookingDays: Math.max(1, Number(settings.maxAdvanceBookingDays) || 30),
    });

    setSaving(false);
    setProgress(100);
  };

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleMinutesFieldUnitChange = (fieldPrefix, nextUnit) => {
    setSettings((prev) => {
      const unit = normalizeDurationUnit(nextUnit);
      const minutesKey = `${fieldPrefix}Minutes`;
      const unitKey = `${fieldPrefix}DisplayUnit`;
      const inputKey = `${fieldPrefix}Input`;
      const minutes =
        prev[inputKey] === '' || prev[inputKey] == null
          ? prev[minutesKey]
          : displayValueToMinutes(prev[inputKey], prev[unitKey]);
      return {
        ...prev,
        [unitKey]: unit,
        [minutesKey]: minutes > 0 ? minutes : prev[minutesKey],
        [inputKey]: minutesToDisplayValue(minutes > 0 ? minutes : prev[minutesKey], unit),
      };
    });
  };

  const handleAdvanceUnitChange = (nextUnit) => {
    setSettings((prev) => {
      const unit = normalizeDurationUnit(nextUnit);
      const hours =
        prev.minAdvanceInput === '' || prev.minAdvanceInput == null
          ? prev.minAdvanceBookingHours
          : displayValueToHours(prev.minAdvanceInput, prev.minAdvanceDisplayUnit);
      return {
        ...prev,
        minAdvanceDisplayUnit: unit,
        minAdvanceBookingHours: hours,
        minAdvanceInput: hoursToDisplayValue(hours, unit),
      };
    });
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
              Slot Interval
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={settings.slotIntervalDisplayUnit === 'hours' ? 0.25 : 1}
                step={settings.slotIntervalDisplayUnit === 'hours' ? 0.25 : 1}
                value={settings.slotIntervalInput}
                onChange={(e) =>
                  handleChange(
                    'slotIntervalInput',
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                required
              />
              <UnitToggle
                value={settings.slotIntervalDisplayUnit}
                onChange={(unit) => handleMinutesFieldUnitChange('slotInterval', unit)}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Time between each available slot start time (saved & shown as{' '}
              {settings.slotIntervalDisplayUnit})
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hold Duration
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={settings.holdDurationDisplayUnit === 'hours' ? 0.25 : 1}
                step={settings.holdDurationDisplayUnit === 'hours' ? 0.25 : 1}
                value={settings.holdDurationInput}
                onChange={(e) =>
                  handleChange(
                    'holdDurationInput',
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                required
              />
              <UnitToggle
                value={settings.holdDurationDisplayUnit}
                onChange={(unit) => handleMinutesFieldUnitChange('holdDuration', unit)}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              How long a slot is held during checkout (saved & shown as{' '}
              {settings.holdDurationDisplayUnit})
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
              Min. Advance Booking
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                min={0}
                step={settings.minAdvanceDisplayUnit === 'hours' ? 0.25 : 1}
                value={settings.minAdvanceInput}
                onChange={(e) =>
                  handleChange(
                    'minAdvanceInput',
                    e.target.value === '' ? '' : Number(e.target.value)
                  )
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
              />
              <UnitToggle
                value={settings.minAdvanceDisplayUnit}
                onChange={handleAdvanceUnitChange}
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Minimum notice before a slot can be booked (shown as{' '}
              {settings.minAdvanceDisplayUnit})
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
