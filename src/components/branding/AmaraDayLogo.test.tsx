/**
 * AmaraDayLogo Component Tests
 *
 * Tests for branding logo component with variants and layouts.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AmaraDayLogo } from './AmaraDayLogo';

describe('AmaraDayLogo', () => {
  it('should render logo with "Amara" and ".day" text', () => {
    const { container } = render(<AmaraDayLogo />);

    expect(screen.getByText('Amara')).toBeInTheDocument();
    expect(screen.getByText('.day')).toBeInTheDocument();
    expect(container.querySelector('.amara-day-logo')).toBeInTheDocument();
  });

  describe('Size Prop', () => {
    it('should render with default size (32px)', () => {
      const { container } = render(<AmaraDayLogo />);

      const logo = container.querySelector('.amara-day-logo') as HTMLElement;
      expect(logo).toHaveStyle({ fontSize: '32px' });
    });

    it('should render with custom size (64px)', () => {
      const { container } = render(<AmaraDayLogo size={64} />);

      const logo = container.querySelector('.amara-day-logo') as HTMLElement;
      expect(logo).toHaveStyle({ fontSize: '64px' });
    });

    it('should render with small size (16px)', () => {
      const { container } = render(<AmaraDayLogo size={16} />);

      const logo = container.querySelector('.amara-day-logo') as HTMLElement;
      expect(logo).toHaveStyle({ fontSize: '16px' });
    });
  });

  describe('Variant Prop', () => {
    it('should render full-color variant by default', () => {
      render(<AmaraDayLogo />);

      const amara = screen.getByText('Amara');
      const day = screen.getByText('.day');

      // full-color uses specific moss-700 and stone-600 colors
      expect(amara).toHaveStyle({ color: '#567347' }); // moss-700
      expect(day).toHaveStyle({ color: '#8B8D7F' }); // stone-600
    });

    it('should render full-color variant when explicitly specified', () => {
      render(<AmaraDayLogo variant="full-color" />);

      const amara = screen.getByText('Amara');
      const day = screen.getByText('.day');

      expect(amara).toHaveStyle({ color: '#567347' });
      expect(day).toHaveStyle({ color: '#8B8D7F' });
    });

    it('should render monochrome variant', () => {
      render(<AmaraDayLogo variant="monochrome" />);

      const amara = screen.getByText('Amara');
      const day = screen.getByText('.day');

      // monochrome uses currentColor for both
      expect(amara).toHaveStyle({ color: 'currentColor' });
      expect(day).toHaveStyle({ color: 'currentColor' });
    });
  });

  describe('Layout Prop', () => {
    it('should render horizontal layout by default', () => {
      const { container } = render(<AmaraDayLogo />);

      const logo = container.querySelector('.amara-day-logo') as HTMLElement;
      expect(logo).toHaveStyle({
        flexDirection: 'row',
        alignItems: 'baseline'
      });
    });

    it('should render horizontal layout when explicitly specified', () => {
      const { container } = render(<AmaraDayLogo layout="horizontal" />);

      const logo = container.querySelector('.amara-day-logo') as HTMLElement;
      expect(logo).toHaveStyle({
        flexDirection: 'row',
        alignItems: 'baseline'
      });
    });

    it('should render vertical layout', () => {
      const { container } = render(<AmaraDayLogo layout="vertical" />);

      const logo = container.querySelector('.amara-day-logo') as HTMLElement;
      expect(logo).toHaveStyle({
        flexDirection: 'column',
        alignItems: 'flex-start'
      });
    });
  });

  describe('ClassName Prop', () => {
    it('should apply custom className', () => {
      const { container } = render(<AmaraDayLogo className="custom-logo" />);

      const logo = container.querySelector('.amara-day-logo');
      expect(logo).toHaveClass('amara-day-logo');
      expect(logo).toHaveClass('custom-logo');
    });

    it('should work without custom className', () => {
      const { container } = render(<AmaraDayLogo />);

      const logo = container.querySelector('.amara-day-logo');
      expect(logo).toHaveClass('amara-day-logo');
      expect(logo?.className).toBe('amara-day-logo ');
    });
  });

  describe('Typography Styles', () => {
    it('should apply correct font weights', () => {
      render(<AmaraDayLogo />);

      const amara = screen.getByText('Amara');
      const day = screen.getByText('.day');

      expect(amara).toHaveStyle({ fontWeight: 700 }); // Bold
      expect(day).toHaveStyle({ fontWeight: 500 }); // Medium
    });

    it('should apply correct letter spacing via inline styles', () => {
      const { container } = render(<AmaraDayLogo />);

      const amara = container.querySelector('span:nth-child(1)') as HTMLElement;
      const day = container.querySelector('span:nth-child(2)') as HTMLElement;

      // Check inline style attributes directly (jsdom doesn't compute letter-spacing)
      expect(amara.style.letterSpacing).toBe('-0.03em');
      expect(day.style.letterSpacing).toBe('-0.01em');
    });

    it('should use DM Sans font family', () => {
      const { container } = render(<AmaraDayLogo />);

      const logo = container.querySelector('.amara-day-logo') as HTMLElement;
      expect(logo).toHaveStyle({
        fontFamily: 'DM Sans, -apple-system, BlinkMacSystemFont, sans-serif'
      });
    });
  });

  describe('Combined Props', () => {
    it('should handle vertical layout with monochrome variant', () => {
      const { container } = render(
        <AmaraDayLogo layout="vertical" variant="monochrome" />
      );

      const logo = container.querySelector('.amara-day-logo') as HTMLElement;
      const amara = screen.getByText('Amara');
      const day = screen.getByText('.day');

      expect(logo).toHaveStyle({ flexDirection: 'column' });
      expect(amara).toHaveStyle({ color: 'currentColor' });
      expect(day).toHaveStyle({ color: 'currentColor' });
    });

    it('should handle custom size with vertical layout', () => {
      const { container } = render(
        <AmaraDayLogo size={48} layout="vertical" />
      );

      const logo = container.querySelector('.amara-day-logo') as HTMLElement;
      expect(logo).toHaveStyle({
        fontSize: '48px',
        flexDirection: 'column'
      });
    });

    it('should handle all props together', () => {
      const { container } = render(
        <AmaraDayLogo
          size={40}
          variant="monochrome"
          layout="vertical"
          className="nav-logo"
        />
      );

      const logo = container.querySelector('.amara-day-logo') as HTMLElement;
      const amara = screen.getByText('Amara');

      expect(logo).toHaveStyle({
        fontSize: '40px',
        flexDirection: 'column'
      });
      expect(amara).toHaveStyle({ color: 'currentColor' });
      expect(logo).toHaveClass('nav-logo');
    });
  });

  describe('Snapshot Tests', () => {
    it('should match snapshot for default props', () => {
      const { container } = render(<AmaraDayLogo />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for vertical layout', () => {
      const { container } = render(<AmaraDayLogo layout="vertical" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for monochrome variant', () => {
      const { container } = render(<AmaraDayLogo variant="monochrome" />);
      expect(container.firstChild).toMatchSnapshot();
    });

    it('should match snapshot for custom size', () => {
      const { container } = render(<AmaraDayLogo size={64} />);
      expect(container.firstChild).toMatchSnapshot();
    });
  });
});
