import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CameraOff, Search, Loader2, CheckCircle, XCircle, Hash } from 'lucide-react';
import { lookupISBN } from '../services/googleBooksService.js';
import BooksTable from './BooksTable.jsx';
import DuplicateModal from './DuplicateModal.jsx';
import { appendAndDownload } from '../services/excelService.js';
import { saveBooks } from '../services/storageService.js';

const SCAN_INTERVAL_MS = 800;

function StatusBar({ message, type }) {
  if (!message) return null;
  const styles = {
    success: 'bg-green-50 text-green-700 border-green-200',
    error: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-blue-50 text-blue-700 border-blue-200',
    loading: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  const icons = {
    success: <CheckCircle size={15} className="shrink-0" />,
    error: <XCircle size={15} className="shrink-0" />,
    info: <Hash size={15} className="shrink-0" />,
    loading: <Loader2 size={15} className="animate-spin shrink-0" />,
  };
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm ${styles[type] || styles.info}`}>
      {icons[type]}
      <span>{message}</span>
    </div>
  );
}

export default function ScannerPage({ allBooks, onBooksUpdated, todayCount }) {
  const [isbnInput, setIsbnInput] = useState('');
  const [pendingBooks, setPendingBooks] = useState([]);
  const [status, setStatus] = useState({ message: '', type: 'info' });
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [duplicate, setDuplicate] = useState(null);
  const [pendingDuplicate, setPendingDuplicate] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);
  const barcodeDetectorRef = useRef(null);

  // Init BarcodeDetector if available
  useEffect(() => {
    if ('BarcodeDetector' in window) {
      barcodeDetectorRef.current = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] });
    }
  }, []);

  const stopCamera = useCallback(() => {
    clearInterval(scanIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsCameraOn(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  // Attach stream to video element once it's in the DOM
  useEffect(() => {
    if (isCameraOn && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(console.error);
    }
  }, [isCameraOn]);

  const startCamera = async () => {
    try {
      // Try rear camera first, fall back to any camera
      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }
      streamRef.current = stream;
      setIsCameraOn(true); // triggers useEffect above which sets srcObject

      if (barcodeDetectorRef.current) {
        scanIntervalRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) return;
          try {
            const barcodes = await barcodeDetectorRef.current.detect(videoRef.current);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              if (/^\d{10,13}$/.test(code)) {
                clearInterval(scanIntervalRef.current);
                setIsbnInput(code);
                await handleLookup(code);
              }
            }
          } catch {}
        }, SCAN_INTERVAL_MS);
      } else {
        setStatus({ message: 'Camera active — enter ISBN manually (barcode detection not supported on this browser)', type: 'info' });
      }
    } catch (err) {
      setStatus({ message: `Camera error: ${err.message}`, type: 'error' });
    }
  };

  const toggleCamera = () => {
    if (isCameraOn) stopCamera();
    else startCamera();
  };

  const handleLookup = async (rawIsbn) => {
    const isbn = String(rawIsbn || isbnInput).trim().replace(/[^0-9X]/gi, '');
    if (!isbn || isbn.length < 10) {
      setStatus({ message: 'Enter a valid ISBN (10 or 13 digits)', type: 'error' });
      return;
    }

    const alreadyPending = pendingBooks.some((b) => b.isbn === isbn);
    if (alreadyPending) {
      setStatus({ message: `ISBN ${isbn} is already in the pending list`, type: 'info' });
      return;
    }

    setIsLookingUp(true);
    setStatus({ message: `Looking up ISBN ${isbn}…`, type: 'loading' });

    try {
      let book = await lookupISBN(isbn);
      if (!book) {
        book = { isbn, title: '', author: '', language: '', mrp: '', publisher: '', year: '' };
        setStatus({ message: `ISBN ${isbn} not found in Google Books — added manually`, type: 'info' });
      } else {
        setStatus({ message: `Found: ${book.title || isbn}`, type: 'success' });
      }
      book.dateAdded = new Date().toLocaleDateString('en-IN');

      const existing = allBooks.find((b) => b.isbn === isbn);
      if (existing) {
        setPendingDuplicate(book);
        setDuplicate(existing);
      } else {
        setPendingBooks((prev) => [...prev, book]);
      }
      setIsbnInput('');
    } catch (err) {
      setStatus({ message: `Lookup failed: ${err.message}`, type: 'error' });
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLookup();
  };

  const handleDeletePending = (index) => {
    setPendingBooks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDuplicateSkip = () => {
    setDuplicate(null);
    setPendingDuplicate(null);
  };

  const handleDuplicateAddAnyway = () => {
    if (pendingDuplicate) {
      setPendingBooks((prev) => [...prev, pendingDuplicate]);
    }
    setDuplicate(null);
    setPendingDuplicate(null);
  };

  const handleSave = async () => {
    if (!pendingBooks.length) return;
    setIsSaving(true);
    setStatus({ message: 'Saving to Excel…', type: 'loading' });
    try {
      const updatedAll = appendAndDownload(allBooks, pendingBooks);
      await saveBooks(updatedAll);
      onBooksUpdated(updatedAll);
      setStatus({ message: `Saved ${pendingBooks.length} book(s) to BookInventory.xlsx`, type: 'success' });
      setPendingBooks([]);
    } catch (err) {
      setStatus({ message: `Save failed: ${err.message}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Today', value: todayCount + pendingBooks.length },
          { label: 'Pending', value: pendingBooks.length },
          { label: 'Total', value: allBooks.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl p-3 text-center shadow-sm border border-gray-100">
            <p className="text-2xl font-bold text-katha-600">{value}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Scanner card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        {/* Camera */}
        <div className="mb-4">
          <button
            onClick={toggleCamera}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
              isCameraOn
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-katha-500 text-white hover:bg-katha-600'
            }`}
          >
            {isCameraOn ? <CameraOff size={16} /> : <Camera size={16} />}
            {isCameraOn ? 'Stop Camera' : 'Scan Barcode'}
          </button>
        </div>

        {isCameraOn && (
          <div className="mb-4 relative bg-black rounded-xl overflow-hidden aspect-video">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
            {/* Scan overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-32 border-2 border-katha-400 rounded-lg opacity-70">
                <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-katha-400 rounded-tl-lg -mt-0.5 -ml-0.5" />
                <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-katha-400 rounded-tr-lg -mt-0.5 -mr-0.5" />
                <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-katha-400 rounded-bl-lg -mb-0.5 -ml-0.5" />
                <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-katha-400 rounded-br-lg -mb-0.5 -mr-0.5" />
              </div>
            </div>
          </div>
        )}

        {/* Manual input */}
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={isbnInput}
            onChange={(e) => setIsbnInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter ISBN (10 or 13 digits)"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-katha-400 focus:border-transparent"
          />
          <button
            onClick={() => handleLookup()}
            disabled={isLookingUp || !isbnInput.trim()}
            className="bg-katha-500 hover:bg-katha-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 text-sm font-semibold"
          >
            {isLookingUp ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            <span className="hidden sm:inline">Look Up</span>
          </button>
        </div>

        {/* Status */}
        {status.message && (
          <div className="mt-3">
            <StatusBar message={status.message} type={status.type} />
          </div>
        )}
      </div>

      {/* Pending table */}
      <BooksTable books={pendingBooks} onDelete={handleDeletePending} onSave={handleSave} isSaving={isSaving} />

      {/* Duplicate modal */}
      {duplicate && pendingDuplicate && (
        <DuplicateModal
          newBook={pendingDuplicate}
          existingBook={duplicate}
          onSkip={handleDuplicateSkip}
          onAddAnyway={handleDuplicateAddAnyway}
        />
      )}
    </div>
  );
}
