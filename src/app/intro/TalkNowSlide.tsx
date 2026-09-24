import React, { useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path } from 'react-native-svg';
import { Gamepad2, Sparkles, Heart } from 'lucide-react-native';
import { Avatar } from './Avatar';
import { Chip } from './Chip';

const { width } = Dimensions.get('window');

export function TalkNowArt() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState('Gaming');

  const handleStartTalkNow = () => {
    router.push({
      pathname: '/match',
      params: { topic: selectedTopic },
    });
  };

  return (
    <View style={styles.artBox}>
      {/* Background Symmetrical Waveform & Orbit SVG */}
      <Svg
        style={StyleSheet.absoluteFill}
        width={width - 32}
        height={340}
        viewBox="0 0 340 340"
        fill="none"
      >
        {/* Soft Outer Pulse Ring */}
        <Circle
          cx="170"
          cy="172"
          r="138"
          stroke="#FCE7F3"
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />
        {/* Middle Pulse Ring */}
        <Circle
          cx="170"
          cy="172"
          r="104"
          stroke="#FCE7F3"
          strokeWidth="1.2"
          strokeDasharray="3 5"
        />
        {/* Horizontal Pulse Waveform */}
        <Path
          d="M 15 172 Q 30 155, 45 172 T 75 172 Q 85 142, 95 202 T 110 172 Q 120 152, 130 192 T 140 172 L 200 172 Q 210 152, 220 192 T 230 172 Q 245 142, 255 202 T 268 172 Q 282 155, 296 172 T 325 172"
          stroke="#FCE7F3"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity={0.85}
        />
        {/* Dotted Connection Line to Online Badge */}
        <Path
          d="M 215 110 Q 235 115, 240 120"
          stroke="#FCE7F3"
          strokeWidth="1.2"
          strokeDasharray="2 3"
        />
      </Svg>

      {/* Decorative Faint Hearts near Avatars & Button */}
      <View style={[styles.floatingHeart, { top: 22, right: '35%', opacity: 0.6, transform: [{ rotate: '12deg' }] }]}>
        <Heart size={12} color="#F5537A" fill="#F5537A" />
      </View>
      <View style={[styles.floatingHeart, { top: 125, left: '22%', opacity: 0.65, transform: [{ rotate: '-12deg' }] }]}>
        <Heart size={14} color="#F5537A" fill="#F5537A" />
      </View>

      {/* Social Presence Header: Overlapping Avatars + Online Status */}
      <View style={styles.talkTopRow}>
        <Avatar
          size={54}
          imageUri="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80"
          style={{ zIndex: 2 }}
        />
        <Avatar
          size={54}
          imageUri="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80"
          style={{ marginLeft: -16, zIndex: 1 }}
        />

        {/* Online Status Pill */}
        <View style={styles.onlinePill}>
          <View style={styles.onlineDot} />
          <Text style={styles.onlinePillText}>Online</Text>
        </View>
      </View>

      {/* Main Talk Now CTA Button with Concentric Pink Glow */}
      <TouchableOpacity
        onPress={handleStartTalkNow}
        activeOpacity={0.85}
        style={styles.talkNowGlowOuter}
      >
        <View style={styles.talkNowCircleWrap}>
          <LinearGradient
            colors={['#F5537A', '#FF5E85']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.talkNowCircle}
          >
            {/* Heart Badge Inside Button */}
            <View style={styles.innerHeartBadge}>
              <Heart size={15} color="#F5537A" fill="#F5537A" />
            </View>

            <Text style={styles.talkNowText}>{'TALK\nNOW'}</Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>

      {/* Topic Selection Chips (Icons preserved as requested) */}
      <View style={styles.talkChipsRow}>
        <TouchableOpacity onPress={() => setSelectedTopic('Gaming')} activeOpacity={0.8}>
          <Chip
            icon={<Gamepad2 size={16} color={selectedTopic === 'Gaming' ? '#FFFFFF' : '#8B5CF6'} />}
            label="Gaming"
            style={selectedTopic === 'Gaming' ? { backgroundColor: '#F5537A' } : undefined}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setSelectedTopic('Hobbies')} activeOpacity={0.8}>
          <Chip
            icon={<Sparkles size={16} color={selectedTopic === 'Hobbies' ? '#FFFFFF' : '#F5537A'} />}
            label="Hobbies"
            style={[{ marginLeft: 14 }, selectedTopic === 'Hobbies' ? { backgroundColor: '#F5537A' } : undefined]}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function TalkNowSlide() {
  return (
    <View style={styles.slide}>
      <TalkNowArt />

      <View style={styles.textSection}>
        {/* Heading: Dark + Pink + Outline Heart */}
        <Text style={styles.titleBlack}>Want to talk</Text>
        <View style={styles.titlePinkRow}>
          <Text style={styles.titlePink}>right now?</Text>
          <Heart size={24} color="#F5537A" strokeWidth={2.2} style={styles.titleHeart} />
        </View>

        {/* Supporting Description */}
        <Text style={styles.description}>
          {"Choose a topic and we'll help you connect with someone who's ready to talk."}
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
    height: 340,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingHeart: {
    position: 'absolute',
  },
  talkTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  onlinePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginLeft: 14,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.2)',
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#22C55E',
  },
  onlinePillText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#15803D',
  },
  talkNowGlowOuter: {
    width: 184,
    height: 184,
    borderRadius: 92,
    backgroundColor: 'rgba(245, 83, 122, 0.07)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 83, 122, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  talkNowCircleWrap: {
    shadowColor: '#F5537A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
  },
  talkNowCircle: {
    width: 152,
    height: 152,
    borderRadius: 76,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerHeartBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  talkNowText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 28,
    letterSpacing: 1.2,
  },
  talkChipsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textSection: {
    alignItems: 'center',
    marginTop: 12,
  },
  titleBlack: {
    fontSize: 32,
    fontWeight: '900',
    color: '#151922',
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
    color: '#F5537A',
    letterSpacing: -0.5,
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

export default TalkNowSlide;
