import { useState, useEffect, useRef, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Upload, ChevronLeft, ChevronRight, Download, BookOpen, X, Loader } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).href;

const RENDER_SCALE = 1.5;

function getTotalSpreads(totalPages) {
  if (totalPages <= 0) return 0;
  if (totalPages === 1) return 1;
  return 1 + Math.ceil((totalPages - 1) / 2);
}

function getSpreadPages(spreadIndex, totalPages) {
  if (spreadIndex === 0) return { left: null, right: 0 };
  const left = 2 * spreadIndex - 1;
  const right = 2 * spreadIndex;
  return {
    left: left < totalPages ? left : null,
    right: right < totalPages ? right : null,
  };
}

export default function FlipbookPage() {
  const [pages, setPages] = useState([]);
  const [currentSpread, setCurrentSpread] = useState(0);
  const [totalSpreads, setTotalSpreads] = useState(0);
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [pdfFile, setPdfFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isFlipping, setIsFlipping] = useState(false);
  const [flipDir, setFlipDir] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const renderPDF = useCallback(async (file) => {
    setIsRendering(true);
    setRenderProgress(0);
    setPages([]);
    setCurrentSpread(0);
    setError('');

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      const rendered = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: RENDER_SCALE });
        const canvas = document.createElement('canvas');
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
        rendered.push(canvas.toDataURL('image/jpeg', 0.85));
        setRenderProgress(Math.round((i / numPages) * 100));
      }

      setPages(rendered);
      setTotalSpreads(getTotalSpreads(numPages));
    } catch (err) {
      setError('Could not read this PDF. Make sure it is not password-protected.');
      console.error(err);
    } finally {
      setIsRendering(false);
    }
  }, []);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      if (file.type !== 'application/pdf') {
        setError('Please select a PDF file.');
        return;
      }
      setError('');
      setPdfFile(file);
      setFileName(file.name.replace(/\.pdf$/i, ''));
      renderPDF(file);
    },
    [renderPDF]
  );

  const goToSpread = useCallback(
    (dir) => {
      if (isFlipping) return;
      const next = currentSpread + dir;
      if (next < 0 || next >= totalSpreads) return;
      setIsFlipping(true);
      setFlipDir(dir > 0 ? 'forward' : 'backward');
      setTimeout(() => {
        setCurrentSpread(next);
        setIsFlipping(false);
        setFlipDir(null);
      }, 500);
    },
    [isFlipping, currentSpread, totalSpreads]
  );

  useEffect(() => {
    if (pages.length === 0) return;
    const onKey = (e) => {
      if (e.key === 'ArrowRight') goToSpread(1);
      if (e.key === 'ArrowLeft') goToSpread(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goToSpread, pages.length]);

  const downloadPDF = () => {
    if (!pdfFile) return;
    const url = URL.createObjectURL(pdfFile);
    const a = document.createElement('a');
    a.href = url;
    a.download = pdfFile.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetBook = () => {
    setPages([]);
    setPdfFile(null);
    setFileName('');
    setCurrentSpread(0);
    setTotalSpreads(0);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ---------- Upload screen ----------
  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
        <div className="text-center">
          <BookOpen size={40} className="text-katha-400 mx-auto mb-2" />
          <h2 className="text-xl font-bold text-gray-800">PDF Flipbook Converter</h2>
          <p className="text-sm text-gray-400 mt-1">Turn any PDF into a beautiful page-turning book</p>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files?.[0]); }}
          onClick={() => !isRendering && fileInputRef.current?.click()}
          className={`w-full max-w-md border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
            isRendering ? 'cursor-default' : 'cursor-pointer'
          } ${
            isDragging
              ? 'border-katha-500 bg-katha-50'
              : 'border-gray-300 hover:border-katha-400 hover:bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {isRendering ? (
            <Loader size={36} className="text-katha-400 mx-auto animate-spin" />
          ) : (
            <Upload size={36} className="text-katha-400 mx-auto mb-3" />
          )}
          <p className="text-base font-semibold text-gray-700 mt-3">
            {isRendering ? 'Processing PDF…' : 'Drop PDF here or click to browse'}
          </p>
          {!isRendering && (
            <p className="text-xs text-gray-400 mt-1">Supports any standard PDF</p>
          )}
        </div>

        {isRendering && (
          <div className="w-full max-w-md">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Rendering pages</span>
              <span>{renderProgress}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-katha-500 rounded-full transition-all duration-200"
                style={{ width: `${renderProgress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2 max-w-md text-center">
            {error}
          </p>
        )}
      </div>
    );
  }

  // ---------- Flipbook viewer ----------
  const { left: leftIdx, right: rightIdx } = getSpreadPages(currentSpread, pages.length);
  const nextSpread = getSpreadPages(Math.min(currentSpread + 1, totalSpreads - 1), pages.length);
  const prevSpread = getSpreadPages(Math.max(currentSpread - 1, 0), pages.length);

  const pageLabel =
    currentSpread === 0
      ? 'Cover'
      : [leftIdx, rightIdx]
          .filter((i) => i != null)
          .map((i) => i + 1)
          .join('–');

  return (
    <div className="flex flex-col items-center gap-4 py-2 select-none">
      {/* Top bar */}
      <div className="w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen size={16} className="text-katha-500 shrink-0" />
          <span className="font-semibold text-gray-700 text-sm truncate">{fileName}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={downloadPDF}
            className="flex items-center gap-1.5 bg-katha-500 hover:bg-katha-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download size={13} />
            Download PDF
          </button>
          <button
            onClick={resetBook}
            title="Load another PDF"
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 rounded-lg hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Book */}
      <div
        className="relative flex rounded-sm overflow-visible"
        style={{
          perspective: '2000px',
          width: 'min(92vw, 640px)',
          height: 'min(65vw, 455px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
        }}
      >
        {/* Book spine */}
        <div
          className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1.5 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(to right, #b0b0b0, #e8e8e8, #b0b0b0)' }}
        />

        {/* Left page */}
        <div
          className="flex-1 bg-white relative overflow-hidden rounded-l-sm"
          style={{ boxShadow: 'inset -6px 0 12px rgba(0,0,0,0.12)' }}
        >
          {leftIdx != null ? (
            <img
              src={pages[leftIdx]}
              alt={`Page ${leftIdx + 1}`}
              className="w-full h-full object-contain block"
            />
          ) : (
            <div className="w-full h-full bg-amber-50" />
          )}
        </div>

        {/* Right page */}
        <div
          className="flex-1 bg-white relative overflow-hidden rounded-r-sm"
          style={{ boxShadow: 'inset 6px 0 12px rgba(0,0,0,0.12)' }}
        >
          {rightIdx != null ? (
            <img
              src={pages[rightIdx]}
              alt={`Page ${rightIdx + 1}`}
              className="w-full h-full object-contain block"
            />
          ) : (
            <div className="w-full h-full bg-amber-50" />
          )}
        </div>

        {/* Forward flip overlay */}
        {isFlipping && flipDir === 'forward' && (
          <div
            className="absolute top-0 right-0 bottom-0 w-1/2 z-20"
            style={{
              transformOrigin: 'left center',
              transformStyle: 'preserve-3d',
              animation: 'flip-forward 0.5s ease-in-out forwards',
            }}
          >
            <div
              className="absolute inset-0 bg-white overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                boxShadow: 'inset 6px 0 12px rgba(0,0,0,0.12)',
              }}
            >
              {rightIdx != null && (
                <img src={pages[rightIdx]} alt="" className="w-full h-full object-contain block" />
              )}
              {/* Page curl shadow */}
              <div
                className="absolute inset-y-0 right-0 w-8 pointer-events-none"
                style={{
                  background: 'linear-gradient(to left, rgba(0,0,0,0.15), transparent)',
                }}
              />
            </div>
            <div
              className="absolute inset-0 bg-white overflow-hidden"
              style={{
                transform: 'rotateY(180deg)',
                backfaceVisibility: 'hidden',
                boxShadow: 'inset -6px 0 12px rgba(0,0,0,0.12)',
              }}
            >
              {nextSpread.left != null && (
                <img
                  src={pages[nextSpread.left]}
                  alt=""
                  className="w-full h-full object-contain block"
                />
              )}
            </div>
          </div>
        )}

        {/* Backward flip overlay */}
        {isFlipping && flipDir === 'backward' && (
          <div
            className="absolute top-0 left-0 bottom-0 w-1/2 z-20"
            style={{
              transformOrigin: 'right center',
              transformStyle: 'preserve-3d',
              animation: 'flip-backward 0.5s ease-in-out forwards',
            }}
          >
            <div
              className="absolute inset-0 bg-white overflow-hidden"
              style={{
                backfaceVisibility: 'hidden',
                boxShadow: 'inset -6px 0 12px rgba(0,0,0,0.12)',
              }}
            >
              {leftIdx != null && (
                <img src={pages[leftIdx]} alt="" className="w-full h-full object-contain block" />
              )}
              <div
                className="absolute inset-y-0 left-0 w-8 pointer-events-none"
                style={{
                  background: 'linear-gradient(to right, rgba(0,0,0,0.15), transparent)',
                }}
              />
            </div>
            <div
              className="absolute inset-0 bg-white overflow-hidden"
              style={{
                transform: 'rotateY(-180deg)',
                backfaceVisibility: 'hidden',
                boxShadow: 'inset 6px 0 12px rgba(0,0,0,0.12)',
              }}
            >
              {prevSpread.right != null && (
                <img
                  src={pages[prevSpread.right]}
                  alt=""
                  className="w-full h-full object-contain block"
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => goToSpread(-1)}
          disabled={currentSpread === 0 || isFlipping}
          className="p-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          aria-label="Previous spread"
        >
          <ChevronLeft size={20} className="text-gray-700" />
        </button>

        <div className="text-center min-w-[120px]">
          <span className="text-sm font-medium text-gray-700">{pageLabel}</span>
          <span className="text-gray-300 mx-1.5">·</span>
          <span className="text-xs text-gray-400">
            {currentSpread + 1} / {totalSpreads}
          </span>
        </div>

        <button
          onClick={() => goToSpread(1)}
          disabled={currentSpread === totalSpreads - 1 || isFlipping}
          className="p-2.5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-95"
          aria-label="Next spread"
        >
          <ChevronRight size={20} className="text-gray-700" />
        </button>
      </div>

      <p className="text-xs text-gray-400">← → arrow keys to flip pages</p>
    </div>
  );
}
