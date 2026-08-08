import { useState, useEffect } from 'react';
import { getPackages, getAvailableSlots, updateBooking } from '../service/bookingService';
import { formatDurationLabel } from '../utils/durationDisplay';

function resolvePackageId(booking) {
  if (!booking?.packageId) return '';
  if (typeof booking.packageId === 'object') return booking.packageId._id || '';
  return booking.packageId;
}

export default function EditBookingModal({ booking, isOpen, onClose, onSuccess }) {
  const [packages, setPackages] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    packageId: '',
    date: '',
    startTime: '',
    customer: { name: '', email: '', phone: '' },
    notes: '',
    paymentStatus: 'unpaid',
    status: 'pending',
  });

  useEffect(() => {
    if (!isOpen || !booking) return;

    setFormData({
      packageId: resolvePackageId(booking),
      date: booking.date || '',
      startTime: booking.startTime || '',
      customer: {
        name: booking.customer?.name || '',
        email: booking.customer?.email || '',
        phone: booking.customer?.phone || '',
      },
      notes: booking.notes || '',
      paymentStatus: ['paid', 'unpaid'].includes(booking.paymentStatus)
        ? booking.paymentStatus
        : 'unpaid',
      status: ['pending', 'confirmed'].includes(booking.status) ? booking.status : 'pending',
    });
    loadPackages();
  }, [isOpen, booking]);

  useEffect(() => {
    if (!isOpen || !formData.packageId || !formData.date) return;
    loadSlots();
  }, [isOpen, formData.packageId, formData.date]);

  const loadPackages = async () => {
    setLoading(true);
    const data = await getPackages();
    if (data?.packages) {
      const currentId = resolvePackageId(booking);
      const active = data.packages.filter((p) => p.isActive !== false);
      const current = data.packages.find((p) => String(p._id) === String(currentId));
      if (current && !active.some((p) => String(p._id) === String(currentId))) {
        setPackages([current, ...active]);
      } else {
        setPackages(active);
      }
    }
    setLoading(false);
  };

  const loadSlots = async () => {
    setLoading(true);
    const data = await getAvailableSlots(formData.packageId, formData.date, booking?._id);
    let nextSlots = (data?.slots || []).filter((slot) => slot.available !== false);

    // Keep the booking's current start time selectable even if filters exclude it.
    if (
      formData.startTime &&
      !nextSlots.some((slot) => slot.startTime === formData.startTime)
    ) {
      nextSlots = [
        {
          startTime: formData.startTime,
          endTime: booking?.endTime || formData.startTime,
          available: true,
        },
        ...nextSlots,
      ];
    }

    setSlots(nextSlots);
    setLoading(false);
  };

  const selectedPackage =
    packages.find((pkg) => pkg._id === formData.packageId) ||
    (typeof booking?.packageId === 'object' ? booking.packageId : null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer.name || !formData.customer.email) return;
    if (!formData.packageId || !formData.date || !formData.startTime) return;

    setSaving(true);
    const result = await updateBooking(booking._id, {
      packageId: formData.packageId,
      date: formData.date,
      startTime: formData.startTime,
      customer: formData.customer,
      notes: formData.notes,
      paymentStatus: formData.paymentStatus,
      status: formData.status,
    });
    setSaving(false);

    if (result?.booking) {
      onSuccess?.(result.booking);
      onClose();
    }
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Edit Booking</h2>
              <p className="text-sm text-gray-500 font-mono">#{booking.bookingNumber}</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500" type="button">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Package *</label>
              <select
                value={formData.packageId}
                onChange={(e) =>
                  setFormData({ ...formData, packageId: e.target.value, startTime: '' })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
                required
              >
                <option value="">Select package</option>
                {packages.map((pkg) => (
                  <option key={pkg._id} value={pkg._id}>
                    {pkg.name} ({formatDurationLabel(pkg.durationMinutes, pkg.durationDisplayUnit)})
                  </option>
                ))}
              </select>
              {selectedPackage && (
                <p className="mt-1 text-xs text-gray-500 capitalize">
                  {selectedPackage.type} · £{(Number(selectedPackage.price) || 0).toFixed(2)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value, startTime: '' })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Time *</label>
                {loading ? (
                  <div className="flex items-center h-10 text-sm text-gray-500">Loading slots…</div>
                ) : slots.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2">No slots available for this date.</div>
                ) : (
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                    {slots.map((slot) => (
                      <button
                        key={slot.startTime}
                        type="button"
                        onClick={() => setFormData({ ...formData, startTime: slot.startTime })}
                        className={`px-2 py-2 text-sm border rounded-md hover:border-primary hover:bg-primary/5 ${
                          formData.startTime === slot.startTime
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-300'
                        }`}
                      >
                        {slot.startTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input
                  type="text"
                  value={formData.customer.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customer: { ...formData.customer, name: e.target.value },
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email *</label>
                <input
                  type="email"
                  value={formData.customer.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      customer: { ...formData.customer, email: e.target.value },
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
              <input
                type="tel"
                value={formData.customer.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customer: { ...formData.customer, phone: e.target.value },
                  })
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !formData.startTime}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
