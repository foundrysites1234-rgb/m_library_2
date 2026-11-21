import { useEffect, useRef } from 'react';
import { useLocale } from '../../i18n/useLocale.js';
import { getCursorState, setCursorTarget, subscribeCursor } from './cursorStore.js';

export function CustomCursor({ active }) {
  const { t } = useLocale();
  const rootRef = useRef(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || !active) return undefined;

    const isFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return undefined;

    let cx = getCursorState().x;
    let cy = getCursorState().y;
    let rafId = 0;
    let lastTime = performance.now();

    const applyMode = (state) => {
      el.classList.toggle('is-active', Boolean(state.hasPointer));
      el.classList.remove('spine', 'btn', 'open');
      if (state.mode === 'spine' || state.mode === 'btn' || state.mode === 'open') {
        el.classList.add(state.mode);
      }
    };

    const unsub = subscribeCursor(applyMode);

    const onPointerMove = (e) => {
      if (e.pointerType === 'touch') return;
      setCursorTarget(e.clientX, e.clientY);
      if (!el.classList.contains('is-active')) {
        el.classList.add('is-active');
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const tick = (now) => {
      const dt = Math.min(0.05, Math.max(0, (now - lastTime) / 1000));
      lastTime = now;
      const state = getCursorState();
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      const alpha = reduced ? 1 : 1 - Math.exp(-16 * dt);
      cx += (state.x - cx) * alpha;
      cy += (state.y - cy) * alpha;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    applyMode(getCursorState());

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      unsub();
    };
  }, [active]);

  if (!active) return null;

  return (
    <div ref={rootRef} className="custom-cursor" aria-hidden="true">
      <div className="custom-cursor-ring" />
      <div className="custom-cursor-dot" />
      <span className="custom-cursor-label">{t.shelf.cursorOpen}</span>
    </div>
  );
}
