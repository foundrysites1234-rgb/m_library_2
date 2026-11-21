import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useLocale } from '../i18n/useLocale.js';
import { NotFoundPage } from './NotFoundPage.jsx';

export function LegalPage() {
  const { slug } = useParams();
  const { t } = useLocale();
  const page = slug ? t.legal.pages[slug] : null;

  useEffect(() => {
    if (page) {
      document.title = `${page.title} | mlibrary`;
    }
  }, [page]);

  if (!page) {
    return <NotFoundPage />;
  }

  return (
    <article>
      <p className="lbl page-eyebrow">{t.legal.eyebrow}</p>
      <div className="heading-mask is-rising">
        <h1 className="page-heading">{page.title}</h1>
      </div>

      <p className="lbl legal-notice-banner">{t.legal.noticeBanner}</p>
      <p className="prose-body">{page.p1}</p>
      <p className="prose-body">{page.p2}</p>
    </article>
  );
}
