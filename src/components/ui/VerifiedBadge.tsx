import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BadgeCheck } from 'lucide-react-native';
import { Colors } from '../../constants/theme';

interface VerifiedBadgeProps {
  size?: number;
  variant?: 'icon' | 'label';
  style?: any;
}

export default function VerifiedBadge({ size = 14, variant = 'icon', style }: VerifiedBadgeProps) {
  if (variant === 'label') {
    return (
      <View style={[styles.labelContainer, style]}>
        <BadgeCheck size={size} color={Colors.success} fill={Colors.successLight} strokeWidth={2.2} />
        <Text style={styles.labelText}>Verified</Text>
      </View>
    );
  }
  return (
    <View style={style}>
      <BadgeCheck size={size} color={Colors.success} fill={Colors.successLight} strokeWidth={2.2} />
    </View>
  );
}

const styles = StyleSheet.create({
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  labelText: {
    fontSize: 11,
    fontWeight: '800',
    color: Colors.success,
  },
});
