import { useState, useRef } from 'react';
import { Download, Upload, Trash2, Info, FolderOpen, FileSpreadsheet } from 'lucide-react';
import { downloadNewFile, parseWorkbook } from '../services/excelService.js';
import { saveBooks, clearBooks } from '../services/storageService.js';

export default function SettingsPage({ allBooks, onBooksUpdated }) {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const fileInputRef = useRef(null);

  const showMsg = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
  };

  const handleExport = () => {
    try {
      downloadNewFile(allBooks);
      showMsg(`Exported ${allBooks.length} books to BookInventory.xlsx`);
    } catch (err) {
      showMsg(`Export failed: ${err.message}`, 'error');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const buffer = await file.arrayBuffer();
      const books = parseWorkbook(buffer);
      await saveBooks(books);
      onBooksUpdated(books);
      showMsg(`Imported ${books.length} books from ${file.name}`);
    } catch (err) {
      showMsg(`Import failed: ${err.message}`, 'error');
    }
    e.target.value = '';
  };

  const handleClear = async () => {
    if (!window.confirm(`Clear all ${allBooks.length} books from local cache? (Your downloaded Excel files are not affected.)`)) return;
    try {
      await clearBooks();
      onBooksUpdated([]);
      showMsg('Local cache cleared. Re-import your Excel file to restore.');
    } catch (err) {
      showMsg(`Clear failed: ${err.message}`, 'error');
    }
  };

  const sections = [
    {
      title: 'File Management',
      items: [
        {
          icon: Download,
          label: 'Export to Excel',
          desc: `Download BookInventory.xlsx (${allBooks.length} books)`,
          action: handleExport,
          color: 'text-katha-600',
        },
        {
          icon: Upload,
          label: 'Import from Excel',
          desc: 'Load books from a previously saved file',
          action: () => fileInputRef.current?.click(),
          color: 'text-blue-600',
        },
      ],
    },
    {
      title: 'Storage',
      items: [
        {
          icon: FolderOpen,
          label: 'File Location',
          desc: 'iPhone Files app → On My iPhone → Katha Book Scanner',
          action: null,
          color: 'text-gray-500',
        },
        {
          icon: Trash2,
          label: 'Clear Local Cache',
          desc: 'Remove all books from browser storage',
          action: handleClear,
          color: 'text-red-500',
          danger: true,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: Info,
          label: 'Katha Book Scanner v1.0',
          desc: 'Frontend-only PWA · No cloud · No accounts',
          action: null,
          color: 'text-gray-400',
        },
        {
          icon: FileSpreadsheet,
          label: 'Data Format',
          desc: 'ISBN · Title · Author · Language · MRP · Publisher · Year · Qty · Condition · Date · Notes',
          action: null,
          color: 'text-gray-400',
        },
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          messageType === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />

      {sections.map((section) => (
        <div key={section.title} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">{section.title}</p>
          </div>
          {section.items.map(({ icon: Icon, label, desc, action, color, danger }) => (
            <button
              key={label}
              onClick={action || undefined}
              disabled={!action}
              className={`w-full flex items-start gap-4 px-4 py-4 border-b border-gray-50 last:border-0 text-left transition-colors ${
                action ? (danger ? 'hover:bg-red-50' : 'hover:bg-gray-50') : 'cursor-default'
              }`}
            >
              <Icon size={20} className={`${color} mt-0.5 shrink-0`} />
              <div>
                <p className={`text-sm font-semibold ${danger ? 'text-red-600' : 'text-gray-800'}`}>{label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
