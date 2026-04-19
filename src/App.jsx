import { useState, useEffect, useCallback } from 'react';
import LoginPage from './components/LoginPage.jsx';
import ScannerPage from './components/ScannerPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import SavePromptModal from './components/SavePromptModal.jsx';
import { getAllBooks, saveBooks, getPendingBooks, savePendingBooks, clearPendingBooks } from './services/storageService.js';
import { appendAndDownload } from './services/excelService.js';
import { ScanLine, Settings, BookOpen } from 'lucide-react';

const TAB_SCANNER = 'scanner';
const TAB_SETTINGS = 'settings';

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
  const [savePrompt, setSavePrompt] = useState(null); // null | { step: 1|2, onConfirm }
  const [isSaving, setIsSaving] = useState(false);

  // Load books + restore pending session from cache
  useEffect(() => {
    if (!hasStarted) { setIsLoading(false); return; }
    Promise.all([getAllBooks(), getPendingBooks()])
      .then(([books, pending]) => {
        setAllBooks(books);
        setPendingBooks(pending);
      })
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [hasStarted]);

  // Auto-persist pending books to IndexedDB on every change
  useEffect(() => {
    if (!hasStarted) return;
    savePendingBooks(pendingBooks).catch(console.error);
  }, [pendingBooks, hasStarted]);

  // Native browser warning when closing tab with unsaved books
  useEffect(() => {
    const handler = (e) => {
      if (pendingBooks.length > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [pendingBooks.length]);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(console.error);
    }
  }, []);

  const handleSaveToExcel = useCallback(async () => {
    if (!pendingBooks.length) return;
    setIsSaving(true);
    try {
      const updatedAll = appendAndDownload(allBooks, pendingBooks);
      await saveBooks(updatedAll);
      await clearPendingBooks();
      setAllBooks(updatedAll);
      setPendingBooks([]);
      setSavePrompt(null);
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setIsSaving(false);
    }
  }, [allBooks, pendingBooks]);

  const requestTabChange = (tab) => {
    if (tab === activeTab) return;
    // Ask before leaving scanner if there are unsaved books
    if (pendingBooks.length > 0 && activeTab === TAB_SCANNER) {
      setSavePrompt({ step: 1, destination: tab });
      return;
    }
    setActiveTab(tab);
  };

  const handlePromptSave = async () => {
    await handleSaveToExcel();
    if (savePrompt?.destination) setActiveTab(savePrompt.destination);
  };

  const handlePromptNextStep = () => {
    setSavePrompt((p) => ({ ...p, step: 2 }));
  };

  const handlePromptDismiss = () => {
    const dest = savePrompt?.destination;
    setSavePrompt(null);
    if (dest) setActiveTab(dest);
  };

  const handleStart = () => {
    localStorage.setItem('katha-started', '1');
    setHasStarted(true);
    setIsLoading(false);
  };

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
      {/* Top nav */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <BookOpen size={20} className="text-katha-500" />
            <span className="font-bold text-gray-800 text-base">Katha Scanner</span>
          </div>
          <div className="flex items-center gap-2">
            {pendingBooks.length > 0 && (
              <button
                onClick={handleSaveToExcel}
                disabled={isSaving}
                className="flex items-center gap-1.5 bg-katha-500 hover:bg-katha-600 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                {isSaving ? '…' : `Save ${pendingBooks.length} books`}
              </button>
            )}
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              {allBooks.length} saved
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
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
            onSaveSession={handleSaveToExcel}
            isSaving={isSaving}
          />
        )}
      </main>

      {/* Bottom tab bar */}
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
                <span className="absolute top-2 right-1/4 bg-katha-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                  {pendingBooks.length > 9 ? '9+' : pendingBooks.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* 2-step save prompt */}
      {savePrompt && (
        <SavePromptModal
          bookCount={pendingBooks.length}
          step={savePrompt.step}
          onSave={handlePromptSave}
          onNextStep={handlePromptNextStep}
          onDismiss={handlePromptDismiss}
        />
      )}
    </div>
  );
}
