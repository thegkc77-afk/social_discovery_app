import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Gamepad2, Coffee, Music2, Heart } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Faint background floating heart
function FaintHeart({ style, size = 40 }: { style: any; size?: number }) {
  return (
    <View style={[styles.faintHeartContainer, style]} pointerEvents="none">
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="#F43F5E">
        <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </Svg>
    </View>
  );
}

export function FindVibeArt() {
  return (
    <View style={styles.artBox}>
      {/* Background Faint Decorative Hearts */}
      <FaintHeart
        size={46}
        style={{ top: 12, left: 16, transform: [{ rotate: '-18deg' }], opacity: 0.12 }}
      />
      <FaintHeart
        size={52}
        style={{ top: 180, right: 12, transform: [{ rotate: '15deg' }], opacity: 0.12 }}
      />

      {/* SVG Connecting Dotted Path */}
      <Svg
        style={StyleSheet.absoluteFill}
        width={width - 40}
        height={320}
        viewBox={`0 0 ${width - 40} 320`}
        fill="none"
      >
        <Path
          d={`M ${width * 0.24} 68 Q ${width * 0.44} 45, ${width * 0.52} 55 T ${width * 0.72} 88 Q ${width * 0.78} 140, ${width * 0.5} 165 T ${width * 0.22} 210 Q ${width * 0.38} 270, ${width * 0.65} 255`}
          stroke="#FBCFE8"
          strokeWidth="1.8"
          strokeDasharray="4 5"
        />
      </Svg>

      {/* Floating solid pink heart on dotted path */}
      <View style={styles.pathHeart}>
        <Heart size={16} color="#F43F5E" fill="#F43F5E" />
      </View>

      {/* Avatar 1: Top-Left (Woman with neon/blue lighting) */}
      <View style={styles.avatar1Container}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
            }}
            style={styles.avatarImg1}
            resizeMode="cover"
          />
        </View>
        {/* Gamepad Badge */}
        <View style={[styles.badge, styles.badgeBottomRight]}>
          <Gamepad2 size={16} color="#FFFFFF" />
        </View>
      </View>

      {/* Avatar 2: Top-Right (Woman in blue hoodie) */}
      <View style={styles.avatar2Container}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
            }}
            style={styles.avatarImg2}
            resizeMode="cover"
          />
        </View>
        {/* Music Badge */}
        <View style={[styles.badge, styles.badgeBottomLeft]}>
          <Music2 size={15} color="#FFFFFF" />
        </View>
      </View>

      {/* Center Floating Pill: Gaming, Hobbies, Music */}
      <View style={styles.centerPill}>
        {/* Gaming Item */}
        <View style={styles.pillItem}>
          <Gamepad2 size={20} color="#F43F5E" />
          <Text style={styles.pillItemText}>Gaming</Text>
        </View>

        {/* Separator Dot */}
        <View style={styles.pillDot} />

        {/* Hobbies Item */}
        <View style={styles.pillItem}>
          <Coffee size={20} color="#F43F5E" />
          <Text style={styles.pillItemText}>Hobbies</Text>
        </View>

        {/* Separator Dot */}
        <View style={styles.pillDot} />

        {/* Music Item */}
        <View style={styles.pillItem}>
          <Music2 size={20} color="#F43F5E" />
          <Text style={styles.pillItemText}>Music</Text>
        </View>
      </View>

      {/* Avatar 3: Bottom-Right (Man in sweater) */}
      <View style={styles.avatar3Container}>
        <View style={styles.avatarWrapper}>
          <Image
            source={{
              uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
            }}
            style={styles.avatarImg3}
            resizeMode="cover"
          />
        </View>
        {/* Heart Badge */}
        <View style={[styles.badge, styles.badgeBottomLeft]}>
          <Heart size={15} color="#FFFFFF" strokeWidth={2.4} />
        </View>
      </View>
    </View>
  );
}

export function FindVibeSlide() {
  return (
    <View style={styles.slide}>
      <FindVibeArt />

      <View style={styles.textSection}>
        <Text style={styles.titleBlack}>Find people who</Text>
        <Text style={styles.titlePink}>match your vibe.</Text>

        <Text style={styles.description}>
          {'Discover people who share the\nthings you love.'}
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
  },
  artBox: {
    width: '100%',
    height: 330,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  faintHeartContainer: {
    position: 'absolute',
  },
  pathHeart: {
    position: 'absolute',
    left: '52%',
    top: 50,
    transform: [{ rotate: '12deg' }],
  },
  avatarWrapper: {
    borderRadius: 999,
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },

  // Avatar 1: Top Left
  avatar1Container: {
    position: 'absolute',
    left: '11%',
    top: 20,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarImg1: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },

  // Avatar 2: Top Right
  avatar2Container: {
    position: 'absolute',
    right: '11%',
    top: 48,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarImg2: {
    width: 78,
    height: 78,
    borderRadius: 39,
  },

  // Avatar 3: Bottom Right
  avatar3Container: {
    position: 'absolute',
    right: '18%',
    top: 205,
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  },
  avatarImg3: {
    width: 86,
    height: 86,
    borderRadius: 43,
  },

  // Pink Badge
  badge: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F43F5E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#F43F5E',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 4,
  },
  badgeBottomRight: {
    bottom: -2,
    right: -2,
  },
  badgeBottomLeft: {
    bottom: -2,
    left: -4,
  },

  // Center Floating Pill
  centerPill: {
    position: 'absolute',
    top: 145,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 24,
    shadowColor: '#E11D48',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.09,
    shadowRadius: 14,
    elevation: 6,
    gap: 14,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.06)',
  },
  pillItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  pillItemText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#18181B',
  },
  pillDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: '#FB7185',
    marginHorizontal: 2,
  },

  // Text Section
  textSection: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
  },
  titleBlack: {
    fontSize: 34,
    fontWeight: '900',
    color: '#18181B',
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 40,
  },
  titlePink: {
    fontSize: 34,
    fontWeight: '900',
    color: '#F43F5E',
    textAlign: 'center',
    letterSpacing: -0.6,
    lineHeight: 40,
    marginTop: 1,
  },
  description: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '400',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 24,
  },
});

export default FindVibeSlide;
