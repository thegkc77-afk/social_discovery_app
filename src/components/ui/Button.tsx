import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/theme';

interface ButtonProps {
  onPress: () => void;
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  onPress,
  title,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}: ButtonProps) {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="small" color={isPrimary ? Colors.white : Colors.pink} />;
    }
    return (
      <Text
        style={[
          styles.text,
          isPrimary && styles.textPrimary,
          isSecondary && styles.textSecondary,
          isOutline && styles.textOutline,
          disabled && styles.textDisabled,
          textStyle,
        ]}
      >
        {title}
      </Text>
    );
  };

  if (isPrimary && !disabled) {
    return (
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        style={[styles.container, styles.touchableArea, style]}
      >
        <LinearGradient
          colors={[Colors.pink, Colors.darkPink]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[
        styles.container,
        styles.touchableArea,
        isSecondary && styles.btnSecondary,
        isOutline && styles.btnOutline,
        disabled && styles.btnDisabled,
        style,
      ]}
    >
      {renderContent()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  touchableArea: {
    minWidth: 120,
    minHeight: 44, // Touch target minimum area
  },
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 25,
  },
  btnSecondary: {
    backgroundColor: Colors.veryLightPink,
    borderWidth: 1,
    borderColor: Colors.lightPink,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.pink,
  },
  btnDisabled: {
    backgroundColor: Colors.border,
    borderColor: Colors.border,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  textPrimary: {
    color: Colors.white,
  },
  textSecondary: {
    color: Colors.pink,
  },
  textOutline: {
    color: Colors.pink,
  },
  textDisabled: {
    color: Colors.textMuted,
  },
});
