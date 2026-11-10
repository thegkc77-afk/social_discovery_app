import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';

interface ChipProps {
  icon: React.ReactNode;
  label: string;
  style?: ViewStyle;
}

export function Chip({ icon, label, style }: ChipProps) {
  return (
    <View style={[styles.chip, style]}>
      {icon}
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.08)',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181B',
  },
});

export default Chip;
