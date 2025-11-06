/**
 * Skeleton Component
 * Task 2.2 - Skeleton loading component with shimmer animation
 *
 * Features:
 * - Multiple variants: text, circle, rect
 * - Shimmer animation
 * - Customizable width and height
 * - Warm color palette
 */

import './Skeleton.css';

export interface SkeletonProps {
  /** Width of skeleton (CSS value like "100px", "50%", etc.) */
  width?: string | number;
  /** Height of skeleton (CSS value like "20px", "3rem", etc.) */
  height?: string | number;
  /** Variant type */
  variant?: 'text' | 'circle' | 'rect';
  /** Optional className for additional styling */
  className?: string;
}

export const Skeleton = ({
  width,
  height,
  variant = 'rect',
  className = '',
}: SkeletonProps): JSX.Element => {
  // Convert numeric values to px
  const widthValue = typeof width === 'number' ? `${width}px` : width;
  const heightValue = typeof height === 'number' ? `${height}px` : height;

  // Build inline styles
  const styles: React.CSSProperties = {};
  if (widthValue) styles.width = widthValue;
  if (heightValue) styles.height = heightValue;

  // Build className string
  const classNames = [
    'skeleton',
    `skeleton--${variant}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div
      className={classNames}
      style={styles}
      aria-hidden="true"
      data-testid="skeleton"
    />
  );
};
