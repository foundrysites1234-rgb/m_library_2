import { getBookById } from '../src/content/books.js';
import { getJournalPost } from '../src/content/journal.js';

const STATIC_ROUTES = new Set(['/', '/books', '/about', '/journal', '/contact']);
const LEGAL_SLUGS = new Set(['privacy', 'terms', 'cookies']);

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function isKnownRoute(pathname) {
  const normalized = (pathname || '/').replace(/\/+$/, '') || '/';
  if (STATIC_ROUTES.has(normalized)) return true;

  const bookMatch = /^\/books\/([^/]+)$/.exec(normalized);
  if (bookMatch) {
    return Boolean(getBookById(safeDecode(bookMatch[1])));
  }

  const journalMatch = /^\/journal\/([^/]+)$/.exec(normalized);
  if (journalMatch) {
    return Boolean(getJournalPost(safeDecode(journalMatch[1])));
  }

  const legalMatch = /^\/legal\/([^/]+)$/.exec(normalized);
  if (legalMatch) {
    return LEGAL_SLUGS.has(safeDecode(legalMatch[1]));
  }

  return false;
}
