import { useState, useEffect } from 'react';
import { getAvailability, createAvailability, updateAvailability, deleteAvailability } from '../service/bookingService';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

const PACKAGE_TYPES = [
  { value: 'service', label: 'Service' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'studio', label: 'Studio' },
];

const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    const time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    TIME_OPTIONS.push(time);
  }
}

export default function AvailabilityTab({ setProgress }) {
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('service');
  const [availability, setAvailability] = useState([]);
  const [editItem, setEditItem] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    startTime: '09:00',
    endTime: '17:00',
    isActive: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAvailability();
  }, [selectedType]);

  const loadAvailability = async () => {
    setLoading(true);
    setProgress(30);
    const data = await getAvailability(selectedType);
    if (data?.availability) {
      setAvailability(data.availability);
    }
    setLoading(false);
    setProgress(100);
  };

  const handleAdd = () => {
    setEditItem(null);
    setFormData({
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '17:00',
      isActive: true,
    });
    setFormOpen(true);
  };

  const handleEdit = (item) => {
    setEditItem(item);
    setFormData({
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime,
      endTime: item.endTime,
      isActive: item.isActive,
    });
    setFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (editItem) {
      await updateAvailability(editItem._id, { ...formData, type: selectedType });
    } else {
      await createAvailability({ ...formData, type: selectedType });
    }

    setSaving(false);
    setFormOpen(false);
    loadAvailability();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this availability slot?')) return;
    await deleteAvailability(id);
    loadAvailability();
  };

  const handleToggle = async (item) => {
    await updateAvailability(item._id, { isActive: !item.isActive, type: selectedType });
    loadAvailability();
  };

  const getDayLabel = (day) => DAYS_OF_WEEK.find((d) => d.value === day)?.label || 'Unknown';

  const sortedAvailability = [...availability].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  return (
    <div className="space-y-6">
      {/* Type Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {PACKAGE_TYPES.map((type) => (
            <button
              key={type.value}
              onClick={() => setSelectedType(type.value)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                selectedType === type.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {type.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={handleAdd}
          className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Time Window
        </button>
      </div>

      {/* Availability List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : sortedAvailability.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No availability set</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add time windows for {selectedType} bookings.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedAvailability.map((item) => (
              <div
                key={item._id}
                className={`flex items-center justify-between px-6 py-4 ${!item.isActive ? 'bg-gray-50' : ''}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${item.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{getDayLabel(item.dayOfWeek)}</div>
                    <div className="text-sm text-gray-500">
                      {item.startTime} - {item.endTime}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggle(item)}
                    className={`text-sm ${item.isActive ? 'text-yellow-600' : 'text-green-600'}`}
                  >
                    {item.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => handleEdit(item)} className="text-primary hover:text-secondary text-sm">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:text-red-800 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setFormOpen(false)} />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {editItem ? 'Edit Time Window' : 'Add Time Window'}
              </h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                  >
                    {DAYS_OF_WEEK.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <select
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <select
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                    >
                      {TIME_OPTIONS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="formIsActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 text-primary rounded border-gray-300"
                  />
                  <label htmlFor="formIsActive" className="text-sm text-gray-700">
                    Active
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setFormOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
