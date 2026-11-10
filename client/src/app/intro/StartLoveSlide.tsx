import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Gamepad2, Plane, Music2, Palette, Heart } from 'lucide-react-native';
import { Chip } from './Chip';

const { width } = Dimensions.get('window');

// 3 pink sparkle lines radiating top-left above "Start"
function TitleSparkles() {
  return (
    <View style={styles.sparkleContainer}>
      <Svg width={20} height={16} viewBox="0 0 20 16" fill="none">
        <Path
          d="M3 14L1 5M10 12V1M17 14L19 5"
          stroke="#F43F5E"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
}

export function StartLoveArt() {
  return (
    <View style={styles.artBox}>
      {/* Orbital Circles & Dots Background */}
      <Svg
        style={StyleSheet.absoluteFill}
        width={width - 32}
        height={320}
        viewBox="0 0 340 320"
        fill="none"
      >
        {/* Outer Orbit */}
        <Circle
          cx="170"
          cy="160"
          r="130"
          stroke="#FCE7F3"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />
        {/* Inner Orbit */}
        <Circle
          cx="170"
          cy="160"
          r="88"
          stroke="#FCE7F3"
          strokeWidth="1.2"
          strokeDasharray="3 5"
        />

        {/* Orbit Dots */}
        <Circle cx="258" cy="104" r="3.5" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="1.5" />
        <Circle cx="96" cy="214" r="3.5" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="1.5" />
        <Circle cx="212" cy="244" r="3.5" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="1.5" />
        <Circle cx="170" cy="30" r="3" fill="#FCE7F3" stroke="#F43F5E" strokeWidth="1" />
      </Svg>

      {/* Faint Floating Hearts */}
      <View style={[styles.floatingHeart, { top: 22, right: '34%', transform: [{ rotate: '12deg' }], opacity: 0.6 }]}>
        <Heart size={14} color="#F43F5E" fill="#F43F5E" />
      </View>

      <View style={[styles.floatingHeart, { top: 58, left: '32%', transform: [{ rotate: '-10deg' }], opacity: 0.45 }]}>
        <Heart size={12} color="#F43F5E" fill="#F43F5E" />
      </View>

      <View style={[styles.floatingHeart, { top: 130, left: '12%', transform: [{ rotate: '-15deg' }], opacity: 0.7 }]}>
        <Heart size={16} color="#F43F5E" fill="#F43F5E" />
      </View>

      <View style={[styles.floatingHeart, { top: 112, right: '18%', transform: [{ rotate: '18deg' }], opacity: 0.65 }]}>
        <Heart size={14} color="#F43F5E" fill="#F43F5E" />
      </View>

      <View style={[styles.floatingHeart, { top: 236, left: '46%', transform: [{ rotate: '-8deg' }], opacity: 0.5 }]}>
        <Heart size={12} color="#F43F5E" fill="#F43F5E" />
      </View>

      {/* Floating Chips (Icons strictly preserved as requested) */}
      <Chip
        icon={<Gamepad2 size={18} color="#8B5CF6" />}
        label="Gaming"
        style={{ position: 'absolute', left: '4%', top: '10%' }}
      />
      <Chip
        icon={<Plane size={18} color="#0EA5E9" />}
        label="Travel"
        style={{ position: 'absolute', right: '4%', top: '22%' }}
      />
      <Chip
        icon={<Music2 size={18} color="#F43F5E" />}
        label="Music"
        style={{ position: 'absolute', left: '5%', top: '64%' }}
      />
      <Chip
        icon={<Palette size={18} color="#F59E0B" />}
        label="Hobbies"
        style={{ position: 'absolute', right: '4%', top: '58%' }}
      />

      {/* Central Heart Badge with Concentric Glow */}
      <View style={styles.heartGlowOuter}>
        <View style={styles.heartCircle}>
          <Heart size={36} color="#F43F5E" strokeWidth={2.4} />
        </View>
      </View>
    </View>
  );
}

export function StartLoveSlide() {
  return (
    <View style={styles.slide}>
      <StartLoveArt />

      <View style={styles.textSection}>
        {/* Title Top Sparkles */}
        <View style={styles.titleWrap}>
          <TitleSparkles />
          <Text style={styles.titleBlack}>Start with something</Text>
          <View style={styles.titlePinkRow}>
            <Text style={[styles.titlePink, { color: '#f1516cff' }]}>you love.</Text>
            <Heart size={22} color="#F43F5E" strokeWidth={2.2} style={styles.titleHeart} />
          </View>
        </View>

        {/* Subtitle / Description */}
        <Text style={styles.description}>
          {'Your interests make it easier to start a\nreal conversation.'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    width,
    paddingHorizontal: 24,
    alignItems: 'center',
    backgroundColor: '#FFF8FA',
  },
  artBox: {
    width: '100%',
    height: 320,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingHeart: {
    position: 'absolute',
  },
  heartGlowOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(244, 63, 94, 0.06)',
    borderWidth: 1.5,
    borderColor: 'rgba(244, 63, 94, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: '#F43F5E',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 7,
  },
  textSection: {
    alignItems: 'center',
    marginTop: 12,
  },
  titleWrap: {
    alignItems: 'center',
    position: 'relative',
  },
  sparkleContainer: {
    position: 'absolute',
    left: -16,
    top: -10,
  },
  titleBlack: {
    fontSize: 32,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  titlePinkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  titlePink: {
    fontSize: 36,
    fontWeight: '900',
    color: '#F43F5E',
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  titleHeart: {
    marginLeft: 6,
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});

export default StartLoveSlide;
