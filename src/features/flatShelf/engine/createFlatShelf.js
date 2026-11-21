import { applyCropBackground, applyPosterImage, preloadSheets } from '../../../content/assets.js';
import { DEFAULT_BOOK_INDEX, books } from '../../../content/books.js';
import { getDecadeForYear } from '../../../content/decades.js';
import { setCursorMode, setCursorTarget } from '../../../components/shell/cursorStore.js';

const N = books.length;
const TOTAL = N * 3;

const BLOBS = [
  { cx: 150, cy: 330, delay: 0 },
  { cx: 340, cy: 600, delay: 120 },
  { cx: 250, cy: 120, delay: 220 },
  { cx: 90, cy: 760, delay: 300 },
  { cx: 400, cy: 250, delay: 360 },
  { cx: 260, cy: 860, delay: 420 },
  { cx: 230, cy: 470, delay: 180 },
];

function smoothstep(x) {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

function relIndex(v, s) {
  let r = mod(v - s, TOTAL);
  if (r >= TOTAL / 2) r -= TOTAL;
  return r;
}

function isReducedMotion() {
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function createFlatShelf(container, options) {
  const {
    initialBookId = null,
    initialDecade = null,
    initialLocale,
    initialStrings,
    onRequestOpenBook,
    onRequestCloseBook,
    onSheetOpenChange,
  } = options;

  preloadSheets();

  let locale = initialLocale;
  let strings = initialStrings;

  const probe = container.querySelector('.fs-probe');
  const tabsEl = container.querySelector('.fs-tabs');
  const shelfEl = container.querySelector('.fs-shelf');
  const stageEl = container.querySelector('.fs-stage');
  const playRingEl = container.querySelector('.fs-play-ring');
  const prevBtn = container.querySelector('.fs-arrow-prev');
  const nextBtn = container.querySelector('.fs-arrow-next');
  const footEl = container.querySelector('.fs-foot');
  const moreCueEl = container.querySelector('.fs-more-cue');
  const tabIndicator = container.querySelector('.fs-tab-indicator');
  const tabBtns = Array.from(container.querySelectorAll('.fs-tab'));

  const titleMask = container.querySelector('[data-fs-mask="title"]');
  const subMask = container.querySelector('[data-fs-mask="sub"]');
  const yearMask = container.querySelector('[data-fs-mask="year"]');

  const detailEl = container.querySelector('.fs-detail');
  const detailFirstEl = container.querySelector('.fs-detail-first');
  const detailFooterSlotEl = container.querySelector('.fs-detail-footer-slot');
  const detailCloseBtn = container.querySelector('.fs-detail-close');
  const detailSubEl = container.querySelector('[data-fs-detail="sub"]');
  const detailTitleEl = container.querySelector('[data-fs-detail="title"]');
  const detailMetaEl = container.querySelector('[data-fs-detail="meta"]');
  const detailSynopsisEl = container.querySelector('[data-fs-detail="synopsis"]');
  const detailCreditEl = container.querySelector('[data-fs-detail="credit"]');
  const detailReserveEl = container.querySelector('[data-fs-detail="reserve"]');
  const detailMasks = Array.from(container.querySelectorAll('.fs-dline'));
  const posterImageEl = container.querySelector('[data-fs-poster-image]');
  const blobEls = Array.from(container.querySelectorAll('[data-fs-blob]'));

  const bgControls = [tabsEl, shelfEl, playRingEl, prevBtn, nextBtn, footEl, moreCueEl].filter(Boolean);

  if (detailEl) {
    detailEl.inert = true;
    detailEl.setAttribute('aria-hidden', 'true');
  }

  let startIdx = DEFAULT_BOOK_INDEX;
  if (initialBookId) {
    const idx = books.findIndex((b) => b.id === initialBookId);
    if (idx >= 0) startIdx = idx;
  } else if (initialDecade) {
    const idx = books.findIndex((b) => getDecadeForYear(b.year) === initialDecade);
    if (idx >= 0) startIdx = idx;
  }

  let s = startIdx + N;
  let T = s;
  let active = startIdx;
  let hover = -1;
  let isDragging = false;
  let dragMoved = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragT0 = T;
  let wheelTimer = null;
  let closeTimer = null;
  let wasScrolled = typeof window !== 'undefined' && window.scrollY > 1;
  let lastScrollWheelTs = 0;

  let mx = window.innerWidth / 2;
  let my = window.innerHeight / 2;
  let tiltX = 0;
  let tiltY = 0;
  let onCover = false;
  let isOpen = false;
  let currentDetailBook = books[active];

  let inkRaf = 0;
  let mainRaf = 0;
  let destroyed = false;

  let stageRect = container.getBoundingClientRect();
  let W = Math.max(1, stageRect.width || window.innerWidth);
  let stageH = Math.max(1, stageRect.height || window.innerHeight);
  let H = 350;
  let ws = 59;
  let d = 184;
  let gap = 10.5;
  let shelfCy = stageH * 0.5;

  function setBackgroundInert(locked) {
    const headerEl = document.querySelector('.site-header');
    if (headerEl) headerEl.inert = locked;
    bgControls.forEach((el) => {
      el.inert = locked;
    });
  }

  function updateReservePin() {
    if (!detailFirstEl || !detailEl || !detailReserveEl) return;
    if (W > 600) {
      detailFirstEl.classList.remove('is-reserve-pinned');
      return;
    }
    detailFirstEl.classList.remove('is-reserve-pinned');
    const prevTop = detailEl.scrollTop;
    detailEl.scrollTop = 0;
    const dRect = detailEl.getBoundingClientRect();
    const rRect = detailReserveEl.getBoundingClientRect();
    const needsPin = rRect.bottom - dRect.top > detailEl.clientHeight - 10;
    detailFirstEl.classList.toggle('is-reserve-pinned', needsPin);
    detailEl.scrollTop = prevTop;
  }

  function measure() {
    stageRect = container.getBoundingClientRect();
    W = Math.max(1, stageRect.width || window.innerWidth);
    stageH = Math.max(1, stageRect.height || window.innerHeight);
    const rect = probe ? probe.getBoundingClientRect() : { height: Math.min(stageH * 0.46, W * 0.31) };
    H = Math.max(120, rect.height || 300);
    ws = (H * 142) / 840;
    d = (H * 474) / 900;
    gap = H * 0.03;

    const shelfRect = shelfEl.getBoundingClientRect();
    shelfCy = shelfRect.top - stageRect.top + shelfRect.height / 2;

    stageEl.style.setProperty('--ws', `${ws}px`);
    stageEl.style.setProperty('--d', `${d}px`);
    syncDecadeIndicator();

    if (isOpen) {
      updateReservePin();
    }
  }

  function B(r) {
    if (Math.abs(r) < 1) {
      return (r + Math.sin(Math.PI * r) / Math.PI) / 2;
    }
    return r >= 0 ? 0.5 : -0.5;
  }

  function F(r) {
    return r * (ws + gap) + (d - ws + 1.6 * gap) * B(r);
  }

  function syncDecadeIndicator() {
    const dec = String(getDecadeForYear(books[active].year));
    let activeBtn = null;
    tabBtns.forEach((btn) => {
      const isMatch = btn.dataset.decade === dec;
      btn.classList.toggle('is-active', isMatch);
      if (isMatch) activeBtn = btn;
    });
    if (tabIndicator && activeBtn) {
      tabIndicator.style.width = `${activeBtn.offsetWidth}px`;
      tabIndicator.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
      if (tabsEl && tabsEl.scrollWidth > tabsEl.clientWidth) {
        const btnLeft = activeBtn.offsetLeft;
        const btnRight = btnLeft + activeBtn.offsetWidth;
        const viewLeft = tabsEl.scrollLeft;
        const viewRight = viewLeft + tabsEl.clientWidth;
        if (btnLeft < viewLeft) tabsEl.scrollLeft = btnLeft;
        else if (btnRight > viewRight) tabsEl.scrollLeft = btnRight - tabsEl.clientWidth;
      }
    }
  }

  // Create 36 tapes
  const tapes = [];
  const tapeListeners = [];

  for (let v = 0; v < TOTAL; v++) {
    const book = books[v % N];
    const el = document.createElement('div');
    el.className = 'tape';
    el.dataset.v = String(v);
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '-1');
    el.setAttribute('aria-label', book.title[locale] || book.title.en);

    const sp = document.createElement('div');
    sp.className = 'sp';
    applyCropBackground(sp, `spine-${book.id}`);

    const cv = document.createElement('div');
    cv.className = 'cv';
    applyCropBackground(cv, `cover-${book.id}`);

    el.appendChild(sp);
    el.appendChild(cv);
    stageEl.appendChild(el);

    const onEnter = () => {
      hover = v;
    };
    const onLeave = () => {
      if (hover === v) hover = -1;
    };
    const onClick = () => {
      if (dragMoved || isOpen) return;
      const r = relIndex(v, s);
      if (Math.abs(r) < 0.5) {
        triggerOpen(books[active], false);
      } else {
        T = Math.round(T + r);
      }
    };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('click', onClick);
    tapeListeners.push({ el, onEnter, onLeave, onClick });

    tapes.push({ v, el, sp, cv, lift: 0 });
  }

  function swapMask(maskEl, text, dir, className) {
    if (!maskEl) return;
    const reduced = isReducedMotion();
    const existing = Array.from(maskEl.children);

    if (reduced) {
      maskEl.innerHTML = '';
      const span = document.createElement('span');
      span.className = `fs-mask-inner ${className}`;
      span.textContent = text;
      maskEl.appendChild(span);
      return;
    }

    existing.forEach((child) => {
      if (child.dataset.leaving === '1') return;
      child.dataset.leaving = '1';
      const rect = child.getBoundingClientRect();
      const parentRect = maskEl.getBoundingClientRect();
      child.style.position = 'absolute';
      child.style.left = '0';
      child.style.right = '0';
      child.style.top = `${rect.top - parentRect.top}px`;

      const anim = child.animate(
        [
          { transform: getComputedStyle(child).transform === 'none' ? 'translateY(0)' : getComputedStyle(child).transform },
          { transform: `translateY(${-dir * 105}%)` },
        ],
        { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }
      );
      anim.finished
        .then(() => {
          if (child.parentNode === maskEl) maskEl.removeChild(child);
        })
        .catch(() => {
          if (child.parentNode === maskEl) maskEl.removeChild(child);
        });
    });

    const next = document.createElement('span');
    next.className = `fs-mask-inner ${className}`;
    next.textContent = text;
    maskEl.appendChild(next);

    next.animate(
      [
        { transform: `translateY(${dir * 105}%)` },
        { transform: 'translateY(0)' },
      ],
      { duration: 650, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' }
    );
  }

  function renderCaption(bookIdx, dir) {
    const book = books[bookIdx];
    const title = book.title[locale] || book.title.en;
    const author = book.author[locale] || book.author.en;

    swapMask(titleMask, title, dir, 'fs-title');
    swapMask(subMask, `${author} / ${book.callNo}`, dir, 'fs-sub');
    swapMask(yearMask, String(book.year), dir, 'fs-year');
    syncDecadeIndicator();
  }

  function fillDetailTexts(book) {
    currentDetailBook = book;
    const title = book.title[locale] || book.title.en;
    const author = book.author[locale] || book.author.en;
    const synopsis = book.synopsis[locale] || book.synopsis.en;
    const genreLabel = (strings.genres && strings.genres[book.genre]) || book.genre;
    const pagesLabel = strings.shelf.pages;
    const writtenBy = strings.shelf.writtenBy;
    const callNoLabel = strings.shelf.callNo;

    if (detailSubEl) detailSubEl.textContent = `${author} / ${book.callNo}`;
    if (detailTitleEl) detailTitleEl.textContent = title;
    if (detailMetaEl) detailMetaEl.textContent = `${book.year} / ${genreLabel} / ${book.pages} ${pagesLabel}`;
    if (detailSynopsisEl) detailSynopsisEl.textContent = synopsis;
    if (detailCreditEl) {
      detailCreditEl.textContent =
        locale === 'mn'
          ? `${writtenBy}: ${author}. ${callNoLabel}: ${book.callNo}`
          : `${writtenBy} ${author}. ${callNoLabel} ${book.callNo}`;
    }
    if (detailReserveEl) {
      detailReserveEl.textContent = strings.shelf.reserve;
      detailReserveEl.setAttribute('data-book-id', book.id);
    }

    if (isOpen) {
      updateReservePin();
    }
  }

  function getActiveCoverRect(cRect) {
    const targetV = Math.round(s);
    let bestTape = null;
    let bestDist = Infinity;
    for (const t of tapes) {
      const dist = Math.abs(relIndex(t.v, targetV));
      if (dist < bestDist) {
        bestDist = dist;
        bestTape = t;
      }
    }
    if (bestTape) {
      const rect = bestTape.cv.getBoundingClientRect();
      if (rect.width > 10 && rect.height > 10) {
        return {
          left: rect.left - cRect.left,
          top: rect.top - cRect.top,
          right: rect.right - cRect.left,
          bottom: rect.bottom - cRect.top,
          width: rect.width,
          height: rect.height,
        };
      }
    }
    return {
      left: W / 2 - d / 2,
      top: shelfCy - H / 2,
      right: W / 2 + d / 2,
      bottom: shelfCy + H / 2,
      width: d,
      height: H,
    };
  }

  function startInkBleed(immediate) {
    cancelAnimationFrame(inkRaf);
    if (immediate || isReducedMotion()) {
      blobEls.forEach((el) => el.setAttribute('r', '720'));
      return;
    }
    blobEls.forEach((el) => el.setAttribute('r', '0'));
    const start = performance.now() + 520;

    const step = (now) => {
      if (destroyed || !isOpen) return;
      const elapsed = now - start;
      let done = true;
      blobEls.forEach((el, idx) => {
        const delay = BLOBS[idx] ? BLOBS[idx].delay : 0;
        const t = (elapsed - delay) / 1250;
        if (t <= 0) {
          el.setAttribute('r', '0');
          done = false;
        } else if (t >= 1) {
          el.setAttribute('r', '720');
        } else {
          const eased = 1 - Math.pow(1 - t, 3);
          el.setAttribute('r', (eased * 720).toFixed(1));
          done = false;
        }
      });
      if (!done && elapsed < 2400) {
        inkRaf = requestAnimationFrame(step);
      } else {
        blobEls.forEach((el) => el.setAttribute('r', '720'));
      }
    };
    inkRaf = requestAnimationFrame(step);
  }

  function openBookInternal(book, immediate = false) {
    if (window.scrollY > 0) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      measure();
    }

    const idx = books.findIndex((b) => b.id === book.id);
    if (idx >= 0) {
      const curMod = mod(Math.round(s), N);
      if (curMod !== idx) {
        let diff = idx - curMod;
        if (diff > N / 2) diff -= N;
        if (diff < -N / 2) diff += N;
        s = Math.round(s) + diff;
        T = s;
        active = idx;
        renderCaption(active, 1);
      } else {
        s = Math.round(s);
        T = s;
      }
    }

    clearTimeout(closeTimer);
    isOpen = true;
    document.documentElement.classList.add('is-detail-locked');
    setBackgroundInert(true);

    fillDetailTexts(book);
    applyPosterImage(posterImageEl, book.id);

    const cRect = container.getBoundingClientRect();
    const rect = getActiveCoverRect(cRect);
    const top = Math.max(0, rect.top);
    const left = Math.max(0, rect.left);
    const right = Math.max(0, cRect.width - rect.right);
    const bottom = Math.max(0, cRect.height - rect.bottom);
    const fromClip = `inset(${top}px ${right}px ${bottom}px ${left}px round 3px)`;
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;

    detailEl.getAnimations().forEach((a) => a.cancel());
    detailEl.style.transformOrigin = `${originX}px ${originY}px`;
    detailEl.inert = false;
    detailEl.classList.add('is-open');
    detailEl.setAttribute('aria-hidden', 'false');
    detailEl.scrollTop = 0;

    if (onSheetOpenChange) {
      onSheetOpenChange(true, detailEl, detailFooterSlotEl);
    }

    requestAnimationFrame(() => {
      if (isOpen && !destroyed && detailEl) {
        detailEl.scrollTop = 0;
        updateReservePin();
      }
    });

    const fast = immediate || isReducedMotion();

    detailEl.animate(
      [
        { clipPath: fromClip, transform: 'rotate(-4.5deg)' },
        { clipPath: 'inset(0px 0px 0px 0px round 0px)', transform: 'rotate(0deg)' },
      ],
      {
        duration: fast ? 1 : 1050,
        easing: 'cubic-bezier(.76,0,.18,1)',
        fill: 'both',
      }
    );

    detailMasks.forEach((el, i) => {
      el.getAnimations().forEach((a) => a.cancel());
      el.animate(
        [
          { transform: 'translateY(110%)' },
          { transform: 'translateY(0)' },
        ],
        {
          duration: fast ? 1 : 900,
          delay: fast ? 0 : 620 + i * 75,
          easing: 'cubic-bezier(.2,.8,.2,1)',
          fill: 'both',
        }
      );
    });

    startInkBleed(fast);
    setCursorMode('default');
    if (detailCloseBtn) {
      setTimeout(() => {
        if (isOpen && !destroyed) detailCloseBtn.focus();
      }, fast ? 10 : 350);
    }
  }

  function closeBookInternal(onClosed) {
    if (!isOpen) {
      if (typeof onClosed === 'function') onClosed();
      return;
    }
    isOpen = false;
    cancelAnimationFrame(inkRaf);
    clearTimeout(closeTimer);

    const cRect = container.getBoundingClientRect();
    const rect = getActiveCoverRect(cRect);
    const top = Math.max(0, rect.top);
    const left = Math.max(0, rect.left);
    const right = Math.max(0, cRect.width - rect.right);
    const bottom = Math.max(0, cRect.height - rect.bottom);
    const toClip = `inset(${top}px ${right}px ${bottom}px ${left}px round 3px)`;
    const originX = rect.left + rect.width / 2;
    const originY = rect.top + rect.height / 2;
    detailEl.style.transformOrigin = `${originX}px ${originY}px`;

    const fast = isReducedMotion();
    const duration = fast ? 1 : 850;
    let finished = false;

    const finishClose = () => {
      if (finished) return;
      finished = true;
      clearTimeout(closeTimer);
      if (!isOpen && !destroyed && detailEl) {
        detailEl.classList.remove('is-open');
        detailEl.setAttribute('aria-hidden', 'true');
        detailEl.inert = true;
        detailEl.getAnimations().forEach((a) => a.cancel());
        detailMasks.forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
        setBackgroundInert(false);
        document.documentElement.classList.remove('is-detail-locked');
        if (onSheetOpenChange) {
          onSheetOpenChange(false, detailEl, detailFooterSlotEl);
        }
      }
      if (!destroyed && typeof onClosed === 'function') {
        onClosed();
      }
    };

    detailEl.getAnimations().forEach((a) => a.cancel());
    const anim = detailEl.animate(
      [
        { clipPath: 'inset(0px 0px 0px 0px round 0px)', transform: 'rotate(0deg)' },
        { clipPath: toClip, transform: 'rotate(-4.5deg)' },
      ],
      {
        duration,
        easing: 'cubic-bezier(.76,0,.18,1)',
        fill: 'both',
      }
    );

    closeTimer = setTimeout(finishClose, duration + 60);
    anim.finished
      .then(finishClose)
      .catch(finishClose);
  }

  function triggerOpen(book, immediate = false) {
    if (onRequestOpenBook) {
      onRequestOpenBook(book);
    } else {
      openBookInternal(book, immediate);
    }
  }

  function triggerClose() {
    if (onRequestCloseBook) {
      onRequestCloseBook();
    } else {
      closeBookInternal();
    }
  }

  function jumpToBookIdx(idx) {
    const curIdx = mod(Math.round(T), N);
    let step = idx - curIdx;
    if (step > N / 2) step -= N;
    if (step < -N / 2) step += N;
    T = Math.round(T) + step;
  }

  // Initial render
  measure();
  renderCaption(active, 1);
  fillDetailTexts(books[active]);

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (!destroyed) syncDecadeIndicator();
    }).catch(() => {});
  }

  if (initialBookId) {
    const found = books.find((b) => b.id === initialBookId);
    if (found) {
      requestAnimationFrame(() => {
        if (!destroyed) openBookInternal(found, true);
      });
    }
  }

  // Event listeners
  const onResize = () => {
    measure();
  };

  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => {
      if (!destroyed) measure();
    });
    resizeObserver.observe(container);
  }

  const onWindowScroll = () => {
    if (window.scrollY > 1) {
      wasScrolled = true;
    }
  };

  const onPointerMove = (e) => {
    stageRect = container.getBoundingClientRect();
    mx = e.clientX - stageRect.left;
    my = e.clientY - stageRect.top;
    if (e.pointerType !== 'touch') {
      setCursorTarget(e.clientX, e.clientY);
    }
    if (isDragging) {
      const dx = e.clientX - dragStartX;
      const dy = e.clientY - dragStartY;
      if (!dragMoved && Math.abs(dx) > 6 && Math.abs(dx) >= Math.abs(dy)) {
        dragMoved = true;
      }
      if (dragMoved) {
        T = dragT0 - dx / (ws + gap);
      }
    }
  };

  const onShelfPointerDown = (e) => {
    if (isOpen || e.button > 0) return;
    isDragging = true;
    dragMoved = false;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragT0 = T;
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    isDragging = false;
    if (dragMoved) {
      T = Math.round(T);
      setTimeout(() => {
        dragMoved = false;
      }, 40);
    }
  };

  const onWheel = (e) => {
    if (isOpen) return;
    const now = performance.now();

    if (window.scrollY > 1) {
      wasScrolled = true;
      lastScrollWheelTs = now;
      return;
    }

    if (wasScrolled) {
      if (now - lastScrollWheelTs < 300) {
        lastScrollWheelTs = now;
        return;
      }
      wasScrolled = false;
    }

    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (delta === 0) return;

    const curRound = Math.round(T);
    const loopBase = Math.floor(curRound / N) * N;
    const loopEnd = loopBase + N - 1;

    if (delta > 0 && curRound >= loopEnd && T >= loopEnd - 0.1) {
      T = loopEnd;
      wasScrolled = true;
      lastScrollWheelTs = now;
      return;
    }

    if (delta < 0 && curRound <= loopBase && T <= loopBase + 0.1) {
      T = loopBase;
      return;
    }

    e.preventDefault();
    const step = (delta / (ws + gap)) * 0.5;
    T = Math.max(loopBase, Math.min(loopEnd, T + step));
    clearTimeout(wheelTimer);
    wheelTimer = setTimeout(() => {
      T = Math.max(loopBase, Math.min(loopEnd, Math.round(T)));
    }, 160);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      triggerClose();
      return;
    }
    if (isOpen) return;
    const activeEl = document.activeElement;
    if (
      activeEl &&
      activeEl !== document.body &&
      !container.contains(activeEl)
    ) {
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      T = Math.round(T) - 1;
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      T = Math.round(T) + 1;
    } else if (e.key === 'Enter' && (activeEl === document.body || shelfEl.contains(activeEl))) {
      e.preventDefault();
      triggerOpen(books[active], false);
    }
  };

  const onPrevClick = () => {
    if (!isOpen) T = Math.round(T) - 1;
  };
  const onNextClick = () => {
    if (!isOpen) T = Math.round(T) + 1;
  };
  const onPlayClick = () => {
    if (!isOpen) triggerOpen(books[active], false);
  };
  const onCloseClick = () => {
    triggerClose();
  };

  const tabHandlers = tabBtns.map((btn) => {
    const handler = () => {
      if (isOpen) return;
      const dec = btn.dataset.decade;
      if (dec === 'all') {
        jumpToBookIdx(0);
        return;
      }
      const targetDec = Number(dec);
      const firstIdx = books.findIndex((b) => getDecadeForYear(b.year) === targetDec);
      if (firstIdx >= 0) jumpToBookIdx(firstIdx);
    };
    btn.addEventListener('click', handler);
    return { btn, handler };
  });

  const enterBtn = () => setCursorMode('btn');
  const leaveBtn = () => setCursorMode('default');

  const btnElements = [prevBtn, nextBtn, playRingEl, moreCueEl, detailCloseBtn, detailReserveEl, ...tabBtns].filter(Boolean);
  btnElements.forEach((el) => {
    el.addEventListener('pointerenter', enterBtn);
    el.addEventListener('pointerleave', leaveBtn);
  });

  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);
  window.addEventListener('scroll', onWindowScroll, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
  window.addEventListener('keydown', onKeyDown);
  shelfEl.addEventListener('pointerdown', onShelfPointerDown);
  shelfEl.addEventListener('wheel', onWheel, { passive: false });
  if (prevBtn) prevBtn.addEventListener('click', onPrevClick);
  if (nextBtn) nextBtn.addEventListener('click', onNextClick);
  if (playRingEl) playRingEl.addEventListener('click', onPlayClick);
  if (detailCloseBtn) detailCloseBtn.addEventListener('click', onCloseClick);

  let lastNow = performance.now();

  const frame = (now) => {
    if (destroyed) return;
    const dt = Math.min(0.05, Math.max(0, (now - lastNow) / 1000));
    lastNow = now;
    const reduced = isReducedMotion();

    if (reduced) {
      s = T;
    } else {
      const kSpring = isDragging ? 18 : 5.2;
      s += (T - s) * (1 - Math.exp(-kSpring * dt));
      if (Math.abs(T - s) < 1e-4) s = T;
    }

    if (s > N * 4 || s < -N * 4) {
      const loops = Math.trunc(s / N) - 1;
      s -= loops * N;
      T -= loops * N;
      dragT0 -= loops * N;
    }

    const nextActive = mod(Math.round(s), N);
    if (nextActive !== active) {
      const dir = T - s >= 0 ? 1 : -1;
      active = nextActive;
      renderCaption(active, dir);
      if (isOpen) {
        fillDetailTexts(books[active]);
      }
    }

    const settled = Math.abs(T - s) < 0.3;
    onCover =
      !isOpen &&
      settled &&
      Math.abs(mx - W / 2) <= 0.55 * d &&
      Math.abs(my - shelfCy) <= 0.55 * H;

    const targetTiltY = onCover
      ? ((mx - W / 2) / (0.55 * d)) * 9
      : ((mx - W / 2) / Math.max(1, W)) * 5;
    const targetTiltX = onCover ? -((my - shelfCy) / (H / 2)) * 6 : 0;
    const tiltAlpha = reduced ? 1 : 1 - Math.exp(-7 * dt);
    tiltY += (targetTiltY - tiltY) * tiltAlpha;
    tiltX += (targetTiltX - tiltX) * tiltAlpha;

    if (!isOpen) {
      if (onCover) {
        setCursorMode('open');
      } else if (hover >= 0 && Math.abs(relIndex(hover, s)) > 0.5) {
        setCursorMode('spine');
      }
    }

    if (playRingEl) {
      const playScale = isOpen ? 0 : smoothstep(Math.max(0, 1 - Math.abs(T - s) * 3));
      playRingEl.style.left = `${W / 2 - 0.5 * d - 6}px`;
      playRingEl.style.top = `${shelfCy + 0.36 * H}px`;
      playRingEl.style.transform = `translate(-50%, -50%) scale(${playScale})`;
      playRingEl.style.pointerEvents = playScale > 0.2 ? 'auto' : 'none';
    }

    const liftAlpha = reduced ? 1 : 1 - Math.exp(-12 * dt);
    for (const tape of tapes) {
      const r = relIndex(tape.v, s);
      const x = F(r);
      if (Math.abs(x) > W / 2 + 1.5 * d) {
        tape.el.style.visibility = 'hidden';
        continue;
      }
      tape.el.style.visibility = 'visible';

      const o = smoothstep(Math.max(0, 1 - Math.abs(r)));
      const liftTarget = hover === tape.v && Math.abs(r) > 0.5 ? 1 : 0;
      tape.lift += (liftTarget - tape.lift) * liftAlpha;

      const rotY = -90 * o + tiltY * o;
      const rotX = tiltX * o;
      const rotZ = -4.5 * o;
      const z = o * 0.2 * H;
      const y = -o * 0.025 * H - tape.lift * 0.045 * H;

      tape.el.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateZ(${rotZ}deg) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      tape.el.style.zIndex = String(Math.round(100 - Math.abs(r) * 4));

      const spShade = o * 0.55;
      const cvShade = (1 - o) * 0.5;
      tape.sp.style.setProperty('--shade', spShade.toFixed(3));
      tape.cv.style.setProperty('--shade', cvShade.toFixed(3));
    }

    mainRaf = requestAnimationFrame(frame);
  };

  mainRaf = requestAnimationFrame(frame);

  return {
    setLocale(nextLocale, nextStrings) {
      locale = nextLocale;
      strings = nextStrings;
      renderCaption(active, 1);
      if (isOpen && currentDetailBook) {
        fillDetailTexts(currentDetailBook);
      } else {
        fillDetailTexts(books[active]);
      }
      tapes.forEach((t) => {
        const b = books[t.v % N];
        t.el.setAttribute('aria-label', b.title[locale] || b.title.en);
      });
      requestAnimationFrame(() => {
        if (!destroyed) syncDecadeIndicator();
      });
    },
    goTo(bookId) {
      const idx = books.findIndex((b) => b.id === bookId);
      if (idx >= 0) jumpToBookIdx(idx);
    },
    goToDecade(decade) {
      const idx = books.findIndex((b) => getDecadeForYear(b.year) === decade);
      if (idx >= 0) jumpToBookIdx(idx);
    },
    openBook(bookId, immediate = false) {
      const book = books.find((b) => b.id === bookId) || books[active];
      openBookInternal(book, immediate);
    },
    closeBook(onClosed) {
      closeBookInternal(onClosed);
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(mainRaf);
      cancelAnimationFrame(inkRaf);
      clearTimeout(wheelTimer);
      clearTimeout(closeTimer);
      if (resizeObserver) resizeObserver.disconnect();
      setBackgroundInert(false);
      document.documentElement.classList.remove('is-detail-locked');
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.removeEventListener('scroll', onWindowScroll);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      window.removeEventListener('keydown', onKeyDown);
      shelfEl.removeEventListener('pointerdown', onShelfPointerDown);
      shelfEl.removeEventListener('wheel', onWheel);
      if (prevBtn) prevBtn.removeEventListener('click', onPrevClick);
      if (nextBtn) nextBtn.removeEventListener('click', onNextClick);
      if (playRingEl) playRingEl.removeEventListener('click', onPlayClick);
      if (detailCloseBtn) detailCloseBtn.removeEventListener('click', onCloseClick);
      tabHandlers.forEach(({ btn, handler }) => btn.removeEventListener('click', handler));
      btnElements.forEach((el) => {
        el.removeEventListener('pointerenter', enterBtn);
        el.removeEventListener('pointerleave', leaveBtn);
      });
      tapeListeners.forEach(({ el, onEnter, onLeave, onClick }) => {
        el.removeEventListener('pointerenter', onEnter);
        el.removeEventListener('pointerleave', onLeave);
        el.removeEventListener('click', onClick);
      });
      stageEl.innerHTML = '';
      setCursorMode('default');
    },
  };
}
