import React from 'react';

interface AmaraDayLogoProps {
  size?: number; // Font size in pixels (default: 32)
  variant?: 'full-color' | 'monochrome';
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

/**
 * AmaraDayLogo - Text-based logo component for Amara.day branding
 *
 * Features:
 * - "Amara" in DM Sans Bold (terracotta #D4745E)
 * - ".day" in DM Sans Medium (warm gray #7A7166)
 * - Scalable via size prop
 * - Supports full-color and monochrome variants
 * - Horizontal (default) and vertical layouts
 *
 * Note: Welcome Page uses uppercase "AMARA DAY" text directly (not this component).
 * See PRD #0005 for Welcome Page-specific branding.
 */
export const AmaraDayLogo: React.FC<AmaraDayLogoProps> = ({
  size = 32,
  variant = 'full-color',
  layout = 'horizontal',
  className = '',
}) => {
  const isMonochrome = variant === 'monochrome';
  const isVertical = layout === 'vertical';

  const amaraColor = isMonochrome ? 'currentColor' : '#567347'; // moss-700
  const dayColor = isMonochrome ? 'currentColor' : '#8B8D7F'; // stone-600

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    flexDirection: isVertical ? 'column' : 'row',
    alignItems: isVertical ? 'flex-start' : 'baseline',
    gap: isVertical ? '0' : '0.1em',
    fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: `${size}px`,
    lineHeight: 1.2,
  };

  const amaraStyle: React.CSSProperties = {
    fontWeight: 700, // Bold
    color: amaraColor,
    letterSpacing: '-0.03em',
  };

  const dayStyle: React.CSSProperties = {
    fontWeight: 500, // Medium
    color: dayColor,
    letterSpacing: '-0.01em',
  };

  return (
    <div className={`amara-day-logo ${className}`} style={containerStyle}>
      <span style={amaraStyle}>Amara</span>
      <span style={dayStyle}>.day</span>
    </div>
  );
};

export default AmaraDayLogo;
