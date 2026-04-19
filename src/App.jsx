import { useState, useEffect, useCallback, useRef } from 'react';
import LoginPage from './components/LoginPage.jsx';
import ScannerPage from './components/ScannerPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import SavePromptModal from './components/SavePromptModal.jsx';
import FileSaveModal from './components/FileSaveModal.jsx';
import ResetConfirmModal from './components/ResetConfirmModal.jsx';
import {
  getAllBooks, saveBooks, clearBooks,
  getPendingBooks, savePendingBooks, clearPendingBooks,
} from './services/storageService.js';
import {
  generateSuggestedName, saveWithFilePicker, saveToExistingHandle, saveAsDownload,
} from './services/excelService.js';
import { ScanLine, Settings, BookOpen } from 'lucide-react';

const TAB_SCANNER = 'scanner';
const TAB_SETTINGS = 'settings';
const SAVED_FILE_KEY = 'katha-saved-filename';
const USER_NAME_KEY = 'katha-username';

function getTodayCount(books) {
  const today = new Date().toLocaleDateString('en-IN');
  return books.filter((b) => b.dateAdded === today).length;
}

export default function App() {
  const [hasStarted, setHasStarted] = useState(() => localStorage.getItem('katha-started') === '1');
  const [allBooks, setAllBooks] = useState([]);
  const [pendingBooks, setPendingBooks] = useState([]);
  const [activeTab, setActiveTab] = useState(TAB_SCANNER);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Saved filename persisted across sessions
  const [savedFileName, setSavedFileName] = useState(
    () => localStorage.getItem(SAVED_FILE_KEY) || null
  );

  // File System Access API handle (session only — can't be persisted)
  const fileHandleRef = useRef(null);

  // Modal states
  const [saveTabPrompt, setSaveTabPrompt] = useState(null); // { step, destination }
  const [fileSaveModal, setFileSaveModal] = useState(false);
  const [resetModal, setResetModal] = useState(false);

  // Load books + restore pending session
  useEffect(() => {
    if (!hasStarted) { setIsLoading(false); return; }
    Promise.all([getAllBooks(), getPendingBooks()])
      .then(([books, pending]) => { setAllBooks(books); setPendingBooks(pending); })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [hasStarted]);

  // Auto-persist pending to IndexedDB on every change
  useEffect(() => {
    if (!hasStarted) return;
    savePendingBooks(pendingBooks).catch(console.error);
  }, [pendingBooks, hasStarted]);

  // Native browser tab-close warning
  useEffect(() => {
    const handler = (e) => {
      if (pendingBooks.length > 0) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [pendingBooks.length]);

  // Service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(console.error);
    }
  }, []);

  // --- Save to Excel ---
  const performSave = useCallback(async (filename) => {
    setIsSaving(true);
    const allToSave = [...allBooks, ...pendingBooks];
    try {
      let saved = false;

      // Try to reuse existing file handle (Chrome desktop — same session)
      if (fileHandleRef.current && filename === savedFileName) {
        try {
          await saveToExistingHandle(allToSave, fileHandleRef.current);
          saved = true;
        } catch {
          fileHandleRef.current = null; // handle lost, fall through
        }
      }

      // Try File System Access API picker
      if (!saved && 'showSaveFilePicker' in window) {
        const handle = await saveWithFilePicker(allToSave, filename);
        if (handle) { fileHandleRef.current = handle; saved = true; }
        // null = user cancelled picker
        if (!handle) { setIsSaving(false); return; }
      }

      // Fallback: browser download (iOS Safari, Firefox, etc.)
      if (!saved) saveAsDownload(allToSave, filename);

      // Persist updated book list + clear pending
      await saveBooks(allToSave);
      await clearPendingBooks();
      setAllBooks(allToSave);
      setPendingBooks([]);

      // Remember filename
      localStorage.setItem(SAVED_FILE_KEY, filename);
      setSavedFileName(filename);
      setFileSaveModal(false);
      setSaveTabPrompt(null);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  }, [allBooks, pendingBooks, savedFileName]);

  // Entry point — open file save modal
  const requestSave = useCallback(() => {
    if (!pendingBooks.length) return;
    setFileSaveModal(true);
  }, [pendingBooks.length]);

  // --- Reset ---
  const performReset = useCallback(async () => {
    await Promise.all([clearBooks(), clearPendingBooks()]);
    fileHandleRef.current = null;
    localStorage.removeItem(SAVED_FILE_KEY);
    setSavedFileName(null);
    setAllBooks([]);
    setPendingBooks([]);
    setResetModal(false);
  }, []);

  // --- Tab switch with unsaved books ---
  const requestTabChange = (tab) => {
    if (tab === activeTab) return;
    if (pendingBooks.length > 0 && activeTab === TAB_SCANNER) {
      setSaveTabPrompt({ step: 1, destination: tab });
      return;
    }
    setActiveTab(tab);
  };

  const handleTabPromptSave = () => { setSaveTabPrompt(null); setFileSaveModal(true); };
  const handleTabPromptNextStep = () => setSaveTabPrompt((p) => ({ ...p, step: 2 }));
  const handleTabPromptDismiss = () => {
    const dest = saveTabPrompt?.destination;
    setSaveTabPrompt(null);
    if (dest) setActiveTab(dest);
  };

  const handleStart = () => {
    localStorage.setItem('katha-started', '1');
    setHasStarted(true);
    setIsLoading(false);
  };

  const userName = localStorage.getItem(USER_NAME_KEY) || '';
  const suggestedName = generateSuggestedName(userName);

  if (!hasStarted) return <LoginPage onStart={handleStart} />;
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-katha-500 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading inventory…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <BookOpen size={20} className="text-katha-500" />
            <span className="font-bold text-gray-800 text-base">Katha Scanner</span>
          </div>
          <div className="flex items-center gap-2">
            {pendingBooks.length > 0 && (
              <button
                onClick={requestSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 bg-katha-500 hover:bg-katha-600 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                {isSaving ? '…' : `Save ${pendingBooks.length} book${pendingBooks.length !== 1 ? 's' : ''}`}
              </button>
            )}
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {allBooks.length} saved
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 pb-24">
        {activeTab === TAB_SCANNER && (
          <ScannerPage
            allBooks={allBooks}
            pendingBooks={pendingBooks}
            onPendingChange={setPendingBooks}
            todayCount={getTodayCount(allBooks)}
          />
        )}
        {activeTab === TAB_SETTINGS && (
          <SettingsPage
            allBooks={allBooks}
            pendingBooks={pendingBooks}
            onBooksUpdated={setAllBooks}
            onRequestSave={requestSave}
            onRequestReset={() => setResetModal(true)}
            isSaving={isSaving}
            savedFileName={savedFileName}
          />
        )}
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-40">
        <div className="max-w-2xl mx-auto flex">
          {[
            { id: TAB_SCANNER, icon: ScanLine, label: 'Scanner' },
            { id: TAB_SETTINGS, icon: Settings, label: 'Settings' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => requestTabChange(id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors relative ${
                activeTab === id ? 'text-katha-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
              {id === TAB_SCANNER && pendingBooks.length > 0 && (
                <span className="absolute top-2 right-1/4 bg-katha-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {pendingBooks.length > 9 ? '9+' : pendingBooks.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* Tab-switch save prompt (2-step) */}
      {saveTabPrompt && (
        <SavePromptModal
          bookCount={pendingBooks.length}
          step={saveTabPrompt.step}
          onSave={handleTabPromptSave}
          onNextStep={handleTabPromptNextStep}
          onDismiss={handleTabPromptDismiss}
        />
      )}

      {/* Filename confirmation modal */}
      {fileSaveModal && (
        <FileSaveModal
          bookCount={pendingBooks.length}
          suggestedName={suggestedName}
          savedFileName={savedFileName}
          onConfirm={performSave}
          onCancel={() => setFileSaveModal(false)}
        />
      )}

      {/* 2-step reset confirmation */}
      {resetModal && (
        <ResetConfirmModal
          bookCount={allBooks.length}
          pendingCount={pendingBooks.length}
          onConfirm={performReset}
          onCancel={() => setResetModal(false)}
        />
      )}
    </div>
  );
}
