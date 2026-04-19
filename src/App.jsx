import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage.jsx';
import ScannerPage from './components/ScannerPage.jsx';
import SettingsPage from './components/SettingsPage.jsx';
import { getAllBooks, saveBooks } from './services/storageService.js';
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
  const [activeTab, setActiveTab] = useState(TAB_SCANNER);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!hasStarted) {
      setIsLoading(false);
      return;
    }
    getAllBooks()
      .then(setAllBooks)
      .catch(console.error)
      .finally(() => setIsLoading(false));
  }, [hasStarted]);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(console.error);
    }
  }, []);

  const handleStart = () => {
    localStorage.setItem('katha-started', '1');
    setHasStarted(true);
    setIsLoading(false);
  };

  const handleBooksUpdated = (updated) => {
    setAllBooks(updated);
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 safe-top">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            <BookOpen size={20} className="text-katha-500" />
            <span className="font-bold text-gray-800 text-base">Katha Scanner</span>
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
            {allBooks.length} books
          </span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4 pb-24">
        {activeTab === TAB_SCANNER && (
          <ScannerPage
            allBooks={allBooks}
            onBooksUpdated={handleBooksUpdated}
            todayCount={getTodayCount(allBooks)}
          />
        )}
        {activeTab === TAB_SETTINGS && (
          <SettingsPage allBooks={allBooks} onBooksUpdated={handleBooksUpdated} />
        )}
      </main>

      {/* Bottom tab bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 safe-bottom z-40">
        <div className="max-w-2xl mx-auto flex">
          {[
            { id: TAB_SCANNER, icon: ScanLine, label: 'Scanner' },
            { id: TAB_SETTINGS, icon: Settings, label: 'Settings' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-0.5 transition-colors ${
                activeTab === id ? 'text-katha-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon size={22} />
              <span className="text-xs font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
