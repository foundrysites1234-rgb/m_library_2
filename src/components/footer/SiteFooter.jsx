import { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FOOTER_POSTER_URL, FOOTER_VIDEO_URL } from '../../content/assets.js';
import { BRAND, hasUrl } from '../../content/brand.js';
import { useLocale } from '../../i18n/useLocale.js';
import './footer.css';

export function SiteFooter({ root = null, onBeforeNavigate = null }) {
  const { locale, t } = useLocale();
  const hasFacebook = hasUrl(BRAND.social.facebook);
  const hasInstagram = hasUrl(BRAND.social.instagram);
  const hasAnySocial = hasFacebook || hasInstagram;
  const nlEmailId = useId();
  const footerRef = useRef(null);
  const videoRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', text: string }

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return undefined;

    const observerRoot = root || null;

    const animObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          animObserver.disconnect();
        }
      },
      { root: observerRoot, threshold: 0.02 }
    );
    animObserver.observe(el);

    const videoObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVideoReady(true);
          videoObserver.disconnect();
        }
      },
      { root: observerRoot, rootMargin: observerRoot ? '200px 0px' : '100% 0px' }
    );
    videoObserver.observe(el);

    return () => {
      animObserver.disconnect();
      videoObserver.disconnect();
    };
  }, [root]);

  useEffect(() => {
    if (!videoReady || !videoRef.current) return;
    const video = videoRef.current;
    if (!video.getAttribute('src')) {
      video.setAttribute('src', FOOTER_VIDEO_URL);
      video.load();
      video.play().catch(() => {});
    }
  }, [videoReady]);

  const handleLinkClick = (to) => (e) => {
    if (!onBeforeNavigate) return;
    e.preventDefault();
    onBeforeNavigate(to);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus({ type: 'error', text: t.newsletter.error });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed, locale }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) {
        setStatus({ type: 'error', text: t.newsletter.error });
      } else {
        setStatus({ type: 'success', text: t.newsletter.success });
        setEmail('');
      }
    } catch {
      setStatus({ type: 'error', text: t.newsletter.error });
    } finally {
      setSubmitting(false);
    }
  };

  const linkProps = (to) => ({
    to,
    onClick: handleLinkClick(to),
  });

  return (
    <footer
      ref={footerRef}
      className={`site-footer${inView ? ' in-view' : ''}`}
    >
      <div className="footer-media" aria-hidden="true">
        <video
          ref={videoRef}
          className="footer-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={FOOTER_POSTER_URL}
        />
      </div>

      <div className="footer-inner">
        <div className="footer-grid">
          <div className="brand">
            <div className="brand-lockup">
              <svg
                className="brand-mark"
                viewBox="0 0 96 120"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <ellipse cx="48" cy="60" rx="45" ry="57" />
                <path d="M48 52c-8-5-17-6-26-4v32c9-2 18-1 26 4Z" />
                <path d="M48 52c8-5 17-6 26-4v32c-9-2-18-1-26 4Z" />
                <path d="M48 52v32" strokeLinecap="round" />
              </svg>
              <p className="brand-name">{BRAND.name}</p>
            </div>

            <p className="brand-blurb">{t.footer.blurb}</p>

            <ul className="contact-list">
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M3 5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H3Zm0 2h18l-9 6L3 7Zm0 2.4 8.45 5.63a1 1 0 0 0 1.1 0L21 9.4V17H3V9.4Z" />
                </svg>
                <a href={`mailto:${BRAND.email}`}>{BRAND.email}</a>
              </li>
              {BRAND.phone && (
                <li>
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2Z" />
                  </svg>
                  <a href={BRAND.phoneHref}>{BRAND.phone}</a>
                </li>
              )}
              <li>
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z" />
                </svg>
                <span>{t.footer.place}</span>
              </li>
            </ul>
          </div>

          <nav className="col" aria-label={t.footer.col1Title}>
            <h2 className="col-title">{t.footer.col1Title}</h2>
            <ul className="link-list">
              <li><Link {...linkProps('/books')}>{t.footer.col1Links.allBooks}</Link></li>
              <li><Link {...linkProps('/books?decade=1970')}>{t.footer.col1Links.byDecade}</Link></li>
              <li><Link {...linkProps('/')}>{t.footer.col1Links.timeline}</Link></li>
              <li><Link {...linkProps('/journal/new-on-the-shelf')}>{t.footer.col1Links.newArrivals}</Link></li>
              <li><Link {...linkProps('/journal/reading-by-decade-1970s')}>{t.footer.col1Links.readingLists}</Link></li>
              <li><Link {...linkProps('/contact?topic=reserve')}>{t.footer.col1Links.reserveBook}</Link></li>
            </ul>
          </nav>

          <nav className="col" aria-label={t.footer.col2Title}>
            <h2 className="col-title">{t.footer.col2Title}</h2>
            <ul className="link-list">
              <li><Link {...linkProps('/about')}>{t.footer.col2Links.ourStory}</Link></li>
              <li><Link {...linkProps('/about#collections')}>{t.footer.col2Links.collections}</Link></li>
              <li><Link {...linkProps('/contact?topic=donate')}>{t.footer.col2Links.donateBook}</Link></li>
              <li><Link {...linkProps('/about#partners')}>{t.footer.col2Links.partners}</Link></li>
              <li><Link {...linkProps('/contact?topic=press')}>{t.footer.col2Links.mediaEnquiry}</Link></li>
            </ul>
          </nav>

          <nav className="col" aria-label={t.footer.col3Title}>
            <h2 className="col-title">{t.footer.col3Title}</h2>
            <ul className="link-list">
              <li><Link {...linkProps('/about#faq')}>{t.footer.col3Links.faqs}</Link></li>
              <li><Link {...linkProps('/contact?topic=membership')}>{t.footer.col3Links.membership}</Link></li>
            </ul>
          </nav>

          <div className="newsletter">
            <h2 className="col-title">{t.footer.col4Title}</h2>
            <p>{t.footer.newsletterText}</p>
            <form className="subscribe" onSubmit={handleSubmit} noValidate>
              <label htmlFor={nlEmailId} className="sr-only">
                {t.newsletter.label}
              </label>
              <input
                id={nlEmailId}
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t.newsletter.placeholder}
                autoComplete="email"
                required
              />
              <button
                type="submit"
                aria-label={t.newsletter.subscribe}
                disabled={submitting}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </button>
            </form>
            <p
              className={`newsletter-status${status && status.type === 'error' ? ' is-error' : ''}`}
              aria-live="polite"
            >
              {status ? status.text : ''}
            </p>
          </div>
        </div>

        <div className="footer-bottom">
          {hasAnySocial && (
            <div className="socials">
              {hasFacebook && (
                <a href={BRAND.social.facebook} aria-label={t.nav.facebookLabel}>
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M13.5 21v-7.5H16l.5-3h-3V8.75c0-.87.24-1.46 1.5-1.46H16.6V4.6c-.28-.04-1.24-.12-2.36-.12-2.34 0-3.94 1.43-3.94 4.05V10.5H8v3h2.3V21h3.2Z" />
                  </svg>
                </a>
              )}
              {hasInstagram && (
                <a href={BRAND.social.instagram} aria-label={t.nav.instagramLabel}>
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9Zm9.75 1.35a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2ZM12 7.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9Zm0 1.8a2.7 2.7 0 1 0 0 5.4 2.7 2.7 0 0 0 0-5.4Z" />
                  </svg>
                </a>
              )}
            </div>
          )}

          <nav className="legal" aria-label={t.footer.legalAria}>
            <Link {...linkProps('/legal/privacy')}>{t.footer.legal.privacy}</Link>
            <Link {...linkProps('/legal/terms')}>{t.footer.legal.terms}</Link>
            <Link {...linkProps('/legal/cookies')}>{t.footer.legal.cookies}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
