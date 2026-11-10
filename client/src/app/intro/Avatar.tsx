import React from 'react';
import { StyleSheet, ViewStyle, Image, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User } from 'lucide-react-native';
import { Colors } from '../../constants/theme';

interface AvatarProps {
  size: number;
  colors?: [string, string];
  imageUri?: string;
  style?: ViewStyle;
}

export function Avatar({
  size,
  colors = ['#A78BFA', '#6366F1'],
  imageUri,
  style,
}: AvatarProps) {
  if (imageUri) {
    return (
      <View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 3,
            borderColor: Colors.white,
            overflow: 'hidden',
            backgroundColor: Colors.white,
          },
          styles.avatarShadow,
          style,
        ]}
      >
        <Image
          source={{ uri: imageUri }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 3,
          borderColor: Colors.white,
        },
        styles.avatarShadow,
        style,
      ]}
    >
      <User size={size * 0.45} color={Colors.white} strokeWidth={2.2} />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  avatarShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
});

export default Avatar;
