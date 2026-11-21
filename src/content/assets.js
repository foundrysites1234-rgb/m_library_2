export const SHEET = {
  covers: [
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010644_837e04ca-2418-45c1-b8e0-0233265c4cd5.png&w=1744&q=85',
    1744,
    2336,
  ],
  spines: [
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010738_a3e47ead-18f2-4974-9468-06d16a25edc5.png&w=2688&q=85',
    2688,
    1152,
  ],
  fix: [
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_010831_3ebb874b-93dc-433e-87ed-6299aba720f0.png&w=1520&q=85',
    1520,
    2688,
  ],
  fix2: [
    'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261029_092020_f96bc094-db7b-46de-9298-074a24e0a3b8.png&w=1520&q=85',
    1520,
    2688,
  ],
};

export const CROP = {
  'spine-valley': ['spines', 266, 31, 189, 1089],
  'cover-valley': ['covers', 497, 72, 344, 659],
  'spine-bluehour': ['spines', 492, 31, 189, 1089],
  'cover-bluehour': ['covers', 914, 72, 342, 659],
  'spine-river': ['fix', 197, 54, 324, 2566],
  'cover-river': ['covers', 1332, 72, 344, 659],
  'spine-summer': ['spines', 937, 31, 188, 1089],
  'cover-summer': ['covers', 74, 813, 344, 676],
  'spine-green': ['spines', 1157, 31, 185, 1090],
  'cover-green': ['covers', 497, 815, 344, 674],
  'spine-noon': ['spines', 44, 32, 184, 1088],
  'cover-noon': ['covers', 74, 72, 347, 659],
  'spine-observer': ['fix2', 371, 15, 349, 2655],
  'cover-observer': ['covers', 915, 815, 342, 675],
  'spine-birds': ['spines', 1573, 31, 183, 1089],
  'cover-birds': ['covers', 1331, 815, 345, 675],
  'spine-storm': ['fix2', 808, 15, 347, 2656],
  'cover-storm': ['covers', 74, 1571, 345, 681],
  'spine-tide': ['spines', 2012, 31, 188, 1089],
  'cover-tide': ['covers', 496, 1577, 343, 678],
  'spine-war': ['spines', 2236, 31, 189, 1089],
  'cover-war': ['covers', 913, 1579, 343, 676],
  'spine-door': ['spines', 2462, 31, 188, 1089],
  'cover-door': ['covers', 1331, 1579, 344, 677],
};

export const FOOTER_VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260901_122529_931c22c8-8d2d-47c0-ad51-b97f56a91e42.mp4';

export const FOOTER_POSTER_URL =
  'https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/4f690bd1-881a-4192-82f2-d714d34c8fb9.png';

let preloaded = false;

export function preloadSheets() {
  if (preloaded || typeof Image === 'undefined') return;
  preloaded = true;
  Object.values(SHEET).forEach(([url]) => {
    const img = new Image();
    img.src = url;
  });
}

export function applyCropBackground(el, key) {
  const crop = CROP[key];
  if (!crop) return;
  const [sheetId, x, y, w, h] = crop;
  const [url, W, H] = SHEET[sheetId];
  el.style.backgroundImage = `url("${url}")`;
  el.style.backgroundSize = `${(W / w) * 100}% ${(H / h) * 100}%`;
  el.style.backgroundPosition = `${(x / (W - w)) * 100}% ${(y / (H - h)) * 100}%`;
  el.style.backgroundRepeat = 'no-repeat';
}

export function applyPosterImage(svgImageEl, bookId) {
  const crop = CROP[`cover-${bookId}`];
  if (!crop || !svgImageEl) return;
  const [sheetId, x, y, w, h] = crop;
  const [url, W, H] = SHEET[sheetId];
  svgImageEl.setAttribute('href', url);
  svgImageEl.setAttribute('x', String((-x * 474) / w));
  svgImageEl.setAttribute('y', String((-y * 900) / h));
  svgImageEl.setAttribute('width', String((W * 474) / w));
  svgImageEl.setAttribute('height', String((H * 900) / h));
}
