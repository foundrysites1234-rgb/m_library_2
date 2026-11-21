import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getBookById } from '../content/books.js';
import { useLocale } from '../i18n/useLocale.js';
import { useNoIndex } from '../lib/useNoIndex.js';

const SUGGESTED_IDS = ['valley', 'river', 'storm'];
const MAX_ADDRESS_LENGTH = 80;

function readableAddress(pathname, search) {
  let value = `${pathname}${search}`;
  try {
    value = decodeURI(value);
  } catch {
    // keep the raw value if the address has broken percent-encoding
  }
  return value.length > MAX_ADDRESS_LENGTH ? `${value.slice(0, MAX_ADDRESS_LENGTH)}…` : value;
}

export function NotFoundPage() {
  const { locale, t } = useLocale();
  const { pathname, search } = useLocation();
  const suggestions = SUGGESTED_IDS.map(getBookById).filter(Boolean);

  useNoIndex();

  useEffect(() => {
    document.title = t.meta.notFoundTitle;
  }, [t.meta.notFoundTitle]);

  return (
    <section className="nf">
      <p className="lbl page-eyebrow">{t.notFound.eyebrow}</p>
      <div className="heading-mask is-rising">
        <h1 className="page-heading">{t.notFound.heading}</h1>
      </div>
      <p className="prose-lead">{t.notFound.text}</p>

      <p className="nf-slip">
        <span className="lbl">{t.notFound.requested}</span>
        <code>{readableAddress(pathname, search)}</code>
      </p>

      <div className="nf-actions">
        <Link to="/" className="btn-cobalt">{t.notFound.back}</Link>
        <Link to="/books" className="btn-cobalt">{t.notFound.browse}</Link>
        <Link to="/contact" className="journal-read-link">{t.notFound.contact}</Link>
      </div>

      {suggestions.length > 0 && (
        <section className="content-section" aria-labelledby="nf-suggest">
          <h2 id="nf-suggest" className="lbl">{t.notFound.suggestTitle}</h2>
          <ul className="nf-books">
            {suggestions.map((book) => (
              <li key={book.id}>
                <Link to={`/books/${book.id}`} className="nf-book">
                  <span className="lbl nf-book-no">{book.callNo}</span>
                  <span className="nf-book-title">{book.title[locale] || book.title.en}</span>
                  <span className="nf-book-meta">
                    {book.author[locale] || book.author.en} · {book.year}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </section>
  );
}
