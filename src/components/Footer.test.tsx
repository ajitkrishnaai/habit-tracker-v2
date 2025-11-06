/**
 * Footer Component Tests
 *
 * Tests for footer with legal links and copyright notice.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from './Footer';

// Wrapper component to provide router context
const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Footer', () => {
  describe('Basic Rendering', () => {
    it('should render footer element with contentinfo role', () => {
      render(<Footer />, { wrapper: Wrapper });

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
      expect(footer.tagName).toBe('FOOTER');
    });

    it('should have proper CSS classes (Task 2.14)', () => {
      const { container } = render(<Footer />, { wrapper: Wrapper });

      expect(container.querySelector('.footer')).toBeInTheDocument();
      expect(container.querySelector('.footer-container')).toBeInTheDocument();
      expect(container.querySelector('.footer-branding')).toBeInTheDocument();
      expect(container.querySelector('.footer-nav')).toBeInTheDocument();
      expect(container.querySelector('.footer-links')).toBeInTheDocument();
      expect(container.querySelector('.footer-copyright')).toBeInTheDocument();
    });

    it('should render Amara.day logo (Task 2.14)', () => {
      const { container } = render(<Footer />, { wrapper: Wrapper });

      const branding = container.querySelector('.footer-branding');
      expect(branding).toBeInTheDocument();

      // Logo should be rendered inside branding div
      const logo = branding?.querySelector('.amara-day-logo');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should render Privacy Policy link', () => {
      render(<Footer />, { wrapper: Wrapper });

      const privacyLink = screen.getByRole('link', { name: /privacy policy/i });
      expect(privacyLink).toBeInTheDocument();
      expect(privacyLink).toHaveAttribute('href', '/privacy');
      expect(privacyLink).toHaveClass('footer-link');
    });

    it('should render Terms of Service link', () => {
      render(<Footer />, { wrapper: Wrapper });

      const termsLink = screen.getByRole('link', { name: /terms of service/i });
      expect(termsLink).toBeInTheDocument();
      expect(termsLink).toHaveAttribute('href', '/terms');
      expect(termsLink).toHaveClass('footer-link');
    });

    it('should have navigation with accessible label', () => {
      render(<Footer />, { wrapper: Wrapper });

      const nav = screen.getByRole('navigation', { name: /legal information/i });
      expect(nav).toBeInTheDocument();
    });

    it('should render links in a list', () => {
      const { container } = render(<Footer />, { wrapper: Wrapper });

      const list = container.querySelector('.footer-links');
      expect(list).toBeInTheDocument();
      expect(list?.tagName).toBe('UL');

      const items = container.querySelectorAll('.footer-item');
      expect(items).toHaveLength(2); // Privacy and Terms
    });

    it('should have separator between links', () => {
      const { container } = render(<Footer />, { wrapper: Wrapper });

      const separator = container.querySelector('.footer-separator');
      expect(separator).toBeInTheDocument();
      expect(separator).toHaveTextContent('•');
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Copyright Notice', () => {
    it('should display copyright with current year (Task 2.14)', () => {
      render(<Footer />, { wrapper: Wrapper });

      const currentYear = new Date().getFullYear();
      const copyright = screen.getByText(new RegExp(`© ${currentYear} Amara\\.day`));
      expect(copyright).toBeInTheDocument();
    });

    it('should have copyright paragraph', () => {
      const { container } = render(<Footer />, { wrapper: Wrapper });

      const copyright = container.querySelector('.footer-copyright');
      expect(copyright).toBeInTheDocument();
      expect(copyright?.tagName).toBe('P');
    });
  });

  describe('Accessibility', () => {
    it('should have contentinfo landmark role', () => {
      render(<Footer />, { wrapper: Wrapper });

      const footer = screen.getByRole('contentinfo');
      expect(footer).toBeInTheDocument();
    });

    it('should have navigation landmark with label', () => {
      render(<Footer />, { wrapper: Wrapper });

      const nav = screen.getByRole('navigation', { name: /legal information/i });
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveAttribute('aria-label', 'Legal information');
    });

    it('should mark separator as decorative', () => {
      const { container } = render(<Footer />, { wrapper: Wrapper });

      const separator = container.querySelector('.footer-separator');
      expect(separator).toHaveAttribute('aria-hidden', 'true');
    });

    it('should have all links accessible by role', () => {
      render(<Footer />, { wrapper: Wrapper });

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(2);

      expect(links[0]).toHaveAccessibleName('Privacy Policy');
      expect(links[1]).toHaveAccessibleName('Terms of Service');
    });
  });

  describe('Component Structure', () => {
    it('should wrap content in container div', () => {
      const { container } = render(<Footer />, { wrapper: Wrapper });

      const footerContainer = container.querySelector('.footer-container');
      expect(footerContainer).toBeInTheDocument();

      // Container should have nav and copyright
      const nav = footerContainer?.querySelector('.footer-nav');
      const copyright = footerContainer?.querySelector('.footer-copyright');
      expect(nav).toBeInTheDocument();
      expect(copyright).toBeInTheDocument();
    });

    it('should render branding, navigation, then copyright (Task 2.14)', () => {
      const { container } = render(<Footer />, { wrapper: Wrapper });

      const footerContainer = container.querySelector('.footer-container');
      const children = Array.from(footerContainer?.children || []);

      expect(children[0]).toHaveClass('footer-branding');
      expect(children[1]).toHaveClass('footer-nav');
      expect(children[2]).toHaveClass('footer-copyright');
    });
  });

  describe('Integration', () => {
    it('should render consistently across multiple renders', () => {
      const { unmount, container } = render(<Footer />, { wrapper: Wrapper });
      const firstRender = container.innerHTML;

      unmount();

      const { container: container2 } = render(<Footer />, { wrapper: Wrapper });
      const secondRender = container2.innerHTML;

      expect(firstRender).toBe(secondRender);
    });

    it('should maintain year accuracy on re-render', () => {
      const { rerender } = render(<Footer />, { wrapper: Wrapper });

      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();

      // Re-render
      rerender(<Footer />);

      expect(screen.getByText(new RegExp(`${currentYear}`))).toBeInTheDocument();
    });
  });

  describe('Real-World Usage', () => {
    it('should provide complete footer information (Task 2.14)', () => {
      render(<Footer />, { wrapper: Wrapper });

      // Legal links
      expect(screen.getByRole('link', { name: /privacy policy/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /terms of service/i })).toBeInTheDocument();

      // Copyright with Amara.day branding
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(new RegExp(`© ${currentYear} Amara\\.day`))).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<Footer />, { wrapper: Wrapper });

      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toBeVisible();
        expect(link).not.toHaveAttribute('tabindex', '-1');
      });
    });
  });
});
