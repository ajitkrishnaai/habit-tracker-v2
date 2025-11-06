import React from 'react';
import {
  Sunrise,
  TrendingUp,
  Calendar,
  CheckCircle,
  AlertCircle,
  Info,
  type LucideIcon,
} from 'lucide-react';

/**
 * Icon name to Lucide component mapping
 * Add more icons here as needed throughout the app
 */
const iconMap: Record<string, LucideIcon> = {
  sunrise: Sunrise,
  'trending-up': TrendingUp,
  calendar: Calendar,
  'check-circle': CheckCircle,
  'alert-circle': AlertCircle,
  info: Info,
};

interface IconProps {
  name: keyof typeof iconMap;
  size?: number; // Size in pixels (default: 24)
  color?: string; // CSS color value (default: currentColor)
  className?: string;
  strokeWidth?: number; // Stroke width for the icon (default: 2)
}

/**
 * Icon - Wrapper component for Lucide React icons
 *
 * Provides consistent sizing, coloring, and styling across the app.
 * Supports all Lucide icon properties while maintaining a simple API.
 *
 * Usage:
 *   <Icon name="sunrise" size={32} color="#D4745E" />
 *   <Icon name="check-circle" size={20} />
 */
export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = 'currentColor',
  className = '',
  strokeWidth = 2,
}) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap. Add it to Icon.tsx.`);
    return null;
  }

  return (
    <IconComponent
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true" // Icons are decorative by default
    />
  );
};

export default Icon;
