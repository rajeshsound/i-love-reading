import { getCachedLookup, setCachedLookup } from './storageService.js';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const FETCH_TIMEOUT_MS = 12000;

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function extractBookData(item) {
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
      if (!res.ok) throw new Error(`Google Books API error ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) { await sleep(RETRY_DELAY_MS * attempt); continue; }
    }
  }
  throw lastErr;
}

export async function lookupISBN(isbn) {
  const cached = await getCachedLookup(isbn);
  if (cached) return cached;

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const keyParam = apiKey ? `&key=${apiKey}` : '';
  const url = `${BASE_URL}?q=isbn:${isbn}${keyParam}`;

  const json = await fetchWithRetry(url); // throws on network/API error

  if (!json?.items?.length) return null; // not found — not an error

  const bookData = extractBookData(json.items[0]);
  if (!bookData.isbn) bookData.isbn = isbn;

  setCachedLookup(isbn, bookData).catch((e) => console.warn('Cache write failed:', e));
  return bookData;
}
