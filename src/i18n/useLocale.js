import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DEFAULT_LOCALE, LOCALES, STORAGE_KEY, getDictionary } from './index.js';

const LocaleContext = createContext(null);

function readInitialLocale() {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;
  try {
    const params = new URLSearchParams(window.location.search);
    const paramLang = params.get('lang');
    if (paramLang && LOCALES.includes(paramLang)) {
      return paramLang;
    }
  } catch {
    // ignore URL parsing errors
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && LOCALES.includes(saved)) {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(readInitialLocale);

  const setLocale = useCallback((nextLocale) => {
    if (!LOCALES.includes(nextLocale)) return;
    setLocaleState(nextLocale);
    try {
      window.localStorage.setItem(STORAGE_KEY, nextLocale);
    } catch {
      // ignore storage errors
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
    const dict = getDictionary(locale);
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) {
      descMeta.setAttribute('content', dict.meta.description);
    }
  }, [locale]);

  const value = useMemo(() => {
    const t = getDictionary(locale);
    return { locale, setLocale, t };
  }, [locale, setLocale]);

  return createElement(LocaleContext.Provider, { value }, children);
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used inside LocaleProvider');
  }
  return ctx;
}
