import { Platform } from 'react-native';

const lightTheme = {
  background: '#FFF9FA',
  text: '#242124',
  textSecondary: '#777174',
  textMuted: '#A7A0A3',
  pink: '#F45F7A',
  darkPink: '#E64D69',
  lightPink: '#FFE8ED',
  veryLightPink: '#FFF2F5',
  success: '#35C759',
  successLight: '#E5F9EA',
  border: '#F2DDE2',
  white: '#FFFFFF',
  backgroundElement: '#FFF2F5',
  backgroundSelected: '#FFE8ED',
} as const;

const darkTheme = {
  background: '#FFF9FA',
  text: '#242124',
  textSecondary: '#777174',
  textMuted: '#A7A0A3',
  pink: '#F45F7A',
  darkPink: '#E64D69',
  lightPink: '#FFE8ED',
  veryLightPink: '#FFF2F5',
  success: '#35C759',
  successLight: '#E5F9EA',
  border: '#F2DDE2',
  white: '#FFFFFF',
  backgroundElement: '#FFF2F5',
  backgroundSelected: '#FFE8ED',
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
