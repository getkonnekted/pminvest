import confetti from 'canvas-confetti';
import { playPayoutChime } from './sound';

export type CelebrationType = 'registration' | 'investment';

/**
 * Fires a subtle, ultra-luxurious gold and emerald celebration
 * with gentle physics (low gravity, soft velocity, warm color palette)
 * and triggers an ambient screen edge glow.
 */
export function triggerCelebration(type: CelebrationType = 'investment') {
  try {
    // 1. Play soft harmonic chime
    playPayoutChime();

    // 2. Dispatch custom event for ambient glow overlay
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('luxury-celebration-glow', {
          detail: { type, timestamp: Date.now() }
        })
      );
    }

    // 3. Check for reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Luxury palette: Metallic Gold, Warm Amber, Emerald Green, Champagne
    const luxuryColors = ['#D4AF37', '#F59E0B', '#10B981', '#FDE68A', '#FFFBEB', '#34D399'];

    if (type === 'registration') {
      // Dual corner welcoming burst: gentle, soft, upward arcs
      confetti({
        particleCount: 40,
        angle: 60,
        spread: 65,
        origin: { x: 0.15, y: 0.85 },
        colors: luxuryColors,
        gravity: 0.85,
        scalar: 0.9,
        ticks: 200,
        disableForReducedMotion: true
      });

      confetti({
        particleCount: 40,
        angle: 120,
        spread: 65,
        origin: { x: 0.85, y: 0.85 },
        colors: luxuryColors,
        gravity: 0.85,
        scalar: 0.9,
        ticks: 200,
        disableForReducedMotion: true
      });
    } else {
      // New investment activation: Center cascade of gold & emerald shimmer
      confetti({
        particleCount: 65,
        spread: 90,
        startVelocity: 35,
        origin: { x: 0.5, y: 0.4 },
        colors: luxuryColors,
        gravity: 0.9,
        scalar: 1.05,
        ticks: 220,
        disableForReducedMotion: true
      });

      // Second gentle wave after 250ms for depth
      setTimeout(() => {
        confetti({
          particleCount: 30,
          spread: 120,
          startVelocity: 25,
          origin: { x: 0.5, y: 0.45 },
          colors: ['#FFE899', '#10B981', '#FBBF24'],
          gravity: 0.8,
          scalar: 0.8,
          ticks: 180,
          disableForReducedMotion: true
        });
      }, 250);
    }
  } catch (err) {
    // Fail silently without breaking user workflow
    console.warn('Celebration effect skipped:', err);
  }
}
