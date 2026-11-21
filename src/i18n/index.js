import en from './en.js';
import mn from './mn.js';

export const LOCALES = ['mn', 'en'];
export const DEFAULT_LOCALE = 'mn';
export const STORAGE_KEY = 'mlibrary.locale';

const dictionaries = { en, mn };

function getByPath(obj, path) {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

function mergeWithFallback(primary, fallback) {
  if (Array.isArray(fallback)) {
    return Array.isArray(primary) ? primary : fallback;
  }
  if (fallback && typeof fallback === 'object') {
    const out = {};
    for (const key of Object.keys(fallback)) {
      out[key] = mergeWithFallback(primary ? primary[key] : undefined, fallback[key]);
    }
    return out;
  }
  return primary !== undefined ? primary : fallback;
}

export function getDictionary(locale) {
  const chosen = dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
  return mergeWithFallback(chosen, en);
}

export function translate(locale, key, vars) {
  const dict = dictionaries[locale] || dictionaries[DEFAULT_LOCALE];
  let value = getByPath(dict, key);
  if (value === undefined) {
    value = getByPath(en, key);
  }
  if (typeof value !== 'string') return value;
  if (!vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, name) => (vars[name] !== undefined ? String(vars[name]) : `{${name}}`));
}

export function formatDecade(locale, decade) {
  return translate(locale, 'shelf.decade', { d: decade });
}
