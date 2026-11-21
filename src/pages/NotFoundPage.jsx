import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '../i18n/useLocale.js';

export function NotFoundPage() {
  const { t } = useLocale();

  useEffect(() => {
    document.title = t.meta.notFoundTitle;
  }, [t.meta.notFoundTitle]);

  return (
    <section>
      <p className="lbl page-eyebrow">404</p>
      <div className="heading-mask is-rising">
        <h1 className="page-heading">{t.notFound.heading}</h1>
      </div>
      <p className="prose-body">{t.notFound.text}</p>
      <div style={{ marginTop: '28px' }}>
        <Link to="/" className="btn-cobalt">
          {t.notFound.back}
        </Link>
      </div>
    </section>
  );
}
