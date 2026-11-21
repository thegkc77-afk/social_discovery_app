import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { MapPin, Heart, Sparkles } from 'lucide-react-native';
import { Colors } from '../../constants/theme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = Math.min(width - 48, 360);
const CARD_HEIGHT = 180;

const AVATARS = [
  {
    id: '1',
    uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80',
    top: 15,
    left: 45,
  },
  {
    id: '2',
    uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
    top: 25,
    right: 45,
  },
  {
    id: '3',
    uri: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&h=150&q=80',
    bottom: 25,
    left: 30,
  },
  {
    id: '4',
    uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80',
    bottom: 15,
    right: 30,
  },
];

export default function LocationIllustration() {
  return (
    <View style={styles.cardContainer}>
      {/* Background Subtle Map Grid Pattern */}
      <View style={styles.mapGridOverlay}>
        <View style={[styles.mapLine, { top: 40, transform: [{ rotate: '-15deg' }] }]} />
        <View style={[styles.mapLine, { top: 110, transform: [{ rotate: '10deg' }] }]} />
        <View style={[styles.mapLineVertical, { left: 90, transform: [{ rotate: '25deg' }] }]} />
        <View style={[styles.mapLineVertical, { right: 80, transform: [{ rotate: '-20deg' }] }]} />
      </View>

      {/* Dashed Outer Discovery Radius Ring */}
      <View style={styles.discoveryRadiusRing} />

      {/* Decorative Sparkle Icons */}
      <View style={{ position: 'absolute', top: 12, right: 100 }}>
        <Sparkles size={14} color="#FFB0C4" />
      </View>
      <View style={{ position: 'absolute', bottom: 35, left: 15 }}>
        <Sparkles size={12} color="#FFB0C4" />
      </View>
      <View style={{ position: 'absolute', top: 45, left: 12 }}>
        <Sparkles size={10} color="#FFC2D1" />
      </View>
      <View style={{ position: 'absolute', bottom: 40, right: 12 }}>
        <MapPin size={12} color="#FFB0C4" opacity={0.6} />
      </View>

      {/* Profile Avatars Around Radius */}
      {AVATARS.map((avatar) => (
        <View
          key={avatar.id}
          style={[
            styles.avatarWrapper,
            avatar.top !== undefined && { top: avatar.top },
            avatar.bottom !== undefined && { bottom: avatar.bottom },
            avatar.left !== undefined && { left: avatar.left },
            avatar.right !== undefined && { right: avatar.right },
          ]}
        >
          <Image source={{ uri: avatar.uri }} style={styles.avatarImage} />
          <View style={styles.heartBadge}>
            <Heart size={9} color={Colors.white} fill={Colors.white} />
          </View>
        </View>
      ))}

      {/* Central Premium 3D Location Pin */}
      <View style={styles.pinShadowBase} />
      <View style={styles.centerPinContainer}>
        <View style={styles.pinCircle}>
          <MapPin size={32} color={Colors.white} fill={Colors.white} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: '#FFF0F5',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FCE3EA',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    marginVertical: 12,
  },
  mapGridOverlay: {
    ...StyleSheet.absoluteFill,
    opacity: 0.35,
  },
  mapLine: {
    position: 'absolute',
    left: -20,
    right: -20,
    height: 3,
    backgroundColor: '#FFD6E2',
    borderRadius: 2,
  },
  mapLineVertical: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 3,
    backgroundColor: '#FFD6E2',
    borderRadius: 2,
  },
  discoveryRadiusRing: {
    position: 'absolute',
    width: 220,
    height: 125,
    borderRadius: 110,
    borderWidth: 1.5,
    borderColor: '#FF7FA0',
    borderStyle: 'dashed',
    opacity: 0.6,
  },
  avatarWrapper: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: Colors.white,
    shadowColor: Colors.text,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  heartBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.pink,
    borderWidth: 1.5,
    borderColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinShadowBase: {
    position: 'absolute',
    width: 48,
    height: 16,
    borderRadius: 10,
    backgroundColor: 'rgba(245, 83, 122, 0.18)',
    bottom: 58,
  },
  centerPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.pink,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  pinCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: Colors.pink,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: Colors.white,
  },
});
