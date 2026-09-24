import { Platform } from 'react-native';

const lightTheme = {
  background: '#FFF8FA',
  text: '#151922',
  textSecondary: '#687080',
  textMuted: '#A0A7B5',
  pink: '#F5537A',
  primary: '#F5537A',
  secondaryPink: '#FF7FA0',
  surface: '#FFFFFF',
  darkPink: '#E43E66',
  lightPink: '#FFF1F5',
  veryLightPink: '#FFF8FA',
  inactiveProgress: '#FCE3EA',
  success: '#35C759',
  successLight: '#E5F9EA',
  border: '#F8DCE5',
  white: '#FFFFFF',
  backgroundElement: '#FFF1F5',
  backgroundSelected: '#FFF1F5',
} as const;

const darkTheme = {
  ...lightTheme,
} as const;

export const Colors = {
  ...lightTheme,
  light: lightTheme,
  dark: darkTheme,
} as const;

export type ThemeColor = keyof typeof lightTheme;

export const Fonts = Platform.select({
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
}) ?? {
  sans: 'normal',
  serif: 'serif',
  rounded: 'normal',
  mono: 'monospace',
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
