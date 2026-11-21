import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { Sparkles, Heart } from 'lucide-react-native';
import { Avatar } from './Avatar';

const { width } = Dimensions.get('window');

// Small 3-ray sparkle accent for tagline
function TaglineSparkleLeft() {
  return (
    <Svg width={14} height={12} viewBox="0 0 14 12" fill="none" style={{ marginRight: 6 }}>
      <Path d="M2 10L0 4M6 9V1M11 10L13 4" stroke="#F5537A" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

function TaglineSparkleRight() {
  return (
    <Svg width={14} height={12} viewBox="0 0 14 12" fill="none" style={{ marginLeft: 6 }}>
      <Path d="M2 4L0 10M7 1V9M12 4L14 10" stroke="#F5537A" strokeWidth="2" strokeLinecap="round" />
    </Svg>
  );
}

export function PeopleArt() {
  return (
    <View style={styles.artBox}>
      {/* Background Orbit Circles & Dots SVG */}
      <Svg
        style={StyleSheet.absoluteFill}
        width={width - 32}
        height={320}
        viewBox="0 0 340 320"
        fill="none"
      >
        <Circle cx="170" cy="140" r="135" stroke="#FCE7F3" strokeWidth="1.2" strokeDasharray="4 6" />
        <Circle cx="170" cy="140" r="95" stroke="#FCE7F3" strokeWidth="1.2" strokeDasharray="3 5" />
        <Circle cx="265" cy="85" r="3.5" fill="#FFFFFF" stroke="#F5537A" strokeWidth="1.5" />
        <Circle cx="95" cy="195" r="3.5" fill="#FFFFFF" stroke="#F5537A" strokeWidth="1.5" />
        <Circle cx="215" cy="225" r="3.5" fill="#FFFFFF" stroke="#F5537A" strokeWidth="1.5" />
      </Svg>

      {/* Floating Faint Hearts around Orbit */}
      <View style={[styles.floatingHeart, { top: 18, right: '32%', transform: [{ rotate: '12deg' }], opacity: 0.6 }]}>
        <Heart size={14} color="#F5537A" fill="#F5537A" />
      </View>
      <View style={[styles.floatingHeart, { top: 50, left: '30%', transform: [{ rotate: '-10deg' }], opacity: 0.45 }]}>
        <Heart size={12} color="#F5537A" fill="#F5537A" />
      </View>
      <View style={[styles.floatingHeart, { top: 110, left: '10%', transform: [{ rotate: '-15deg' }], opacity: 0.7 }]}>
        <Heart size={14} color="#F5537A" fill="#F5537A" />
      </View>
      <View style={[styles.floatingHeart, { top: 105, right: '12%', transform: [{ rotate: '18deg' }], opacity: 0.65 }]}>
        <Heart size={14} color="#F5537A" fill="#F5537A" />
      </View>

      {/* Overlapping Hero Avatars with Center Sparkle Badge */}
      <View style={styles.peopleRow}>
        <Avatar
          size={92}
          imageUri="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
          style={{ zIndex: 1 }}
        />

        <View style={styles.sparkleBadge}>
          <Sparkles size={20} color="#F5537A" fill="#F5537A" />
        </View>

        <Avatar
          size={92}
          imageUri="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80"
          style={{ zIndex: 1 }}
        />
      </View>

      {/* Social Tagline / Kicker with Sparkle Accents */}
      <View style={styles.kickerRow}>
        <TaglineSparkleLeft />
        <Text style={styles.peopleKicker}>Don’t just scroll. Find your people.</Text>
        <TaglineSparkleRight />
      </View>
    </View>
  );
}

export function PeopleSlide() {
  return (
    <View style={styles.slide}>
      <PeopleArt />

      <View style={styles.textSection}>
        {/* Main Headline Hierarchy */}
        <Text style={styles.titleDark}>Your people</Text>
        <View style={styles.titleRow}>
          <Text style={styles.titleDarkLine}>are </Text>
          <Text style={styles.titlePink}>out there.</Text>
          <Heart size={24} color="#F5537A" strokeWidth={2.2} style={styles.titleHeart} />
        </View>

        {/* Supporting Description */}
        <Text style={styles.description}>
          {"Find someone who shares your vibe\nand start a conversation."}
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
    height: 310,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingHeart: {
    position: 'absolute',
  },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  sparkleBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -12,
    zIndex: 2,
    shadowColor: '#F5537A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  kickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  peopleKicker: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F5537A',
    textAlign: 'center',
  },
  textSection: {
    alignItems: 'center',
    marginTop: 8,
  },
  titleDark: {
    fontSize: 34,
    fontWeight: '900',
    color: '#151922',
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  titleDarkLine: {
    fontSize: 36,
    fontWeight: '900',
    color: '#151922',
    letterSpacing: -0.6,
    lineHeight: 42,
  },
  titlePink: {
    fontSize: 36,
    fontWeight: '900',
    color: '#F5537A',
    letterSpacing: -0.6,
    lineHeight: 42,
  },
  titleHeart: {
    marginLeft: 6,
    marginTop: 4,
  },
  description: {
    fontSize: 15,
    color: '#687080',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
});

export default PeopleSlide;
