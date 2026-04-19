import { getCachedLookup, setCachedLookup } from './storageService.js';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

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

  return {
    isbn,
    title: info.title || '',
    author: (info.authors || []).join(', '),
    publisher: info.publisher || '',
    year: info.publishedDate ? info.publishedDate.slice(0, 4) : '',
    language: info.language || '',
    mrp,
    thumbnail: info.imageLinks?.thumbnail || '',
    description: info.description || '',
  };
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);

      // Retry on server errors (5xx) and rate limits (429)
      if ((res.status === 503 || res.status === 429 || res.status >= 500) && attempt < retries) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }

      if (!res.ok) {
        throw new Error(`Google Books error ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      // Network error — retry if attempts remain
      if (attempt < retries) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      throw err;
    }
  }
}

export async function lookupISBN(isbn) {
  // Return cached result immediately if available
  const cached = await getCachedLookup(isbn);
  if (cached) return cached;

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const keyParam = apiKey ? `&key=${apiKey}` : '';
  const url = `${BASE_URL}?q=isbn:${isbn}${keyParam}`;

  let json;
  try {
    json = await fetchWithRetry(url);
  } catch {
    // Network/API completely unavailable — return null so caller adds book manually
    return null;
  }

  if (!json?.items?.length) return null;

  const bookData = extractBookData(json.items[0]);
  if (!bookData.isbn) bookData.isbn = isbn;

  await setCachedLookup(isbn, bookData);
  return bookData;
}
