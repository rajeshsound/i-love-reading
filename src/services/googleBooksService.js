import { getCachedLookup, setCachedLookup } from './storageService.js';

const BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

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

export async function lookupISBN(isbn) {
  const cached = await getCachedLookup(isbn);
  if (cached) return cached;

  const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
  const keyParam = apiKey ? `&key=${apiKey}` : '';
  const url = `${BASE_URL}?q=isbn:${isbn}${keyParam}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Google Books API error: ${res.status}`);

  const json = await res.json();
  if (!json.items?.length) return null;

  const bookData = extractBookData(json.items[0]);
  if (!bookData.isbn) bookData.isbn = isbn;

  await setCachedLookup(isbn, bookData);
  return bookData;
}
