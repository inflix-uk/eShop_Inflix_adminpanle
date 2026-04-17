import PropTypes from "prop-types";
import { X, ArrowRightLeft, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function TransferModal({
  isOpen,
  onClose,
  visitor,
  onConfirm,
  isLoading,
  checkResult,
}) {
  if (!isOpen || !visitor) return null;

  const isUserRegistered = checkResult?.isRegistered;
  const registeredUser = checkResult?.user;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-blue-600">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <ArrowRightLeft className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                Transfer to Messages
              </h2>
              <p className="text-sm text-white/80">Move conversation to order messages</p>
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
        <div className="p-6">
          {/* Visitor Info */}
          <div className="mb-6 p-4 bg-slate-50 rounded-xl">
            <h3 className="text-sm font-medium text-slate-500 mb-2">Visitor Details</h3>
            <div className="space-y-1">
              <p className="text-slate-800 font-medium">{visitor.name}</p>
              <p className="text-sm text-slate-600">{visitor.email}</p>
              {visitor.phoneNumber && (
                <p className="text-sm text-slate-600">{visitor.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <span className="ml-3 text-slate-600">Checking user registration...</span>
            </div>
          )}

          {/* Check Result */}
          {!isLoading && checkResult && (
            <>
              {isUserRegistered ? (
                <div className="mb-6">
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-800">User is Registered</p>
                      <p className="text-sm text-blue-700 mt-1">
                        This visitor's email matches a registered user: <strong>{registeredUser?.firstname} {registeredUser?.lastname}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-800">
                      <strong>What will happen:</strong>
                    </p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1 list-disc list-inside">
                      <li>All messages will be transferred to the Order Messages section</li>
                      <li>Messages will appear as a "General Chat" for this user</li>
                      <li>This visitor conversation will be deleted after transfer</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">User Not Registered</p>
                      <p className="text-sm text-red-700 mt-1">
                        No registered user found with the email <strong>{visitor.email}</strong>.
                        Transfer is only allowed for registered users.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

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
              type="button"
              onClick={onConfirm}
              disabled={isLoading || !isUserRegistered}
              className="flex-1 px-4 py-3 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <ArrowRightLeft className="w-4 h-4" />
                  Transfer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

TransferModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  visitor: PropTypes.shape({
    _id: PropTypes.string,
    name: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
  }),
  onConfirm: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
  checkResult: PropTypes.shape({
    isRegistered: PropTypes.bool,
    user: PropTypes.shape({
      _id: PropTypes.string,
      firstname: PropTypes.string,
      lastname: PropTypes.string,
      email: PropTypes.string,
    }),
  }),
};

TransferModal.defaultProps = {
  visitor: null,
  isLoading: false,
  checkResult: null,
};
