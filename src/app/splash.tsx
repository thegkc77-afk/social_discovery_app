import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '../constants/theme';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

export default function SplashScreen() {
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

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

    // Transition timer to login screen
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, { opacity: opacityAnim, transform: [{ scale: scaleAnim }] }]}>
        {/* Heart logo SVG */}
        <View style={styles.logoContainer}>
          <Svg viewBox="0 0 100 100" width={110} height={110}>
            <Defs>
              <SvgGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <Stop offset="0%" stopColor="#A855F7" />
                <Stop offset="100%" stopColor="#F45F7A" />
              </SvgGradient>
            </Defs>
            {/* Heart pin */}
            <Path
              d="M50,90 C30,72 12,50 12,32 C12,16 28,8 50,26 C72,8 88,16 88,32 C88,50 70,72 50,90 Z"
              stroke="url(#logo-grad)"
              strokeWidth="6.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            {/* Heart core */}
            <Path
              d="M50,60 C43,53 35,43 35,34 C35,27 40,22 50,30 C60,22 65,27 65,34 C65,43 57,53 50,60 Z"
              fill="url(#logo-grad)"
            />
          </Svg>
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
