// Material Design 3 Colors & Themes
export const themes = {
  light: {
    background: '#ffffff',
    surface: '#f5f5f5',
    surfaceVariant: '#eeeeee',
    onBackground: '#1a1a1a',
    onSurface: '#1a1a1a',
    primary: '#e91e63',
    primaryContainer: '#fcd4e2',
    onPrimary: '#ffffff',
    onPrimaryContainer: '#410e2e',
    secondary: '#2196f3',
    secondaryContainer: '#c8e6f5',
    onSecondary: '#ffffff',
    onSecondaryContainer: '#001d47',
    tertiary: '#4caf50',
    tertiaryContainer: '#c8e6c9',
    onTertiary: '#ffffff',
    onTertiaryContainer: '#1b5e20',
    error: '#b3261e',
    errorContainer: '#f9dedc',
    onError: '#ffffff',
    onErrorContainer: '#410e0b',
    outline: '#79747e',
    outlineVariant: '#c4c7c5',
    scrim: '#000000'
  },
  dark: {
    background: '#121212',
    surface: '#1e1e1e',
    surfaceVariant: '#49454e',
    onBackground: '#e6e6e6',
    onSurface: '#e6e6e6',
    primary: '#f48fb1',
    primaryContainer: '#a41848',
    onPrimary: '#67001d',
    onPrimaryContainer: '#fcd4e2',
    secondary: '#81d4f4',
    secondaryContainer: '#004a77',
    onSecondary: '#003a70',
    onSecondaryContainer: '#c8e6f5',
    tertiary: '#82c784',
    tertiaryContainer: '#2d6a2d',
    onTertiary: '#005e1f',
    onTertiaryContainer: '#c8e6c9',
    error: '#f2b8b5',
    errorContainer: '#8c1d18',
    onError: '#601410',
    onErrorContainer: '#f9dedc',
    outline: '#9e9e9e',
    outlineVariant: '#79747e',
    scrim: '#000000'
  }
};

// Sizing system (Material Design 3)
export const sizes = {
  small: 4,
  default: 8,
  medium: 16,
  large: 24,
  xlarge: 32,
  xxlarge: 48
};

// Border radius variants  
export const borderRadius = {
  small: 4,
  medium: 8,
  large: 12,
  xlarge: 16,
  full: 9999
};

// Typography
export const typography = {
  displayLarge: { fontSize: 57, fontWeight: 400, lineHeight: 64 },
  displayMedium: { fontSize: 45, fontWeight: 400, lineHeight: 52 },
  displaySmall: { fontSize: 36, fontWeight: 400, lineHeight: 44 },
  headlineLarge: { fontSize: 32, fontWeight: 400, lineHeight: 40 },
  headlineMedium: { fontSize: 28, fontWeight: 400, lineHeight: 36 },
  headlineSmall: { fontSize: 24, fontWeight: 400, lineHeight: 32 },
  titleLarge: { fontSize: 22, fontWeight: 500, lineHeight: 28 },
  titleMedium: { fontSize: 16, fontWeight: 500, lineHeight: 24 },
  titleSmall: { fontSize: 14, fontWeight: 500, lineHeight: 20 },
  bodyLarge: { fontSize: 16, fontWeight: 400, lineHeight: 24 },
  bodyMedium: { fontSize: 14, fontWeight: 400, lineHeight: 20 },
  bodySmall: { fontSize: 12, fontWeight: 400, lineHeight: 16 },
  labelLarge: { fontSize: 14, fontWeight: 500, lineHeight: 20 },
  labelMedium: { fontSize: 12, fontWeight: 500, lineHeight: 16 },
  labelSmall: { fontSize: 11, fontWeight: 500, lineHeight: 16 }
};

// Shadows
export const shadows = {
  none: 'none',
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  elevation1: '0 1px 3px 1px rgba(0, 0, 0, 0.15)',
  elevation2: '0 3px 6px 2px rgba(0, 0, 0, 0.15)',
  elevation3: '0 5px 8px 3px rgba(0, 0, 0, 0.15)',
  elevation4: '0 7px 8px 4px rgba(0, 0, 0, 0.15)',
  elevation5: '0 9px 11px 5px rgba(0, 0, 0, 0.15)'
};

// Transitions
export const transitions = {
  fast: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
  standard: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  slow: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
};
