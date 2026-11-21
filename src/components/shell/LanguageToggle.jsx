import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocale } from '../../i18n/useLocale.js';

export function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();
  const groupRef = useRef(null);
  const indicatorRef = useRef(null);
  const btnRefs = useRef({ en: null, mn: null });

  const syncIndicator = () => {
    const indicator = indicatorRef.current;
    const activeBtn = btnRefs.current[locale];
    if (!indicator || !activeBtn) return;
    indicator.style.width = `${activeBtn.offsetWidth}px`;
    indicator.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
  };

  useLayoutEffect(() => {
    syncIndicator();
  });

  useEffect(() => {
    const handleResize = () => syncIndicator();
    window.addEventListener('resize', handleResize);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncIndicator).catch(() => {});
    }
    return () => window.removeEventListener('resize', handleResize);
  });

  return (
    <div
      ref={groupRef}
      className="lang-toggle"
      role="group"
      aria-label={t.nav.language}
    >
      <span ref={indicatorRef} className="lang-toggle-indicator" aria-hidden="true" />
      <button
        ref={(el) => {
          btnRefs.current.en = el;
        }}
        type="button"
        className="lang-toggle-btn"
        aria-pressed={locale === 'en'}
        onClick={() => setLocale('en')}
      >
        EN
      </button>
      <button
        ref={(el) => {
          btnRefs.current.mn = el;
        }}
        type="button"
        className="lang-toggle-btn"
        aria-pressed={locale === 'mn'}
        onClick={() => setLocale('mn')}
      >
        MN
      </button>
    </div>
  );
}
