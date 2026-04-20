import { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, CameraOff, Search, Loader2, CheckCircle, XCircle, Hash } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { lookupISBN } from '../services/googleBooksService.js';
import BooksTable from './BooksTable.jsx';
import DuplicateModal from './DuplicateModal.jsx';

const SAME_ISBN_COOLDOWN_MS = 4000;

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

export default function ScannerPage({ allBooks, pendingBooks, onPendingChange, todayCount }) {
  const [isbnInput, setIsbnInput] = useState('');
  const [status, setStatus] = useState({ message: '', type: 'info' });
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [duplicate, setDuplicate] = useState(null);
  const [pendingDuplicate, setPendingDuplicate] = useState(null);

  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const isProcessingRef = useRef(false);
  const lastScannedRef = useRef({ isbn: '', time: 0 });

  // Refs so doLookup can read the latest books without being a dependency
  const allBooksRef = useRef(allBooks);
  const pendingBooksRef = useRef(pendingBooks);
  useEffect(() => { allBooksRef.current = allBooks; }, [allBooks]);
  useEffect(() => { pendingBooksRef.current = pendingBooks; }, [pendingBooks]);

  const stopCamera = useCallback(() => {
    if (controlsRef.current) {
      try { controlsRef.current.stop(); } catch {}
      controlsRef.current = null;
    }
    if (videoRef.current) {
      const stream = videoRef.current.srcObject;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    isProcessingRef.current = false;
    setIsCameraOn(false);
    setIsScanning(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const doLookup = useCallback(async (isbn) => {
    setIsLookingUp(true);
    setStatus({ message: `Looking up ISBN ${isbn}…`, type: 'loading' });

    let book = { isbn, title: '', author: '', language: '', mrp: '', publisher: '', year: '' };
    let lookupOk = false;
    let lookupError = null;

    try {
      const result = await lookupISBN(isbn);
      if (result) { book = result; lookupOk = true; }
    } catch (err) {
      lookupError = err.message || 'Unknown error';
      console.error('Google Books lookup failed:', err);
    }

    book.dateAdded = new Date().toLocaleDateString('en-IN');

    // Check both saved inventory AND current session for duplicates
    const existing =
      allBooksRef.current.find((b) => b.isbn === isbn) ||
      pendingBooksRef.current.find((b) => b.isbn === isbn);

    if (existing) {
      setPendingDuplicate(book);
      setDuplicate(existing);
      setStatus({ message: `Duplicate detected — ISBN ${isbn} already exists`, type: 'error' });
    } else {
      onPendingChange((prev) => [book, ...prev]); // newest first
      setStatus({
        message: lookupOk
          ? `✓ ${book.title || isbn} — ready for next scan`
          : lookupError
          ? `Fetch failed: ${lookupError} — ISBN ${isbn} added, fill details later`
          : `Not found in Google Books — ISBN ${isbn} added, fill details later`,
        type: lookupOk ? 'success' : lookupError ? 'error' : 'info',
      });
    }
    setIsbnInput('');

    setIsLookingUp(false);
    isProcessingRef.current = false;
  }, [onPendingChange]); // stable — reads books via refs, not deps

  const onBarcodeDetected = useCallback((isbn) => {
    if (isProcessingRef.current) return;
    const now = Date.now();
    if (isbn === lastScannedRef.current.isbn && now - lastScannedRef.current.time < SAME_ISBN_COOLDOWN_MS) return;
    isProcessingRef.current = true;
    lastScannedRef.current = { isbn, time: now };
    setIsbnInput(isbn);
    doLookup(isbn);
  }, [doLookup]);

  const startScanning = useCallback(() => {
    if (!videoRef.current || !readerRef.current) return;
    setIsScanning(true);
    readerRef.current.decodeFromVideoElement(videoRef.current, (result, err, controls) => {
      controlsRef.current = controls;
      if (result) {
        const text = result.getText();
        if (/^\d{8,13}$/.test(text)) onBarcodeDetected(text);
      } else if (err && !(err instanceof NotFoundException)) {
        console.warn('Scan error:', err);
      }
    }).catch(console.error);
  }, [onBarcodeDetected]);

  const startCamera = async () => {
    try {
      readerRef.current = new BrowserMultiFormatReader();
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const rearDevice = devices.find((d) => /back|rear|environment/i.test(d.label)) || devices[devices.length - 1];
      const deviceId = rearDevice?.deviceId;

      const stream = await navigator.mediaDevices.getUserMedia({
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.error);
      }
      setIsCameraOn(true);
    } catch (err) {
      setStatus({ message: `Camera error: ${err.message}`, type: 'error' });
    }
  };

  useEffect(() => {
    if (!isCameraOn || !videoRef.current) return;
    const video = videoRef.current;
    const onReady = () => startScanning();
    video.addEventListener('loadeddata', onReady, { once: true });
    if (video.readyState >= 3) startScanning();
    return () => video.removeEventListener('loadeddata', onReady);
  }, [isCameraOn, startScanning]);

  const toggleCamera = () => { if (isCameraOn) stopCamera(); else startCamera(); };

  const handleManualLookup = () => {
    const isbn = isbnInput.trim().replace(/[^0-9X]/gi, '');
    if (!isbn || isbn.length < 10) {
      setStatus({ message: 'Enter a valid ISBN (10 or 13 digits)', type: 'error' });
      return;
    }
    // Don't block here — doLookup checks both lists and shows modal if duplicate
    isProcessingRef.current = true;
    doLookup(isbn);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleManualLookup(); };
  const handleDeletePending = (index) => onPendingChange((prev) => prev.filter((_, i) => i !== index));
  const handleDuplicateSkip = () => { setDuplicate(null); setPendingDuplicate(null); };
  const handleDuplicateAddAnyway = () => {
    if (pendingDuplicate) onPendingChange((prev) => [pendingDuplicate, ...prev]); // newest first
    setDuplicate(null);
    setPendingDuplicate(null);
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
        <div className="mb-4">
          <button
            onClick={toggleCamera}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-colors ${
              isCameraOn ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' : 'bg-katha-500 text-white hover:bg-katha-600'
            }`}
          >
            {isCameraOn ? <CameraOff size={16} /> : <Camera size={16} />}
            {isCameraOn ? 'Stop Camera' : 'Scan Barcode'}
          </button>
        </div>

        <div className={`mb-4 relative bg-black rounded-xl overflow-hidden aspect-video ${isCameraOn ? 'block' : 'hidden'}`}>
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="relative w-64 h-28">
              <div className="absolute inset-0 border-2 border-katha-400/60 rounded-lg" />
              {isScanning && !isLookingUp && (
                <div className="absolute left-1 right-1 h-0.5 bg-katha-400 rounded animate-scan-line" />
              )}
              {isLookingUp && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-black/60 rounded-lg px-3 py-1.5 flex items-center gap-2">
                    <Loader2 size={14} className="text-katha-400 animate-spin" />
                    <span className="text-white text-xs font-medium">Adding book…</span>
                  </div>
                </div>
              )}
              <div className="absolute top-0 left-0 w-5 h-5 border-t-4 border-l-4 border-katha-400 rounded-tl" />
              <div className="absolute top-0 right-0 w-5 h-5 border-t-4 border-r-4 border-katha-400 rounded-tr" />
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-4 border-l-4 border-katha-400 rounded-bl" />
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-4 border-r-4 border-katha-400 rounded-br" />
            </div>
            <p className="mt-3 text-white/80 text-xs bg-black/40 px-3 py-1 rounded-full">
              {isLookingUp ? 'Adding book…' : 'Point at barcode — auto scans'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={isbnInput}
            onChange={(e) => setIsbnInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Or enter ISBN manually"
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-katha-400 focus:border-transparent"
          />
          <button
            onClick={handleManualLookup}
            disabled={isLookingUp || !isbnInput.trim()}
            className="bg-katha-500 hover:bg-katha-600 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 text-sm font-semibold"
          >
            {isLookingUp ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            <span className="hidden sm:inline">Look Up</span>
          </button>
        </div>

        {status.message && (
          <div className="mt-3">
            <StatusBar message={status.message} type={status.type} />
          </div>
        )}
      </div>

      <BooksTable books={pendingBooks} onDelete={handleDeletePending} />

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
