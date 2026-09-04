export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 500 220"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Cero"
      className={className}
    >
      <rect x="0" y="0" width="500" height="220" rx="6" fill="#000000" />
      <rect
        x="16"
        y="16"
        width="468"
        height="188"
        fill="none"
        stroke="#ffffff"
        strokeWidth="10"
      />
      <text
        x="250"
        y="149"
        textAnchor="middle"
        fontFamily="Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="92"
        letterSpacing="4"
        fill="#ffffff"
      >
        CERO
      </text>
    </svg>
  );
}
