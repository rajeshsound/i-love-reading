import { useState } from 'react';
import { Save, FileSpreadsheet, Pencil } from 'lucide-react';

export default function FileSaveModal({ suggestedName, savedFileName, bookCount, onConfirm, onCancel }) {
  const [mode, setMode] = useState(savedFileName ? 'confirm-same' : 'choose-name');
  const [name, setName] = useState(savedFileName || suggestedName);

  const handleSave = () => {
    const clean = name.trim().replace(/\.xlsx$/i, '') || suggestedName;
    onConfirm(clean);
  };

  if (mode === 'confirm-same') {
    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-katha-500 px-5 py-4">
            <FileSpreadsheet size={22} className="text-white mb-2" />
            <p className="text-white font-bold text-lg">Save {bookCount} book{bookCount !== 1 ? 's' : ''}?</p>
            <p className="text-katha-100 text-sm mt-1 break-all">
              {savedFileName}.xlsx
            </p>
          </div>
          <div className="p-5 space-y-3">
            <button
              onClick={handleSave}
              className="w-full bg-katha-500 hover:bg-katha-600 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <Save size={16} />
              Yes, save to this file
            </button>
            <button
              onClick={() => { setName(savedFileName); setMode('choose-name'); }}
              className="w-full border border-gray-200 text-gray-600 font-semibold py-3 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
            >
              <Pencil size={15} />
              Save with a different name
            </button>
            <button onClick={onCancel} className="w-full text-gray-400 text-sm py-2 hover:text-gray-600">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // choose-name mode
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-katha-500 px-5 py-4">
          <FileSpreadsheet size={22} className="text-white mb-2" />
          <p className="text-white font-bold text-lg">Name your file</p>
          <p className="text-katha-100 text-sm mt-1">
            You can rename this anytime — same file saves here next time.
          </p>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
              Filename
            </label>
            <div className="flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-katha-400">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="flex-1 px-4 py-3 text-sm focus:outline-none"
                autoFocus
                spellCheck={false}
              />
              <span className="pr-3 text-gray-400 text-sm">.xlsx</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Tip: include your name — e.g. <span className="font-medium">rajesh_ilovereading_bookscan_April2026</span>
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full bg-katha-500 hover:bg-katha-600 disabled:opacity-50 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <Save size={16} />
            Save {bookCount} book{bookCount !== 1 ? 's' : ''} to Excel
          </button>
          <button onClick={onCancel} className="w-full text-gray-400 text-sm py-2 hover:text-gray-600">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
