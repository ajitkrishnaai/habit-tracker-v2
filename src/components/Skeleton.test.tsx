/**
 * Skeleton Component Tests
 * Task 2.2 - Test skeleton loading component
 */

import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Skeleton } from './Skeleton';

describe('Skeleton', () => {
  it('should render with default variant (rect)', () => {
    const { getByTestId } = render(<Skeleton />);

    const skeleton = getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('skeleton');
    expect(skeleton).toHaveClass('skeleton--rect');
  });

  it('should render text variant', () => {
    const { getByTestId } = render(<Skeleton variant="text" />);

    const skeleton = getByTestId('skeleton');
    expect(skeleton).toHaveClass('skeleton--text');
  });

  it('should render circle variant', () => {
    const { getByTestId } = render(<Skeleton variant="circle" />);

    const skeleton = getByTestId('skeleton');
    expect(skeleton).toHaveClass('skeleton--circle');
  });

  it('should apply custom width as string', () => {
    const { getByTestId } = render(<Skeleton width="200px" />);

    const skeleton = getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '200px' });
  });

  it('should apply custom width as number (converts to px)', () => {
    const { getByTestId } = render(<Skeleton width={150} />);

    const skeleton = getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '150px' });
  });

  it('should apply custom height as string', () => {
    const { getByTestId } = render(<Skeleton height="3rem" />);

    const skeleton = getByTestId('skeleton');
    // Check that height attribute is set (browser may compute differently)
    expect(skeleton).toHaveAttribute('style');
    expect(skeleton.getAttribute('style')).toContain('height: 3rem');
  });

  it('should apply custom height as number (converts to px)', () => {
    const { getByTestId } = render(<Skeleton height={50} />);

    const skeleton = getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ height: '50px' });
  });

  it('should apply custom width and height together', () => {
    const { getByTestId } = render(<Skeleton width="100px" height="20px" />);

    const skeleton = getByTestId('skeleton');
    expect(skeleton).toHaveStyle({ width: '100px', height: '20px' });
  });

  it('should apply additional className', () => {
    const { getByTestId } = render(<Skeleton className="custom-class" />);

    const skeleton = getByTestId('skeleton');
    expect(skeleton).toHaveClass('skeleton');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should have aria-hidden attribute for accessibility', () => {
    const { getByTestId } = render(<Skeleton />);

    const skeleton = getByTestId('skeleton');
    expect(skeleton).toHaveAttribute('aria-hidden', 'true');
  });

  it('should render circle variant with full border-radius', () => {
    const { getByTestId } = render(<Skeleton variant="circle" width={60} height={60} />);

    const skeleton = getByTestId('skeleton');
    expect(skeleton).toHaveClass('skeleton--circle');
    expect(skeleton).toHaveStyle({ width: '60px', height: '60px' });
  });
});
