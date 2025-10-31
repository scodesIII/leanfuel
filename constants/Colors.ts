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