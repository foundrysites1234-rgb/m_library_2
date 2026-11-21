import './footer.css';

export function HeroFooterBlend({ variant = 'hero' }) {
  return (
    <div
      className={`hero-footer-blend${variant === 'sheet' ? ' is-sheet' : ''}`}
      aria-hidden="true"
    />
  );
}
