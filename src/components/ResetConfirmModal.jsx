import { useState } from 'react';
import { Trash2, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function ResetConfirmModal({ bookCount, pendingCount, onConfirm, onCancel }) {
  const [step, setStep] = useState(1);
  const total = bookCount + pendingCount;

  if (step === 1) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-amber-500 px-5 py-4">
            <AlertTriangle size={22} className="text-white mb-2" />
            <p className="text-white font-bold text-lg">Reset inventory?</p>
            <p className="text-amber-100 text-sm mt-1">
              This will delete all {total} book{total !== 1 ? 's' : ''} from the app
              {pendingCount > 0 ? `, including ${pendingCount} unsaved` : ''}.
            </p>
          </div>
          <div className="p-5 space-y-3">
            {pendingCount > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
                ⚠️ You have <strong>{pendingCount} unsaved book{pendingCount !== 1 ? 's' : ''}</strong> — save to Excel first if you need them.
              </div>
            )}
            <button
              onClick={() => setStep(2)}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 size={16} />
              Yes, reset everything
            </button>
            <button
              onClick={onCancel}
              className="w-full border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Keep my books
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-red-500 px-5 py-4">
          <ShieldAlert size={22} className="text-white mb-2" />
          <p className="text-white font-bold text-lg">Final confirmation</p>
          <p className="text-red-100 text-sm mt-1">
            All {total} book{total !== 1 ? 's' : ''} will be permanently deleted from this device. This cannot be undone.
          </p>
        </div>
        <div className="p-5 space-y-3">
          <button
            onClick={onConfirm}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Trash2 size={16} />
            Delete everything — I'm sure
          </button>
          <button
            onClick={onCancel}
            className="w-full border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            ← Go back, keep my books
          </button>
        </div>
      </div>
    </div>
  );
}
