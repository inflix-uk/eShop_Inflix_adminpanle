import { useState, useEffect } from 'react';
import { getPackages, getAvailableSlots, createAdminBooking } from '../service/bookingService';

export default function CreateBookingModal({ isOpen, onClose, onSuccess }) {
  const [step, setStep] = useState(1);
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
        startTime: '',
        customer: { name: '', email: '', phone: '' },
        notes: '',
        paymentStatus: 'paid',
        status: 'confirmed',
      });
      setSelectedPackage(null);
      setSlots([]);
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
      setSlots(data.slots);
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
    setFormData({ ...formData, packageId: pkg._id });
    setStep(2);
  };

  const handleSlotSelect = (slot) => {
    setFormData({ ...formData, startTime: slot.startTime });
    setStep(3);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer.name || !formData.customer.email) return;

    setSaving(true);
    const result = await createAdminBooking(formData);
    setSaving(false);

    if (result?.booking) {
      onSuccess();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Create Booking</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Steps Indicator */}
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
                    {s === 2 && 'Choose Slot'}
                    {s === 3 && 'Customer Info'}
                  </span>
                  {s < 3 && <div className="w-8 h-px bg-gray-300 ml-4" />}
                </div>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Step 1: Select Package */}
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
                            {pkg.type} • {pkg.durationMinutes} min
                          </div>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">£{pkg.price.toFixed(2)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Choose Slot */}
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
                    {selectedPackage?.durationMinutes} min • £{selectedPackage?.price?.toFixed(2)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value, startTime: '' })}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                {formData.date && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Available Slots</label>
                    {loading ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : slots.length === 0 ? (
                      <div className="text-sm text-gray-500 py-4">No slots available for this date.</div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2">
                        {slots.map((slot) => (
                          <button
                            key={slot.startTime}
                            onClick={() => handleSlotSelect(slot)}
                            className={`px-3 py-2 text-sm border rounded-md hover:border-primary hover:bg-primary/5 ${
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
                )}
              </div>
            )}

            {/* Step 3: Customer Info */}
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
                  <div className="text-sm text-gray-500">
                    {formData.date} at {formData.startTime}
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
                    disabled={saving}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50"
                  >
                    {saving ? 'Creating...' : 'Create Booking'}
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
