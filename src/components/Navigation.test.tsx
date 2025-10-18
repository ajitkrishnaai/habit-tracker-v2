/**
 * Navigation Component Tests
 *
 * Tests the top navigation bar including routing, active states, and accessibility.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navigation from './Navigation';

describe('Navigation', () => {
  describe('Basic Rendering', () => {
    it('should render navigation element with correct ARIA attributes', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const nav = screen.getByRole('navigation', { name: /main navigation/i });
      expect(nav).toBeInTheDocument();
    });

    it('should render brand/title', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const title = screen.getByRole('heading', { name: /habit tracker/i });
      expect(title).toBeInTheDocument();
      expect(title.tagName).toBe('H1');
    });

    it('should render all three navigation links', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      expect(screen.getByRole('link', { name: /daily log/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /progress/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /manage habits/i })).toBeInTheDocument();
    });

    it('should render links in a list structure', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      expect(list.className).toContain('navigation-menu');

      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
    });
  });

  describe('Navigation Links', () => {
    it('should have correct href for Daily Log link', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /daily log/i });
      expect(link).toHaveAttribute('href', '/daily-log');
    });

    it('should have correct href for Progress link', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /progress/i });
      expect(link).toHaveAttribute('href', '/progress');
    });

    it('should have correct href for Manage Habits link', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const link = screen.getByRole('link', { name: /manage habits/i });
      expect(link).toHaveAttribute('href', '/manage-habits');
    });

    it('should apply base navigation-link class to all links', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const links = screen.getAllByRole('link').filter((link) =>
        link.className.includes('navigation-link')
      );
      expect(links).toHaveLength(3);
    });
  });

  describe('Active State Highlighting', () => {
    it('should highlight Daily Log link when on /daily-log route', () => {
      render(
        <MemoryRouter initialEntries={['/daily-log']}>
          <Navigation />
        </MemoryRouter>
      );

      const dailyLogLink = screen.getByRole('link', { name: /daily log/i });
      const progressLink = screen.getByRole('link', { name: /progress/i });
      const manageLink = screen.getByRole('link', { name: /manage habits/i });

      expect(dailyLogLink.className).toContain('navigation-link--active');
      expect(progressLink.className).not.toContain('navigation-link--active');
      expect(manageLink.className).not.toContain('navigation-link--active');
    });

    it('should highlight Progress link when on /progress route', () => {
      render(
        <MemoryRouter initialEntries={['/progress']}>
          <Navigation />
        </MemoryRouter>
      );

      const dailyLogLink = screen.getByRole('link', { name: /daily log/i });
      const progressLink = screen.getByRole('link', { name: /progress/i });
      const manageLink = screen.getByRole('link', { name: /manage habits/i });

      expect(dailyLogLink.className).not.toContain('navigation-link--active');
      expect(progressLink.className).toContain('navigation-link--active');
      expect(manageLink.className).not.toContain('navigation-link--active');
    });

    it('should highlight Manage Habits link when on /manage-habits route', () => {
      render(
        <MemoryRouter initialEntries={['/manage-habits']}>
          <Navigation />
        </MemoryRouter>
      );

      const dailyLogLink = screen.getByRole('link', { name: /daily log/i });
      const progressLink = screen.getByRole('link', { name: /progress/i });
      const manageLink = screen.getByRole('link', { name: /manage habits/i });

      expect(dailyLogLink.className).not.toContain('navigation-link--active');
      expect(progressLink.className).not.toContain('navigation-link--active');
      expect(manageLink.className).toContain('navigation-link--active');
    });

    it('should have no active links when on unknown route', () => {
      render(
        <MemoryRouter initialEntries={['/unknown-route']}>
          <Navigation />
        </MemoryRouter>
      );

      const links = screen.getAllByRole('link').filter((link) =>
        link.className.includes('navigation-link')
      );

      links.forEach((link) => {
        expect(link.className).not.toContain('navigation-link--active');
      });
    });
  });

  describe('CSS Classes', () => {
    it('should apply navigation class to nav element', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const nav = screen.getByRole('navigation');
      expect(nav.className).toContain('navigation');
    });

    it('should apply navigation-container class to container div', () => {
      const { container } = render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const navContainer = container.querySelector('.navigation-container');
      expect(navContainer).toBeInTheDocument();
    });

    it('should apply navigation-brand class to brand container', () => {
      const { container } = render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const brand = container.querySelector('.navigation-brand');
      expect(brand).toBeInTheDocument();
    });

    it('should apply navigation-title class to h1', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const title = screen.getByRole('heading', { name: /habit tracker/i });
      expect(title.className).toContain('navigation-title');
    });

    it('should apply navigation-item class to list items', () => {
      const { container } = render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const items = container.querySelectorAll('.navigation-item');
      expect(items).toHaveLength(3);
    });
  });

  describe('Accessibility', () => {
    it('should have semantic nav element', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const nav = screen.getByRole('navigation');
      expect(nav.tagName).toBe('NAV');
    });

    it('should have descriptive aria-label on nav element', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('should use proper list structure (ul/li)', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const list = screen.getByRole('list');
      expect(list.tagName).toBe('UL');

      const items = screen.getAllByRole('listitem');
      items.forEach((item) => {
        expect(item.tagName).toBe('LI');
      });
    });

    it('should have links that are keyboard accessible', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const links = screen.getAllByRole('link');
      links.forEach((link) => {
        // Links should be focusable (tabindex >= 0 or no explicit tabindex)
        const tabindex = link.getAttribute('tabindex');
        if (tabindex !== null) {
          expect(parseInt(tabindex)).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it('should provide clear link text (no "click here" or ambiguous text)', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const dailyLogLink = screen.getByRole('link', { name: /daily log/i });
      const progressLink = screen.getByRole('link', { name: /progress/i });
      const manageLink = screen.getByRole('link', { name: /manage habits/i });

      // Check that link text is descriptive
      expect(dailyLogLink.textContent).toBe('Daily Log');
      expect(progressLink.textContent).toBe('Progress');
      expect(manageLink.textContent).toBe('Manage Habits');
    });
  });

  describe('Rendering Consistency', () => {
    it('should render consistently across multiple mounts', () => {
      const { unmount, container } = render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      const firstRender = container.innerHTML;
      unmount();

      const { container: container2 } = render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      );

      expect(container2.innerHTML).toBe(firstRender);
    });

    it('should maintain structure when route changes', () => {
      const { rerender } = render(
        <MemoryRouter initialEntries={['/daily-log']}>
          <Navigation />
        </MemoryRouter>
      );

      expect(screen.getAllByRole('link')).toHaveLength(3);

      // Re-render with different route
      rerender(
        <MemoryRouter initialEntries={['/progress']}>
          <Navigation />
        </MemoryRouter>
      );

      // Should still have same number of links
      expect(screen.getAllByRole('link')).toHaveLength(3);
    });
  });
});
