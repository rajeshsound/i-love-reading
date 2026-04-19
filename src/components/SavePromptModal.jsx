import { Save, ShieldCheck, ArrowLeft } from 'lucide-react';

export default function SavePromptModal({ bookCount, onSave, onDismiss, step, onNextStep }) {
  if (step === 1) {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-katha-500 px-5 py-4">
            <Save size={22} className="text-white mb-2" />
            <p className="text-white font-bold text-lg leading-tight">
              Save {bookCount} book{bookCount !== 1 ? 's' : ''} before leaving?
            </p>
            <p className="text-katha-100 text-sm mt-1">
              Download your Excel file to keep a permanent copy.
            </p>
          </div>
          <div className="p-5 space-y-3">
            <button
              onClick={onSave}
              className="w-full bg-katha-500 hover:bg-katha-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Save size={16} />
              Save to Excel now
            </button>
            <button
              onClick={onNextStep}
              className="w-full border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Not now →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2 — second confirmation
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-green-500 px-5 py-4">
          <ShieldCheck size={22} className="text-white mb-2" />
          <p className="text-white font-bold text-lg leading-tight">
            Your books are safe
          </p>
          <p className="text-green-100 text-sm mt-1">
            All {bookCount} book{bookCount !== 1 ? 's' : ''} are saved in the app and will be here when you return. No data will be lost.
          </p>
        </div>
        <div className="p-5 space-y-3">
          <button
            onClick={onSave}
            className="w-full bg-katha-500 hover:bg-katha-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Save size={16} />
            Save to Excel anyway
          </button>
          <button
            onClick={onDismiss}
            className="w-full border border-gray-200 text-gray-500 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft size={15} />
            Continue without saving
          </button>
        </div>
      </div>
    </div>
  );
}
