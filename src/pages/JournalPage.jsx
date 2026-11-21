import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { journalPosts } from '../content/journal.js';
import { useLocale } from '../i18n/useLocale.js';

export function JournalPage() {
  const { locale, t } = useLocale();

  useEffect(() => {
    document.title = t.meta.journalTitle;
  }, [t.meta.journalTitle]);

  return (
    <section>
      <p className="lbl page-eyebrow">{t.journal.eyebrow}</p>
      <div className="heading-mask is-rising">
        <h1 className="page-heading">{t.journal.heading}</h1>
      </div>

      <div className="journal-list">
        {journalPosts.map((post) => (
          <article key={post.slug} className="journal-card">
            <time className="box lbl" dateTime={post.date}>
              {post.date}
            </time>
            <h2 className="journal-card-title">
              <Link to={`/journal/${post.slug}`}>
                {post.title[locale] || post.title.en}
              </Link>
            </h2>
            <p className="prose-body">{post.excerpt[locale] || post.excerpt.en}</p>
            <Link to={`/journal/${post.slug}`} className="lbl journal-read-link">
              {t.journal.read}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
