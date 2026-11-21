export function PaperGrain() {
  return (
    <div className="paper-grain" aria-hidden="true">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="mlibrary-grain-filter" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.85"
              numOctaves="3"
              stitchTiles="stitch"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.45  0 0 0 0 0.42  0 0 0 0 0.38  0 0 0 0.22 0"
            />
          </filter>
          <pattern id="mlibrary-grain-pattern" width="220" height="220" patternUnits="userSpaceOnUse">
            <rect width="220" height="220" filter="url(#mlibrary-grain-filter)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mlibrary-grain-pattern)" />
      </svg>
    </div>
  );
}
