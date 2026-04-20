import { getCachedLookup, setCachedLookup } from './storageService.js';

const GOOGLE_URL = 'https://www.googleapis.com/books/v1/volumes';
const OL_URL = 'https://openlibrary.org/api/books';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const FETCH_TIMEOUT_MS = 12000;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function extractGoogleData(item) {
  const info = item.volumeInfo || {};
  const saleInfo = item.saleInfo || {};

  const isbn13 = (info.industryIdentifiers || []).find((i) => i.type === 'ISBN_13');
  const isbn10 = (info.industryIdentifiers || []).find((i) => i.type === 'ISBN_10');
  const isbn = isbn13?.identifier || isbn10?.identifier || '';

  let mrp = '';
  if (saleInfo.listPrice?.amount) {
    mrp = `${saleInfo.listPrice.currencyCode || ''} ${saleInfo.listPrice.amount}`.trim();
  }

  const dims = info.dimensions;
  const dimensions = dims
    ? [dims.height, dims.width, dims.thickness].filter(Boolean).join(' x ')
    : '';

  return {
    isbn,
    isbn10: isbn10?.identifier || '',
    title: info.title || '',
    subtitle: info.subtitle || '',
    author: (info.authors || []).join(', '),
    publisher: info.publisher || '',
    year: info.publishedDate ? info.publishedDate.slice(0, 4) : '',
    language: info.language || '',
    pages: info.pageCount ? String(info.pageCount) : '',
    genre: (info.categories || []).join(', '),
    dimensions,
    mrp,
    thumbnail: info.imageLinks?.thumbnail || '',
    description: info.description ? info.description.slice(0, 400) : '',
  };
}

function extractOpenLibraryData(isbn, data) {
  const ids = data.identifiers || {};
  const year = data.publish_date
    ? (data.publish_date.match(/\d{4}/)?.[0] || '')
    : '';
  const desc = data.description
    ? (typeof data.description === 'string' ? data.description : data.description.value || '')
    : '';

  return {
    isbn,
    isbn10: ids.isbn_10?.[0] || '',
    title: data.title || '',
    subtitle: data.subtitle || '',
    author: (data.authors || []).map((a) => a.name).join(', '),
    publisher: (data.publishers || []).map((p) => p.name).join(', '),
    year,
    language: '',
    pages: data.number_of_pages ? String(data.number_of_pages) : '',
    genre: (data.subjects || []).slice(0, 3).map((s) => s.name).join(', '),
    dimensions: '',
    mrp: '',
    thumbnail: data.cover?.medium || data.cover?.small || '',
    description: desc.slice(0, 400),
  };
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return res;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Request timed out — check your connection');
    throw new Error(err.message || 'Network error');
  } finally {
    clearTimeout(timer);
  }
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  let lastErr;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetchWithTimeout(url);
      if ((res.status === 503 || res.status === 429 || res.status >= 500) && attempt < retries) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) { await sleep(RETRY_DELAY_MS * attempt); continue; }
    }
  }
  throw lastErr;
}

async function lookupOpenLibrary(isbn) {
  const url = `${OL_URL}?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
  const json = await fetchWithRetry(url);
  const data = json[`ISBN:${isbn}`];
  if (!data) return null;
  return extractOpenLibraryData(isbn, data);
}

export async function lookupISBN(isbn) {
  const cached = await getCachedLookup(isbn);
  if (cached) return cached;

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const keyParam = apiKey ? `&key=${apiKey}` : '';
  const googleUrl = `${GOOGLE_URL}?q=isbn:${isbn}${keyParam}`;

  // Try Google Books first, then Open Library as fallback
  let bookData = null;
  let googleErr = null;

  try {
    const json = await fetchWithRetry(googleUrl);
    if (json?.items?.length) {
      bookData = extractGoogleData(json.items[0]);
      if (!bookData.isbn) bookData.isbn = isbn;
    }
  } catch (err) {
    googleErr = err;
    console.warn('Google Books failed, trying Open Library:', err.message);
  }

  // Fallback to Open Library if Google Books had no result or failed
  if (!bookData) {
    try {
      bookData = await lookupOpenLibrary(isbn);
      if (bookData) bookData.isbn = isbn;
    } catch (err) {
      // If both fail, rethrow the original Google error (or OL error if Google had no error)
      throw googleErr || err;
    }
  }

  if (!bookData) return null; // genuinely not in either database

  setCachedLookup(isbn, bookData).catch((e) => console.warn('Cache write failed:', e));
  return bookData;
}
