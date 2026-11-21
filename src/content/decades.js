export const DECADES = [
  { key: 'all', decade: null },
  { key: '1950', decade: 1950 },
  { key: '1960', decade: 1960 },
  { key: '1970', decade: 1970 },
  { key: '1980', decade: 1980 },
];

export function getDecadeForYear(year) {
  return Math.floor(year / 10) * 10;
}
