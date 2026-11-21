import { useEffect } from 'react';

export function useNoIndex() {
  useEffect(() => {
    let meta = document.querySelector('meta[name="robots"]');
    const created = !meta;
    const prevContent = meta ? meta.getAttribute('content') : null;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'robots');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', 'noindex,follow');

    return () => {
      if (!meta || !meta.parentNode) return;
      if (created) {
        meta.parentNode.removeChild(meta);
      } else if (prevContent === null) {
        meta.removeAttribute('content');
      } else {
        meta.setAttribute('content', prevContent);
      }
    };
  }, []);
}
