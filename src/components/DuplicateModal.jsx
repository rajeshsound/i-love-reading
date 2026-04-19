import { AlertTriangle, X } from 'lucide-react';

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <p className="text-sm font-medium text-gray-800 leading-snug">{value}</p>
    </div>
  );
}

function BookCard({ title, book, highlight = false }) {
  return (
    <div className={`rounded-xl p-4 ${highlight ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'}`}>
      <p className={`text-xs font-semibold uppercase tracking-widest mb-2 ${highlight ? 'text-red-500' : 'text-gray-400'}`}>
        {title}
      </p>
      <div className="space-y-1.5">
        <Field label="Title" value={book.title} />
        <Field label="Author" value={book.author} />
        <Field label="Language" value={book.language} />
        <Field label="Publisher" value={book.publisher} />
        <Field label="Year" value={book.year} />
        <Field label="MRP" value={book.mrp} />
        {book.dateAdded && <Field label="Date Added" value={book.dateAdded} />}
      </div>
    </div>
  );
}

export default function DuplicateModal({ newBook, existingBook, onSkip, onAddAnyway }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-red-500 px-5 py-4 flex items-center gap-3">
          <AlertTriangle size={22} className="text-white shrink-0" />
          <div className="flex-1">
            <p className="text-white font-bold text-base">Duplicate Detected</p>
            <p className="text-red-100 text-xs">ISBN {newBook.isbn} already exists</p>
          </div>
          <button onClick={onSkip} className="text-white/70 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          <BookCard title="Already in your inventory" book={existingBook} />
          <BookCard title="Book you're adding now" book={newBook} highlight />
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex gap-3">
          <button
            onClick={onSkip}
            className="flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-colors"
          >
            Skip
          </button>
          <button
            onClick={onAddAnyway}
            className="flex-1 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors"
          >
            Add Anyway
          </button>
        </div>
      </div>
    </div>
  );
}
