import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

interface PillProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
}

export default function Pill({ label, selected = false, onPress }: PillProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        selected ? styles.selectedPill : styles.unselectedPill,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.text, selected ? styles.selectedText : styles.unselectedText]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    margin: 4,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 44, // Touch target minimum area
  },
  selectedPill: {
    backgroundColor: Colors.pink,
    borderColor: Colors.pink,
  },
  unselectedPill: {
    backgroundColor: Colors.white,
    borderColor: Colors.border,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  selectedText: {
    color: Colors.white,
  },
  unselectedText: {
    color: Colors.text,
  },
});
