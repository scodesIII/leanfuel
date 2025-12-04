/**
 * Color scheme for LeanFuel - a fitness and nutrition tracking app
 * Inspired by MyFitnessPal but with a modern, cleaner design
 */

// Primary brand colors
const primaryLight = '#3c9d5c'; // Green for health/fitness
const primaryDark = '#4cb56e';

// Secondary action colors
const secondaryLight = '#2d7dd2'; // Blue for water/hydration
const secondaryDark = '#54a0ff';

// Accent color for highlights and CTAs
const accentLight = '#ff6b6b'; // Energetic red for exercise/activity
const accentDark = '#ff8787';

export const Colors = {
  light: {
    // Core UI colors
    text: '#1e293b', // Slate 800
    background: '#ffffff',
    card: '#f8fafc', // Slate 50
    border: '#e2e8f0', // Slate 200
    muted: '#64748b', // Slate 500 - for secondary text and less prominent elements

    // Brand colors
    primary: primaryLight,
    secondary: secondaryLight,
    accent: accentLight,

    // Tab navigation
    tabIconDefault: '#94a3b8', // Slate 400
    tabIconSelected: primaryLight,
    tabBackground: '#ffffff',

    // Nutritional elements
    protein: '#4ade80', // Green
    carbs: '#facc15', // Yellow
    fat: '#fb923c', // Orange

    // Status colors
    success: '#10b981', // Emerald 500
    warning: '#f59e0b', // Amber 500
    error: '#ef4444', // Red 500
    info: '#3b82f6', // Blue 500
  },
  dark: {
    // Core UI colors
    text: '#f1f5f9', // Slate 100
    background: '#0f172a', // Slate 900
    card: '#1e293b', // Slate 800
    border: '#334155', // Slate 700
    muted: '#94a3b8', // Slate 400 - for secondary text and less prominent elements

    // Brand colors
    primary: primaryDark,
    secondary: secondaryDark,
    accent: accentDark,

    // Tab navigation
    tabIconDefault: '#64748b', // Slate 500
    tabIconSelected: primaryDark,
    tabBackground: '#1e293b', // Slate 800

    // Nutritional elements
    protein: '#22c55e', // Green
    carbs: '#eab308', // Yellow
    fat: '#f97316', // Orange

    // Status colors
    success: '#059669', // Emerald 600
    warning: '#d97706', // Amber 600
    error: '#dc2626', // Red 600
    info: '#2563eb', // Blue 600
  },
};


export const hexToRgba = (hex: string, alpha: number) => {
  if (!hex || !hex.startsWith('#') || hex.length !== 7) {
    console.warn(`Invalid hex color passed: "${hex}"`);
    return 'rgba(0,0,0,0)';
  }

  const bigint = parseInt(hex.slice(1), 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Creates a gradient array from a base color
 * Returns [lighter, base, darker] for use in gradients
 */
export const createGradient = (baseColor: string): [string, string, string] => {
  // Parse hex color to RGB
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Create lighter and darker variations
  const lighten = (amount: number) => {
    const nr = Math.min(255, r + amount);
    const ng = Math.min(255, g + amount);
    const nb = Math.min(255, b + amount);
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  };

  const darken = (amount: number) => {
    const nr = Math.max(0, r - amount);
    const ng = Math.max(0, g - amount);
    const nb = Math.max(0, b - amount);
    return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
  };

  // Return gradient array: [lighter, base, darker]
  return [lighten(20), baseColor, darken(15)];
};

/**
 * Predefined gradient sets for common use cases
 * Each gradient is [light, base, dark] for use in LinearGradient components
 */
export const Gradients = {
  // Status gradients (light mode)
  success: createGradient('#10b981'),
  error: createGradient('#ef4444'),
  warning: createGradient('#f59e0b'),
  info: createGradient('#3b82f6'),

  // Brand gradients
  primary: createGradient('#3c9d5c'),
  secondary: createGradient('#2d7dd2'),
  accent: createGradient('#ff6b6b'),

  // Nutritional gradients
  protein: createGradient('#4ade80'),
  carbs: createGradient('#facc15'),
  fat: createGradient('#fb923c'),
};
