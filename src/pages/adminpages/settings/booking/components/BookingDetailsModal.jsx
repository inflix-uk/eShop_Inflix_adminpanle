import { useState } from 'react';
import { updateBookingStatus, cancelBooking, rescheduleBooking } from '../service/bookingService';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  no_show: 'bg-gray-100 text-gray-800',
};

export default function BookingDetailsModal({ booking, onClose, onRefresh }) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({ newDate: '', newStartTime: '', reason: '' });
  const [processing, setProcessing] = useState(false);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const handleStatusUpdate = async (status) => {
    setProcessing(true);
    if (status === 'cancelled') {
      const reason = prompt('Cancellation reason (optional):');
      const processRefund = booking.paymentStatus === 'paid' && confirm('Process refund?');
      await cancelBooking(booking._id, reason || '', processRefund);
    } else {
      await updateBookingStatus(booking._id, status);
    }
    setProcessing(false);
    onRefresh();
    onClose();
  };

  const handleReschedule = async () => {
    if (!rescheduleData.newDate || !rescheduleData.newStartTime) return;
    setProcessing(true);
    await rescheduleBooking(
      booking._id,
      rescheduleData.newDate,
      rescheduleData.newStartTime,
      rescheduleData.reason
    );
    setProcessing(false);
    onRefresh();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50" onClick={onClose} />
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Booking #{booking.bookingNumber}</h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize mt-1 ${STATUS_COLORS[booking.status]}`}>
                {booking.status.replace('_', ' ')}
              </span>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Package Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Service</h3>
              <div className="text-lg font-medium text-gray-900">
                {booking.packageId?.name || 'N/A'}
              </div>
              <div className="text-sm text-gray-500 capitalize">
                {booking.type} • {booking.packageId?.durationMinutes || '?'} min •{' '}
                £{booking.packageId?.price?.toFixed(2) || '0.00'}
              </div>
            </div>

            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Date</h3>
                <div className="text-gray-900">{formatDate(booking.date)}</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Time</h3>
                <div className="text-gray-900">
                  {booking.startTime} - {booking.endTime}
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Customer</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-gray-900 font-medium">{booking.customer?.name}</div>
                <div className="text-sm text-gray-500">{booking.customer?.email}</div>
                {booking.customer?.phone && (
                  <div className="text-sm text-gray-500">{booking.customer?.phone}</div>
                )}
              </div>
            </div>

            {/* Payment Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Status</h3>
                <div className="capitalize">{booking.paymentStatus}</div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Source</h3>
                <div className="capitalize">{booking.source}</div>
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                <div className="text-gray-700 bg-gray-50 rounded p-3">{booking.notes}</div>
              </div>
            )}

            {/* Cancel Reason */}
            {booking.cancelReason && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Cancel Reason</h3>
                <div className="text-red-700 bg-red-50 rounded p-3">{booking.cancelReason}</div>
              </div>
            )}

            {/* Reschedule Form */}
            {rescheduleOpen && (
              <div className="border rounded-lg p-4 space-y-4">
                <h3 className="font-medium text-gray-900">Reschedule Booking</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                    <input
                      type="date"
                      value={rescheduleData.newDate}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, newDate: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Start Time</label>
                    <input
                      type="time"
                      value={rescheduleData.newStartTime}
                      onChange={(e) => setRescheduleData({ ...rescheduleData, newStartTime: e.target.value })}
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
                  <input
                    type="text"
                    value={rescheduleData.reason}
                    onChange={(e) => setRescheduleData({ ...rescheduleData, reason: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    placeholder="Reschedule reason"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setRescheduleOpen(false)}
                    className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReschedule}
                    disabled={processing || !rescheduleData.newDate || !rescheduleData.newStartTime}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-secondary disabled:opacity-50"
                  >
                    {processing ? 'Processing...' : 'Confirm Reschedule'}
                  </button>
                </div>
              </div>
            )}

            {/* Actions */}
            {!rescheduleOpen && !['cancelled', 'completed'].includes(booking.status) && (
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {booking.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate('confirmed')}
                    disabled={processing}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    Confirm
                  </button>
                )}
                {booking.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate('completed')}
                      disabled={processing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      Mark Completed
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('no_show')}
                      disabled={processing}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                    >
                      No Show
                    </button>
                  </>
                )}
                <button
                  onClick={() => setRescheduleOpen(true)}
                  disabled={processing}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Reschedule
                </button>
                <button
                  onClick={() => handleStatusUpdate('cancelled')}
                  disabled={processing}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
