const DB_NAME = 'KathaScannerDB';
const DB_VERSION = 1;
const BOOKS_STORE = 'books';
const CACHE_STORE = 'googleBooksCache';

let db = null;

function openDB() {
  if (db) return Promise.resolve(db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const d = e.target.result;
      if (!d.objectStoreNames.contains(BOOKS_STORE)) {
        const store = d.createObjectStore(BOOKS_STORE, { keyPath: 'isbn' });
        store.createIndex('title', 'title', { unique: false });
      }
      if (!d.objectStoreNames.contains(CACHE_STORE)) {
        d.createObjectStore(CACHE_STORE, { keyPath: 'isbn' });
      }
    };
    req.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function getAllBooks() {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(BOOKS_STORE, 'readonly');
    const req = tx.objectStore(BOOKS_STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function getBookByISBN(isbn) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(BOOKS_STORE, 'readonly');
    const req = tx.objectStore(BOOKS_STORE).get(isbn);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveBooks(books) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(BOOKS_STORE, 'readwrite');
    const store = tx.objectStore(BOOKS_STORE);
    books.forEach((b) => store.put(b));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearBooks() {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(BOOKS_STORE, 'readwrite');
    tx.objectStore(BOOKS_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedLookup(isbn) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(CACHE_STORE, 'readonly');
    const req = tx.objectStore(CACHE_STORE).get(isbn);
    req.onsuccess = () => resolve(req.result ? req.result.data : null);
    req.onerror = () => reject(req.error);
  });
}

export async function setCachedLookup(isbn, data) {
  const d = await openDB();
  return new Promise((resolve, reject) => {
    const tx = d.transaction(CACHE_STORE, 'readwrite');
    tx.objectStore(CACHE_STORE).put({ isbn, data, cachedAt: Date.now() });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
