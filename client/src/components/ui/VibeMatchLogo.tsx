import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface VibeMatchLogoProps {
  size?: number;
  width?: number;
  height?: number;
  color?: string;
  useGradient?: boolean;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'contain' | 'cover' | 'stretch' | 'center';
}

export default function VibeMatchLogo({
  size = 80,
  width,
  height,
  style,
  resizeMode = 'contain',
}: VibeMatchLogoProps) {
  const logoWidth = width ?? size;
  const logoHeight = height ?? size;

  return (
    <Image
      source={require('../../../assets/images/VibeMatchLogo.png')}
      style={[{ width: logoWidth, height: logoHeight }, style]}
      resizeMode={resizeMode}
    />
  );
}
