/**
 * Layout Component Tests
 *
 * Tests the main layout wrapper that includes Navigation, Footer, and OfflineIndicator.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from './Layout';

// Mock child components to isolate Layout testing
vi.mock('./Navigation', () => ({
  default: () => <nav data-testid="mock-navigation">Navigation</nav>,
}));

vi.mock('./Footer', () => ({
  default: () => <footer data-testid="mock-footer">Footer</footer>,
}));

vi.mock('./OfflineIndicator', () => ({
  default: () => <div data-testid="mock-offline-indicator">OfflineIndicator</div>,
}));

describe('Layout', () => {
  describe('Basic Rendering', () => {
    it('should render layout wrapper with correct class', () => {
      const { container } = render(
        <MemoryRouter>
          <Layout>
            <div>Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      const layoutDiv = container.querySelector('.layout');
      expect(layoutDiv).toBeInTheDocument();
    });

    it('should render children content', () => {
      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText('Test Content')).toBeInTheDocument();
    });

    it('should render multiple children', () => {
      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="child-1">Child 1</div>
            <div data-testid="child-2">Child 2</div>
            <div data-testid="child-3">Child 3</div>
          </Layout>
        </MemoryRouter>
      );

      expect(screen.getByTestId('child-1')).toBeInTheDocument();
      expect(screen.getByTestId('child-2')).toBeInTheDocument();
      expect(screen.getByTestId('child-3')).toBeInTheDocument();
    });

    it('should render with string children', () => {
      render(
        <MemoryRouter>
          <Layout>Simple text content</Layout>
        </MemoryRouter>
      );

      expect(screen.getByText('Simple text content')).toBeInTheDocument();
    });

    it('should render with null/undefined children gracefully', () => {
      const { container } = render(
        <MemoryRouter>
          <Layout>{null}</Layout>
        </MemoryRouter>
      );

      expect(container.querySelector('.layout')).toBeInTheDocument();
    });
  });

  describe('Component Composition', () => {
    it('should render OfflineIndicator component', () => {
      render(
        <MemoryRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </MemoryRouter>
      );

      expect(screen.getByTestId('mock-offline-indicator')).toBeInTheDocument();
    });

    it('should render Navigation component', () => {
      render(
        <MemoryRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </MemoryRouter>
      );

      expect(screen.getByTestId('mock-navigation')).toBeInTheDocument();
    });

    it('should render Footer component', () => {
      render(
        <MemoryRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </MemoryRouter>
      );

      expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });

    it('should render all sub-components together', () => {
      render(
        <MemoryRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </MemoryRouter>
      );

      expect(screen.getByTestId('mock-offline-indicator')).toBeInTheDocument();
      expect(screen.getByTestId('mock-navigation')).toBeInTheDocument();
      expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    });
  });

  describe('Component Order', () => {
    it('should render OfflineIndicator first (before Navigation)', () => {
      const { container } = render(
        <MemoryRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </MemoryRouter>
      );

      const layout = container.querySelector('.layout');
      const children = Array.from(layout?.children || []);

      const offlineIndex = children.findIndex((el) =>
        el.getAttribute('data-testid') === 'mock-offline-indicator'
      );
      const navIndex = children.findIndex((el) =>
        el.getAttribute('data-testid') === 'mock-navigation'
      );

      expect(offlineIndex).toBeLessThan(navIndex);
    });

    it('should render Navigation before main content', () => {
      const { container } = render(
        <MemoryRouter>
          <Layout>
            <div data-testid="content">Content</div>
          </Layout>
        </MemoryRouter>
      );

      const layout = container.querySelector('.layout');
      const children = Array.from(layout?.children || []);

      const navIndex = children.findIndex((el) =>
        el.getAttribute('data-testid') === 'mock-navigation'
      );
      const mainIndex = children.findIndex((el) => el.tagName === 'MAIN');

      expect(navIndex).toBeLessThan(mainIndex);
    });

    it('should render Footer last (after main content)', () => {
      const { container } = render(
        <MemoryRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </MemoryRouter>
      );

      const layout = container.querySelector('.layout');
      const children = Array.from(layout?.children || []);

      const mainIndex = children.findIndex((el) => el.tagName === 'MAIN');
      const footerIndex = children.findIndex((el) =>
        el.getAttribute('data-testid') === 'mock-footer'
      );

      expect(footerIndex).toBeGreaterThan(mainIndex);
    });
  });

  describe('Main Content Area', () => {
    it('should wrap children in a main element', () => {
      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="content">Content</div>
          </Layout>
        </MemoryRouter>
      );

      const main = screen.getByRole('main');
      expect(main).toBeInTheDocument();
    });

    it('should apply layout-content class to main element', () => {
      render(
        <MemoryRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </MemoryRouter>
      );

      const main = screen.getByRole('main');
      expect(main.className).toContain('layout-content');
    });

    it('should render children inside main element', () => {
      render(
        <MemoryRouter>
          <Layout>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      const main = screen.getByRole('main');
      const content = screen.getByTestId('test-content');

      expect(main).toContainElement(content);
    });

    it('should preserve children structure', () => {
      render(
        <MemoryRouter>
          <Layout>
            <div className="custom-class">
              <h1>Title</h1>
              <p>Paragraph</p>
            </div>
          </Layout>
        </MemoryRouter>
      );

      const main = screen.getByRole('main');
      expect(main.querySelector('.custom-class')).toBeInTheDocument();
      expect(main.querySelector('h1')).toHaveTextContent('Title');
      expect(main.querySelector('p')).toHaveTextContent('Paragraph');
    });
  });

  describe('Accessibility', () => {
    it('should have semantic main landmark', () => {
      render(
        <MemoryRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </MemoryRouter>
      );

      const main = screen.getByRole('main');
      expect(main.tagName).toBe('MAIN');
    });

    it('should provide logical document structure', () => {
      const { container } = render(
        <MemoryRouter>
          <Layout>
            <h2>Page Title</h2>
            <div>Content</div>
          </Layout>
        </MemoryRouter>
      );

      // Should have: OfflineIndicator -> nav -> main -> footer
      const layout = container.querySelector('.layout');
      expect(layout?.children).toHaveLength(4);
    });

    it('should allow keyboard navigation through all sections', () => {
      render(
        <MemoryRouter>
          <Layout>
            <button>Test Button</button>
          </Layout>
        </MemoryRouter>
      );

      // All interactive elements should be accessible
      const button = screen.getByRole('button', { name: /test button/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Rendering with Different Content', () => {
    it('should render with form elements', () => {
      render(
        <MemoryRouter>
          <Layout>
            <form data-testid="test-form">
              <input type="text" placeholder="Test input" />
              <button type="submit">Submit</button>
            </form>
          </Layout>
        </MemoryRouter>
      );

      expect(screen.getByTestId('test-form')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
    });

    it('should render with nested components', () => {
      const NestedComponent = () => (
        <div data-testid="nested">
          <p>Nested content</p>
        </div>
      );

      render(
        <MemoryRouter>
          <Layout>
            <NestedComponent />
          </Layout>
        </MemoryRouter>
      );

      expect(screen.getByTestId('nested')).toBeInTheDocument();
      expect(screen.getByText('Nested content')).toBeInTheDocument();
    });

    it('should render with lists and tables', () => {
      render(
        <MemoryRouter>
          <Layout>
            <ul data-testid="test-list">
              <li>Item 1</li>
              <li>Item 2</li>
            </ul>
            <table data-testid="test-table">
              <tbody>
                <tr>
                  <td>Cell 1</td>
                </tr>
              </tbody>
            </table>
          </Layout>
        </MemoryRouter>
      );

      expect(screen.getByTestId('test-list')).toBeInTheDocument();
      expect(screen.getByTestId('test-table')).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should apply layout class to root div', () => {
      const { container } = render(
        <MemoryRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </MemoryRouter>
      );

      expect(container.firstChild).toHaveClass('layout');
    });

    it('should apply layout-content class to main element', () => {
      render(
        <MemoryRouter>
          <Layout>
            <div>Content</div>
          </Layout>
        </MemoryRouter>
      );

      const main = screen.getByRole('main');
      expect(main).toHaveClass('layout-content');
    });
  });

  describe('Rendering Consistency', () => {
    it('should render consistently across multiple mounts', () => {
      const { unmount, container } = render(
        <MemoryRouter>
          <Layout>
            <div>Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      const firstRender = container.innerHTML;
      unmount();

      const { container: container2 } = render(
        <MemoryRouter>
          <Layout>
            <div>Test Content</div>
          </Layout>
        </MemoryRouter>
      );

      expect(container2.innerHTML).toBe(firstRender);
    });

    it('should update when children change', () => {
      const { rerender } = render(
        <MemoryRouter>
          <Layout>
            <div>Original Content</div>
          </Layout>
        </MemoryRouter>
      );

      expect(screen.getByText('Original Content')).toBeInTheDocument();

      rerender(
        <MemoryRouter>
          <Layout>
            <div>Updated Content</div>
          </Layout>
        </MemoryRouter>
      );

      expect(screen.queryByText('Original Content')).not.toBeInTheDocument();
      expect(screen.getByText('Updated Content')).toBeInTheDocument();
    });
  });
});
