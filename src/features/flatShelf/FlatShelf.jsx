import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useSheetState } from '../../app/sheetContext.js';
import { HeroFooterBlend } from '../../components/footer/HeroFooterBlend.jsx';
import { SiteFooter } from '../../components/footer/SiteFooter.jsx';
import { BRAND, hasUrl } from '../../content/brand.js';
import { getBookById } from '../../content/books.js';
import { DECADES } from '../../content/decades.js';
import { formatDecade } from '../../i18n/index.js';
import { useLocale } from '../../i18n/useLocale.js';
import { createFlatShelf } from './engine/createFlatShelf.js';
import './flatShelf.css';

const BLOB_DEFS = [
  { cx: 150, cy: 330 },
  { cx: 340, cy: 600 },
  { cx: 250, cy: 120 },
  { cx: 90, cy: 760 },
  { cx: 400, cy: 250 },
  { cx: 260, cy: 860 },
  { cx: 230, cy: 470 },
];

export function FlatShelf() {
  const { locale, t } = useLocale();
  const { id: routeBookId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setDetailOpen } = useSheetState();
  const hasFacebook = hasUrl(BRAND.social.facebook);
  const hasInstagram = hasUrl(BRAND.social.instagram);

  const rootRef = useRef(null);
  const engineRef = useRef(null);
  const [footerPortal, setFooterPortal] = useState(null);

  const validRouteBook = routeBookId && getBookById(routeBookId) ? routeBookId : null;
  const decadeParam = searchParams.get('decade');
  const parsedDecade = decadeParam && /^\d{4}$/.test(decadeParam) ? Number(decadeParam) : null;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return undefined;

    const engine = createFlatShelf(el, {
      initialBookId: validRouteBook,
      initialDecade: parsedDecade,
      initialLocale: locale,
      initialStrings: t,
      onRequestOpenBook: (book) => {
        navigate(`/books/${book.id}`);
      },
      onRequestCloseBook: () => {
        navigate('/books');
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
    // Mount once; route param, decade param, and locale changes synchronize below
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
    if (validRouteBook) {
      engine.openBook(validRouteBook, false);
    } else {
      engine.closeBook();
    }
  }, [validRouteBook]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine || !parsedDecade || validRouteBook) return;
    engine.goToDecade(parsedDecade);
  }, [parsedDecade, validRouteBook]);

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
      if (to === '/books' || to.startsWith('/books?')) {
        window.scrollTo({ top: 0, behavior: 'auto' });
        navigate(to);
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
    [navigate]
  );

  return (
    <div ref={rootRef} className="flat-shelf">
      <div className="fs-probe" aria-hidden="true" />

      <nav className="fs-tabs" aria-label={t.shelf.decades}>
        <span className="fs-tab-indicator" aria-hidden="true" />
        {DECADES.map((d) => (
          <button
            key={d.key}
            type="button"
            className="lbl fs-tab"
            data-decade={d.key}
          >
            {d.decade === null ? t.shelf.all : formatDecade(locale, d.decade)}
          </button>
        ))}
      </nav>

      <section className="fs-shelf" aria-label={t.shelf.shelfLabel}>
        <div className="fs-stage" />
      </section>

      <button
        type="button"
        className="fs-play-ring"
        aria-label={t.shelf.openBook}
      >
        <svg viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 1.5L10.5 6 2 10.5Z" />
        </svg>
      </button>

      <div className="fs-caption" aria-live="polite">
        <div className="fs-mask fs-mask-title" data-fs-mask="title" />
        <div className="fs-mask" data-fs-mask="sub" />
        <div className="fs-mask" data-fs-mask="year" />
      </div>

      <button
        type="button"
        className="fs-arrow fs-arrow-prev"
        aria-label={t.shelf.prev}
      >
        <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
          <path d="M5 1L1 5l4 4M1 5h16" />
        </svg>
      </button>

      <button
        type="button"
        className="fs-arrow fs-arrow-next"
        aria-label={t.shelf.next}
      >
        <svg width="18" height="10" viewBox="0 0 18 10" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
          <path d="M13 1l4 4-4 4M17 5H1" />
        </svg>
      </button>

      <footer className="fs-foot">
        <span className="lbl">{t.shelf.rights}</span>
        {(hasFacebook || hasInstagram) && (
          <span className="lbl fs-foot-links">
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
        className="box lbl fs-more-cue"
        onClick={handleMoreClick}
      >
        <span>{t.shelf.more}</span>
        <span aria-hidden="true">↓</span>
      </button>

      <div
        className="fs-detail"
        role="dialog"
        aria-modal="true"
        aria-hidden="true"
        aria-label={t.shelf.openBook}
      >
        <div className="fs-detail-sticky">
          <button type="button" className="box lbl fs-detail-close">
            {t.shelf.close}
          </button>
        </div>

        <div className="fs-detail-first">
          <div className="fs-detail-topband">
            <span className="fs-detail-wordmark">mlibrary</span>
          </div>

          <div className="fs-detail-grid">
            <div className="fs-detail-col">
              <div className="fs-dline-mask">
                <span className="fs-dline lbl fs-detail-sub" data-fs-detail="sub" />
              </div>
              <div className="fs-dline-mask">
                <h2 className="fs-dline fs-detail-title" data-fs-detail="title" />
              </div>
              <div className="fs-dline-mask">
                <span className="fs-dline lbl fs-detail-meta" data-fs-detail="meta" />
              </div>
              <div className="fs-dline-mask">
                <p className="fs-dline fs-detail-synopsis" data-fs-detail="synopsis" />
              </div>
              <div className="fs-dline-mask">
                <p className="fs-dline fs-detail-credit" data-fs-detail="credit" />
              </div>
              <div className="fs-dline-mask fs-detail-reserve-mask">
                <Link
                  to="/contact?topic=reserve"
                  className="fs-dline lbl fs-detail-reserve"
                  data-fs-detail="reserve"
                  onClick={handleReserveClick}
                >
                  {t.shelf.reserve}
                </Link>
              </div>
            </div>

            <div className="fs-detail-poster-wrap">
              <svg
                className="fs-detail-poster"
                viewBox="0 0 474 900"
                aria-hidden="true"
              >
                <defs>
                  <filter id="fs-ink-filter" x="-200" y="-200" width="874" height="1300" filterUnits="userSpaceOnUse">
                    <feTurbulence type="fractalNoise" baseFrequency="0.011" numOctaves="3" seed="7" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="120" xChannelSelector="R" yChannelSelector="G" />
                  </filter>
                  <clipPath id="fs-poster-clip">
                    <rect x="0" y="0" width="474" height="900" />
                  </clipPath>
                  <mask id="fs-ink-mask" maskUnits="userSpaceOnUse" x="-200" y="-200" width="874" height="1300">
                    <g filter="url(#fs-ink-filter)">
                      {BLOB_DEFS.map((b, i) => (
                        <circle key={i} cx={b.cx} cy={b.cy} r="0" fill="#fff" data-fs-blob={i} />
                      ))}
                    </g>
                  </mask>
                </defs>
                <g clipPath="url(#fs-poster-clip)" mask="url(#fs-ink-mask)">
                  <image data-fs-poster-image="" preserveAspectRatio="none" />
                </g>
              </svg>
            </div>
          </div>
        </div>

        <HeroFooterBlend variant="sheet" />
        <div className="fs-detail-footer-slot" />
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
