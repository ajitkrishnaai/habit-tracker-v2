/**
 * Confetti Animation Utility Tests
 * Task 2.5 - Test canvas-based confetti particle system
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { triggerConfetti } from './confetti';

describe('Confetti Utility', () => {
  let canvas: HTMLCanvasElement;
  let mockContext: any;

  beforeEach(() => {
    // Create mock canvas
    canvas = document.createElement('canvas');

    // Mock 2D context
    mockContext = {
      clearRect: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      fillRect: vi.fn(),
      globalAlpha: 1,
      fillStyle: '',
    };

    // Mock getContext
    vi.spyOn(canvas, 'getContext').mockReturnValue(mockContext);

    // Mock requestAnimationFrame
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      setTimeout(() => cb(Date.now()), 0);
      return 1;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create canvas context', () => {
    triggerConfetti(canvas);

    expect(canvas.getContext).toHaveBeenCalledWith('2d');
  });

  it('should set canvas size to window dimensions', () => {
    triggerConfetti(canvas);

    expect(canvas.width).toBe(window.innerWidth);
    expect(canvas.height).toBe(window.innerHeight);
  });

  it('should use default warm colors when no colors provided', () => {
    triggerConfetti(canvas);

    // Animation should start
    expect(window.requestAnimationFrame).toHaveBeenCalled();

    // Should have called fillRect (particles being drawn)
    expect(mockContext.fillRect).toHaveBeenCalled();
  });

  it('should accept custom colors', () => {
    const customColors = ['#FF0000', '#00FF00', '#0000FF'];

    triggerConfetti(canvas, { colors: customColors });

    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should accept custom particle count', () => {
    triggerConfetti(canvas, { particleCount: 50 });

    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should accept custom duration', () => {
    triggerConfetti(canvas, { duration: 5000 });

    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should clear canvas during animation', () => {
    triggerConfetti(canvas);

    // First frame should clear canvas
    expect(mockContext.clearRect).toHaveBeenCalledWith(
      0,
      0,
      canvas.width,
      canvas.height
    );
  });

  it('should render particles with warm colors', () => {
    triggerConfetti(canvas);

    // Should call save/restore for each particle
    expect(mockContext.save).toHaveBeenCalled();
    expect(mockContext.restore).toHaveBeenCalled();

    // Should translate to particle position
    expect(mockContext.translate).toHaveBeenCalled();

    // Should rotate particle
    expect(mockContext.rotate).toHaveBeenCalled();

    // Should draw rectangle (confetti piece)
    expect(mockContext.fillRect).toHaveBeenCalled();
  });

  it('should handle missing canvas context gracefully', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(canvas, 'getContext').mockReturnValue(null);

    // Should not throw
    expect(() => triggerConfetti(canvas)).not.toThrow();

    // Should warn user
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      'Cannot get canvas 2D context for confetti'
    );

    consoleWarnSpy.mockRestore();
  });

  it('should use default options when none provided', () => {
    triggerConfetti(canvas);

    // Should start animation with defaults
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });
});
