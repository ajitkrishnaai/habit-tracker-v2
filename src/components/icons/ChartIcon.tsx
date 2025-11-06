/**
 * ChartIcon Component
 * Task 1.14: Warm chart/bar icon for completion percentage display
 * SVG with warm colors
 */

interface ChartIconProps {
  size?: number;
  className?: string;
}

export const ChartIcon = ({ size = 24, className = '' }: ChartIconProps): JSX.Element => {
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
      <rect
        x="3"
        y="13"
        width="4"
        height="8"
        rx="1"
        fill="#8B9A7E"
        opacity="0.8"
      />
      <rect
        x="10"
        y="8"
        width="4"
        height="13"
        rx="1"
        fill="#D4745E"
        opacity="0.9"
      />
      <rect
        x="17"
        y="3"
        width="4"
        height="18"
        rx="1"
        fill="#E89C5A"
      />
    </svg>
  );
};
