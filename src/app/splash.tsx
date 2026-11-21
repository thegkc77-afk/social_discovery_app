import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';
import VibeMatchLogo from '../components/ui/VibeMatchLogo';

export default function SplashScreen() {
  const router = useRouter();
  const [scaleAnim] = useState(() => new Animated.Value(1));
  const [opacityAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    // Fade in text and logo
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Loop heartbeat animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.96,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.03,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Transition timer to welcome intro screen
    const timer = setTimeout(() => {
      router.replace('/intro' as any);
    }, 2800);

    return () => clearTimeout(timer);
  }, [scaleAnim, opacityAnim, router]);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Heart logo SVG */}
        <View style={styles.logoContainer}>
          <VibeMatchLogo size={110} color="#FF2B38" />
        </View>

        {/* Brand Text */}
        <View style={styles.textContainer}>
          <Text style={styles.vibeText}>Vibe</Text>
          <Text style={styles.matchText}>Match</Text>
        </View>
        <Text style={styles.tagline}>Hyperlocal vibes for the next generation.</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  textContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },
  vibeText: {
    fontSize: 34,
    fontWeight: '800',
    color: '#8B5CF6',
  },
  matchText: {
    fontSize: 34,
    fontWeight: '800',
    color: Colors.pink,
    fontStyle: 'italic',
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginTop: 12,
    textAlign: 'center',
  },
});
