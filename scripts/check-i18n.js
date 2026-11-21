import en from '../src/i18n/en.js';
import mn from '../src/i18n/mn.js';

const ALLOW_NON_CYRILLIC = new Set(['shelf.social']);
const CYRILLIC_RE = /[\u0400-\u04FF]/;

function flatten(obj, prefix = '', out = new Map()) {
  if (Array.isArray(obj)) {
    obj.forEach((item, idx) => {
      flatten(item, `${prefix}[${idx}]`, out);
    });
    return out;
  }
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      const next = prefix ? `${prefix}.${key}` : key;
      flatten(obj[key], next, out);
    }
    return out;
  }
  out.set(prefix, obj);
  return out;
}

const enMap = flatten(en);
const mnMap = flatten(mn);

const errors = [];

for (const key of enMap.keys()) {
  if (!mnMap.has(key)) {
    errors.push(`Missing key in mn.js: ${key}`);
  }
}

for (const key of mnMap.keys()) {
  if (!enMap.has(key)) {
    errors.push(`Extra key in mn.js (missing in en.js): ${key}`);
  }
}

for (const [key, val] of mnMap.entries()) {
  if (typeof val === 'string' && !ALLOW_NON_CYRILLIC.has(key)) {
    if (!CYRILLIC_RE.test(val)) {
      errors.push(`Mongolian value lacks Cyrillic character at "${key}": ${val}`);
    }
  }
}

if (errors.length > 0) {
  console.error('i18n check failed:');
  for (const err of errors) {
    console.error(` - ${err}`);
  }
  process.exit(1);
}

console.log(`check:i18n ok (${enMap.size} keys verified)`);
