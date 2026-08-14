import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/theme';

interface AvatarProps {
  source: string;
  size?: number;
  showOnlineStatus?: boolean;
  online?: boolean;
  border?: boolean;
  borderColor?: string;
  style?: ViewStyle;
}

export default function Avatar({
  source,
  size = 50,
  showOnlineStatus = false,
  online = false,
  border = false,
  borderColor = Colors.pink,
  style,
}: AvatarProps) {
  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const imageStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    borderWidth: border ? 2 : 0,
    borderColor: border ? borderColor : 'transparent',
  };

  const badgeSize = Math.max(10, size * 0.22);
  const badgeStyle = {
    width: badgeSize,
    height: badgeSize,
    borderRadius: badgeSize / 2,
    bottom: 0,
    right: 0,
    backgroundColor: online ? Colors.success : Colors.textMuted,
  };

  // Safe checks for require vs http uri
  const imageSource = source && typeof source === 'string' && source.startsWith('http')
    ? { uri: source }
    : require('@/assets/images/favicon.png');

  return (
    <View style={[styles.container, containerStyle, style]}>
      <Image
        source={imageSource}
        style={imageStyle}
        resizeMode="cover"
      />
      {showOnlineStatus && <View style={[styles.badge, badgeStyle]} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
});
