import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BRAND } from '../../content/brand.js';
import { useLocale } from '../../i18n/useLocale.js';
import { LanguageToggle } from './LanguageToggle.jsx';
import { setCursorMode } from './cursorStore.js';

function getBurgerInset() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const pad = vw <= 767 ? 16 : 36;
  const headerH = vw <= 767 ? 60 : 76;
  const top = Math.max(0, Math.round(headerH / 2 - 6));
  const left = Math.max(0, vw - pad - 26);
  const bottom = Math.max(0, vh - top - 12);
  const right = pad;
  return `inset(${top}px ${right}px ${bottom}px ${left}px round 3px)`;
}

export function MenuSheet({ open, onClose, anchorRef }) {
  const { pathname } = useLocation();
  const { t } = useLocale();
  const sheetRef = useRef(null);
  const closeBtnRef = useRef(null);
  const linkRefs = useRef([]);
  const isOpenRef = useRef(false);
  const closeTimerRef = useRef(null);

  const navItems = [
    { to: '/books', label: t.nav.books, active: pathname === '/books' || pathname.startsWith('/books/') },
    { to: '/about', label: t.nav.about, active: pathname === '/about' },
    { to: '/journal', label: t.nav.journal, active: pathname === '/journal' || pathname.startsWith('/journal/') },
    { to: '/contact', label: t.nav.contact, active: pathname === '/contact' },
  ];

  useEffect(() => {
    const sheet = sheetRef.current;
    if (!sheet) return undefined;

    if (!isOpenRef.current && !open) {
      sheet.inert = true;
      sheet.setAttribute('aria-hidden', 'true');
      sheet.classList.remove('is-visible');
      return undefined;
    }

    clearTimeout(closeTimerRef.current);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const anchorRect = anchorRef && anchorRef.current ? anchorRef.current.getBoundingClientRect() : null;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const closedClip = anchorRect && anchorRect.width > 0
      ? `inset(${Math.max(0, anchorRect.top)}px ${Math.max(0, vw - anchorRect.right)}px ${Math.max(0, vh - anchorRect.bottom)}px ${Math.max(0, anchorRect.left)}px round 3px)`
      : getBurgerInset();

    sheet.getAnimations().forEach((a) => a.cancel());

    if (open && !isOpenRef.current) {
      isOpenRef.current = true;
      document.documentElement.classList.add('is-menu-locked');
      sheet.inert = false;
      sheet.classList.add('is-visible');
      sheet.setAttribute('aria-hidden', 'false');

      const sheetAnim = sheet.animate(
        [
          { clipPath: closedClip },
          { clipPath: 'inset(0px 0px 0px 0px round 0px)' },
        ],
        {
          duration: reduced ? 1 : 1050,
          easing: 'cubic-bezier(.76,0,.18,1)',
          fill: 'both',
        }
      );

      linkRefs.current.forEach((el, idx) => {
        if (!el) return;
        el.getAnimations().forEach((a) => a.cancel());
        el.animate(
          [
            { transform: 'translateY(110%)' },
            { transform: 'translateY(0)' },
          ],
          {
            duration: reduced ? 1 : 900,
            delay: reduced ? 0 : 280 + idx * 75,
            easing: 'cubic-bezier(.2,.8,.2,1)',
            fill: 'both',
          }
        );
      });

      sheetAnim.finished
        .then(() => {
          if (isOpenRef.current && closeBtnRef.current) {
            closeBtnRef.current.focus();
          }
        })
        .catch(() => {});
    } else if (!open && isOpenRef.current) {
      isOpenRef.current = false;
      const finishClose = () => {
        if (isOpenRef.current || !sheet) return;
        sheet.classList.remove('is-visible');
        sheet.setAttribute('aria-hidden', 'true');
        sheet.inert = true;
        document.documentElement.classList.remove('is-menu-locked');
        sheet.getAnimations().forEach((a) => a.cancel());
        if (anchorRef && anchorRef.current && document.contains(anchorRef.current)) {
          anchorRef.current.focus();
        }
      };

      const duration = reduced ? 1 : 850;
      const closeAnim = sheet.animate(
        [
          { clipPath: 'inset(0px 0px 0px 0px round 0px)' },
          { clipPath: closedClip },
        ],
        {
          duration,
          easing: 'cubic-bezier(.76,0,.18,1)',
          fill: 'both',
        }
      );

      closeTimerRef.current = setTimeout(finishClose, duration + 60);
      closeAnim.finished
        .then(() => {
          clearTimeout(closeTimerRef.current);
          finishClose();
        })
        .catch(() => {});
    }

    return () => clearTimeout(closeTimerRef.current);
  }, [open, anchorRef]);

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('is-menu-locked');
    };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  const enterBtn = () => setCursorMode('btn');
  const leaveBtn = () => setCursorMode('default');

  return (
    <div
      id="mlibrary-menu-sheet"
      ref={sheetRef}
      className="menu-sheet"
      role="dialog"
      aria-modal="true"
      aria-label={t.nav.menu}
      aria-hidden="true"
    >
      <div className="menu-sheet-top">
        <Link
          to="/"
          className="brand-lockup-link"
          onClick={onClose}
          onMouseEnter={enterBtn}
          onMouseLeave={leaveBtn}
        >
          <span className="brand-wordmark">mlibrary</span>
          <span className="brand-rule" aria-hidden="true" />
          <span className="lbl brand-tag">{t.nav.brandTag}</span>
        </Link>

        <button
          ref={closeBtnRef}
          type="button"
          className="box lbl menu-close-btn"
          onClick={onClose}
          onMouseEnter={enterBtn}
          onMouseLeave={leaveBtn}
        >
          {t.nav.closeMenu}
        </button>
      </div>

      <div className="menu-sheet-body">
        <nav className="menu-nav" aria-label={t.nav.menu}>
          {navItems.map((item, idx) => (
            <div key={item.to} className="menu-link-mask">
              <Link
                ref={(el) => {
                  linkRefs.current[idx] = el;
                }}
                to={item.to}
                className={`menu-link-item${item.active ? ' is-active' : ''}`}
                onClick={onClose}
                onMouseEnter={enterBtn}
                onMouseLeave={leaveBtn}
              >
                {item.label}
              </Link>
            </div>
          ))}
        </nav>
      </div>

      <div className="menu-sheet-foot">
        <div onMouseEnter={enterBtn} onMouseLeave={leaveBtn}>
          <LanguageToggle />
        </div>

        <div className="menu-foot-meta">
          <a
            href={`mailto:${BRAND.email}`}
            className="lbl menu-foot-link"
            onMouseEnter={enterBtn}
            onMouseLeave={leaveBtn}
          >
            {BRAND.email}
          </a>
          <span className="lbl">
            <a
              href={BRAND.social.facebook}
              className="menu-foot-link"
              aria-label={t.nav.facebookLabel}
              onMouseEnter={enterBtn}
              onMouseLeave={leaveBtn}
            >
              FB
            </a>
            {' / '}
            <a
              href={BRAND.social.instagram}
              className="menu-foot-link"
              aria-label={t.nav.instagramLabel}
              onMouseEnter={enterBtn}
              onMouseLeave={leaveBtn}
            >
              IG
            </a>
          </span>
        </div>
      </div>
    </div>
  );
}
