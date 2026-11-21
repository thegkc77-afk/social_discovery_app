import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

interface VerificationFrameProps {
  children: React.ReactNode;
  stepIndex: number;
  totalSteps: number;
  instruction: string;
}

export default function VerificationFrame({ children, stepIndex, totalSteps, instruction }: VerificationFrameProps) {
  return (
    <View style={styles.container}>
      {children}

      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.faceGuide} />
      </View>

      <View style={styles.instructionBar} pointerEvents="none">
        <Text style={styles.instructionText}>{instruction}</Text>
        <View style={styles.dotsRow}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View key={i} style={[styles.dot, i <= stepIndex ? styles.dotActive : styles.dotInactive]} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: Colors.text,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  faceGuide: {
    width: '68%',
    aspectRatio: 0.8,
    borderRadius: 200,
    borderWidth: 3,
    borderColor: Colors.pink,
  },
  instructionBar: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
    gap: 16,
  },
  instructionText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: Colors.pink,
  },
  dotInactive: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
});
