import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSheetState } from '../../app/sheetContext.js';
import { HeroFooterBlend } from '../../components/footer/HeroFooterBlend.jsx';
import { SiteFooter } from '../../components/footer/SiteFooter.jsx';
import { BRAND, hasUrl } from '../../content/brand.js';
import { getBookById } from '../../content/books.js';
import { useLocale } from '../../i18n/useLocale.js';
import { createCurvedArchive } from './engine/createCurvedArchive.js';
import './curvedArchive.css';

const MAJOR_YEARS = [1955, 1960, 1965, 1970, 1975, 1980, 1985, 1990];
const PHONE_YEARS = new Set([1955, 1970, 1990]);
const ALL_YEARS = Array.from({ length: 36 }, (_, i) => 1955 + i);

const BLOB_DEFS = [
  { cx: 150, cy: 330 },
  { cx: 340, cy: 600 },
  { cx: 250, cy: 120 },
  { cx: 90, cy: 760 },
  { cx: 400, cy: 250 },
  { cx: 260, cy: 860 },
  { cx: 230, cy: 470 },
];

export function CurvedArchive() {
  const { locale, t } = useLocale();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setDetailOpen } = useSheetState();
  const hasFacebook = hasUrl(BRAND.social.facebook);
  const hasInstagram = hasUrl(BRAND.social.instagram);

  const rootRef = useRef(null);
  const engineRef = useRef(null);
  const reserveRef = useRef(null);
  const [footerPortal, setFooterPortal] = useState(null);

  const bookParam = searchParams.get('book');
  const validBookParam = bookParam && getBookById(bookParam) ? bookParam : null;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;

    const engine = createCurvedArchive(el, {
      initialBookId: validBookParam,
      initialLocale: locale,
      initialStrings: t,
      onRequestOpenBook: (book) => {
        setSearchParams({ book: book.id });
      },
      onRequestCloseBook: () => {
        setSearchParams({});
      },
      onSheetOpenChange: (open, root, slot) => {
        setDetailOpen(open);
        setFooterPortal(open && root && slot ? { root, slot } : null);
      },
    });
    engineRef.current = engine;

    return () => {
      setDetailOpen(false);
      setFooterPortal(null);
      engine.destroy();
      engineRef.current = null;
    };
    // Mount once; locale and book URL changes are synchronized by effects below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setLocale(locale, t);
    }
  }, [locale, t]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    if (validBookParam) {
      engine.openBook(validBookParam, false);
    } else {
      engine.closeBook();
    }
  }, [validBookParam]);

  const handleReserveClick = (e) => {
    e.preventDefault();
    const id = e.currentTarget.getAttribute('data-book-id') || '';
    navigate(`/contact?topic=reserve&book=${encodeURIComponent(id)}`);
  };

  const handleMoreClick = () => {
    const reduced =
      window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const footer = document.querySelector('.hero-shell > footer.site-footer');
    if (footer) {
      footer.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    }
  };

  const handleFooterNavigate = useCallback(
    (to) => {
      if (to === '/') {
        setSearchParams({});
        return;
      }
      const engine = engineRef.current;
      if (engine) {
        engine.closeBook(() => {
          navigate(to);
        });
      } else {
        navigate(to);
      }
    },
    [navigate, setSearchParams]
  );

  return (
    <div ref={rootRef} className="curved-archive">
      <div className="ca-probe" aria-hidden="true" />

      <div className="ca-kanji ca-kanji-left" aria-hidden="true">НОМ</div>
      <div className="ca-kanji ca-kanji-right" aria-hidden="true">САН</div>

      <div className="ca-floor-shadow" aria-hidden="true" />

      <section className="ca-shelf" aria-label={t.shelf.shelfLabel}>
        <div className="ca-stage" />
      </section>

      <button
        type="button"
        className="ca-play-ring"
        aria-label={t.shelf.openBook}
      >
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 1.5L10.5 6 2 10.5Z" />
        </svg>
      </button>

      <div className="ca-caption" aria-live="polite">
        <div className="ca-mask ca-mask-title" data-ca-mask="title" />
        <div className="ca-mask" data-ca-mask="sub" />
        <div className="ca-rule" aria-hidden="true" />
        <div className="ca-mask" data-ca-mask="year" />
      </div>

      <button
        type="button"
        className="ca-arrow ca-arrow-prev"
        aria-label={t.shelf.prev}
      >
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
          <path d="M6 1L1 6l5 5M1 6h23" />
        </svg>
      </button>

      <button
        type="button"
        className="ca-arrow ca-arrow-next"
        aria-label={t.shelf.next}
      >
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
          <path d="M18 1l5 5-5 5M23 6H0" />
        </svg>
      </button>

      <div className="ca-timeline" role="region" aria-label={t.shelf.timeline}>
        <div className="ca-tl-line" />
        <div className="ca-tl-ticks">
          {ALL_YEARS.map((yr) => {
            const pct = ((yr - 1955) / 35) * 100;
            const isMajor = MAJOR_YEARS.includes(yr);
            return (
              <span
                key={yr}
                className={`ca-tl-tick${isMajor ? ' is-major' : ''}`}
                style={{ left: `${pct}%` }}
              />
            );
          })}
          {MAJOR_YEARS.map((yr, idx) => {
            const pct = ((yr - 1955) / 35) * 100;
            const cls = [
              'ca-tl-year',
              yr === 1955 ? 'is-first' : '',
              yr === 1990 ? 'is-last' : '',
              idx % 2 === 1 ? 'is-alt' : '',
              PHONE_YEARS.has(yr) ? '' : 'is-phone-hide',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <span key={yr} className={cls} style={{ left: `${pct}%` }}>
                {yr}
              </span>
            );
          })}
        </div>
        <div className="ca-tl-dot" />
      </div>

      <footer className="ca-foot">
        <span className="lbl">{t.shelf.rights}</span>
        {(hasFacebook || hasInstagram) && (
          <span className="lbl ca-foot-links">
            {hasFacebook && (
              <a href={BRAND.social.facebook} aria-label={t.nav.facebookLabel}>FB</a>
            )}
            {hasFacebook && hasInstagram && ' / '}
            {hasInstagram && (
              <a href={BRAND.social.instagram} aria-label={t.nav.instagramLabel}>IG</a>
            )}
          </span>
        )}
      </footer>

      <button
        type="button"
        className="box lbl ca-more-cue"
        onClick={handleMoreClick}
      >
        <span>{t.shelf.more}</span>
        <span aria-hidden="true">↓</span>
      </button>

      <div
        className="ca-detail"
        role="dialog"
        aria-modal="true"
        aria-hidden="true"
        aria-label={t.shelf.openBook}
      >
        <div className="ca-detail-sticky">
          <button type="button" className="box lbl ca-detail-close">
            {t.shelf.close}
          </button>
        </div>

        <div className="ca-detail-first">
          <div className="ca-detail-brand">
            <span className="brand-wordmark">mlibrary</span>
            <span className="brand-rule" aria-hidden="true" />
            <span className="lbl">{t.nav.brandTag}</span>
          </div>

          <div className="ca-detail-grid">
            <div className="ca-detail-col">
              <div className="ca-dline-mask">
                <span className="ca-dline lbl ca-detail-sub" data-ca-detail="sub" />
              </div>
              <div className="ca-dline-mask">
                <h2 className="ca-dline ca-detail-title" data-ca-detail="title" />
              </div>
              <div className="ca-dline-mask">
                <span className="ca-dline lbl ca-detail-meta" data-ca-detail="meta" />
              </div>
              <div className="ca-dline-mask">
                <p className="ca-dline ca-detail-synopsis" data-ca-detail="synopsis" />
              </div>
              <div className="ca-dline-mask">
                <p className="ca-dline ca-detail-credit" data-ca-detail="credit" />
              </div>
              <div className="ca-dline-mask ca-detail-reserve-mask">
                <Link
                  ref={reserveRef}
                  to="/contact?topic=reserve"
                  className="ca-dline lbl ca-detail-reserve"
                  data-ca-detail="reserve"
                  onClick={handleReserveClick}
                >
                  {t.shelf.reserve}
                </Link>
              </div>
            </div>

            <div className="ca-detail-poster-wrap">
              <svg
                className="ca-detail-poster"
                viewBox="0 0 474 900"
                aria-hidden="true"
              >
                <defs>
                  <filter id="ca-ink-filter" x="-200" y="-200" width="874" height="1300" filterUnits="userSpaceOnUse">
                    <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed="7" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="120" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                  <clipPath id="ca-poster-clip">
                    <rect x="0" y="0" width="474" height="900" />
                  </clipPath>
                  <mask id="ca-ink-mask" maskUnits="userSpaceOnUse" x="-200" y="-200" width="874" height="1300">
                    <g filter="url(#ca-ink-filter)">
                      {BLOB_DEFS.map((b, i) => (
                        <circle key={i} cx={b.cx} cy={b.cy} r="0" fill="#fff" data-ca-blob={i} />
                      ))}
                    </g>
                  </mask>
                </defs>
                <g clipPath="url(#ca-poster-clip)" mask="url(#ca-ink-mask)">
                  <image data-ca-poster-image="" preserveAspectRatio="none" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        <HeroFooterBlend variant="sheet" />
        <div className="ca-detail-footer-slot" />
      </div>

      {footerPortal &&
        footerPortal.slot &&
        createPortal(
          <SiteFooter root={footerPortal.root} onBeforeNavigate={handleFooterNavigate} />,
          footerPortal.slot
        )}
    </div>
  );
}
