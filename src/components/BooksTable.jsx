import { Trash2, BookOpen } from 'lucide-react';

function BookRow({ book, onDelete, index, isLatest }) {
  return (
    <tr className={`border-b border-gray-100 transition-colors ${isLatest ? 'bg-katha-50' : 'hover:bg-gray-50'}`}>
      <td className="px-3 py-2">
        {isLatest && (
          <span className="inline-block bg-katha-500 text-white text-xs font-bold px-1.5 py-0.5 rounded mb-1">
            NEW
          </span>
        )}
        <p className="text-xs text-gray-500 font-mono leading-tight">{book.isbn}</p>
      </td>
      <td className="px-3 py-2">
        <p className={`text-sm font-medium leading-tight line-clamp-1 ${isLatest ? 'text-katha-800' : 'text-gray-800'}`}>
          {book.title || '—'}
        </p>
        <p className="text-xs text-gray-500 line-clamp-1">{book.author || ''}</p>
        {book.subtitle ? <p className="text-xs text-gray-400 italic line-clamp-1">{book.subtitle}</p> : null}
      </td>
      <td className="px-3 py-2 hidden sm:table-cell">
        <p className="text-xs text-gray-600">{book.language || '—'}</p>
        {book.pages ? <p className="text-xs text-gray-400">{book.pages} pp</p> : null}
      </td>
      <td className="px-3 py-2 hidden md:table-cell">
        <p className="text-xs text-gray-600">{book.mrp || '—'}</p>
        {book.genre ? <p className="text-xs text-gray-400 line-clamp-1">{book.genre}</p> : null}
      </td>
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
              <th className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Lang / Pages</th>
              <th className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">MRP / Genre</th>
              <th className="px-3 py-2 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {books.map((book, i) => (
              <BookRow
                key={`${book.isbn}-${i}`}
                book={book}
                onDelete={onDelete}
                index={i}
                isLatest={i === 0}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
