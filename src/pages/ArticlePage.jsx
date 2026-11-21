import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getJournalPost } from '../content/journal.js';
import { useLocale } from '../i18n/useLocale.js';
import { NotFoundPage } from './NotFoundPage.jsx';

export function ArticlePage() {
  const { slug } = useParams();
  const { locale, t } = useLocale();
  const post = getJournalPost(slug);

  useEffect(() => {
    if (post) {
      const title = post.title[locale] || post.title.en;
      document.title = `${title} | mlibrary`;
    }
  }, [post, locale]);

  if (!post) {
    return <NotFoundPage />;
  }

  const title = post.title[locale] || post.title.en;
  const paragraphs = post.body[locale] || post.body.en;

  return (
    <article>
      <time className="box lbl" dateTime={post.date} style={{ marginBottom: '16px' }}>
        {post.date}
      </time>
      <div className="heading-mask is-rising">
        <h1 className="page-heading">{title}</h1>
      </div>

      {paragraphs.map((p, idx) => (
        <p key={idx} className="prose-body">
          {p}
        </p>
      ))}

      <div style={{ marginTop: '36px' }}>
        <Link to="/journal" className="btn-cobalt">
          {t.journal.back}
        </Link>
      </div>
    </article>
  );
}
