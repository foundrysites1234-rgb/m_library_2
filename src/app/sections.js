import { getBookById } from '../content/books.js';

const BOOKS_PATH = /^\/books(?:\/([^/]+))?\/?$/;

function safeDecode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** 'home' | 'books' for real hero pages, otherwise the pathname itself. */
export function getSectionKey(pathname) {
  if (pathname === '/') return 'home';
  const match = BOOKS_PATH.exec(pathname);
  if (match && (!match[1] || getBookById(safeDecode(match[1])))) return 'books';
  return pathname;
}

export function isHeroPath(pathname) {
  const key = getSectionKey(pathname);
  return key === 'home' || key === 'books';
}
