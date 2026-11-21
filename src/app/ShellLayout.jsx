import { useEffect, useRef, useState } from 'react';
import { SiteFooter } from '../components/footer/SiteFooter.jsx';
import { CustomCursor } from '../components/shell/CustomCursor.jsx';
import { MenuSheet } from '../components/shell/MenuSheet.jsx';
import { PaperGrain } from '../components/shell/PaperGrain.jsx';
import { SiteHeader } from '../components/shell/SiteHeader.jsx';
import { useLocale } from '../i18n/useLocale.js';

export function isHeroPath(pathname) {
  return pathname === '/' || pathname === '/books' || pathname.startsWith('/books/');
}

export function ShellLayout({ pathname, children }) {
  const { t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
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
  }, [pathname]);

  if (hero) {
    return (
      <>
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
        <PaperGrain />
        <MenuSheet
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          anchorRef={burgerRef}
        />
        <CustomCursor active />
      </>
    );
  }

  return (
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
  );
}
