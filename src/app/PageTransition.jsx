import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

function getSectionKey(pathname) {
  if (pathname === '/') return 'home';
  if (pathname === '/books' || pathname.startsWith('/books/')) return 'books';
  return pathname;
}

export function PageTransition({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const sheetRef = useRef(null);
  const prevSectionRef = useRef(getSectionKey(location.pathname));

  useEffect(() => {
    const sheet = sheetRef.current;
    if (sheet && !sheet.classList.contains('is-transitioning')) {
      sheet.inert = true;
    }
  }, []);

  useEffect(() => {
    const nextSection = getSectionKey(location.pathname);
    const prevSection = prevSectionRef.current;

    if (nextSection === prevSection) {
      setDisplayLocation(location);
      return undefined;
    }

    prevSectionRef.current = nextSection;
    const sheet = sheetRef.current;
    const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!sheet || reduced) {
      if (sheet) {
        sheet.style.visibility = 'hidden';
        sheet.inert = true;
        sheet.classList.remove('is-transitioning');
      }
      setDisplayLocation(location);
      if (!location.hash) {
        window.scrollTo(0, 0);
      }
      return undefined;
    }

    let cancelled = false;
    let fallbackTimer = null;

    const finishHide = () => {
      if (cancelled || !sheet) return;
      sheet.style.visibility = 'hidden';
      sheet.inert = true;
      sheet.classList.remove('is-transitioning');
      sheet.getAnimations().forEach((a) => a.cancel());
    };

    sheet.getAnimations().forEach((a) => a.cancel());
    sheet.inert = false;
    sheet.classList.add('is-transitioning');
    sheet.style.visibility = 'visible';

    fallbackTimer = setTimeout(() => {
      if (!cancelled) {
        setDisplayLocation(location);
        finishHide();
      }
    }, 700);

    const coverAnim = sheet.animate(
      [
        { clipPath: 'inset(100% 0 0 0)' },
        { clipPath: 'inset(0 0 0 0)' },
      ],
      {
        duration: 300,
        easing: 'cubic-bezier(.76,0,.18,1)',
        fill: 'both',
      }
    );

    coverAnim.finished
      .then(() => {
        if (cancelled) return null;
        setDisplayLocation(location);
        if (!location.hash) {
          window.scrollTo(0, 0);
        }
        return sheet.animate(
          [
            { clipPath: 'inset(0 0 0 0)' },
            { clipPath: 'inset(0 0 100% 0)' },
          ],
          {
            duration: 300,
            easing: 'cubic-bezier(.76,0,.18,1)',
            fill: 'both',
          }
        ).finished;
      })
      .then(() => {
        clearTimeout(fallbackTimer);
        finishHide();
      })
      .catch(() => {
        clearTimeout(fallbackTimer);
        if (!cancelled) {
          setDisplayLocation(location);
          finishHide();
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(fallbackTimer);
    };
  }, [location]);

  return (
    <>
      {children(displayLocation)}
      <div
        ref={sheetRef}
        className="page-transition-sheet"
        aria-hidden="true"
      />
    </>
  );
}
