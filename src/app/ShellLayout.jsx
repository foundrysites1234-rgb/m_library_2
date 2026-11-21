import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HeroFooterBlend } from '../components/footer/HeroFooterBlend.jsx';
import { SiteFooter } from '../components/footer/SiteFooter.jsx';
import { CustomCursor } from '../components/shell/CustomCursor.jsx';
import { MenuSheet } from '../components/shell/MenuSheet.jsx';
import { PaperGrain } from '../components/shell/PaperGrain.jsx';
import { SiteHeader } from '../components/shell/SiteHeader.jsx';
import { useLocale } from '../i18n/useLocale.js';
import { SheetStateContext } from './sheetContext.js';

export function isHeroPath(pathname) {
  return pathname === '/' || pathname === '/books' || pathname.startsWith('/books/');
}

export function ShellLayout({ pathname, children }) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const burgerRef = useRef(null);
  const hero = isHeroPath(pathname);

  useEffect(() => {
    document.documentElement.classList.toggle('hero-active', hero);
    document.body.classList.toggle('hero-active', hero);
    return () => {
      document.documentElement.classList.remove('hero-active');
      document.body.classList.remove('hero-active');
    };
  }, [hero]);

  useEffect(() => {
    setMenuOpen(false);
    if (!hero) {
      setDetailOpen(false);
    }
  }, [pathname, hero]);

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('is-menu-locked', 'is-detail-locked');
    };
  }, []);

  const handleHeroFooterNavigate = useCallback(
    (to) => {
      const reduced =
        window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const isSameHome = to === '/' && pathname === '/';
      const isSameBooks =
        (to === '/books' || to.startsWith('/books?')) &&
        (pathname === '/books' || pathname.startsWith('/books/'));

      if (isSameHome || isSameBooks) {
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
        navigate(to);
        return;
      }
      navigate(to);
    },
    [navigate, pathname]
  );

  const sheetState = useMemo(
    () => ({ detailOpen, setDetailOpen }),
    [detailOpen]
  );

  if (hero) {
    return (
      <SheetStateContext.Provider value={sheetState}>
        <div className="hero-shell">
          <a href="#main-content" className="skip-link">
            {t.nav.skip}
          </a>
          <SiteHeader
            isHero
            onOpenMenu={() => setMenuOpen(true)}
            burgerRef={burgerRef}
            menuOpen={menuOpen}
          />
          <main id="main-content">{children}</main>
          {!detailOpen && (
            <>
              <HeroFooterBlend variant="hero" />
              <SiteFooter onBeforeNavigate={handleHeroFooterNavigate} />
            </>
          )}
          <PaperGrain />
          <MenuSheet
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            anchorRef={burgerRef}
          />
          <CustomCursor active />
        </div>
      </SheetStateContext.Provider>
    );
  }

  return (
    <SheetStateContext.Provider value={sheetState}>
      <div className="content-shell">
        <a href="#main-content" className="skip-link">
          {t.nav.skip}
        </a>
        <SiteHeader
          isHero={false}
          onOpenMenu={() => setMenuOpen(true)}
          burgerRef={burgerRef}
          menuOpen={menuOpen}
        />
        <main id="main-content" className="content-main">
          {children}
        </main>
        <SiteFooter />
        <MenuSheet
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          anchorRef={burgerRef}
        />
      </div>
    </SheetStateContext.Provider>
  );
}
