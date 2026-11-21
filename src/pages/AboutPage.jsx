import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocale } from '../i18n/useLocale.js';

export function AboutPage() {
  const { t } = useLocale();
  const { hash } = useLocation();

  useEffect(() => {
    document.title = t.meta.aboutTitle;
  }, [t.meta.aboutTitle]);

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'auto' });
    }
  }, [hash]);

  return (
    <article>
      <p className="lbl page-eyebrow">{t.about.eyebrow}</p>
      <div className="heading-mask is-rising">
        <h1 className="page-heading">{t.about.heading}</h1>
      </div>

      <p className="prose-lead">{t.about.lead}</p>
      <p className="prose-body">{t.about.p1}</p>
      <p className="prose-body">{t.about.p2}</p>

      <section id="collections" className="content-section" aria-labelledby="collections-heading">
        <span className="box lbl">{t.about.collectionsTag}</span>
        <h2 id="collections-heading" className="section-heading">{t.about.collectionsHeading}</h2>
        <p className="prose-body">{t.about.collectionsText}</p>
      </section>

      <section id="partners" className="content-section" aria-labelledby="partners-heading">
        <span className="box lbl">{t.about.partnersTag}</span>
        <h2 id="partners-heading" className="section-heading">{t.about.partnersHeading}</h2>
        <p className="prose-body">{t.about.partnersText}</p>
        <ul className="partners-list">
          {t.about.partnersList.map((partner) => (
            <li key={partner}>{partner}</li>
          ))}
        </ul>
      </section>

      <section id="faq" className="content-section" aria-labelledby="faq-heading">
        <span className="box lbl">{t.about.faqTag}</span>
        <h2 id="faq-heading" className="section-heading">{t.about.faqHeading}</h2>
        <div className="faq-list">
          {t.about.faqs.map((item) => (
            <div key={item.q}>
              <h3 className="faq-q">{item.q}</h3>
              <p className="prose-body">{item.a}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
}
