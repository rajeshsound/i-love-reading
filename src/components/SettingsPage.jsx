import { useState, useRef } from 'react';
import { Download, Upload, Trash2, Info, FolderOpen, FileSpreadsheet, User, RotateCcw } from 'lucide-react';
import { parseWorkbook } from '../services/excelService.js';
import { saveBooks } from '../services/storageService.js';

const USER_NAME_KEY = 'katha-username';

export default function SettingsPage({
  allBooks, pendingBooks, onBooksUpdated,
  onRequestSave, onRequestReset, isSaving, savedFileName,
}) {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [userName, setUserName] = useState(() => localStorage.getItem(USER_NAME_KEY) || '');
  const [editingName, setEditingName] = useState(false);
  const fileInputRef = useRef(null);

  const showMsg = (text, type = 'success') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => setMessage(''), 4000);
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

  const saveName = () => {
    localStorage.setItem(USER_NAME_KEY, userName.trim());
    setEditingName(false);
    showMsg('Name saved — used in filename suggestions');
  };

  return (
    <div className="flex flex-col gap-4">
      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-medium ${
          messageType === 'error'
            ? 'bg-red-50 text-red-700 border border-red-200'
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {message}
        </div>
      )}

      <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleImport} />

      {/* Your name (for filename) */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Your Name</p>
        </div>
        <div className="px-4 py-4">
          <p className="text-xs text-gray-500 mb-2">Used in the suggested filename when saving to Excel.</p>
          {editingName ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                placeholder="e.g. Rajesh"
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-katha-400"
                autoFocus
              />
              <button onClick={saveName} className="bg-katha-500 text-white px-3 py-2 rounded-lg text-sm font-semibold">
                Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="flex items-center gap-3 w-full text-left hover:bg-gray-50 rounded-xl p-2 -mx-2 transition-colors"
            >
              <User size={18} className="text-katha-500 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-800">
                  {userName || 'Not set'}
                </p>
                <p className="text-xs text-gray-400">
                  {userName
                    ? `Filename: ${userName.toLowerCase()}_ilovereading_bookscan_…`
                    : 'Tap to add your name'}
                </p>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* File management */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">File Management</p>
        </div>

        {/* Current file */}
        {savedFileName && (
          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
            <FileSpreadsheet size={18} className="text-green-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500">Last saved to</p>
              <p className="text-sm font-medium text-gray-800 truncate">{savedFileName}.xlsx</p>
            </div>
          </div>
        )}

        <button
          onClick={onRequestSave}
          disabled={isSaving || pendingBooks.length === 0}
          className="w-full flex items-start gap-4 px-4 py-4 border-b border-gray-50 text-left hover:bg-gray-50 disabled:opacity-40 transition-colors"
        >
          <Download size={20} className="text-katha-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Save to Excel</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {pendingBooks.length > 0
                ? `Save ${pendingBooks.length} pending book${pendingBooks.length !== 1 ? 's' : ''} to file`
                : 'No pending books to save'}
            </p>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-start gap-4 px-4 py-4 border-b border-gray-50 text-left hover:bg-gray-50 transition-colors"
        >
          <Upload size={20} className="text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Import from Excel</p>
            <p className="text-xs text-gray-500 mt-0.5">Load a previously saved BookInventory file</p>
          </div>
        </button>

        <div className="w-full flex items-start gap-4 px-4 py-4 border-b border-gray-50">
          <FolderOpen size={20} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800">File Location</p>
            <p className="text-xs text-gray-500 mt-0.5">iPhone Files app → Downloads or On My iPhone</p>
          </div>
        </div>

        {/* Reset */}
        <button
          onClick={onRequestReset}
          className="w-full flex items-start gap-4 px-4 py-4 text-left hover:bg-red-50 transition-colors"
        >
          <RotateCcw size={20} className="text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-600">Reset Book Count</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Delete all {allBooks.length + pendingBooks.length} books and start fresh
            </p>
          </div>
        </button>
      </div>

      {/* About */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-50">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">About</p>
        </div>
        <div className="px-4 py-4 flex items-start gap-3">
          <Info size={18} className="text-gray-400 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-gray-800">Katha Book Scanner v1.0</p>
            <p className="text-xs text-gray-500 mt-0.5">Frontend-only PWA · No cloud · No accounts</p>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Columns saved: ISBN · ISBN-10 · Title · Subtitle · Author · Publisher · Year · Language · Pages · Genre · Dimensions · MRP · Qty · Condition · Date · Notes · Description
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
