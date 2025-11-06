/**
 * FlameIcon Component
 * Task 1.14: Warm flame icon for current streak display
 * SVG with warm gradient (terracotta to sunset)
 */

interface FlameIconProps {
  size?: number;
  className?: string;
}

export const FlameIcon = ({ size = 24, className = '' }: FlameIconProps): JSX.Element => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="flameGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#D4745E', stopOpacity: 1 }} /> {/* terracotta */}
          <stop offset="100%" style={{ stopColor: '#E89C5A', stopOpacity: 1 }} /> {/* sunset */}
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 2 7 6 7 11C7 14.866 9.134 18 12 18C14.866 18 17 14.866 17 11C17 6 12 2 12 2Z"
        fill="url(#flameGradient)"
      />
      <path
        d="M12 22C12 22 10 20 10 17.5C10 15.567 10.895 14 12 14C13.105 14 14 15.567 14 17.5C14 20 12 22 12 22Z"
        fill="#E89C5A"
        opacity="0.8"
      />
    </svg>
  );
};
