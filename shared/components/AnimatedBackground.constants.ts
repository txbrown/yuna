/**
 * Gradient preset configurations for AnimatedBackground component
 */

export type GradientPreset = 'sunny' | 'rainy';

export const GRADIENT_PRESETS: Record<GradientPreset, string[]> = {
  sunny: ['#FF6B6B', '#FF8E53'],
  rainy: ['#4A90E2', '#50C9CE'],
};

