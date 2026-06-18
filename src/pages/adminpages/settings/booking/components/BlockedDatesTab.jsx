import { useState, useEffect } from 'react';
import { getBlockedDates, createBlockedDate, deleteBlockedDate } from '../service/bookingService';

const PACKAGE_TYPES = [
  { value: 'service', label: 'Service' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'studio', label: 'Studio' },
];

export default function BlockedDatesTab({ setProgress }) {
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('service');
  const [blockedDates, setBlockedDates] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    reason: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadBlockedDates();
  }, [selectedType]);

  const loadBlockedDates = async () => {
    setLoading(true);
    setProgress(30);
    const data = await getBlockedDates(selectedType);
    if (data?.blockedDates) {
      setBlockedDates(data.blockedDates);
    }
    setLoading(false);
    setProgress(100);
  };

  const handleAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({ date: today, reason: '' });
    setFormOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.date) return;
    setSaving(true);
    await createBlockedDate({ ...formData, type: selectedType });
    setSaving(false);
    setFormOpen(false);
    loadBlockedDates();
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to remove this blocked date?')) return;
    await deleteBlockedDate(id);
    loadBlockedDates();
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const sortedDates = [...blockedDates].sort((a, b) => new Date(a.date) - new Date(b.date));

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
          Block Date
        </button>
      </div>

      {/* Blocked Dates List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : sortedDates.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No blocked dates</h3>
            <p className="mt-1 text-sm text-gray-500">
              Block specific dates for {selectedType} bookings.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {sortedDates.map((item) => (
              <div key={item._id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-900">{formatDate(item.date)}</div>
                  {item.reason && <div className="text-sm text-gray-500">{item.reason}</div>}
                </div>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Remove
                </button>
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
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Block Date</h2>

              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="e.g., Holiday, Maintenance"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-primary focus:border-primary"
                  />
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
                    {saving ? 'Saving...' : 'Block Date'}
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
