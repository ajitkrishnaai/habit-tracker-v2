/**
 * Confetti Animation Utility
 * Task 2.5 - Canvas-based confetti particle system
 *
 * Features:
 * - Warm color palette (terracotta, sage, sunset, dusty rose)
 * - Smooth 60 FPS animation using requestAnimationFrame
 * - Particles fall with gravity, rotation, and fade out
 * - Automatic cleanup on completion
 */

export interface ConfettiOptions {
  /** Colors to use for confetti particles (defaults to warm palette) */
  colors?: string[];
  /** Number of confetti particles (default: 25) */
  particleCount?: number;
  /** Animation duration in milliseconds (default: 2500) */
  duration?: number;
}

interface Particle {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  size: number;
  opacity: number;
}

// Default warm color palette from Amara.day design system
const DEFAULT_COLORS = [
  '#D4745E', // terracotta
  '#8B9A7E', // sage green
  '#E89C5A', // sunset orange
  '#C9A997', // dusty rose
  '#B8A891', // warm taupe
];

/**
 * Trigger confetti animation on a canvas element
 * @param canvasElement - HTML canvas element to render confetti on
 * @param options - Optional configuration for confetti
 */
export const triggerConfetti = (
  canvasElement: HTMLCanvasElement,
  options?: ConfettiOptions
): void => {
  const {
    colors = DEFAULT_COLORS,
    particleCount = 25,
    duration = 2500,
  } = options || {};

  // Get canvas context
  const ctx = canvasElement.getContext('2d');
  if (!ctx) {
    console.warn('Cannot get canvas 2D context for confetti');
    return;
  }

  // Set canvas size to match window
  canvasElement.width = window.innerWidth;
  canvasElement.height = window.innerHeight;

  // Create particles
  const particles: Particle[] = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * canvasElement.width,
      y: -20, // Start above viewport
      velocityX: (Math.random() - 0.5) * 4, // Horizontal drift
      velocityY: Math.random() * 2 + 2, // Fall speed
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4, // 4-12px
      opacity: 1,
    });
  }

  const startTime = Date.now();
  let animationFrameId: number;

  const animate = () => {
    const elapsed = Date.now() - startTime;
    const progress = elapsed / duration;

    // Clear canvas
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Update and draw particles
    particles.forEach((particle) => {
      // Update position
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      particle.velocityY += 0.1; // Gravity
      particle.rotation += particle.rotationSpeed;

      // Fade out as animation progresses
      particle.opacity = Math.max(0, 1 - progress);

      // Draw particle
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.globalAlpha = particle.opacity;
      ctx.fillStyle = particle.color;

      // Draw rectangle (confetti piece)
      ctx.fillRect(
        -particle.size / 2,
        -particle.size / 2,
        particle.size,
        particle.size
      );

      ctx.restore();
    });

    // Continue animation if not complete
    if (progress < 1) {
      animationFrameId = requestAnimationFrame(animate);
    } else {
      // Cleanup: clear canvas and remove animation frame
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
    }
  };

  // Start animation
  animationFrameId = requestAnimationFrame(animate);

  // Cleanup function (not returned, but animation auto-cleans up)
  // If needed, caller can track animationFrameId and call cancelAnimationFrame
};
