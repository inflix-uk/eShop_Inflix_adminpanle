import { useState, useEffect } from 'react';
import { getPackages, getAvailableSlots, createAdminBooking } from '../service/bookingService';
import { formatDurationLabel } from '../utils/durationDisplay';

function slotKey(date, startTime) {
  return `${date}|${startTime}`;
}

function formatSlotLabel(date, startTime) {
  if (!date || !startTime) return '';
  try {
    const label = new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
    return `${label} · ${startTime}`;
  } catch {
    return `${date} · ${startTime}`;
  }
}

export default function CreateBookingModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
  const [packages, setPackages] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState([]);

  const [formData, setFormData] = useState({
    packageId: '',
    date: '',
    customer: { name: '', email: '', phone: '' },
    notes: '',
    paymentStatus: 'paid',
    status: 'confirmed',
  });

  const [selectedPackage, setSelectedPackage] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadPackages();
      setStep(1);
      setFormData({
        packageId: '',
        date: '',
        customer: { name: '', email: '', phone: '' },
        notes: '',
        paymentStatus: 'paid',
        status: 'confirmed',
      });
      setSelectedPackage(null);
      setSlots([]);
      setSelectedSlots([]);
    }
  }, [isOpen]);

  const loadPackages = async () => {
    setLoading(true);
    const data = await getPackages();
    if (data?.packages) {
      setPackages(data.packages.filter((p) => p.isActive));
    }
    setLoading(false);
  };

  const loadSlots = async () => {
    if (!formData.packageId || !formData.date) return;
    setLoading(true);
    const data = await getAvailableSlots(formData.packageId, formData.date);
    if (data?.slots) {
      setSlots(data.slots.filter((slot) => slot.available !== false));
    } else {
      setSlots([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (formData.packageId && formData.date) {
      loadSlots();
    }
  }, [formData.packageId, formData.date]);

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setFormData({ ...formData, packageId: pkg._id, date: '' });
    setSelectedSlots([]);
    setSlots([]);
    setStep(2);
  };

  const isSlotSelected = (date, startTime) =>
    selectedSlots.some((slot) => slotKey(slot.date, slot.startTime) === slotKey(date, startTime));

  const handleSlotToggle = (slot) => {
    const date = formData.date;
    const key = slotKey(date, slot.startTime);
    setSelectedSlots((prev) => {
      if (prev.some((item) => slotKey(item.date, item.startTime) === key)) {
        return prev.filter((item) => slotKey(item.date, item.startTime) !== key);
      }
      return [...prev, { date, startTime: slot.startTime }].sort(
        (a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime)
      );
    });
  };

  const removeSlot = (date, startTime) => {
    setSelectedSlots((prev) =>
      prev.filter((slot) => slotKey(slot.date, slot.startTime) !== slotKey(date, startTime))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer.name || !formData.customer.email) return;
    if (selectedSlots.length === 0) return;

    setSaving(true);
    const result = await createAdminBooking({
      packageId: formData.packageId,
      slots: selectedSlots,
      customer: formData.customer,
      notes: formData.notes,
      paymentStatus: formData.paymentStatus,
      status: formData.status,
    });
    setSaving(false);

    if (result?.booking) {
      onSuccess();
    }
  };

  if (!isOpen) return null;

  const selectedOnCurrentDate = selectedSlots.filter((slot) => slot.date === formData.date).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create Booking</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="px-6 py-4 border-b">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= s ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {s}
                  </div>
                  <span className={`ml-2 text-sm ${step >= s ? 'text-gray-900' : 'text-gray-500'}`}>
                    {s === 1 && 'Select Package'}
                    {s === 2 && 'Choose Slots'}
                    {s === 3 && 'Customer Info'}
                  </span>
                  {s < 3 && <div className="w-8 h-px bg-gray-300 ml-4" />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {step === 1 && (
              <div>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : packages.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No active packages available.</div>
                ) : (
                  <div className="grid gap-3">
                    {packages.map((pkg) => (
                      <button
                        key={pkg._id}
                        onClick={() => handlePackageSelect(pkg)}
                        className="flex items-center justify-between p-4 border rounded-lg hover:border-primary hover:bg-primary/5 text-left"
                      >
                        <div>
                          <div className="font-medium text-gray-900">{pkg.name}</div>
                          <div className="text-sm text-gray-500 capitalize">
                            {pkg.type} •{' '}
                            {formatDurationLabel(pkg.durationMinutes, pkg.durationDisplayUnit)}
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">£{pkg.price.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-primary hover:underline"
                >
                  ← Back to packages
                </button>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-medium">{selectedPackage?.name}</div>
                  <div className="text-sm text-gray-500">
                    {formatDurationLabel(
                      selectedPackage?.durationMinutes,
                      selectedPackage?.durationDisplayUnit
                    )}{' '}
                    • £{selectedPackage?.price?.toFixed(2)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Pick a date, tap times to add them, then change date to add more days. Slots stay selected.
                  </p>
                </div>

                {formData.date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Available Slots
                      {selectedOnCurrentDate > 0 ? (
                        <span className="ml-2 font-normal text-gray-500">
                          ({selectedOnCurrentDate} selected on this date)
                        </span>
                      ) : null}
                    </label>
                    {loading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="text-sm text-gray-500 py-4">No slots available for this date.</div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {slots.map((slot) => {
                          const selected = isSlotSelected(formData.date, slot.startTime);
                          return (
                            <button
                              key={slot.startTime}
                              type="button"
                              onClick={() => handleSlotToggle(slot)}
                              className={`px-3 py-2 text-sm border rounded-md hover:border-primary hover:bg-primary/5 ${
                                selected ? 'border-primary bg-primary/10 font-medium' : 'border-gray-300'
                              }`}
                            >
                              {slot.startTime}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {selectedSlots.length > 0 && (
                  <div className="border border-gray-200 rounded-lg p-3">
                    <div className="text-sm font-medium text-gray-900 mb-2">
                      Selected slots ({selectedSlots.length})
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedSlots.map((slot) => (
                        <span
                          key={slotKey(slot.date, slot.startTime)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full bg-primary/10 text-gray-800"
                        >
                          {formatSlotLabel(slot.date, slot.startTime)}
                          <button
                            type="button"
                            onClick={() => removeSlot(slot.date, slot.startTime)}
                            className="ml-0.5 text-gray-500 hover:text-gray-800"
                            aria-label={`Remove ${formatSlotLabel(slot.date, slot.startTime)}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2 border-t">
                  <button
                    type="button"
                    disabled={selectedSlots.length === 0}
                    onClick={() => setStep(3)}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50"
                  >
                    Continue with {selectedSlots.length || 0} slot
                    {selectedSlots.length === 1 ? '' : 's'}
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="text-sm text-primary hover:underline"
                >
                  ← Back to slots
                </button>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="font-medium">{selectedPackage?.name}</div>
                  <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                    {selectedSlots.map((slot) => (
                      <div key={slotKey(slot.date, slot.startTime)}>
                        {formatSlotLabel(slot.date, slot.startTime)}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input
                    type="text"
                    value={formData.customer.name}
                    onChange={(e) =>
                      setFormData({ ...formData, customer: { ...formData.customer, name: e.target.value } })
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
                      setFormData({ ...formData, customer: { ...formData.customer, email: e.target.value } })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
                  <input
                    type="tel"
                    value={formData.customer.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, customer: { ...formData.customer, phone: e.target.value } })
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
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <select
                      value={formData.paymentStatus}
                      onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    >
                      <option value="paid">Paid</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || selectedSlots.length === 0}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50"
                  >
                    {saving
                      ? 'Creating...'
                      : selectedSlots.length > 1
                        ? `Create ${selectedSlots.length} Bookings`
                        : 'Create Booking'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
