import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export const HEADERS = [
  'ISBN', 'Title', 'Author', 'Language', 'MRP',
  'Publisher', 'Year', 'Qty', 'Condition', 'Date Added', 'Notes',
];

const FILE_NAME = 'BookInventory.xlsx';

function bookToRow(book) {
  return [
    book.isbn || '',
    book.title || '',
    book.author || '',
    book.language || '',
    book.mrp || '',
    book.publisher || '',
    book.year || '',
    book.qty != null ? book.qty : 1,
    book.condition || 'Good',
    book.dateAdded || new Date().toLocaleDateString('en-IN'),
    book.notes || '',
  ];
}

function rowToBook(row) {
  return {
    isbn: String(row[0] || '').trim(),
    title: String(row[1] || '').trim(),
    author: String(row[2] || '').trim(),
    language: String(row[3] || '').trim(),
    mrp: String(row[4] || '').trim(),
    publisher: String(row[5] || '').trim(),
    year: String(row[6] || '').trim(),
    qty: row[7] != null ? Number(row[7]) : 1,
    condition: String(row[8] || 'Good').trim(),
    dateAdded: String(row[9] || '').trim(),
    notes: String(row[10] || '').trim(),
  };
}

export function createWorkbook(books = []) {
  const wb = XLSX.utils.book_new();
  const rows = [HEADERS, ...books.map(bookToRow)];
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Column widths
  ws['!cols'] = [
    { wch: 15 }, { wch: 35 }, { wch: 25 }, { wch: 10 },
    { wch: 10 }, { wch: 20 }, { wch: 6 }, { wch: 5 },
    { wch: 10 }, { wch: 14 }, { wch: 30 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Books');
  return wb;
}

export function parseWorkbook(arrayBuffer) {
  const wb = XLSX.read(arrayBuffer, { type: 'array' });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

  if (rows.length < 2) return [];
  // Skip header row
  return rows.slice(1).filter((r) => r[0]).map(rowToBook);
}

export function saveWorkbook(wb) {
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/octet-stream' });
  saveAs(blob, FILE_NAME);
}

export function downloadNewFile(books = []) {
  const wb = createWorkbook(books);
  saveWorkbook(wb);
}

export function appendAndDownload(existingBooks, newBooks) {
  const all = [...existingBooks, ...newBooks];
  const wb = createWorkbook(all);
  saveWorkbook(wb);
  return all;
}
