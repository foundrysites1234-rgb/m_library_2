import { Link, useLocation } from 'react-router-dom';
import { useLocale } from '../../i18n/useLocale.js';
import { LanguageToggle } from './LanguageToggle.jsx';
import { setCursorMode } from './cursorStore.js';

export function SiteHeader({ isHero, onOpenMenu, burgerRef, menuOpen }) {
  const { pathname } = useLocation();
  const { t } = useLocale();

  const isBooks = pathname === '/books' || pathname.startsWith('/books/');
  const isAbout = pathname === '/about';
  const isJournal = pathname === '/journal' || pathname.startsWith('/journal/');

  const enterBtn = () => setCursorMode('btn');
  const leaveBtn = () => setCursorMode('default');

  return (
    <header className={`site-header${isHero ? ' is-hero' : ''}`}>
      <Link
        to="/"
        className="brand-lockup-link"
        onMouseEnter={enterBtn}
        onMouseLeave={leaveBtn}
      >
        <span className="brand-wordmark">mlibrary</span>
        <span className="brand-rule" aria-hidden="true" />
        <span className="lbl brand-tag">{t.nav.brandTag}</span>
      </Link>

      <div className="header-right">
        <nav className="header-nav" aria-label="Primary">
          <Link
            to="/books"
            className={`lbl header-nav-link${isBooks ? ' is-active' : ''}`}
            onMouseEnter={enterBtn}
            onMouseLeave={leaveBtn}
          >
            {t.nav.books}
          </Link>
          <Link
            to="/about"
            className={`lbl header-nav-link${isAbout ? ' is-active' : ''}`}
            onMouseEnter={enterBtn}
            onMouseLeave={leaveBtn}
          >
            {t.nav.about}
          </Link>
          <Link
            to="/journal"
            className={`lbl header-nav-link${isJournal ? ' is-active' : ''}`}
            onMouseEnter={enterBtn}
            onMouseLeave={leaveBtn}
          >
            {t.nav.journal}
          </Link>
        </nav>

        <div onMouseEnter={enterBtn} onMouseLeave={leaveBtn}>
          <LanguageToggle />
        </div>

        <button
          ref={burgerRef}
          type="button"
          className="burger-btn"
          aria-label={t.nav.menu}
          aria-expanded={menuOpen}
          aria-controls="mlibrary-menu-sheet"
          onClick={onOpenMenu}
          onMouseEnter={enterBtn}
          onMouseLeave={leaveBtn}
        >
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
