import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const HEADERS = [
  'ISBN', 'ISBN-10', 'Title', 'Subtitle', 'Author', 'Publisher', 'Year',
  'Language', 'Pages', 'Genre', 'Dimensions', 'MRP',
  'Qty', 'Condition', 'Date Added', 'Notes', 'Description',
];

const SHEET_NAME = 'Books';

// Generate the suggested filename: name_ilovereading_bookscan_MonthYYYY
export function generateSuggestedName(userName = '') {
  const months = ['January','February','March','April','May','June',
                  'July','August','September','October','November','December'];
  const now = new Date();
  const suffix = `ilovereading_bookscan_${months[now.getMonth()]}${now.getFullYear()}`;
  const prefix = userName.trim()
    ? `${userName.trim().toLowerCase().replace(/\s+/g, '_')}_`
    : '';
  return `${prefix}${suffix}`;
}

function bookToRow(book) {
  return [
    book.isbn || '',
    book.isbn10 || '',
    book.title || '',
    book.subtitle || '',
    book.author || '',
    book.publisher || '',
    book.year || '',
    book.language || '',
    book.pages || '',
    book.genre || '',
    book.dimensions || '',
    book.mrp || '',
    book.qty != null ? book.qty : 1,
    book.condition || 'Good',
    book.dateAdded || new Date().toLocaleDateString('en-IN'),
    book.notes || '',
    book.description || '',
  ];
}

export function rowToBook(row) {
  return {
    isbn: String(row[0] || '').trim(),
    isbn10: String(row[1] || '').trim(),
    title: String(row[2] || '').trim(),
    subtitle: String(row[3] || '').trim(),
    author: String(row[4] || '').trim(),
    publisher: String(row[5] || '').trim(),
    year: String(row[6] || '').trim(),
    language: String(row[7] || '').trim(),
    pages: String(row[8] || '').trim(),
    genre: String(row[9] || '').trim(),
    dimensions: String(row[10] || '').trim(),
    mrp: String(row[11] || '').trim(),
    qty: row[12] != null ? Number(row[12]) : 1,
    condition: String(row[13] || 'Good').trim(),
    dateAdded: String(row[14] || '').trim(),
    notes: String(row[15] || '').trim(),
    description: String(row[16] || '').trim(),
  };
}

function buildWorkbook(books) {
  const wb = XLSX.utils.book_new();
  const rows = [HEADERS, ...books.map(bookToRow)];
  const ws = XLSX.utils.aoa_to_sheet(rows);

  ws['!cols'] = [
    { wch: 15 }, { wch: 12 }, { wch: 35 }, { wch: 25 }, { wch: 25 },
    { wch: 20 }, { wch: 6  }, { wch: 10 }, { wch: 6  }, { wch: 20 },
    { wch: 18 }, { wch: 12 }, { wch: 5  }, { wch: 10 }, { wch: 14 },
    { wch: 25 }, { wch: 50 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, SHEET_NAME);
  return wb;
}

function workbookBlob(wb) {
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  return new Blob([out], { type: 'application/octet-stream' });
}

export function parseWorkbook(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
  if (rows.length < 2) return [];
  return rows.slice(1).filter((r) => r[0]).map(rowToBook);
}

// --- Save strategies ---

// File System Access API (Chrome desktop/Android) — true overwrite
export async function saveWithFilePicker(books, suggestedName) {
  if (!('showSaveFilePicker' in window)) return null;
  try {
    const handle = await window.showSaveFilePicker({
      suggestedName: suggestedName + '.xlsx',
      types: [{
        description: 'Excel Spreadsheet',
        accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
      }],
    });
    const wb = buildWorkbook(books);
    const writable = await handle.createWritable();
    await writable.write(workbookBlob(wb));
    await writable.close();
    return handle;
  } catch (err) {
    if (err.name === 'AbortError') return null;
    throw err;
  }
}

// Write to an already-obtained file handle (subsequent saves without picker)
export async function saveToExistingHandle(books, handle) {
  const wb = buildWorkbook(books);
  const writable = await handle.createWritable();
  await writable.write(workbookBlob(wb));
  await writable.close();
}

// Fallback: trigger browser download with given filename (iOS/Firefox)
export function saveAsDownload(books, filename) {
  const wb = buildWorkbook(books);
  saveAs(workbookBlob(wb), filename.endsWith('.xlsx') ? filename : filename + '.xlsx');
}
