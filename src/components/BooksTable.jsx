import { Trash2, BookOpen } from 'lucide-react';

function BookRow({ book, onDelete, index }) {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="px-3 py-2 text-xs text-gray-500 font-mono">{book.isbn}</td>
      <td className="px-3 py-2">
        <p className="text-sm font-medium text-gray-800 leading-tight line-clamp-2">{book.title || '—'}</p>
        <p className="text-xs text-gray-500 line-clamp-1">{book.author || ''}</p>
      </td>
      <td className="px-3 py-2 text-xs text-gray-600 hidden sm:table-cell">{book.language || '—'}</td>
      <td className="px-3 py-2 text-xs text-gray-600 hidden md:table-cell">{book.mrp || '—'}</td>
      <td className="px-3 py-2">
        <button
          onClick={() => onDelete(index)}
          className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
          aria-label="Remove book"
        >
          <Trash2 size={15} />
        </button>
      </td>
    </tr>
  );
}

export default function BooksTable({ books, onDelete }) {
  if (!books.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <BookOpen size={16} className="text-katha-500" />
          <span className="text-sm font-semibold text-gray-700">
            Scanned this session ({books.length})
          </span>
        </div>
        <span className="text-xs text-gray-400">Save from top bar ↑</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">ISBN</th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Book</th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Lang</th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">MRP</th>
              <th className="px-3 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, i) => (
              <BookRow key={`${book.isbn}-${i}`} book={book} onDelete={onDelete} index={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
