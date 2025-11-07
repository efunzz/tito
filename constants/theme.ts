/**
 * Tito App - Design System
 * Centralized theme configuration to ensure consistency across the app
 */

// Color Palette - Inspired by Cardy Pay Design
export const COLORS = {
  // Background colors
  background: '#E8E5E0',  // Light beige background
  cardBg: '#FFFFFF',      // White cards
  darkCard: '#1A1A1A',    // Dark accent cards
  grayCard: '#D4D1CC',    // Gray accent cards

  // Primary colors
  primary: '#FF5555',     // Red primary
  primaryDark: '#C0392B', // Darker red for pressed states

  // Text colors
  textPrimary: '#1A1A1A',   // Dark text
  textSecondary: '#8E8E93', // Gray text
  textLight: '#B8B8B8',     // Light gray text
  textDisabled: '#B8B8B8',  // Disabled state text

  // Status colors
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#FF5555',
  info: '#2196F3',

  // UI elements
  border: '#E0E0E0',
  divider: '#F0F0F0',
  shadow: 'rgba(0, 0, 0, 0.1)',
} as const;

// Typography
export const TYPOGRAPHY = {
  // Font sizes
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
  },

  // Font weights
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
} as const;

// Spacing system (based on 4px grid)
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

// Border radius values
export const RADIUS = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999, // For circular elements
} as const;

// Shadow presets
export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

// Common layout values
export const LAYOUT = {
  screenPadding: SPACING.base,
  cardPadding: SPACING.base,
  buttonHeight: 48,
  inputHeight: 48,
  tabBarHeight: 60,
} as const;

// Export a combined theme object
export const theme = {
  colors: COLORS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  radius: RADIUS,
  shadows: SHADOWS,
  layout: LAYOUT,
} as const;

// Type exports for TypeScript
export type ColorKey = keyof typeof COLORS;
export type ThemeColors = typeof COLORS;
export type Theme = typeof theme;
