import { TextStyle } from 'react-native';

// Font family
export const fontFamily = {
  regular: 'Roboto',
  medium: 'Roboto',
  bold: 'Roboto',
};

// Font sizes — scaled down for a tighter, Google Fit-like layout
export const fontSize = {
  xs: 10,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  '2xl': 22,
  '3xl': 26,
  '4xl': 30,
  '5xl': 36,
} as const;

// Font weights
export const fontWeight = {
  light: '300' as TextStyle['fontWeight'],
  normal: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extrabold: '800' as TextStyle['fontWeight'],
} as const;

// Line heights - tighter
export const lineHeight = {
  tight: 16,
  normal: 20,
  relaxed: 24,
  loose: 28,
} as const;

// Letter spacing - tighter
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.2,
  wider: 0.5,
  widest: 1,
} as const;
