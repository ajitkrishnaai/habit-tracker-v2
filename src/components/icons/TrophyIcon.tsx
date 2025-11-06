/**
 * TrophyIcon Component
 * Task 1.14: Warm trophy icon for longest streak display
 * SVG with warm gold (#E89C5A)
 */

interface TrophyIconProps {
  size?: number;
  className?: string;
}

export const TrophyIcon = ({ size = 24, className = '' }: TrophyIconProps): JSX.Element => {
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
      <path
        d="M6 9H5C3.895 9 3 8.105 3 7V5C3 3.895 3.895 3 5 3H6M18 9H19C20.105 9 21 8.105 21 7V5C21 3.895 20.105 3 19 3H18"
        stroke="#E89C5A"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 3H17V9C17 11.761 14.761 14 12 14C9.239 14 7 11.761 7 9V3Z"
        fill="#E89C5A"
        opacity="0.9"
      />
      <path
        d="M9 21H15M12 14V21"
        stroke="#D4745E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="8"
        y="19"
        width="8"
        height="3"
        rx="1"
        fill="#E89C5A"
      />
    </svg>
  );
};
